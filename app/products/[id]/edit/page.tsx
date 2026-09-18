import { redirect } from "next/navigation";

// A edição passou a acontecer no painel lateral do cardápio; a rota antiga
// continua válida para link salvo.
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/?item=${id}`);
}
