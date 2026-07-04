export type SchedulerService = {
  id: string
  business_id?: string
  name: string
  price?: number | null
  duration_minutes?: number | null
  is_active?: boolean | null
}

export type AvailabilityRule = {
  id: string
  business_id: string
  day_of_week: string
  open_time: string | null
  close_time: string | null
  is_closed: boolean | null
  slot_duration?: number | null
  created_at?: string | null
}

export type BusinessBreak = {
  id: string
  business_id: string
  day_of_week: string
  start_time: string
  end_time: string
  reason?: string | null
  created_at?: string | null
}

export type BusinessClosure = {
  id: string
  business_id: string
  closure_date: string
  reason?: string | null
  created_at?: string | null
}

export type AvailabilityCheck = {
  available: boolean
  reason?: string
}

export type CreateBookingInput = {
  businessId: string
  customerId: string
  serviceName: string
  bookingTime: string
}

export type CreateBookingResult = {
  success: boolean
  message: string
  booking?: any
  suggestions?: string[]
}