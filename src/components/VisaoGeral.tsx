'use client'
import { useMemo } from 'react'
import { Venda } from '@/types'
import { KPICard, SectionTitle } from '@/components/ui'
import { HorizontalBarChart, StackedBarChart, AfiliadosTable } from '@/components/charts'
import {
  calcKPIs, faturamentoPorPlataforma, faturamentoPorProduto,
  faturamentoMensalPorChave, calcAfiliados,
  PLATAFORMA_COLORS,
} from '@/lib/dataUtils'
import { ShoppingCart, DollarSign, CheckCircle, TrendingUp } from 'lucide-react'
import { Filters } from '@/types'

interface Props {
  vendas: Venda[]
  previous: Venda[]
  loading: boolean
  filters: Filters
}

export default function VisaoGeral({ vendas, previous, loading, filters }: Props) {
  const kpis = useMemo(() => calcKPIs(vendas, previous), [vendas, previous])
  const porPlataforma = useMemo(() => faturamentoPorPlataforma(vendas), [vendas])
  const porProduto = useMemo(() => faturamentoPorProduto(vendas), [vendas])
  const mensalPlat = useMemo(() => faturamentoMensalPorChave(vendas, 'plataforma'), [vendas])
  const mensalProd = useMemo(() => faturamentoMensalPorChave(vendas, 'nome_do_produto'), [vendas])
  const afiliados = useMemo(() => calcAfiliados(vendas), [vendas])

  const plataformaKeys = ['Hotmart', 'Kiwify', 'Hubla']
  const produtoKeys = Array.from(new Set(vendas.map(v => v.nome_do_produto))).sort()

  const highlightPlataformas = filters.plataformas.length > 0 ? filters.plataformas : undefined
  const highlightProdutos = filters.produtos.length > 0 ? filters.produtos : undefined

  return (
    <div className="p-6 space-y-8">
      <section>
        <SectionTitle>KPIs Gerais</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total de Compras" value={kpis.totalCompras} previous={kpis.totalComprasAnterior} format="num" icon={<ShoppingCart size={16} />} accent="#779E39" loading={loading} />
          <KPICard label="Faturamento Total" value={kpis.faturamentoTotal} previous={kpis.faturamentoAnterior} format="brl" icon={<DollarSign size={16} />} accent="#0F482F" loading={loading} />
          <KPICard label="% Vendas Válidas" value={kpis.percentualValidas} previous={kpis.percentualValidasAnterior} format="pct" icon={<CheckCircle size={16} />} accent="#E5AB7E" loading={loading} />
          <KPICard label="Ticket Médio" value={kpis.ticketMedio} previous={kpis.ticketMedioAnterior} format="brl" icon={<TrendingUp size={16} />} accent="#779E39" loading={loading} />
        </div>
      </section>

      <section>
        <SectionTitle>Por Plataforma</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HorizontalBarChart data={porPlataforma} title="Faturamento por Plataforma" loading={loading} color="#779E39" valueFormat="brl" highlightNames={highlightPlataformas} />
          <StackedBarChart data={mensalPlat} title="Faturamento Mensal por Plataforma" keys={plataformaKeys} colorMap={PLATAFORMA_COLORS} loading={loading} highlightKeys={highlightPlataformas} />
        </div>
      </section>

      <section>
        <SectionTitle>Por Produto</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HorizontalBarChart data={porProduto} title="Faturamento por Produto" loading={loading} color="#0F482F" valueFormat="brl" highlightNames={highlightProdutos} />
          <StackedBarChart data={mensalProd} title="Faturamento Mensal por Produto" keys={produtoKeys} loading={loading} highlightKeys={highlightProdutos} />
        </div>
      </section>

      <section>
        <SectionTitle>Afiliados</SectionTitle>
        <AfiliadosTable data={afiliados} loading={loading} />
      </section>
    </div>
  )
}
