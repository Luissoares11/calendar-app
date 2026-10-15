import { useState } from 'react'
import { login } from '../api/calendarClient'

export default function Login({ onSuccess }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(token)
      onSuccess()
    } catch {
      setError('Wrong token')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="login-screen" onSubmit={submit}>
      <h1>Calendar</h1>
      <label className="login-field">
        <span>Token</span>
        <input
          className="form-input"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button className="login-button" disabled={busy}>
        {busy ? 'Checking…' : 'Log in'}
      </button>
      {error && <p className="login-error">{error}</p>}
    </form>
  )
}
