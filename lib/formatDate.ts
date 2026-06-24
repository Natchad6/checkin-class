const bangkokDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "Asia/Bangkok",
})

const bangkokTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Bangkok",
})

const bangkokKeyFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Bangkok",
})

/**
 * Formats an ISO datetime string into "DD MMM · HH:mm" in Asia/Bangkok timezone.
 */
export const formatDatetime = (isoString: string | null): string => {
  if (!isoString) return "No Date"
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return "Invalid Date"

    const dateStr = bangkokDateFormatter.format(date)
    const timeStr = bangkokTimeFormatter.format(date)
    return `${dateStr} · ${timeStr}`
  } catch {
    return "Invalid Date"
  }
}

/**
 * Formats a start and end datetime into a concise range string.
 * Handles same-day and multi-day events in Asia/Bangkok timezone.
 */
export const formatEventPeriod = (
  startIso: string | null,
  endIso: string | null,
): string => {
  if (!startIso) return "No Date"
  const startStr = formatDatetime(startIso)
  if (!endIso) return startStr

  try {
    const startDate = new Date(startIso)
    const endDate = new Date(endIso)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return startStr

    const isSameDay =
      bangkokKeyFormatter.format(startDate) ===
      bangkokKeyFormatter.format(endDate)

    if (isSameDay) {
      const endFormatted = formatDatetime(endIso)
      const endTime = endFormatted.split(" · ")[1] || ""
      return `${startStr} - ${endTime}`
    } else {
      return `${startStr} - ${formatDatetime(endIso)}`
    }
  } catch {
    return startStr
  }
}
