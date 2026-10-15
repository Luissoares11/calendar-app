import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Login from './components/Login'
import { checkAuth } from './api/calendarClient'

// Shows the login page until the session cookie is valid; returns to it on any 401
function AuthGate() {
  const [authed, setAuthed] = useState(null) // null while checking

  useEffect(() => {
    checkAuth()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false))

    const onUnauthorized = () => setAuthed(false)
    window.addEventListener('unauthorized', onUnauthorized)
    return () => window.removeEventListener('unauthorized', onUnauthorized)
  }, [])

  if (authed === null) return null
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>,
)
