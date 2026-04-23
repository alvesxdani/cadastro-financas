"use client";

import { useEffect, useMemo, useState } from "react";
import { FileDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import TransacaoForm from "./components/TransacaoForm";
import TransacaoList from "./components/TransacaoList";
import FiltrosComp from "./components/Filtros";
import Resumo from "./components/Resumo";
import type { Filtros, Transacao } from "./lib/types";
import { carregar, salvar } from "./lib/storage";
import { exportarPDF } from "./lib/pdf";

const FILTROS_INICIAIS: Filtros = {
  dataInicio: "",
  dataFim: "",
  tipo: "",
  categoria: "",
  busca: "",
};

export default function Home() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const [drawerAberto, setDrawerAberto] = useState(false);

  useEffect(() => {
    setTransacoes(carregar());
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) salvar(transacoes);
  }, [transacoes, carregado]);

  function adicionar(novas: Transacao[]) {
    setTransacoes((lista) => [...novas, ...lista]);
    setDrawerAberto(false);
  }

  function remover(id: string) {
    setTransacoes((lista) => lista.filter((t) => t.id !== id));
  }

  const categorias = useMemo(() => {
    return Array.from(new Set(transacoes.map((t) => t.categoria))).sort();
  }, [transacoes]);

  const filtradas = useMemo(() => {
    const busca = filtros.busca.trim().toLowerCase();
    return transacoes
      .filter((t) => {
        if (filtros.dataInicio && t.data < filtros.dataInicio) return false;
        if (filtros.dataFim && t.data > filtros.dataFim) return false;
        if (filtros.tipo && t.tipo !== filtros.tipo) return false;
        if (filtros.categoria && t.categoria !== filtros.categoria) return false;
        if (busca && !t.descricao.toLowerCase().includes(busca)) return false;
        return true;
      })
      .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
  }, [transacoes, filtros]);

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

      <Drawer open={drawerAberto} onOpenChange={setDrawerAberto} direction="right">
        <DrawerContent className="w-full max-w-md ml-auto h-full flex flex-col rounded-none">
          <DrawerHeader className="border-b border-border/60 pb-4">
            <DrawerTitle>Nova transacao</DrawerTitle>
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
  );
}
