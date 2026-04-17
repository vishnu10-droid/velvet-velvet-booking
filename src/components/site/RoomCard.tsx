import { Star } from "lucide-react";
import { Link } from "@tanstack/react-router";

type DisplayRoom = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  amenities: string[];
  rating: number;
};

export function RoomCard({ room, index = 0 }: { room: DisplayRoom; index?: number }) {
  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-card shadow-elegant transition-smooth hover:-translate-y-2 hover:shadow-gold animate-fade-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          loading="lazy"
          width={1280}
          height={896}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur-md">
          <Star className="h-3 w-3 fill-primary text-primary" />
          {room.rating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          {room.tagline}
        </p>
        <h3 className="mt-2 font-display text-2xl text-foreground">{room.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {room.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {room.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70"
            >
              {a}
            </span>
          ))}
        </div>

        <div className="mt-7 flex items-end justify-between border-t border-border pt-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              From
            </p>
            <p className="font-display text-3xl text-gradient-gold">
              ${room.price}
              <span className="ml-1 text-sm font-sans text-muted-foreground">
                / night
              </span>
            </p>
          </div>
          <Link
            to="/rooms/$roomId"
            params={{ roomId: room.id }}
            className="rounded-full border border-primary/40 px-5 py-2 text-sm font-medium text-primary transition-smooth hover:bg-primary hover:text-primary-foreground"
          >
            Reserve
          </Link>
        </div>
      </div>
    </article>
  );
}
