# 11 RPL 1 - Class Website

Selamat datang di website resmi kelas 11 RPL 1! Website ini adalah digital home untuk 37 siswa dengan fitur lengkap untuk kolaborasi, galeri, dan manajemen profil.

**Tagline:** Code. Create. Collaborate.

---

## 📋 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Requirements](#-requirements)
3. [Setup Supabase](#-setup-supabase)
4. [Konfigurasi Website](#-konfigurasi-website)
5. [Menjalankan Website](#-menjalankan-website)
6. [Deploy ke GitHub Pages](#-deploy-ke-github-pages)
7. [Struktur Project](#-struktur-project)
8. [Keamanan](#-keamanan)
9. [Mengelola Data Siswa](#-mengelola-data-siswa)
10. [Troubleshooting](#-troubleshooting)

---

## ✨ Fitur Utama

✅ **Beranda** - Hero section yang menarik dengan statistik kelas
✅ **Student Directory** - Direktori 37 siswa dengan profil modal
✅ **Search** - Pencarian siswa berdasarkan nama atau nomor absen
✅ **Gallery** - Galeri kenangan dengan filter kategori
✅ **Random Zone** - Fitur hiburan (random student, quote, fact, challenge)
✅ **Live Clock** - Jam realtime dan quote otomatis
✅ **Timeline** - Perjalanan kelas
✅ **Authentication** - Login & Register dengan Supabase
✅ **Dashboard** - Personal dashboard untuk setiap siswa
✅ **Profile Management** - Edit profil dan avatar
✅ **Upload Foto** - Upload foto ke galeri kelas
✅ **3 Tema** - Light, Dark (default), dan BLACKPINK
✅ **Responsive** - Kompatibel HP, tablet, dan desktop
✅ **Row Level Security** - Keamanan data dengan RLS

---

## 📦 Requirements

- Browser modern (Chrome, Firefox, Safari, Edge)
- Akun [Supabase](https://supabase.com) (gratis)
- Akun [GitHub](https://github.com) untuk deployment
- Text editor atau IDE
- Koneksi internet

---

## 🚀 Setup Supabase

### 1. Buat Supabase Project

1. Buka [supabase.com](https://supabase.com)
2. Klik **"New project"**
3. Isi form:
   - **Project name**: `11-rpl-1-class`
   - **Database password**: Buat password yang kuat
   - **Region**: Pilih terdekat (Asia Southeast - Singapore recommended)
4. Klik **"Create new project"**
5. Tunggu project selesai dibuat (±2-3 menit)

### 2. Dapatkan URL dan Public Key

Setelah project selesai:

1. Buka menu **Settings** → **API**
2. Copy **Project URL** (contoh: `https://xxxxx.supabase.co`)
3. Copy **Public/Anon Key** (bukan Service Role Key!)
4. Catat kedua nilai ini

### 3. Buat Database Tables

1. Buka **SQL Editor** di sidebar Supabase
2. Klik **"New query"**
3. Copy-paste SQL berikut:

```sql
-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  attendance_number INTEGER UNIQUE NOT NULL CHECK (attendance_number BETWEEN 1 AND 37),
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  quote TEXT,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- GALLERY TABLE
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CREATE INDEXES
CREATE INDEX idx_profiles_attendance ON profiles(attendance_number);
CREATE INDEX idx_gallery_user ON gallery(user_id);
CREATE INDEX idx_gallery_created ON gallery(created_at DESC);
```

4. Klik **"Run"**
5. Tunggu hingga berhasil

### 4. Buat Storage Buckets

1. Buka **Storage** di sidebar Supabase
2. Klik **"Create bucket"**
3. Buat bucket **student-avatars**
   - Public atau Private (disarankan Private)
4. Klik **"Create bucket"** lagi
5. Buat bucket **student-photos**
   - Public atau Private (disarankan Private)

### 5. Aktifkan Row Level Security (RLS)

**PENTING! Ini wajib untuk keamanan data.**

#### A. Enable RLS pada Tabel

1. Buka **Authentication** → **Policies** (atau **Database** → **RLS**)
2. Klik pada tabel **profiles**
3. Klik **"Enable RLS"**
4. Lakukan hal yang sama untuk tabel **gallery**

#### B. Buat Policies untuk Profiles

1. Di tabel **profiles**, klik **"New Policy"**
2. Pilih **"For SELECT (public)"**
3. Klik **"Create policy"**
4. Policy akan dibuat otomatis untuk public read

5. Klik **"New Policy"** lagi
6. Pilih **"For INSERT"**
7. Ubah "Check expression" menjadi:
   ```
   auth.uid() = id
   ```
8. Klik **"Create policy"**

9. Klik **"New Policy"** lagi
10. Pilih **"For UPDATE"**
11. Ubah "Using expression" menjadi:
    ```
    auth.uid() = id
    ```
12. Ubah "With check expression" menjadi:
    ```
    auth.uid() = id
    ```
13. Klik **"Create policy"**

#### C. Buat Policies untuk Gallery

1. Di tabel **gallery**, klik **"New Policy"**
2. Pilih **"For SELECT (public)"** untuk public read

3. Klik **"New Policy"** lagi
4. Pilih **"For INSERT"**
5. Ubah "Check expression" menjadi:
   ```
   auth.uid() = user_id
   ```
6. Klik **"Create policy"**

7. Klik **"New Policy"** lagi
8. Pilih **"For UPDATE"**
9. Ubah "Using expression" menjadi:
   ```
   auth.uid() = user_id
   ```
10. Ubah "With check expression" menjadi:
    ```
    auth.uid() = user_id
    ```
11. Klik **"Create policy"**

12. Klik **"New Policy"** lagi
13. Pilih **"For DELETE"**
14. Ubah "Using expression" menjadi:
    ```
    auth.uid() = user_id
    ```
15. Klik **"Create policy"**

#### D. Setup Storage Policies (Optional)

Jika bucket private, tambahkan policies di Storage untuk upload/download.

---

## 🔧 Konfigurasi Website

### 1. Update Supabase Credentials

1. Buka file `js/supabase.js`
2. Cari bagian ini:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'your_anon_public_key_here';
```

3. Ganti dengan nilai Anda:

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co'; // dari Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciO...'; // public/anon key
```

4. **JANGAN** commit file ini ke Git! Sudah ada di .gitignore.

### 2. Tambahkan Supabase Library

File `index.html`, `login.html`, `register.html`, dan `dashboard.html` perlu menambahkan Supabase library.

Tambahkan ini sebelum `</head>` di masing-masing file:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

Sudah ditambahkan? Bagus!

### 3. (Opsional) Ganti Data Siswa

File `js/students.js` berisi data 37 siswa placeholder.

Untuk mengganti nama siswa:
1. Buka `js/students.js`
2. Edit array `students`
3. Ubah `name: "Siswa XX"` menjadi nama asli
4. Jangan ubah `attendance` dan `id`

```javascript
{
    id: 1,
    name: "Nama Siswa Asli", // Ubah ini
    attendance: "01", // JANGAN ubah
    // ...
}
```

### 4. (Opsional) Ganti Placeholder Foto Siswa

Untuk menambahkan foto siswa:

1. Buat folder `assets/images/students/`
2. Simpan foto dengan nama `student-01.jpg`, `student-02.jpg`, ..., `student-37.jpg`
3. Foto akan otomatis muncul di student directory

Jika foto belum ada, akan menggunakan avatar placeholder dengan nama.

---

## 🌐 Menjalankan Website

### Opsi 1: Menggunakan Live Server (Recommended)

**VS Code:**
1. Install extension **"Live Server"** (by Ritwick Dey)
2. Klik kanan `index.html`
3. Pilih **"Open with Live Server"**
4. Browser akan terbuka di `http://127.0.0.1:5500`

**Atau buka langsung:** Drag-drop `index.html` ke browser

### Opsi 2: Menggunakan Python

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Buka: `http://localhost:8000`

### Opsi 3: Menggunakan Node.js

```bash
npm install -g http-server
http-server
```

---

## 🚀 Deploy ke GitHub Pages

### 1. Buat Repository GitHub

1. Buka [github.com](https://github.com)
2. Klik **"New repository"**
3. Nama repository: `11-rpl-1` atau nama lain
4. Pilih **"Public"**
5. Klik **"Create repository"**

### 2. Siapkan Git

```bash
# Di folder project
cd "c:\website pertama"

# Initialize git
git init

# Add .gitignore
git add .gitignore

# Add files (JANGAN supabase.js dengan credentials)
git add .
git commit -m "Initial commit: 11 RPL 1 class website"

# Add remote
git remote add origin https://github.com/USERNAME/11-rpl-1.git

# Rename branch ke main (jika perlu)
git branch -M main

# Push
git push -u origin main
```

### 3. Aktifkan GitHub Pages

1. Buka repository di GitHub
2. Pergi ke **Settings**
3. Di sidebar, klik **"Pages"**
4. Pilih **Branch**: `main`
5. Pilih **Folder**: `/ (root)`
6. Klik **"Save"**
7. Tunggu 1-2 menit

Website akan tersedia di: `https://USERNAME.github.io/11-rpl-1`

### ⚠️ PENTING: Jangan Expose Credentials

**JANGAN pernah commit file dengan Supabase credentials ke Git!**

Gunakan environment file terpisah:

```bash
# Option 1: Gunakan .env.local (di .gitignore)
# Buka .env.local dan isi:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciO...

# Option 2: Minta developer untuk mengisi js/supabase.js sendiri setelah clone
```

---

## 📂 Struktur Project

```
11-rpl-1/
├── index.html              # Halaman beranda
├── login.html              # Halaman login
├── register.html           # Halaman register
├── dashboard.html          # Halaman dashboard
├── .gitignore              # Git ignore file
├── README.md               # File ini
│
├── css/
│   └── style.css           # Semua styling (3 tema)
│
├── js/
│   ├── supabase.js         # Konfigurasi Supabase
│   ├── students.js         # Data 37 siswa
│   ├── script.js           # Main script (home page)
│   ├── auth.js             # Auth & login/register
│   └── dashboard.js        # Dashboard functionality
│
└── assets/
    └── images/
        └── students/       # Folder foto siswa (opsional)
            ├── student-01.jpg
            ├── student-02.jpg
            └── ...
```

---

## 🔐 Keamanan

### Best Practices

✅ **DO:**
- Gunakan HTTPS di production
- Aktifkan Row Level Security (RLS) di Supabase
- Validasi data di frontend dan backend
- Gunakan strong password
- Regular backup database

❌ **DON'T:**
- Jangan expose service role key
- Jangan simpan password di localStorage
- Jangan trust hanya validasi frontend
- Jangan share credentials di chat/email
- Jangan disable RLS

### Ownership Checks

Semua operasi dilindungi dengan ownership checks:

```javascript
// User hanya bisa edit profile mereka sendiri
WHERE auth.uid() = id

// User hanya bisa hapus foto mereka sendiri
WHERE auth.uid() = user_id
```

---

## 👥 Mengelola Data Siswa

### A. Menambah Siswa Baru

**Manual:**
1. Buka `js/students.js`
2. Tambah entry baru di array `students`
3. Set attendance 1-37 unik
4. Simpan file

**Melalui Register:**
Siswa bisa register sendiri via halaman Register

### B. Mengedit Data Siswa

**Via Supabase Console:**
1. Buka Supabase project
2. Buka **SQL Editor**
3. Update data:

```sql
UPDATE profiles
SET name = 'Nama Baru'
WHERE attendance_number = 1;
```

**Via Dashboard:**
Siswa bisa edit profil sendiri di Dashboard

### C. Backup Database

**Manual Backup:**
1. Buka Supabase project
2. Buka **Database** → **Backups**
3. Klik **"Request a backup"**

**Automatic Backup:**
Supabase otomatis backup harian (Pro plan+)

### D. Reset Database

**HATI-HATI! Ini menghapus semua data!**

1. Buka **Settings** → **Danger Zone**
2. Klik **"Reset database"**
3. Ketik nama project sebagai konfirmasi

---

## 🎨 Customization

### Ubah Warna Tema

File `css/style.css` menggunakan CSS variables:

```css
:root {
    --primary-bg: #0f1419;
    --accent-color: #3b82f6;
    /* ... dll */
}
```

Edit di bagian `:root` atau di theme yang ingin diubah.

### Ubah Quotes/Facts/Challenges

Edit array di `js/students.js`:

```javascript
const quotes = [
    "Masukkan quote baru di sini",
    "Dan tambah lebih banyak"
];

const facts = [
    "Fakta tentang kelas"
];

const challenges = [
    "Tantangan untuk siswa"
];
```

### Ubah Tagline

Cari di `index.html`:
```html
<p class="hero-tagline">Code. Create. Collaborate.</p>
```

---

## 🆘 Troubleshooting

### ❌ "Supabase belum dikonfigurasi"

**Solusi:**
- Pastikan `js/supabase.js` memiliki URL dan key yang benar
- Reload halaman
- Cek console browser (F12) untuk error detail

### ❌ Login/Register tidak bekerja

**Solusi:**
- Supabase library belum ter-load? Tambahkan:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  ```
- Cek apakah email sudah terdaftar
- Cek apakah nomor absen unik (01-37)

### ❌ Upload foto gagal

**Solusi:**
- Storage bucket sudah dibuat?
- File ukuran ≤ 10MB?
- Format file JPG/PNG/WebP?
- Cek RLS policies di Storage

### ❌ Foto tidak muncul di gallery

**Solusi:**
- Gallery diisi dari Supabase (tidak ada data dummy)
- Upload foto dulu via Dashboard
- Cek apakah RLS policy memungkinkan SELECT

### ❌ Theme tidak tersimpan

**Solusi:**
- localStorage aktif di browser?
- Private/Incognito mode? Coba normal mode
- Cek console untuk error

### ❌ GitHub Pages tidak show konten

**Solusi:**
- Repository harus public
- Settings → Pages sudah dikonfigurasi ke main branch
- File index.html ada di root?
- Tunggu 1-5 menit setelah push

### ❌ CORS Error

**Solusi:**
- Supabase URL benar?
- Domain dalam whitelist Supabase? (biasanya sudah default)
- Cek console browser untuk detail error

---

## 📞 Support & Contact

Jika ada masalah atau pertanyaan:

1. Cek Troubleshooting section di atas
2. Baca dokumentasi Supabase: [supabase.com/docs](https://supabase.com/docs)
3. Cek error di browser console (F12)
4. Hubungi admin/guru

---

## 📝 Changelog

### v1.0 (2026-08-31)
- Initial release
- 37 siswa siap
- 3 tema (Light, Dark, BLACKPINK)
- Login/Register dengan Supabase
- Dashboard lengkap
- Gallery dengan upload
- Random Zone features
- Row Level Security enabled

---

## 📄 License

Project ini adalah milik kelas 11 RPL 1.

---

## ❤️ Credits

Dibuat dengan ❤️ oleh 11 RPL 1

**Tagline:** Code. Create. Collaborate.

---

Selamat menggunakan! 🚀
