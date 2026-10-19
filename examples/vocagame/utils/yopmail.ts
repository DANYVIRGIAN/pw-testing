/**
 * Pengambil kode OTP dari inbox Yopmail.
 * Port dari `utils/email_util.py` (Python/Selenium) ke Playwright.
 *
 * Cara kerja:
 *  1. Buka tab baru di context yang sama (meniru `driver.switch_to.new_window`).
 *  2. Masuk ke Yopmail dan buka inbox sesuai alamat email.
 *  3. Baca isi iframe `#ifmail`, cari pola 6 digit.
 *  4. Ulangi (refresh) beberapa kali karena email bisa datang terlambat.
 *  5. Selalu tutup tab inbox di akhir.
 */
import type { Page } from '@playwright/test';

export interface OtpOptions {
  /** Jumlah percobaan baca/refresh. */
  attempts?: number;
  /** Jeda antar percobaan (ms). */
  delayMs?: number;
}

const OTP_PATTERN = /\b\d{6}\b/;

export async function getOtpFromYopmail(
  page: Page,
  email: string,
  options: OtpOptions = {},
): Promise<string | null> {
  const attempts = options.attempts ?? 10;
  const delayMs = options.delayMs ?? 3_000;

  const inbox = await page.context().newPage();

  try {
    await inbox.goto('https://yopmail.com/', { waitUntil: 'domcontentloaded' });
    await inbox.locator('#login').fill(email);
    await inbox.locator('#refreshbut').click();

    const mail = inbox.frameLocator('#ifmail');

    for (let attempt = 1; attempt <= attempts; attempt++) {
      const body = await mail.locator('body').innerText().catch(() => '');
      const match = body.match(OTP_PATTERN);

      if (match) {
        return match[0];
      }

      // belum ada OTP — paksa muat ulang inbox
      await inbox.locator('#refreshbut').click().catch(() => undefined);
      await inbox.waitForTimeout(delayMs);
    }

    return null;
  } finally {
    await inbox.close();
  }
}
