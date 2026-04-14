"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { uploadImage } from "@/services/upload.service";
import { createProduct, updateProduct } from "@/services/product.service";
import { API_BASE } from "@/services/api";
import type { Product } from "@/types/product";
import { ChevronDown } from "lucide-react";

const schema = z.object({
  codigo_produto: z.string().min(1, "Código obrigatório"),
  descricao_produto: z.string().min(1, "Descrição obrigatória"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type FormData = z.infer<typeof schema>;

type Props = {
  product?: Product;
  barId: string;
};

export function ProductForm({ product, barId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.foto_produto ?? "");
  const [thumbUrl, setThumbUrl] = useState(product?.thumb_produto ?? "");
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
      status: product?.status ?? "ACTIVE",
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
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

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      if (product) {
        await updateProduct(product.id, {
          ...data,
          foto_produto: imageUrl || null,
          thumb_produto: thumbUrl || null,
        });
      } else {
        await createProduct({
          ...data,
          bar_id: barId,
          foto_produto: imageUrl || null,
          thumb_produto: thumbUrl || null,
        });
      }
      router.push("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Erro ao salvar produto";
      setError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-border bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-danger-light px-3 py-2.5 text-sm text-danger">
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Foto do produto
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-44 w-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-surface transition-all hover:border-primary/50 hover:bg-primary-light"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="text-center text-muted-light">
              <svg
                className="mx-auto h-7 w-7 mb-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-xs font-medium">Enviar foto</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="codigo_produto"
          label="Código do produto"
          placeholder="Ex: CERV001"
          error={errors.codigo_produto?.message}
          {...register("codigo_produto")}
        />

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Status
          </label>

          <div className="relative">
            <select
              id="status"
              {...register("status")}
              className="appearance-none w-full rounded-lg border border-border bg-white px-3.5 pr-10 py-2.5 text-sm text-foreground shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary-ring/40 cursor-pointer"
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      <Input
        id="descricao_produto"
        label="Descrição"
        placeholder="Ex: Cerveja IPA 500ml"
        error={errors.descricao_produto?.message}
        {...register("descricao_produto")}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/")}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting || uploading}>
          {product ? "Salvar alterações" : "Criar produto"}
        </Button>
      </div>
    </form>
  );
}
