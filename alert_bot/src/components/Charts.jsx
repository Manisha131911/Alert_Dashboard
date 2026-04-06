import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const SEV_COLORS = { Critical: '#f43f5e', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' }
const APP_PAL = ['#3b82f6','#8b5cf6','#06b6d4','#ec4899','#10b981','#f59e0b','#f43f5e','#a78bfa']

const TOOLTIP_STYLE = {
  backgroundColor: '#1a2235',
  border: '1px solid rgba(99,179,255,0.3)',
  borderRadius: 10,
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: 12,
  color: '#f1f5f9',
  padding: '8px 14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.1)',
}

const TICK_STYLE = { fill: '#64748b', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }

export function ChartCard({ title, children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border2)',
      borderRadius: 14,
      padding: '18px 16px 12px',
      transition: 'border-color .2s, box-shadow .2s',
      ...style,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(99,179,255,.28)'
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div style={{
        fontSize: 12, fontWeight: 700, color: 'var(--text2)',
        marginBottom: 16, letterSpacing: '-.01em',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

/* ── Daily stacked bar ── */
export function DailyChart({ data, loading }) {
  if (loading) return <SkeletonChart />
  const severities = [...new Set(data?.map(d => d.severity) ?? [])]
  const grouped = {}
  data?.forEach(r => {
    grouped[r.date] = grouped[r.date] || { date: r.date }
    grouped[r.date][r.severity] = r.count
  })
  const rows = Object.values(grouped)

  return (
    <ChartCard title="⬡ Daily Alerts by Severity">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={rows} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
          <XAxis dataKey="date" tick={TICK_STYLE} axisLine={false} tickLine={false}
            tickFormatter={v => v.slice(5)} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(59,130,246,.06)' }} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: '#94a3b8' }} />
          {severities.map(s => (
            <Bar key={s} dataKey={s} stackId="a" fill={SEV_COLORS[s] || '#6366f1'} radius={[0,0,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ── Severity donut ── */
const RADIAN = Math.PI / 180
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.06) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="rgba(255,255,255,.85)" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontFamily="IBM Plex Mono, monospace" fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function SeverityChart({ data, loading, total }) {
  if (loading) return <SkeletonChart />
  return (
    <ChartCard title="◈ Severity Distribution">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data ?? []}
            dataKey="count"
            nameKey="severity"
            cx="50%" cy="50%"
            innerRadius={65} outerRadius={95}
            paddingAngle={3}
            labelLine={false}
            label={renderCustomLabel}
          >
            {data?.map((entry, i) => (
              <Cell key={i} fill={SEV_COLORS[entry.severity] || APP_PAL[i % APP_PAL.length]}
                stroke="rgba(5,8,15,.9)" strokeWidth={3} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v} alerts`, n]} />
          <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle"
            fill="#e2e8f0" fontSize={22} fontFamily="IBM Plex Mono" fontWeight={700}>
            {total ?? 0}
          </text>
          <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
            fill="#64748b" fontSize={9} fontFamily="IBM Plex Mono" letterSpacing={2}>
            TOTAL
          </text>
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ── Apps bar ── */
export function AppsChart({ data, loading }) {
  if (loading) return <SkeletonChart />
  return (
    <ChartCard title="◉ Alerts per Application">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data ?? []} layout="vertical" margin={{ top: 4, right: 40, left: 20, bottom: 0 }} barSize={12}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" horizontal={false} />
          <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="application" tick={TICK_STYLE} axisLine={false} tickLine={false} width={100} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(59,130,246,.06)' }} />
          <Bar dataKey="count" radius={[0,4,4,0]} label={{ position: 'right', fill: '#cbd5e1', fontSize: 10, fontFamily: 'IBM Plex Mono' }}>
            {data?.map((_, i) => <Cell key={i} fill={APP_PAL[i % APP_PAL.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ── Severity per App grouped ── */
export function SeverityPerAppChart({ data, loading }) {
  if (loading) return <SkeletonChart />
  const apps = [...new Set(data?.map(d => d.application) ?? [])]
  const severities = [...new Set(data?.map(d => d.severity) ?? [])]
  const grouped = {}
  data?.forEach(r => {
    grouped[r.application] = grouped[r.application] || { application: r.application }
    grouped[r.application][r.severity] = r.count
  })
  const rows = Object.values(grouped)

  return (
    <ChartCard title="△ Severity Breakdown per App">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 4, right: 4, left: -20, bottom: 40 }} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
          <XAxis dataKey="application" tick={{ ...TICK_STYLE, fontSize: 10 }} axisLine={false} tickLine={false}
            angle={-20} textAnchor="end" />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(59,130,246,.06)' }} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: '#94a3b8', paddingTop: 8 }} />
          {severities.map(s => (
            <Bar key={s} dataKey={s} fill={SEV_COLORS[s] || '#6366f1'} radius={[3,3,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ── Descriptions bar ── */
export function DescriptionsChart({ data, loading }) {
  if (loading) return <SkeletonChart />
  return (
    <ChartCard title="⬡ Alert Description Frequency" style={{ gridColumn: '1 / -1' }}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 50 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
          <XAxis dataKey="description" tick={{ ...TICK_STYLE, fontSize: 10 }} axisLine={false} tickLine={false}
            angle={-25} textAnchor="end" />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(59,130,246,.06)' }} />
          <Bar dataKey="count" radius={[5,5,0,0]}
            label={{ position: 'top', fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }}>
            {data?.map((_, i) => <Cell key={i} fill={APP_PAL[i % APP_PAL.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/* ── Heatmap grid ── */
export function HeatmapChart({ data, loading }) {
  if (loading) return <SkeletonChart />
  const rows = data ?? []

  const apps  = [...new Set(rows.map(r => r.application))]
  const types = [...new Set(rows.map(r => r.description))]

  const lookup = {}
  rows.forEach(r => { lookup[`${r.application}||${r.description}`] = r.count })

  const maxVal = Math.max(...rows.map(r => r.count), 1)

  function cellColor(val) {
    if (!val) return 'rgba(255,255,255,0.03)'
    const t = val / maxVal
    // blue → purple gradient
    const r = Math.round(37  + t * (139 - 37))
    const g = Math.round(99  + t * (58  - 99))
    const b = Math.round(235 + t * (237 - 235))
    return `rgba(${r},${g},${b},${0.25 + t * 0.65})`
  }

  const [tooltip, setTooltip] = React.useState(null)

  return (
    <ChartCard title="◈ Alert Type × Application">
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 3, fontSize: 10,
          fontFamily: 'IBM Plex Mono, monospace', width: '100%', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ color: 'var(--muted)', fontWeight: 600, textAlign: 'left',
                paddingBottom: 6, paddingRight: 8, whiteSpace: 'nowrap', fontSize: 9 }}>
                App ↓ / Type →
              </th>
              {types.map(t => (
                <th key={t} style={{ color: '#94a3b8', fontWeight: 500, fontSize: 9,
                  textAlign: 'center', paddingBottom: 6, whiteSpace: 'nowrap',
                  maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={t}>
                  {t.length > 12 ? t.slice(0, 11) + '…' : t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app}>
                <td style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 10,
                  paddingRight: 10, whiteSpace: 'nowrap' }}>
                  {app}
                </td>
                {types.map(type => {
                  const val = lookup[`${app}||${type}`] || 0
                  return (
                    <td key={type}
                      onMouseEnter={e => setTooltip({ app, type, val, x: e.clientX, y: e.clientY })}
                      onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        background: cellColor(val),
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 5,
                        textAlign: 'center',
                        padding: '5px 4px',
                        color: val ? '#f1f5f9' : 'transparent',
                        fontWeight: 700,
                        fontSize: 10,
                        cursor: val ? 'default' : 'default',
                        minWidth: 32,
                        transition: 'filter .12s',
                      }}
                    >
                      {val || ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'IBM Plex Mono' }}>Low</span>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map(t => (
            <div key={t} style={{
              width: 18, height: 10, borderRadius: 3,
              background: cellColor(Math.round(t * maxVal)),
            }} />
          ))}
          <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'IBM Plex Mono' }}>High</span>
          <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--faint)', fontFamily: 'IBM Plex Mono' }}>
            max: {maxVal}
          </span>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 10,
            ...TOOLTIP_STYLE, pointerEvents: 'none', zIndex: 9999,
            whiteSpace: 'nowrap',
          }}>
            <div style={{ color: '#60a5fa', fontWeight: 700, marginBottom: 3 }}>{tooltip.app}</div>
            <div style={{ color: '#94a3b8', marginBottom: 4 }}>{tooltip.type}</div>
            <div style={{ color: '#f1f5f9', fontWeight: 700 }}>{tooltip.val} alerts</div>
          </div>
        )}
      </div>
    </ChartCard>
  )
}

function SkeletonChart() {
  return (
    <div style={{ height: 220, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end', padding: '0 8px 8px' }}>
      {[60, 80, 45, 90, 55, 70].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: `${h}%`, borderRadius: 4 }} />
      ))}
    </div>
  )
}