"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/category.service";
import type { Category } from "@/types/category";

export default function CategoriasPage() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNome, setEditingNome] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      setCategories(await getCategories());
      setError("");
    } catch {
      setError("Não foi possível carregar as seções.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.bar_id) return;
    load();
  }, [user?.bar_id]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nome.trim()) return;

    setCreating(true);
    setError("");
    try {
      await createCategory({ nome: nome.trim(), ordem: categories.length });
      setNome("");
      await load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 409
          ? "Já existe uma seção com esse nome."
          : "Não foi possível criar a seção.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (category: Category) => {
    if (!editingNome.trim()) return;
    setBusyId(category.id);
    try {
      await updateCategory(category.id, { nome: editingNome.trim() });
      setEditingId(null);
      await load();
    } catch {
      setError("Não foi possível renomear a seção.");
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = categories[index + direction];
    const current = categories[index];
    if (!target || !current) return;

    setBusyId(current.id);
    try {
      await Promise.all([
        updateCategory(current.id, { ordem: index + direction }),
        updateCategory(target.id, { ordem: index }),
      ]);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (category: Category) => {
    setBusyId(category.id);
    try {
      await deleteCategory(category.id);
      await load();
    } catch {
      setError("Não foi possível excluir a seção.");
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user?.bar_id) return null;

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <div>
          <h1 className="font-display text-[32px] leading-tight">Seções do cardápio</h1>
          <p className="mt-1 text-[13.5px] text-muted">
            A ordem daqui é a ordem que o cliente vê no cardápio público.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 rounded-[14px] border border-border bg-surface p-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Input
              id="nova-secao"
              label="Nova seção"
              placeholder="Ex: Chopps, Drinks, Porções"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <Button type="submit" loading={creating}>
            Criar seção
          </Button>
        </form>

        {error && (
          <p className="rounded-[10px] border border-danger/50 bg-danger-light px-3 py-2.5 text-sm text-danger-text">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface py-14 text-center">
            <p className="text-sm font-medium">Nenhuma seção ainda</p>
            <p className="mt-1 text-sm text-muted">
              Sem seções, tudo aparece agrupado como &ldquo;Outros&rdquo;.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {categories.map((category, index) => (
              <li
                key={category.id}
                className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-3"
              >
                {editingId === category.id ? (
                  <>
                    <input
                      value={editingNome}
                      onChange={(e) => setEditingNome(e.target.value)}
                      aria-label={`Novo nome para ${category.nome}`}
                      className="h-10 flex-1 rounded-[10px] border border-primary bg-surface px-3 text-sm outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleRename(category)}
                      aria-label="Salvar nome"
                      disabled={busyId === category.id}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] bg-primary text-primary-ink"
                    >
                      <Check className="h-[18px] w-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancelar"
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-border text-muted"
                    >
                      <X className="h-[18px] w-[18px]" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold">
                        {category.nome}
                      </span>
                      <span className="truncate font-mono text-[11.5px] text-muted-light">
                        {category.slug} · {category._count?.products ?? 0}{" "}
                        {(category._count?.products ?? 0) === 1 ? "item" : "itens"}
                      </span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0 || busyId === category.id}
                        aria-label={`Subir ${category.nome}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-border text-muted transition-colors hover:text-foreground disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 1)}
                        disabled={
                          index === categories.length - 1 || busyId === category.id
                        }
                        aria-label={`Descer ${category.nome}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-border text-muted transition-colors hover:text-foreground disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingNome(category.nome);
                        }}
                        aria-label={`Renomear ${category.nome}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-border text-muted transition-colors hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={busyId === category.id}
                        aria-label={`Excluir ${category.nome}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-border text-danger-text transition-colors hover:bg-danger-light"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-[12.5px] text-muted-light">
          Excluir uma seção não apaga itens: eles voltam para &ldquo;Outros&rdquo;.
        </p>
      </main>
    </AppShell>
  );
}
