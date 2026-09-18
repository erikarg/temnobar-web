"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function QrPage() {
  const { user, bar, loading: authLoading } = useAuth();
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  const menuUrl =
    bar && typeof window !== "undefined"
      ? `${window.location.origin}/cardapio/${bar.slug}`
      : "";

  useEffect(() => {
    if (!menuUrl) return;
    QRCode.toDataURL(menuUrl, {
      width: 512,
      margin: 2,
      color: { dark: "#14110d", light: "#f6f0e4" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [menuUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user?.bar_id) return null;

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <div>
          <h1 className="font-display text-[32px] leading-tight">QR e link do cardápio</h1>
          <p className="mt-1 text-[13.5px] text-muted">
            Cole o QR na mesa e o link na bio. O cardápio é público e mostra o que
            está servindo agora.
          </p>
        </div>

        <div className="flex flex-col gap-6 rounded-[14px] border border-border bg-card p-6 sm:flex-row sm:items-center">
          <div className="flex h-[232px] w-[232px] shrink-0 items-center justify-center rounded-[14px] bg-[#f6f0e4] p-3">
            {qr ? (
              // A imagem é um data URL gerado no cliente; next/image não se aplica.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt={`QR code do cardápio de ${bar?.nome ?? "seu bar"}`} className="h-full w-full" />
            ) : (
              <span className="text-[13px] text-[#14110d]">Gerando…</span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-muted">Link público</span>
              <code className="truncate rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-[13px] text-primary">
                {menuUrl || "carregando…"}
              </code>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button onClick={copyLink} disabled={!menuUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar link"}
              </Button>
              <a
                href={menuUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-elevated"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir cardápio
              </a>
              {qr && (
                <a
                  href={qr}
                  download={`qr-${bar?.slug ?? "cardapio"}.png`}
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-elevated"
                >
                  Baixar PNG
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="text-[12.5px] leading-relaxed text-muted-light">
          Item esgotado continua na carta, marcado como indisponível — o cliente vê
          que o bar tem o item, mas não hoje.
        </p>
      </main>
    </AppShell>
  );
}
