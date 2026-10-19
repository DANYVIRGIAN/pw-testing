/**
 * LoginPage — port dari `pages/login_page.py`.
 *
 * Catatan: alur login VocaGame dua langkah —
 * isi email → submit → isi password → submit.
 */
import type { Locator } from '@playwright/test';
import { config } from '../config';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // --- LOCATOR ---
  // XPath asli: //input[@name='identifier']
  readonly usernameInput: Locator = this.loc('input[name="identifier"]');
  // XPath asli: //input[@type='password']
  readonly passwordInput: Locator = this.loc('input[type="password"]');
  // XPath asli: //button[@type='submit']
  readonly submitButton: Locator = this.loc('button[type="submit"]');
  // XPath asli: //li[@role='status']/div[2]
  // Di Playwright dipakai atribut milik library toast (sonner) supaya tidak
  // bergantung pada urutan <div> — lebih tahan perubahan tampilan.
  readonly errorToast: Locator = this.loc('li[role="status"] [data-title]');

  // --- ACTION ---
  async open(): Promise<void> {
    await this.openUrl(config.loginUrl);
    // Penting: tunggu React selesai hidrasi, kalau tidak isian kita dihapus.
    await this.waitForHydration('input[name="identifier"]');
  }

  async loginUser(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.click(this.submitButton);
    await this.fill(this.passwordInput, password);
    await this.click(this.submitButton);
  }

  async getErrorMessage(): Promise<string | null> {
    return this.waitForToast(this.errorToast);
  }
}
