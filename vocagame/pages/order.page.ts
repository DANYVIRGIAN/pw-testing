/**
 * OrderPage — port dari `pages/order_page.py`.
 *
 * Alur top-up: buka Free Fire → isi data → pilih item → pilih QRIS →
 * beli → catat nomor pesanan → cek di History.
 */
import type { Locator } from '@playwright/test';
import { config } from '../config';
import { BasePage } from './base.page';

export class OrderPage extends BasePage {
  // --- LOCATOR ---
  readonly userIdInput: Locator = this.loc('input[name="data.user_id"]');
  readonly emailInput: Locator = this.loc('input[name="identifier"]');

  // XPath asli: //div[@id='Diamonds']/div[2]/button[1]
  readonly item5Diamonds: Locator = this.loc(
    '#Diamonds > div:nth-of-type(2) > button:nth-of-type(1)',
  );

  // Di Selenium perlu loop manual pilih tombol yang visible (responsif).
  // Playwright: cukup pakai filter visible.
  readonly qrisHeader: Locator = this.loc('button[data-cy="payment-group-qris"]');
  readonly qrisSubOption: Locator = this.loc('div[data-cy="payment-item-qris"]');

  // XPath asli: //button[contains(text(), 'Beli') or contains(text(), 'Buy')]
  readonly buyButton: Locator = this.page
    .locator('button')
    .filter({ hasText: /Beli|Buy/, visible: true })
    .first();

  // XPath asli: //h4[contains(text(), 'Nomor Pesanan')]/following-sibling::div/span
  readonly orderNumberText: Locator = this.loc(
    'xpath=//h4[contains(text(), "Nomor Pesanan")]/following-sibling::div/span',
  );
  // XPath asli: (//a[contains(@class,'shadow-card-box') and contains(@class,'lg:flex')])[1]
  readonly latestOrderCard: Locator = this.loc(
    'xpath=(//a[contains(@class, "shadow-card-box") and contains(@class, "lg:flex")])[1]',
  );

  // --- ACTION ---
  async openFreeFire(): Promise<void> {
    await this.openUrl(config.freeFireUrl);
    // Penting: tunggu React selesai hidrasi, kalau tidak isian kita dihapus.
    await this.waitForHydration('input[name="data.user_id"]');
  }

  async inputOrderData(userId: string, email: string): Promise<void> {
    await this.fill(this.userIdInput, userId);
    await this.fill(this.emailInput, email);
  }

  async selectItem5Diamonds(): Promise<void> {
    await this.click(this.item5Diamonds);
  }

  async selectPaymentQris(): Promise<void> {
    await this.click(this.qrisHeader);
    await this.click(this.qrisSubOption);
  }

  async clickBuyNow(): Promise<void> {
    await this.click(this.buyButton);
  }

  /** Tunggu nomor pesanan tampil (maks 15 detik) lalu kembalikan teksnya. */
  async getOrderNumberFromPaymentPage(): Promise<string | null> {
    try {
      await this.orderNumberText.waitFor({ state: 'visible', timeout: 15_000 });
      return await this.getText(this.orderNumberText);
    } catch {
      return null;
    }
  }

  async goToHistoryAndClickLatest(): Promise<void> {
    await this.openUrl(config.historyUrl);
    await this.waitForHydration('a[class*="shadow-card-box"]');
    await this.click(this.latestOrderCard);
  }
}
