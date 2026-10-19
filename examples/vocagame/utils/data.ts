/**
 * Generator data uji dinamis.
 * Port dari `utils/data_util.py` (Python) ke TypeScript.
 */

/** Email unik berbasis timestamp, diarahkan ke inbox Yopmail. */
export function generateDynamicEmail(prefix = 'automationtestqa'): string {
  return `${prefix}${Date.now()}@yopmail.com`;
}

/** Nomor HP Indonesia acak dengan format 08 + 9 digit. */
export function generateIndonesiaPhone(): string {
  const digits = Math.floor(100_000_000 + Math.random() * 900_000_000);
  return `08${digits}`;
}
