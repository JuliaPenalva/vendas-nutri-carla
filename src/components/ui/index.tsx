'use client'
import { ReactNode } from 'react'
import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatBRL, formatNum, formatPct } from '@/lib/dataUtils'

// ── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('animate-pulse rounded-lg bg-border/60', className)} />
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx(
      'rounded-xl border border-border bg-card p-5 relative overflow-hidden',
      className
    )}>
      {children}
    </div>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
type KPIFormat = 'brl' | 'num' | 'pct'

interface KPICardProps {
  label: string
  value: number
  previous?: number
  format?: KPIFormat
  icon?: ReactNode
  accent?: string
  loading?: boolean
}

function formatValue(v: number, f: KPIFormat) {
  if (f === 'brl') return formatBRL(v)
  if (f === 'pct') return formatPct(v)
  return formatNum(v)
}

export function KPICard({ label, value, previous, format = 'num', icon, accent = '#00d4ff', loading }: KPICardProps) {
  const delta = previous !== undefined && previous > 0 ? ((value - previous) / previous) * 100 : null

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-8 w-36 mb-3" />
        <Skeleton className="h-3 w-16" />
      </Card>
    )
  }

  return (
    <Card>
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between mb-3 pl-2">
        <span className="text-xs text-text-dim uppercase tracking-widest font-display">{label}</span>
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      <div className="text-3xl font-display font-bold text-text pl-2 mb-2" style={{ color: accent }}>
        {formatValue(value, format)}
      </div>
      {delta !== null && (
        <div className={clsx('flex items-center gap-1 text-xs pl-2', delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-muted')}>
          {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
          <span>{Math.abs(delta).toFixed(1)}% vs período anterior</span>
        </div>
      )}
    </Card>
  )
}

// ── Section Title ─────────────────────────────────────────────────────────────
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display font-700 text-sm uppercase tracking-widest text-text-dim mb-4 flex items-center gap-2">
      <span className="w-4 h-px bg-accent inline-block" />
      {children}
    </h2>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ message = 'Nenhum dado encontrado para os filtros selecionados.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-dim text-sm gap-2">
      <span className="text-2xl">◌</span>
      <span>{message}</span>
    </div>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color = '#00d4ff' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}
