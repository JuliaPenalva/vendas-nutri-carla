'use client'
import { useState, useRef, useEffect } from 'react'
import { Filters } from '@/types'
import { format, subMonths, subDays } from 'date-fns'
import { ChevronDown, Check, Calendar } from 'lucide-react'
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

function MultiSelect({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (item: string) =>
    onChange(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item])

  const displayLabel = selected.length === 0 ? label
    : selected.length === 1 ? selected[0]
    : `${selected.length} selecionados`

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-body transition-colors',
          selected.length > 0
            ? 'border-accent-light text-accent bg-accent-light/10'
            : 'border-border text-text-dim hover:border-accent-light/50 bg-card'
        )}
      >
        <span className="max-w-[140px] truncate">{displayLabel}</span>
        <ChevronDown size={12} className={clsx('transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="dropdown-menu absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg min-w-[180px] py-1">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-surface transition-colors text-text"
            >
              <div className={clsx(
                'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                selected.includes(opt) ? 'bg-accent-light border-accent-light' : 'border-border'
              )}>
                {selected.includes(opt) && <Check size={9} className="text-white" />}
              </div>
              <span className="truncate">{opt}</span>
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full px-3 py-2 text-xs text-danger/70 hover:text-danger text-left border-t border-border mt-1"
            >
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function DateRangePicker({ dateFrom, dateTo, onChange }: {
  dateFrom: string; dateTo: string; onChange: (from: string, to: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [selecting, setSelecting] = useState<'from' | 'to'>('from')
  const [tempFrom, setTempFrom] = useState(dateFrom)
  const [tempTo, setTempTo] = useState(dateTo)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTempFrom(dateFrom)
    setTempTo(dateTo)
  }, [dateFrom, dateTo])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fmt = (d: string) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  const handleDayClick = (dateStr: string) => {
    if (selecting === 'from') {
      setTempFrom(dateStr)
      setTempTo('')
      setSelecting('to')
    } else {
      if (dateStr < tempFrom) {
        setTempTo(tempFrom)
        setTempFrom(dateStr)
      } else {
        setTempTo(dateStr)
      }
      setSelecting('from')
      onChange(dateStr < tempFrom ? dateStr : tempFrom, dateStr < tempFrom ? tempFrom : dateStr)
      setTimeout(() => setOpen(false), 150)
    }
  }

  // Generate calendar for a given year/month
  const CalendarMonth = ({ year, month }: { year: number; month: number }) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

    return (
      <div className="w-56">
        <div className="text-center text-xs font-display font-semibold text-text mb-2">
          {monthNames[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((d, i) => {
            if (!d) return <div key={i} />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const isFrom = dateStr === tempFrom
            const isTo = dateStr === tempTo
            const inRange = tempFrom && tempTo && dateStr > tempFrom && dateStr < tempTo
            return (
              <button
                key={i}
                onClick={() => handleDayClick(dateStr)}
                className={clsx(
                  'text-[11px] py-1 rounded transition-colors text-center',
                  isFrom || isTo ? 'bg-accent text-white font-semibold' :
                  inRange ? 'bg-accent-light/20 text-accent' :
                  'hover:bg-surface text-text'
                )}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  const prevMonth2 = calMonth === 0 ? 11 : calMonth - 1
  const prevYear2 = calMonth === 0 ? calYear - 1 : calYear

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-body text-text hover:border-accent-light/50 transition-colors"
      >
        <Calendar size={12} className="text-accent-light shrink-0" />
        <span className="tabular-nums">{fmt(dateFrom)}</span>
        <span className="text-muted">→</span>
        <span className="tabular-nums">{fmt(dateTo)}</span>
      </button>

      {open && (
        <div className="dropdown-menu absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl p-4">
          <div className="text-xs text-text-dim mb-3 font-body">
            {selecting === 'from' ? '① Selecione a data de início' : '② Selecione a data de fim'}
          </div>
          <div className="flex gap-6">
            <div>
              <button onClick={prevMonth} className="text-muted hover:text-accent text-xs mb-1">‹ mês anterior</button>
              <CalendarMonth year={prevYear2} month={prevMonth2} />
            </div>
            <div className="w-px bg-border" />
            <div>
              <button onClick={nextMonth} className="text-muted hover:text-accent text-xs mb-1">próximo mês ›</button>
              <CalendarMonth year={calYear} month={calMonth} />
            </div>
          </div>
          {tempFrom && (
            <div className="mt-3 pt-3 border-t border-border text-xs text-text-dim">
              Selecionado: <span className="text-accent font-medium">{fmt(tempFrom)}</span>
              {tempTo && <> → <span className="text-accent font-medium">{fmt(tempTo)}</span></>}
            </div>
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
    <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-[49px] z-20">
      {/* Presets */}
      <div className="flex gap-1">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.days, p.months)}
            className="px-2.5 py-1 text-xs rounded-md border border-border text-text-dim hover:border-accent-light hover:text-accent transition-colors font-body bg-card"
          >
            {p.label}
          </button>
        ))}
      </div>

      <DateRangePicker
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChange={(from, to) => setFilters({ ...filters, dateFrom: from, dateTo: to })}
      />

      <MultiSelect label="Plataforma" options={plataformas} selected={filters.plataformas}
        onChange={plataformas => setFilters({ ...filters, plataformas })} />
      {produtos.length > 0 && (
        <MultiSelect label="Produto" options={produtos} selected={filters.produtos}
          onChange={produtos => setFilters({ ...filters, produtos })} />
      )}
    </div>
  )
}
