import type { ProductTag } from "./product";

export type PublicMenuItem = {
  id: string;
  descricao_produto: string;
  preco: number;
  tags: ProductTag[];
  disponivel: boolean;
  foto_produto: string | null;
  thumb_produto: string | null;
};

export type PublicMenuSection = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  itens: PublicMenuItem[];
};

export type PublicMenu = {
  bar: { id: string; nome: string; slug: string; updated_at: string };
  secoes: PublicMenuSection[];
  total_itens: number;
  total_indisponiveis: number;
};
