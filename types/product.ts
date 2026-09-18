export type ProductTag =
  | "sem-alcool"
  | "low-abv"
  | "vegetariano"
  | "vegano"
  | "sem-gluten"
  | "autoral"
  | "novidade";

export type ProductStatus = "ACTIVE" | "INACTIVE";

export type Product = {
  id: string;
  codigo_produto: string;
  descricao_produto: string;
  status: ProductStatus;
  foto_produto: string | null;
  thumb_produto: string | null;
  preco: number;
  tags: ProductTag[];
  bar_id: string;
  category_id: string | null;
  category?: { id: string; nome: string; slug: string } | null;
  created_at: string;
  updated_at: string;
};

export type CreateProductInput = {
  codigo_produto: string;
  descricao_produto: string;
  status?: ProductStatus;
  foto_produto?: string | null;
  thumb_produto?: string | null;
  preco?: number;
  tags?: ProductTag[];
  category_id?: string | null;
  bar_id: string;
};

export type UpdateProductInput = {
  codigo_produto?: string;
  descricao_produto?: string;
  status?: ProductStatus;
  foto_produto?: string | null;
  thumb_produto?: string | null;
  preco?: number;
  tags?: ProductTag[];
  category_id?: string | null;
};

export type MenuHealth = {
  total: number;
  sem_foto: number;
  sem_preco: number;
  sem_categoria: number;
  esgotados: number;
  nunca_editados: number;
  janela_dias: number;
  mais_esgotam: {
    id: string;
    codigo_produto: string;
    descricao_produto: string;
    vezes: number;
  }[];
};
