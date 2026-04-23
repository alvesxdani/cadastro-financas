"use client";

import { useMemo, useState } from "react";
import { Plus, X, UserPlus, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Divisao, Tipo, Transacao } from "../lib/types";
import { addMonths, formatBRL, maskBRL, parseBRL, hoje } from "../lib/format";

type Props = {
  onSalvar: (transacoes: Transacao[]) => void;
  hideTitle?: boolean;
};

type DivisaoDraft = { nome: string; valor: string };

function arredondar(v: number): number {
  return Math.round(v * 100) / 100;
}

function construirTransacoes(input: {
  tipo: Tipo;
  descricao: string;
  valorTotal: number;
  data: string;
  categoria: string;
  divisoes: Divisao[];
  nParcelas: number;
}): Transacao[] {
  const { tipo, descricao, valorTotal, data, categoria, divisoes, nParcelas } = input;

  if (nParcelas <= 1) {
    return [
      {
        id: crypto.randomUUID(),
        tipo,
        descricao,
        valor: valorTotal,
        data,
        categoria,
        divisoes: divisoes.length > 0 ? divisoes : undefined,
      },
    ];
  }

  const grupoId = crypto.randomUUID();
  const valorBase = arredondar(valorTotal / nParcelas);
  const divBases = divisoes.map((d) => ({
    nome: d.nome,
    base: arredondar(d.valor / nParcelas),
    total: d.valor,
  }));

  const lista: Transacao[] = [];
  for (let i = 1; i <= nParcelas; i++) {
    const ehUltima = i === nParcelas;
    const valorParcela = ehUltima
      ? arredondar(valorTotal - valorBase * (nParcelas - 1))
      : valorBase;

    const divsParcela: Divisao[] = divBases.map((d) =>
      ehUltima
        ? { nome: d.nome, valor: arredondar(d.total - d.base * (nParcelas - 1)) }
        : { nome: d.nome, valor: d.base },
    );

    lista.push({
      id: crypto.randomUUID(),
      tipo,
      descricao: `${descricao} (${i}/${nParcelas})`,
      valor: valorParcela,
      data: addMonths(data, i - 1),
      categoria,
      divisoes: divsParcela.length > 0 ? divsParcela : undefined,
      parcela: { numero: i, total: nParcelas, grupoId },
    });
  }
  return lista;
}

const CATEGORIAS_PADRAO = [
  "Alimentacao",
  "Moradia",
  "Transporte",
  "Lazer",
  "Saude",
  "Educacao",
  "Salario",
  "Investimentos",
  "Outros",
];

export default function TransacaoForm({ onSalvar, hideTitle }: Props) {
  const [tipo, setTipo] = useState<Tipo>("saida");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [categoria, setCategoria] = useState(CATEGORIAS_PADRAO[0]);
  const [outraCategoria, setOutraCategoria] = useState("");
  const [usarOutra, setUsarOutra] = useState(false);
  const [divisoes, setDivisoes] = useState<DivisaoDraft[]>([]);
  const [parcelado, setParcelado] = useState(false);
  const [numParcelas, setNumParcelas] = useState("2");
  const [erro, setErro] = useState("");

  const previaParcela = useMemo(() => {
    if (!parcelado) return null;
    const total = parseBRL(valor);
    const n = Math.floor(Number(numParcelas));
    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(n) || n < 2) return null;
    return { valor: total / n, total: n };
  }, [parcelado, valor, numParcelas]);

  function addDivisao() {
    setDivisoes((ds) => [...ds, { nome: "", valor: "" }]);
  }
  function updateDivisao(i: number, patch: Partial<DivisaoDraft>) {
    setDivisoes((ds) => ds.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }
  function removeDivisao(i: number) {
    setDivisoes((ds) => ds.filter((_, idx) => idx !== i));
  }

  function reset() {
    setDescricao("");
    setValor("");
    setData(hoje());
    setDivisoes([]);
    setParcelado(false);
    setNumParcelas("2");
    setErro("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    const valorNum = parseBRL(valor);
    if (!descricao.trim()) return setErro("Informe a descricao.");
    if (!Number.isFinite(valorNum) || valorNum <= 0) return setErro("Valor invalido.");
    if (!data) return setErro("Informe a data.");

    const categoriaFinal = (usarOutra ? outraCategoria : categoria).trim();
    if (!categoriaFinal) return setErro("Informe a categoria.");

    const divs: Divisao[] = [];
    for (const d of divisoes) {
      const nome = d.nome.trim();
      const v = parseBRL(d.valor);
      if (!nome && !d.valor) continue;
      if (!nome) return setErro("Preencha o nome em todas as divisoes.");
      if (!Number.isFinite(v) || v <= 0) return setErro(`Valor invalido na divisao de ${nome}.`);
      divs.push({ nome, valor: v });
    }

    const somaDivs = divs.reduce((s, d) => s + d.valor, 0);
    if (somaDivs > valorNum + 0.001) {
      return setErro("A soma das divisoes excede o valor total.");
    }

    const nParcelas = parcelado ? Math.floor(Number(numParcelas)) : 1;
    if (parcelado) {
      if (!Number.isFinite(nParcelas) || nParcelas < 2) {
        return setErro("Numero de parcelas deve ser 2 ou mais.");
      }
      if (nParcelas > 360) {
        return setErro("Maximo de 360 parcelas.");
      }
    }

    const transacoes = construirTransacoes({
      tipo,
      descricao: descricao.trim(),
      valorTotal: valorNum,
      data,
      categoria: categoriaFinal,
      divisoes: divs,
      nParcelas,
    });

    onSalvar(transacoes);
    reset();
  }

  return (
    <Card className={hideTitle ? "border-0 shadow-none" : "border-border/60"}>
      {!hideTitle && (
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Nova transacao</CardTitle>
        </CardHeader>
      )}
      <CardContent className={hideTitle ? "px-0 pt-0" : "pt-0"}>
        <form onSubmit={submit} className="space-y-5">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setTipo("entrada")}
              className={cn(
                "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                tipo === "entrada"
                  ? "bg-[#4ac885] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo("saida")}
              className={cn(
                "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                tipo === "saida"
                  ? "bg-destructive text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Saida
            </button>
          </div>

          {/* Descricao */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao" className="text-sm">Descricao</Label>
            <Input
              id="descricao"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Conta de luz"
            />
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor" className="text-sm">Valor (R$)</Label>
              <Input
                id="valor"
                type="text"
                inputMode="numeric"
                value={valor}
                onChange={(e) => setValor(maskBRL(e.target.value))}
                placeholder="0,00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="data" className="text-sm">Data</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm">Categoria</Label>
            {usarOutra ? (
              <Input
                type="text"
                value={outraCategoria}
                onChange={(e) => setOutraCategoria(e.target.value)}
                placeholder="Nova categoria"
              />
            ) : (
              <Select value={categoria} onValueChange={(v) => v && setCategoria(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_PADRAO.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <button
              type="button"
              onClick={() => setUsarOutra((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground self-start transition-colors"
            >
              {usarOutra ? "Usar categoria da lista" : "Usar outra categoria"}
            </button>
          </div>

          <Separator />

          {/* Parcelado */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="parcelado"
                checked={parcelado}
                onCheckedChange={(v) => setParcelado(!!v)}
              />
              <label htmlFor="parcelado" className="text-sm font-medium cursor-pointer select-none">
                Parcelado
              </label>
              <span className="text-xs text-muted-foreground">(gera uma transacao por mes)</span>
            </div>
            {parcelado && (
              <div className="space-y-2 pl-6">
                <div className="flex flex-col gap-1.5 max-w-40">
                  <Label htmlFor="parcelas" className="text-xs text-muted-foreground">
                    Numero de parcelas
                  </Label>
                  <Input
                    id="parcelas"
                    type="number"
                    min={2}
                    max={360}
                    step={1}
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                {previaParcela && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
                    <Info className="size-3 mt-0.5 shrink-0" />
                    <span>
                      {previaParcela.total}x de{" "}
                      <strong className="text-foreground">{formatBRL(previaParcela.valor)}</strong>.
                      {" "}A ultima parcela ajusta centavos.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Dividir conta */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dividir conta</p>
                <p className="text-xs text-muted-foreground">
                  {tipo === "saida"
                    ? "Quanto cada pessoa deve a voce."
                    : "Quanto pertence a outras pessoas."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDivisao}
                className="gap-1.5 h-8 text-xs"
              >
                <UserPlus className="size-3.5" />
                Pessoa
              </Button>
            </div>

            {divisoes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Nenhuma divisao adicionada.</p>
            ) : (
              <div className="space-y-2">
                {divisoes.map((d, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      type="text"
                      value={d.nome}
                      onChange={(e) => updateDivisao(i, { nome: e.target.value })}
                      placeholder="Nome"
                      className="flex-1 h-8 text-sm"
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={d.valor}
                      onChange={(e) => updateDivisao(i, { valor: maskBRL(e.target.value) })}
                      placeholder="0,00"
                      className="w-24 h-8 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeDivisao(i)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {erro && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <Info className="size-4 shrink-0" />
              {erro}
            </div>
          )}

          <Button type="submit" className="w-full">
            <Plus className="size-4" data-icon="inline-start" />
            Salvar transacao
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
