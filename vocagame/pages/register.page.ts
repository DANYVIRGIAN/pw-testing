/**
 * RegisterPage — port dari `pages/register_page.py`.
 *
 * Meliputi alur registrasi + verifikasi OTP (kode diambil dari Yopmail).
 */
import type { Locator } from '@playwright/test';
import { config } from '../config';
import { getOtpFromYopmail } from '../utils/yopmail';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  // --- LOCATOR ---
  readonly firstNameInput: Locator = this.page.locator('input[name="first_name"]');
  readonly lastNameInput: Locator = this.page.locator('input[name="last_name"]');
  readonly phoneInput: Locator = this.page.locator('input[name="phone_number"]');
  readonly emailInput: Locator = this.page.locator('input[name="email"]');
  readonly passwordInput: Locator = this.page.locator('input[name="password"]');
  readonly confirmPasswordInput: Locator = this.page.locator('input[name="confirm_password"]');
  readonly tncCheckbox: Locator = this.page.locator('button[role="checkbox"]').first();
  readonly submitButton: Locator = this.page.locator('button[type="submit"]').first();

  // Popup OTP
  readonly sendOtpButton: Locator = this.page
    .locator('p', { hasText: 'Kirim OTP via Email' })
    .first();
  // XPath asli: //div[@role='dialog']//button[3]
  readonly continueOtpButton: Locator = this.page.locator(
    'xpath=//div[@role="dialog"]//button[3]',
  );
  readonly verifyOtpButton: Locator = this.page.getByRole('button', {
    name: 'Verifikasi',
    exact: true,
  });
  readonly otpInput: Locator = this.page.locator('div[data-input-otp-container] input').first();

  readonly errorToast: Locator = this.page.locator('li[role="status"] > div:nth-of-type(2)').first();

  // --- ACTION ---
  async open(): Promise<void> {
    await this.openUrl(config.registerUrl);
  }

  async registerNewUser(
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.fillFormData(firstName, lastName, phone, email, password);
    await this.click(this.submitButton);
  }

  /** Isi seluruh field + centang S&K, tanpa submit. */
  async fillFormData(
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
    await this.fill(this.phoneInput, phone);
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.fill(this.confirmPasswordInput, password);
    await this.click(this.tncCheckbox);
  }

  async proceedToOtpPopup(): Promise<void> {
    await this.click(this.sendOtpButton);
    await this.click(this.continueOtpButton);
  }

  /** Ambil OTP dari Yopmail lalu verifikasi. Return false bila OTP tidak ditemukan. */
  async inputOtpVerification(emailAddress: string): Promise<boolean> {
    const otpCode = await getOtpFromYopmail(this.page, emailAddress);
    if (!otpCode) return false;

    await this.fill(this.otpInput, otpCode);
    await this.click(this.verifyOtpButton);
    return true;
  }

  /** Tunggu toast error (maks 5 detik) lalu kembalikan teksnya. */
  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorToast.waitFor({ state: 'visible', timeout: 5_000 });
      return await this.getText(this.errorToast);
    } catch {
      return null;
    }
  }

  async isSubmitButtonEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled().catch(() => false);
  }
}
