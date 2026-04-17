import { supabase } from "@/integrations/supabase/client";
import type { Enums, Tables } from "@/integrations/supabase/types";
import { rooms as localRooms } from "@/data/rooms";
import deluxeImage from "@/assets/room-deluxe.jpg";
import presidentialImage from "@/assets/room-presidential.jpg";
import oceanImage from "@/assets/room-oceanview.jpg";
import heroImage from "@/assets/hero-lobby.jpg";

type BookingStatus = Enums<"booking_status">;

type RoomRow = Tables<"rooms">;
type BookingRow = Tables<"bookings">;

type LocalBookingStatus = BookingStatus | "local";

export type HotelRoom = {
  id: string;
  dbId: string | null;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  amenities: string[];
  size: string;
  capacity: number;
  rating: number;
  source: "supabase" | "local";
};

export type HotelBooking = {
  id: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: LocalBookingStatus;
  createdAt: string;
  guestName: string | null;
  guestEmail: string | null;
  specialRequests: string | null;
  source: "supabase" | "local";
};

export type BookingInput = {
  userId: string;
  room: HotelRoom;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
  guestName?: string;
  guestEmail?: string;
};

type LocalBookingStoreItem = {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: LocalBookingStatus;
  createdAt: string;
  guestName: string | null;
  guestEmail: string | null;
  specialRequests: string | null;
  source: "local";
};

const LOCAL_BOOKINGS_KEY = "aurelia-local-bookings-v1";

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function resolveRoomImage(imageUrl: string | null, name: string) {
  const source = `${imageUrl ?? ""} ${name}`.toLowerCase();
  if (source.includes("presidential")) return presidentialImage;
  if (source.includes("ocean")) return oceanImage;
  if (source.includes("deluxe")) return deluxeImage;
  if (source.includes("garden") || source.includes("standard")) return deluxeImage;
  return heroImage;
}

function formatRoomSize(sizeSqm: number | null) {
  if (!sizeSqm || sizeSqm <= 0) return "Suite";
  return `${sizeSqm} sqm`;
}

function mapSupabaseRoom(room: RoomRow): HotelRoom {
  return {
    id: room.id,
    dbId: room.id,
    name: room.name,
    tagline: room.tagline ?? "Signature comfort",
    description: room.description,
    price: toNumber(room.price_per_night),
    image: resolveRoomImage(room.image_url, room.name),
    amenities: room.amenities ?? [],
    size: formatRoomSize(room.size_sqm),
    capacity: room.capacity,
    rating: toNumber(room.rating, 4.5),
    source: "supabase",
  };
}

function getFallbackRooms(): HotelRoom[] {
  return localRooms.map((room) => ({
    id: room.id,
    dbId: null,
    name: room.name,
    tagline: room.tagline,
    description: room.description,
    price: room.price,
    image: room.image,
    amenities: room.amenities,
    size: room.size.replace("m²", "sqm").replace("mÂ²", "sqm"),
    capacity: room.capacity,
    rating: room.rating,
    source: "local",
  }));
}

function safeStorageRead(): LocalBookingStoreItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_BOOKINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalBookingStoreItem[]) : [];
  } catch {
    return [];
  }
}

function safeStorageWrite(items: LocalBookingStoreItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(items));
}

function mapLocalBooking(item: LocalBookingStoreItem): HotelBooking {
  return {
    id: item.id,
    roomId: item.roomId,
    roomName: item.roomName,
    checkIn: item.checkIn,
    checkOut: item.checkOut,
    guests: item.guests,
    totalPrice: item.totalPrice,
    status: item.status,
    createdAt: item.createdAt,
    guestName: item.guestName,
    guestEmail: item.guestEmail,
    specialRequests: item.specialRequests,
    source: "local",
  };
}

function saveLocalBooking(booking: LocalBookingStoreItem) {
  const existing = safeStorageRead();
  safeStorageWrite([booking, ...existing]);
}

function diffNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 1;
}

function buildLocalBooking(input: BookingInput): LocalBookingStoreItem {
  const nights = diffNights(input.checkIn, input.checkOut);
  const totalPrice = input.room.price * nights;
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    userId: input.userId,
    roomId: input.room.id,
    roomName: input.room.name,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests: input.guests,
    totalPrice,
    status: "local",
    createdAt: new Date().toISOString(),
    guestName: input.guestName ?? null,
    guestEmail: input.guestEmail ?? null,
    specialRequests: input.specialRequests ?? null,
    source: "local",
  };
}

function mapSupabaseBooking(booking: BookingRow, roomName: string): HotelBooking {
  return {
    id: booking.id,
    roomId: booking.room_id,
    roomName,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    guests: booking.guests,
    totalPrice: toNumber(booking.total_price),
    status: booking.status,
    createdAt: booking.created_at,
    guestName: booking.guest_name,
    guestEmail: booking.guest_email,
    specialRequests: booking.special_requests,
    source: "supabase",
  };
}

async function findRoomDbIdByName(name: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select("id")
    .eq("name", name)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data?.id) return null;
  return data.id;
}

function sortNewestFirst(bookings: HotelBooking[]) {
  return [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRooms() {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("is_active", true)
      .order("price_per_night", { ascending: true });
    if (error) return getFallbackRooms();
    if (!data || data.length === 0) return getFallbackRooms();
    return data.map(mapSupabaseRoom);
  } catch {
    return getFallbackRooms();
  }
}

export async function getUserBookings(userId: string) {
  const localBookings = safeStorageRead()
    .filter((booking) => booking.userId === userId)
    .map(mapLocalBooking);

  try {
    const { data: bookingRows, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !bookingRows) return sortNewestFirst(localBookings);

    const roomIds = [...new Set(bookingRows.map((booking) => booking.room_id))];
    const { data: roomRows } = roomIds.length
      ? await supabase.from("rooms").select("id, name").in("id", roomIds)
      : { data: [] };

    const roomNameMap = new Map((roomRows ?? []).map((room) => [room.id, room.name]));
    const normalized = bookingRows.map((booking) => mapSupabaseBooking(booking, roomNameMap.get(booking.room_id) ?? "Suite"));
    return sortNewestFirst([...normalized, ...localBookings]);
  } catch {
    return sortNewestFirst(localBookings);
  }
}

export async function getAllBookings() {
  const localBookings = safeStorageRead().map(mapLocalBooking);

  try {
    const { data: bookingRows, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !bookingRows) return sortNewestFirst(localBookings);

    const roomIds = [...new Set(bookingRows.map((booking) => booking.room_id))];
    const { data: roomRows } = roomIds.length
      ? await supabase.from("rooms").select("id, name").in("id", roomIds)
      : { data: [] };

    const roomNameMap = new Map((roomRows ?? []).map((room) => [room.id, room.name]));
    const normalized = bookingRows.map((booking) => mapSupabaseBooking(booking, roomNameMap.get(booking.room_id) ?? "Suite"));
    return sortNewestFirst([...normalized, ...localBookings]);
  } catch {
    return sortNewestFirst(localBookings);
  }
}

export async function createBooking(input: BookingInput) {
  const localVersion = buildLocalBooking(input);

  try {
    let roomIdForInsert = input.room.dbId;
    if (!roomIdForInsert) {
      roomIdForInsert = await findRoomDbIdByName(input.room.name);
    }

    if (!roomIdForInsert) {
      saveLocalBooking(localVersion);
      return {
        booking: mapLocalBooking(localVersion),
        persistedToSupabase: false,
      };
    }

    const nights = diffNights(input.checkIn, input.checkOut);
    const totalPrice = input.room.price * nights;

    const insertPayload = {
      user_id: input.userId,
      room_id: roomIdForInsert,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests: input.guests,
      total_price: totalPrice,
      status: "confirmed" as const,
      guest_name: input.guestName ?? null,
      guest_email: input.guestEmail ?? null,
      special_requests: input.specialRequests ?? null,
    };

    const { data, error } = await supabase.from("bookings").insert(insertPayload).select("*").single();

    if (error || !data) {
      saveLocalBooking(localVersion);
      return {
        booking: mapLocalBooking(localVersion),
        persistedToSupabase: false,
      };
    }

    return {
      booking: mapSupabaseBooking(data, input.room.name),
      persistedToSupabase: true,
    };
  } catch {
    saveLocalBooking(localVersion);
    return {
      booking: mapLocalBooking(localVersion),
      persistedToSupabase: false,
    };
  }
}

export function getNightsCount(checkIn: string, checkOut: string) {
  return diffNights(checkIn, checkOut);
}

