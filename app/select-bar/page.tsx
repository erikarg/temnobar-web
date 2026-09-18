"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CircleAlert, Plus } from "lucide-react";
import { getBars, createBar } from "@/services/bar.service";
import { selectBar } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Bar } from "@/types/bar";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SelectBarPage() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newBarName, setNewBarName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { refresh } = useAuth();

  useEffect(() => {
    getBars()
      .then(setBars)
      .catch(() => setError("Erro ao carregar bares"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (barId: string) => {
    setSelecting(barId);
    setError("");
    try {
      await selectBar(barId);
      await refresh();
      router.push("/");
    } catch {
      setError("Erro ao selecionar bar");
      setSelecting(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarName.trim()) return;

    setCreating(true);
    setError("");
    try {
      const bar = await createBar({
        nome: newBarName.trim(),
        slug: slugify(newBarName),
      });
      await selectBar(bar.id);
      await refresh();
      router.push("/");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 409
          ? "Já existe um bar com esse nome."
          : "Não foi possível criar o bar.",
      );
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary font-display text-[26px] text-primary-ink">
            T
          </span>
          <h1 className="font-display text-[34px] leading-tight">Escolha o bar</h1>
          <p className="text-sm text-muted">
            O cardápio que você vai abrir depende do bar selecionado.
          </p>
        </div>

        {error && (
          <p className="mb-4 flex items-center gap-2 rounded-[10px] border border-danger/50 bg-danger-light px-3 py-2.5 text-sm text-danger-text">
            <CircleAlert className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {bars.length > 0 && (
          <ul className="mb-6 flex flex-col gap-2">
            {bars.map((bar) => (
              <li key={bar.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(bar.id)}
                  disabled={selecting !== null}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[14px] border border-border bg-card px-4 py-3.5 text-left transition-colors hover:border-primary/50 disabled:opacity-50"
                >
                  <span className="flex flex-col">
                    <span className="font-medium">{bar.nome}</span>
                    <span className="mt-0.5 font-mono text-[11.5px] text-muted-light">
                      {bar.slug}
                    </span>
                  </span>
                  {selecting === bar.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-light" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {bars.length === 0 && !showCreate && (
          <p className="mb-6 text-center text-sm text-muted">
            Nenhum bar cadastrado ainda. Crie o primeiro.
          </p>
        )}

        {!showCreate ? (
          <Button
            variant="secondary"
            onClick={() => setShowCreate(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
            Criar novo bar
          </Button>
        ) : (
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold">Novo bar</h2>
            <Input
              id="bar-name"
              label="Nome do bar"
              placeholder="Ex: Boteco do Zé"
              value={newBarName}
              onChange={(e) => setNewBarName(e.target.value)}
              hint={
                newBarName
                  ? `O cardápio público ficará em /cardapio/${slugify(newBarName)}`
                  : undefined
              }
            />
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreate(false);
                  setNewBarName("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={creating} className="flex-1">
                Criar e selecionar
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
