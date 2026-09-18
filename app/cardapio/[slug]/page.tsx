import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicMenu } from "@/services/menu.service";
import { formatPrice } from "@/lib/money";
import { tagLabel } from "@/lib/tags";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);

  if (!menu) return { title: "Cardápio não encontrado" };

  return {
    title: `${menu.bar.nome} · Cardápio`,
    description: `Cardápio do ${menu.bar.nome}: ${menu.total_itens} itens, atualizado direto pelo bar.`,
    openGraph: {
      title: `${menu.bar.nome} · Cardápio`,
      description: `O que o ${menu.bar.nome} está servindo agora.`,
      type: "website",
    },
  };
}

export default async function CardapioPublicoPage({ params }: Props) {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);

  if (!menu) notFound();

  return (
    <div className="menu-public flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 md:py-14">
        <header className="flex flex-col gap-3 border-b border-border pb-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
            Cardápio
          </span>
          <h1 className="font-display text-[44px] leading-[1.05] md:text-[56px]">
            {menu.bar.nome}
          </h1>
          <p className="text-sm text-muted">
            {menu.total_itens} {menu.total_itens === 1 ? "item" : "itens"}
            {menu.total_indisponiveis > 0 && (
              <>
                {" · "}
                {menu.total_indisponiveis}{" "}
                {menu.total_indisponiveis === 1
                  ? "indisponível"
                  : "indisponíveis"}{" "}
                hoje
              </>
            )}
          </p>
        </header>

        {menu.secoes.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            Este bar ainda não publicou itens no cardápio.
          </p>
        ) : (
          <div className="flex flex-col gap-10 pt-8">
            {menu.secoes.map((secao) => (
              <section key={secao.id} className="flex flex-col gap-4">
                <h2 className="font-display text-[26px] leading-tight text-foreground">
                  {secao.nome}
                </h2>

                <ul className="flex flex-col divide-y divide-border">
                  {secao.itens.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-start gap-4 py-4 ${
                        item.disponivel ? "" : "opacity-60"
                      }`}
                    >
                      {item.thumb_produto ? (
                        <Image
                          src={item.thumb_produto}
                          alt={item.descricao_produto}
                          width={64}
                          height={64}
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="h-16 w-16 shrink-0 rounded-xl bg-elevated" />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold leading-snug">
                          {item.descricao_produto}
                        </p>

                        {item.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-elevated px-1.5 py-0.5 text-[10.5px] text-muted"
                              >
                                {tagLabel(tag)}
                              </span>
                            ))}
                          </div>
                        )}

                        {!item.disponivel && (
                          <span className="mt-2 inline-block rounded-full border border-danger/60 bg-danger-light px-2.5 py-1 text-[11px] text-danger-text">
                            Indisponível hoje
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 font-mono text-[14px] text-primary">
                        {item.preco > 0 ? formatPrice(item.preco) : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border px-4 py-6">
        <p className="mx-auto max-w-2xl font-mono text-[11px] uppercase tracking-[0.1em] text-muted-light">
          Atualizado pelo próprio bar · TemNoBar
        </p>
      </footer>
    </div>
  );
}
