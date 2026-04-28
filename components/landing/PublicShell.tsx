import { NavBar } from "./NavBar";
import { Footer } from "./Sections";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavBar />
      <main className="flex-1">{children}</main>
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
    <section className="relative overflow-hidden border-b border-border">
      <div className="bg-mesh pointer-events-none absolute inset-0 opacity-70" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-5xl px-5 py-20 text-center lg:px-8 lg:py-28">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-accent-cyan">
          {eyebrow}
        </div>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-strong">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
