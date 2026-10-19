# VocaGame — Contoh Reverse-Engineering

Contoh nyata penggunaan **pw-testing**: mengubah automation **Python + Selenium + Pytest**
yang sudah ada menjadi **test case CSV** + **Playwright (TypeScript)**.

- Sumber: [DANYVIRGIAN/vocagame-automation-test](https://github.com/DANYVIRGIAN/vocagame-automation-test)
- Target uji: [vocagame.com](https://vocagame.com) (top-up game, locale `id-id`)

---

## 🎯 Kenapa contoh ini ada

Repo sumber berisi automation, tapi **test case-nya tersembunyi di dalam kode** — tidak ada
daftar terpisah, tidak ada ID, tidak ada priorititas. Contoh ini memperlihatkan alurnya:

```
automation Python/Selenium
        │  (reverse-engineer)
        ▼
vocagame-testcases.csv   ← 8 test case terstruktur (level 1)
        │  (pw-testing generate)
        ▼
generated/vocagame.spec.ts   ← skeleton Playwright
        │  (isi pakai POM)
        ▼
specs/vocagame.e2e.spec.ts   ← spec siap jalan (level 2)
```

## 🗂️ Struktur

```
examples/vocagame/
├── vocagame-testcases.csv      # LEVEL 1 — hasil reverse-engineer (8 test case)
├── generated/                  # LEVEL 1 — output pw-testing (skeleton)
│   └── vocagame.spec.ts
├── pages/                      # LEVEL 2 — Page Object Model (port dari Python)
│   ├── base.page.ts            #   ← base_page.py
│   ├── login.page.ts           #   ← login_page.py
│   ├── register.page.ts        #   ← register_page.py
│   ├── order.page.ts           #   ← order_page.py
│   └── forgot-password.page.ts #   ← forgot_password_page.py
├── utils/
│   ├── data.ts                 #   ← data_util.py (email & HP dinamis)
│   └── yopmail.ts              #   ← email_util.py (ambil OTP dari Yopmail)
├── specs/
│   └── vocagame.e2e.spec.ts    # LEVEL 2 — spec lengkap, pakai POM
├── config.ts                   #   ← config.py
├── playwright.config.ts
└── tsconfig.json
```

## 🧪 Test case yang tercakup (8)

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

## 🔄 Pemetaan Selenium → Playwright

| Aspek | Python / Selenium | Playwright (contoh ini) |
|---|---|---|
| Elemen | `driver.find_element(By.XPATH, ...)` | `page.locator(...)` |
| Tunggu | `WebDriverWait` + `time.sleep()` | auto-waiting bawaan |
| Klik terhalang | fallback `execute_script("arguments[0].click()")` | `scrollIntoViewIfNeeded()` + `click()` |
| Elemen responsif | loop cari elemen `is_displayed()` | pseudo-class `:visible` |
| Buka tab baru | `driver.switch_to.new_window('tab')` | `context.newPage()` |
| Iframe email | `switch_to.frame("ifmail")` | `frameLocator('#ifmail')` |
| Fixture | `conftest.py` (`@pytest.fixture`) | fixture bawaan `{ page }` |

## ▶️ Cara menjalankan

```bash
# 1. install browser (sekali saja)
npx playwright install chromium

# 2. jalankan dari root repo
npx playwright test -c examples/vocagame/playwright.config.ts

# atau satu test saja
npx playwright test -c examples/vocagame/playwright.config.ts -g "LOGIN-001"
```

### Regenerate skeleton dari CSV

```bash
npm run gen -- examples/vocagame/vocagame-testcases.csv \
  -o examples/vocagame/generated -n vocagame.spec.ts
```

## ⚙️ Kredensial & konfigurasi

Kredensial akun uji **tidak ditulis di kode** — punya default, tapi bisa ditimpa lewat env:

| Env | Default | Keterangan |
|---|---|---|
| `VOCA_BASE_URL` | `https://vocagame.com` | Base URL |
| `VOCA_LOGIN_EMAIL` | `horegonuoihgc@gmail.com` | Akun untuk tes login |
| `VOCA_FORGOT_EMAIL` | `nuitrooo@yopmail.com` | Akun untuk tes lupa password |
| `VOCA_PASSWORD` | `Password123!` | Password akun uji |
| `VOCA_USER_ID` | `12345678` | User ID Free Fire |

Contoh:

```bash
VOCA_LOGIN_EMAIL=akun@kamu.com VOCA_PASSWORD=Rahasia123! \
  npx playwright test -c examples/vocagame/playwright.config.ts
```

## ⚠️ Catatan

- Test ini menembak **situs produksi** dan **membuat data nyata** (akun baru, pesanan).
  Jalankan hanya bila kamu memang berhak, dan sebaiknya di akun/lingkungan uji.
- Tes OTP bergantung pada **Yopmail** sebagai penyedia inbox (sama seperti repo asal).
- Butuh koneksi internet dan browser Chromium terinstall.
