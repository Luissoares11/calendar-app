import { useEffect, useRef, useState } from 'react'
import { enablePush, getPushState } from '../push'

const pill = {
  background: 'rgba(0, 0, 0, 0.7)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-tertiary)',
  fontSize: '0.75rem',
  padding: '0.5rem 0.75rem',
}

export default function NotifyButton() {
  const [state, setState] = useState('loading')
  const busy = useRef(false)

  useEffect(() => {
    getPushState().then(setState).catch(() => setState('unsupported'))
  }, [])

  // Not subscribed yet: ask on the first tap anywhere (iOS requires a user gesture).
  useEffect(() => {
    if (state !== 'idle') return

    const onTap = async () => {
      if (busy.current) return
      busy.current = true
      try {
        await enablePush()
        setState('subscribed')
      } catch (e) {
        console.error('Push setup failed:', e.message)
        setState(await getPushState())
      } finally {
        busy.current = false
      }
    }

    window.addEventListener('click', onTap, true)
    return () => window.removeEventListener('click', onTap, true)
  }, [state])

  if (state === 'denied') {
    return <div style={pill}>Notifications blocked (iOS Settings → Notifications → Cal)</div>
  }
  return null
}