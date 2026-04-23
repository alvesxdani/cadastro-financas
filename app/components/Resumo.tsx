"use client";

import { TrendingUp, TrendingDown, Wallet, Users, MoveDownLeft, MoveUpRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatBRL } from "../lib/format";
import type { Transacao } from "../lib/types";

const GREEN = "#4ac885";
const RED = "#e54b4f";

export default function Resumo({ transacoes }: { transacoes: Transacao[] }) {
  const totalEntradas = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes
    .filter((t) => t.tipo === "saida")
    .reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  const devidoAoUsuario = transacoes
    .filter((t) => t.tipo === "saida" && t.divisoes && t.divisoes.length > 0)
    .reduce((acc, t) => acc + (t.divisoes ?? []).reduce((s, d) => s + d.valor, 0), 0);
  const usuarioDeve = transacoes
    .filter((t) => t.tipo === "entrada" && t.divisoes && t.divisoes.length > 0)
    .reduce((acc, t) => acc + (t.divisoes ?? []).reduce((s, d) => s + d.valor, 0), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Entradas"
          valor={totalEntradas}
          icon={TrendingUp}
          color={GREEN}
        />
        <StatCard
          label="Saidas"
          valor={totalSaidas}
          icon={TrendingDown}
          color={RED}
        />
        <StatCard
          label="Saldo"
          valor={saldo}
          icon={Wallet}
          color={saldo >= 0 ? GREEN : RED}
          primary
        />
      </div>

      {(devidoAoUsuario > 0 || usuarioDeve > 0) && (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2.5">
            <Users className="size-3.5" />
            <span className="font-medium uppercase tracking-wider">Divisoes</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {devidoAoUsuario > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <MoveUpRight className="size-3.5" style={{ color: GREEN }} />
                <span className="text-muted-foreground">Outros devem a voce:</span>
                <strong style={{ color: GREEN }}>{formatBRL(devidoAoUsuario)}</strong>
              </div>
            )}
            {devidoAoUsuario > 0 && usuarioDeve > 0 && (
              <Separator orientation="vertical" className="h-4 self-center" />
            )}
            {usuarioDeve > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <MoveDownLeft className="size-3.5" style={{ color: RED }} />
                <span className="text-muted-foreground">Voce deve repassar:</span>
                <strong style={{ color: RED }}>{formatBRL(usuarioDeve)}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  valor,
  icon: Icon,
  color,
  primary,
}: {
  label: string;
  valor: number;
  icon: React.ElementType;
  color: string;
  primary?: boolean;
}) {
  return (
    <div
      className="relative rounded-xl border bg-card overflow-hidden"
      style={{ borderColor: `${color}30` }}
    >
      {/* Faixa de cor no topo */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <div
            className="size-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="size-4" style={{ color }} strokeWidth={2.5} />
          </div>
        </div>

        {/* Valor */}
        <p
          className="text-3xl font-bold tabular-nums leading-none tracking-tight"
          style={{ color }}
        >
          {formatBRL(valor)}
        </p>

        {/* Linha decorativa inferior */}
        {primary && (
          <div
            className="mt-4 h-0.5 rounded-full opacity-20"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
    </div>
  );
}
