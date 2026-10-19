# pw-testing

> Generate **Playwright** test specs langsung dari file CSV test case QA — mendukung format **UI** dan **API**.

[![Node](https://img.shields.io/badge/node-%3E%3D18-informational)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/playwright-%40playwright%2Ftest-2EAD33)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6)](https://www.typescriptlang.org)

`pw-testing` membaca CSV test case yang biasa dipakai tim QA (kolom `Test Case ID`,
`Steps`, `Expected Result`, `Endpoint`, `Method`, dst.), lalu menghasilkan skeleton
spec Playwright siap-isi. Tujuannya memangkas pekerjaan berulang: dari ratusan baris
test case di spreadsheet → file `.spec.ts` terstruktur dalam hitungan detik.

---

## ✨ Fitur

- **Auto-deteksi jenis test case** — UI (`Steps`, `Platform`) vs API (`Endpoint`, `Method`, `Payload`).
- **Parser CSV mandiri** — menangani field ber-quote, koma, newline di dalam sel, dan BOM. Tanpa dependensi.
- **Context ikut terbawa** — Precondition, Test Data, Steps, Expected Result ditulis sebagai komentar di dalam test.
- **Header case-insensitive & toleran** — beberapa nama kolom alternatif dikenali.
- **Zero runtime dependency** — hanya tooling dev (TypeScript, tsx, Playwright).

## 🚀 Quick start

```bash
# 1. install dependency
npm install

# 2. generate spec dari contoh (UI)
npm run gen -- examples/ui-testcases.sample.csv

# 3. generate spec dari contoh (API)
npm run gen -- examples/api-testcases.sample.csv -o tests/api -n scan-receipt.spec.ts
```

Hasilnya muncul di `tests/generated/`. Buka salah satu file `.spec.ts`.

## 📦 Pemakaian CLI

```
tcgen <testcase.csv> [options]

  -o, --out <dir>     Folder output     (default: tests/generated)
  -n, --name <file>   Nama file output  (default: <nama-csv>.spec.ts)
  -h, --help          Bantuan
```

Setelah `npm run build`, CLI juga tersedia sebagai binary `tcgen`.

## 📄 Format CSV yang didukung

### UI test case

| Kode US | Kode AC | Test Case ID | Platform | Title (Test Case) | Precondition | Category | Priority | Test Data | Steps | Expected Result | Automated ? |
|---|---|---|---|---|---|---|---|---|---|---|---|

### API test case

| Endpoint Name | TC ID | Method | Endpoint | TC Title | Precondition | Header & Auth | Payload | Test Data | Expected Result | Category | Priority | Automated? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

> Kolom yang tidak ada cukup dibiarkan kosong. Nama kolom dibaca *case-insensitive*
> dengan beberapa alias (mis. `Test Case ID` atau `TC ID`).

## 🗂️ Struktur project

```
pw-testing/
├── src/
│   ├── cli.ts         # entry point CLI
│   ├── csv.ts         # parser CSV (RFC-4180-ish)
│   ├── parser.ts      # deteksi jenis + pemetaan ke TestCase
│   ├── generator.ts   # penerbit kode spec Playwright
│   └── types.ts       # model data
├── examples/          # CSV contoh (UI & API) + contoh nyata VocaGame
├── tests/             # spec hasil generate (gitignored)
├── playwright.config.ts
└── package.json
```

## 🧪 Menjalankan spec

```bash
# generate dulu, lalu:
npm run test:e2e
# atau arahkan ke baseURL tertentu:
BASE_URL=https://staging.example.com npm run test:e2e
```

> Spec yang dihasilkan berupa **stub** dengan `test.fixme(...)` sampai kamu mengisi
> langkah Playwright-nya. Ini sengaja: generator menyiapkan kerangka + konteks,
> kamu fokus ke logika selektor/assertion.

## 🧩 VocaGame — automation hasil reverse-engineering

Folder [`vocagame/`](./vocagame) berisi automation yang sudah berjalan, hasil membalik
suite **Python + Selenium + Pytest** menjadi **TypeScript + Playwright**: automation lama
diekstrak jadi **8 test case CSV**, di-generate jadi skeleton, lalu diisi memakai
**Page Object Model**.

| Bagian | Isi |
|---|---|
| `vocagame-testcases.csv` | 8 test case hasil reverse-engineer (Login, Register, Order, Lupa Password) |
| `generated/vocagame.spec.ts` | output generator pw-testing |
| `pages/` + `utils/` | port POM & helper (OTP Yopmail) ke TypeScript |
| `specs/vocagame.e2e.spec.ts` | spec siap jalan |

```bash
npx playwright install chromium
npx playwright test -c vocagame/playwright.config.ts
```

Detail lengkap + tabel pemetaan Selenium → Playwright ada di
[`vocagame/README.md`](./vocagame/README.md).

## 🛠️ Pengembangan

```bash
npm run typecheck   # tsc --noEmit
npm run dev -- <csv>   # jalankan langsung via tsx
```

## 📝 Lisensi

MIT
