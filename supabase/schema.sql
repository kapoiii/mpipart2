-- ============================================================
-- Open Trip & Tour Management System — Supabase SQL Schema
-- Jalankan ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'USER',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: trips
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  location    TEXT NOT NULL,
  price       DECIMAL(12,2) NOT NULL,
  quota       INT NOT NULL,
  start_date  TIMESTAMPTZ NOT NULL,
  duration    TEXT NOT NULL,
  image       TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: itineraries
-- ============================================================
CREATE TABLE IF NOT EXISTS itineraries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number  INT NOT NULL,
  activity    TEXT NOT NULL
);

-- ============================================================
-- Table: equipment
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  rental_price  DECIMAL(12,2) NOT NULL,
  stock         INT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id),
  trip_id       UUID NOT NULL REFERENCES trips(id),
  code          TEXT UNIQUE NOT NULL,
  total_person  INT NOT NULL,
  total_price   DECIMAL(12,2) NOT NULL,
  snap_token    TEXT,
  status        booking_status NOT NULL DEFAULT 'PENDING',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: booking_equipment
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_equipment (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id     UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id   UUID NOT NULL REFERENCES equipment(id),
  qty            INT NOT NULL,
  price_per_item DECIMAL(12,2) NOT NULL
);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_trips_updated_at    BEFORE UPDATE ON trips    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS (Row Level Security) — DISABLE untuk simplicity dev
-- (Enable & buat policies jika ingin production-grade)
-- ============================================================
ALTER TABLE users    DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips    DISABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings  DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_equipment DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Seed: Admin user (password: admin123 - bcrypt hash)
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@opentrip.id', '$2b$12$4CZ.VFgr.9HhkFKU6syGyelu6dWg5enppLOxGwu8RBLem/MZbJuOK', 'ADMIN')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- ============================================================
-- Seed: Sample trips
-- ============================================================
INSERT INTO trips (title, location, price, quota, start_date, duration, image, description) VALUES
  ('Open Trip Rinjani 3H2M', 'Lombok, NTB', 1250000, 20, '2026-10-15 08:00:00+07', '3 Hari 2 Malam',
   'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
   'Pendakian Gunung Rinjani via Sembalun dengan pemandangan Danau Segara Anak yang menakjubkan. Termasuk guide, porter, tenda, dan konsumsi.'),
  ('Open Trip Bromo Sunrise', 'Probolinggo, Jawa Timur', 650000, 30, '2026-10-20 02:00:00+07', '2 Hari 1 Malam',
   'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=800',
   'Menyaksikan sunrise spektakuler di kawah Gunung Bromo. Termasuk jeep 4WD, guide lokal, dan tiket masuk TNBTS.'),
  ('Open Trip Prau 2H1M', 'Wonosobo, Jawa Tengah', 450000, 25, '2026-10-25 05:00:00+07', '2 Hari 1 Malam',
   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
   'Pendakian Gunung Prau dengan lautan awan dan pemandangan 7 gunung dari puncak. Cocok untuk pemula.');

-- ============================================================
-- Seed: Itineraries
-- ============================================================
WITH rinjani AS (SELECT id FROM trips WHERE title = 'Open Trip Rinjani 3H2M' LIMIT 1)
INSERT INTO itineraries (trip_id, day_number, activity)
SELECT id, 1, 'Kumpul di Bandara Lombok / Meeting Point Sembalun. Registrasi & briefing pendakian. Mulai trek ke Pos 1 Sembalun.' FROM rinjani
UNION ALL SELECT id, 2, 'Trek menuju Pelawangan Sembalun (2.639 mdpl). Summit attack dini hari ke Puncak Rinjani (3.726 mdpl). Descend ke Danau Segara Anak.' FROM rinjani
UNION ALL SELECT id, 3, 'Menikmati pemandian air panas Danau Segara Anak. Descend via jalur Senaru. Kembali ke penginapan & pulang.' FROM rinjani;

WITH bromo AS (SELECT id FROM trips WHERE title = 'Open Trip Bromo Sunrise' LIMIT 1)
INSERT INTO itineraries (trip_id, day_number, activity)
SELECT id, 1, 'Keberangkatan dari Surabaya/Malang. Tiba di basecamp Probolinggo. Istirahat & persiapan.' FROM bromo
UNION ALL SELECT id, 2, 'Berangkat pukul 02.00 dengan jeep ke penanjakan 1. Menyaksikan golden sunrise Bromo. Kunjungi kawah & Bukit Teletubbies. Perjalanan pulang.' FROM bromo;

-- ============================================================
-- Seed: Equipment
-- ============================================================
INSERT INTO equipment (name, rental_price, stock) VALUES
  ('Tenda Dome 2P', 75000, 15),
  ('Sleeping Bag', 35000, 30),
  ('Carrier 60L', 50000, 20),
  ('Kompor Portable + Gas', 25000, 25),
  ('Matras Gunung', 15000, 30),
  ('Headlamp', 20000, 25),
  ('Trekking Pole (pair)', 30000, 20),
  ('Rain Coat / Poncho', 20000, 30);
