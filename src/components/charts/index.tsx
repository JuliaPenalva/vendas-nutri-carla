'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell, LabelList,
} from 'recharts'
import { ChartDataItem, MonthlyDataItem, AfiliadoData } from '@/types'
import { formatBRL, formatBRLShort, formatPct, formatNum, PLATAFORMA_COLORS, PRODUTO_COLORS, MUTED_COLOR } from '@/lib/dataUtils'
import { Card, EmptyState, Skeleton, ProgressBar } from '@/components/ui'
import clsx from 'clsx'

const AXIS_STYLE = { fill: '#a8b090', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif' }
const GRID_STYLE = { stroke: '#3a4a2a', strokeDasharray: '3 3' }

// ── Custom label for bar end ──────────────────────────────────────────────────
const BarLabel = ({ x, y, width, height, value }: { x?: number; y?: number; width?: number; height?: number; value?: number }) => {
  if (!value || !x || !y || !width || !height) return null
  const isHorizontal = height < 30
  if (isHorizontal) {
    return (
      <text x={x + width + 6} y={y + height / 2 + 4} fill="#a8b090" fontSize={10} fontFamily="Plus Jakarta Sans">
        {formatBRLShort(value)}
      </text>
    )
  }
  return (
    <text x={x + width / 2} y={y - 4} textAnchor="middle" fill="#a8b090" fontSize={10} fontFamily="Plus Jakarta Sans">
      {formatBRLShort(value)}
    </text>
  )
}

// ── Horizontal Bar ────────────────────────────────────────────────────────────
interface HBarProps {
  data: ChartDataItem[]
  title: string
  loading?: boolean
  color?: string
  valueFormat?: 'brl' | 'pct'
  highlightNames?: string[]
}

export function HorizontalBarChart({ data, title, loading, color = '#779E39', valueFormat = 'brl', highlightNames }: HBarProps) {
  const fmt = (v: number) => valueFormat === 'brl' ? formatBRL(v) : formatPct(v)
  const fmtShort = (v: number) => valueFormat === 'brl' ? formatBRLShort(v) : formatPct(v)
  const hasHighlight = highlightNames && highlightNames.length > 0

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-body font-medium">{title}</h3>
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
      ) : data.length === 0 ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={data.length * 40 + 20}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 70 }}>
            <CartesianGrid horizontal={false} {...GRID_STYLE} />
            <XAxis type="number" tick={AXIS_STYLE} tickFormatter={fmtShort} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={170} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => [fmt(v), '']}
              contentStyle={{ background: '#222818', border: '1px solid #3a4a2a', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#EBE2D9' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
              <LabelList content={<BarLabel />} />
              {data.map((entry, i) => {
                const isHighlighted = !hasHighlight || highlightNames!.includes(entry.name)
                return <Cell key={i} fill={isHighlighted ? color : MUTED_COLOR} fillOpacity={isHighlighted ? 1 : 0.4} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// ── Stacked Bar ───────────────────────────────────────────────────────────────
interface StackedBarProps {
  data: MonthlyDataItem[]
  title: string
  keys: string[]
  colorMap?: Record<string, string>
  loading?: boolean
  valueFormat?: 'brl' | 'pct'
  highlightKeys?: string[]
}

export function StackedBarChart({ data, title, keys, colorMap, loading, valueFormat = 'brl', highlightKeys }: StackedBarProps) {
  const fmt = (v: number) => valueFormat === 'brl' ? formatBRLShort(v) : formatPct(v)
  const fmtFull = (v: number) => valueFormat === 'brl' ? formatBRL(v) : formatPct(v)
  const hasHighlight = highlightKeys && highlightKeys.length > 0

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-body font-medium">{title}</h3>
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : data.length === 0 ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} {...GRID_STYLE} />
            <XAxis dataKey="mes" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} tickFormatter={fmt} axisLine={false} tickLine={false} width={72} />
            <Tooltip
              formatter={(v: number, name: string) => [fmtFull(v), name]}
              contentStyle={{ background: '#222818', border: '1px solid #3a4a2a', borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', paddingTop: 8 }} />
            {keys.map((k, i) => {
              const isHighlighted = !hasHighlight || highlightKeys!.includes(k)
              const baseColor = colorMap?.[k] || PRODUTO_COLORS[i % PRODUTO_COLORS.length]
              return (
                <Bar
                  key={k}
                  dataKey={k}
                  stackId="a"
                  fill={isHighlighted ? baseColor : MUTED_COLOR}
                  fillOpacity={isHighlighted ? 1 : 0.3}
                  radius={i === keys.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// ── Line Chart ────────────────────────────────────────────────────────────────
interface LineChartProps {
  data: MonthlyDataItem[]
  title: string
  keys: string[]
  colorMap?: Record<string, string>
  loading?: boolean
  avgLine?: number
  highlightKeys?: string[]
}

export function CancelamentoLineChart({ data, title, keys, colorMap, loading, avgLine, highlightKeys }: LineChartProps) {
  const hasHighlight = highlightKeys && highlightKeys.length > 0

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-body font-medium">{title}</h3>
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
              contentStyle={{ background: '#222818', border: '1px solid #3a4a2a', borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', paddingTop: 8 }} />
            {keys.map((k, i) => {
              const isHighlighted = !hasHighlight || highlightKeys!.includes(k)
              const baseColor = colorMap?.[k] || PRODUTO_COLORS[i % PRODUTO_COLORS.length]
              return (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={isHighlighted ? baseColor : MUTED_COLOR}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={isHighlighted ? 1 : 0.3}
                  dot={{ r: 3, fill: isHighlighted ? baseColor : MUTED_COLOR }}
                  activeDot={{ r: 5 }}
                />
              )
            })}
            {avgLine !== undefined && (
              <Line dataKey={() => avgLine} stroke="#6b7a5a" strokeDasharray="4 4" strokeWidth={1} dot={false} name="Média geral" legendType="none" />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// ── Afiliados Table ───────────────────────────────────────────────────────────
export function AfiliadosTable({ data, loading }: { data: AfiliadoData[]; loading?: boolean }) {
  const maxFat = data[0]?.faturamento || 1

  return (
    <Card>
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-body font-medium mb-4">Performance de Afiliados</h3>
      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : data.length === 0 ? <EmptyState /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-text-dim">
                <th className="text-left py-2 pr-4 font-medium">#</th>
                <th className="text-left py-2 pr-4 font-medium">Afiliado</th>
                <th className="text-right py-2 pr-4 font-medium">Vendas</th>
                <th className="text-right py-2 pr-4 font-medium">Faturamento</th>
                <th className="text-left py-2 w-32 font-medium">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.afiliado} className={clsx('border-b border-border/40 hover:bg-border/20 transition-colors', i === 0 && 'text-accent-light')}>
                  <td className="py-2.5 pr-4 text-muted">{i + 1}</td>
                  <td className="py-2.5 pr-4 font-medium">
                    {row.afiliado === '— Venda Direta —'
                      ? <span className="text-text-dim italic">{row.afiliado}</span>
                      : row.afiliado}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{formatNum(row.vendas)}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-success">{formatBRL(row.faturamento)}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={row.faturamento} max={maxFat} color={i === 0 ? '#779E39' : '#0F482F'} />
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
