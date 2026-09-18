import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-[13px] text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-light">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={`h-11 w-full rounded-[10px] border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary-ring/30 ${
              error ? "border-danger" : "border-border"
            } ${prefix ? "pl-10" : ""} ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-danger-text">{error}</p>
        ) : hint ? (
          <p className="text-xs text-muted-light">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
