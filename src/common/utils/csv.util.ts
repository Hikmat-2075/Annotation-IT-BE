export const buildCsv = <T extends Record<string, any>>(rows: T[]) => {
  if (!rows.length) {
    return '';
  }

  const headers = Object.keys(rows[0]);

  const escapeCsv = (value: any) => {
    const stringValue = String(value ?? '');
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  return [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsv(row[header])).join(','),
    ),
  ].join('\n');
};
