import { createFileRoute } from "@tanstack/react-router";
import { Amenities } from "@/components/site/Amenities";
import { FeaturedRooms } from "@/components/site/FeaturedRooms";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Testimonials } from "@/components/site/Testimonials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurelia - A Five-Star Sanctuary" },
      {
        name: "description",
        content:
          "Discover Aurelia, a luxury hotel where timeless elegance meets modern comfort. Reserve suites, dining, and spa experiences.",
      },
      { property: "og:title", content: "Aurelia - A Five-Star Sanctuary" },
      {
        property: "og:description",
        content: "Luxury suites, fine dining, rooftop views, and bespoke concierge service.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
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

