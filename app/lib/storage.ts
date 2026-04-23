import type { Transacao } from "./types";

const KEY = "cadastro-financas:transacoes:v1";

export function carregar(): Transacao[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTransacao);
  } catch {
    return [];
  }
}

export function salvar(lista: Transacao[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(lista));
}

function isTransacao(v: unknown): v is Transacao {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    (o.tipo === "entrada" || o.tipo === "saida") &&
    typeof o.descricao === "string" &&
    typeof o.valor === "number" &&
    typeof o.data === "string" &&
    typeof o.categoria === "string"
  );
}
