"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { login } from "@/services/auth.service";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
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
      const user = await login(data);
      router.push(user.bar_id ? "/" : "/select-bar");
    } catch {
      setError("Email ou senha incorretos");
    }
  };

  return (
    <div className="grid flex-1 md:grid-cols-[1.15fr_1fr]">
      <section className="hidden flex-col justify-between border-r border-border bg-[#191510] p-16 md:flex [background-image:radial-gradient(520px_320px_at_20%_85%,rgba(242,179,61,0.16),rgba(25,21,16,0))]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-primary font-display text-[23px] text-primary-ink">
            T
          </span>
          <span className="font-display text-2xl">TemNoBar</span>
        </div>

        <div className="flex max-w-[540px] flex-col gap-6">
          <h1 className="font-display text-[76px] leading-[0.98]">
            Tem no bar?
            <br />
            <span className="text-primary">Tem.</span>
          </h1>
          <p className="text-base leading-relaxed text-muted">
            O cardápio do seu bar em uma tela só: o que está servindo, o que acabou e
            o que volta amanhã. Feito para ser usado em pé, atrás do balcão.
          </p>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-light">
          cardápio · seções · operação de salão
        </p>
      </section>

      <section className="flex flex-col justify-center gap-6 px-6 py-12 md:px-14">
        <div className="flex items-center gap-3 md:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary font-display text-xl text-primary-ink">
            T
          </span>
          <span className="font-display text-xl">TemNoBar</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-[26px] font-semibold">Entrar</h2>
          <p className="text-sm text-muted">
            Use a conta do seu bar para abrir o cardápio.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <p className="flex items-center gap-2 rounded-[10px] border border-danger/50 bg-danger-light px-3 py-2.5 text-sm text-danger-text">
              <CircleAlert className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

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
            placeholder="Sua senha"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" loading={isSubmitting} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Primeira vez por aqui?{" "}
          <Link href="/register" className="font-semibold text-primary hover:text-primary-hover">
            Criar conta do bar
          </Link>
        </p>
      </section>
    </div>
  );
}
