/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple robust CSV parser
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      lines.push(row);
      row = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  // push residual row
  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    lines.push(row);
  }

  return lines.filter(l => l.length > 0 && l.some(cell => cell !== ""));
}

// Convert state to CSV
export function convertToCSV<T extends Record<string, any>>(data: T[], headers: (keyof T)[]): string {
  const headerLine = headers.map(h => `"${String(h)}"`).join(",");
  const rows = data.map(item =>
    headers.map(h => {
      const val = item[h];
      const valStr = val === undefined || val === null ? "" : String(val);
      if (valStr.includes(",") || valStr.includes('"') || valStr.includes("\n")) {
        return `"${valStr.replace(/"/g, '""')}"`;
      }
      return valStr;
    }).join(",")
  );
  return [headerLine, ...rows].join("\n");
}
