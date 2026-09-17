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

type AuthState = {
  user: User | null;
  barName: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  handleLogout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  const [user, setUser] = useState<User | null>(null);
  const [barName, setBarName] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isPublic);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await getMe();
      setUser(me);

      if (me.bar_id) {
        const bars = await getBars();
        setBarName(bars.find((b) => b.id === me.bar_id)?.nome ?? null);
      } else {
        setBarName(null);
      }
    } catch {
      setUser(null);
      setBarName(null);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isPublic) {
      setUser(null);
      setBarName(null);
      setLoading(false);
      return;
    }

    load();
  }, [isPublic, load]);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setBarName(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, barName, loading, refresh: load, handleLogout }),
    [user, barName, loading, load, handleLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
