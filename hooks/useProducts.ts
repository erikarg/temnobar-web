"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";

type Filters = {
  bar_id?: string;
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
};

export function useProducts(filters: Filters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, total: 0, total_pages: 0 });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const loadProducts = useCallback(async () => {
    if (!filtersRef.current.bar_id) return;
    setLoading(true);
    try {
      const res = await getProducts({ ...filtersRef.current, per_page: 50 });
      setProducts(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, filters.bar_id, filters.status, filters.search]);

  return { products, loading, meta, reload: loadProducts };
}
