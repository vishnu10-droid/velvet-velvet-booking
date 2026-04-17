import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHero({ eyebrow, title, description, actions }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card/30 pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_oklch(0.78_0.13_80_/_0.16),_transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-10 lg:pb-20">
        <p className="text-xs uppercase tracking-[0.38em] text-primary">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

