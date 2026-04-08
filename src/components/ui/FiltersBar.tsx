'use client'
import { useState, useRef, useEffect } from 'react'
import { Filters } from '@/types'
import { format, subMonths, subDays } from 'date-fns'
import { ChevronDown, Check } from 'lucide-react'
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

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item])
  }

  const displayLabel = selected.length === 0
    ? label
    : selected.length === 1
    ? selected[0]
    : `${selected.length} selecionados`

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-body transition-colors',
          selected.length > 0
            ? 'border-accent-light text-accent-light bg-accent-light/10'
            : 'border-border text-text-dim hover:border-accent-light/50'
        )}
      >
        <span className="max-w-[140px] truncate">{displayLabel}</span>
        <ChevronDown size={12} className={clsx('transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="dropdown-menu absolute top-full left-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-xl min-w-[180px] py-1">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-card transition-colors"
            >
              <div className={clsx(
                'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                selected.includes(opt) ? 'bg-accent-light border-accent-light' : 'border-border'
              )}>
                {selected.includes(opt) && <Check size={9} className="text-bg" />}
              </div>
              <span className="truncate">{opt}</span>
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full px-3 py-2 text-xs text-danger/70 hover:text-danger text-left border-t border-border mt-1 pt-2"
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function FiltersBar({ filters, setFilters, produtos, plataformas }: FiltersBarProps) {
  const applyPreset = (days?: number, months?: number) => {
    const to = new Date()
    const from = months ? subMonths(to, months) : subDays(to, days!)
    setFilters({ ...filters, dateFrom: format(from, 'yyyy-MM-dd'), dateTo: format(to, 'yyyy-MM-dd') })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-surface/60 backdrop-blur-sm sticky top-[49px] z-20">
      {/* Presets */}
      <div className="flex gap-1">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.days, p.months)}
            className="px-2.5 py-1 text-xs rounded-md border border-border text-text-dim hover:border-accent-light hover:text-accent-light transition-colors font-body"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-1.5 text-xs text-text-dim">
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
          className="bg-card border border-border rounded-lg px-2 py-1.5 text-text text-xs focus:outline-none focus:border-accent-light cursor-pointer"
        />
        <span className="text-muted">→</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
          className="bg-card border border-border rounded-lg px-2 py-1.5 text-text text-xs focus:outline-none focus:border-accent-light cursor-pointer"
        />
      </div>

      {/* Dropdowns */}
      <MultiSelect
        label="Plataforma"
        options={plataformas}
        selected={filters.plataformas}
        onChange={plataformas => setFilters({ ...filters, plataformas })}
      />
      {produtos.length > 0 && (
        <MultiSelect
          label="Produto"
          options={produtos}
          selected={filters.produtos}
          onChange={produtos => setFilters({ ...filters, produtos })}
        />
      )}
    </div>
  )
}
