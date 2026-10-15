import { useState, useEffect, useMemo } from 'react'
import MonthGrid from './components/MonthGrid'
import SidePanel from './components/SidePanel'
import EventForm from './components/EventForm'
import NotifyButton from './components/NotifyButton'
import Dashboard from './components/Dashboard'
import { CalendarIcon, DashboardIcon } from './components/Icons'
import { useEvents } from './hooks/useEvents'
import { getMonthDates } from './utils/dateUtils'
import './styles/theme.css'

// Demo mode for testing without API
const DEMO_MODE = false
const DEMO_EVENTS = [
  {
    id: 1,
    title: 'Sprint Planning',
    date: new Date().toISOString(),
    start_time: '09:00',
    category: 'deadline',
    is_task: false,
    completed: false,
    description: 'Roadmap review'
  },
  {
    id: 2,
    title: 'Design Review',
    date: new Date().toISOString(),
    start_time: '14:00',
    category: 'appointment',
    is_task: false,
    completed: false,
    description: 'Frame share'
  },
  {
    id: 3,
    title: 'Client Call',
    date: new Date().toISOString(),
    start_time: '16:30',
    category: 'meeting',
    is_task: false,
    completed: false,
    description: 'Sync call'
  },
  {
    id: 4,
    title: 'Team Retro',
    date: new Date().toISOString(),
    start_time: '18:00',
    category: 'meeting',
    is_task: false,
    completed: false
  }
]

export default function App() {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [view, setView] = useState('dashboard') // 'calendar' | 'dashboard'
  const [demoMode, setDemoMode] = useState(DEMO_MODE)

  // Memoize dates so they don't change on every render
  const { startDate, endDate } = useMemo(() => {
    if (demoMode) {
      return { startDate: null, endDate: null }
    }
    return {
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    }
  }, [currentDate, demoMode])

  const {
    events: apiEvents,
    loading,
    syncing,
    error,
    addEvent: apiAddEvent,
    updateEvent: apiUpdateEvent,
    removeEvent: apiRemoveEvent,
    completeEvent: apiCompleteEvent,
    uncompleteEvent: apiUncompleteEvent,
    clearError
  } = useEvents(startDate, endDate)

  const [demoEventsList, setDemoEventsList] = useState(DEMO_EVENTS)
  const events = demoMode ? demoEventsList : apiEvents

  const addEvent = async (eventData) => {
    if (demoMode) {
      const newEvent = {
        id: Math.max(...demoEventsList.map(e => e.id), 0) + 1,
        ...eventData,
        completed: false
      }
      setDemoEventsList([...demoEventsList, newEvent])
      return newEvent
    }
    return apiAddEvent(eventData)
  }

  const updateEvent = async (eventId, eventData) => {
    if (demoMode) {
      setDemoEventsList(demoEventsList.map(e =>
        e.id === eventId ? { ...e, ...eventData } : e
      ))
      return { id: eventId, ...eventData }
    }
    return apiUpdateEvent(eventId, eventData)
  }

  const removeEvent = async (eventId, eventTitle) => {
    if (demoMode) {
      setDemoEventsList(demoEventsList.filter(e => e.id !== eventId))
      return
    }
    return apiRemoveEvent(eventId, eventTitle)
  }

  const completeEvent = async (eventId) => {
    if (demoMode) {
      setDemoEventsList(demoEventsList.map(e =>
        e.id === eventId ? { ...e, completed: true } : e
      ))
      return { id: eventId, completed: true }
    }
    return apiCompleteEvent(eventId)
  }

  const uncompleteEvent = async (eventId) => {
    if (demoMode) {
      setDemoEventsList(demoEventsList.map(e =>
        e.id === eventId ? { ...e, completed: false } : e
      ))
      return { id: eventId, completed: false }
    }
    return apiUncompleteEvent(eventId)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setShowEventForm(true)
        setEditingEvent(null)
        setSelectedDate(new Date())
      }
      if (e.key === 'Escape') {
        if (showEventForm) {
          setShowEventForm(false)
        } else if (selectedDate) {
          setSelectedDate(null)
        }
      }
      if (e.key === 'ArrowLeft' && !showEventForm) {
        handlePrevMonth()
      }
      if (e.key === 'ArrowRight' && !showEventForm) {
        handleNextMonth()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showEventForm, selectedDate])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Opens the calendar on a month picked from the dashboard
  const handleSelectMonth = (date) => {
    setCurrentDate(date)
    setSelectedDate(null)
    setView('calendar')
  }

  // Opens the calendar on an event's day, so its events show in the side panel
  const handleSelectEventDate = (dateKey) => {
    const [y, m, d] = dateKey.split('-').map(Number)
    setCurrentDate(new Date(y, m - 1, 1))
    setSelectedDate(new Date(y, m - 1, d))
    setView('calendar')
  }

  const handleAddEvent = async (eventData) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData, editingEvent.title)
        setEditingEvent(null)
      } else {
        await addEvent(eventData)
      }
      setShowEventForm(false)
    } catch (err) {
      console.error('Failed to save event:', err)
    }
  }

  const handleCompleteEvent = async (eventId, completed) => {
    try {
      if (completed) {
        await completeEvent(eventId)
      } else {
        await uncompleteEvent(eventId)
      }
    } catch (err) {
      console.error('Failed to update event:', err)
    }
  }

  const handleDeleteEvent = async (eventId, eventTitle) => {
    try {
      await removeEvent(eventId, eventTitle)
    } catch (err) {
      console.error('Failed to delete event:', err)
    }
  }

  const handleDeleteFromForm = async () => {
    await handleDeleteEvent(editingEvent.id, editingEvent.title)
    handleCloseForm()
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleCloseForm = () => {
    setShowEventForm(false)
    setEditingEvent(null)
  }

  return (
    <div className="app">
      <div className="main-content" style={{ display: view === 'calendar' ? undefined : 'none' }}>
        <MonthGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          events={events}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateChange={setCurrentDate}
        />

        {showEventForm && (
          <EventForm
            selectedDate={selectedDate || new Date()}
            onSubmit={handleAddEvent}
            onClose={handleCloseForm}
            editingEvent={editingEvent}
            onDelete={handleDeleteFromForm}
          />
        )}

        {!showEventForm && (
          <SidePanel
            selectedDate={selectedDate}
            events={events}
            onClose={() => setSelectedDate(null)}
            onAddEvent={() => {
              setShowEventForm(true)
              setEditingEvent(null)
            }}
            onCompleteEvent={handleCompleteEvent}
            onEditEvent={handleEditEvent}
            loading={loading}
          />
        )}
      </div>

      {view === 'dashboard' && (
        <Dashboard
          events={events}
          currentDate={currentDate}
          onSelectMonth={handleSelectMonth}
          onSelectEventDate={handleSelectEventDate}
        />
      )}

      <nav className="view-tabs">
        <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
          <DashboardIcon />
          <span>Dashboard</span>
        </button>
        <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>
          <CalendarIcon />
          <span>Calendar</span>
        </button>
      </nav>

      {demoMode && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            maxWidth: '400px',
            padding: '1rem',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid var(--accent-orange)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-orange)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100
          }}
        >
          <span>📱 Demo Mode</span>
          <button
            onClick={() => setDemoMode(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-orange)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            Try API
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: demoMode ? '5rem' : '1rem',
            left: '1rem',
            right: '1rem',
            maxWidth: '500px',
            padding: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--accent-red)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-red)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            zIndex: 100,
            gap: '1rem'
          }}
        >
          <div style={{ flex: 1, fontSize: '0.9rem' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>❌ API Error</div>
            <div style={{ fontSize: '0.85rem' }}>{error}</div>
          </div>
          <button
            onClick={clearError}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-red)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Notifications */}
      <div
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
          right: '1rem',
          zIndex: 50
        }}
      >
        <NotifyButton />
      </div>

    </div>
  )
}