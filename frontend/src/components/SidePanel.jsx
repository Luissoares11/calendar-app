import { formatDateKey, groupEventsByDate } from '../utils/dateUtils'
import { useState } from 'react'

const CATEGORY_COLORS = {
  exam: 'purple',
  appointment: 'green',
  birthday: 'red',
  meeting: 'orange',
  deadline: 'red',
  other: 'cyan'
}

export default function SidePanel({
  selectedDate,
  events,
  onClose,
  onAddEvent,
  onCompleteEvent,
  onDeleteEvent,
  onEditEvent,
  loading
}) {
  const [confirmDelete, setConfirmDelete] = useState(null)

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

  const handleDeleteConfirm = async (eventId, eventTitle) => {
    setConfirmDelete(null)
    try {
      await onDeleteEvent(eventId, eventTitle)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || 'cyan'
  }

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
              <>
                <div>
                  <div className="section-label">Events</div>
                  <div className="schedule-list">
                    {sortByTime(regularEvents).map((event, idx) => (
                      <div
                        key={event.id}
                        className="schedule-item"
                        onContextMenu={(e) => {
                          e.preventDefault()
                          setConfirmDelete(confirmDelete === event.id ? null : event.id)
                        }}
                      >
                        {event.start_time && (
                          <div className="schedule-time">{event.start_time}</div>
                        )}
                        <div className="schedule-content">
                          <div className="schedule-title">{event.title}</div>
                          {event.description && (
                            <div className="schedule-description">{event.description}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                          <button
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              fontSize: '0.9rem',
                              transition: 'color 150ms'
                            }}
                            onClick={() => onEditEvent(event)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {confirmDelete === event.id ? (
                            <button
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--system-red)',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                              }}
                              onClick={() => handleDeleteConfirm(event.id, event.title)}
                            >
                              Delete?
                            </button>
                          ) : (
                            <button
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-tertiary)',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontSize: '0.9rem'
                              }}
                              onClick={() => setConfirmDelete(event.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <>
                <div>
                  <div className="section-label">Tasks</div>
                  <div className="schedule-list">
                    {sortByTime(tasks).map(task => (
                      <div
                        key={task.id}
                        className={`schedule-item ${getCategoryColor(task.category)}`}
                        style={{ paddingRight: '2rem', position: 'relative', opacity: task.completed ? 0.6 : 1 }}
                      >
                        <input
                          type="checkbox"
                          className="schedule-checkbox"
                          checked={task.completed || false}
                          onChange={() => onCompleteEvent(task.id, !task.completed)}
                        />
                        <div className="schedule-content">
                          <div className="schedule-title" style={{
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="schedule-description">{task.description}</div>
                          )}
                          {task.start_time && (
                            <div className="schedule-description" style={{ marginTop: '4px' }}>
                              {task.start_time}
                            </div>
                          )}
                        </div>
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '0.5rem' }}>
                          <button
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                              padding: '4px',
                              fontSize: '0.9rem'
                            }}
                            onClick={() => onEditEvent(task)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {confirmDelete === task.id ? (
                            <>
                              <button
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--accent-red)',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  fontSize: '0.9rem'
                                }}
                                onClick={() => handleDeleteConfirm(task.id, task.title)}
                              >
                                ✓
                              </button>
                              <button
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--text-tertiary)',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  fontSize: '0.9rem'
                                }}
                                onClick={() => setConfirmDelete(null)}
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-tertiary)',
                                cursor: 'pointer',
                                padding: '4px',
                                fontSize: '0.9rem'
                              }}
                              onClick={() => setConfirmDelete(task.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
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
