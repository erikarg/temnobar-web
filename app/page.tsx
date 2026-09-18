"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ImageOff, Plus, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { ProductSheet } from "@/components/ProductSheet";
import { Button } from "@/components/ui/Button";
import {
  deleteProduct,
  getProduct,
  setProductStatus,
} from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { API_BASE } from "@/services/api";
import type { Category } from "@/types/category";
import type { Product, ProductStatus } from "@/types/product";

type StatusFilter = "ALL" | ProductStatus;

function Cardapio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);

  const sheetParam = searchParams.get("item");

  // Evita uma requisição por tecla digitada.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!authLoading && user && !user.bar_id) {
      router.replace("/select-bar");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user?.bar_id) return;
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [user?.bar_id]);

  const { products, loading, error, meta, reload } = useProducts({
    bar_id: user?.bar_id ?? undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    category_id: categoryFilter || undefined,
  });

  // O item do painel pode não estar na página carregada (link direto ou filtro).
  useEffect(() => {
    if (!sheetParam || sheetParam === "novo") {
      setSheetProduct(null);
      return;
    }

    const local = products.find((product) => product.id === sheetParam);
    if (local) {
      setSheetProduct(local);
      return;
    }

    let cancelled = false;
    getProduct(sheetParam)
      .then((product) => {
        if (!cancelled) setSheetProduct(product);
      })
      .catch(() => {
        if (!cancelled) router.replace("/");
      });

    return () => {
      cancelled = true;
    };
  }, [sheetParam, products, router]);

  const openSheet = useCallback(
    (id: string) => router.push(`/?item=${id}`, { scroll: false }),
    [router],
  );
  const closeSheet = useCallback(
    () => router.push("/", { scroll: false }),
    [router],
  );

  const toggleSelected = (product: Product) => {
    setSelectedIds((current) =>
      current.includes(product.id)
        ? current.filter((id) => id !== product.id)
        : [...current, product.id],
    );
  };

  const handleToggleStatus = async (product: Product) => {
    setTogglingId(product.id);
    try {
      await setProductStatus(
        product.id,
        product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      );
      reload();
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkStatus = async (status: ProductStatus) => {
    setBulkBusy(true);
    try {
      await Promise.all(selectedIds.map((id) => setProductStatus(id, status)));
      setSelectedIds([]);
      reload();
    } finally {
      setBulkBusy(false);
    }
  };

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      if (sheetParam) closeSheet();
      reload();
    } catch {
      setDeleteError("Não foi possível excluir o produto. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, reload, sheetParam, closeSheet]);

  useEffect(() => {
    if (!deleteTarget) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) setDeleteTarget(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteTarget, deleting]);

  const esgotados = useMemo(
    () => products.filter((product) => product.status === "INACTIVE").length,
    [products],
  );

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user?.bar_id) return null;

  return (
    <AppShell stats={{ total: meta.total, esgotados }}>
      <header className="flex flex-col gap-3 border-b border-border px-4 py-4 md:flex-row md:items-center md:px-8">
        <div className="relative md:w-[380px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-muted-light" />
          <label htmlFor="busca" className="sr-only">
            Buscar no cardápio
          </label>
          <input
            id="busca"
            type="search"
            placeholder="Buscar no cardápio"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-border bg-surface pl-10 pr-3.5 text-sm outline-none transition-colors placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary-ring/30"
          />
        </div>

        <div className="flex gap-0.5 rounded-[11px] border border-border bg-surface p-[3px]">
          {(
            [
              ["ALL", "Todos"],
              ["ACTIVE", "Servindo"],
              ["INACTIVE", "Esgotados"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`h-9 flex-1 cursor-pointer rounded-lg px-3.5 text-[13px] transition-colors md:flex-none ${
                statusFilter === value
                  ? "bg-elevated font-semibold text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <>
            <label htmlFor="secao" className="sr-only">
              Filtrar por seção
            </label>
            <select
              id="secao"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 cursor-pointer rounded-[10px] border border-border bg-surface px-3.5 text-sm outline-none transition-colors focus:border-primary md:w-48"
            >
              <option value="">Todas as seções</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>
          </>
        )}

        <Button
          className="hidden md:ml-auto md:inline-flex"
          onClick={() => router.push("/?item=novo", { scroll: false })}
        >
          <Plus className="h-[17px] w-[17px]" />
          Novo produto
        </Button>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6 md:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[32px] leading-tight">Cardápio</h1>
            {!loading && !error && (
              <p className="mt-0.5 text-[13.5px] text-muted">
                {meta.total} {meta.total === 1 ? "item" : "itens"}
                {esgotados > 0 && (
                  <>
                    {" · "}
                    <span className="text-danger-text">
                      {esgotados} {esgotados === 1 ? "esgotado" : "esgotados"}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
          <span className="hidden items-center gap-2 text-[13px] text-muted-light md:flex">
            <ArrowUpDown className="h-4 w-4" />
            Esgotados primeiro
          </span>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-16">
            <p className="text-sm font-medium">Não foi possível carregar o cardápio</p>
            <p className="mt-1 text-sm text-muted">Verifique sua conexão</p>
            <Button variant="secondary" className="mt-5" onClick={reload}>
              Tentar novamente
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-16">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-elevated text-muted-light">
              <ImageOff className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-sm font-medium">Nenhum item encontrado</p>
            <p className="mt-1 text-sm text-muted">
              {debouncedSearch
                ? "Tente uma busca diferente"
                : "Cadastre o primeiro item do cardápio"}
            </p>
            {!debouncedSearch && (
              <Button
                className="mt-5"
                onClick={() => router.push("/?item=novo", { scroll: false })}
              >
                <Plus className="h-[17px] w-[17px]" />
                Novo produto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                apiUrl={API_BASE}
                selected={selectedIds.includes(product.id)}
                toggling={togglingId === product.id}
                onSelect={toggleSelected}
                onEdit={(item) => openSheet(item.id)}
                onDelete={setDeleteTarget}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>

      {selectedIds.length > 0 && (
        <div className="sticky bottom-0 z-30 mx-4 mb-4 flex flex-col gap-3 rounded-[14px] border border-border bg-elevated p-3 shadow-2xl md:mx-8 md:flex-row md:items-center md:px-4">
          <span className="text-sm font-semibold">
            {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "selecionado" : "selecionados"}
          </span>
          <span className="hidden text-[13px] text-muted md:block">
            Fim de noite? Marque tudo que acabou de uma vez.
          </span>
          <div className="flex gap-2 md:ml-auto">
            <Button
              variant="secondary"
              size="sm"
              className="text-accent-text"
              loading={bulkBusy}
              onClick={() => handleBulkStatus("ACTIVE")}
            >
              Marcar servindo
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={bulkBusy}
              onClick={() => handleBulkStatus("INACTIVE")}
            >
              Marcar esgotado
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {sheetParam && (sheetParam === "novo" || sheetProduct) && (
        <ProductSheet
          key={sheetParam}
          product={sheetParam === "novo" ? null : sheetProduct}
          barId={user.bar_id}
          categories={categories}
          onClose={closeSheet}
          onSaved={() => {
            closeSheet();
            reload();
          }}
          onRequestDelete={setDeleteTarget}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0c0a08]/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <h2 id="delete-dialog-title" className="text-base font-semibold">
              Excluir item
            </h2>
            <p className="mt-2 text-sm text-muted">
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-foreground">
                &ldquo;{deleteTarget.descricao_produto}&rdquo;
              </span>
              ? Se o item apenas acabou, marque como esgotado em vez de excluir.
            </p>
            {deleteError && (
              <p className="mt-3 rounded-[10px] border border-danger/50 bg-danger-light px-3 py-2.5 text-sm text-danger-text">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                autoFocus
              >
                Cancelar
              </Button>
              <Button variant="danger" loading={deleting} onClick={confirmDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <Cardapio />
    </Suspense>
  );
}
