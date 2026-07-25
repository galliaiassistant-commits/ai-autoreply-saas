"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function BookingSetup({
  businessId,
  onNext,
  onBack,
}: {
  businessId: string
  onNext: () => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)

  const [bookingEnabled, setBookingEnabled] = useState(true)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [appointmentDuration, setAppointmentDuration] =
    useState(30)
  const [bufferTime, setBufferTime] =
    useState(0)
  const [advanceBookingDays, setAdvanceBookingDays] =
    useState(30)
  const [sameDayBookings, setSameDayBookings] =
    useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    if (!businessId) return

    const { data } = await supabase
      .from("businesses")
      .select(
        `
        booking_enabled,
        requires_booking_approval,
        appointment_duration,
        booking_buffer,
        advance_booking_days,
        allow_same_day_bookings
      `
      )
      .eq("id", businessId)
      .single()

    if (!data) return

    setBookingEnabled(
      data.booking_enabled ?? true
    )

    setRequiresApproval(
      data.requires_booking_approval ?? false
    )

    setAppointmentDuration(
      data.appointment_duration ?? 30
    )

    setBufferTime(
      data.booking_buffer ?? 0
    )

    setAdvanceBookingDays(
      data.advance_booking_days ?? 30
    )

    setSameDayBookings(
      data.allow_same_day_bookings ?? true
    )
  }

  async function saveAndContinue() {
    setLoading(true)

    const { error } = await supabase
      .from("businesses")
      .update({
        booking_enabled: bookingEnabled,
        requires_booking_approval:
          requiresApproval,
        appointment_duration:
          appointmentDuration,
        booking_buffer: bufferTime,
        advance_booking_days:
          advanceBookingDays,
        allow_same_day_bookings:
          sameDayBookings,
      })
      .eq("id", businessId)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    onNext()
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">

      <h2 className="text-2xl font-bold mb-2">
        Booking Settings
      </h2>

      <p className="text-gray-500 mb-8">
        Configure how customers book
        appointments with your business.
      </p>

      <div className="space-y-6">

        <label className="flex items-center justify-between">
          <span>
            Enable Online Bookings
          </span>

          <input
            type="checkbox"
            checked={bookingEnabled}
            onChange={(e) =>
              setBookingEnabled(
                e.target.checked
              )
            }
          />
        </label>

        <label className="flex items-center justify-between">
          <span>
            Require Manual Approval
          </span>

          <input
            type="checkbox"
            checked={requiresApproval}
            onChange={(e) =>
              setRequiresApproval(
                e.target.checked
              )
            }
          />
        </label>

        <div>
          <label className="block mb-2 font-medium">
            Appointment Duration (minutes)
          </label>

          <input
            type="number"
            min={5}
            value={appointmentDuration}
            onChange={(e) =>
              setAppointmentDuration(
                Number(e.target.value)
              )
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Buffer Between Appointments
            (minutes)
          </label>

          <input
            type="number"
            min={0}
            value={bufferTime}
            onChange={(e) =>
              setBufferTime(
                Number(e.target.value)
              )
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Maximum Advance Booking
            (days)
          </label>

          <input
            type="number"
            min={1}
            value={advanceBookingDays}
            onChange={(e) =>
              setAdvanceBookingDays(
                Number(e.target.value)
              )
            }
            className="w-full border rounded-lg p-3"
          />
        </div>

        <label className="flex items-center justify-between">
          <span>
            Allow Same-Day Bookings
          </span>

          <input
            type="checkbox"
            checked={sameDayBookings}
            onChange={(e) =>
              setSameDayBookings(
                e.target.checked
              )
            }
          />
        </label>

      </div>

      <div className="flex justify-between mt-10">

        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border"
        >
          Back
        </button>

        <button
          onClick={saveAndContinue}
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white"
        >
          {loading
            ? "Saving..."
            : "Continue"}
        </button>

      </div>

    </div>
  )
}