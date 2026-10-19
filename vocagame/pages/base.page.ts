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
   * Buka URL dan tunggu DOM siap.
   * Port dari `open_url()` — di Playwright tidak perlu sleep manual.
   */
  async openUrl(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /** Klik dengan scroll ke tengah viewport lebih dulu. */
  async click(locator: Locator): Promise<void> {
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

  /** Cek apakah elemen terlihat, tanpa melempar error. */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible().catch(() => false);
  }
}
