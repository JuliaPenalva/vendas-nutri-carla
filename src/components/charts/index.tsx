'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts'
import { ChartDataItem, MonthlyDataItem, AfiliadoData } from '@/types'
import { formatBRL, formatBRLShort, formatPct, formatNum, PLATAFORMA_COLORS, PRODUTO_COLORS, MUTED_COLOR } from '@/lib/dataUtils'
import { Card, EmptyState, Skeleton, ProgressBar } from '@/components/ui'
import clsx from 'clsx'

const AXIS_STYLE = { fill: '#6b5d45', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif' }
const GRID_STYLE = { stroke: '#D6CDB8', strokeDasharray: '3 3' }

const TOOLTIP_STYLE = {
  contentStyle: { background: '#2a2018', border: '1px solid #3a3020', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#F5F0E8' },
  itemStyle: { color: '#EDE7DA' },
}

// ── Custom end label ──────────────────────────────────────────────────────────
interface CustomLabelProps {
  x?: number; y?: number; width?: number; height?: number; value?: number; format?: 'brl' | 'pct'
}
const EndLabel = ({ x = 0, y = 0, width = 0, height = 0, value = 0, format = 'brl' }: CustomLabelProps) => {
  if (!value) return null
  const label = format === 'pct' ? formatPct(value) : formatBRLShort(value)
  return (
    <text x={x + width + 6} y={y + height / 2 + 4} fill="#6b5d45" fontSize={10} fontFamily="Plus Jakarta Sans">
      {label}
    </text>
  )
}

// ── Horizontal Bar (thin, tall) ───────────────────────────────────────────────
interface HBarProps {
  data: ChartDataItem[]
  title: string
  loading?: boolean
  color?: string
  valueFormat?: 'brl' | 'pct'
  highlightNames?: string[]
}

export function HorizontalBarChart({ data, title, loading, color = '#779E39', valueFormat = 'brl', highlightNames }: HBarProps) {
  const hasHighlight = highlightNames && highlightNames.length > 0

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-display italic">{title}</h3>
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
      ) : data.length === 0 ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={data.length * 36 + 16}>
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 72 }}>
            <CartesianGrid horizontal={false} {...GRID_STYLE} />
            <XAxis type="number" tick={AXIS_STYLE} tickFormatter={v => valueFormat === 'pct' ? formatPct(v) : formatBRLShort(v)} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={165} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => [valueFormat === 'pct' ? formatPct(v) : formatBRL(v), '']}
              {...TOOLTIP_STYLE}
            />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={10}>
              {data.map((entry, i) => {
                const isHighlighted = !hasHighlight || highlightNames!.includes(entry.name)
                return <Cell key={i} fill={isHighlighted ? color : MUTED_COLOR} fillOpacity={isHighlighted ? 1 : 0.35} />
              })}
              <EndLabel format={valueFormat} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

// ── Stacked Bar (monthly, wider) ──────────────────────────────────────────────
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
  const fmtTick = (v: number) => valueFormat === 'brl' ? formatBRLShort(v) : `${v}%`
  const fmtFull = (v: number) => valueFormat === 'brl' ? formatBRL(v) : formatPct(v)
  const hasHighlight = highlightKeys && highlightKeys.length > 0

  return (
    <Card className="flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-display italic">{title}</h3>
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : data.length === 0 ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ left: 0, right: 8 }} barCategoryGap="25%">
            <CartesianGrid vertical={false} {...GRID_STYLE} />
            <XAxis dataKey="mes" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} tickFormatter={fmtTick} axisLine={false} tickLine={false} width={72} />
            <Tooltip formatter={(v: number, name: string) => [fmtFull(v), name]} {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', paddingTop: 8 }} />
            {keys.map((k, i) => {
              const isHighlighted = !hasHighlight || highlightKeys!.includes(k)
              const baseColor = colorMap?.[k] || PRODUTO_COLORS[i % PRODUTO_COLORS.length]
              return (
                <Bar key={k} dataKey={k} stackId="a"
                  fill={isHighlighted ? baseColor : MUTED_COLOR}
                  fillOpacity={isHighlighted ? 1 : 0.25}
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
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-display italic">{title}</h3>
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : data.length === 0 ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="mes" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} width={44} />
            <Tooltip formatter={(v: number, name: string) => [`${Number(v).toFixed(1)}%`, name]} {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', paddingTop: 8 }} />
            {keys.map((k, i) => {
              const isHighlighted = !hasHighlight || highlightKeys!.includes(k)
              const baseColor = colorMap?.[k] || PRODUTO_COLORS[i % PRODUTO_COLORS.length]
              return (
                <Line key={k} type="monotone" dataKey={k}
                  stroke={isHighlighted ? baseColor : MUTED_COLOR}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={isHighlighted ? 1 : 0.3}
                  dot={{ r: 3, fill: isHighlighted ? baseColor : MUTED_COLOR }}
                  activeDot={{ r: 5 }}
                />
              )
            })}
            {avgLine !== undefined && (
              <Line dataKey={() => avgLine} stroke="#8a7a60" strokeDasharray="4 4" strokeWidth={1} dot={false} name="Média geral" legendType="none" />
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
      <h3 className="text-xs uppercase tracking-widest text-text-dim font-display italic mb-4">Performance de Afiliados</h3>
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
                <tr key={row.afiliado} className={clsx('border-b border-border/60 hover:bg-surface transition-colors', i === 0 && 'font-medium')}>
                  <td className="py-2.5 pr-4 text-muted">{i + 1}</td>
                  <td className="py-2.5 pr-4" style={{ color: i === 0 ? '#0F482F' : '#2a2018' }}>
                    {row.afiliado === '— Venda Direta —'
                      ? <span className="text-text-dim italic">{row.afiliado}</span>
                      : row.afiliado}
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-text-dim">{formatNum(row.vendas)}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: '#0F482F' }}>{formatBRL(row.faturamento)}</td>
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
