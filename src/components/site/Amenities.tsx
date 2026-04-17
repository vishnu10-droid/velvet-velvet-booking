import { Sparkles, Utensils, Waves, Wine, Dumbbell, BellRing } from "lucide-react";

const items = [
  { icon: Utensils, title: "Michelin-starred dining", desc: "Two restaurants and a chef's table." },
  { icon: Waves, title: "Rooftop infinity pool", desc: "Heated, with skyline panoramas." },
  { icon: Wine, title: "Reserve cellar bar", desc: "Curated vintages and craft cocktails." },
  { icon: Dumbbell, title: "Wellness & spa", desc: "24h fitness, hammam, and treatments." },
  { icon: BellRing, title: "Personal concierge", desc: "Round-the-clock bespoke service." },
  { icon: Sparkles, title: "Turn-down ritual", desc: "Nightly chocolates and silk linens." },
];

export function Amenities() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-primary">
            The Experience
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Quietly <em className="text-gradient-gold">extraordinary</em>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.title}
              className="group rounded-2xl border border-border bg-card/40 p-7 transition-smooth hover:border-primary/50 hover:bg-card animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold transition-bounce group-hover:scale-110">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {it.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
