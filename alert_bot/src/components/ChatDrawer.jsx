import React, { useState, useRef, useEffect } from 'react'
import { sendChat } from '../hooks/useApi'

export default function ChatDrawer({ open, onClose, kpiData, filters }) {
  const [history, setHistory] = useState([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel]     = useState('…')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  const context = kpiData ? `
Alerts data summary:
- Total: ${kpiData.total} rows
- Critical: ${kpiData.critical} (${kpiData.pct_critical}%)
- High: ${kpiData.high} (${kpiData.pct_high}%)
- Top app: ${kpiData.top_app} (${kpiData.top_n} alerts)
- Apps monitored: ${kpiData.n_apps}
- Active filters — Severities: ${filters.severities?.join(', ') || 'all'}, Apps: ${filters.applications?.join(', ') || 'all'}
` : ''

  async function handleSend() {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    const nextHistory = [...history, { role: 'user', content: msg }]
    setHistory(nextHistory)
    setLoading(true)
    try {
      const res = await sendChat(msg, history, context)
      setHistory([...nextHistory, { role: 'assistant', content: res.reply }])
      setModel(res.model)
    } catch {
      setHistory([...nextHistory, { role: 'assistant', content: '⚠️ Connection error. Is the backend running?' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', right: 24, bottom: 24,
      width: 420, zIndex: 100,
      animation: 'fadeSlideUp .25s ease both',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border3)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(59,130,246,.08)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,.2), rgba(124,58,237,.15))',
          borderBottom: '1px solid var(--border3)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, boxShadow: '0 2px 10px rgba(59,130,246,.3)',
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-.01em' }}>Nova AI</div>
              <div style={{
                fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--muted)',
                background: 'rgba(255,255,255,.04)', border: '1px solid var(--border2)',
                borderRadius: 4, padding: '1px 6px', display: 'inline-block', marginTop: 2,
              }}>{model}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#34d399', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 6px #10b981', animation: 'pulse 1.8s infinite',
              }} />
              Online
            </div>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} style={iconBtn} title="Clear">🗑</button>
            )}
            <button onClick={onClose} style={iconBtn} title="Close">✕</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          height: 340, overflowY: 'auto', padding: '14px 16px',
          background: 'rgba(5,8,15,.45)',
        }}>
          {history.length === 0 && !loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 10, color: 'var(--faint)',
              fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'center',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>⚡</div>
              Ask Nova anything about your alerts data...
            </div>
          ) : (
            <>
              {history.map((m, i) => (
                <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={m.role === 'user' ? userBubble : aiBubble}>
                    <div style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '.08em',
                      marginBottom: 4, opacity: .6, textTransform: 'uppercase',
                      color: m.role === 'user' ? 'rgba(255,255,255,.6)' : '#60a5fa',
                    }}>
                      {m.role === 'user' ? 'You' : '⚡ Nova'}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 5, padding: '10px 14px', alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#3b82f6',
                      animation: `pulse 1.2s ease ${i * .15}s infinite`,
                    }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid var(--border2)',
          padding: '10px 14px',
          background: 'var(--surface2)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="e.g. Which app has most critical alerts?"
            style={{
              flex: 1, padding: '9px 12px',
              background: 'var(--surface3)',
              border: '1px solid var(--border2)',
              borderRadius: 10, color: 'var(--text)',
              fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              padding: '9px 16px', borderRadius: 10, border: 'none',
              background: loading || !input.trim() ? 'var(--faint)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'wait' : 'pointer',
              transition: 'all .18s',
              boxShadow: input.trim() && !loading ? '0 3px 14px rgba(59,130,246,.3)' : 'none',
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

const userBubble = {
  background: 'linear-gradient(135deg, #1d4ed8, #5b21b6)',
  color: '#fff', padding: '8px 13px',
  borderRadius: '14px 14px 2px 14px',
  fontSize: 13, maxWidth: '78%',
  boxShadow: '0 3px 14px rgba(59,130,246,.22)',
}

const aiBubble = {
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  color: '#e2e8f0', padding: '8px 13px',
  borderRadius: '2px 14px 14px 14px',
  fontSize: 13, maxWidth: '86%',
}

const iconBtn = {
  background: 'none', border: 'none', color: 'var(--muted)',
  cursor: 'pointer', fontSize: 12, padding: '2px 6px',
  borderRadius: 6, transition: 'color .15s',
}