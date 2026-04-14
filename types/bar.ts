export type Bar = {
  id: string;
  nome: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type CreateBarInput = {
  nome: string;
  slug: string;
};
