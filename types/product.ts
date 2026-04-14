export type Product = {
  id: string;
  codigo_produto: string;
  descricao_produto: string;
  status: "ACTIVE" | "INACTIVE";
  foto_produto: string | null;
  thumb_produto: string | null;
  bar_id: string;
  created_at: string;
  updated_at: string;
};

export type CreateProductInput = {
  codigo_produto: string;
  descricao_produto: string;
  status?: "ACTIVE" | "INACTIVE";
  foto_produto?: string | null;
  thumb_produto?: string | null;
  bar_id: string;
};

export type UpdateProductInput = {
  codigo_produto?: string;
  descricao_produto?: string;
  status?: "ACTIVE" | "INACTIVE";
  foto_produto?: string | null;
  thumb_produto?: string | null;
};
