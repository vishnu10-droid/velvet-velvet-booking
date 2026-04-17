import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { FeaturedRooms } from "@/components/site/FeaturedRooms";
import { Amenities } from "@/components/site/Amenities";
import { Testimonials } from "@/components/site/Testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurélia — A Five-Star Sanctuary" },
      {
        name: "description",
        content:
          "Discover Aurélia, a luxury hotel where timeless elegance meets modern comfort. Reserve suites, dining and spa experiences.",
      },
      { property: "og:title", content: "Aurélia — A Five-Star Sanctuary" },
      {
        property: "og:description",
        content:
          "Luxury suites, Michelin dining, rooftop infinity pool, and bespoke concierge service.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <FeaturedRooms />
        <Amenities />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
