export type CalendarView = "day" | "week" | "month"

export type BookingStatus =
  | "missing_details"
  | "booked"
  | "completed"
  | "cancelled"

export type Booking = {
  id: string
  business_id: string
  customer_id?: string | null
  service?: string | null
  booking_time?: string | null
  status?: BookingStatus | string | null
  created_at?: string | null
  updated_at?: string | null
}

export type Slot = {
  date: Date
  iso: string
  label: string
}

export type BusinessService = {
  id: string
  business_id?: string
  name: string
  price?: number | null
  duration_minutes?: number | null
  is_active?: boolean | null
}