"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    setTransacoes(carregar());
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) salvar(transacoes);
  }, [transacoes, carregado]);

  function adicionar(novas: Transacao[]) {
    setTransacoes((lista) => [...novas, ...lista]);
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
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Cadastro de Financas</h1>
            <p className="text-sm text-zinc-500">
              Controle entradas, saidas e divisoes de contas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportarPDF(filtradas)}
            disabled={filtradas.length === 0}
            className="rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          >
            Exportar PDF
          </button>
        </header>

        <Resumo transacoes={filtradas} />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
          <TransacaoForm onSalvar={adicionar} />

          <div className="space-y-4">
            <FiltrosComp
              filtros={filtros}
              onChange={setFiltros}
              categorias={categorias}
            />
            <div>
              <div className="text-xs text-zinc-500 mb-2">
                {filtradas.length} de {transacoes.length} transacoes
              </div>
              <TransacaoList transacoes={filtradas} onRemover={remover} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
