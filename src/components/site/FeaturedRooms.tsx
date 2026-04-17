import { rooms } from "@/data/rooms";
import { RoomCard } from "./RoomCard";

export function FeaturedRooms() {
  return (
    <section className="relative bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-primary">
              Suites & Rooms
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl lg:text-6xl">
              Spaces designed to <em className="text-gradient-gold">linger in</em>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Each room is a quiet composition of texture, light and detail —
            crafted by our resident designers for moments of pure ease.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
