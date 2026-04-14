"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBars, createBar } from "@/services/bar.service";
import { selectBar } from "@/services/auth.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Bar } from "@/types/bar";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

  useEffect(() => {
    getBars()
      .then((data) => setBars(data))
      .catch(() => setError("Erro ao carregar bares"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (barId: string) => {
    setSelecting(barId);
    setError("");
    try {
      await selectBar(barId);
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
      router.push("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erro ao criar bar";
      setError(message);
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
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-sm shadow-primary/25">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Selecione um bar
          </h1>
          <p className="mt-1 text-sm text-muted">
            Escolha um bar existente ou crie um novo
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-danger-light px-3 py-2.5 text-sm text-danger">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        {bars.length > 0 && (
          <div className="mb-6 space-y-2">
            {bars.map((bar) => (
              <button
                key={bar.id}
                onClick={() => handleSelect(bar.id)}
                disabled={selecting !== null}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md disabled:opacity-50 cursor-pointer"
              >
                <div>
                  <p className="font-medium text-foreground">{bar.nome}</p>
                  <p className="mt-0.5 text-xs text-muted-light">{bar.slug}</p>
                </div>
                {selecting === bar.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {bars.length === 0 && !showCreate && (
          <p className="mb-6 text-center text-sm text-muted">
            Nenhum bar disponível. Crie o primeiro!
          </p>
        )}

        <div className="relative">
          {bars.length > 0 && !showCreate && (
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-light">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          {!showCreate ? (
            <Button
              variant="secondary"
              onClick={() => setShowCreate(true)}
              className="w-full"
            >
              + Criar novo bar
            </Button>
          ) : (
            <form
              onSubmit={handleCreate}
              className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-foreground">
                Novo bar
              </h2>
              <Input
                id="bar-name"
                label="Nome do bar"
                placeholder="Ex: Boteco do Zé"
                value={newBarName}
                onChange={(e) => setNewBarName(e.target.value)}
              />
              {newBarName && (
                <p className="text-xs text-muted-light">
                  Slug:{" "}
                  <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-foreground">
                    {slugify(newBarName)}
                  </span>
                </p>
              )}
              <div className="flex gap-2 pt-1">
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
      </div>
    </main>
  );
}
