import React from 'react'

const cards = [
  { key: 'k1', label: 'Total Alerts',    icon: '◈', valKey: 'total',    sub: d => `${d.n_apps} apps`,        color: '#3b82f6' },
  { key: 'k2', label: 'Critical',        icon: '⬡', valKey: 'critical', sub: d => `${d.pct_critical}% of total`, color: '#e11d48' },
  { key: 'k3', label: 'High Severity',   icon: '△', valKey: 'high',     sub: d => `${d.pct_high}% of total`, color: '#d97706' },
  { key: 'k4', label: 'Top Application', icon: '◉', valKey: 'top_app',  sub: d => `${d.top_n} alerts`,       color: '#059669' },
]

export default function KpiCards({ data, loading }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 14,
      marginBottom: 24,
    }}>
      {cards.map((c, i) => (
        <KpiCard
          key={c.key}
          card={c}
          data={data}
          loading={loading}
          delay={i * 60}
        />
      ))}
    </div>
  )
}

function KpiCard({ card, data, loading, delay }) {
  const val = data?.[card.valKey] ?? '—'
  const sub = data ? card.sub(data) : '…'
  const isText = typeof val === 'string' && val.length > 4

  return (
    <div
      className="animate-in"
      style={{
        animationDelay: `${delay}ms`,
        background: 'var(--surface)',
        border: '1px solid var(--border2)',
        borderRadius: 16,
        padding: '20px 22px 18px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform .2s, box-shadow .2s, border-color .2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = card.color + '55'
        e.currentTarget.style.boxShadow = `0 8px 32px ${card.color}22`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: card.color,
        opacity: .8,
      }} />

      {/* top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.16em' }}>
          {card.label}
        </span>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: card.color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: card.color,
        }}>
          {card.icon}
        </div>
      </div>

      {/* value */}
      {loading ? (
        <div className="skeleton" style={{ height: 40, marginBottom: 12 }} />
      ) : (
        <div style={{
          fontFamily: isText ? 'var(--font-sans)' : 'var(--font-mono)',
          fontSize: isText ? 20 : 38,
          fontWeight: 700,
          color: card.color,
          lineHeight: 1,
          marginBottom: 10,
          filter: `drop-shadow(0 0 12px ${card.color}40)`,
          letterSpacing: isText ? '-.01em' : '-.03em',
        }}>
          {val}
        </div>
      )}

      {/* badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 9px', borderRadius: 20,
        fontSize: 10, fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        background: card.color + '12',
        color: card.color,
        border: `1px solid ${card.color}28`,
      }}>
        {loading ? '…' : sub}
      </div>
    </div>
  )
}