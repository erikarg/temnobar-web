import type { PublicMenu } from "@/types/menu";

// Busca no servidor (sem axios e sem cookie): o cardápio público é renderizado
// no server component para ser indexável.
export async function getPublicMenu(slug: string): Promise<PublicMenu | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL nao configurada.");
  }

  const res = await fetch(
    `${apiUrl}/public/bares/${encodeURIComponent(slug)}/cardapio`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) return null;

  const json = await res.json();
  return json.data as PublicMenu;
}
