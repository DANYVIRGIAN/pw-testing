/**
 * Konfigurasi target VocaGame.
 *
 * Nilai sensitif (email akun uji / password) bisa ditimpa lewat environment
 * variable supaya tidak perlu menaruh kredensial di dalam kode.
 */

const BASE_URL = process.env.VOCA_BASE_URL ?? 'https://vocagame.com';

export const config = {
  baseUrl: BASE_URL,

  // --- URL ---
  registerUrl: `${BASE_URL}/id-id/auth/register`,
  loginUrl: `${BASE_URL}/id-id/auth/login`,
  forgotPasswordUrl: `${BASE_URL}/id-id/auth/forgot-password`,
  freeFireUrl: `${BASE_URL}/id-id/free-fire`,
  historyUrl: `${BASE_URL}/id-id/history`,

  // --- Data uji umum ---
  defaultPassword: process.env.VOCA_PASSWORD ?? 'Password123!',
  defaultUserId: process.env.VOCA_USER_ID ?? '12345678',

  // --- Akun uji (timpa lewat env) ---
  loginEmail: process.env.VOCA_LOGIN_EMAIL ?? 'horegonuoihgc@gmail.com',
  forgotPasswordEmail: process.env.VOCA_FORGOT_EMAIL ?? 'nuitrooo@yopmail.com',

  // --- Data duplikat (sudah terdaftar di sistem) ---
  duplicateEmail: 'user_demo_voca@yopmail.com',
  duplicatePhone: '081299998888',

  // --- Yopmail (penyedia inbox untuk OTP) ---
  yopmailUrl: 'https://yopmail.com/',
} as const;

export type VocaConfig = typeof config;
