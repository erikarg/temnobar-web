"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/services/auth.service";
import { getBars } from "@/services/bar.service";
import type { User } from "@/types/user";
import { api } from "@/services/api";

export function useAuth({ redirect = true } = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [barName, setBarName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const me = await getMe();
        if (cancelled) return;
        setUser(me);

        if (me.bar_id) {
          const bars = await getBars();
          const bar = bars.find((b) => b.id === me.bar_id);
          if (!cancelled && bar) setBarName(bar.nome);
        }
      } catch {
        if (!cancelled && redirect) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [redirect, router]);

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
    setUser(null);
    router.replace("/login");
  }, [router]);

  return { user, barName, loading, handleLogout };
}
