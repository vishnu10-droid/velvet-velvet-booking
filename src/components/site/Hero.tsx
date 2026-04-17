import heroImg from "@/assets/hero-lobby.jpg";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <img
        src={heroImg}
        alt="Aurélia hotel grand lobby at dusk"
        width={1920}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24 lg:px-10 lg:pb-32">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.4em] text-primary">
            ★ ★ ★ ★ ★ &nbsp; Five Star Sanctuary
          </p>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[88px]">
            A retreat where{" "}
            <span className="italic text-gradient-gold">elegance</span> finds you
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80 md:text-lg">
            Discover Aurélia — a sanctuary of refined comfort, world-class
            cuisine, and unforgettable views in the heart of the city.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/rooms"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-bounce hover:scale-105"
            >
              Reserve your stay
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/30 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-smooth hover:border-primary hover:text-primary"
            >
              Discover more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
