import { formatDateKey, groupEventsByDate } from '../utils/dateUtils'

export const CATEGORY_COLORS = {
  exam: '#ff453a',
  appointment: '#0a84ff',
  birthday: '#bf5af2',
  meeting: '#ff9f0a',
  deadline: '#ffd60a',
  other: '#64d2ff'
}

export default function SidePanel({
  selectedDate,
  events,
  onClose,
  onAddEvent,
  onCompleteEvent,
  onEditEvent,
  loading
}) {
  const displayDate = selectedDate || new Date()
  const eventsByDate = groupEventsByDate(events)
  const dateKey = formatDateKey(displayDate)
  const dayEvents = eventsByDate[dateKey] || []

  const regularEvents = dayEvents.filter(e => !e.is_task)
  const tasks = dayEvents.filter(e => e.is_task)

  // Sort by time
  const sortByTime = (events) => {
    return [...events].sort((a, b) => {
      if (!a.start_time) return 1
      if (!b.start_time) return -1
      return a.start_time.localeCompare(b.start_time)
    })
  }

  const dateStr = displayDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const dayNum = displayDate.getDate()
  const dayName = displayDate.toLocaleString('en-US', { weekday: 'long' })

  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.other
  }

  const formatCategory = (category) => {
    const name = category || 'other'
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Tapping the card opens the edit form, where the event can be deleted
  const renderEvent = (event, isTask) => (
    <div
      key={event.id}
      className={`event-card ${event.completed ? 'completed' : ''}`}
      style={{ '--cat-color': getCategoryColor(event.category) }}
      onClick={() => onEditEvent(event)}
      onKeyDown={(e) => e.key === 'Enter' && onEditEvent(event)}
      role="button"
      tabIndex={0}
    >
      {isTask && (
        <input
          type="checkbox"
          className="schedule-checkbox"
          checked={event.completed || false}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onCompleteEvent(event.id, !event.completed)}
        />
      )}
      <div className="event-card-body">
        <div className="event-card-title">{event.title}</div>
        <div className="event-card-meta">
          {formatCategory(event.category)}
          {event.start_time && ` · ${event.start_time}`}
        </div>
      </div>
      {event.description && (
        <div className="event-card-description">{event.description}</div>
      )}
    </div>
  )

  return (
    <div className="side-panel">
      <div className="panel-header">
        <div className="panel-date">
          <div>
            <div className="panel-date-day">{dayNum}</div>
            <div className="panel-date-info">{dayName}, {displayDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })}</div>
          </div>
          <button
            onClick={onAddEvent}
            className="panel-add-btn"
            title="Add event"
          >
            +
          </button>
        </div>
      </div>

      <div className="schedule-section">
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Regular Events */}
            {regularEvents.length > 0 && (
              <div>
                <div className="section-label">Events</div>
                <div className="event-cards">
                  {sortByTime(regularEvents).map(event => renderEvent(event, false))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <div>
                <div className="section-label">Tasks</div>
                <div className="event-cards">
                  {sortByTime(tasks).map(task => renderEvent(task, true))}
                </div>
              </div>
            )}

            {dayEvents.length === 0 && (
              <div className="empty-state">
                <p>No events or tasks</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="panel-footer" style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', borderTop: '1px solid var(--border-color)' }}>
        <button
          className="btn btn-primary"
          onClick={onAddEvent}
          disabled={loading}
          style={{ width: '100%' }}
        >
          + Add Event
        </button>
      </div>
    </div>
  )
}
