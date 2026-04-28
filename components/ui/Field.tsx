"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const INPUT_BASE =
  "w-full h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted/80 outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25 disabled:opacity-60";

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
        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%238b90a3%22 d=%22M2 4l4 4 4-4z%22/></svg>')] bg-[right_0.75rem_center] bg-no-repeat pr-9",
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
        className="text-xs font-medium uppercase tracking-wide text-muted"
      >
        {children}
      </label>
      {hint ? <span className="text-xs text-muted/80">{hint}</span> : null}
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
        "h-4 w-4 rounded border border-border-strong bg-surface-2 text-accent accent-[color:var(--accent)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className
      )}
      {...rest}
    />
  );
}
