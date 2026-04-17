import deluxe from "@/assets/room-deluxe.jpg";
import presidential from "@/assets/room-presidential.jpg";
import oceanview from "@/assets/room-oceanview.jpg";

export type Room = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  amenities: string[];
  size: string;
  capacity: number;
  rating: number;
};

export const rooms: Room[] = [
  {
    id: "deluxe-king",
    name: "Deluxe King",
    tagline: "Quiet refinement",
    description:
      "A serene haven dressed in dark walnut and warm linens — the perfect city escape.",
    price: 320,
    image: deluxe,
    amenities: ["King Bed", "City View", "Rain Shower", "Espresso Bar"],
    size: "42 m²",
    capacity: 2,
    rating: 4.8,
  },
  {
    id: "presidential",
    name: "Presidential Suite",
    tagline: "Skyline residence",
    description:
      "Floor-to-ceiling glass, private lounge, and panoramic skyline views from above.",
    price: 1200,
    image: presidential,
    amenities: ["Private Lounge", "Skyline View", "Butler Service", "Dining Room"],
    size: "180 m²",
    capacity: 4,
    rating: 5.0,
  },
  {
    id: "ocean-suite",
    name: "Ocean View Suite",
    tagline: "Endless horizons",
    description:
      "Wake to the sound of the sea on your private terrace with infinity-edge plunge pool.",
    price: 780,
    image: oceanview,
    amenities: ["Plunge Pool", "Ocean Terrace", "King Bed", "Sunset View"],
    size: "95 m²",
    capacity: 2,
    rating: 4.9,
  },
];
