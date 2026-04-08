# NutriDash — Dashboard de Vendas

Dashboard de acompanhamento de vendas conectado ao Supabase, construído com Next.js 14 + Tailwind CSS + Recharts.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (banco de dados PostgreSQL)
- **Recharts** (gráficos)
- **Tailwind CSS** (estilização)
- **date-fns** (manipulação de datas)

## Rodando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

## Deploy no Vercel

1. Faça push deste projeto para um repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) → **Add New Project**
3. Importe o repositório
4. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` → URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Chave anon pública
5. Clique em **Deploy**

> ⚠️ Nunca suba o `.env.local` para o GitHub. Ele já está no `.gitignore`.

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx        # Layout raiz
│   ├── page.tsx          # Página principal com navegação entre abas
│   └── globals.css       # Estilos globais e fontes
├── components/
│   ├── ui/
│   │   ├── index.tsx     # KPICard, Card, Skeleton, ProgressBar, EmptyState
│   │   └── FiltersBar.tsx # Filtros globais (data, plataforma, produto)
│   ├── charts/
│   │   └── index.tsx     # HorizontalBarChart, StackedBarChart, LineChart, AfiliadosTable
│   ├── VisaoGeral.tsx    # Aba Visão Geral
│   └── Cancelamentos.tsx # Aba Cancelamentos
├── hooks/
│   └── useVendas.ts      # Hooks de fetch do Supabase
├── lib/
│   ├── supabase.ts       # Client do Supabase
│   └── dataUtils.ts      # Funções de agregação e formatação
└── types/
    └── index.ts          # Tipos TypeScript
```
