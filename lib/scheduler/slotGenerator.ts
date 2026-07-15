import {
  getAvailabilityRule,
  checkAvailability,
} from "./availability"
import {
  getBusinessTimezone,
  getZonedParts,
  localDateTimeToUtc,
} from "./timezone"

export async function findNextAvailableSlots({
  businessId,
  fromDate = new Date(),
  durationMinutes = 30,
  limit = 3,
}: {
  businessId: string
  fromDate?: Date
  durationMinutes?: number
  limit?: number
}) {
  const slots: string[] = []
  const timeZone =
    await getBusinessTimezone(businessId)

  const startParts =
    getZonedParts(fromDate, timeZone)

  for (
    let dayOffset = 0;
    dayOffset < 14;
    dayOffset++
  ) {
    if (slots.length >= limit) break

    const calendarDate = new Date(
      Date.UTC(
        startParts.year,
        startParts.month - 1,
        startParts.day + dayOffset,
        12
      )
    )

    const dayParts =
      getZonedParts(calendarDate, timeZone)

    const dayDate = localDateTimeToUtc({
      year: dayParts.year,
      month: dayParts.month,
      day: dayParts.day,
      hour: 12,
      minute: 0,
      timeZone,
    })

    const rule = await getAvailabilityRule({
      businessId,
      date: dayDate,
    })

    if (
      !rule ||
      rule.is_closed ||
      !rule.open_time ||
      !rule.close_time
    ) {
      continue
    }

    const [openHour, openMinute] =
      rule.open_time.split(":").map(Number)

    const [closeHour, closeMinute] =
      rule.close_time.split(":").map(Number)

    const openTotal =
      openHour * 60 + openMinute

    const closeTotal =
      closeHour * 60 + closeMinute

    const slotDuration =
      rule.slot_duration || 30

    for (
      let minute = openTotal;
      minute + durationMinutes <= closeTotal;
      minute += slotDuration
    ) {
      const slot = localDateTimeToUtc({
        year: dayParts.year,
        month: dayParts.month,
        day: dayParts.day,
        hour: Math.floor(minute / 60),
        minute: minute % 60,
        timeZone,
      })

      if (slot <= fromDate) {
        continue
      }

      const availability =
        await checkAvailability({
          businessId,
          bookingTime: slot.toISOString(),
          durationMinutes,
        })

      if (availability.available) {
        slots.push(slot.toISOString())
      }

      if (slots.length >= limit) {
        return slots
      }
    }
  }

  return slots
}