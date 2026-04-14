import { api } from "./api";
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";

type ListProductsParams = {
  bar_id?: string;
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
  page?: number;
  per_page?: number;
};

type PaginatedResponse = {
  data: Product[];
  meta: { page: number; per_page: number; total: number; total_pages: number };
};

export async function getProducts(
  params: ListProductsParams = {},
): Promise<PaginatedResponse> {
  const res = await api.get("/products", { params });
  return res.data;
}

export async function getProduct(id: string): Promise<Product> {
  const res = await api.get(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(
  data: CreateProductInput,
): Promise<Product> {
  const res = await api.post("/products", data);
  return res.data.data;
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput,
): Promise<Product> {
  const res = await api.put(`/products/${id}`, data);
  return res.data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
