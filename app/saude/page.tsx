"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getMenuHealth } from "@/services/product.service";
import type { MenuHealth } from "@/types/product";

type Metric = {
  label: string;
  value: number;
  hint: string;
  tone?: "neutral" | "warn" | "danger";
};

export default function SaudePage() {
  const { user, loading: authLoading } = useAuth();
  const [health, setHealth] = useState<MenuHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // O setState fica depois do await de propósito: chamada síncrona de setState
  // dentro de efeito é erro de lint no Next 16.
  const load = useCallback(async () => {
    try {
      const data = await getMenuHealth();
      setHealth(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = () => {
    setLoading(true);
    load();
  };

  useEffect(() => {
    if (!user?.bar_id) return;
    load();
  }, [user?.bar_id, load]);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user?.bar_id) return null;

  const metrics: Metric[] = health
    ? [
        {
          label: "Itens no cardápio",
          value: health.total,
          hint: "Cardápio enxuto protege margem e agiliza o pedido.",
        },
        {
          label: "Esgotados agora",
          value: health.esgotados,
          hint: "Aparecem como indisponíveis no cardápio público.",
          tone: health.esgotados > 0 ? "danger" : "neutral",
        },
        {
          label: "Sem preço",
          value: health.sem_preco,
          hint: "Sem preço o item não ajuda o cliente a decidir.",
          tone: health.sem_preco > 0 ? "warn" : "neutral",
        },
        {
          label: "Sem foto",
          value: health.sem_foto,
          hint: "Foto é o que mais pesa na escolha em cardápio digital.",
          tone: health.sem_foto > 0 ? "warn" : "neutral",
        },
        {
          label: "Sem seção",
          value: health.sem_categoria,
          hint: "Item sem seção cai em “Outros”, no fim da carta.",
          tone: health.sem_categoria > 0 ? "warn" : "neutral",
        },
        {
          label: "Nunca editados",
          value: health.nunca_editados,
          hint: "Cadastrados e esquecidos — vale revisar preço e descrição.",
        },
      ]
    : [];

  const toneClass = {
    neutral: "text-foreground",
    warn: "text-primary",
    danger: "text-danger-text",
  };

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[32px] leading-tight">Saúde do cardápio</h1>
            <p className="mt-1 text-[13.5px] text-muted">
              O que dá para medir sem dados de venda — e o que costuma faltar.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={refresh} loading={loading}>
            Atualizar
          </Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface py-14 text-center">
            <p className="text-sm font-medium">Não foi possível carregar os números</p>
            <Button variant="secondary" className="mt-4" onClick={refresh}>
              Tentar novamente
            </Button>
          </div>
        ) : loading && !health ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : health ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col gap-1 rounded-[14px] border border-border bg-card p-4"
                >
                  <span className="text-[12.5px] text-muted">{metric.label}</span>
                  <span
                    className={`font-mono text-[28px] leading-none ${
                      toneClass[metric.tone ?? "neutral"]
                    }`}
                  >
                    {metric.value}
                  </span>
                  <span className="mt-1 text-[11.5px] leading-relaxed text-muted-light">
                    {metric.hint}
                  </span>
                </div>
              ))}
            </div>

            <section className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-base font-semibold">Itens que mais esgotam</h2>
                <span className="font-mono text-[11.5px] text-muted-light">
                  últimos {health.janela_dias} dias
                </span>
              </div>

              {health.mais_esgotam.length === 0 ? (
                <p className="text-sm text-muted">
                  Nenhuma ruptura registrada na janela. O histórico começa a partir da
                  primeira vez que você marca um item como esgotado.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {health.mais_esgotam.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <span className="font-mono text-[11.5px] text-muted-light">
                        {item.codigo_produto}
                      </span>
                      <Link
                        href={`/?item=${item.id}`}
                        className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary"
                      >
                        {item.descricao_produto}
                      </Link>
                      <span className="font-mono text-[13px] text-danger-text">
                        {item.vezes}x
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="text-[12px] leading-relaxed text-muted-light">
                Item que esgota toda semana é sinal de compra curta ou de porção mal
                dimensionada — não de cardápio ruim.
              </p>
            </section>
          </>
        ) : null}
      </main>
    </AppShell>
  );
}
