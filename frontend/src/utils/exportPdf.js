import { formatDate } from './helpers.js';

/**
 * Strips unsupported control codes and replaces non-Latin glyphs (e.g., Sinhala)
 * with safe fallbacks so built-in Helvetica font renders cleanly without corrupting the PDF.
 */
export function sanitizePdfText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    // Replace smart quotes and common unicode dashes first
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022]/g, '*')
    // Strip unprintable control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Fallback any remaining non-Latin1 characters (e.g. Sinhala) to '?'
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
}

/**
 * Formats a numeric currency value strictly as "Rs. 1,234.00" (never rupee glyph).
 */
export function formatPdfCurrency(amount) {
  const val = Number(amount) || 0;
  return `Rs. ${Math.abs(val).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Client-side professional PDF report generator for SpendWise transactions.
 * Uses jspdf and jspdf-autotable v5 (via direct autoTable(doc, ...) function invocation).
 * Lazy-loaded on demand to ensure zero bloat to the initial bundle.
 *
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} options - Configuration and metadata options
 * @returns {Promise<{ success: boolean, filename: string, pageCount: number }>}
 */
export async function generateTransactionsPdf(transactions = [], options = {}) {
  const {
    reportTitle = 'Transactions report',
    includeSummary = true,
    includeNotes = true,
    orientation = 'portrait', // 'portrait' | 'landscape'
    user = null,
    filters = {},
    summary = {},
  } = options;

  // 1. Dynamically import jsPDF and autoTable (v5 ES module pattern)
  const { jsPDF } = await import('jspdf');
  const autotableModule = await import('jspdf-autotable');
  // In jspdf-autotable v5, default export is the callable function
  const autoTable = autotableModule.default || autotableModule.autoTable || autotableModule;

  // 2. Initialize PDF document
  const isLandscape = orientation === 'landscape';
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation: isLandscape ? 'landscape' : 'portrait',
    compress: true,
  });

  // Set standard PDF document properties
  const safeTitle = sanitizePdfText(reportTitle.slice(0, 60)) || 'Transactions report';
  doc.setProperties({
    title: safeTitle,
    subject: 'SpendWise Financial Ledger Report',
    author: 'SpendWise',
    creator: 'SpendWise Financial Platform',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // 3. Compute totals and date range
  let totalIncome = summary.income ?? 0;
  let totalExpense = summary.expense ?? 0;
  let txCount = summary.count ?? transactions.length;

  let minDate = null;
  let maxDate = null;
  const categoryExpenses = {};

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (summary.income === undefined) {
      if (tx.type === 'Income') totalIncome += amt;
      else if (tx.type === 'Expense') totalExpense += amt;
    }
    if (tx.type === 'Expense') {
      const cat = tx.category || 'Other';
      categoryExpenses[cat] = (categoryExpenses[cat] || 0) + amt;
    }
    if (tx.date) {
      const d = new Date(tx.date);
      if (!isNaN(d.getTime())) {
        if (!minDate || d < minDate) minDate = d;
        if (!maxDate || d > maxDate) maxDate = d;
      }
    }
  });

  const netBalance = totalIncome - totalExpense;

  // Compute period coverage string
  let periodText = 'All recorded dates';
  if (minDate && maxDate) {
    const dOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    periodText = `${minDate.toLocaleDateString('en-US', dOpts)} to ${maxDate.toLocaleDateString('en-US', dOpts)}`;
  }

  // Compute filter summary string
  const filterParts = [];
  if (filters.type) filterParts.push(`Type = ${filters.type}`);
  if (filters.category) filterParts.push(`Category = ${filters.category}`);
  if (filters.startDate || filters.endDate) {
    filterParts.push(`${filters.startDate || 'Beginning'} to ${filters.endDate || 'Present'}`);
  }
  if (filters.search) filterParts.push(`Search = "${sanitizePdfText(filters.search)}"`);
  const filterSummaryLine = filterParts.length > 0 ? `Filters: ${filterParts.join(', ')}` : 'Filters: No filters applied';

  // 4. Header Band & Footer drawing helper (executed for every page via didDrawPage)
  const now = new Date();
  const generatedTimestamp = `Generated on ${now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const drawHeaderBand = (currentPage) => {
    // Header Band Logo mark (orange #ea580c rounded square 26x26pt with white bold 'S')
    doc.setFillColor(234, 88, 12);
    doc.roundedRect(margin, 20, 24, 24, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('S', margin + 7.5, 37);

    // SpendWise brand text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(31, 27, 22); // #1f1b16
    doc.text('Spend', margin + 30, 37);
    const spendWidth = doc.getTextWidth('Spend');
    doc.setTextColor(234, 88, 12); // #ea580c
    doc.text('Wise', margin + 30 + spendWidth, 37);

    // Right-aligned report title & generated timestamp
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(31, 27, 22);
    doc.text(safeTitle, pageWidth - margin, 29, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(122, 114, 99); // #7a7263
    doc.text(generatedTimestamp, pageWidth - margin, 41, { align: 'right' });

    // Thin line under header
    doc.setDrawColor(233, 225, 202); // #e9e1ca
    doc.setLineWidth(0.75);
    doc.line(margin, 52, pageWidth - margin, 52);
  };

  const drawFooterBand = (currentPage, totalPagesExp) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(122, 114, 99); // #7a7263

    // Thin divider above footer
    doc.setDrawColor(233, 225, 202);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - 26, pageWidth - margin, pageHeight - 26);

    // Left: Branding
    doc.text('Generated by SpendWise', margin, pageHeight - 14);

    // Right: Page X of Y
    const pageStr = `Page ${currentPage} of ${totalPagesExp}`;
    doc.text(pageStr, pageWidth - margin, pageHeight - 14, { align: 'right' });
  };

  // 5. Build First Page Content
  let currentY = 72;

  // Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(31, 27, 22);
  doc.text(safeTitle, margin, currentY);
  currentY += 16;

  // Subtitle with user details & period
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(74, 68, 58); // #4a443a
  const userName = sanitizePdfText(user?.name || 'Account Holder');
  const userEmail = user?.email ? ` (${user.email})` : '';
  doc.text(`Prepared for ${userName}${userEmail}  •  Period: ${periodText}`, margin, currentY);
  currentY += 14;

  // Filter summary line
  doc.setFontSize(8.5);
  doc.setTextColor(122, 114, 99);
  doc.text(filterSummaryLine, margin, currentY);
  currentY += 14;

  // 6. Summary Cards Row (if includeSummary is active)
  if (includeSummary) {
    const cardGap = 8;
    const cardWidth = (contentWidth - cardGap * 3) / 4;
    const cardHeight = 44;

    const cards = [
      {
        label: 'TOTAL INCOME',
        value: `+${formatPdfCurrency(totalIncome)}`,
        color: [21, 128, 61], // #15803d green
      },
      {
        label: 'TOTAL EXPENSES',
        value: `-${formatPdfCurrency(totalExpense)}`,
        color: [220, 38, 38], // #dc2626 red
      },
      {
        label: 'NET BALANCE',
        value: `${netBalance >= 0 ? '+' : '-'}${formatPdfCurrency(Math.abs(netBalance))}`,
        color: netBalance >= 0 ? [21, 128, 61] : [220, 38, 38],
      },
      {
        label: 'TRANSACTIONS',
        value: `${txCount} record${txCount === 1 ? '' : 's'}`,
        color: [31, 27, 22],
      },
    ];

    cards.forEach((card, idx) => {
      const cardX = margin + idx * (cardWidth + cardGap);
      // Card Box (light fill #fdf9ef with border #e9e1ca)
      doc.setFillColor(253, 249, 239);
      doc.setDrawColor(233, 225, 202);
      doc.setLineWidth(0.75);
      doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 5, 5, 'FD');

      // Card Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(122, 114, 99);
      doc.text(card.label, cardX + 8, currentY + 14);

      // Card Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.text(card.value, cardX + 8, currentY + 31);
    });

    currentY += cardHeight + 12;

    // Optional Category Breakdown (Top 5 Expenses)
    const sortedCategories = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedCategories.length > 0 && totalExpense > 0) {
      const palette = [
        [234, 88, 12],  // #ea580c brand
        [217, 119, 6],  // #d97706 amber
        [2, 132, 199],  // #0284c7 sky
        [124, 58, 237], // #7c3aed violet
        [13, 148, 136], // #0d9488 teal
      ];

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(122, 114, 99);
      doc.text('TOP EXPENSE CATEGORIES:', margin, currentY);
      currentY += 8;

      // Draw Proportional Stacked Bar
      const barHeight = 6;
      let barX = margin;
      sortedCategories.forEach(([_, amt], idx) => {
        const segWidth = (amt / totalExpense) * contentWidth;
        const color = palette[idx % palette.length];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(barX, currentY, segWidth, barHeight, 'F');
        barX += segWidth;
      });
      currentY += barHeight + 8;

      // Legend
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      let legendX = margin;
      sortedCategories.forEach(([cat, amt], idx) => {
        const pct = ((amt / totalExpense) * 100).toFixed(0);
        const color = palette[idx % palette.length];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(legendX + 3, currentY - 2.5, 2.5, 'F');
        doc.setTextColor(74, 68, 58);
        const text = `${sanitizePdfText(cat)} (${pct}%)`;
        doc.text(text, legendX + 8, currentY);
        legendX += doc.getTextWidth(text) + 16;
      });
      currentY += 12;
    }
  }

  // 7. Prepare Table Rows and AutoTable Configuration
  const tableRows = transactions.map((tx) => {
    const dateFormatted = tx.date ? formatDate(tx.date, { dateStyle: 'medium' }) : '—';
    const title = sanitizePdfText(tx.description || tx.category || 'Untitled');
    const notes = includeNotes && tx.notes ? `\nNote: ${sanitizePdfText(tx.notes)}` : '';
    const category = sanitizePdfText(tx.category || 'General');
    const type = tx.type || 'Expense';
    const amountVal = Number(tx.amount || 0);
    const amountStr = `${type === 'Income' ? '+' : '-'}${formatPdfCurrency(amountVal)}`;

    return [
      dateFormatted,
      title + notes,
      category,
      type,
      amountStr,
    ];
  });

  // Table Totals Footer Row
  const tableFoot = [
    [
      'Total',
      `${txCount} transactions`,
      '',
      `Net:`,
      `${netBalance >= 0 ? '+' : '-'}${formatPdfCurrency(Math.abs(netBalance))}`,
    ],
  ];

  // Column widths tuned for Portrait vs Landscape
  const columnStyles = isLandscape
    ? {
        0: { cellWidth: 80 },  // Date
        1: { cellWidth: 'auto' }, // Title
        2: { cellWidth: 120 }, // Category
        3: { cellWidth: 65 },  // Type
        4: { cellWidth: 120, halign: 'right', fontStyle: 'bold' }, // Amount
      }
    : {
        0: { cellWidth: 70 },  // Date
        1: { cellWidth: 'auto' }, // Title
        2: { cellWidth: 90 },  // Category
        3: { cellWidth: 55 },  // Type
        4: { cellWidth: 105, halign: 'right', fontStyle: 'bold' }, // Amount
      };

  const totalPagesExp = '{total_pages_count_string}';

  // 8. Execute autoTable(doc, ...) directly (jspdf-autotable v5 pattern)
  autoTable(doc, {
    startY: currentY,
    margin: {
      top: 60, // leaves room for header band on subsequent pages
      bottom: 36,
      left: margin,
      right: margin,
    },
    head: [['Date', 'Title / Description', 'Category', 'Type', 'Amount']],
    body: tableRows,
    foot: tableFoot,
    theme: 'plain',
    showHead: 'everyPage',
    showFoot: 'lastPage',
    rowPageBreak: 'avoid',
    headStyles: {
      fillColor: [31, 27, 22], // #1f1b16 dark fill
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 6,
    },
    bodyStyles: {
      textColor: [74, 68, 58], // #4a443a
      fontSize: 8.5,
      cellPadding: 5.5,
      lineColor: [233, 225, 202],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    alternateRowStyles: {
      fillColor: [253, 249, 239], // #fdf9ef warm cream alternate
    },
    footStyles: {
      fillColor: [246, 240, 221], // #f6f0dd
      textColor: [31, 27, 22],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 6,
      lineWidth: 0.75,
      lineColor: [233, 225, 202],
    },
    columnStyles,
    didParseCell: (data) => {
      // Style Type column
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.raw === 'Income') {
          data.cell.styles.textColor = [21, 128, 61]; // green
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // red
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Style Amount column in body
      if (data.section === 'body' && data.column.index === 4) {
        const rawStr = String(data.cell.raw || '');
        if (rawStr.startsWith('+')) {
          data.cell.styles.textColor = [21, 128, 61]; // green
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // red
        }
      }
      // Style Amount column in foot
      if (data.section === 'foot' && data.column.index === 4) {
        data.cell.styles.textColor = netBalance >= 0 ? [21, 128, 61] : [220, 38, 38];
      }
    },
    didDrawPage: (data) => {
      // Draw branded header band & footer on every page
      drawHeaderBand(data.pageNumber);
      drawFooterBand(data.pageNumber, totalPagesExp);
    },
  });

  // Replace total pages placeholder across all pages
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  // 9. Format Filename & Trigger Download
  let filenameDatePart = new Date().toISOString().split('T')[0];
  if (filters.startDate && filters.endDate) {
    filenameDatePart = `${filters.startDate}_to_${filters.endDate}`;
  } else if (filters.startDate) {
    filenameDatePart = `from_${filters.startDate}`;
  }
  const cleanTitle = safeTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = `spendwise-${cleanTitle}-${filenameDatePart}.pdf`;

  doc.save(filename);

  const pageCount = doc.internal.getNumberOfPages();
  return { success: true, filename, pageCount };
}
