import { getMonthYearString } from '../utils/dateUtils'

export default function Header({ currentDate, onPrevMonth, onNextMonth, onAddEvent, onSearch, loading, demoMode }) {
  const monthParts = getMonthYearString(currentDate).split(' ')
  const month = monthParts[0]
  const year = monthParts[1]

  return (
    <header className="header">
      <div className="header-nav">
        <button
          onClick={onPrevMonth}
          title="Previous month"
          disabled={loading}
          aria-label="Previous month"
        >
          ◀
        </button>
        <h1 className="header-title">
          {month} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{year}</span>
        </h1>
        <button
          onClick={onNextMonth}
          title="Next month"
          disabled={loading}
          aria-label="Next month"
        >
          ▶
        </button>
      </div>
      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onSearch}
          title="Search events"
          disabled={loading}
          aria-label="Search"
        >
          🔍
        </button>
        <button
          className="header-btn primary"
          onClick={onAddEvent}
          title="Add new event"
          disabled={loading}
          aria-label="Add event"
        >
          ➕
        </button>
      </div>
    </header>
  )
}
