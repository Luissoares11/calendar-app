import { useState } from 'react'
import { CATEGORY_COLORS } from './SidePanel'
import { formatDateKey } from '../utils/dateUtils'
import { CalendarIcon, TagIcon } from './Icons'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n) => String(n).padStart(2, '0')

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

const formatDate = (dateKey, { withYear = true } = {}) => {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(withYear && { year: 'numeric' })
  })
}

export default function Dashboard({ events, currentDate, onSelectMonth, onSelectEventDate }) {
  const [year, setYear] = useState(currentDate.getFullYear())
  const [section, setSection] = useState(null) // null (options) | 'months' | 'types'
  const [selectedType, setSelectedType] = useState(null)
  const today = new Date()

  // ── Event type view ─────────────────────────────────────────

  if (selectedType) {
    const typeEvents = events
      .filter(e => (e.category || 'other') === selectedType)
      .sort((a, b) => `${a.date} ${a.start_time || ''}`.localeCompare(`${b.date} ${b.start_time || ''}`))

    return (
      <div className="dashboard">
        <div className="dash-year">
          <button onClick={() => setSelectedType(null)} aria-label="Back">◀ Back</button>
          <h2 style={{ color: CATEGORY_COLORS[selectedType] || CATEGORY_COLORS.other }}>
            {capitalize(selectedType)}
          </h2>
          <span className="dash-month-count">{typeEvents.length}</span>
        </div>

        {typeEvents.length === 0 && <p className="dash-month-count">No events of this type.</p>}

        <div className="dash-list">
          {typeEvents.map(e => (
            <button
              key={e.id}
              className="dash-list-item"
              style={{ '--cat-color': CATEGORY_COLORS[selectedType] || CATEGORY_COLORS.other }}
              onClick={() => onSelectEventDate(e.date)}
            >
              <div className="dash-list-date">
                {formatDate(e.date)}
                {e.start_time && <span> · {e.start_time}</span>}
              </div>
              <div className="dash-list-title">
                {e.title}
                {e.is_task && <span className="dash-month-tasks"> {e.completed ? '· done' : '· task'}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (section === 'types') {
    const types = Object.keys(CATEGORY_COLORS).map(type => ({
      type,
      count: events.filter(e => (e.category || 'other') === type).length
    }))

    return (
      <div className="dashboard">
        <div className="dash-year">
          <button onClick={() => setSection(null)} aria-label="Back">◀ Back</button>
          <h2>Event types</h2>
          <span />
        </div>

        <div className="dash-list">
          {types.map(({ type, count }) => (
            <button
              key={type}
              className="dash-list-item dash-type-button"
              style={{ '--cat-color': CATEGORY_COLORS[type] }}
              onClick={() => setSelectedType(type)}
            >
              <span className="dash-list-title">{capitalize(type)}</span>
              <span className="dash-month-count">{count} {count === 1 ? 'event' : 'events'}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Landing options ─────────────────────────────────────────

  if (section === null) {
    const todayKey = formatDateKey(today)
    const endKey = formatDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 29))
    const upcoming = events
      .filter(e => typeof e.date === 'string' && e.date >= todayKey && e.date <= endKey)
      .sort((a, b) => `${a.date} ${a.start_time || ''}`.localeCompare(`${b.date} ${b.start_time || ''}`))

    // Group the upcoming events by day
    const days = []
    upcoming.forEach(e => {
      const last = days[days.length - 1]
      if (last && last.date === e.date) {
        last.events.push(e)
      } else {
        days.push({ date: e.date, events: [e] })
      }
    })

    return (
      <div className="dashboard">
        <div className="dash-greeting">
          <h1>Hello Luis</h1>
          <p>{today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="dash-options">
          <button className="dash-option" onClick={() => setSection('months')}>
            <CalendarIcon />
            <span>Months</span>
          </button>
          <button className="dash-option" onClick={() => setSection('types')}>
            <TagIcon />
            <span>Event types</span>
          </button>
        </div>

        <div className="dash-card">
          <div className="dash-card-title">Next 30 days</div>
          {days.length === 0 && <p className="dash-month-count">Nothing planned.</p>}
          {days.map(day => (
            <div key={day.date} className="dash-day">
              <div className="dash-day-label">{day.date === todayKey ? 'Today · ' : ''}{formatDate(day.date, { withYear: false })}</div>
              {day.events.map(e => (
                <button
                  key={e.id}
                  className="dash-upcoming-item"
                  style={{ '--cat-color': CATEGORY_COLORS[e.category] || CATEGORY_COLORS.other }}
                  onClick={() => onSelectEventDate(e.date)}
                >
                  <span className="dash-upcoming-time">{e.start_time || 'All day'}</span>
                  <span className="dash-upcoming-title">
                    {e.title}
                    {e.is_task && <span className="dash-month-tasks"> {e.completed ? '· done' : '· task'}</span>}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Months overview ─────────────────────────────────────────

  const months = MONTH_NAMES.map((name, index) => {
    const prefix = `${year}-${pad(index + 1)}`
    const monthEvents = events.filter(e => typeof e.date === 'string' && e.date.startsWith(prefix))
    const tasks = monthEvents.filter(e => e.is_task)
    const byType = {}
    monthEvents.forEach(e => {
      const type = e.category || 'other'
      byType[type] = (byType[type] || 0) + 1
    })
    return {
      name,
      index,
      total: monthEvents.length,
      tasks: tasks.length,
      done: tasks.filter(t => t.completed).length,
      byType
    }
  })

  return (
    <div className="dashboard">
      <div className="dash-year">
        <button onClick={() => setSection(null)} aria-label="Back">◀ Back</button>
        <div className="dash-year-nav">
          <button onClick={() => setYear(year - 1)} aria-label="Previous year">◀</button>
          <h2>{year}</h2>
          <button onClick={() => setYear(year + 1)} aria-label="Next year">▶</button>
        </div>
        <span />
      </div>

      <div className="dash-months">
        {months.map(m => {
          const isCurrent = year === today.getFullYear() && m.index === today.getMonth()
          return (
            <button
              key={m.index}
              className={`dash-month ${isCurrent ? 'current' : ''}`}
              onClick={() => onSelectMonth(new Date(year, m.index, 1))}
            >
              <div className="dash-month-name">{m.name}</div>
              <div className="dash-month-count">
                {m.total} {m.total === 1 ? 'event' : 'events'}
              </div>
              {m.tasks > 0 && (
                <div className="dash-month-tasks">{m.done}/{m.tasks} tasks done</div>
              )}
              <div className="dash-chips">
                {Object.entries(m.byType).map(([type, count]) => (
                  <span
                    key={type}
                    className="dash-chip"
                    style={{ '--cat-color': CATEGORY_COLORS[type] || CATEGORY_COLORS.other }}
                  >
                    {count} {type}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
