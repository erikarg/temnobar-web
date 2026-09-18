"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronsUpDown,
  CircleAlert,
  LayoutList,
  LogOut,
  Plus,
  QrCode,
  Tags,
} from "lucide-react";

type Props = {
  children: React.ReactNode;
  stats?: { total: number; esgotados: number };
};

const NAV = [
  { href: "/", label: "Cardápio", icon: LayoutList },
  { href: "/categorias", label: "Seções", icon: Tags },
  { href: "/saude", label: "Saúde", icon: CircleAlert },
  { href: "/qr", label: "QR e link", icon: QrCode },
];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function AppShell({ children, stats }: Props) {
  const { user, barName, handleLogout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-1">
      <nav className="hidden w-[244px] shrink-0 flex-col gap-6 border-r border-border bg-[#1a1610] p-4 md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary font-display text-lg text-primary-ink">
            T
          </span>
          <span className="font-display text-xl">TemNoBar</span>
        </Link>

        <Link
          href="/select-bar"
          className="flex h-14 items-center gap-2.5 rounded-xl border border-border bg-elevated px-3 transition-colors hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary-light text-xs font-semibold text-primary">
            {initials(barName ?? "Bar")}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13.5px] font-semibold">
              {barName ?? "Selecionar bar"}
            </span>
            <span className="truncate font-mono text-[10.5px] text-muted-light">
              trocar de bar
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-light" />
        </Link>

        <div className="flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm transition-colors ${
                  active
                    ? "bg-elevated font-semibold text-foreground"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${active ? "text-primary" : ""}`}
                />
                {label}
                {href === "/" && stats && (
                  <span className="ml-auto font-mono text-[11.5px] text-muted">
                    {stats.total}
                  </span>
                )}
                {href === "/saude" && stats && stats.esgotados > 0 && (
                  <span className="ml-auto font-mono text-[11.5px] text-danger-text">
                    {stats.esgotados}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-elevated p-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-border text-xs font-semibold">
            {initials(user?.name ?? "")}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-medium">{user?.name}</span>
            <span className="truncate text-[11px] text-muted-light">
              {user?.email}
            </span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-light transition-colors hover:text-foreground"
          >
            <LogOut className="h-[17px] w-[17px]" />
          </button>
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <Link
            href="/select-bar"
            className="flex h-12 flex-1 items-center gap-2.5 rounded-xl border border-border bg-surface px-3"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-[11px] font-semibold text-primary">
              {initials(barName ?? "Bar")}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">
                {barName ?? "Selecionar bar"}
              </span>
              {stats && (
                <span className="truncate text-[11px] text-muted-light">
                  {stats.total - stats.esgotados} servindo · {stats.esgotados}{" "}
                  {stats.esgotados === 1 ? "esgotado" : "esgotados"}
                </span>
              )}
            </span>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-light" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-muted"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </header>

        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-start justify-between border-t border-border bg-[#1a1610] px-4 pt-2.5 pb-5 md:hidden">
        {NAV.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-xl text-[11px] ${
              pathname === href ? "font-semibold text-primary" : "text-muted-light"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}

        <Link
          href="/?item=novo"
          aria-label="Novo produto"
          className="-mt-5 flex h-15 w-15 items-center justify-center rounded-[18px] bg-primary text-primary-ink shadow-lg shadow-primary/25"
          style={{ height: 60, width: 60 }}
        >
          <Plus className="h-6 w-6" />
        </Link>

        {NAV.slice(2).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-xl text-[11px] ${
              pathname === href ? "font-semibold text-primary" : "text-muted-light"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
