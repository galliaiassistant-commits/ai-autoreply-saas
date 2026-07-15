import { supabaseAdmin as supabase } from "@/lib/supabase/admin"

export const DEFAULT_TIMEZONE = "America/Jamaica"

export async function getBusinessTimezone(
  businessId: string
) {
  const { data, error } = await supabase
    .from("businesses")
    .select("timezone")
    .eq("id", businessId)
    .maybeSingle()

  if (error) {
    console.error(
      "GET BUSINESS TIMEZONE ERROR:",
      error
    )
  }

  const timezone = data?.timezone

  if (
    typeof timezone === "string" &&
    isValidTimeZone(timezone)
  ) {
    return timezone
  }

  return DEFAULT_TIMEZONE
}

export function isValidTimeZone(
  value: string
) {
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: value,
    }).format(new Date())

    return true
  } catch {
    return false
  }
}

export function getZonedParts(
  date: Date,
  timeZone: string
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || ""

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    weekday: getPart("weekday"),
    hour: Number(getPart("hour")),
    minute: Number(getPart("minute")),
    second: Number(getPart("second")),
  }
}

export function localDateTimeToUtc({
  year,
  month,
  day,
  hour,
  minute,
  second = 0,
  timeZone,
}: {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second?: number
  timeZone: string
}) {
  const targetAsUtc = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  )

  let estimate = new Date(targetAsUtc)

  for (let attempt = 0; attempt < 4; attempt++) {
    const rendered = getZonedParts(
      estimate,
      timeZone
    )

    const renderedAsUtc = Date.UTC(
      rendered.year,
      rendered.month - 1,
      rendered.day,
      rendered.hour,
      rendered.minute,
      rendered.second
    )

    const difference =
      targetAsUtc - renderedAsUtc

    if (difference === 0) {
      return estimate
    }

    estimate = new Date(
      estimate.getTime() + difference
    )
  }

  return estimate
}