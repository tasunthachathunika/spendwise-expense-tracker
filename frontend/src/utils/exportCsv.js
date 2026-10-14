import api from './api';

/**
 * Downloads transactions as an RFC 4180 CSV file with UTF-8 BOM.
 * 
 * @param {Object} queryParams - Active filters, search, sort, and order
 * @param {Object} options - Additional options like AbortSignal
 * @returns {Promise<{ success: boolean, filename: string }>}
 */
export async function exportTransactionsToCsv(queryParams = {}, options = {}) {
  const params = {
    ...queryParams,
    format: 'csv',
  };

  const response = await api.get('/transactions/export', {
    params,
    responseType: 'blob',
    signal: options.signal,
  });

  // Extract filename from Content-Disposition header if available
  let filename = `spendwise-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  const disposition = response.headers['content-disposition'];
  if (disposition) {
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].trim();
    }
  }

  // Create temporary object URL and trigger download
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(downloadUrl);

  return { success: true, filename };
}
