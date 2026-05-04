import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <img
      src="/brand/findely-app-icon.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={cn("rounded-[7px]", className)}
      draggable={false}
    />
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-[15px] font-semibold tracking-tight text-foreground",
        className
      )}
    >
      Findely
    </span>
  );
}

export type LogoVariant = "default" | "horizontal" | "white" | "mark";

export interface LogoProps {
  className?: string;
  /** When provided, Logo renders as a link. Omit to render as plain element (safe inside other links). */
  href?: string;
  size?: number;
  variant?: LogoVariant;
  showWordmark?: boolean;
}

export function Logo({
  className,
  href,
  size,
  variant = "default",
  showWordmark = true,
}: LogoProps) {
  let content: React.ReactNode;

  if (variant === "horizontal") {
    content = (
      <img
        src="/brand/findely-logo-horizontal.png"
        alt="Findely"
        height={size ?? 28}
        style={{ height: size ?? 28, width: "auto" }}
        draggable={false}
      />
    );
  } else if (variant === "white") {
    content = (
      <img
        src="/brand/findely-logo-white.png"
        alt="Findely"
        height={size ?? 28}
        style={{ height: size ?? 28, width: "auto" }}
        draggable={false}
      />
    );
  } else if (variant === "mark") {
    content = <LogoMark size={size} />;
  } else {
    content = (
      <>
        <LogoMark size={size} />
        {showWordmark ? <LogoWordmark /> : null}
      </>
    );
  }

  const classes = cn("inline-flex items-center gap-2", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return <span className={classes}>{content}</span>;
}
