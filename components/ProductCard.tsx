"use client";

import Image from "next/image";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  apiUrl: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductCard({ product, apiUrl, onEdit, onDelete }: Props) {
  const thumbSrc = product.thumb_produto
    ? `${apiUrl}${product.thumb_produto}`
    : null;
  const isActive = product.status === "ACTIVE";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        isActive ? "border-border" : "border-border opacity-70"
      }`}
    >
      <div className="relative aspect-[4/3] bg-surface">
        {thumbSrc ? (
          <Image
            src={thumbSrc}
            alt={product.descricao_produto}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-light">
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
          </div>
        )}

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <span className="rounded-full bg-foreground/70 px-2.5 py-1 text-[11px] font-medium text-white">
              Inativo
            </span>
          </div>
        )}

        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            onClick={() => onEdit(product)}
            className="rounded-lg bg-white/90 p-1.5 text-muted shadow backdrop-blur-sm transition-colors hover:text-primary cursor-pointer"
            title="Editar"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(product)}
            className="rounded-lg bg-white/90 p-1.5 text-muted shadow backdrop-blur-sm transition-colors hover:text-danger cursor-pointer"
            title="Excluir"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted">
              {product.codigo_produto}
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground line-clamp-2 leading-snug">
              {product.descricao_produto}
            </p>
          </div>
          <span
            className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
              isActive ? "bg-accent" : "bg-muted-light"
            }`}
            title={isActive ? "Ativo" : "Inativo"}
          />
        </div>
      </div>
    </div>
  );
}
