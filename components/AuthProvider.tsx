"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe, logout } from "@/services/auth.service";
import { getBars } from "@/services/bar.service";
import type { User } from "@/types/user";
import type { Bar } from "@/types/bar";

type AuthState = {
  user: User | null;
  bar: Bar | null;
  barName: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  handleLogout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

const PUBLIC_PATHS = ["/login", "/register"];

// O cardápio público é lido por quem nunca vai ter sessão: nada de buscar
// usuário nem redirecionar para o login nessas rotas.
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/cardapio/");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = isPublicPath(pathname);

  const [user, setUser] = useState<User | null>(null);
  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(!isPublic);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await getMe();
      setUser(me);

      if (me.bar_id) {
        const bars = await getBars();
        setBar(bars.find((b) => b.id === me.bar_id) ?? null);
      } else {
        setBar(null);
      }
    } catch {
      setUser(null);
      setBar(null);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isPublic) {
      setUser(null);
      setBar(null);
      setLoading(false);
      return;
    }

    load();
  }, [isPublic, load]);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setBar(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      bar,
      barName: bar?.nome ?? null,
      loading,
      refresh: load,
      handleLogout,
    }),
    [user, bar, loading, load, handleLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
