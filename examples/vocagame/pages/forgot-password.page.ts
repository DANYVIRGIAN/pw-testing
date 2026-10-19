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
  readonly emailInput: Locator = this.page.locator('input[name="identifier"]');
  readonly submitRequestButton: Locator = this.page.locator('button[type="submit"]').first();

  // Popup & OTP
  readonly sendOtpButton: Locator = this.page.getByText('Kirim OTP via Email').first();
  // XPath asli: //div[@role='dialog']//button[3]
  readonly continueOtpButton: Locator = this.page.locator(
    'xpath=//div[@role="dialog"]//button[3]',
  );
  readonly otpInput: Locator = this.page.locator('div[data-input-otp-container] input').first();
  readonly verifyOtpButton: Locator = this.page.getByRole('button', {
    name: 'Verifikasi',
    exact: true,
  });

  // Reset password
  readonly newPasswordInput: Locator = this.page.locator('input[name="password"]');
  readonly confirmPasswordInput: Locator = this.page.locator('input[name="confirmPassword"]');
  readonly resetButton: Locator = this.page.locator('button[type="submit"]').first();
  readonly successToast: Locator = this.page.locator('li[role="status"] > div:nth-of-type(2)').first();

  // --- ACTION ---
  async open(): Promise<void> {
    await this.openUrl(config.forgotPasswordUrl);
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
    try {
      await this.successToast.waitFor({ state: 'visible', timeout: 10_000 });
      return await this.getText(this.successToast);
    } catch {
      return null;
    }
  }
}
