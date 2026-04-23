export type Tipo = "entrada" | "saida";

export type Divisao = {
  nome: string;
  valor: number;
};

export type Parcela = {
  numero: number;
  total: number;
  grupoId: string;
};

export type Transacao = {
  id: string;
  tipo: Tipo;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  divisoes?: Divisao[];
  parcela?: Parcela;
};

export type Filtros = {
  dataInicio: string;
  dataFim: string;
  tipo: "" | Tipo;
  categoria: string;
  busca: string;
};
