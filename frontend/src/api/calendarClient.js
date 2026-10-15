import axios from 'axios'

// Session cookie is set by /auth/login and sent automatically (same origin)
const client = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Add request interceptor for debugging
client.interceptors.request.use(config => {
  console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, config.params)
  return config
})

// Add response interceptor for debugging
client.interceptors.response.use(
  response => {
    console.log(`[API] ✅ Response:`, response.status, response.data)
    return response
  },
  error => {
    // Session expired or missing: let the app show the login page
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
      window.dispatchEvent(new Event('unauthorized'))
    }
    console.error(`[API] ❌ Error:`)
    console.error('  Message:', error.message)
    console.error('  Status:', error.response?.status)
    console.error('  Data:', error.response?.data)
    console.error('  Config:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    })
    throw error
  }
)

// Error handler
const handleError = (error) => {
  if (error.response) {
    const status = error.response.status
    const message = error.response.data?.message || error.response.statusText
    console.error(`[API Error] ${status}: ${message}`)
    throw new Error(`[${status}] ${message}`)
  } else if (error.request) {
    console.error('[API Error] No response from server')
    throw new Error('No response from server. Is calendar-service running?')
  } else {
    console.error('[API Error]', error.message)
    throw error
  }
}

/**
 * Fetch events for a given date range
 */
export async function fetchEvents(startDate, endDate) {
  try {
    console.log(`[API] Fetching events from ${startDate.toDateString()} to ${endDate.toDateString()}`)

    const response = await client.get('/events', {
      params: {
        list: true,
        all: true  // Fetch all events, we'll filter client-side
      }
    })

    let data = Array.isArray(response.data) ? response.data : response.data.events || []

    // Transform API response to match UI format
    data = data.map(event => {
      let date, time

      // Extract date and time from start_time if it's an ISO string
      if (event.start_time && typeof event.start_time === 'string') {
        const dateMatch = event.start_time.match(/^(\d{4}-\d{2}-\d{2})/)
        const timeMatch = event.start_time.match(/T(\d{2}:\d{2})/)
        date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
        time = timeMatch ? timeMatch[1] : ''
      } else {
        date = new Date().toISOString().split('T')[0]
        time = ''
      }

      return {
        id: event.id,
        title: event.title,
        date: date,
        start_time: time,
        category: event.type || 'other',
        type: event.type || 'other',
        is_task: !!event.is_task,
        completed: !!event.completed,
        description: event.notes || '',
        notes: event.notes || '',
        recurrence: event.recurrence || 'none'
      }
    })

    return data
  } catch (error) {
    console.error('Error fetching events:', error)
    handleError(error)
  }
}

/**
 * Create a new event
 */
export async function createEvent(eventData) {
  try {
    // Parse the ISO date string to YYYY-MM-DD format without timezone conversion
    let dateStr
    if (typeof eventData.date === 'string') {
      // If it's already a string like "2026-09-08", use it directly
      if (eventData.date.length === 10 && eventData.date.includes('-')) {
        dateStr = eventData.date
      } else {
        // If it's ISO format, extract just the date part
        dateStr = eventData.date.split('T')[0]
      }
    } else {
      // If it's a Date object, format it as local date (not UTC)
      const date = new Date(eventData.date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      dateStr = `${year}-${month}-${day}`
    }

    const payload = {
      action: 'add',
      title: eventData.title,
      type: eventData.category || 'other',
      date: dateStr,
      time: eventData.start_time || '',
      notes: eventData.description || '',
      recurrence: 'none',
      is_task: !!eventData.is_task
    }
    const response = await client.post('/events', payload)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Update an event
 * @param {string} eventId - Event ID
 * @param {object} eventData - New event data
 * @param {string} originalTitle - Original event title (for API identification)
 */
export async function updateEvent(eventId, eventData, originalTitle) {
  try {
    const payload = {
      action: 'edit',
      title: originalTitle || eventData.title,
      new_title: eventData.title,
      new_date: eventData.date,
      new_time: eventData.start_time || '',
      new_notes: eventData.description || '',
      new_is_task: !!eventData.is_task
    }
    const response = await client.post('/events/edit', payload)

    // Construct the updated event from request data since API only returns success message
    const updatedEvent = {
      id: eventId,
      title: eventData.title,
      date: eventData.date,
      start_time: eventData.start_time || '',
      category: eventData.category || 'other',
      type: eventData.category || 'other',
      is_task: eventData.is_task || false,
      completed: eventData.completed || false,
      description: eventData.description || '',
      notes: eventData.description || ''
    }
    return updatedEvent
  } catch (error) {
    handleError(error)
  }
}

/**
 * Delete an event by title
 */
export async function deleteEvent(eventId, eventTitle) {
  try {
    const payload = {
      action: 'delete',
      title: eventTitle
    }
    const response = await client.post('/events/delete', payload)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Mark an event as complete (for tasks)
 */
export async function completeEvent(eventId) {
  try {
    const response = await client.patch(`/events/${eventId}`, { completed: true })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Unmark an event as complete
 */
export async function uncompleteEvent(eventId) {
  try {
    const response = await client.patch(`/events/${eventId}`, { completed: false })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

/**
 * Log in with the API token; the server answers with a session cookie
 */
export async function login(token) {
  await client.post('/auth/login', { token })
}

/**
 * End the current session
 */
export async function logout() {
  await client.post('/auth/logout')
}

/**
 * Resolves if the current session (or cookie) is valid, rejects otherwise
 */
export async function checkAuth() {
  await client.get('/auth/check', { timeout: 5000 })
}

/**
 * Health check
 */
export async function healthCheck() {
  try {
    const response = await client.get('/health', { timeout: 5000 })
    return response.status === 200
  } catch {
    return false
  }
}
