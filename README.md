# OpenTrip - Tour & Travel Management System (mpipart2)

Aplikasi web *full-stack* modern untuk pemesanan paket wisata (*open trip*) dan penyewaan alat perlengkapan *outdoor*, terintegrasi dengan **Next.js**, **Supabase** (PostgreSQL), **NextAuth.js v5**, dan **Midtrans Payment Gateway**.

---

## 🚀 Fitur Utama

- **Katalog & Pemesanan Open Trip:** Informasi detail paket, kuota sisa, jadwal itinerary, dan pilihan sewa perlengkapan.
- **Autentikasi & RBAC:** Sistem autentikasi berbasis role (Admin dan User) menggunakan NextAuth.js (v5).
- **Dashboard Pengelola (Admin):** Manajemen paket trip (CRUD), inventaris alat (CRUD), dan monitoring transaksi.
- **Payment Gateway Midtrans:** Integrasi Snap token untuk pembayaran instan dan konfirmasi manual via WhatsApp.
- **e-Voucher & Live Polling:** Halaman voucher dengan pembaruan status otomatis tanpa reload.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Actions, React 19)
- **Database:** Supabase (PostgreSQL)
- **Autentikasi:** NextAuth.js (Auth.js v5)
- **Payment Gateway:** Midtrans Client SDK
- **Styling:** CSS Modules / Vanilla CSS dengan pendekatan Modern Glassmorphism

---

## 📦 Menjalankan Proyek Secara Lokal

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment Variables:**
   Buat file `.env.local` dan isi konfigurasi Supabase, NextAuth, serta Midtrans.

3. **Inisialisasi Database:**
   Jalankan query di `supabase/schema.sql` pada SQL Editor Supabase Anda.

4. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
