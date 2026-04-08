'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Venda, Filters } from '@/types'
import { subDays, format, subMonths, parseISO } from 'date-fns'

const DEFAULT_FILTERS: Filters = {
  dateFrom: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
  dateTo: format(new Date(), 'yyyy-MM-dd'),
  plataformas: [],
  produtos: [],
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  return { filters, setFilters }
}

export function useVendas(filters: Filters) {
  const [data, setData] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('vendas_fitness')
        .select('*')
        .gte('data_de_venda', filters.dateFrom + 'T00:00:00')
        .lte('data_de_venda', filters.dateTo + 'T23:59:59')

      if (filters.plataformas.length > 0) {
        query = query.in('plataforma', filters.plataformas)
      }
      if (filters.produtos.length > 0) {
        query = query.in('nome_do_produto', filters.produtos)
      }

      const { data: rows, error: err } = await query
      if (err) throw err
      setData(rows || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function usePreviousPeriodVendas(filters: Filters) {
  const [data, setData] = useState<Venda[]>([])

  useEffect(() => {
    const from = parseISO(filters.dateFrom)
    const to = parseISO(filters.dateTo)
    const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
    const prevFrom = format(subDays(from, diffDays), 'yyyy-MM-dd')
    const prevTo = format(subDays(from, 1), 'yyyy-MM-dd')

    supabase
      .from('vendas_fitness')
      .select('status, faturamento_liquido, preco_total')
      .gte('data_de_venda', prevFrom + 'T00:00:00')
      .lte('data_de_venda', prevTo + 'T23:59:59')
      .then(({ data: rows }) => setData(rows || []))
  }, [filters])

  return data
}

export function useMetaData() {
  const [produtos, setProdutos] = useState<string[]>([])
  const [plataformas] = useState(['Hotmart', 'Kiwify', 'Hubla'])

  useEffect(() => {
    supabase
      .from('vendas_fitness')
      .select('nome_do_produto')
      .then(({ data }) => {
        const unique = [...new Set((data || []).map((d: { nome_do_produto: string }) => d.nome_do_produto))].sort()
        setProdutos(unique)
      })
  }, [])

  return { produtos, plataformas }
}
