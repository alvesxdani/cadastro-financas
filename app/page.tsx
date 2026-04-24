'use client'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { FileDown, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FiltrosComp from './components/Filtros'
import Resumo from './components/Resumo'
import TransacaoForm from './components/TransacaoForm'
import TransacaoList from './components/TransacaoList'
import { exportarPDF } from './lib/pdf'
import { carregar, salvar } from './lib/storage'
import type { Filtros, Transacao } from './lib/types'

const FILTROS_INICIAIS: Filtros = {
  dataInicio: '',
  dataFim: '',
  tipo: '',
  categoria: '',
  busca: '',
}

export default function Home() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [carregado, setCarregado] = useState(false)
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS)
  const [drawerAberto, setDrawerAberto] = useState(false)

  useEffect(() => {
    setTransacoes(carregar())
    setCarregado(true)
  }, [])

  useEffect(() => {
    if (carregado) salvar(transacoes)
  }, [transacoes, carregado])

  function adicionar(novas: Transacao[]) {
    setTransacoes((lista) => [...novas, ...lista])
    setDrawerAberto(false)
  }

  function remover(id: string) {
    setTransacoes((lista) => lista.filter((t) => t.id !== id))
  }

  const categorias = useMemo(() => {
    return Array.from(new Set(transacoes.map((t) => t.categoria))).sort()
  }, [transacoes])

  const filtradas = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase()
    return transacoes
      .filter((t) => {
        if (filtros.dataInicio && t.data < filtros.dataInicio) return false
        if (filtros.dataFim && t.data > filtros.dataFim) return false
        if (filtros.tipo && t.tipo !== filtros.tipo) return false
        if (filtros.categoria && t.categoria !== filtros.categoria) return false
        if (busca && !t.descricao.toLowerCase().includes(busca)) return false
        return true
      })
      .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
  }, [transacoes, filtros])

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Cadastro de Financas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Controle entradas, saidas e divisoes de contas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => exportarPDF(filtradas)}
              disabled={filtradas.length === 0}
              className="gap-2"
            >
              <FileDown className="size-4" data-icon="inline-start" />
              Exportar PDF
            </Button>
            <Button onClick={() => setDrawerAberto(true)} className="gap-2">
              <Plus className="size-4" data-icon="inline-start" />
              Nova transacao
            </Button>
          </div>
        </header>

        <Resumo transacoes={filtradas} />

        <Separator />

        <div className="flex flex-col gap-4">
          <FiltrosComp
            filtros={filtros}
            onChange={setFiltros}
            categorias={categorias}
          />
          <div>
            <p className="text-xs text-muted-foreground mb-3 px-0.5">
              {filtradas.length} de {transacoes.length} transacoes
            </p>
            <TransacaoList transacoes={filtradas} onRemover={remover} />
          </div>
        </div>
      </div>

      <Drawer
        open={drawerAberto}
        onOpenChange={setDrawerAberto}
        direction="right"
      >
        <DrawerContent side="right" className="flex flex-col">
          <DrawerHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle>Nova transacao</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon-sm">
                  <X className="size-4" />
                  <span className="sr-only">Fechar</span>
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>
              Preencha os dados para registrar uma entrada ou saida.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <TransacaoForm onSalvar={adicionar} hideTitle />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
