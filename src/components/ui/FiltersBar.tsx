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
}

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

function getQuarter(q: 1|2|3|4, year: number) {
  const starts = [0, 3, 6, 9]
  const ends   = [2, 5, 8, 11]
  const from = new Date(year, starts[q - 1], 1)
  const to   = new Date(year, ends[q - 1] + 1, 0)
  return { from: fmt(from), to: fmt(to) }
}

function getSemester(s: 1|2, year: number) {
  const from = new Date(year, s === 1 ? 0 : 6, 1)
  const to   = new Date(year, s === 1 ? 5 : 11, s === 1 ? 30 : 31)
  return { from: fmt(from), to: fmt(to) }
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
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-body transition-colors',
          selected.length > 0
            ? 'border-accent-light text-accent bg-accent-light/10'
            : 'border-border text-text-dim hover:border-accent-light/50 bg-card'
        )}
      >
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

  const prevMonth2 = calMonth === 0 ? 11 : calMonth - 1
  const prevYear2  = calMonth === 0 ? calYear - 1 : calYear

  const CalendarMonth = ({ year, month }: { year: number; month: number }) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

    return (
      <div className="w-52">
        <div className="text-center text-xs font-display font-semibold text-text mb-2">{monthNames[month]} {year}</div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted py-0.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((d, i) => {
            if (!d) return <div key={i} />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const isFrom = dateStr === tempFrom
            const isTo   = dateStr === tempTo
            const inRange = tempFrom && tempTo && dateStr > tempFrom && dateStr < tempTo
            return (
              <button key={i} onClick={() => handleDayClick(dateStr)}
                className={clsx('text-[11px] py-1 rounded transition-colors text-center',
                  isFrom || isTo ? 'bg-accent text-white font-semibold' :
                  inRange ? 'bg-accent-light/20 text-accent' :
                  'hover:bg-surface text-text')}>
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
          <div className="text-xs text-text-dim mb-3 font-body">
            {selecting === 'from' ? '① Selecione a data de início' : '② Selecione a data de fim'}
          </div>
          <div className="flex gap-5">
            <div>
              <button onClick={() => { if (calMonth === 0) { setCalYear(y => y-1); setCalMonth(11) } else setCalMonth(m => m-1) }}
                className="text-muted hover:text-accent text-xs mb-2 block">‹ anterior</button>
              <CalendarMonth year={prevYear2} month={prevMonth2} />
            </div>
            <div className="w-px bg-border" />
            <div>
              <button onClick={() => { if (calMonth === 11) { setCalYear(y => y+1); setCalMonth(0) } else setCalMonth(m => m+1) }}
                className="text-muted hover:text-accent text-xs mb-2 block">próximo ›</button>
              <CalendarMonth year={calYear} month={calMonth} />
            </div>
          </div>
          {tempFrom && (
            <div className="mt-3 pt-3 border-t border-border text-xs text-text-dim">
              {fmtDisplay(tempFrom)}{tempTo && <> → <span className="text-accent font-medium">{fmtDisplay(tempTo)}</span></>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Preset Button ─────────────────────────────────────────────────────────────
function PresetBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={clsx(
        'px-2.5 py-1 text-xs rounded-md border transition-colors font-body whitespace-nowrap',
        active
          ? 'border-accent bg-accent text-white'
          : 'border-border text-text-dim hover:border-accent-light hover:text-accent bg-card'
      )}>
      {label}
    </button>
  )
}

// ── Group label ───────────────────────────────────────────────────────────────
function GroupLabel({ children }: { children: string }) {
  return <span className="text-[10px] text-muted font-body uppercase tracking-wider self-center">{children}</span>
}

// ── Main FiltersBar ───────────────────────────────────────────────────────────
export default function FiltersBar({ filters, setFilters, produtos, plataformas }: FiltersBarProps) {
  const today = new Date()
  const thisYear = today.getFullYear()
  const lastYear = thisYear - 1

  // Detect active preset to highlight button
  const active = (() => {
    const { dateFrom: f, dateTo: t } = filters
    if (f === fmt(subDays(today, 7))  && t === fmt(today)) return '7d'
    if (f === fmt(subDays(today, 30)) && t === fmt(today)) return '30d'
    if (f === fmt(subDays(today, 90)) && t === fmt(today)) return '90d'
    if (f === fmt(startOfMonth(today)) && t === fmt(endOfMonth(today))) return 'thisMonth'
    if (f === fmt(startOfMonth(subMonths(today, 1))) && t === fmt(endOfMonth(subMonths(today, 1)))) return 'lastMonth'
    for (const q of [1,2,3,4] as const) {
      const qy = getQuarter(q, thisYear)
      if (f === qy.from && t === qy.to) return `Q${q}-${thisYear}`
      const qly = getQuarter(q, lastYear)
      if (f === qly.from && t === qly.to) return `Q${q}-${lastYear}`
    }
    for (const s of [1,2] as const) {
      const sy = getSemester(s, thisYear)
      if (f === sy.from && t === sy.to) return `S${s}-${thisYear}`
      const sly = getSemester(s, lastYear)
      if (f === sly.from && t === sly.to) return `S${s}-${lastYear}`
    }
    if (f === fmt(startOfYear(today)) && t === fmt(endOfYear(today))) return 'thisYear'
    if (f === fmt(startOfYear(subYears(today, 1))) && t === fmt(endOfYear(subYears(today, 1)))) return 'lastYear'
    return null
  })()

  // Ref year: which year the period buttons refer to (this or last)
  const [refYear, setRefYear] = useState(thisYear)

  const set = (from: string, to: string) => setFilters({ ...filters, dateFrom: from, dateTo: to })

  return (
    <div className="px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-[49px] z-20">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

        {/* Dias */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Dias</GroupLabel>
          <PresetBtn label="7d"  active={active === '7d'}  onClick={() => set(fmt(subDays(today, 7)),  fmt(today))} />
          <PresetBtn label="30d" active={active === '30d'} onClick={() => set(fmt(subDays(today, 30)), fmt(today))} />
          <PresetBtn label="90d" active={active === '90d'} onClick={() => set(fmt(subDays(today, 90)), fmt(today))} />
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Mês */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Mês</GroupLabel>
          <PresetBtn label="Este mês" active={active === 'thisMonth'}
            onClick={() => set(fmt(startOfMonth(today)), fmt(endOfMonth(today)))} />
          <PresetBtn label="Último mês" active={active === 'lastMonth'}
            onClick={() => set(fmt(startOfMonth(subMonths(today, 1))), fmt(endOfMonth(subMonths(today, 1))))} />
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Ano de referência para T e S */}
        <div className="flex items-center gap-1">
          <GroupLabel>Ref.</GroupLabel>
          <button onClick={() => setRefYear(thisYear)}
            className={clsx('px-2 py-1 text-xs rounded border transition-colors font-body',
              refYear === thisYear ? 'border-accent bg-accent text-white' : 'border-border text-text-dim bg-card hover:border-accent-light')}>
            {thisYear}
          </button>
          <button onClick={() => setRefYear(lastYear)}
            className={clsx('px-2 py-1 text-xs rounded border transition-colors font-body',
              refYear === lastYear ? 'border-accent bg-accent text-white' : 'border-border text-text-dim bg-card hover:border-accent-light')}>
            {lastYear}
          </button>
        </div>

        {/* Trimestre */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Trim.</GroupLabel>
          {([1,2,3,4] as const).map(q => {
            const { from, to } = getQuarter(q, refYear)
            return (
              <PresetBtn key={q} label={`${q}ºT`} active={active === `Q${q}-${refYear}`}
                onClick={() => set(from, to)} />
            )
          })}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Semestre */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Sem.</GroupLabel>
          {([1,2] as const).map(s => {
            const { from, to } = getSemester(s, refYear)
            return (
              <PresetBtn key={s} label={`${s}ºS`} active={active === `S${s}-${refYear}`}
                onClick={() => set(from, to)} />
            )
          })}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Ano */}
        <div className="flex items-center gap-1.5">
          <GroupLabel>Ano</GroupLabel>
          <PresetBtn label="Este ano" active={active === 'thisYear'}
            onClick={() => set(fmt(startOfYear(today)), fmt(endOfYear(today)))} />
          <PresetBtn label="Último ano" active={active === 'lastYear'}
            onClick={() => set(fmt(startOfYear(subYears(today, 1))), fmt(endOfYear(subYears(today, 1))))} />
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Calendário custom */}
        <DateRangePicker
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onChange={(from, to) => setFilters({ ...filters, dateFrom: from, dateTo: to })}
        />

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
