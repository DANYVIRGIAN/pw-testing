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
  readonly usernameInput: Locator = this.page.locator('input[name="identifier"]');
  // XPath asli: //input[@type='password']
  readonly passwordInput: Locator = this.page.locator('input[type="password"]');
  // XPath asli: //button[@type='submit']
  readonly submitButton: Locator = this.page.locator('button[type="submit"]');
  // XPath asli: //li[@role='status']/div[2]
  readonly errorToast: Locator = this.page.locator('li[role="status"] > div:nth-of-type(2)');

  // --- ACTION ---
  async open(): Promise<void> {
    await this.openUrl(config.loginUrl);
  }

  async loginUser(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.click(this.submitButton);
    await this.fill(this.passwordInput, password);
    await this.click(this.submitButton);
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.isVisible(this.errorToast)) {
      return this.getText(this.errorToast);
    }
    return null;
  }
}
