# 🏔️ Open Trip & Tour Management System (TypeScript Stack)

Aplikasi berbasis web *fullstack* TypeScript untuk pengelolaan paket wisata *open trip*, penyewaan peralatan *outdoor*, dan sistem pemesanan terintegrasi dengan Payment Gateway (Midtrans Sandbox) serta konfirmasi otomatis via WhatsApp.

---

## 📸 Fitur Utama

### 🧑‍💻 Sisi Pengunjung / User
- **Katalog & Detail Trip:** Pencarian trip, galeri foto, rincian *itinerary* per hari, dan indikator sisa kuota *real-time*.
- **Pemesanan Dynamic & Alat Sewa:** Form booking interaktif dengan opsi *Bawa Peralatan Sendiri* atau *Sewa Peralatan* (pilihan tenda, SB, kompor, dsb.).
- **Calculations Engine:** Kalkulasi total biaya trip + sewa alat secara otomatis di frontend & backend.
- **Midtrans Payment Gateway:** Integrasi Midtrans Snap (QRIS, Virtual Account, E-Wallet) mode Sandbox via Midtrans Node.js Client (TypeScript).
- **E-Voucher & WA Redirect:** Halaman bukti pemesanan lengkap dengan tombol konfirmasi otomatis ke WhatsApp Admin.

### 🛡️ Sisi Pengelola / Admin
- **Main Dashboard:** Ringkasan statistik total booking, pendapatan, dan trip terpopuler.
- **Kelola Paket Trip (CRUD):** Manajemen judul trip, harga, tanggal keberangkatan, kuota, dan *itinerary*.
- **Kelola Master Alat (CRUD):** Manajemen nama alat, harga sewa per unit, dan stok ketersediaan.
- **Kelola Transaksi:** Pemantauan status transaksi (*Pending, Confirmed, Cancelled*) & rincian pesanan.

---

## 🛠️ Tech Stack & Dependencies

- **Language:** TypeScript
- **Runtime:** Node.js / Bun
- **Backend Framework:** Express.js (atau NestJS / Hono)
- **Database & ORM:** PostgreSQL / MySQL + Prisma ORM (atau Drizzle ORM)
- **Frontend Framework:** React / Next.js / Vite + Tailwind CSS
- **Validation:** Zod (Type-safe Schema Validation)
- **Payment Gateway:** `midtrans-client` (Midtrans Node.js SDK)
- **External API:** WhatsApp Click-to-Chat API

---

## 🗄️ Skema Database (Prisma Schema - `prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  USER
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  password  String
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  bookings  Booking[]
}

model Trip {
  id          String       @id @default(uuid())
  title       String
  location    String
  price       Decimal      @db.Decimal(12, 2)
  quota       Int
  startDate   DateTime
  duration    String
  image       String
  description String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  itineraries Itinerary[]
  bookings    Booking[]
}

model Itinerary {
  id        String @id @default(uuid())
  tripId    String
  dayNumber Int
  activity  String
  trip      Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)
}

model Equipment {
  id               String             @id @default(uuid())
  name             String
  rentalPrice      Decimal            @db.Decimal(12, 2)
  stock            Int
  bookingEquipment BookingEquipment[]
}

model Booking {
  id         String             @id @default(uuid())
  userId     String
  tripId     String
  code       String             @unique
  totalPerson Int
  totalPrice Decimal            @db.Decimal(12, 2)
  snapToken  String?
  status     BookingStatus      @default(PENDING)
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt
  user       User               @relation(fields: [userId], references: [id])
  trip       Trip               @relation(fields: [tripId], references: [id])
  equipments BookingEquipment[]
}

model BookingEquipment {
  id           String    @id @default(uuid())
  bookingId    String
  equipmentId  String
  qty          Int
  pricePerItem Decimal   @db.Decimal(12, 2)
  booking      Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  equipment    Equipment @relation(fields: [equipmentId], references: [id])
}