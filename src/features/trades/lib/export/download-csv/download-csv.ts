export const tradesCsvFilename = (now = new Date()): string => {
  return `trades-export-${now.toISOString().slice(0, 10)}.csv`;
};

export const downloadCsv = (filename: string, csv: string): void => {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
