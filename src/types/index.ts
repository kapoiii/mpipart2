// ============================================================
// Shared TypeScript Types — Open Trip System
// ============================================================

export type UserRole = 'ADMIN' | 'USER'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  title: string
  location: string
  price: number
  quota: number
  start_date: string
  duration: string
  image: string
  description: string
  created_at: string
  updated_at: string
  itineraries?: Itinerary[]
  _bookingsCount?: number
}

export interface Itinerary {
  id: string
  trip_id: string
  day_number: number
  activity: string
}

export interface Equipment {
  id: string
  name: string
  rental_price: number
  stock: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  trip_id: string
  code: string
  total_person: number
  total_price: number
  snap_token?: string | null
  status: BookingStatus
  created_at: string
  updated_at: string
  user?: Pick<User, 'id' | 'name' | 'email'>
  trip?: Pick<Trip, 'id' | 'title' | 'location' | 'start_date' | 'duration' | 'image'>
  equipments?: BookingEquipment[]
}

export interface BookingEquipment {
  id: string
  booking_id: string
  equipment_id: string
  qty: number
  price_per_item: number
  equipment?: Pick<Equipment, 'id' | 'name'>
}

export interface BookingFormData {
  tripId: string
  totalPerson: number
  equipmentItems: { equipmentId: string; qty: number }[]
}

export interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  popularTrips: { title: string; count: number }[]
}

// NextAuth session extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
    }
  }
}
