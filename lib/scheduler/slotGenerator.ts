import { getAvailabilityRule, checkAvailability } from "./availability"

function setTimeOnDate(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number)

  const next = new Date(date)
  next.setHours(hours || 0, minutes || 0, 0, 0)

  return next
}

function addMinutes(date: Date, minutes: number) {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + minutes)
  return next
}

export async function findNextAvailableSlots({
  businessId,
  fromDate = new Date(),
  limit = 3,
}: {
  businessId: string
  fromDate?: Date
  limit?: number
}) {
  const slots: string[] = []

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    if (slots.length >= limit) break

    const date = new Date(fromDate)
    date.setDate(date.getDate() + dayOffset)

    const rule = await getAvailabilityRule({
      businessId,
      date,
    })

    if (!rule || rule.is_closed || !rule.open_time || !rule.close_time) {
      continue
    }

    const slotDuration = rule.slot_duration || 30
    let cursor = setTimeOnDate(date, rule.open_time)
    const close = setTimeOnDate(date, rule.close_time)

    while (cursor < close && slots.length < limit) {
      if (cursor > fromDate) {
        const iso = cursor.toISOString()

        const availability = await checkAvailability({
          businessId,
          bookingTime: iso,
        })

        if (availability.available) {
          slots.push(iso)
        }
      }

      cursor = addMinutes(cursor, slotDuration)
    }
  }

  return slots
}