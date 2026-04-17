import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MetricCard } from "@/components/site/MetricCard";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/formatters";
import { getAllBookings, getRooms, type HotelBooking, type HotelRoom } from "@/lib/hotel-service";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel - Aurelia Hotel" },
      { name: "description", content: "Admin overview for rooms, occupancy, and booking pipeline." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
      return;
    }
    if (!isAdmin) return;

    let active = true;
    setFetching(true);
    Promise.all([getRooms(), getAllBookings()]).then(([roomItems, bookingItems]) => {
      if (!active) return;
      setRooms(roomItems);
      setBookings(bookingItems);
      setFetching(false);
    });

    return () => {
      active = false;
    };
  }, [isAdmin, isAuthenticated, loading, navigate]);

  const occupancyRate = useMemo(() => {
    if (!rooms.length) return 0;
    const futureBookings = bookings.filter((booking) => new Date(booking.checkIn).getTime() >= Date.now()).length;
    const value = (futureBookings / rooms.length) * 100;
    return Math.min(100, Math.round(value));
  }, [bookings, rooms.length]);

  const projectedRevenue = useMemo(() => bookings.reduce((sum, booking) => sum + booking.totalPrice, 0), [bookings]);

  if (loading || (!isAuthenticated && !loading)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-7xl px-6 pt-32 lg:px-10">
          <div className="h-44 animate-pulse rounded-2xl border border-border bg-card/40" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-3xl px-6 pb-20 pt-36 text-center lg:px-10">
          <div className="rounded-2xl border border-border bg-card/50 p-10">
            <ShieldAlert className="mx-auto h-8 w-8 text-primary" />
            <h1 className="mt-5 font-display text-4xl">Admin access required</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your current account does not include admin privileges. Please switch account or contact support.
            </p>
            <Button asChild className="mt-6 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <PageHero
          eyebrow="Admin Control"
          title="Operations overview for bookings and inventory"
          description="Track occupancy, revenue, and room performance in one dashboard for faster daily decisions."
        />

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <MetricCard label="Total rooms" value={`${rooms.length}`} helper="Active and listed suites" />
          <MetricCard label="Total bookings" value={`${bookings.length}`} helper="All channels combined" />
          <MetricCard label="Occupancy estimate" value={`${occupancyRate}%`} helper="Upcoming stay utilization" />
          <MetricCard label="Projected revenue" value={formatMoney(projectedRevenue)} helper="Before taxes and services" />
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 lg:grid-cols-12 lg:px-10">
          <article className="rounded-2xl border border-border bg-card/40 p-6 lg:col-span-7">
            <h2 className="font-display text-3xl">Recent bookings</h2>
            {fetching ? (
              <div className="mt-5 h-24 animate-pulse rounded-xl border border-border bg-background/40" />
            ) : bookings.length ? (
              <div className="mt-5 space-y-3">
                {bookings.slice(0, 8).map((booking) => (
                  <div
                    key={booking.id}
                    className="grid gap-3 rounded-xl border border-border bg-background/40 p-4 sm:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{booking.roomName}</p>
                      <p className="mt-1 text-sm text-foreground/90">
                        {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Guests: {booking.guests} • Created: {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <StatusChip status={booking.status} />
                      <p className="font-display text-2xl text-gradient-gold">{formatMoney(booking.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">No booking activity yet.</p>
            )}
          </article>

          <aside className="rounded-2xl border border-border bg-card/40 p-6 lg:col-span-5">
            <h2 className="font-display text-3xl">Room inventory</h2>
            {fetching ? (
              <div className="mt-5 h-24 animate-pulse rounded-xl border border-border bg-background/40" />
            ) : (
              <div className="mt-5 space-y-3">
                {rooms.map((room) => (
                  <div key={room.id} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl">{room.name}</h3>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{room.tagline}</p>
                      </div>
                      <Badge variant="secondary">Capacity {room.capacity}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                      <span className="text-muted-foreground">Rate / night</span>
                      <strong className="text-gradient-gold">{formatMoney(room.price)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function StatusChip({ status }: { status: HotelBooking["status"] }) {
  if (status === "confirmed") return <Badge className="bg-emerald-600/25 text-emerald-200 hover:bg-emerald-600/25">Confirmed</Badge>;
  if (status === "pending") return <Badge className="bg-amber-500/25 text-amber-200 hover:bg-amber-500/25">Pending</Badge>;
  if (status === "completed") return <Badge className="bg-blue-500/25 text-blue-200 hover:bg-blue-500/25">Completed</Badge>;
  if (status === "cancelled") return <Badge className="bg-rose-500/25 text-rose-200 hover:bg-rose-500/25">Cancelled</Badge>;
  return <Badge variant="outline">Local</Badge>;
}

