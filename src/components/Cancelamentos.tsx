'use client'
import { useMemo } from 'react'
import { Venda, Filters } from '@/types'
import { KPICard, SectionTitle } from '@/components/ui'
import { HorizontalBarChart, CancelamentoLineChart } from '@/components/charts'
import {
  calcCancelamentoKPIs, cancelamentoPorGrupo, cancelamentoMensalPorChave,
  PLATAFORMA_COLORS, PRODUTO_COLORS,
} from '@/lib/dataUtils'
import { AlertTriangle, XCircle, TrendingDown } from 'lucide-react'

interface Props {
  vendas: Venda[]
  loading: boolean
  filters: Filters
}

export default function Cancelamentos({ vendas, loading, filters }: Props) {
  const kpis = useMemo(() => calcCancelamentoKPIs(vendas), [vendas])
  const porPlataforma = useMemo(() => cancelamentoPorGrupo(vendas, 'plataforma'), [vendas])
  const porProduto = useMemo(() => cancelamentoPorGrupo(vendas, 'nome_do_produto'), [vendas])
  const porAfiliado = useMemo(() => cancelamentoPorGrupo(vendas, 'nome_do_afiliado').slice(0, 10), [vendas])

  const mensalPlat = useMemo(() => cancelamentoMensalPorChave(vendas, 'plataforma'), [vendas])
  const mensalProd = useMemo(() => cancelamentoMensalPorChave(vendas, 'nome_do_produto'), [vendas])
  const mensalAfil = useMemo(() => {
    const topAfiliados = cancelamentoPorGrupo(vendas, 'nome_do_afiliado').slice(0, 5).map(a => a.name)
    const allMonths = cancelamentoMensalPorChave(vendas, 'nome_do_afiliado')
    return allMonths.map(row => {
      const filtered: typeof row = { mes: row.mes }
      topAfiliados.forEach(k => { filtered[k] = row[k] || 0 })
      return filtered
    })
  }, [vendas])

  const plataformaKeys = ['Hotmart', 'Kiwify', 'Hubla']
  const produtoKeys = Array.from(new Set(vendas.map(v => v.nome_do_produto))).sort()
  const afiliadoKeys = Array.from(new Set(mensalAfil.flatMap(r => Object.keys(r).filter(k => k !== 'mes'))))
  const afiliadoColors = ['#0F482F','#779E39','#E5AB7E','#5a7a2a','#c8874a']
  const afiliadoColorMap = Object.fromEntries(afiliadoKeys.map((k, i) => [k, afiliadoColors[i % afiliadoColors.length]]))
  const produtoColorMap = Object.fromEntries(produtoKeys.map((k, i) => [k, PRODUTO_COLORS[i % PRODUTO_COLORS.length]]))

  const highlightPlataformas = filters.plataformas.length > 0 ? filters.plataformas : undefined
  const highlightProdutos = filters.produtos.length > 0 ? filters.produtos : undefined

  return (
    <div className="p-6 space-y-8">
      <section>
        <SectionTitle>KPIs de Cancelamento</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard label="Total de Perdas" value={kpis.totalPerdas} format="brl" icon={<AlertTriangle size={16} />} accent="#c0392b" loading={loading} />
          <KPICard label="Vendas Canceladas" value={kpis.vendasCanceladas} format="num" icon={<XCircle size={16} />} accent="#E5AB7E" loading={loading} />
          <KPICard label="% de Cancelamento" value={kpis.percentualCancelamento} format="pct" icon={<TrendingDown size={16} />} accent="#c0392b" loading={loading} />
        </div>
      </section>

      <section>
        <SectionTitle>Cancelamento por Grupo</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <HorizontalBarChart data={porPlataforma} title="Por Plataforma (%)" loading={loading} color="#c0392b" valueFormat="pct" highlightNames={highlightPlataformas} />
          <HorizontalBarChart data={porProduto} title="Por Produto (%)" loading={loading} color="#E5AB7E" valueFormat="pct" highlightNames={highlightProdutos} />
          <HorizontalBarChart data={porAfiliado} title="Por Afiliado — Top 10 (%)" loading={loading} color="#779E39" valueFormat="pct" />
        </div>
      </section>

      <section>
        <SectionTitle>Evolução Mensal</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CancelamentoLineChart data={mensalPlat} title="Cancelamento Mensal por Plataforma" keys={plataformaKeys} colorMap={PLATAFORMA_COLORS} loading={loading} avgLine={kpis.percentualCancelamento} highlightKeys={highlightPlataformas} />
          <CancelamentoLineChart data={mensalProd} title="Cancelamento Mensal por Produto" keys={produtoKeys} colorMap={produtoColorMap} loading={loading} avgLine={kpis.percentualCancelamento} highlightKeys={highlightProdutos} />
        </div>
        <div className="mt-4">
          <CancelamentoLineChart data={mensalAfil} title="Cancelamento Mensal — Top 5 Afiliados" keys={afiliadoKeys} colorMap={afiliadoColorMap} loading={loading} avgLine={kpis.percentualCancelamento} />
        </div>
      </section>
    </div>
  )
}
