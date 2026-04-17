import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MetricCard } from "@/components/site/MetricCard";
import { PageHero } from "@/components/site/PageHero";
import { RoomCard } from "@/components/site/RoomCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRooms, type HotelRoom } from "@/lib/hotel-service";
import { formatMoney } from "@/lib/formatters";

type SortOption = "recommended" | "priceLow" | "priceHigh" | "ratingHigh";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms and Suites - Aurelia Hotel" },
      { name: "description", content: "Browse Aurelia rooms with live filters for price, capacity, and comfort." },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState(1);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sort, setSort] = useState<SortOption>("recommended");

  useEffect(() => {
    let active = true;
    getRooms().then((fetched) => {
      if (!active) return;
      setRooms(fetched);
      const topPrice = fetched.reduce((highest, room) => Math.max(highest, room.price), 1500);
      setMaxPrice(topPrice);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = rooms.filter((room) => {
      if (room.capacity < guests) return false;
      if (room.price > maxPrice) return false;
      if (!query) return true;
      return `${room.name} ${room.tagline} ${room.description} ${room.amenities.join(" ")}`
        .toLowerCase()
        .includes(query);
    });

    const sorted = [...filtered];
    if (sort === "priceLow") sorted.sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") sorted.sort((a, b) => b.price - a.price);
    if (sort === "ratingHigh") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "recommended") {
      sorted.sort((a, b) => b.rating * 100 - b.price / 10 - (a.rating * 100 - a.price / 10));
    }
    return sorted;
  }, [guests, maxPrice, rooms, search, sort]);

  const avgRating = useMemo(() => {
    if (!rooms.length) return "0.0";
    const total = rooms.reduce((acc, room) => acc + room.rating, 0);
    return (total / rooms.length).toFixed(1);
  }, [rooms]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <PageHero
          eyebrow="Rooms and Suites"
          title="Find your ideal stay with live filters"
          description="Adjust guest count, budget, and preferences to instantly see suites that match your travel plan."
          actions={
            <Link
              to="/contact"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground/90 transition-smooth hover:border-primary hover:text-primary"
            >
              Need help choosing?
            </Link>
          }
        />

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <MetricCard label="Available rooms" value={`${rooms.length}`} helper="Across signature categories" />
          <MetricCard label="Average rating" value={avgRating} helper="Verified guest feedback" />
          <MetricCard
            label="Starting from"
            value={formatMoney(rooms.length ? Math.min(...rooms.map((room) => room.price)) : 0)}
            helper="Per night"
          />
          <MetricCard label="Matching results" value={`${filteredRooms.length}`} helper="Updated instantly" />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
          <div className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filters
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label htmlFor="search" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Search
                </label>
                <Input
                  id="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ocean terrace, butler, skyline..."
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="guests" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Guests
                </label>
                <Input
                  id="guests"
                  min={1}
                  max={8}
                  type="number"
                  value={guests}
                  onChange={(event) => setGuests(Math.max(1, Number(event.target.value) || 1))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Max price: {formatMoney(maxPrice)}
                </label>
                <input
                  id="price"
                  type="range"
                  min={100}
                  max={Math.max(...rooms.map((room) => room.price), 1500)}
                  step={20}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sort" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background transition-smooth focus:ring-2 focus:ring-ring"
                >
                  <option value="recommended">Recommended</option>
                  <option value="priceLow">Price: low to high</option>
                  <option value="priceHigh">Price: high to low</option>
                  <option value="ratingHigh">Highest rated</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((placeholder) => (
                <div key={placeholder} className="h-[420px] animate-pulse rounded-2xl border border-border bg-card/40" />
              ))}
            </div>
          ) : filteredRooms.length ? (
            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredRooms.map((room, index) => (
                <RoomCard key={room.id} room={room} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-border bg-card/40 p-10 text-center">
              <h3 className="font-display text-3xl">No rooms match your filters</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Try increasing your budget or lowering guest count to see more options.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setSearch("");
                  setGuests(1);
                  setSort("recommended");
                  setMaxPrice(Math.max(...rooms.map((room) => room.price), 1500));
                }}
                className="mt-6 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
              >
                Reset filters
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
