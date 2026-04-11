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

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 3C21 3 15 3 9 7C4.5 10.5 3 15 3 21C3 21 7 18 10 15C10 15 9 19 12 21C12 21 14 14 21 3Z" fill="#0F482F" stroke="#0F482F" strokeWidth="0.5" strokeLinejoin="round"/>
      <path d="M3 21L10 14" stroke="#779E39" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('visao')
  const { filters, setFilters } = useFilters()
  const { data: vendas, loading, error } = useVendas(filters)
  const previous = usePreviousPeriodVendas(filters)
  const { produtos, plataformas, anos } = useMetaData()

  return (
    <div className="min-h-screen bg-bg bg-grid-pattern bg-grid">
      <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <LeafIcon />
            <span className="font-display font-semibold text-base text-accent">
              Nutri<span className="text-accent-light">Dash</span>
            </span>
          </div>
          <nav className="flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-accent text-white border border-accent/20'
                      : 'text-text-dim hover:text-text hover:bg-border/60'
<<<<<<< HEAD
                  )}
                >
=======
                  )}>
>>>>>>> vercel-code
                  <Icon size={13} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
<<<<<<< HEAD

=======
>>>>>>> vercel-code
          <div className="w-24" />
        </div>
      </header>

<<<<<<< HEAD
      <FiltersBar filters={filters} setFilters={setFilters} produtos={produtos} plataformas={plataformas} />
=======
      <FiltersBar filters={filters} setFilters={setFilters} produtos={produtos} plataformas={plataformas} anos={anos} />
>>>>>>> vercel-code

      {error && (
        <div className="mx-6 mt-4 p-4 rounded-lg border border-danger/30 bg-danger/5 text-danger text-sm">
          Erro ao carregar dados: {error}
        </div>
      )}

      <main>
        {activeTab === 'visao' && <VisaoGeral vendas={vendas} previous={previous} loading={loading} filters={filters} />}
        {activeTab === 'cancelamentos' && <Cancelamentos vendas={vendas} loading={loading} filters={filters} />}
      </main>
    </div>
  )
}
