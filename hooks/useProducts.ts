"use client";

import { useEffect, useState, useCallback } from "react";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";

type Filters = {
  bar_id?: string;
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
};

export function useProducts({ bar_id, status, search }: Filters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 0 });

  const loadProducts = useCallback(async () => {
    if (!bar_id) return;
    setLoading(true);
    try {
      const res = await getProducts({ bar_id, status, search, per_page: 50 });
      setProducts(res.data);
      setMeta(res.meta);
      setError(false);
    } catch {
      // Sem isso a falha de rede viraria "nenhum produto encontrado".
      setProducts([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [bar_id, status, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, error, meta, reload: loadProducts };
}
