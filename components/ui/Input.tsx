import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...rest },
  ref
) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId} className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
        </span>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "h-11 w-full rounded-input border border-border bg-white px-3.5 text-sm transition-shadow",
          "placeholder:text-text-hint",
          "focus:border-text-primary focus:outline-none focus:ring-2 focus:ring-orange/15",
          error && "border-tint-redText focus:ring-tint-redText/15",
          className
        )}
        {...rest}
      />
      {hint && !error && <span className="mt-1 block text-xs text-text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-tint-redText">{error}</span>}
    </label>
  );
});
