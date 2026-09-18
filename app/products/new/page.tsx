import { redirect } from "next/navigation";

// O cadastro passou a acontecer no painel lateral do cardápio; a rota antiga
// continua válida para link salvo.
export default function NewProductPage() {
  redirect("/?item=novo");
}
