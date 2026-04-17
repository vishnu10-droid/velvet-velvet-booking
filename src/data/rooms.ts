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
    description: "A serene haven dressed in dark walnut and warm linens - the perfect city escape.",
    price: 320,
    image: deluxe,
    amenities: ["King bed", "City view", "Rain shower", "Espresso bar"],
    size: "42 sqm",
    capacity: 2,
    rating: 4.8,
  },
  {
    id: "presidential-suite",
    name: "Presidential Suite",
    tagline: "Skyline residence",
    description: "Floor-to-ceiling glass, private lounge, and panoramic skyline views from above.",
    price: 1200,
    image: presidential,
    amenities: ["Private lounge", "Skyline view", "Butler service", "Dining room"],
    size: "180 sqm",
    capacity: 4,
    rating: 5,
  },
  {
    id: "ocean-view-suite",
    name: "Ocean View Suite",
    tagline: "Endless horizons",
    description: "Wake to the sound of the sea on your private terrace with infinity-edge plunge pool.",
    price: 780,
    image: oceanview,
    amenities: ["Plunge pool", "Ocean terrace", "King bed", "Sunset view"],
    size: "95 sqm",
    capacity: 2,
    rating: 4.9,
  },
  {
    id: "garden-suite",
    name: "Garden Suite",
    tagline: "Botanical retreat",
    description: "A tranquil suite opening onto a private patio surrounded by lush greenery.",
    price: 540,
    image: deluxe,
    amenities: ["Garden patio", "Queen bed", "Soaking tub", "Mini bar"],
    size: "70 sqm",
    capacity: 3,
    rating: 4.7,
  },
  {
    id: "standard-twin",
    name: "Standard Twin",
    tagline: "Smart simplicity",
    description: "Crisp linens, twin beds, and everything you need for a restorative city stay.",
    price: 180,
    image: deluxe,
    amenities: ["Twin beds", "Workspace", "Free wifi", "Tea station"],
    size: "28 sqm",
    capacity: 2,
    rating: 4.5,
  },
];

