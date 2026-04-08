'use client'
import { useState } from 'react'
import { useVendas, useFilters, usePreviousPeriodVendas, useMetaData } from '@/hooks/useVendas'
import FiltersBar from '@/components/ui/FiltersBar'
import VisaoGeral from '@/components/VisaoGeral'
import Cancelamentos from '@/components/Cancelamentos'
import clsx from 'clsx'
import { BarChart2, XCircle, Activity } from 'lucide-react'

const TABS = [
  { id: 'visao', label: 'Visão Geral', icon: BarChart2 },
  { id: 'cancelamentos', label: 'Cancelamentos', icon: XCircle },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('visao')
  const { filters, setFilters } = useFilters()
  const { data: vendas, loading, error } = useVendas(filters)
  const previous = usePreviousPeriodVendas(filters)
  const { produtos, plataformas } = useMetaData()

  return (
    <div className="min-h-screen bg-bg bg-grid-pattern bg-grid">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-accent/20 border border-accent/40 flex items-center justify-center">
              <Activity size={12} className="text-accent" />
            </div>
            <span className="font-display font-bold text-sm tracking-wider text-text">
              NUTRI<span className="text-accent">DASH</span>
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
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-display transition-all',
                    activeTab === tab.id
                      ? 'bg-accent/10 text-accent border border-accent/30'
                      : 'text-text-dim hover:text-text hover:bg-border/40'
                  )}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
          <div className="text-xs text-muted font-body">
            {loading ? (
              <span className="text-accent animate-pulse">● carregando...</span>
            ) : error ? (
              <span className="text-danger">● erro</span>
            ) : (
              <span><span className="text-success">●</span> {vendas.length.toLocaleString('pt-BR')} registros</span>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        produtos={produtos}
        plataformas={plataformas}
      />

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-lg border border-danger/40 bg-danger/5 text-danger text-sm">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* Content */}
      <main>
        {activeTab === 'visao' && (
          <VisaoGeral vendas={vendas} previous={previous} loading={loading} />
        )}
        {activeTab === 'cancelamentos' && (
          <Cancelamentos vendas={vendas} loading={loading} />
        )}
      </main>
    </div>
  )
}
