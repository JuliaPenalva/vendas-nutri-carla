'use client'
import { Filters } from '@/types'
import { format, subMonths, subDays } from 'date-fns'
import { Calendar, Filter } from 'lucide-react'
import clsx from 'clsx'

interface FiltersBarProps {
  filters: Filters
  setFilters: (f: Filters) => void
  produtos: string[]
  plataformas: string[]
}

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '12m', months: 12 },
]

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
}

export default function FiltersBar({ filters, setFilters, produtos, plataformas }: FiltersBarProps) {
  const applyPreset = (days?: number, months?: number) => {
    const to = new Date()
    const from = months ? subMonths(to, months) : subDays(to, days!)
    setFilters({ ...filters, dateFrom: format(from, 'yyyy-MM-dd'), dateTo: format(to, 'yyyy-MM-dd') })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-20">
      <Filter size={14} className="text-accent shrink-0" />

      {/* Date presets */}
      <div className="flex gap-1">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.days, p.months)}
            className="px-2.5 py-1 text-xs rounded-md border border-border text-text-dim hover:border-accent hover:text-accent transition-colors font-body"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="flex items-center gap-1.5 text-xs text-text-dim">
        <Calendar size={12} className="text-accent" />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
          className="bg-card border border-border rounded-md px-2 py-1 text-text text-xs focus:outline-none focus:border-accent"
        />
        <span>→</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
          className="bg-card border border-border rounded-md px-2 py-1 text-text text-xs focus:outline-none focus:border-accent"
        />
      </div>

      {/* Plataformas */}
      <div className="flex gap-1">
        {plataformas.map(p => (
          <button
            key={p}
            onClick={() => setFilters({ ...filters, plataformas: toggleItem(filters.plataformas, p) })}
            className={clsx(
              'px-2.5 py-1 text-xs rounded-md border transition-colors font-body',
              filters.plataformas.includes(p)
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-text-dim hover:border-accent/50'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Produtos */}
      {produtos.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {produtos.map(p => (
            <button
              key={p}
              onClick={() => setFilters({ ...filters, produtos: toggleItem(filters.produtos, p) })}
              className={clsx(
                'px-2 py-1 text-xs rounded-md border transition-colors font-body max-w-[160px] truncate',
                filters.produtos.includes(p)
                  ? 'border-success text-success bg-success/10'
                  : 'border-border text-text-dim hover:border-success/50'
              )}
              title={p}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
