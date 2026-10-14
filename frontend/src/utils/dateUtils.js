/**
 * Get the number of days in a month
 */
export function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Get the day of week the month starts on (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

/**
 * Get all dates needed to fill a month grid (including previous/next month padding)
 */
export function getMonthDates(date) {
  const daysInMonth = getDaysInMonth(date)
  const firstDay = getFirstDayOfMonth(date)
  const dates = []

  // Add previous month's trailing days
  const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0)
  const daysInPrevMonth = getDaysInMonth(prevMonth)
  for (let i = firstDay - 1; i >= 0; i--) {
    dates.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i))
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(date.getFullYear(), date.getMonth(), day))
  }

  // Add next month's leading days to fill the grid
  const remainingCells = 42 - dates.length // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    dates.push(new Date(date.getFullYear(), date.getMonth() + 1, day))
  }

  return dates
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Check if a date is today
 */
export function isToday(date) {
  return isSameDay(date, new Date())
}

/**
 * Group events by date
 */
export function groupEventsByDate(events) {
  const grouped = {}
  events.forEach(event => {
    // Handle both ISO date strings and YYYY-MM-DD format
    let dateKey
    if (typeof event.date === 'string' && event.date.length === 10 && event.date.includes('-')) {
      // Already in YYYY-MM-DD format
      dateKey = event.date
    } else {
      // Try to parse as Date
      try {
        dateKey = new Date(event.date).toISOString().split('T')[0]
      } catch {
        // If it fails, skip this event
        return
      }
    }
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(event)
  })
  return grouped
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get month and year as string
 */
export function getMonthYearString(date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}
