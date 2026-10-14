import { formatDateKey } from '../utils/dateUtils'

export default function TodaySection({ events, loading }) {
  if (loading) {
    return (
      <div className="today-section">
        <div className="today-header">
          <span>Today</span>
        </div>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const regularEvents = events.filter(e => !e.is_task)
  const tasks = events.filter(e => e.is_task)
  const completedTasks = tasks.filter(t => t.completed)

  if (events.length === 0) {
    return (
      <div className="today-section">
        <div className="today-header">
          <span>Today</span>
          <span className="today-count">0</span>
        </div>
        <div className="empty-state" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.875rem' }}>No events today</p>
        </div>
      </div>
    )
  }

  const getCategoryClass = (event) => {
    return event.category || 'meeting'
  }

  return (
    <div className="today-section">
      <div className="today-header">
        <span>Today</span>
        <span className="today-count">{regularEvents.length + tasks.length}</span>
      </div>

      <div className="events-list">
        {/* Regular Events */}
        {regularEvents.length > 0 && (
          <>
            {regularEvents.map(event => (
              <div key={event.id} className={`event-item ${getCategoryClass(event)}`}>
                <div className="event-content">
                  <div className="event-title">{event.title}</div>
                  {event.start_time && (
                    <div className="event-time">🕐 {event.start_time}</div>
                  )}
                  {event.category && (
                    <div className="event-category">{event.category}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Tasks */}
        {tasks.length > 0 && (
          <>
            {tasks.map(task => (
              <div key={task.id} className={`event-item ${getCategoryClass(task)} ${task.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  className="event-checkbox"
                  checked={task.completed || false}
                  readOnly
                  aria-label={`Mark ${task.title} as complete`}
                />
                <div className="event-content">
                  <div className="event-title" style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.6 : 1
                  }}>
                    {task.title}
                  </div>
                  {task.start_time && (
                    <div className="event-time">🕐 {task.start_time}</div>
                  )}
                  {task.category && (
                    <div className="event-category">{task.category}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
