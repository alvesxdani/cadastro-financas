"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Filtros as FiltrosType } from "../lib/types";

type Props = {
  filtros: FiltrosType;
  onChange: (f: FiltrosType) => void;
  categorias: string[];
};

const TIPO_LABELS: Record<string, string> = {
  entrada: "Entrada",
  saida: "Saida",
};

export default function Filtros({ filtros, onChange, categorias }: Props) {
  function update<K extends keyof FiltrosType>(key: K, value: FiltrosType[K]) {
    onChange({ ...filtros, [key]: value });
  }

  function limpar() {
    onChange({ dataInicio: "", dataFim: "", tipo: "", categoria: "", busca: "" });
  }

  const hasFilters =
    filtros.dataInicio || filtros.dataFim || filtros.tipo || filtros.categoria || filtros.busca;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            Filtros
          </CardTitle>
          {hasFilters && (
            <Button variant="ghost" size="xs" onClick={limpar} className="h-7 gap-1 text-muted-foreground hover:text-foreground">
              <X className="size-3" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">De</Label>
            <Input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => update("dataInicio", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Ate</Label>
            <Input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => update("dataFim", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select
              value={filtros.tipo || undefined}
              onValueChange={(v) => {
                const s = String(v ?? "");
                update("tipo", s === "__clear" ? "" : (s as FiltrosType["tipo"]));
              }}
            >
              <SelectTrigger className="h-8 text-sm w-full">
                <span className={cn("flex-1 text-left truncate", !filtros.tipo && "text-muted-foreground")}>
                  {TIPO_LABELS[filtros.tipo] ?? "Todos"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saida</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Categoria</Label>
            <Select
              value={filtros.categoria || undefined}
              onValueChange={(v) => {
                const s = String(v ?? "");
                update("categoria", s === "__clear" ? "" : s);
              }}
            >
              <SelectTrigger className="h-8 text-sm w-full">
                <span className={cn("flex-1 text-left truncate", !filtros.categoria && "text-muted-foreground")}>
                  {filtros.categoria || "Todas"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__clear">Todas</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
            <Label className="text-xs text-muted-foreground">Buscar</Label>
            <Input
              type="text"
              value={filtros.busca}
              placeholder="Descricao..."
              onChange={(e) => update("busca", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
