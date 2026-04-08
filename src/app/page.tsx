'use client'
import { useState } from 'react'
import { useVendas, useFilters, usePreviousPeriodVendas, useMetaData } from '@/hooks/useVendas'
import FiltersBar from '@/components/ui/FiltersBar'
import VisaoGeral from '@/components/VisaoGeral'
import Cancelamentos from '@/components/Cancelamentos'
import clsx from 'clsx'
import { BarChart2, XCircle } from 'lucide-react'

const TABS = [
  { id: 'visao', label: 'Visão Geral', icon: BarChart2 },
  { id: 'cancelamentos', label: 'Cancelamentos', icon: XCircle },
]

// Leaf SVG icon
function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 3C21 3 15 3 9 7C4.5 10.5 3 15 3 21C3 21 7 18 10 15C10 15 9 19 12 21C12 21 14 14 21 3Z" fill="#779E39" stroke="#779E39" strokeWidth="1" strokeLinejoin="round"/>
      <path d="M3 21L10 14" stroke="#EBE2D9" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('visao')
  const { filters, setFilters } = useFilters()
  const { data: vendas, loading, error } = useVendas(filters)
  const previous = usePreviousPeriodVendas(filters)
  const { produtos, plataformas } = useMetaData()

  return (
    <div className="min-h-screen bg-bg bg-grid-pattern bg-grid">
      {/* Header */}
      <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <LeafIcon />
            <span className="font-display font-semibold text-base text-cream">
              Nutri<span className="text-accent-light">Dash</span>
            </span>
          </div>

          <nav className="flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-accent/80 text-cream border border-accent-light/30'
                      : 'text-text-dim hover:text-cream hover:bg-border/40'
                  )}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className="w-24" /> {/* spacer for balance */}
        </div>
      </header>

      {/* Filters */}
      <FiltersBar filters={filters} setFilters={setFilters} produtos={produtos} plataformas={plataformas} />

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-lg border border-danger/40 bg-danger/5 text-danger text-sm">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Content */}
      <main>
        {activeTab === 'visao' && (
          <VisaoGeral vendas={vendas} previous={previous} loading={loading} filters={filters} />
        )}
        {activeTab === 'cancelamentos' && (
          <Cancelamentos vendas={vendas} loading={loading} filters={filters} />
        )}
      </main>
    </div>
  )
}
