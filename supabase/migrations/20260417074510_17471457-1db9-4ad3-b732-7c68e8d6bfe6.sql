-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.room_type AS ENUM ('deluxe', 'suite', 'presidential', 'ocean', 'standard');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============ USER ROLES (separate table — secure pattern) ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ ROOMS ============
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  type public.room_type NOT NULL DEFAULT 'standard',
  price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
  capacity INT NOT NULL DEFAULT 2 CHECK (capacity > 0),
  size_sqm INT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  amenities TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms viewable by everyone" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Admins insert rooms" ON public.rooms FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update rooms" ON public.rooms FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete rooms" ON public.rooms FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INT NOT NULL DEFAULT 1 CHECK (guests > 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status public.booking_status NOT NULL DEFAULT 'confirmed',
  guest_name TEXT,
  guest_email TEXT,
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_bookings_room_dates ON public.bookings(room_id, check_in, check_out) WHERE status IN ('pending','confirmed');
CREATE INDEX idx_bookings_user ON public.bookings(user_id);

CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins update any booking" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============ AVAILABILITY CHECK FUNCTION ============
CREATE OR REPLACE FUNCTION public.is_room_available(_room_id UUID, _check_in DATE, _check_out DATE, _exclude_booking_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE room_id = _room_id
      AND status IN ('pending','confirmed')
      AND (_exclude_booking_id IS NULL OR id <> _exclude_booking_id)
      AND daterange(check_in, check_out, '[)') && daterange(_check_in, _check_out, '[)')
  )
$$;

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_rooms_updated BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTO-CREATE PROFILE + DEFAULT CUSTOMER ROLE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ STORAGE BUCKET FOR ROOM IMAGES ============
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true);

CREATE POLICY "Room images publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'room-images');
CREATE POLICY "Admins upload room images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'room-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update room images" ON storage.objects FOR UPDATE USING (bucket_id = 'room-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete room images" ON storage.objects FOR DELETE USING (bucket_id = 'room-images' AND public.has_role(auth.uid(), 'admin'));

-- ============ SEED ROOMS ============
INSERT INTO public.rooms (name, tagline, description, type, price_per_night, capacity, size_sqm, rating, amenities, image_url) VALUES
('Deluxe King', 'Quiet refinement', 'A serene haven dressed in dark walnut and warm linens — the perfect city escape.', 'deluxe', 320, 2, 42, 4.8, ARRAY['King Bed','City View','Rain Shower','Espresso Bar','Free WiFi'], '/src/assets/room-deluxe.jpg'),
('Presidential Suite', 'Skyline residence', 'Floor-to-ceiling glass, private lounge, and panoramic skyline views from above.', 'presidential', 1200, 4, 180, 5.0, ARRAY['Private Lounge','Skyline View','Butler Service','Dining Room','Jacuzzi'], '/src/assets/room-presidential.jpg'),
('Ocean View Suite', 'Endless horizons', 'Wake to the sound of the sea on your private terrace with infinity-edge plunge pool.', 'ocean', 780, 2, 95, 4.9, ARRAY['Plunge Pool','Ocean Terrace','King Bed','Sunset View','Mini Bar'], '/src/assets/room-oceanview.jpg'),
('Garden Suite', 'Botanical retreat', 'A tranquil suite opening onto a private garden patio surrounded by lush greenery.', 'suite', 540, 3, 70, 4.7, ARRAY['Garden Patio','Queen Bed','Soaking Tub','Mini Bar'], '/src/assets/room-deluxe.jpg'),
('Standard Twin', 'Smart simplicity', 'Crisp linens, twin beds, and everything you need for a restorative city stay.', 'standard', 180, 2, 28, 4.5, ARRAY['Twin Beds','Workspace','Free WiFi'], '/src/assets/room-deluxe.jpg');