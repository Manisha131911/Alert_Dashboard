import React from 'react'

export default function Sidebar({ meta, filters, onChange }) {
  const { severities = [], applications = [], dateFrom = '', dateTo = '' } = filters

  function toggleItem(list, val, key) {
    const next = list.includes(val) ? list.filter(x => x !== val) : [...list, val]
    onChange({ ...filters, [key]: next })
  }

  function reset() {
    onChange({
      severities: meta?.severities ?? [],
      applications: meta?.applications ?? [],
      dateFrom: meta?.date_min ?? '',
      dateTo: meta?.date_max ?? '',
    })
  }

  const SEV_COLOR = { Critical: '#e11d48', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' }

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: 'linear-gradient(180deg, #07091a 0%, var(--bg) 100%)',
      borderRight: '1px solid var(--border2)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 0 20px',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
        padding: '22px 20px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
          boxShadow: '0 4px 16px rgba(59,130,246,.3)',
        }}>⚡</div>
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-.03em' }}>AlertsIQ</span>
      </div>

      <div style={{ padding: '20px 16px', flex: 1 }}>
        {/* Severity */}
        <FilterSection label="Severity Level">
          {meta?.severities?.map(s => (
            <CheckItem
              key={s}
              label={s}
              checked={severities.includes(s)}
              color={SEV_COLOR[s] || '#64748b'}
              onToggle={() => toggleItem(severities, s, 'severities')}
            />
          ))}
        </FilterSection>

        <Divider />

        {/* Applications */}
        <FilterSection label="Application">
          {meta?.applications?.map(a => (
            <CheckItem
              key={a}
              label={a}
              checked={applications.includes(a)}
              color="#3b82f6"
              onToggle={() => toggleItem(applications, a, 'applications')}
            />
          ))}
        </FilterSection>

        <Divider />

        {/* Date range */}
        <FilterSection label="Date Range">
          <label style={labelStyle}>From</label>
          <input
            type="date"
            value={dateFrom}
            min={meta?.date_min}
            max={meta?.date_max}
            onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
            style={inputStyle}
          />
          <label style={{ ...labelStyle, marginTop: 8 }}>To</label>
          <input
            type="date"
            value={dateTo}
            min={meta?.date_min}
            max={meta?.date_max}
            onChange={e => onChange({ ...filters, dateTo: e.target.value })}
            style={inputStyle}
          />
        </FilterSection>
      </div>

      {/* Reset */}
      <div style={{ padding: '0 16px' }}>
        <button onClick={reset} style={resetBtnStyle}>
          ↺ Reset Filters
        </button>
      </div>
    </aside>
  )
}

function FilterSection({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 9, fontWeight: 700, color: 'var(--muted)',
        textTransform: 'uppercase', letterSpacing: '.18em',
        marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          display: 'inline-block', width: 2, height: 10, borderRadius: 2,
          background: 'linear-gradient(180deg, #3b82f6, #7c3aed)',
        }} />
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  )
}

function CheckItem({ label, checked, color, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
        background: checked ? color + '14' : 'transparent',
        transition: 'background .15s',
        textAlign: 'left', width: '100%',
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: 4, flexShrink: 0,
        border: `2px solid ${checked ? color : 'var(--faint)'}`,
        background: checked ? color : 'transparent',
        transition: 'all .15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 12, color: checked ? 'var(--text)' : 'var(--muted)', fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
    </button>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
}

const labelStyle = {
  fontSize: 10, color: 'var(--muted)', marginBottom: 4, display: 'block',
  fontFamily: 'var(--font-mono)',
}

const inputStyle = {
  width: '100%', padding: '7px 10px',
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 8, color: 'var(--text)',
  fontFamily: 'var(--font-mono)', fontSize: 11,
  outline: 'none',
  colorScheme: 'dark',
}

const resetBtnStyle = {
  width: '100%', padding: '9px',
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 10, color: 'var(--text2)',
  fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', transition: 'all .18s',
}