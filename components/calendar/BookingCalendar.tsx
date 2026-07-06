"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Booking,
  CalendarView,
  Slot,
  BusinessService,
} from "./types"
import CalendarToolbar from "./CalendarToolbar"
import BookingGrid from "./BookingGrid"
import BookingSidePanel from "./BookingSidePanel"
import SlotPicker from "./SlotPicker"
import { createManualBooking } from "@/app/dashboard/bookings/actions"

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

  const activeServices = useMemo(() => {
    return services.filter(
      (service) =>
        service.business_id === businessId &&
        service.is_active !== false &&
        Boolean(service.name)
    )
  }, [services, businessId])

  useEffect(() => {
    if (!selectedService && activeServices.length > 0) {
      setSelectedService(activeServices[0].name)
    }
  }, [activeServices, selectedService])

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

    if (!selectedService) {
      alert("Choose a service first.")
      return
    }

    setSaving(true)

    const result = await createManualBooking({
      serviceName: selectedService,
      bookingTime: selectedSlot.iso,
    })

    setSaving(false)

    if (!result.ok) {
      alert(result.error)
      return
    }

    setSelectedSlot(null)
    setSelectedService(activeServices[0]?.name || "")
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

          <CalendarToolbar view={view} setView={setView} />
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
        services={activeServices}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        onSave={createBooking}
        onCancel={() => {
          setSelectedSlot(null)
          setSelectedService(activeServices[0]?.name || "")
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