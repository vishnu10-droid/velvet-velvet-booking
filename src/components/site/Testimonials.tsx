import { Quote } from "lucide-react";

const items = [
  {
    quote:
      "The most thoughtful stay I have experienced in years. Every detail, from turn-down service to the espresso bar, felt personal.",
    name: "Eleanor Vance",
    role: "Travel Editor, Veridian",
  },
  {
    quote:
      "Aurelia redefines what a city hotel can be - quiet, cinematic, and impossibly elegant. We will be back every season.",
    name: "Marcus Holloway",
    role: "Architect",
  },
  {
    quote:
      "From the first hello in the lobby to sunrise on the terrace, it felt like staying with old friends in extraordinary taste.",
    name: "Priya Nair",
    role: "Founder, Atelier Lune",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-card/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-primary">Guests</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Whispered <em className="text-gradient-gold">among friends</em>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((testimonial, index) => (
            <figure
              key={testimonial.name}
              className="group relative flex flex-col rounded-2xl border border-border bg-gradient-card p-8 transition-smooth hover:border-primary/50 hover:shadow-gold animate-fade-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <Quote className="h-8 w-8 text-primary/60" />
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-foreground/85">
                "{testimonial.quote}"
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-5">
                <p className="font-display text-lg">{testimonial.name}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

