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
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg text-white",
        className
      )}
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, #2f7bff 0%, #1e4fd6 55%, #00d4ff 100%)",
        boxShadow:
          "0 0 0 1px rgba(120, 160, 255, 0.4), 0 8px 24px -10px rgba(47, 123, 255, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      }}
      aria-hidden
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.5 2.5h11v2.4H6.1v3h5.8v2.4H6.1v5.2H3.5V2.5Z"
          fill="currentColor"
        />
        <path
          d="M12.2 11.2l3.3 3.3m0 0v-2.4m0 2.4h-2.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>
    </span>
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
