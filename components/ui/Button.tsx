import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "dark";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  showArrow?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-orange text-white hover:bg-orange-dark border border-orange hover:border-orange-dark shadow-card hover:shadow-hover",
  outline:
    "bg-transparent text-text-primary border border-border hover:border-text-primary hover:bg-bg-page",
  ghost:
    "bg-transparent text-text-primary border border-transparent hover:bg-bg-subtle",
  dark: "bg-bg-dark text-white border border-bg-dark hover:bg-bg-darker",
};

const SIZES: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

function base(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center gap-2.5 rounded-btn font-semibold tracking-tight",
    "transition-all duration-200 select-none whitespace-nowrap",
    SIZES[size],
    VARIANTS[variant],
    className
  );
}

function ArrowBox({ variant }: { variant: Variant }) {
  const bg =
    variant === "primary"
      ? "bg-white/20 text-white"
      : variant === "dark"
      ? "bg-white/15 text-white"
      : "bg-bg-subtle text-current group-hover:bg-text-primary/10";
  return (
    <span
      className={cn(
        "ml-1 inline-flex h-5 w-5 items-center justify-center rounded-[4px] text-[11px] transition-transform duration-200 group-hover:translate-x-0.5",
        bg
      )}
    >
      →
    </span>
  );
}

interface ButtonProps extends Omit<ComponentProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  showArrow,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button {...rest} className={cn("group", base(variant, size, className))}>
      {children}
      {showArrow && <ArrowBox variant={variant} />}
    </button>
  );
}

interface LinkButtonProps extends BaseProps {
  href: string;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  showArrow,
  className,
  children,
}: LinkButtonProps) {
  return (
    <Link href={href} className={cn("group", base(variant, size, className))}>
      {children}
      {showArrow && <ArrowBox variant={variant} />}
    </Link>
  );
}
