import type { TestCase } from './types.js';

const INDENT = '    ';

/** Escape karakter khusus untuk string literal TypeScript (single quote). */
function escapeStr(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' ');
}

/** Ubah teks multi-baris menjadi komentar `//` dengan indentasi tertentu. */
function commentBlock(label: string, value: string | undefined, indent: string): string {
  if (!value || value.trim() === '') return '';
  const body = value
    .split(/\r?\n/)
    .map((line) => `${indent}// ${line.replace(/\*\//g, '*\\/')}`)
    .join('\n');
  return `${indent}// ${label}:\n${body}`;
}

/** Kumpulkan blok komentar berlabel menjadi satu string (tanpa trailing newline). */
function labelledBlocks(
  entries: ReadonlyArray<readonly [string, string | undefined]>,
  indent: string,
): string {
  return entries
    .map(([label, value]) => commentBlock(label, value, indent))
    .filter((block) => block !== '')
    .join('\n\n');
}

/** Baris ringkasan metadata untuk test case UI. */
function uiMeta(tc: TestCase): string {
  const parts: string[] = [];
  if (tc.platform) parts.push(`Platform: ${tc.platform}`);
  if (tc.priority) parts.push(`Priority: ${tc.priority}`);
  if (tc.category) parts.push(`Category: ${tc.category}`);
  if (tc.automated) parts.push(`Automated: ${tc.automated}`);
  return parts.join(' | ');
}

/** Baris ringkasan metadata untuk test case API. */
function apiMeta(tc: TestCase): string {
  const parts: string[] = [];
  if (tc.priority) parts.push(`Priority: ${tc.priority}`);
  if (tc.category) parts.push(`Category: ${tc.category}`);
  if (tc.automated) parts.push(`Automated: ${tc.automated}`);
  return parts.join(' | ');
}

function uiSpec(tc: TestCase): string {
  const inner = INDENT.repeat(2); // 8 spasi - isi body test
  const lines: string[] = [];

  lines.push(`test.describe('${escapeStr(tc.id)} - ${escapeStr(tc.title)}', () => {`);
  lines.push(`${INDENT}test('${escapeStr(tc.id)}: ${escapeStr(tc.title)}', async ({ page }) => {`);

  const meta = uiMeta(tc);
  if (meta) lines.push(`${inner}// ${meta}`);

  const context = labelledBlocks(
    [
      ['Precondition', tc.precondition],
      ['Test Data', tc.testData],
      ['Steps', tc.steps],
      ['Expected Result', tc.expected],
    ],
    inner,
  );
  if (context) lines.push('', context);

  lines.push('');
  lines.push(`${inner}// TODO: implementasikan langkah di atas memakai Playwright.`);
  lines.push(`${inner}await page.goto('/');`);
  lines.push(`${inner}// contoh: await page.getByRole('button', { name: 'Ekspor/Impor' }).click();`);
  lines.push(`${inner}// expect(page).toHaveURL(/.../);`);
  lines.push('');
  lines.push(`${inner}test.fixme(true, 'Stub auto-generated - lengkapi langkah Playwright');`);
  lines.push(`${INDENT}});`);
  lines.push(`});`);
  lines.push('');
  return lines.join('\n');
}

function apiSpec(tc: TestCase): string {
  const inner = INDENT.repeat(2);
  const method = (tc.method ?? 'GET').toUpperCase();
  const endpoint = tc.endpoint ?? '/';
  const describeName = tc.endpointName ?? tc.id;
  const lines: string[] = [];

  lines.push(`test.describe('${escapeStr(describeName)} - ${escapeStr(tc.title)}', () => {`);
  lines.push(`${INDENT}test('${escapeStr(tc.id)}: ${escapeStr(tc.title)}', async ({ request }) => {`);

  const meta = apiMeta(tc);
  if (meta) lines.push(`${inner}// ${meta}`);

  const context = labelledBlocks(
    [
      ['Precondition', tc.precondition],
      ['Header & Auth', tc.auth],
      ['Payload', tc.payload],
      ['Test Data', tc.testData],
      ['Expected Result', tc.expected],
    ],
    inner,
  );
  if (context) lines.push('', context);

  lines.push('');
  lines.push(`${inner}// TODO: sesuaikan payload & assertion dengan kontrak API.`);
  lines.push(`${inner}const response = await request.fetch('${escapeStr(endpoint)}', {`);
  lines.push(`${INDENT.repeat(3)}method: '${method}',`);
  lines.push(`${INDENT.repeat(3)}// data: { /* ... */ },`);
  lines.push(`${INDENT.repeat(3)}// headers: { Authorization: \`Bearer ${'$'}{process.env.API_TOKEN}\` },`);
  lines.push(`${inner}});`);
  lines.push(`${inner}expect(response.status()).toBe(200);`);
  lines.push(`${inner}// const body = await response.json();`);
  lines.push(`${inner}// expect(body).toMatchObject({ /* ... */ });`);
  lines.push('');
  lines.push(`${inner}test.fixme(true, 'Stub auto-generated - lengkapi payload & assertion');`);
  lines.push(`${INDENT}});`);
  lines.push(`});`);
  lines.push('');

  return lines.join('\n');
}

/** Susun satu file spec Playwright dari daftar test case. */
export function generateSpec(cases: TestCase[], sourceFile: string): string {
  const hasApi = cases.some((tc) => tc.kind === 'api');
  const importLine = hasApi
    ? "import { test, expect } from '@playwright/test';"
    : "import { test } from '@playwright/test';";

  const heading = [
    '// ============================================================================',
    '// AUTO-GENERATED by test-pw - jangan diedit manual.',
    `// Source   : ${sourceFile}`,
    `// Generated: ${new Date().toISOString()}`,
    `// Total    : ${cases.length} test case`,
    '// ============================================================================',
    '',
    importLine,
    '',
    '',
  ].join('\n');

  const body = cases
    .map((tc) => (tc.kind === 'api' ? apiSpec(tc) : uiSpec(tc)))
    .join('');

  return heading + body;
}
