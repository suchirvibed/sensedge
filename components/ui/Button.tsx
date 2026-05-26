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
    "bg-orange text-white hover:bg-orange-dark border border-orange hover:border-orange-dark",
  outline:
    "bg-transparent text-text-primary border border-text-primary hover:bg-text-primary hover:text-white",
  ghost:
    "bg-transparent text-text-primary border border-transparent hover:bg-black/5",
  dark: "bg-bg-dark text-white border border-bg-dark hover:bg-bg-darker",
};

const SIZES: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-[15px]",
};

function base(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center gap-3 rounded-btn font-semibold tracking-tight",
    "transition duration-300 select-none whitespace-nowrap",
    SIZES[size],
    VARIANTS[variant],
    className
  );
}

function ArrowBox({ variant }: { variant: Variant }) {
  const bg =
    variant === "primary"
      ? "bg-orange-dark text-white"
      : variant === "dark"
      ? "bg-black/30 text-white"
      : "bg-black/10 text-current group-hover:bg-white/20";
  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-[3px] text-xs transition",
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
