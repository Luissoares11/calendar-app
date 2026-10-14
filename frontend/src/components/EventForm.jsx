import { useState, useEffect } from 'react'
import { formatDateKey } from '../utils/dateUtils'

const CATEGORIES = ['Exam', 'Appointment', 'Birthday', 'Meeting', 'Deadline', 'Other']

export default function EventForm({ selectedDate, onSubmit, onClose, editingEvent }) {
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    category: 'other',
    is_task: false,
    description: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        start_time: editingEvent.start_time || '',
        category: editingEvent.category || 'other',
        is_task: editingEvent.is_task || false,
        description: editingEvent.description || ''
      })
    }
  }, [editingEvent])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const localDateStr = `${year}-${month}-${day}`

      await onSubmit({
        ...formData,
        date: localDateStr,
        ...(editingEvent && { id: editingEvent.id })
      })
      onClose()
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const dateStr = selectedDate.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="event-form-overlay">
      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>{editingEvent ? 'Edit Event' : 'New Event'} — {dateStr}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Event title"
            className={`form-input ${errors.title ? 'error' : ''}`}
            autoFocus
            maxLength="100"
            disabled={submitting}
          />
          {errors.title && (
            <div className="error-message" style={{ marginTop: '0.5rem' }}>{errors.title}</div>
          )}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            {formData.title.length}/100
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Time</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="form-input"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              disabled={submitting}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add notes (optional)"
            className="form-textarea"
            maxLength="500"
            disabled={submitting}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            {formData.description.length}/500
          </div>
        </div>

        <div className="form-check">
          <input
            type="checkbox"
            id="is_task"
            name="is_task"
            checked={formData.is_task}
            onChange={handleChange}
            disabled={submitting}
          />
          <label htmlFor="is_task">
            This is a task (deadline with completion status)
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="loading-spinner"></span>
                {editingEvent ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              editingEvent ? 'Update Event' : 'Add Event'
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
