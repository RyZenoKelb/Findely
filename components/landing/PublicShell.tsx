import { PublicBackground } from "./Backgrounds";
import { NavBar } from "./NavBar";
import { Footer } from "./Sections";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <PublicBackground />
      <NavBar />
      <main className="relative flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PublicPageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 30%, rgba(59,130,246,0.18), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-5 pb-10 pt-28 text-center lg:px-8 lg:pt-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-accent-cyan">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent-cyan" />
          {eyebrow}
        </div>
        <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-balance text-[15px] leading-relaxed text-muted-strong">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
