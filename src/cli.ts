#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { parseTestCases } from './parser.js';
import { generateSpec } from './generator.js';

interface Options {
  input: string;
  outDir: string;
  fileName?: string;
}

const HELP = `pw-testing — generate Playwright specs dari CSV test case

Usage:
  tcgen <testcase.csv> [options]

Options:
  -o, --out <dir>     Folder output          (default: tests/generated)
  -n, --name <file>   Nama file output       (default: <nama-csv>.spec.ts)
  -h, --help          Tampilkan bantuan ini

Contoh:
  tcgen examples/ui-testcases.sample.csv
  tcgen examples/api-testcases.sample.csv -o tests/api -n scan-receipt.spec.ts
`;

function parseArgs(argv: string[]): Options {
  const opts: Options = { input: '', outDir: join('tests', 'generated') };
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '-h':
      case '--help':
        console.log(HELP);
        process.exit(0);
      case '-o':
      case '--out':
        opts.outDir = argv[++i] ?? opts.outDir;
        break;
      case '-n':
      case '--name':
        opts.fileName = argv[++i];
        break;
      default:
        rest.push(arg as string);
    }
  }

  if (rest.length === 0) {
    console.error(HELP);
    process.exit(1);
  }

  opts.input = rest[0] as string;
  return opts;
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));

  const inputPath = resolve(opts.input);
  if (!existsSync(inputPath)) {
    console.error(`✖ File CSV tidak ditemukan: ${inputPath}`);
    process.exit(1);
  }

  const content = readFileSync(inputPath, 'utf8');
  const cases = parseTestCases(content);

  if (cases.length === 0) {
    console.error('✖ Tidak ada test case yang terbaca dari CSV (cek header & isi).');
    process.exit(1);
  }

  const spec = generateSpec(cases, basename(inputPath));
  const outName =
    opts.fileName ?? `${basename(inputPath).replace(/\.csv$/i, '')}.spec.ts`;
  const outPath = resolve(opts.outDir, outName);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, spec, 'utf8');

  const ui = cases.filter((c) => c.kind === 'ui').length;
  const api = cases.filter((c) => c.kind === 'api').length;

  console.log(`✔ ${cases.length} test case dibaca (UI: ${ui}, API: ${api})`);
  console.log(`✔ Spec ditulis ke: ${outPath}`);
}

main();
