"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const INPUT_BASE =
  "w-full h-9 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 text-[13px] text-foreground placeholder:text-muted outline-none transition-all hover:border-white/[0.1] focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 disabled:opacity-50";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(INPUT_BASE, className)} {...rest} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        INPUT_BASE,
        "min-h-[96px] py-2 leading-relaxed resize-y h-auto",
        className
      )}
      {...rest}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        INPUT_BASE,
        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%2371717a%22 d=%22M2 4l4 4 4-4z%22/></svg>')] bg-[right_0.75rem_center] bg-no-repeat pr-9",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
});

export function Label({
  children,
  htmlFor,
  className,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-medium uppercase tracking-[0.05em] text-muted"
      >
        {children}
      </label>
      {hint ? <span className="text-[11px] text-muted">{hint}</span> : null}
    </div>
  );
}

export function Checkbox({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-white/[0.08] bg-white/[0.03] text-accent accent-[color:var(--accent)] outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        className
      )}
      {...rest}
    />
  );
}
