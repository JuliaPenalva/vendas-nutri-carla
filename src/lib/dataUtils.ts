import { Venda, KPIData, ChartDataItem, MonthlyDataItem, AfiliadoData, CancelamentoKPI } from '@/types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function calcKPIs(current: Venda[], previous: Venda[]): KPIData {
  const completos = current.filter(v => v.status === 'Completo')
  const totalCompras = completos.length
  const faturamentoTotal = completos.reduce((s, v) => s + (v.faturamento_liquido || 0), 0)
  const percentualValidas = current.length > 0 ? (completos.length / current.length) * 100 : 0
  const ticketMedio = totalCompras > 0 ? faturamentoTotal / totalCompras : 0

  const prevCompletos = previous.filter(v => v.status === 'Completo')
  const totalComprasAnterior = prevCompletos.length
  const faturamentoAnterior = prevCompletos.reduce((s, v) => s + (v.faturamento_liquido || 0), 0)
  const percentualValidasAnterior = previous.length > 0 ? (prevCompletos.length / previous.length) * 100 : 0
  const ticketMedioAnterior = totalComprasAnterior > 0 ? faturamentoAnterior / totalComprasAnterior : 0

  return { totalCompras, faturamentoTotal, percentualValidas, ticketMedio, totalComprasAnterior, faturamentoAnterior, percentualValidasAnterior, ticketMedioAnterior }
}

export function calcCancelamentoKPIs(vendas: Venda[]): CancelamentoKPI {
  const cancelados = vendas.filter(v => v.status === 'Cancelado')
  const totalPerdas = cancelados.reduce((s, v) => s + (v.preco_total || 0), 0)
  const vendasCanceladas = cancelados.length
  const percentualCancelamento = vendas.length > 0 ? (cancelados.length / vendas.length) * 100 : 0
  return { totalPerdas, vendasCanceladas, percentualCancelamento }
}

export function faturamentoPorPlataforma(vendas: Venda[]): ChartDataItem[] {
  const completos = vendas.filter(v => v.status === 'Completo')
  const total = completos.reduce((s, v) => s + (v.faturamento_liquido || 0), 0)
  const map: Record<string, number> = {}
  completos.forEach(v => { map[v.plataforma] = (map[v.plataforma] || 0) + (v.faturamento_liquido || 0) })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, percent: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value)
}

export function faturamentoPorProduto(vendas: Venda[]): ChartDataItem[] {
  const completos = vendas.filter(v => v.status === 'Completo')
  const total = completos.reduce((s, v) => s + (v.faturamento_liquido || 0), 0)
  const map: Record<string, number> = {}
  completos.forEach(v => { map[v.nome_do_produto] = (map[v.nome_do_produto] || 0) + (v.faturamento_liquido || 0) })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, percent: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value)
}

export function faturamentoMensalPorChave(vendas: Venda[], chave: keyof Venda): MonthlyDataItem[] {
  const completos = vendas.filter(v => v.status === 'Completo')
  const map: Record<string, Record<string, number>> = {}

  completos.forEach(v => {
    const mes = format(parseISO(v.data_de_venda), 'MMM/yy', { locale: ptBR })
    const k = String(v[chave] || 'Desconhecido')
    if (!map[mes]) map[mes] = {}
    map[mes][k] = (map[mes][k] || 0) + (v.faturamento_liquido || 0)
  })

  return Object.entries(map)
    .map(([mes, vals]) => ({ mes, ...vals }))
    .sort((a, b) => {
      const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
      const getYear = (m: string) => parseInt(m.split('/')[1] || '0')
      const getMonth = (m: string) => months.findIndex(mo => m.toLowerCase().startsWith(mo))
      const yearDiff = getYear(String(a.mes)) - getYear(String(b.mes))
      return yearDiff !== 0 ? yearDiff : getMonth(String(a.mes)) - getMonth(String(b.mes))
    })
}

export function cancelamentoPorGrupo(vendas: Venda[], chave: keyof Venda): ChartDataItem[] {
  const map: Record<string, { total: number; cancelados: number }> = {}
  vendas.forEach(v => {
    const k = String(v[chave] || 'Sem afiliado')
    if (!map[k]) map[k] = { total: 0, cancelados: 0 }
    map[k].total++
    if (v.status === 'Cancelado') map[k].cancelados++
  })
  return Object.entries(map)
    .map(([name, { total, cancelados }]) => ({
      name,
      value: total > 0 ? (cancelados / total) * 100 : 0,
      percent: cancelados,
    }))
    .sort((a, b) => b.value - a.value)
}

export function cancelamentoMensalPorChave(vendas: Venda[], chave: keyof Venda): MonthlyDataItem[] {
  const map: Record<string, Record<string, { total: number; cancelados: number }>> = {}

  vendas.forEach(v => {
    const mes = format(parseISO(v.data_de_venda), 'MMM/yy', { locale: ptBR })
    const k = String(v[chave] || 'Sem afiliado')
    if (!map[mes]) map[mes] = {}
    if (!map[mes][k]) map[mes][k] = { total: 0, cancelados: 0 }
    map[mes][k].total++
    if (v.status === 'Cancelado') map[mes][k].cancelados++
  })

  return Object.entries(map)
    .map(([mes, vals]) => {
      const row: MonthlyDataItem = { mes }
      Object.entries(vals).forEach(([k, { total, cancelados }]) => {
        row[k] = total > 0 ? parseFloat(((cancelados / total) * 100).toFixed(1)) : 0
      })
      return row
    })
    .sort((a, b) => {
      const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
      const getYear = (m: string) => parseInt(m.split('/')[1] || '0')
      const getMonth = (m: string) => months.findIndex(mo => m.toLowerCase().startsWith(mo))
      const yearDiff = getYear(String(a.mes)) - getYear(String(b.mes))
      return yearDiff !== 0 ? yearDiff : getMonth(String(a.mes)) - getMonth(String(b.mes))
    })
}

export function calcAfiliados(vendas: Venda[]): AfiliadoData[] {
  const completos = vendas.filter(v => v.status === 'Completo')
  const totalFat = completos.reduce((s, v) => s + (v.faturamento_liquido || 0), 0)
  const map: Record<string, { vendas: number; faturamento: number }> = {}

  completos.forEach(v => {
    const k = v.nome_do_afiliado || '— Venda Direta —'
    if (!map[k]) map[k] = { vendas: 0, faturamento: 0 }
    map[k].vendas++
    map[k].faturamento += v.faturamento_liquido || 0
  })

  return Object.entries(map)
    .map(([afiliado, { vendas, faturamento }]) => ({
      afiliado,
      vendas,
      faturamento,
      percentual: totalFat > 0 ? (faturamento / totalFat) * 100 : 0,
    }))
    .sort((a, b) => b.faturamento - a.faturamento)
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(value)
}

export function formatBRLShort(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`
  return formatBRL(value)
}

export function formatNum(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPct(value: number): string {
  return value.toFixed(1).replace('.', ',') + '%'
}

export const PLATAFORMA_COLORS: Record<string, string> = {
  Hotmart: '#0F482F',
  Kiwify: '#779E39',
  Hubla: '#E5AB7E',
}

export const PRODUTO_COLORS = ['#0F482F', '#779E39', '#E5AB7E', '#5a7a2a', '#c8874a']
export const MUTED_COLOR = '#3a4a2a'
