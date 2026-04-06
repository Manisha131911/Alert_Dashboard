import React, { useState } from 'react'
import { useFetch } from '../hooks/useApi'

const SEV_COLOR = { Critical: '#f43f5e', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' }

export default function DataTable({ filters }) {
  const [search, setSearch] = useState('')
  const { data, loading } = useFetch('/data', filters, search ? { search } : {})

  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase',
        letterSpacing: '.16em', marginBottom: 14, paddingBottom: 10,
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ display: 'inline-block', width: 2, height: 12, borderRadius: 2, background: 'linear-gradient(180deg,#3b82f6,#7c3aed)' }} />
        Raw Alert Data
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍  Search across all columns..."
        style={{
          width: '100%', padding: '10px 14px', marginBottom: 14,
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: 10, color: 'var(--text)',
          fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none',
        }}
      />

      <div style={{
        border: '1px solid var(--border2)', borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto', maxHeight: 460, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface3)' }}>
                {['Date', 'Severity', 'Application', 'Description'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: 10, fontWeight: 700, color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '.14em',
                    borderBottom: '1px solid var(--border2)',
                    fontFamily: 'var(--font-mono)', position: 'sticky', top: 0,
                    background: 'var(--surface3)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {[120, 90, 130, 180].map((w, j) => (
                      <td key={j} style={{ padding: '10px 16px' }}>
                        <div className="skeleton" style={{ height: 14, width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                data?.rows?.map((row, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background .12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={tdStyle}>{row.date}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 20,
                        fontSize: 11, fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        background: (SEV_COLOR[row.severity] || '#64748b') + '18',
                        color: SEV_COLOR[row.severity] || '#94a3b8',
                        border: `1px solid ${(SEV_COLOR[row.severity] || '#64748b')}30`,
                      }}>{row.severity}</span>
                    </td>
                    <td style={tdStyle}>{row.application}</td>
                    <td style={tdStyle}>{row.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{
        fontSize: 11, color: 'var(--faint)', textAlign: 'right',
        fontFamily: 'var(--font-mono)', marginTop: 8,
      }}>
        {loading ? '…' : `${data?.total ?? 0} rows`}
      </p>
    </div>
  )
}

const tdStyle = {
  padding: '10px 16px', fontSize: 12, color: 'var(--text2)',
  fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
}