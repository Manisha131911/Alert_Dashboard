import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import KpiCards from './components/KpiCards'
import {
  DailyChart, SeverityChart, AppsChart,
  SeverityPerAppChart, DescriptionsChart, HeatmapChart,
} from './components/Charts'
import ChatDrawer from './components/ChatDrawer'
import DataTable from './components/DataTable'
import { useFetch } from './hooks/useApi'

const TABS = ['Overview', 'Deep Dive', 'Data Table']

export default function App() {
  const [meta, setMeta]       = useState(null)
  const [filters, setFilters] = useState(null)
  const [activeTab, setTab]   = useState(0)
  const [chatOpen, setChat]   = useState(false)

  // Load meta on mount
  useEffect(() => {
    axios.get('/api/meta').then(res => {
      const m = res.data
      setMeta(m)
      setFilters({
        severities:   m.severities,
        applications: m.applications,
        dateFrom:     m.date_min,
        dateTo:       m.date_max,
      })
    }).catch(console.error)
  }, [])

  const { data: kpis, loading: kpiLoading } = useFetch('/kpis', filters ?? {})

  // Chart data
  const { data: daily,     loading: l1 } = useFetch('/charts/daily',        filters ?? {})
  const { data: sevDist,   loading: l2 } = useFetch('/charts/severity',     filters ?? {})
  const { data: apps,      loading: l3 } = useFetch('/charts/apps',         filters ?? {})
  const { data: heatmap,   loading: l4 } = useFetch('/charts/heatmap',      filters ?? {})
  const { data: sevApp,    loading: l5 } = useFetch('/charts/severity-app', filters ?? {})
  const { data: descs,     loading: l6 } = useFetch('/charts/descriptions', filters ?? {})

  if (!filters) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, margin: '0 auto 14px',
            boxShadow: '0 4px 20px rgba(59,130,246,.35)',
          }}>⚡</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.05em' }}>
            Connecting to AlertsIQ API…
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{
              width: 24, height: 24, border: '2px solid var(--border2)',
              borderTopColor: '#3b82f6', borderRadius: '50%',
              animation: 'spin .8s linear infinite', margin: '0 auto',
            }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar meta={meta} filters={filters} onChange={setFilters} />

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '0 28px 40px' }}>
        {/* Header */}
        <div style={{
          padding: '22px 0 18px', marginBottom: 20,
          borderBottom: '1px solid var(--border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 4px 20px rgba(59,130,246,.35)',
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.04em' }}>
                AlertsIQ Dashboard
              </div>
              <div style={{
                fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
                marginTop: 5, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {kpis ? `${kpis.total} alerts · ${kpis.n_apps} apps` : '…'}
                &nbsp;&nbsp;
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(5,150,105,.1)', border: '1px solid rgba(5,150,105,.25)',
                  borderRadius: 20, padding: '3px 9px',
                  fontSize: 10, fontWeight: 700, color: '#34d399',
                  letterSpacing: '.1em', textTransform: 'uppercase',
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', background: '#10b981',
                    boxShadow: '0 0 6px #10b981', animation: 'pulse 1.8s infinite',
                  }} />
                  Live
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setChat(v => !v)}
            style={{
              padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: chatOpen
                ? 'rgba(59,130,246,.15)'
                : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              fontFamily: 'var(--font-sans)',
              boxShadow: chatOpen ? 'none' : '0 4px 18px rgba(59,130,246,.35)',
              transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            💬 {chatOpen ? 'Close AI' : 'Chat AI'}
          </button>
        </div>

        {/* KPIs */}
        <KpiCards data={kpis} loading={kpiLoading} />

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 3, padding: 4,
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 13, marginBottom: 20, width: 'fit-content',
        }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                padding: '7px 20px', borderRadius: 10, cursor: 'pointer',
                background: activeTab === i ? 'var(--surface3)' : 'transparent',
                color: activeTab === i ? '#e2e8f0' : 'var(--muted)',
                fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-sans)',
                border: activeTab === i ? '1px solid var(--border3)' : '1px solid transparent',
                boxShadow: activeTab === i ? '0 2px 12px rgba(59,130,246,.15)' : 'none',
                transition: 'all .18s', letterSpacing: '.01em',
              }}
            >
              {['📊', '🔍', '📄'][i]} {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}
            className="animate-in">
            <DailyChart    data={daily}   loading={l1} />
            <SeverityChart data={sevDist} loading={l2} total={kpis?.total} />
            <AppsChart     data={apps}    loading={l3} />
          </div>
        )}

        {activeTab === 1 && (
          <div className="animate-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <HeatmapChart    data={heatmap} loading={l4} />
              <SeverityPerAppChart data={sevApp} loading={l5} />
            </div>
            <DescriptionsChart data={descs} loading={l6} />
          </div>
        )}

        {activeTab === 2 && (
          <div className="animate-in">
            <DataTable filters={filters} />
          </div>
        )}
      </main>

      <ChatDrawer open={chatOpen} onClose={() => setChat(false)} kpiData={kpis} filters={filters} />
    </div>
  )
}