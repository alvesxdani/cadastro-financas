import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transacao } from "./types";
import { formatBRL, formatData } from "./format";

export function exportarPDF(transacoes: Transacao[]): void {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text("Relatorio de Financas", 14, 16);
  doc.setFontSize(10);
  doc.text(`Gerado em ${formatData(new Date().toISOString().slice(0, 10))}`, 14, 22);

  const totalEntradas = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((acc, t) => acc + t.valor, 0);
  const totalSaidas = transacoes
    .filter((t) => t.tipo === "saida")
    .reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  doc.text(
    `Entradas: ${formatBRL(totalEntradas)}   Saidas: ${formatBRL(totalSaidas)}   Saldo: ${formatBRL(saldo)}`,
    14,
    28,
  );

  const rows = transacoes.map((t) => [
    formatData(t.data),
    t.descricao,
    t.categoria,
    t.tipo === "entrada" ? "Entrada" : "Saida",
    t.parcela ? `${t.parcela.numero}/${t.parcela.total}` : "-",
    formatBRL(t.valor),
    (t.divisoes ?? [])
      .map((d) => `${d.nome}: ${formatBRL(d.valor)}`)
      .join(" | ") || "-",
  ]);

  autoTable(doc, {
    startY: 34,
    head: [["Data", "Descricao", "Categoria", "Tipo", "Parcela", "Valor", "Divisoes"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [30, 30, 30] },
    columnStyles: {
      4: { halign: "center" },
      5: { halign: "right" },
    },
  });

  doc.save(`financas-${new Date().toISOString().slice(0, 10)}.pdf`);
}
