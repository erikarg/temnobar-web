import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "md" | "sm";
  loading?: boolean;
};

const variants = {
  primary:
    "bg-primary text-primary-ink hover:bg-primary-hover focus-visible:ring-primary-ring",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-elevated focus-visible:ring-primary-ring",
  danger:
    "bg-danger-light text-danger-text border border-danger/60 hover:bg-danger hover:text-foreground focus-visible:ring-danger",
  ghost:
    "text-muted hover:text-foreground hover:bg-surface focus-visible:ring-primary-ring",
} as const;

// 44px é o alvo mínimo de toque: o app é usado em pé, atrás do balcão.
const sizes = {
  md: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-[13px]",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
