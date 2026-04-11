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

const fd = (d: Date) => format(d, 'yyyy-MM-dd')

function getQuarter(q: 1|2|3|4, year: number) {
  const ms = [0,3,6,9][q-1], me = [2,5,8,11][q-1]
  return { from: fd(new Date(year, ms, 1)), to: fd(new Date(year, me+1, 0)) }
}
function getSemester(s: 1|2, year: number) {
  const from = new Date(year, s===1?0:6, 1)
  const to   = new Date(year, s===1?6:12, 0)
  return { from: fd(from), to: fd(to) }
}

// ── MultiSelect ───────────────────────────────────────────────────────────────
function MultiSelect({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const toggle = (item: string) => onChange(selected.includes(item) ? selected.filter(x=>x!==item) : [...selected, item])
  const label_ = selected.length===0 ? label : selected.length===1 ? selected[0] : `${selected.length} selecionados`
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o=>!o)} className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-body transition-colors h-[30px]',
        selected.length>0 ? 'border-accent-light text-accent bg-accent-light/10' : 'border-border text-text-dim hover:border-accent-light/50 bg-card'
      )}>
        <span className="max-w-[140px] truncate">{label_}</span>
        <ChevronDown size={11} className={clsx('transition-transform shrink-0', open&&'rotate-180')} />
      </button>
      {open && (
        <div className="dropdown-menu absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg min-w-[180px] py-1">
          {options.map(opt => (
            <button key={opt} onClick={()=>toggle(opt)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-surface transition-colors text-text">
              <div className={clsx('w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0', selected.includes(opt)?'bg-accent-light border-accent-light':'border-border')}>
                {selected.includes(opt) && <Check size={9} className="text-white" />}
              </div>
              <span className="truncate">{opt}</span>
            </button>
          ))}
          {selected.length>0 && <button onClick={()=>onChange([])} className="w-full px-3 py-2 text-xs text-danger/70 hover:text-danger text-left border-t border-border mt-1">Limpar</button>}
        </div>
      )}
    </div>
  )
}

// ── DateRangePicker ───────────────────────────────────────────────────────────
function DateRangePicker({ dateFrom, dateTo, onChange, active }: {
  dateFrom: string; dateTo: string; onChange: (from: string, to: string) => void; active: boolean
}) {
  const [open, setOpen] = useState(false)
  const [selecting, setSelecting] = useState<'from'|'to'>('from')
  const [tempFrom, setTempFrom] = useState(dateFrom)
  const [tempTo, setTempTo] = useState(dateTo)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setTempFrom(dateFrom); setTempTo(dateTo) }, [dateFrom, dateTo])
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const fmtD = (d: string) => { if (!d) return '—'; const [y,m,day]=d.split('-'); return `${day}/${m}/${y}` }

  const handleDay = (ds: string) => {
    if (selecting==='from') { setTempFrom(ds); setTempTo(''); setSelecting('to') }
    else {
      const from = ds<tempFrom?ds:tempFrom, to = ds<tempFrom?tempFrom:ds
      setTempTo(to); setSelecting('from'); onChange(from,to); setTimeout(()=>setOpen(false),150)
    }
  }

  const prevM = calMonth===0?11:calMonth-1, prevY = calMonth===0?calYear-1:calYear

  const CalMonth = ({ year, month }: { year:number; month:number }) => {
    const fd2 = new Date(year,month,1).getDay(), dim = new Date(year,month+1,0).getDate()
    const days: (number|null)[] = []
    for (let i=0;i<fd2;i++) days.push(null)
    for (let i=1;i<=dim;i++) days.push(i)
    const mn = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return (
      <div className="w-52">
        <div className="text-center text-xs font-display font-semibold text-text mb-2">{mn[month]} {year}</div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['D','S','T','Q','Q','S','S'].map((d,i)=><div key={i} className="text-center text-[10px] text-muted py-0.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((d,i)=>{
            if (!d) return <div key={i}/>
            const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
            const isF=ds===tempFrom, isT=ds===tempTo, inR=tempFrom&&tempTo&&ds>tempFrom&&ds<tempTo
            return <button key={i} onClick={()=>handleDay(ds)} className={clsx('text-[11px] py-1 rounded transition-colors text-center', isF||isT?'bg-accent text-white font-semibold':inR?'bg-accent-light/20 text-accent':'hover:bg-surface text-text')}>{d}</button>
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(o=>!o)} className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-body transition-colors h-[30px]',
        active ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-card text-text hover:border-accent-light/50'
      )}>
        <Calendar size={11} className="text-accent-light shrink-0"/>
        <span className="tabular-nums">{fmtD(dateFrom)}</span>
        <span className="text-muted">→</span>
        <span className="tabular-nums">{fmtD(dateTo)}</span>
      </button>
      {open && (
        <div className="dropdown-menu absolute top-full right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl p-4">
          <div className="text-xs text-text-dim mb-3">{selecting==='from'?'① Início':'② Fim'}</div>
          <div className="flex gap-5">
            <div>
              <button onClick={()=>{if(calMonth===0){setCalYear(y=>y-1);setCalMonth(11)}else setCalMonth(m=>m-1)}} className="text-muted hover:text-accent text-xs mb-2 block">‹ anterior</button>
              <CalMonth year={prevY} month={prevM}/>
            </div>
            <div className="w-px bg-border"/>
            <div>
              <button onClick={()=>{if(calMonth===11){setCalYear(y=>y+1);setCalMonth(0)}else setCalMonth(m=>m+1)}} className="text-muted hover:text-accent text-xs mb-2 block">próximo ›</button>
              <CalMonth year={calYear} month={calMonth}/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Btn ───────────────────────────────────────────────────────────────────────
function Btn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={clsx(
      'px-2.5 py-1 text-xs rounded-md border transition-colors font-body whitespace-nowrap h-[30px]',
      active ? 'border-accent bg-accent text-white' : 'border-border text-text-dim hover:border-accent-light hover:text-accent bg-card'
    )}>{label}</button>
  )
}
function GL({ children }: { children: string }) {
  return <span className="text-[10px] text-muted font-body uppercase tracking-wider self-center">{children}</span>
}
function Div() { return <div className="w-px h-5 bg-border self-center"/> }

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FiltersBar({ filters, setFilters, produtos, plataformas, anos }: FiltersBarProps) {
  const today = new Date()
  const [refYear, setRefYear] = useState<number>(2025)
  useEffect(() => { if (anos.length>0) setRefYear(anos[0]) }, [anos])

  const { dateFrom: f, dateTo: t } = filters

  // ── Detect active group ────────────────────────────────────────────────────
  const is7d        = f===fd(subDays(today,7))  && t===fd(today)
  const is30d       = f===fd(subDays(today,30)) && t===fd(today)
  const is90d       = f===fd(subDays(today,90)) && t===fd(today)
  const activeDias  = is7d?'7d':is30d?'30d':is90d?'90d':null

  const isThisMonth = f===fd(startOfMonth(today)) && t===fd(endOfMonth(today))
  const isLastMonth = f===fd(startOfMonth(subMonths(today,1))) && t===fd(endOfMonth(subMonths(today,1)))
  const activeMes   = isThisMonth?'this':isLastMonth?'last':null

  const isThisYear  = f===fd(startOfYear(today)) && t===fd(endOfYear(today))
  const isLastYear  = f===fd(startOfYear(subYears(today,1))) && t===fd(endOfYear(subYears(today,1)))
  const activeAno   = isThisYear?'this':isLastYear?'last':null

  const activeQ = ([1,2,3,4] as const).find(q => { const {from,to}=getQuarter(q,refYear); return f===from&&t===to }) ?? null
  const activeS = ([1,2] as const).find(s => { const {from,to}=getSemester(s,refYear); return f===from&&t===to }) ?? null
  const activeRefGroup = activeQ!==null||activeS!==null

  // Calendário está ativo se nenhum outro grupo está ativo
  const calActive = !activeDias && !activeMes && !activeAno && !activeRefGroup

  // ── Setters que limpam outros grupos ──────────────────────────────────────
  const setDate = (from: string, to: string) => setFilters({ ...filters, dateFrom: from, dateTo: to })

  const setDias = (days: number, key: string) => {
    if (activeDias===key) return // já ativo, não faz nada
    setDate(fd(subDays(today,days)), fd(today))
  }
  const setMes = (type: 'this'|'last') => {
    if (activeMes===type) return
    setDate(
      type==='this' ? fd(startOfMonth(today)) : fd(startOfMonth(subMonths(today,1))),
      type==='this' ? fd(endOfMonth(today))   : fd(endOfMonth(subMonths(today,1)))
    )
  }
  const setAno = (type: 'this'|'last') => {
    if (activeAno===type) return
    setDate(
      type==='this' ? fd(startOfYear(today)) : fd(startOfYear(subYears(today,1))),
      type==='this' ? fd(endOfYear(today))   : fd(endOfYear(subYears(today,1)))
    )
  }
  const setQ = (q: 1|2|3|4) => {
    const {from,to} = getQuarter(q,refYear)
    if (activeQ===q) { setDate(fd(startOfYear(new Date(refYear,0,1))), fd(endOfYear(new Date(refYear,0,1)))); return }
    setDate(from,to)
  }
  const setS = (s: 1|2) => {
    const {from,to} = getSemester(s,refYear)
    if (activeS===s) { setDate(fd(startOfYear(new Date(refYear,0,1))), fd(endOfYear(new Date(refYear,0,1)))); return }
    setDate(from,to)
  }

  return (
    <div className="px-6 py-2.5 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-[49px] z-20">
      {/* Linha 1 */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">

        {/* QUADRANTE DIAS */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-card/40">
          <GL>Dias</GL>
          <Btn label="7d"  active={activeDias==='7d'}  onClick={()=>setDias(7,'7d')} />
          <Btn label="30d" active={activeDias==='30d'} onClick={()=>setDias(30,'30d')} />
          <Btn label="90d" active={activeDias==='90d'} onClick={()=>setDias(90,'90d')} />
        </div>

        <Div/>

        {/* QUADRANTE MÊS */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-card/40">
          <GL>Mês</GL>
          <Btn label="Este mês"   active={activeMes==='this'} onClick={()=>setMes('this')} />
          <Btn label="Último mês" active={activeMes==='last'} onClick={()=>setMes('last')} />
        </div>

        <Div/>

        {/* QUADRANTE REF + TRIM + SEM */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border/60 bg-card/40">
          <GL>Ref.</GL>
          {anos.map(ano => (
            <button key={ano} onClick={()=>setRefYear(ano)} className={clsx(
              'px-2 py-1 text-xs rounded border transition-colors font-body h-[30px]',
              refYear===ano ? 'border-accent bg-accent text-white' : 'border-border text-text-dim bg-card hover:border-accent-light'
            )}>{ano}</button>
          ))}
          <Div/>
          <GL>Trim.</GL>
          {([1,2,3,4] as const).map(q => <Btn key={q} label={`${q}ºT`} active={activeQ===q} onClick={()=>setQ(q)}/>)}
          <Div/>
          <GL>Sem.</GL>
          {([1,2] as const).map(s => <Btn key={s} label={`${s}ºS`} active={activeS===s} onClick={()=>setS(s)}/>)}
        </div>

        <Div/>

        {/* QUADRANTE ANO */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-card/40">
          <GL>Ano</GL>
          <Btn label="Este ano"   active={activeAno==='this'} onClick={()=>setAno('this')} />
          <Btn label="Último ano" active={activeAno==='last'} onClick={()=>setAno('last')} />
        </div>

        <Div/>

        {/* CALENDÁRIO CUSTOM */}
        <DateRangePicker
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          active={calActive}
          onChange={(from,to) => setFilters({...filters, dateFrom: from, dateTo: to})}
        />

        <Div/>

        {/* PLATAFORMA + PRODUTO — independentes */}
        <MultiSelect label="Plataforma" options={plataformas} selected={filters.plataformas}
          onChange={p => setFilters({...filters, plataformas: p})} />
        {produtos.length>0 && (
          <MultiSelect label="Produto" options={produtos} selected={filters.produtos}
            onChange={p => setFilters({...filters, produtos: p})} />
        )}
      </div>
    </div>
  )
}
