"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Booking, CalendarView, Slot, BusinessService } from "./types"
import CalendarToolbar from "./CalendarToolbar"
import BookingGrid from "./BookingGrid"
import BookingSidePanel from "./BookingSidePanel"
import SlotPicker from "./SlotPicker"

type Props = {
  bookings: Booking[]
  services: BusinessService[]
  businessId: string
}

export default function BookingCalendar({
  bookings,
  services,
  businessId,
}: Props) {
  const router = useRouter()

  const [view, setView] = useState<CalendarView>("week")
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null)

  const [selectedSlot, setSelectedSlot] =
    useState<Slot | null>(null)

  const [selectedService, setSelectedService] = useState("")
  const [saving, setSaving] = useState(false)

  const scheduled = bookings
    .filter(
      (booking) =>
        booking.booking_time &&
        booking.business_id === businessId
    )
    .sort(
      (a, b) =>
        new Date(a.booking_time!).getTime() -
        new Date(b.booking_time!).getTime()
    )

  function handleEmptySlot(date: Date) {
    setSelectedBooking(null)

    setSelectedSlot({
      date,
      iso: date.toISOString(),
      label: date.toLocaleString(),
    })
  }

  async function createBooking() {
    if (!selectedSlot) return

    if (!businessId) {
      alert("Missing business ID. Refresh the page and try again.")
      return
    }

    const validService = services.find(
      (service) =>
        service.name === selectedService &&
        service.is_active !== false
    )

    if (!validService) {
      alert("Invalid service. Please choose a service the business provides.")
      return
    }

    setSaving(true)

    const { data: manualCustomer, error: customerError } =
      await supabase
        .from("customers")
        .select("id")
        .eq("business_id", businessId)
        .eq("phone_number", "manual-booking")
        .maybeSingle()

    if (customerError) {
      setSaving(false)
      alert(customerError.message)
      return
    }

    if (!manualCustomer) {
      setSaving(false)
      alert("Manual booking customer not found for this business.")
      return
    }

    const { data: conflict, error: conflictError } =
      await supabase
        .from("bookings")
        .select("id")
        .eq("business_id", businessId)
        .eq("booking_time", selectedSlot.iso)
        .eq("status", "booked")
        .maybeSingle()

    if (conflictError) {
      setSaving(false)
      alert(conflictError.message)
      return
    }

    if (conflict) {
      setSaving(false)
      alert("That time is already booked.")
      return
    }

    const { error } = await supabase
      .from("bookings")
      .insert({
        business_id: businessId,
        customer_id: manualCustomer.id,
        service: validService.name,
        booking_time: selectedSlot.iso,
        status: "booked",
      })

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    setSelectedSlot(null)
    setSelectedService("")
    router.refresh()
  }

  return (
    <div className="mt-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Booking Calendar
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Click a booking to edit it, or click an empty slot to create one.
            </p>
          </div>

          <CalendarToolbar
            view={view}
            setView={setView}
          />
        </div>

        <div className="mt-6">
          <BookingGrid
            bookings={scheduled}
            view={view}
            onSelect={(booking) => {
              if (booking.business_id !== businessId) {
                alert("This booking does not belong to your business.")
                return
              }

              setSelectedSlot(null)
              setSelectedBooking(booking)
            }}
            onEmptySlot={handleEmptySlot}
          />
        </div>
      </div>

      <SlotPicker
        selectedSlot={selectedSlot}
        services={services}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        onSave={createBooking}
        onCancel={() => {
          setSelectedSlot(null)
          setSelectedService("")
        }}
        saving={saving}
      />

      <BookingSidePanel
  booking={selectedBooking}
  businessId={businessId}
  onClose={() => setSelectedBooking(null)}
/>
    </div>
  )
}