"use client";

import Image from "next/image";
import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { TagChip } from "@/components/TagChip";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  apiUrl: string;
  selected: boolean;
  toggling?: boolean;
  onSelect: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
};

export function ProductCard({
  product,
  apiUrl,
  selected,
  toggling,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  // Defesa contra defasagem de deploy: uma API mais antiga responde sem preco
  // e sem tags, e ler .length de undefined derrubaria a tela inteira.
  const tags = product.tags ?? [];
  const preco = product.preco ?? 0;
  const thumbSrc = product.thumb_produto
    ? product.thumb_produto.startsWith("http")
      ? product.thumb_produto
      : `${apiUrl}${product.thumb_produto}`
    : null;
  const isActive = product.status === "ACTIVE";

  return (
    <div
      className={`group relative overflow-hidden rounded-[14px] border bg-card transition-colors ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <div className="relative aspect-[4/3] bg-elevated">
        {thumbSrc ? (
          <Image
            src={thumbSrc}
            alt={product.descricao_produto}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover ${isActive ? "" : "opacity-40"}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-light">
            <ImageOff className="h-7 w-7" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute left-2.5 top-2.5 flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-md bg-background/75 px-1.5 py-1 backdrop-blur-sm">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(product)}
              aria-label={`Selecionar ${product.descricao_produto}`}
              className="h-3.5 w-3.5 accent-[var(--primary)]"
            />
            <span className="font-mono text-[10.5px] text-foreground">
              {product.codigo_produto}
            </span>
          </label>
        </div>

        <div className="absolute right-2.5 top-2.5 flex gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(product)}
            aria-label={`Editar ${product.descricao_produto}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:text-primary"
          >
            <Pencil className="h-[15px] w-[15px]" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            aria-label={`Excluir ${product.descricao_produto}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-background/80 text-danger-text backdrop-blur-sm transition-colors hover:text-danger-text/80"
          >
            <Trash2 className="h-[15px] w-[15px]" />
          </button>
        </div>

        {!isActive && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-danger/60 bg-background/85 px-3 py-1 text-[11.5px] text-danger-text">
            Esgotado
          </span>
        )}
      </div>

      <div className="flex items-start gap-2.5 p-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[14.5px] font-semibold leading-snug ${
              isActive ? "text-foreground" : "text-muted"
            }`}
          >
            {product.descricao_produto}
          </p>
          <p className="mt-1 font-mono text-[12.5px] text-primary">
            {preco > 0 ? formatPrice(preco) : "sem preço"}
          </p>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          aria-label={`Disponibilidade de ${product.descricao_produto}`}
          disabled={toggling}
          onClick={() => onToggleStatus(product)}
          className={`relative mt-0.5 h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-60 ${
            isActive ? "bg-accent" : "border border-border bg-elevated"
          }`}
        >
          <span
            className={`absolute top-[3px] h-5 w-5 rounded-full transition-all ${
              isActive
                ? "right-[3px] bg-foreground"
                : "left-[3px] bg-muted-light"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
