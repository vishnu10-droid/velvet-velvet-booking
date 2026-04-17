import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Gem, Leaf, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MetricCard } from "@/components/site/MetricCard";
import { PageHero } from "@/components/site/PageHero";

const pillars = [
  {
    icon: Gem,
    title: "Crafted Design",
    description:
      "Every suite blends warm textures, curated lighting, and hand-selected artwork from local makers.",
  },
  {
    icon: Compass,
    title: "Personalized Service",
    description:
      "From airport transfer to in-room dining, each moment is tailored by our concierge around your plans.",
  },
  {
    icon: Leaf,
    title: "Conscious Luxury",
    description:
      "Aurelia runs on low-impact operations, including filtered water systems and energy-smart climate controls.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Comfort",
    description:
      "24/7 support team, secure guest access, and seamless digital check-in for stress-free arrivals.",
  },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Aurelia Hotel" },
      {
        name: "description",
        content:
          "Discover Aurelia's story, hospitality philosophy, and the people behind each unforgettable stay.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <PageHero
          eyebrow="Our Story"
          title="Hospitality built around calm, care, and character"
          description="Aurelia began as a design-led retreat for travelers who want more than just a room. We focus on deep rest, warm service, and thoughtful details at every step."
          actions={
            <>
              <Link
                to="/rooms"
                className="rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-bounce hover:scale-105"
              >
                Explore suites
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground/90 transition-smooth hover:border-primary hover:text-primary"
              >
                Talk to concierge
              </Link>
            </>
          }
        />

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <MetricCard label="Guest rating" value="4.9/5" helper="Across 2,000+ verified stays" />
          <MetricCard label="Suites designed" value="38" helper="Across 5 room categories" />
          <MetricCard label="Response time" value="< 5 min" helper="Digital concierge average" />
          <MetricCard label="Repeat guests" value="61%" helper="Returning within 12 months" />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((pillar, index) => (
              <article
                key={pillar.title}
                className="animate-fade-up rounded-2xl border border-border bg-card/50 p-8"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-6 font-display text-2xl">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

