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
      src="/logo.svg"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={cn("rounded-[7px]", className)}
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

export interface LogoProps {
  className?: string;
  /** When provided, Logo renders as a link. Omit to render as plain element (safe inside other links). */
  href?: string;
  size?: number;
}

export function Logo({ className, href, size }: LogoProps) {
  const content = (
    <>
      <LogoMark size={size} />
      <LogoWordmark />
    </>
  );

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
