/**
 * Model data test case.
 *
 * Generator mendukung dua bentuk CSV yang umum dipakai tim QA:
 *  - "ui"  : kolom `Test Case ID`, `Steps`, `Expected Result`, dst. (test case UI manual)
 *  - "api" : kolom `TC ID`, `Method`, `Endpoint`, `Payload`, dst. (test case API)
 *
 * Field yang tidak dipakai dibiarkan opsional agar satu tipe bisa mewakili keduanya.
 */
export type TestKind = 'ui' | 'api';

export interface TestCase {
  /** 'ui' atau 'api' — dideteksi dari header CSV. */
  kind: TestKind;

  /** ID unik test case (mis. TC-Membuka halaman awal impor-4620). */
  id: string;

  /** Judul test case. */
  title: string;

  /** ---- UI ---- */
  /** Kode User Story terkait. */
  story?: string;
  /** Kode Acceptance Criteria terkait. */
  ac?: string;
  /** Platform target (Desktop Web, Mobile Web, ...). */
  platform?: string;

  /** ---- API ---- */
  /** Nama endpoint (grup). */
  endpointName?: string;
  /** HTTP method (GET, POST, ...). */
  method?: string;
  /** Path endpoint (mis. /accounting/v1/purchases/scan-receipt). */
  endpoint?: string;
  /** Header & Auth yang dibutuhkan. */
  auth?: string;
  /** Contoh payload request. */
  payload?: string;

  /** ---- shared ---- */
  /** Kondisi awal sebelum test dijalankan. */
  precondition?: string;
  /** Kategori (Positive / Negative / ...). */
  category?: string;
  /** Prioritas (High / Medium / Low). */
  priority?: string;
  /** Data uji. */
  testData?: string;
  /** Langkah-langkah (khusus UI). */
  steps?: string;
  /** Hasil yang diharapkan. */
  expected?: string;
  /** Status otomasi dari CSV (mis. "Will Automate"). */
  automated?: string;
}
