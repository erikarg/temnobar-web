"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { deleteProduct } from "@/services/product.service";
import { ChevronDown } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const filters = useMemo(
    () => ({
      bar_id: user?.bar_id ?? undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: search || undefined,
    }),
    [user?.bar_id, statusFilter, search],
  );

  const { products, loading, meta, reload } = useProducts(filters);

  const handleEdit = (product: { id: string }) => {
    router.push(`/products/${product.id}/edit`);
  };

  const handleDelete = async (product: {
    id: string;
    descricao_produto: string;
  }) => {
    if (!confirm(`Excluir "${product.descricao_produto}"?`)) return;
    await deleteProduct(product.id);
    reload();
  };

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user?.bar_id) {
    router.replace("/select-bar");
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Produtos</h1>
            {!loading && (
              <p className="mt-0.5 text-sm text-muted">
                {meta.total} {meta.total === 1 ? "produto" : "produtos"}
              </p>
            )}
          </div>
          <Button onClick={() => router.push("/products/new")}>
            <span>+</span>
            <span className="ml-2">Novo produto</span>
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>

            <input
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-3.5 text-sm ..."
            />
          </div>

          <div className="relative w-full sm:w-56">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
              }
              className="appearance-none w-full rounded-lg border border-border bg-white px-3.5 pr-10 py-2.5 text-sm ..."
            >
              <option value="ALL">Todos os status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-muted-light">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              Nenhum produto encontrado
            </p>
            <p className="mt-1 text-sm text-muted">
              {search
                ? "Tente uma busca diferente"
                : "Cadastre seu primeiro produto"}
            </p>
            {!search && (
              <Button
                className="mt-5"
                onClick={() => router.push("/products/new")}
              >
                <span>+</span>
                <span className="ml-2">Novo produto</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                apiUrl={API_BASE}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
