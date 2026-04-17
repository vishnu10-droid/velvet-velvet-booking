import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Users } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatMoney, todayPlus } from "@/lib/formatters";
import { createBooking, getNightsCount, getRooms, type HotelRoom } from "@/lib/hotel-service";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/rooms/$roomId")({
  head: () => ({
    meta: [
      { title: "Room details - Aurelia Hotel" },
      { name: "description", content: "View suite details and reserve your Aurelia stay." },
    ],
  }),
  component: RoomDetailsPage,
});

function RoomDetailsPage() {
  const { roomId } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<HotelRoom | null>(null);
  const [checkIn, setCheckIn] = useState(todayPlus(1));
  const [checkOut, setCheckOut] = useState(todayPlus(2));
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    let active = true;
    getRooms().then((fetchedRooms) => {
      if (!active) return;
      setRoom(fetchedRooms.find((item) => item.id === roomId) ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [roomId]);

  const nights = useMemo(() => getNightsCount(checkIn, checkOut), [checkIn, checkOut]);
  const total = room ? nights * room.price : 0;

  const handleBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!room || !user) return;
    if (new Date(checkOut).getTime() <= new Date(checkIn).getTime()) {
      toast.error("Check-out must be after check-in date.");
      return;
    }
    if (guests > room.capacity) {
      toast.error(`This room allows up to ${room.capacity} guests.`);
      return;
    }

    setBookingInProgress(true);
    const result = await createBooking({
      userId: user.id,
      room,
      checkIn,
      checkOut,
      guests,
      specialRequests: specialRequests.trim() || undefined,
      guestName: user.user_metadata?.full_name ?? user.email ?? undefined,
      guestEmail: user.email ?? undefined,
    });
    setBookingInProgress(false);

    toast.success(
      result.persistedToSupabase
        ? "Booking confirmed and saved to your account."
        : "Booking confirmed locally. Connect Supabase access to sync online.",
    );
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pb-20 pt-28">
        {loading ? (
          <div className="mx-auto h-[420px] max-w-7xl animate-pulse rounded-2xl border border-border bg-card/50" />
        ) : room ? (
          <section className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-12 lg:px-10">
            <article className="overflow-hidden rounded-2xl border border-border bg-card/50 lg:col-span-7">
              <img src={room.image} alt={room.name} className="h-[360px] w-full object-cover sm:h-[440px]" />
              <div className="p-7 sm:p-8">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">{room.tagline}</p>
                <h1 className="mt-3 font-display text-4xl sm:text-5xl">{room.name}</h1>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{room.description}</p>

                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {room.amenities.map((amenity) => (
                    <p key={amenity} className="rounded-lg border border-border px-3 py-2 text-sm text-foreground/85">
                      {amenity}
                    </p>
                  ))}
                </div>
              </div>
            </article>

            <aside className="rounded-2xl border border-border bg-card/50 p-6 sm:p-7 lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Reservation</p>
              <p className="mt-2 font-display text-4xl">
                {formatMoney(room.price)}
                <span className="ml-1 text-sm font-sans text-muted-foreground">/ night</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {room.capacity} guests max • {room.size} • Rated {room.rating.toFixed(1)}
              </p>

              <form onSubmit={handleBooking} className="mt-7 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="checkIn">Check-in</Label>
                    <Input id="checkIn" type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="checkOut">Check-out</Label>
                    <Input id="checkOut" type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={room.capacity}
                    value={guests}
                    onChange={(event) => setGuests(Math.max(1, Number(event.target.value) || 1))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="request">Special requests</Label>
                  <Textarea
                    id="request"
                    className="min-h-24"
                    value={specialRequests}
                    onChange={(event) => setSpecialRequests(event.target.value)}
                    placeholder="Airport transfer, room decor, dietary notes..."
                  />
                </div>

                <div className="rounded-xl border border-border bg-background/40 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {nights} nights
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      {guests} guests
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-muted-foreground">
                      {formatDate(checkIn)} to {formatDate(checkOut)}
                    </span>
                    <strong className="font-display text-2xl text-gradient-gold">{formatMoney(total)}</strong>
                  </div>
                </div>

                {isAuthenticated ? (
                  <Button
                    type="submit"
                    disabled={bookingInProgress}
                    className="w-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
                    size="lg"
                  >
                    {bookingInProgress ? "Confirming..." : "Confirm booking"}
                  </Button>
                ) : (
                  <Link
                    to="/auth"
                    className="block w-full rounded-md bg-gradient-gold px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90"
                  >
                    Sign in to book this room
                  </Link>
                )}
              </form>
            </aside>
          </section>
        ) : (
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/50 p-8 text-center">
            <h1 className="font-display text-3xl">Room not found</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This room may be unavailable. Browse all suites to pick another option.
            </p>
            <Link
              to="/rooms"
              className="mt-6 inline-flex rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
            >
              Back to rooms
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

