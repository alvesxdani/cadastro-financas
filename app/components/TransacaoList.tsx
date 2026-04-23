"use client";

import { Trash2, Users, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Transacao } from "../lib/types";
import { formatBRL, formatData } from "../lib/format";

type Props = {
  transacoes: Transacao[];
  onRemover: (id: string) => void;
};

export default function TransacaoList({ transacoes, onRemover }: Props) {
  if (transacoes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-10 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma transacao encontrada.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {transacoes.map((t) => {
        const somaDivs = (t.divisoes ?? []).reduce((s, d) => s + d.valor, 0);
        const parteUsuario = t.valor - somaDivs;
        const isEntrada = t.tipo === "entrada";

        return (
          <li key={t.id}>
            <Card className="border-border/60 hover:border-border transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "mt-0.5 size-2 rounded-full shrink-0",
                        isEntrada ? "bg-[#4ac885]" : "bg-destructive"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate leading-snug">{t.descricao}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-muted-foreground">{formatData(t.data)}</span>
                        <span className="text-muted-foreground/40 text-xs">·</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                          {t.categoria}
                        </Badge>
                        {t.parcela && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 font-normal gap-1 bg-accent text-accent-foreground border-0">
                            <CreditCard className="size-2.5" />
                            {t.parcela.numero}/{t.parcela.total}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 shrink-0">
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-semibold text-sm tabular-nums",
                          isEntrada ? "text-[#4ac885]" : "text-destructive"
                        )}
                      >
                        {isEntrada ? "+" : "−"} {formatBRL(t.valor)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemover(t.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-0.5"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {t.divisoes && t.divisoes.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <Users className="size-3" />
                        <span className="uppercase tracking-wide font-medium">Divisao</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                          Voce: <strong className="ml-1">{formatBRL(parteUsuario)}</strong>
                        </span>
                        {t.divisoes.map((d, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs"
                          >
                            {d.nome}: <strong className="ml-1">{formatBRL(d.valor)}</strong>
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {isEntrada
                          ? `Voce deve repassar ${formatBRL(somaDivs)} a outras pessoas.`
                          : `Outros devem a voce ${formatBRL(somaDivs)}.`}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
