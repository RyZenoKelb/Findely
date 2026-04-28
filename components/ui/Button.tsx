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
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-[15px]",
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-accent text-white hover:bg-accent-strong shadow-[0_8px_24px_-12px_rgba(79,140,255,0.6)]",
    secondary:
      "bg-surface-2 text-foreground hover:bg-surface-3 border border-border",
    outline: "border border-border-strong text-foreground hover:bg-surface-2",
    ghost: "text-muted-strong hover:text-foreground hover:bg-surface-2",
    danger:
      "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30",
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
