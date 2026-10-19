/**
 * Parser CSV kecil tanpa dependensi.
 *
 * Mendukung:
 *  - field ber-quote (") termasuk koma dan newline di dalamnya
 *  - escape quote ganda ("" -> ")
 *  - BOM di awal file
 *  - line ending CRLF / LF
 */

/** Uraikan teks CSV menjadi matriks baris x kolom. */
export function parseCsv(input: string): string[][] {
  // buang BOM kalau ada
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++; // skip quote kedua
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r') {
      // abaikan; newline di-handle oleh \n
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  // sisa field/baris terakhir (file tanpa newline penutup)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/** Ubah matriks CSV menjadi daftar objek dengan header sebagai kunci. */
export function toRecords(rows: string[][]): Record<string, string>[] {
  const [headerRow, ...dataRows] = rows;
  if (!headerRow) return [];

  const header = headerRow.map((h) => h.trim());
  const records: Record<string, string>[] = [];

  for (const cells of dataRows) {
    // lewati baris kosong
    if (cells.every((c) => c.trim() === '')) continue;

    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      record[key] = (cells[index] ?? '').trim();
    });
    records.push(record);
  }

  return records;
}
