export interface Venda {
  id: number
  plataforma: string
  nome_do_produto: string
  nome_do_produtor: string
  nome_do_afiliado: string | null
  transacao: string
  meio_de_pagamento: string
  tipo_de_pagamento: string
  status: 'Completo' | 'Cancelado'
  preco_do_produto: number
  preco_total: number
  faturamento_liquido: number
  data_de_venda: string
  data_de_confirmacao: string
  origem_de_checkout: string | null
  venda_feita_como: string
  numero_da_parcela: number
  cidade: string | null
  estado: string | null
}

export interface Filters {
  dateFrom: string
  dateTo: string
  plataformas: string[]
  produtos: string[]
}

export interface KPIData {
  totalCompras: number
  faturamentoTotal: number
  percentualValidas: number
  ticketMedio: number
  totalComprasAnterior: number
  faturamentoAnterior: number
  percentualValidasAnterior: number
  ticketMedioAnterior: number
}

export interface ChartDataItem {
  name: string
  value: number
  percent?: number
}

export interface MonthlyDataItem {
  mes: string
  [key: string]: string | number
}

export interface AfiliadoData {
  afiliado: string
  vendas: number
  faturamento: number
  percentual: number
}

export interface CancelamentoKPI {
  totalPerdas: number
  vendasCanceladas: number
  percentualCancelamento: number
}
