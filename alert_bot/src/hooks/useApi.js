import { useState, useEffect, useRef } from 'react'

const BASE = ''

function buildQuery(...paramObjects) {
  const merged = Object.assign({}, ...paramObjects)
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) {
    if (Array.isArray(v)) v.forEach(item => qs.append(k, item))
    else if (v !== undefined && v !== null && v !== '') qs.append(k, v)
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export function useFetch(path, ...paramObjects) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const abortRef = useRef(null)

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    fetch(`${BASE}/api${path}${buildQuery(...paramObjects)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false) })
    return () => controller.abort()
  }, [path, JSON.stringify(paramObjects)])  // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading }
}

export async function sendChat(message, history, context) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
