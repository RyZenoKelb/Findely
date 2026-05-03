"use client";

import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function classes(variant: Variant = "primary", size: Size = "md"): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer";
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-[12px]",
    md: "h-9 px-4 text-[13px]",
    lg: "h-10 px-5 text-[13px]",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-accent text-white hover:bg-accent-strong active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
    secondary:
      "bg-white/[0.04] text-foreground hover:bg-white/[0.06] border border-white/[0.06]",
    outline:
      "border border-white/[0.08] text-muted-strong hover:text-foreground hover:bg-white/[0.04]",
    ghost:
      "text-muted-strong hover:text-foreground hover:bg-white/[0.04]",
    danger:
      "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20",
  };
  return cn(base, sizes[size], variants[variant]);
}

export interface ButtonProps
  extends BaseProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({
  variant,
  size,
  className,
  children,
  leftIcon,
  rightIcon,
  ...rest
}: ButtonProps) {
  return (
    <button className={cn(classes(variant, size), className)} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

export interface LinkButtonProps extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
}

export function LinkButton({
  href,
  target,
  rel,
  variant,
  size,
  className,
  children,
  leftIcon,
  rightIcon,
}: LinkButtonProps) {
  const isExternal = /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
        className={cn(classes(variant, size), className)}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(classes(variant, size), className)}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
