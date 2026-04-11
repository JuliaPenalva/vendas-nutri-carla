'use client'
import { useState, useRef, useEffect } from 'react'
import { Filters } from '@/types'
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, subYears } from 'date-fns'
import { ChevronDown, Check, Calendar } from 'lucide-react'
import clsx from 'clsx'

interface FiltersBarProps {
  filters: Filters
  setFilters: (f: Filters) => void
  produtos: string[]
  plataformas: string[]
  anos: number[]
}

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d: Date) => format(d, 'yyyy-MM-dd')

function getQuarter(q: 1 | 2 | 3 | 4, year: number) {
  const monthStart = [0, 3, 6, 9][q - 1]
  const monthEnd   = [2, 5, 8, 11][q - 1]
  const from = new Date(year, monthStart, 1)
  const to   = new Date(year, monthEnd + 1, 0) // last day of monthEnd
  return { from: fmtDate(from), to: fmtDate(to) }
}

function getSemester(s: 1 | 2, year: number) {
  const from = new Date(year, s === 1 ? 0 : 6, 1)
  const to   = new Date(year, s === 1 ? 6 : 12, 0) // last day of Jun or Dec
  return { from: fmtDate(from), to: fmtDate(to) }
}

// ── MultiSelect ───────────────────────────────────────────────────────────────
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
      <button onClick={() => setOpen(o => !o)}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-body transition-colors',
          selected.length > 0
            ? 'border-accent-light text-accent bg-accent-light/10'
            : 'border-border text-text-dim hover:border-accent-light/50 bg-card'
        )}>
        <span className="max-w-[140px] truncate">{displayLabel}</span>
        <ChevronDown size={11} className={clsx('transition-transform shrink-0', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="dropdown-menu absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg min-w-[180px] py-1">
          {options.map(opt => (
            <button key={opt} onClick={() => toggle(opt)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-surface transition-colors text-text">
              <div className={clsx('w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                selected.includes(opt) ? 'bg-accent-light border-accent-light' : 'border-border')}>
                {selected.includes(opt) && <Check size={9} className="text-white" />}
              </div>
              <span className="truncate">{opt}</span>
            </button>
          ))}
          {selected.length > 0 && (
            <button onClick={() => onChange([])}
              className="w-full px-3 py-2 text-xs text-danger/70 hover:text-danger text-left border-t border-border mt-1">
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── DateRangePicker ───────────────────────────────────────────────────────────
function DateRangePicker({ dateFrom, dateTo, onChange }: {
  dateFrom: string; dateTo: string; onChange: (from: string, to: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [selecting, setSelecting] = useState<'from' | 'to'>('from')
  const [tempFrom, setTempFrom] = useState(dateFrom)
  const [tempTo, setTempTo] = useState(dateTo)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setTempFrom(dateFrom); setTempTo(dateTo) }, [dateFrom, dateTo])
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fmtDisplay = (d: string) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  const handleDayClick = (dateStr: string) => {
    if (selecting === 'from') {
      setTempFrom(dateStr); setTempTo(''); setSelecting('to')
    } else {
      const from = dateStr < tempFrom ? dateStr : tempFrom
      const to   = dateStr < tempFrom ? tempFrom : dateStr
      setTempTo(to); setSelecting('from')
      onChange(from, to)
      setTimeout(() => setOpen(false), 150)
    }
  }

  const prevM = calMonth === 0 ? 11 : calMonth - 1
  const prevY = calMonth === 0 ? calYear - 1 : calYear

  const CalMonth = ({ year, month }: { year: number; month: number }) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    const mNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return (
      <div className="w-52">
        <div className="text-center text-xs font-display font-semibold text-text mb-2">{mNames[month]} {year}</div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i} className="text-center text-[10px] text-muted py-0.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((d, i) => {
            if (!d) return <div key={i} />
            const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const isFrom = ds === tempFrom, isTo = ds === tempTo
            const inRange = tempFrom && tempTo && ds > tempFrom && ds < tempTo
            return (
              <button key={i} onClick={() => handleDayClick(ds)}
                className={clsx('text-[11px] py-1 rounded transition-colors text-center',
                  isFrom || isTo ? 'bg-accent text-white font-semibold' :
                  inRange ? 'bg-accent-light/20 text-accent' : 'hover:bg-surface text-text')}>
                {d}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-body text-text hover:border-accent-light/50 transition-colors">
        <Calendar size={11} className="text-accent-light shrink-0" />
        <span className="tabular-nums">{fmtDisplay(dateFrom)}</span>
        <span className="text-muted">→</span>
        <span className="tabular-nums">{fmtDisplay(dateTo)}</span>
      </button>
      {open && (
        <div className="dropdown-menu absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl p-4">
          <div className="text-xs text-text-dim mb-3">{selecting === 'from' ? '① Início' : '② Fim'}</div>
          <div className="flex gap-5">
            <div>
              <button onClick={() => { if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11) } else setCalMonth(m => m-1) }}
                className="text-muted hover:text-accent text-xs mb-2 block">‹ anterior</button>
              <CalMonth year={prevY} month={prevM} />
            </div>
            <div className="w-px bg-border" />
            <div>
              <button onClick={() => { if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0) } else setCalMonth(m => m+1) }}
                className="text-muted hover:text-accent text-xs mb-2 block">próximo ›</button>
              <CalMonth year={calYear} month={calMonth} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Preset Button ─────────────────────────────────────────────────────────────
function Btn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={clsx(
        'px-2.5 py-1 text-xs rounded-md border transition-colors font-body whitespace-nowrap',
        active ? 'border-accent bg-accent text-white' : 'border-border text-text-dim hover:border-accent-light hover:text-accent bg-card'
      )}>
      {label}
    </button>
  )
}

function GroupLabel({ children }: { children: string }) {
  return <span className="text-[10px] text-muted font-body uppercase tracking-wider self-center">{children}</span>
}

function Divider() {
  return <div className="w-px h-5 bg-border self-center" />
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FiltersBar({ filters, setFilters, produtos, plataformas, anos }: FiltersBarProps) {
  const today = new Date()
  const thisYear = today.getFullYear()
  const [refYear, setRefYear] = useState<number>(anos[0] ?? thisYear)

  // Update refYear when anos loads
  useEffect(() => {
    if (anos.length > 0 && !anos.includes(refYear)) setRefYear(anos[0])
  }, [anos, refYear])

  const set = (from: string, to: string) => setFilters({ ...filters, dateFrom: from, dateTo: to })

  // Toggle helper: if already active, reset to full refYear range; else apply
  const toggle = (from: string, to: string, isActive: boolean) => {
    if (isActive) {
      // deselect — go back to full year of refYear
      set(fmtDate(startOfYear(new Date(refYear, 0, 1))), fmtDate(endOfYear(new Date(refYear, 0, 1))))
    } else {
      set(from, to)
    }
  }

  const { dateFrom: f, dateTo: t } = filters

  // Active detection
  const is7d        = f === fmtDate(subDays(today, 7)) && t === fmtDate(today)
  const is30d       = f === fmtDate(subDays(today, 30)) && t === fmtDate(today)
  const is90d       = f === fmtDate(subDays(today, 90)) && t === fmtDate(today)
  const isThisMonth = f === fmtDate(startOfMonth(today)) && t === fmtDate(endOfMonth(today))
  const isLastMonth = f === fmtDate(startOfMonth(subMonths(today, 1))) && t === fmtDate(endOfMonth(subMonths(today, 1)))
  const isThisYear  = f === fmtDate(startOfYear(today)) && t === fmtDate(endOfYear(today))
  const isLastYear  = f === fmtDate(startOfYear(subYears(today, 1))) && t === fmtDate(endOfYear(subYears(today, 1)))

  const activeQ = ([1,2,3,4] as const).find(q => {
    const { from, to } = getQuarter(q, refYear)
    return f === from && t === to
  })
  const activeS = ([1,2] as const).find(s => {
    const { from, to } = getSemester(s, refYear)
    return f === from && t === to
  })

  return (
    <div className="px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-[49px] z-20">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">

        {/* Dias */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Dias</GroupLabel>
          <Btn label="7d"  active={is7d}  onClick={() => is7d  ? set('2025-01-01','2025-12-31') : set(fmtDate(subDays(today, 7)), fmtDate(today))} />
          <Btn label="30d" active={is30d} onClick={() => is30d ? set('2025-01-01','2025-12-31') : set(fmtDate(subDays(today, 30)), fmtDate(today))} />
          <Btn label="90d" active={is90d} onClick={() => is90d ? set('2025-01-01','2025-12-31') : set(fmtDate(subDays(today, 90)), fmtDate(today))} />
        </div>

        <Divider />

        {/* Mês — independente */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Mês</GroupLabel>
          <Btn label="Este mês" active={isThisMonth}
            onClick={() => isThisMonth
              ? set('2025-01-01','2025-12-31')
              : set(fmtDate(startOfMonth(today)), fmtDate(endOfMonth(today)))} />
          <Btn label="Último mês" active={isLastMonth}
            onClick={() => isLastMonth
              ? set('2025-01-01','2025-12-31')
              : set(fmtDate(startOfMonth(subMonths(today, 1))), fmtDate(endOfMonth(subMonths(today, 1))))} />
        </div>

        <Divider />

        {/* Ano Ref — dinâmico */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Ref.</GroupLabel>
          {anos.map(ano => (
            <button key={ano} onClick={() => setRefYear(ano)}
              className={clsx('px-2 py-1 text-xs rounded border transition-colors font-body',
                refYear === ano ? 'border-accent bg-accent text-white' : 'border-border text-text-dim bg-card hover:border-accent-light')}>
              {ano}
            </button>
          ))}
        </div>

        {/* Trimestre */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Trim.</GroupLabel>
          {([1,2,3,4] as const).map(q => {
            const { from, to } = getQuarter(q, refYear)
            const isActive = activeQ === q
            return <Btn key={q} label={`${q}ºT`} active={isActive} onClick={() => toggle(from, to, isActive)} />
          })}
        </div>

        <Divider />

        {/* Semestre */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Sem.</GroupLabel>
          {([1,2] as const).map(s => {
            const { from, to } = getSemester(s, refYear)
            const isActive = activeS === s
            return <Btn key={s} label={`${s}ºS`} active={isActive} onClick={() => toggle(from, to, isActive)} />
          })}
        </div>

        <Divider />

        {/* Ano — independente */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Ano</GroupLabel>
          <Btn label="Este ano" active={isThisYear}
            onClick={() => isThisYear
              ? set('2025-01-01','2025-12-31')
              : set(fmtDate(startOfYear(today)), fmtDate(endOfYear(today)))} />
          <Btn label="Último ano" active={isLastYear}
            onClick={() => isLastYear
              ? set('2025-01-01','2025-12-31')
              : set(fmtDate(startOfYear(subYears(today, 1))), fmtDate(endOfYear(subYears(today, 1))))} />
        </div>

        <Divider />

        {/* Calendário custom */}
        <DateRangePicker dateFrom={filters.dateFrom} dateTo={filters.dateTo}
          onChange={(from, to) => setFilters({ ...filters, dateFrom: from, dateTo: to })} />

        {/* Dropdowns */}
        <MultiSelect label="Plataforma" options={plataformas} selected={filters.plataformas}
          onChange={p => setFilters({ ...filters, plataformas: p })} />
        {produtos.length > 0 && (
          <MultiSelect label="Produto" options={produtos} selected={filters.produtos}
            onChange={p => setFilters({ ...filters, produtos: p })} />
        )}
      </div>
    </div>
  )
}
