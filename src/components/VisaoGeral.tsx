'use client'
import { useMemo } from 'react'
import { Venda } from '@/types'
import { KPICard, SectionTitle } from '@/components/ui'
import { HorizontalBarChart, StackedBarChart, AfiliadosTable } from '@/components/charts'
import {
  calcKPIs, faturamentoPorPlataforma, faturamentoPorProduto,
  faturamentoMensalPorChave, calcAfiliados,
  PLATAFORMA_COLORS, PRODUTO_COLORS,
} from '@/lib/dataUtils'
import { ShoppingCart, DollarSign, CheckCircle } from 'lucide-react'

interface Props {
  vendas: Venda[]
  previous: Venda[]
  loading: boolean
}

export default function VisaoGeral({ vendas, previous, loading }: Props) {
  const kpis = useMemo(() => calcKPIs(vendas, previous), [vendas, previous])
  const porPlataforma = useMemo(() => faturamentoPorPlataforma(vendas), [vendas])
  const porProduto = useMemo(() => faturamentoPorProduto(vendas), [vendas])
  const mensalPlat = useMemo(() => faturamentoMensalPorChave(vendas, 'plataforma'), [vendas])
  const mensalProd = useMemo(() => faturamentoMensalPorChave(vendas, 'nome_do_produto'), [vendas])
  const afiliados = useMemo(() => calcAfiliados(vendas), [vendas])

  const plataformaKeys = ['Hotmart', 'Kiwify', 'Hubla']
  const produtoKeys = Array.from(new Set(vendas.map(v => v.nome_do_produto))).sort()
  const produtoColorMap = Object.fromEntries(produtoKeys.map((k, i) => [k, PRODUTO_COLORS[i % PRODUTO_COLORS.length]]))

  return (
    <div className="p-6 space-y-8">
      {/* KPIs */}
      <section>
        <SectionTitle>KPIs Gerais</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            label="Total de Compras"
            value={kpis.totalCompras}
            previous={kpis.totalComprasAnterior}
            format="num"
            icon={<ShoppingCart size={16} />}
            accent="#00d4ff"
            loading={loading}
          />
          <KPICard
            label="Faturamento Total"
            value={kpis.faturamentoTotal}
            previous={kpis.faturamentoAnterior}
            format="brl"
            icon={<DollarSign size={16} />}
            accent="#00e5a0"
            loading={loading}
          />
          <KPICard
            label="% Vendas Válidas"
            value={kpis.percentualValidas}
            previous={kpis.percentualValidasAnterior}
            format="pct"
            icon={<CheckCircle size={16} />}
            accent="#a855f7"
            loading={loading}
          />
        </div>
      </section>

      {/* Por Plataforma */}
      <section>
        <SectionTitle>Por Plataforma</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HorizontalBarChart
            data={porPlataforma}
            title="Faturamento por Plataforma"
            loading={loading}
            color="#00d4ff"
            valueFormat="brl"
          />
          <StackedBarChart
            data={mensalPlat}
            title="Faturamento Mensal por Plataforma"
            keys={plataformaKeys}
            colorMap={PLATAFORMA_COLORS}
            loading={loading}
            valueFormat="brl"
          />
        </div>
      </section>

      {/* Por Produto */}
      <section>
        <SectionTitle>Por Produto</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HorizontalBarChart
            data={porProduto}
            title="Faturamento por Produto"
            loading={loading}
            color="#00e5a0"
            valueFormat="brl"
          />
          <StackedBarChart
            data={mensalProd}
            title="Faturamento Mensal por Produto"
            keys={produtoKeys}
            colorMap={produtoColorMap}
            loading={loading}
            valueFormat="brl"
          />
        </div>
      </section>

      {/* Afiliados */}
      <section>
        <SectionTitle>Afiliados</SectionTitle>
        <AfiliadosTable data={afiliados} loading={loading} />
      </section>
    </div>
  )
}
