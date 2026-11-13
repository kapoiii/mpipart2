# MANAJEMEN PROYEK PERANGKAT LUNAK

**OPENTRIP: PERANCANGAN DAN IMPLEMENTASI SISTEM PEMESANAN PAKET WISATA DAN PENYEWAAN ALAT BERBASIS WEB MENGGUNAKAN NEXT.JS, SUPABASE, DAN MIDTRANS**

**Disusun oleh:**  
Kelompok 10
(Silakan isi dengan nama dan NIM anggota kelompok Anda)
- Nama Anggota 1 (NIM)
- Nama Anggota 2 (NIM)
- Nama Anggota 3 (NIM)

**PROGRAM STUDI TEKNIK INFORMATIKA**  
**FAKULTAS ILMU KOMPUTER**  
**UNIVERSITAS PAMULANG**  
**2026**

---

## DAFTAR ISI
**BAB I PENDAHULUAN**
1.1 Latar Belakang
1.2 Rumusan Masalah
1.3 Tujuan Penelitian
1.4 Manfaat Penelitian
1.5 Batasan Masalah

**BAB II TINJAUAN PUSTAKA & METODOLOGI**
2.1 Tinjauan Pustaka
2.2 Metodologi Pengembangan

**BAB III PERANCANGAN DAN IMPLEMENTASI**
3.1 Perancangan Sistem
3.2 Rencana Implementasi

**BAB IV JADWAL KEGIATAN**
4.1 Jadwal Kegiatan

**BAB V ANGGARAN**
5.1 Rencana Anggaran

---

## BAB I: PENDAHULUAN

### 1.1 LATAR BELAKANG
Dalam era digitalisasi pariwisata yang berkembang pesat, kemudahan akses informasi dan transaksi menjadi kunci utama dalam menarik minat wisatawan. Pengelolaan pemesanan paket wisata (open trip) dan penyewaan alat pendakian yang dilakukan secara manual melalui aplikasi pesan singkat (WhatsApp) seringkali tidak terstruktur, rentan terhadap kesalahan pencatatan, dan menyulitkan pemantauan ketersediaan kuota atau stok alat secara *real-time*.

Berdasarkan permasalahan tersebut, bisnis agen perjalanan sering mengalami miskomunikasi dengan pelanggan, kehilangan bukti pembayaran, hingga *overbooking* pada suatu paket wisata. Kondisi ini menuntut adanya sistem informasi terpadu yang dapat mengotomatisasi proses bisnis.

Sebagai solusi, Kelompok 10 merancang dan mengimplementasikan **OpenTrip** — sebuah sistem pemesanan paket wisata dan penyewaan alat perlengkapan berbasis web yang dibangun dengan teknologi *full-stack* modern: **Next.js 14** sebagai framework *front-end* dan *back-end*, **Supabase** (PostgreSQL) sebagai basis data, serta integrasi **Midtrans** sebagai *payment gateway*. Sistem ini dirancang untuk:
1. Memusatkan manajemen pemesanan (booking), kuota trip, dan stok alat.
2. Mengotomatisasi proses pembayaran dan konfirmasi melalui *payment gateway* (Midtrans).
3. Menyediakan *dashboard* admin yang intuitif untuk mengelola transaksi secara efisien.

### 1.2 RUMUSAN MASALAH
1. Bagaimana merancang sistem pemesanan paket wisata (Open Trip) berbasis web yang terintegrasi dengan penyewaan alat tambahan?
2. Bagaimana mengimplementasikan sistem *Role-Based Access Control* (RBAC) untuk membedakan hak akses antara *User* (Pelanggan) dan *Admin*?
3. Bagaimana merancang arsitektur database relasional menggunakan Supabase (PostgreSQL) untuk mengelola entitas relasional antara *User*, *Trip*, *Booking*, dan *Equipment*?
4. Bagaimana mengintegrasikan *payment gateway* Midtrans untuk konfirmasi pembayaran secara otomatis maupun sistem konfirmasi manual via WhatsApp?

### 1.3 TUJUAN PENELITIAN
#### 1.3.1 Tujuan Umum
Merancang dan mengimplementasikan aplikasi web **OpenTrip** sebagai platform pemesanan paket wisata terpadu yang mempermudah pelanggan dalam bertransaksi dan membantu pengelola (admin) dalam memanajemen operasional bisnis.

#### 1.3.2 Tujuan Khusus
1. Membangun katalog paket wisata interaktif dengan validasi kuota sisa secara sistem.
2. Mengimplementasikan autentikasi menggunakan NextAuth.js dan manajemen RBAC (User/Admin).
3. Membangun modul *Dashboard Admin* untuk manajemen data Trip (CRUD), Alat/Equipment (CRUD), dan monitoring Transaksi.
4. Membuat sistem e-Voucher dan riwayat pesanan (*My Bookings*) bagi pelanggan yang dilengkapi fitur *auto-refresh* (polling).
5. Mengintegrasikan layanan Midtrans Snap API untuk pembayaran.

### 1.4 MANFAAT PENELITIAN
#### 1.4.1 Manfaat Teoritis
- Memberikan kontribusi akademis dalam pengembangan aplikasi *full-stack* modern berbasis **Next.js App Router** dan **Supabase**.
- Menjadi referensi implementasi integrasi *Payment Gateway* (Midtrans) pada aplikasi e-commerce pariwisata.

#### 1.4.2 Manfaat Praktis
- **Bagi Pengelola (Admin):** Menyediakan platform terpusat untuk memantau transaksi, mengelola ketersediaan paket/alat, dan menghindari *overbooking*.
- **Bagi Pelanggan:** Mempermudah proses pencarian, pemesanan, dan pembayaran paket wisata dengan pengalaman antarmuka yang modern dan responsif.

### 1.5 BATASAN MASALAH
1. Sistem dikembangkan sebagai aplikasi *web-based* responsif dan tidak mencakup pembuatan aplikasi *native* mobile.
2. Autentikasi sistem menggunakan sistem kredensial bawaan melalui NextAuth.js.
3. Hak akses sistem hanya terbagi menjadi 2 *role*: Admin dan User biasa.
4. Pembayaran menggunakan Midtrans Sandbox (lingkungan testing) sebagai *payment gateway* utama dan opsi konfirmasi manual via WhatsApp.
5. Basis data yang digunakan adalah PostgreSQL yang di-hosting melalui layanan Supabase.

---

## BAB II: TINJAUAN PUSTAKA & METODOLOGI

### 2.1 TINJAUAN PUSTAKA
**2.1.1 Sistem Informasi Pemesanan Pariwisata**
Sistem informasi pariwisata membantu agen perjalanan dalam mendigitalkan proses reservasi. Dengan sistem informasi, validasi kuota pesanan dapat dilakukan otomatis oleh sistem untuk menghindari kelebihan kapasitas (overbooking).

**2.1.2 Next.js sebagai Framework Full-Stack**
Next.js adalah framework React yang mendukung *Server-Side Rendering* (SSR) dan arsitektur *App Router* terbaru. Framework ini memungkinkan pengembangan *front-end* dan pembuatan API internal (API Routes) secara berbarengan dalam satu repositori yang sama.

**2.1.3 Supabase (PostgreSQL)**
Supabase adalah alternatif *open-source* dari Firebase yang menyediakan basis data relasional PostgreSQL. Penggunaan PostgreSQL sangat cocok untuk aplikasi transaksional e-commerce karena mendukung relasi data yang kuat (*Foreign Keys*, *Joins*).

**2.1.4 Midtrans Payment Gateway**
Midtrans adalah layanan penyedia *payment gateway* di Indonesia yang memfasilitasi berbagai metode pembayaran seperti Bank Transfer (Virtual Account), e-Wallet (GoPay, ShopeePay), dan Kartu Kredit.

**2.1.5 UI/UX Design**
Desain antarmuka OpenTrip menggunakan pendekatan *Glassmorphism* ringan dengan paduan warna pastel dan *indigo* untuk memberikan kesan bersih, profesional, dan dapat dipercaya (trustworthy) bagi calon pelanggan.

### 2.2 METODOLOGI PENGEMBANGAN
**2.2.1 Pendekatan Pengembangan**
Proyek ini dikembangkan menggunakan pendekatan *Agile Development* (Scrum) secara iteratif untuk memastikan aplikasi dapat menyesuaikan dengan perubahan *requirements* secara cepat.

**2.2.2 Teknologi yang Digunakan**
- **Front-End:** Next.js 14, React 18, TypeScript, Vanilla CSS (CSS Modules)
- **Back-End:** Next.js API Routes, NextAuth.js (v5)
- **Database:** Supabase (PostgreSQL), Prisma ORM / Supabase Client
- **Payment Gateway:** Midtrans Snap API
- **Icons & UI:** Lucide React

**2.2.3 Tahapan Pengembangan**
1. **Analisis Kebutuhan:** Penentuan alur kerja pemesanan, entitas database, dan persyaratan fungsional sistem.
2. **Perancangan Sistem:** Desain arsitektur database relasional, *wireframing* UI, dan penentuan alur *checkout*.
3. **Implementasi:** Pengkodean modul Autentikasi, Katalog, Dashboard Admin (CRUD), dan integrasi API Midtrans.
4. **Pengujian (Testing):** Uji coba fungsional (UAT) dan simulasi pembayaran Midtrans.
5. **Dokumentasi:** Penyusunan laporan teknis dan makalah proyek.

---

## BAB III: PERANCANGAN SISTEM

### 3.1 PERANCANGAN SISTEM
**3.1.1 Arsitektur Sistem**
Sistem menggunakan pendekatan terpusat di mana *Next.js Server* memediasi antara *Client Browser*, *Supabase Database*, dan layanan eksternal (*Midtrans*). Seluruh proses mutasi data divalidasi di sisi *server/API route*.

**3.1.2 Skema Database Relasional (PostgreSQL)**
Sistem memiliki 4 tabel utama:
1. **users:** Menyimpan data pengguna (id, name, email, password_hash, role='USER'/'ADMIN').
2. **trips:** Menyimpan data paket wisata (id, title, location, start_date, duration, price, quota, image).
3. **equipment:** Menyimpan daftar alat yang disewakan (id, name, rental_price, stock).
4. **bookings:** Menyimpan data transaksi/pemesanan (id, user_id, trip_id, code, total_person, total_price, status, snap_token). Tabel *booking_equipment* menghubungkan alat apa saja yang disewa pada sebuah transaksi booking.

**3.1.3 Struktur Halaman Aplikasi**
- **Public:** Landing Page (`/`), Detail Trip (`/trips/[id]`), Autentikasi (`/login`, `/register`).
- **User Dashboard:** Katalog Pemesanan, e-Voucher (`/booking/[id]/voucher`), Riwayat Pemesanan (`/my-bookings`).
- **Admin Dashboard:** Kelola Trip (`/admin/trips`), Kelola Alat (`/admin/equipment`), dan Transaksi (`/admin/transactions`).

**3.1.4 Mekanisme Auto-Refresh (Polling)**
Untuk halaman *Voucher* dan *Daftar Transaksi*, sistem diimplementasikan dengan *cache-busting API* dan fitur polling berbasis interval (2 detik). Hal ini memastikan status `PENDING` langsung berubah menjadi `CONFIRMED` atau `CANCELLED` secara *live* segera setelah admin memprosesnya.

### 3.2 RENCANA IMPLEMENTASI
**3.2.1 Pembagian Tugas Tim**
*(Dapat disesuaikan)*
- **Anggota 1:** Arsitektur Database (Supabase), Konfigurasi NextAuth, Back-End API (Booking & Trips).
- **Anggota 2:** UI/UX Design, Front-End Development (Landing Page, Katalog Trip, User Dashboard).
- **Anggota 3:** Integrasi Midtrans API, Pembuatan Admin Dashboard (CRUD), Testing.

---

## BAB IV: JADWAL KEGIATAN

### 4.1 JADWAL KEGIATAN
**Minggu 1:** Analisis kebutuhan & perancangan database Supabase.
**Minggu 2:** Inisialisasi proyek Next.js, pembuatan layout dasar, dan setup autentikasi NextAuth.
**Minggu 3:** Implementasi CRUD Admin (Manajemen Paket Trip & Alat).
**Minggu 4:** Implementasi halaman *User* (Katalog, Detail, dan keranjang *booking*).
**Minggu 5:** Integrasi API Pembayaran (Midtrans) dan logika kalkulasi harga.
**Minggu 6:** Implementasi halaman e-Voucher, riwayat pesanan (*My Bookings*), dan fitur auto-refresh.
**Minggu 7:** *Testing*, perbaikan *bug* (Bug Fixing), serta optimasi *caching*.
**Minggu 8:** Penyusunan dokumentasi dan persiapan presentasi akhir.

---

## BAB V: ANGGARAN

### 5.1 RENCANA ANGGARAN
| No | Kebutuhan | Biaya | Keterangan |
|----|-----------|-------|------------|
| 1  | Supabase Free Tier | Rp 0 | Layanan Database PostgreSQL (cukup untuk testing) |
| 2  | Vercel Hosting | Rp 0 | Free tier untuk deployment Next.js |
| 3  | Domain (opsional) | Rp 150.000 | Pembelian domain .com/.id 1 tahun |
| 4  | Midtrans Sandbox | Rp 0 | Free untuk development |
| 5  | Biaya Operasional Tim | Rp 150.000 | Konsumsi & rapat tim |
| **Total** | | **Rp 300.000** | |
