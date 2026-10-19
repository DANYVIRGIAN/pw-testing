/**
 * BasePage — kelas dasar untuk semua page object.
 * Port dari `pages/base_page.py` (Python/Selenium) ke Playwright.
 *
 * Di Selenium perlu `WebDriverWait` + `time.sleep` manual; di Playwright
 * auto-waiting sudah bawaan, jadi kode jadi lebih ringkas.
 */
import type { Locator, Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Locator "aman" untuk halaman yang punya elemen kembar
   * (mis. layout desktop + mobile dirender bersamaan).
   *
   * Perbedaan penting Selenium vs Playwright:
   *  - Selenium `find_element()` → diam-diam mengembalikan elemen PERTAMA.
   *  - Playwright              → melempar error bila satu locator cocok ke
   *                              banyak elemen ("strict mode violation").
   *
   * Helper ini menyaring dulu ke elemen yang benar-benar TERLIHAT, baru
   * mengambil yang pertama — sehingga perilakunya setara Selenium tapi aman.
   */
  protected loc(selector: string): Locator {
    return this.page.locator(selector).filter({ visible: true }).first();
  }

  /**
   * Buka URL dan tunggu DOM siap.
   * Port dari `open_url()` — di Playwright tidak perlu sleep manual.
   */
  async openUrl(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Tunggu sampai SPA selesai "hidrasi" — yaitu saat React benar-benar siap
   * menerima input.
   *
   * Kenapa ini penting? VocaGame itu SPA React: server mengirim HTML lebih
   * dulu, sedangkan React baru mengambil alih halaman ±1 detik setelahnya.
   * Input yang diisi DI JENDELA WAKTU ITU akan dihapus oleh render pertama
   * React (nilainya di-reset ke state kosong) — akibatnya tombol submit tetap
   * disabled dan test jadi flaky: kadang lolos, kadang gagal.
   *
   * Hasil pengukuran di halaman login (mode headless):
   *    ~480ms  input email terlihat di DOM
   *    ~500ms  terisi "user@mail.com"  ← terisi, tapi React belum aktif
   *   ~1900ms  nilai DIHAPUS jadi "" dan properti `__reactFiber$...` muncul
   *
   * Penandanya: begitu React mengambil alih sebuah elemen, React menempelkan
   * properti internal `__reactFiber$...` pada elemen itu. Selama properti itu
   * belum ada, halaman belum siap menerima input.
   *
   * @param selector elemen yang dipakai sebagai patokan (pilih elemen form
   *                 yang akan kita pakai, bukan elemen teratas halaman).
   */
  protected async waitForHydration(selector: string, timeout = 15_000): Promise<void> {
    await this.page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        return Object.keys(el).some((key) => key.startsWith('__reactFiber$'));
      },
      selector,
      { timeout },
    );
  }

  /** Klik dengan scroll ke tengah viewport lebih dulu. */  async click(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
  }

  /** Isi input (Playwright otomatis clear field lebih dulu). */
  async fill(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }

  /** Ambil teks sebuah elemen. */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent())?.trim() ?? '';
  }

  /**
   * Tunggu sebuah toast muncul, lalu ambil teksnya.
   * Mengembalikan null bila toast tidak muncul sampai batas waktu.
   *
   * Perlu ditunggu karena pesan dari server (mis. "Email tidak ditemukan")
   * baru tampil setelah request selesai — bukan langsung setelah klik.
   */
  protected async waitForToast(locator: Locator, timeout = 10_000): Promise<string | null> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return await this.getText(locator);
    } catch {
      return null;
    }
  }

  /** Cek apakah elemen terlihat, tanpa melempar error. */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible().catch(() => false);
  }
}
