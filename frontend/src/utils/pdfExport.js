import { formatDate } from './helpers';

/**
 * Generates and downloads a professional A4 PDF report of transactions.
 * Lazily loads jsPDF and jspdf-autotable to prevent bundle bloat.
 * 
 * @param {Array} transactions - List of transaction objects
 * @param {Object} options - Report metadata and active filter summary
 */
export async function exportTransactionsToPdf(transactions = [], options = {}) {
  const {
    activeFilters = {},
    summary = {},
    userName = 'Valued User',
  } = options;

  // Dynamically import jsPDF and autoTable plugin for code-splitting
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // ─── 1. Header Banner ────────────────────────────────────────────────────────
  // SpendWise Brand Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(234, 88, 12); // Brand Orange #ea580c
  doc.text('SpendWise', margin, 52);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(74, 68, 58); // ink-body
  doc.text('Transactions Ledger Report', margin, 68);

  // Generation timestamp & User right-aligned
  const now = new Date();
  const generatedDateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const generatedTimeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  doc.setFontSize(9);
  doc.setTextColor(122, 114, 99); // ink-soft
  doc.text(`Generated: ${generatedDateStr} at ${generatedTimeStr}`, pageWidth - margin, 52, { align: 'right' });
  if (userName) {
    doc.text(`Account: ${userName}`, pageWidth - margin, 66, { align: 'right' });
  }

  // Thin dividing line
  doc.setDrawColor(233, 225, 202); // line token
  doc.setLineWidth(1);
  doc.line(margin, 78, pageWidth - margin, 78);

  // ─── 2. Filter Summary Callout ───────────────────────────────────────────────
  const filterParts = [];
  if (activeFilters.type) filterParts.push(`Type: ${activeFilters.type}`);
  if (activeFilters.category) filterParts.push(`Category: ${activeFilters.category}`);
  if (activeFilters.startDate || activeFilters.endDate) {
    const start = activeFilters.startDate || 'Beginning';
    const end = activeFilters.endDate || 'Present';
    filterParts.push(`Date: ${start} to ${end}`);
  }
  if (activeFilters.search) filterParts.push(`Search: "${activeFilters.search}"`);

  const filterSummaryText = filterParts.length > 0 ? filterParts.join('  •  ') : 'All Transactions (No filters applied)';

  doc.setFillColor(246, 240, 221); // cream-band
  doc.roundedRect(margin, 88, contentWidth, 22, 4, 4, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(122, 114, 99);
  doc.text('ACTIVE FILTERS:', margin + 10, 102);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(74, 68, 58);
  doc.text(filterSummaryText, margin + 88, 102, { maxWidth: contentWidth - 98 });

  // ─── 3. Financial Summary Block ──────────────────────────────────────────────
  // Calculate or use provided summary
  let totalIncome = summary.income ?? 0;
  let totalExpense = summary.expense ?? 0;
  let count = summary.count ?? transactions.length;

  if (summary.income === undefined) {
    totalIncome = 0;
    totalExpense = 0;
    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'Income') totalIncome += amt;
      else if (tx.type === 'Expense') totalExpense += amt;
    });
    count = transactions.length;
  }
  const netBalance = totalIncome - totalExpense;

  const cardWidth = (contentWidth - 18) / 4;
  const cardHeight = 44;
  const cardY = 118;

  const summaryCards = [
    {
      label: 'TOTAL INCOME',
      value: `+Rs. ${totalIncome.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: [21, 128, 61], // green
    },
    {
      label: 'TOTAL EXPENSES',
      value: `-Rs. ${totalExpense.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: [220, 38, 38], // red
    },
    {
      label: 'NET BALANCE',
      value: `${netBalance >= 0 ? '+' : '-'}Rs. ${Math.abs(netBalance).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: netBalance >= 0 ? [21, 128, 61] : [220, 38, 38],
    },
    {
      label: 'RECORD COUNT',
      value: `${count} item${count === 1 ? '' : 's'}`,
      color: [74, 68, 58],
    },
  ];

  summaryCards.forEach((card, idx) => {
    const cardX = margin + idx * (cardWidth + 6);
    // Background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(233, 225, 202);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 6, 6, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(122, 114, 99);
    doc.text(card.label, cardX + 8, cardY + 14);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, cardX + 8, cardY + 32);
  });

  // ─── 4. Transactions Table (jspdf-autotable) ──────────────────────────────────
  const tableRows = transactions.map((tx) => {
    const dateFormatted = tx.date ? formatDate(tx.date, { dateStyle: 'medium' }) : '—';
    const title = tx.description || '—';
    const notes = tx.notes ? `\nNote: ${tx.notes}` : '';
    const category = tx.category || 'General';
    const type = tx.type || 'Expense';
    const numAmt = Number(tx.amount || 0);
    const amountStr = `${type === 'Income' ? '+' : '-'}Rs. ${numAmt.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return [
      dateFormatted,
      title + notes,
      category,
      type,
      amountStr,
    ];
  });

  doc.autoTable({
    startY: cardY + cardHeight + 14,
    margin: { left: margin, right: margin, bottom: 44 },
    head: [['Date', 'Title / Description', 'Category', 'Type', 'Amount']],
    body: tableRows,
    theme: 'plain',
    showHead: 'everyPage',
    headStyles: {
      fillColor: [234, 88, 12], // #ea580c brand
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 6,
    },
    bodyStyles: {
      textColor: [31, 27, 22],
      fontSize: 8.5,
      cellPadding: 5.5,
      lineColor: [233, 225, 202],
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [253, 249, 239], // cream
    },
    columnStyles: {
      0: { cellWidth: 70 }, // Date
      1: { cellWidth: 'auto' }, // Title
      2: { cellWidth: 85 }, // Category
      3: { cellWidth: 55 }, // Type
      4: { cellWidth: 95, halign: 'right', fontStyle: 'bold' }, // Amount
    },
    didParseCell: (data) => {
      // Style Type column
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.raw === 'Income') {
          data.cell.styles.textColor = [21, 128, 61];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Style Amount column: Green with + for Income, Red with - for Expense
      if (data.section === 'body' && data.column.index === 4) {
        const rawStr = String(data.cell.raw);
        if (rawStr.startsWith('+')) {
          data.cell.styles.textColor = [21, 128, 61]; // green
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // red
        }
      }
    },
    didDrawPage: (data) => {
      // Footer with page number and brand notice on every page
      const pageNumber = data.pageNumber;
      const totalPagesExp = '{total_pages_count_string}';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(122, 114, 99); // ink-soft

      // Top border line above footer
      doc.setDrawColor(233, 225, 202);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28);

      // Footer branding
      doc.text('Generated by SpendWise — Personal Expense & Budget Tracker', margin, pageHeight - 16);

      // Page numbers "Page X of Y"
      const pageStr = `Page ${pageNumber} of ${totalPagesExp}`;
      doc.text(pageStr, pageWidth - margin, pageHeight - 16, { align: 'right' });
    },
  });

  // Compute total pages string replacement
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages('{total_pages_count_string}');
  }

  // Trigger file download
  const dateSuffix = new Date().toISOString().split('T')[0];
  const filename = `spendwise-transactions-report-${dateSuffix}.pdf`;
  doc.save(filename);

  return filename;
}
