# pw-testing

Automation E2E untuk **[vocagame.com](https://vocagame.com)** — ditulis dengan
**TypeScript + Playwright**.

Proyek ini adalah **port** dari automation sebelumnya yang memakai **Python + Selenium + Pytest**
([repo asal](https://github.com/DANYVIRGIAN/vocagame-automation-test)), lalu ditulis ulang
ke stack modern.

---

## 🧪 Cakupan test (8 test case)

| ID | Test Case | Jenis |
|---|---|---|
| TC-VOCA-LOGIN-001 | Login berhasil (kredensial valid) | Positive |
| TC-VOCA-LOGIN-002 | Login gagal — password salah | Negative |
| TC-VOCA-LOGIN-003 | Login gagal — email tidak terdaftar | Negative |
| TC-VOCA-REG-001 | Registrasi berhasil + verifikasi OTP | Positive |
| TC-VOCA-REG-002 | Registrasi ditolak — data duplikat | Negative |
| TC-VOCA-REG-003 | Tombol submit nonaktif saat email kosong | Negative |
| TC-VOCA-ORDER-001 | Order Free Fire → nomor pesanan konsisten di History | Positive |
| TC-VOCA-FP-001 | Reset password via OTP email | Positive |

Rincian lengkap tiap test case (precondition, langkah, hasil yang diharapkan) ada di
[`vocagame/vocagame-testcases.csv`](./vocagame/vocagame-testcases.csv).

---

## ⚠️ Penting: test ini menembak produksi

Semua test berjalan langsung ke **vocagame.com**, bukan server staging. Konsekuensinya:

- **Ada proteksi anti-bot.** Beberapa percobaan login berturut-turut akan memicu balasan
  *"Kami mendeteksi aktivitas yang tidak biasa di akun Anda. Demi keamanan, akses sementara dibatasi."*
  Bila itu muncul, test login akan gagal bukan karena bug — tunggu beberapa menit lalu jalankan lagi.
  **Jangan** pakai `--repeat-each` untuk test login.
- **Test membuat data nyata.** `TC-VOCA-REG-001` membuat akun asli, `TC-VOCA-ORDER-001` membuat
  pesanan asli.
- **`TC-VOCA-FP-001` mengganti password akun** `nuitrooo@yopmail.com` menjadi `PasswordBaru123!`.
  Jalankan test ini hanya kalau memang disengaja.
- Untuk demo, `TC-VOCA-REG-003` (tombol submit nonaktif saat email kosong) adalah yang paling aman —
  tidak mengirim data apa pun ke server.

## ✨ Yang ditonjolkan

- **Page Object Model** — pemisahan locator & aksi (`vocagame/pages/`) dari skenario (`vocagame/specs/`)
- **Verifikasi OTP otomatis** — ambil kode dari inbox Yopmail lewat `frameLocator`, dengan retry
- **Data uji dinamis** — email berbasis timestamp & nomor HP acak, agar tiap run tidak bentrok
- **Kredensial lewat environment variable** — tidak ada akun tertulis di dalam kode
- **Auto-waiting Playwright** — menggantikan `WebDriverWait` + `time.sleep()` di versi Selenium
- **Anti-flaky** — menunggu hidrasi React & menunggu toast benar-benar tampil, bukan `sleep`

## 🗂️ Struktur

```
pw-testing/
├── vocagame/
│   ├── vocagame-testcases.csv      # dokumentasi 8 test case
│   ├── config.ts                   # URL target + data uji (bisa ditimpa env)
│   ├── pages/                      # Page Object Model
│   │   ├── base.page.ts
│   │   ├── login.page.ts
│   │   ├── register.page.ts
│   │   ├── order.page.ts
│   │   └── forgot-password.page.ts
│   ├── utils/
│   │   ├── data.ts                 # email & nomor HP dinamis
│   │   └── yopmail.ts              # pengambil OTP dari Yopmail
│   ├── specs/
│   │   └── vocagame.e2e.spec.ts    # 8 test siap jalan
│   ├── playwright.config.ts
│   └── tsconfig.json
├── package.json
└── README.md
```

## 🚀 Cara menjalankan

```bash
# 1. install dependency
npm install

# 2. install browser (sekali saja)
npm run browsers:install

# 3. jalankan semua test
npm test

# menjalankan satu test saja
npm test -- -g "LOGIN-001"

# mode interaktif (UI mode)
npm run test:ui

# lihat laporan HTML terakhir
npm run test:report
```

## ⚙️ Konfigurasi & kredensial

Kredensial akun uji **tidak ditulis di dalam kode** — ada default-nya, tapi bisa ditimpa
lewat environment variable:

| Env | Default | Keterangan |
|---|---|---|
| `VOCA_BASE_URL` | `https://vocagame.com` | Base URL target |
| `VOCA_LOGIN_EMAIL` | `horegonuoihgc@gmail.com` | Akun untuk tes login |
| `VOCA_FORGOT_EMAIL` | `nuitrooo@yopmail.com` | Akun untuk tes lupa password |
| `VOCA_PASSWORD` | `Password123!` | Password akun uji |
| `VOCA_USER_ID` | `12345678` | User ID Free Fire |

Contoh:

```bash
VOCA_LOGIN_EMAIL=akun@kamu.com VOCA_PASSWORD=Rahasia123! npm test
```

## 🔄 Pemetaan Selenium → Playwright

| Aspek | Python / Selenium | Playwright |
|---|---|---|
| Mencari elemen | `driver.find_element(By.XPATH, ...)` | `page.locator(...)` |
| Elemen kembar (layout desktop + mobile) | `find_element` diam-diam ambil yang pertama; kalau salah, perlu loop `is_displayed()` | `loc()` di `BasePage` — saring `:visible` lalu ambil yang pertama. Playwright melempar *strict mode violation* bila satu locator cocok ke banyak elemen |
| Menunggu elemen | `WebDriverWait` + `time.sleep()` | auto-waiting bawaan |
| Menunggu SPA siap (hidrasi) | `time.sleep()` besar, tetap rawan flaky | `waitForHydration()` — tunggu properti `__reactFiber$` muncul, penanda React sudah aktif |
| Menunggu pesan toast | `time.sleep()` lalu baca elemen | `waitForToast()` — tunggu toast terlihat, baru dibaca |
| Klik terhalang elemen lain | fallback `execute_script("arguments[0].click()")` | `scrollIntoViewIfNeeded()` + `click()` |
| Buka tab baru | `driver.switch_to.new_window('tab')` | `context.newPage()` |
| Masuk iframe email | `switch_to.frame("ifmail")` | `frameLocator('#ifmail')` |
| Fixture browser | `conftest.py` (`@pytest.fixture`) | fixture bawaan `{ page }` |

## 📝 Lisensi

MIT
