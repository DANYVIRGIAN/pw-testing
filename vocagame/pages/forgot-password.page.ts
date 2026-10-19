/**
 * ForgotPasswordPage — port dari `pages/forgot_password_page.py`.
 *
 * Alur: minta reset → verifikasi OTP (dari Yopmail) → isi password baru.
 */
import type { Locator } from '@playwright/test';
import { config } from '../config';
import { getOtpFromYopmail } from '../utils/yopmail';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  // --- LOCATOR ---
  readonly emailInput: Locator = this.loc('input[name="identifier"]');
  readonly submitRequestButton: Locator = this.loc('button[type="submit"]');

  // Popup & OTP
  readonly sendOtpButton: Locator = this.page
    .getByText('Kirim OTP via Email')
    .filter({ visible: true })
    .first();
  // XPath asli: //div[@role='dialog']//button[3]
  readonly continueOtpButton: Locator = this.loc('xpath=//div[@role="dialog"]//button[3]');
  readonly otpInput: Locator = this.loc('div[data-input-otp-container] input');
  readonly verifyOtpButton: Locator = this.page
    .getByRole('button', { name: 'Verifikasi', exact: true })
    .filter({ visible: true })
    .first();

  // Reset password
  readonly newPasswordInput: Locator = this.loc('input[name="password"]');
  readonly confirmPasswordInput: Locator = this.loc('input[name="confirmPassword"]');
  readonly resetButton: Locator = this.loc('button[type="submit"]');
  readonly successToast: Locator = this.loc('li[role="status"] [data-title]');

  // --- ACTION ---
  async open(): Promise<void> {
    await this.openUrl(config.forgotPasswordUrl);
    // Penting: tunggu React selesai hidrasi, kalau tidak isian kita dihapus.
    await this.waitForHydration('input[name="identifier"]');
  }

  async performForgotPassword(email: string, newPass: string): Promise<void> {
    await this.fill(this.emailInput, email);
    await this.click(this.submitRequestButton);

    await this.proceedToOtpPopup();

    const otpSuccess = await this.inputOtpVerification(email);
    if (!otpSuccess) {
      throw new Error('OTP Verification Failed');
    }

    await this.newPasswordInput.waitFor({ state: 'visible', timeout: 10_000 });
    await this.fill(this.newPasswordInput, newPass);
    await this.fill(this.confirmPasswordInput, newPass);
    await this.click(this.resetButton);
  }

  async proceedToOtpPopup(): Promise<void> {
    if (await this.isVisible(this.sendOtpButton)) {
      await this.click(this.sendOtpButton);
    }
    if (await this.isVisible(this.continueOtpButton)) {
      await this.click(this.continueOtpButton);
    }
  }

  async inputOtpVerification(emailAddress: string): Promise<boolean> {
    const otpCode = await getOtpFromYopmail(this.page, emailAddress);
    if (!otpCode) return false;

    await this.fill(this.otpInput, otpCode);
    await this.click(this.verifyOtpButton);
    return true;
  }

  async getSuccessMessage(): Promise<string | null> {
    return this.waitForToast(this.successToast);
  }
}
