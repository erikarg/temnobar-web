"use client";

import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user?.bar_id) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="mb-6 text-xl font-bold text-foreground">
          Novo produto
        </h1>
        <ProductForm barId={user.bar_id} />
      </main>
    </>
  );
}
