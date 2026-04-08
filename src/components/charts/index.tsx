'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts'
import { ChartDataItem, MonthlyDataItem } from '@/types'
import { formatBRL, formatPct, PLATAFORMA_COLORS, PRODUTO_COLORS } from '@/lib/dataUtils'
import { Card, EmptyState, Skeleton } from '@/components/ui'
import clsx from 'clsx'

const AXIS_STYLE = { fill: '#4a6080', fontSize: 11, fontFamily: 'DM Mono, monospace' }
const GRID_STYLE = { stroke: '#1e2a3a', strokeDasharray: '3 3' }

// ── Horizontal Bar (faturamento por grupo) ───────────────────────────────────
interface HBarProps {
  data: ChartDataItem[]
  title: string
  loading?: boolean
  color?: string
  valueFormat?: 'brl' | 'pct'
}

export function HorizontalBarChart({ data, title, loading, color = '#00d4ff', valueFormat = 'brl' }: HBarProps) {
  const fmt = (v: number) => valueFormat === 'brl' ? formatBRL(v) : formatPct(v)

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-display">{title}</h3>
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      ) : data.length === 0 ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={data.length * 52 + 20}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 60 }}>
            <CartesianGrid horizontal={false} {...GRID_STYLE} />
            <XAxis type="number" tick={AXIS_STYLE} tickFormatter={fmt} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={180} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => [fmt(v), '']}
              contentStyle={{ background: '#131928', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#e2eaf5' }}
            />
            <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((_, i) => <Cell key={i} fillOpacity={1 - i * 0.12} fill={color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// ── Stacked Bar (mensal) ─────────────────────────────────────────────────────
interface StackedBarProps {
  data: MonthlyDataItem[]
  title: string
  keys: string[]
  colorMap?: Record<string, string>
  loading?: boolean
  valueFormat?: 'brl' | 'pct'
}

export function StackedBarChart({ data, title, keys, colorMap, loading, valueFormat = 'brl' }: StackedBarProps) {
  const fmt = (v: number) => valueFormat === 'brl' ? formatBRL(v) : formatPct(v)

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-display">{title}</h3>
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : data.length === 0 ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} {...GRID_STYLE} />
            <XAxis dataKey="mes" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} tickFormatter={fmt} axisLine={false} tickLine={false} width={80} />
            <Tooltip
              formatter={(v: number, name: string) => [fmt(v), name]}
              contentStyle={{ background: '#131928', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'DM Mono, monospace', paddingTop: 8 }} />
            {keys.map((k, i) => (
              <Bar key={k} dataKey={k} stackId="a" fill={colorMap?.[k] || PRODUTO_COLORS[i % PRODUTO_COLORS.length]} radius={i === keys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// ── Line Chart (cancelamento mensal) ─────────────────────────────────────────
interface LineChartProps {
  data: MonthlyDataItem[]
  title: string
  keys: string[]
  colorMap?: Record<string, string>
  loading?: boolean
  avgLine?: number
}

export function CancelamentoLineChart({ data, title, keys, colorMap, loading, avgLine }: LineChartProps) {
  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-display">{title}</h3>
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : data.length === 0 ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="mes" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
              contentStyle={{ background: '#131928', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'DM Mono, monospace', paddingTop: 8 }} />
            {keys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={colorMap?.[k] || PRODUTO_COLORS[i % PRODUTO_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: colorMap?.[k] || PRODUTO_COLORS[i % PRODUTO_COLORS.length] }}
                activeDot={{ r: 5 }}
              />
            ))}
            {avgLine !== undefined && (
              <Line dataKey={() => avgLine} stroke="#4a6080" strokeDasharray="4 4" strokeWidth={1} dot={false} name="Média geral" legendType="none" />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// ── Afiliados Table ──────────────────────────────────────────────────────────
import { AfiliadoData } from '@/types'
import { formatBRL as fBRL, formatNum } from '@/lib/dataUtils'
import { ProgressBar } from '@/components/ui'

export function AfiliadosTable({ data, loading }: { data: AfiliadoData[]; loading?: boolean }) {
  const maxFat = data[0]?.faturamento || 1

  return (
    <Card>
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-display mb-4">Performance de Afiliados</h3>
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : data.length === 0 ? <EmptyState /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-text-dim">
                <th className="text-left py-2 pr-4 font-normal">#</th>
                <th className="text-left py-2 pr-4 font-normal">Afiliado</th>
                <th className="text-right py-2 pr-4 font-normal">Vendas</th>
                <th className="text-right py-2 pr-4 font-normal">Faturamento</th>
                <th className="text-left py-2 w-32 font-normal">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.afiliado} className={clsx('border-b border-border/40 hover:bg-border/20 transition-colors', i === 0 && 'text-accent')}>
                  <td className="py-2.5 pr-4 text-muted">{i + 1}</td>
                  <td className="py-2.5 pr-4 font-display">
                    {row.afiliado === '— Venda Direta —'
                      ? <span className="text-text-dim italic">{row.afiliado}</span>
                      : row.afiliado}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{formatNum(row.vendas)}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-success">{fBRL(row.faturamento)}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={row.faturamento} max={maxFat} color={i === 0 ? '#00d4ff' : '#00e5a0'} />
                      <span className="text-text-dim w-10 text-right shrink-0">{row.percentual.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
