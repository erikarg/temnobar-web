"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { user, barName, handleLogout } = useAuth();

  if (!user) return null;

  return (
    <header className="border-b border-border bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              T
            </span>
            <span className="text-sm font-semibold text-foreground">
              TemNoBar
            </span>
          </Link>
          {barName && (
            <>
              <span className="text-border">/</span>
              <span className="text-sm text-muted">{barName}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:block">
            {user.name}
          </span>
          <Button variant="ghost" onClick={handleLogout} className="text-xs">
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
