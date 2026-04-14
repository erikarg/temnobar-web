import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
};

const variants = {
  primary:
    "bg-primary text-white shadow-sm shadow-primary/25 hover:bg-primary-hover active:shadow-none",
  secondary:
    "bg-white text-foreground border border-border shadow-sm hover:bg-surface active:bg-surface",
  danger:
    "bg-danger text-white shadow-sm shadow-danger/25 hover:bg-danger-hover active:shadow-none",
  ghost:
    "text-muted hover:text-foreground hover:bg-surface",
} as const;

export function Button({
  variant = "primary",
  loading,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
      ) : null}
      {children}
    </button>
  );
}
