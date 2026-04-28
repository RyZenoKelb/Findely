import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  as: Tag = "div",
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-border bg-surface bg-panel",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border px-5 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)}>{children}</div>;
}

export function CardContent({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-t border-border px-5 py-3 text-xs text-muted",
        className
      )}
    >
      {children}
    </div>
  );
}
