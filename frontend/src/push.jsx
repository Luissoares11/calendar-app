const NOTIFIER_URL = (import.meta.env.VITE_NOTIFIER_URL || '').replace(/\/$/, '')
const NOTIFIER_TOKEN = import.meta.env.VITE_NOTIFIER_TOKEN || ''

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// 'unsupported' | 'denied' | 'subscribed' | 'idle'
export async function getPushState() {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  return sub ? 'subscribed' : 'idle'
}

// Must be called straight from a tap handler (iOS rule).
export async function enablePush() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Permission not granted')

  const keyRes = await fetch(`${NOTIFIER_URL}/vapid-public-key`)
  if (!keyRes.ok) throw new Error(`Notifier unreachable (${keyRes.status})`)
  const { key } = await keyRes.json()

  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    })
  }

  const res = await fetch(`${NOTIFIER_URL}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NOTIFIER_TOKEN}`,
    },
    body: JSON.stringify(sub.toJSON()),
  })
  if (!res.ok) throw new Error(`Subscribe failed (${res.status})`)
}