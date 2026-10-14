import { useState, useRef } from 'react'
import { getMonthDates, isSameDay, isToday, formatDateKey, groupEventsByDate, getMonthYearString } from '../utils/dateUtils'

const CATEGORY_COLORS = {
  exam: 'purple',
  appointment: 'green',
  birthday: 'red',
  meeting: 'orange',
  deadline: 'red',
  other: 'cyan'
}

export default function MonthGrid({ currentDate, selectedDate, onDateSelect, events, onPrevMonth, onNextMonth, onDateChange }) {
  const [showPicker, setShowPicker] = useState(false)
  const [pickerMonth, setPickerMonth] = useState(currentDate.getMonth())
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear())
  const titleRef = useRef(null)
  const dates = getMonthDates(currentDate)
  const eventsByDate = groupEventsByDate(events)

  const getEventsForDate = (date) => {
    const key = formatDateKey(date)
    return eventsByDate[key] || []
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear()
  }

  const getCategoryColor = (event) => {
    return CATEGORY_COLORS[event.category] || 'cyan'
  }

  const handlePickerConfirm = () => {
    const newDate = new Date(pickerYear, pickerMonth, 1)
    if (onDateChange) {
      onDateChange(newDate)
    }
    setShowPicker(false)
  }

  const monthParts = getMonthYearString(currentDate).split(' ')
  const month = monthParts[0]
  const year = monthParts[1]

  return (
    <div className="month-grid">
      <div className="month-grid-header">
        <button onClick={onPrevMonth} title="Previous month">◀</button>
        <div
          ref={titleRef}
          className="month-grid-title"
          onClick={() => setShowPicker(true)}
          style={{ cursor: 'pointer' }}
        >
          {month} <span>{year}</span>
        </div>
        <button onClick={onNextMonth} title="Next month">▶</button>
      </div>

      {showPicker && (
        <div
          className="date-picker-overlay"
          onClick={() => setShowPicker(false)}
          style={{
            left: titleRef.current ? `${titleRef.current.getBoundingClientRect().left + titleRef.current.getBoundingClientRect().width / 2}px` : '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="date-picker" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Select Month & Year</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Month Picker */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Month</label>
                <select
                  value={pickerMonth}
                  onChange={(e) => setPickerMonth(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: '0.65rem',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year Picker */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Year</label>
                <select
                  value={pickerYear}
                  onChange={(e) => setPickerYear(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: '0.65rem',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {Array.from({ length: 20 }, (_, i) => currentDate.getFullYear() - 10 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={handlePickerConfirm}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--accent)',
                  color: 'var(--bg-base)',
                  border: 'none',
                  borderRadius: '0.65rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                OK
              </button>
              <button
                onClick={() => setShowPicker(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--bg-tertiary)',
                  borderRadius: '0.65rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="weekdays">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      <div className="days-grid">
        {dates.map((date, idx) => {
          const dateEvents = getEventsForDate(date)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isCurrentDay = isToday(date)
          const isOtherMonth = !isCurrentMonth(date)

          return (
            <div
              key={idx}
              className={`day-cell ${isOtherMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => !isOtherMonth && onDateSelect(date)}
              role="button"
              tabIndex={isOtherMonth ? -1 : 0}
              onKeyPress={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isOtherMonth) {
                  onDateSelect(date)
                }
              }}
            >
              <div className="day-number">{date.getDate()}</div>
              {dateEvents.length > 0 && (
                <div className="day-indicators">
                  {dateEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={`event-dot ${getCategoryColor(event)}`}
                      title={event.title}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
