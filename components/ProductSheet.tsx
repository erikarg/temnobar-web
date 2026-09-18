"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { uploadImage } from "@/services/upload.service";
import { createProduct, updateProduct } from "@/services/product.service";
import { API_BASE } from "@/services/api";
import { PRODUCT_TAGS } from "@/lib/tags";
import { formatPriceInput, parsePriceInput } from "@/lib/money";
import type { Category } from "@/types/category";
import type { Product, ProductTag } from "@/types/product";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const schema = z.object({
  codigo_produto: z.string().min(1, "Código obrigatório"),
  descricao_produto: z.string().min(1, "Descrição obrigatória"),
});

type FormData = z.infer<typeof schema>;

type Props = {
  product: Product | null;
  barId: string;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
  onRequestDelete: (product: Product) => void;
};

export function ProductSheet({
  product,
  barId,
  categories,
  onClose,
  onSaved,
  onRequestDelete,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.foto_produto ?? "");
  const [thumbUrl, setThumbUrl] = useState(product?.thumb_produto ?? "");
  const [preco, setPreco] = useState(product?.preco ?? 0);
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [tags, setTags] = useState<ProductTag[]>(product?.tags ?? []);
  const [status, setStatus] = useState(product?.status ?? "ACTIVE");
  const [preview, setPreview] = useState<string | null>(
    product?.thumb_produto
      ? product.thumb_produto.startsWith("http")
        ? product.thumb_produto
        : `${API_BASE}${product.thumb_produto}`
      : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo_produto: product?.codigo_produto ?? "",
      descricao_produto: product?.descricao_produto ?? "",
    },
  });

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Formato não suportado. Use JPG, PNG ou WebP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("Imagem muito grande. O limite é 5 MB.");
      e.target.value = "";
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setPreview(objectUrl);
    setUploading(true);
    setError("");

    try {
      const result = await uploadImage(file);
      setImageUrl(result.url);
      setThumbUrl(result.thumb_url);
    } catch {
      setError("Erro ao enviar imagem");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const toggleTag = (tag: ProductTag) => {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    const payload = {
      ...data,
      status,
      preco,
      tags,
      category_id: categoryId || null,
      foto_produto: imageUrl || null,
      thumb_produto: thumbUrl || null,
    };

    try {
      if (product) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct({ ...payload, bar_id: barId });
      }
      onSaved();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 409
          ? "Já existe um item com esse código neste bar."
          : "Não foi possível salvar o item. Tente novamente.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fechar painel"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#0c0a08]/60"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="relative flex h-full w-full max-w-[468px] flex-col border-l border-border bg-[#191510] shadow-2xl"
      >
        <div className="flex items-start gap-3 border-b border-border px-6 py-5">
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
              {product ? "Editando item" : "Novo item"}
            </span>
            <h2 id="sheet-title" className="font-display text-[28px] leading-tight">
              {product?.descricao_produto ?? "Adicionar ao cardápio"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-surface text-muted transition-colors hover:text-foreground"
          >
            <X className="h-[17px] w-[17px]" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-[10px] border border-danger/50 bg-danger-light px-3 py-2.5 text-sm text-danger-text">
              {error}
            </p>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-[132px] w-[132px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[14px] border border-dashed border-border bg-elevated transition-colors hover:border-primary/50"
            >
              {preview ? (
                // next/image não otimiza blob: URLs do preview local.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Pré-visualização da foto"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-light">Enviar foto</span>
              )}
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </span>
              )}
            </button>
            <div className="flex flex-col justify-center gap-2">
              <p className="text-[13px] leading-relaxed text-muted">
                JPG, PNG ou WebP até 5 MB. A miniatura é gerada no servidor.
              </p>
              {preview && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start text-danger-text"
                  onClick={() => {
                    setPreview(null);
                    setImageUrl("");
                    setThumbUrl("");
                  }}
                >
                  Remover foto
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={handleImageChange}
            className="hidden"
          />

          <Input
            id="descricao_produto"
            label="Descrição"
            placeholder="Ex: Chopp Pilsen 500ml"
            error={errors.descricao_produto?.message}
            {...register("descricao_produto")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="codigo_produto"
              label="Código"
              placeholder="CERV001"
              className="font-mono"
              error={errors.codigo_produto?.message}
              {...register("codigo_produto")}
            />
            <Input
              id="preco"
              label="Preço"
              inputMode="numeric"
              prefix="R$"
              value={formatPriceInput(preco)}
              onChange={(e) => setPreco(parsePriceInput(e.target.value))}
              hint="Deixe zerado se o item não tem preço fixo."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category_id" className="text-[13px] text-muted">
              Seção do cardápio
            </label>
            <select
              id="category_id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-[10px] border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-ring/30"
            >
              <option value="">Sem seção</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="flex flex-col gap-2 border-none p-0">
            <legend className="mb-1 p-0 text-[13px] text-muted">Etiquetas</legend>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TAGS.map(({ value, label }) => {
                const active = tags.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTag(value)}
                    className={`h-9 cursor-pointer rounded-full border px-3 text-[13px] transition-colors ${
                      active
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border bg-surface text-muted hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2 border-none p-0">
            <legend className="mb-1 p-0 text-[13px] text-muted">Situação agora</legend>
            <div className="flex gap-2.5">
              <label
                className={`flex h-[52px] flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 ${
                  status === "ACTIVE"
                    ? "border-accent bg-accent-light"
                    : "border-border bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name="situacao"
                  checked={status === "ACTIVE"}
                  onChange={() => setStatus("ACTIVE")}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">Servindo</span>
                  <span className="text-[11.5px] text-muted">aparece no cardápio</span>
                </span>
              </label>
              <label
                className={`flex h-[52px] flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 ${
                  status === "INACTIVE"
                    ? "border-danger bg-danger-light"
                    : "border-border bg-surface"
                }`}
              >
                <input
                  type="radio"
                  name="situacao"
                  checked={status === "INACTIVE"}
                  onChange={() => setStatus("INACTIVE")}
                  className="h-4 w-4 accent-[var(--danger)]"
                />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">Esgotado</span>
                  <span className="text-[11.5px] text-muted">
                    fica como indisponível
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <p className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3.5 text-[12.5px] leading-relaxed text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Marcar como esgotado não apaga o item: ele continua no cardápio público
            como indisponível e volta com um toque.
          </p>

          </div>

          <div className="flex items-center gap-2.5 border-t border-border px-6 py-4">
            <Button type="submit" loading={isSubmitting || uploading}>
              {product ? "Salvar alterações" : "Criar item"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            {product && (
              <Button
                type="button"
                variant="ghost"
                className="ml-auto text-danger-text"
                onClick={() => onRequestDelete(product)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </form>
      </aside>
    </div>
  );
}
