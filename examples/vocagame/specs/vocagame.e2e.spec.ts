/**
 * VocaGame E2E — versi Playwright.
 *
 * Hasil port dari automation Python/Selenium di
 * https://github.com/DANYVIRGIAN/vocagame-automation-test
 *
 * 8 test case asli dipecah per modul: Login, Register, Order, Lupa Password.
 */
import { expect, test } from '@playwright/test';
import { config } from '../config';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { LoginPage } from '../pages/login.page';
import { OrderPage } from '../pages/order.page';
import { RegisterPage } from '../pages/register.page';
import { generateDynamicEmail, generateIndonesiaPhone } from '../utils/data';

test.describe('VocaGame — Login', () => {
  test('TC-VOCA-LOGIN-001 login berhasil dengan kredensial valid', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginUser(config.loginEmail, config.defaultPassword);

    // Sebelumnya: assert "login" not in driver.current_url
    await expect(page, 'Harus keluar dari halaman login').not.toHaveURL(/login/, {
      timeout: 15_000,
    });
  });

  test('TC-VOCA-LOGIN-002 login gagal saat password salah', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginUser(config.loginEmail, 'PasswordNgawur123!');

    const error = await loginPage.getErrorMessage();
    expect(error, 'Toast error harus tampil').not.toBeNull();
    expect(error!.toLowerCase()).toMatch(/salah|credentials/);
  });

  test('TC-VOCA-LOGIN-003 login gagal saat email tidak terdaftar', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginUser(generateDynamicEmail(), config.defaultPassword);

    const error = await loginPage.getErrorMessage();
    expect(error, 'Toast error harus tampil').not.toBeNull();
    expect(error!.toLowerCase()).toMatch(/tidak ditemukan|not found/);
  });
});

test.describe('VocaGame — Register', () => {
  test('TC-VOCA-REG-001 registrasi baru berhasil sampai verifikasi OTP', async ({ page }) => {
    test.setTimeout(120_000); // OTP via Yopmail butuh waktu

    const registerPage = new RegisterPage(page);
    const email = generateDynamicEmail();
    const phone = generateIndonesiaPhone();

    await registerPage.open();
    await registerPage.registerNewUser('Dany', 'QA', phone, email, config.defaultPassword);
    await registerPage.proceedToOtpPopup();

    const verified = await registerPage.inputOtpVerification(email);
    expect(verified, 'Verifikasi OTP harus berhasil').toBe(true);
  });

  test('TC-VOCA-REG-002 registrasi ditolak saat data sudah terdaftar', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    await registerPage.registerNewUser(
      'User',
      'Kedua',
      config.duplicatePhone,
      config.duplicateEmail,
      config.defaultPassword,
    );

    const error = await registerPage.getErrorMessage();
    expect(error, 'Toast error harus tampil').not.toBeNull();
    expect(error!).toContain('User sudah terdaftar');
  });

  test('TC-VOCA-REG-003 tombol submit nonaktif saat email kosong', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    // Email sengaja dikosongkan
    await registerPage.fillFormData('Test', 'User', '081234567890', '', config.defaultPassword);

    const enabled = await registerPage.isSubmitButtonEnabled();
    expect(enabled, 'Tombol submit harus disabled saat email kosong').toBe(false);
  });
});

test.describe('VocaGame — Order', () => {
  test('TC-VOCA-ORDER-001 nomor pesanan konsisten di History', async ({ page }) => {
    test.setTimeout(120_000);

    const orderPage = new OrderPage(page);
    await orderPage.openFreeFire();
    await orderPage.inputOrderData(config.defaultUserId, 'dany.qa@yopmail.com');
    await orderPage.selectItem5Diamonds();
    await orderPage.selectPaymentQris();
    await orderPage.clickBuyNow();

    const originalOrderId = await orderPage.getOrderNumberFromPaymentPage();
    expect(originalOrderId, 'Order ID harus tampil di halaman pembayaran').not.toBeNull();

    await orderPage.goToHistoryAndClickLatest();
    const historyOrderId = await orderPage.getOrderNumberFromPaymentPage();

    expect(historyOrderId, 'Nomor pesanan di History harus sama').toBe(originalOrderId);
  });
});

test.describe('VocaGame — Lupa Password', () => {
  test('TC-VOCA-FP-001 reset password berhasil melalui OTP email', async ({ page }) => {
    test.setTimeout(120_000);

    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.open();
    await forgotPasswordPage.performForgotPassword(config.forgotPasswordEmail, 'PasswordBaru123!');

    const message = await forgotPasswordPage.getSuccessMessage();
    expect(message, 'Toast sukses harus tampil').not.toBeNull();
  });
});
