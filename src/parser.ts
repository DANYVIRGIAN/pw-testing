import type { TestCase, TestKind } from './types.js';
import { parseCsv, toRecords } from './csv.js';

/** Ambil nilai pertama yang ada dari beberapa alternatif nama kolom (case-insensitive). */
function pick(record: Record<string, string>, ...keys: string[]): string | undefined {
  const lowerKeys = keys.map((k) => k.toLowerCase());
  for (const [header, value] of Object.entries(record)) {
    if (lowerKeys.includes(header.toLowerCase()) && value.trim() !== '') {
      return value.trim();
    }
  }
  return undefined;
}

/** Deteksi jenis test case dari nama kolom header. */
export function detectKind(header: string[]): TestKind {
  const lower = header.map((h) => h.toLowerCase());
  const has = (name: string) => lower.includes(name.toLowerCase());

  // Ciri khas test case API
  if (has('Endpoint') || has('Method') || has('Payload')) return 'api';
  // Ciri khas test case UI
  if (has('Steps') || has('Test Case ID') || has('Platform')) return 'ui';
  return 'ui';
}

function mapUi(record: Record<string, string>): TestCase {
  return {
    kind: 'ui',
    id: pick(record, 'Test Case ID', 'TC ID', 'ID') ?? '',
    title: pick(record, 'Title (Test Case)', 'Title', 'TC Title') ?? '',
    story: pick(record, 'Kode US'),
    ac: pick(record, 'Kode AC'),
    platform: pick(record, 'Platform'),
    precondition: pick(record, 'Precondition'),
    category: pick(record, 'Category'),
    priority: pick(record, 'Priority'),
    testData: pick(record, 'Test Data'),
    steps: pick(record, 'Steps'),
    expected: pick(record, 'Expected Result'),
    automated: pick(record, 'Automated ?', 'Automated?'),
  };
}

function mapApi(record: Record<string, string>): TestCase {
  return {
    kind: 'api',
    id: pick(record, 'TC ID', 'Test Case ID', 'ID') ?? '',
    title: pick(record, 'TC Title', 'Title', 'Title (Test Case)') ?? '',
    endpointName: pick(record, 'Endpoint Name'),
    method: pick(record, 'Method'),
    endpoint: pick(record, 'Endpoint'),
    auth: pick(record, 'Header & Auth', 'Auth', 'Headers'),
    payload: pick(record, 'Payload'),
    precondition: pick(record, 'Precondition'),
    category: pick(record, 'Category'),
    priority: pick(record, 'Priority'),
    testData: pick(record, 'Test Data'),
    expected: pick(record, 'Expected Result'),
    automated: pick(record, 'Automated?', 'Automated ?'),
  };
}

/** Uraikan isi file CSV menjadi daftar TestCase. */
export function parseTestCases(content: string): TestCase[] {
  const rows = parseCsv(content);
  if (rows.length === 0) return [];

  const header = (rows[0] ?? []).map((h) => h.trim());
  const kind = detectKind(header);
  const records = toRecords(rows);

  return records
    .map((record) => (kind === 'api' ? mapApi(record) : mapUi(record)))
    .filter((tc) => tc.id !== '');
}
