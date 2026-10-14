import { formatDateKey, groupEventsByDate } from '../utils/dateUtils'
import { useState } from 'react'

export default function DayDetail({
  selectedDate,
  events,
  onClose,
  onAddEvent,
  onCompleteEvent,
  onDeleteEvent,
  onEditEvent,
  loading
}) {
  if (!selectedDate) return null

  const [confirmDelete, setConfirmDelete] = useState(null)

  const eventsByDate = groupEventsByDate(events)
  const dateKey = formatDateKey(selectedDate)
  const dayEvents = eventsByDate[dateKey] || []

  const regularEvents = dayEvents.filter(e => !e.is_task)
  const tasks = dayEvents.filter(e => e.is_task)

  const dateStr = selectedDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const getCategoryClass = (event) => {
    return event.category || 'meeting'
  }

  const handleDeleteConfirm = async (eventId) => {
    setConfirmDelete(null)
    try {
      await onDeleteEvent(eventId)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <div className="day-detail">
      <div className="day-detail-header">
        <h2 className="day-detail-title">{dateStr}</h2>
        <button className="close-btn" onClick={onClose} title="Close">✕</button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="detail-events-list">
          {/* Regular Events */}
          {regularEvents.length > 0 && (
            <>
              <h3 className="detail-section-title">📅 Events</h3>
              {regularEvents.map(event => (
                <div key={event.id} className={`detail-event-item ${getCategoryClass(event)}`}>
                  <div className="detail-event-info">
                    <div className="detail-event-title">{event.title}</div>
                    {event.start_time && (
                      <div className="detail-event-time">🕐 {event.start_time}</div>
                    )}
                    {event.category && (
                      <div className="detail-event-category">{event.category}</div>
                    )}
                  </div>
                  <div className="detail-event-actions">
                    <button
                      className="icon-btn"
                      onClick={() => onEditEvent(event)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    {confirmDelete === event.id ? (
                      <>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDeleteConfirm(event.id)}
                          title="Confirm delete"
                        >
                          ✓
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => setConfirmDelete(null)}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        className="icon-btn danger"
                        onClick={() => setConfirmDelete(event.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <>
              <h3 className="detail-section-title">✓ Tasks</h3>
              {tasks.map(task => (
                <div key={task.id} className={`detail-event-item ${getCategoryClass(task)} ${task.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    className="event-checkbox"
                    checked={task.completed || false}
                    onChange={() => onCompleteEvent(task.id, !task.completed)}
                    aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                  />
                  <div className="detail-event-info">
                    <div
                      className="detail-event-title"
                      style={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.6 : 1
                      }}
                    >
                      {task.title}
                    </div>
                    {task.start_time && (
                      <div className="detail-event-time">🕐 {task.start_time}</div>
                    )}
                    {task.category && (
                      <div className="detail-event-category">{task.category}</div>
                    )}
                  </div>
                  <div className="detail-event-actions">
                    <button
                      className="icon-btn"
                      onClick={() => onEditEvent(task)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    {confirmDelete === task.id ? (
                      <>
                        <button
                          className="icon-btn danger"
                          onClick={() => handleDeleteConfirm(task.id)}
                          title="Confirm delete"
                        >
                          ✓
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => setConfirmDelete(null)}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        className="icon-btn danger"
                        onClick={() => setConfirmDelete(task.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {dayEvents.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No events or tasks</p>
            </div>
          )}
        </div>
      )}

      <button className="add-event-btn" onClick={onAddEvent} disabled={loading}>
        + Add Event
      </button>
    </div>
  )
}
