export type Category = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  bar_id: string;
  created_at: string;
  updated_at: string;
  _count?: { products: number };
};

export type CreateCategoryInput = {
  nome: string;
  ordem?: number;
};

export type UpdateCategoryInput = {
  nome?: string;
  ordem?: number;
};
