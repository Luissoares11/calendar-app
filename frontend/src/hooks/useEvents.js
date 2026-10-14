import { useState, useEffect, useCallback } from 'react'
import * as calendarClient from '../api/calendarClient'

/**
 * Custom hook for managing calendar events
 * Handles fetching, caching, and mutations with proper state management
 */
export function useEvents(startDate, endDate) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(false)

  // Fetch events for the given date range
  useEffect(() => {
    if (!startDate || !endDate) {
      setEvents([])
      return
    }

    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log(`[useEvents] Fetching ${startDate.toDateString()} to ${endDate.toDateString()}`)
        const data = await calendarClient.fetchEvents(startDate, endDate)
        if (isMounted) {
          const eventsToSet = data || []
          setEvents(eventsToSet)
          // Save to localStorage as backup
          localStorage.setItem('calendar_events', JSON.stringify(eventsToSet))
          console.log(`[useEvents] Got ${eventsToSet?.length || 0} events`)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          console.error('Failed to fetch events:', err)
          // Try to load from localStorage as fallback
          try {
            const cached = localStorage.getItem('calendar_events')
            if (cached) {
              setEvents(JSON.parse(cached))
              console.log('[useEvents] Loaded events from localStorage cache')
            }
          } catch (e) {
            console.error('Failed to load from cache:', e)
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [startDate?.getTime(), endDate?.getTime()])

  // Add event
  const addEvent = useCallback(async (eventData) => {
    setSyncing(true)
    setError(null)
    try {
      const response = await calendarClient.createEvent(eventData)
      // Construct event object from form data since API only returns {success, event_id, message}
      const newEvent = {
        id: response.event_id,
        title: eventData.title,
        date: eventData.date.split('T')[0] || eventData.date, // Convert ISO to YYYY-MM-DD
        start_time: eventData.start_time || null,
        category: eventData.category || 'other',
        type: eventData.category || 'other',
        is_task: eventData.is_task || false,
        completed: eventData.completed || false,
        description: eventData.description || '',
        notes: eventData.description || ''
      }
      setEvents(prev => {
        const updated = [...prev, newEvent]
        localStorage.setItem('calendar_events', JSON.stringify(updated))
        return updated
      })
      return newEvent
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSyncing(false)
    }
  }, [])

  // Update event
  const updateEventData = useCallback(async (eventId, eventData, originalTitle) => {
    setSyncing(true)
    setError(null)
    try {
      const updated = await calendarClient.updateEvent(eventId, eventData, originalTitle)
      setEvents(prev => {
        const newEvents = prev.map(e => e.id === eventId ? updated : e)
        localStorage.setItem('calendar_events', JSON.stringify(newEvents))
        return newEvents
      })
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSyncing(false)
    }
  }, [])

  // Delete event
  const removeEvent = useCallback(async (eventId, eventTitle) => {
    setSyncing(true)
    setError(null)
    try {
      await calendarClient.deleteEvent(eventId, eventTitle)
      setEvents(prev => {
        const updated = prev.filter(e => e.id !== eventId)
        localStorage.setItem('calendar_events', JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSyncing(false)
    }
  }, [])

  // Complete event (mark as done)
  const completeEvent = useCallback(async (eventId) => {
    setSyncing(true)
    setError(null)
    try {
      const updated = await calendarClient.completeEvent(eventId)
      setEvents(prev => {
        const newEvents = prev.map(e => e.id === eventId ? updated : e)
        localStorage.setItem('calendar_events', JSON.stringify(newEvents))
        return newEvents
      })
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSyncing(false)
    }
  }, [])

  // Uncomplete event
  const uncompleteEventData = useCallback(async (eventId) => {
    setSyncing(true)
    setError(null)
    try {
      const updated = await calendarClient.uncompleteEvent(eventId)
      setEvents(prev => {
        const newEvents = prev.map(e => e.id === eventId ? updated : e)
        localStorage.setItem('calendar_events', JSON.stringify(newEvents))
        return newEvents
      })
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSyncing(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    events,
    loading,
    syncing,
    error,
    addEvent,
    updateEvent: updateEventData,
    removeEvent,
    completeEvent,
    uncompleteEvent: uncompleteEventData,
    clearError
  }
}
