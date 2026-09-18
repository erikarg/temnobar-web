"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      await registerUser(data);
      router.push("/select-bar");
    } catch {
      // Mensagem unica de proposito: repassar o erro da API revelaria se o
      // e-mail ja esta cadastrado (enumeracao de contas).
      setError("Não foi possível criar a conta. Verifique os dados e tente novamente.");
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary font-display text-[26px] text-primary-ink">
            T
          </span>
          <h1 className="font-display text-[34px] leading-tight">Criar conta do bar</h1>
          <p className="text-sm text-muted">
            Em um minuto seu cardápio está no ar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-6"
        >
          {error && (
            <p className="flex items-center gap-2 rounded-[10px] border border-danger/50 bg-danger-light px-3 py-2.5 text-sm text-danger-text">
              <CircleAlert className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <Input
            id="name"
            label="Nome"
            placeholder="Seu nome"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="voce@bar.com.br"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" loading={isSubmitting} className="w-full">
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
