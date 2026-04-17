import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Clock10, ReceiptText, Star } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MetricCard } from "@/components/site/MetricCard";
import { PageHero } from "@/components/site/PageHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/formatters";
import { getUserBookings, type HotelBooking } from "@/lib/hotel-service";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - Aurelia Hotel" },
      { name: "description", content: "Manage your upcoming stays and reservation history at Aurelia." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      navigate({ to: "/auth" });
      return;
    }

    let active = true;
    setLoadingBookings(true);
    getUserBookings(user.id).then((items) => {
      if (!active) return;
      setBookings(items);
      setLoadingBookings(false);
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, loading, navigate, user]);

  const upcoming = useMemo(
    () => bookings.filter((booking) => new Date(booking.checkIn).getTime() >= new Date().setHours(0, 0, 0, 0)).length,
    [bookings],
  );
  const totalSpent = useMemo(() => bookings.reduce((sum, booking) => sum + booking.totalPrice, 0), [bookings]);
  const avgNights = useMemo(() => {
    if (!bookings.length) return "0";
    const totalNights = bookings.reduce((sum, booking) => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(1, nights);
    }, 0);
    return (totalNights / bookings.length).toFixed(1);
  }, [bookings]);

  if (loading || (!isAuthenticated && !user)) {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <PageHero
          eyebrow="Guest Dashboard"
          title={`Welcome back, ${user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest"}`}
          description="Track your upcoming reservations, review previous stays, and keep your travel plans organized in one place."
          actions={
            <Link
              to="/rooms"
              className="rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-bounce hover:scale-105"
            >
              Book another stay
            </Link>
          }
        />

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <MetricCard label="Upcoming bookings" value={`${upcoming}`} helper="Starting from today" />
          <MetricCard label="Total reservations" value={`${bookings.length}`} helper="Confirmed and local backups" />
          <MetricCard label="Average stay length" value={`${avgNights} nights`} helper="Across your history" />
          <MetricCard label="Estimated spend" value={formatMoney(totalSpent)} helper="Room charges only" />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
          <div className="rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl">Your bookings</h2>
              <Button asChild className="bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
                <Link to="/rooms">New booking</Link>
              </Button>
            </div>

            {loadingBookings ? (
              <div className="mt-6 h-28 animate-pulse rounded-xl border border-border bg-card/50" />
            ) : bookings.length ? (
              <div className="mt-6 space-y-4">
                {bookings.map((booking) => (
                  <article key={booking.id} className="rounded-xl border border-border bg-background/40 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Room</p>
                        <h3 className="mt-1 font-display text-2xl">{booking.roomName}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={booking.status} />
                        <Badge variant="secondary" className="gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {booking.guests} guests
                        </Badge>
                        {booking.source === "local" ? (
                          <Badge variant="outline" className="gap-1">
                            <Clock10 className="h-3.5 w-3.5" />
                            Offline backup
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground">
                        Created on {formatDate(booking.createdAt)}
                      </p>
                      <p className="font-display text-2xl text-gradient-gold">{formatMoney(booking.totalPrice)}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
                <Star className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">
                  You do not have any reservations yet. Start with a curated room from our collection.
                </p>
                <Link
                  to="/rooms"
                  className="mt-4 inline-flex rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
                >
                  Explore rooms
                </Link>
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <QuickTile
                icon={ReceiptText}
                title="Need invoice support?"
                description="Contact concierge with your booking ID for GST-ready billing details."
                to="/contact"
                cta="Contact billing team"
              />
              <QuickTile
                icon={CalendarClock}
                title="Planning a return stay?"
                description="Book early for premium categories and limited seasonal rates."
                to="/rooms"
                cta="View availability"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: HotelBooking["status"] }) {
  if (status === "confirmed") return <Badge className="bg-emerald-600/25 text-emerald-200 hover:bg-emerald-600/25">Confirmed</Badge>;
  if (status === "pending") return <Badge className="bg-amber-500/25 text-amber-200 hover:bg-amber-500/25">Pending</Badge>;
  if (status === "cancelled") return <Badge className="bg-rose-500/25 text-rose-200 hover:bg-rose-500/25">Cancelled</Badge>;
  if (status === "completed") return <Badge className="bg-blue-500/25 text-blue-200 hover:bg-blue-500/25">Completed</Badge>;
  return <Badge variant="outline">Local</Badge>;
}

function QuickTile({
  icon: Icon,
  title,
  description,
  to,
  cta,
}: {
  icon: typeof CalendarClock;
  title: string;
  description: string;
  to: "/contact" | "/rooms";
  cta: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-5">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link to={to} className="mt-4 inline-flex text-sm font-semibold text-primary transition-smooth hover:text-primary/80">
        {cta}
      </Link>
    </div>
  );
}

