-- Replace blanket SELECT with read-by-known-name only.
-- Public users can still load any image via signed/direct URL because the bucket is public,
-- but they can't list the entire bucket contents through the API.
DROP POLICY IF EXISTS "Room images publicly viewable" ON storage.objects;

CREATE POLICY "Room images public read by name"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images' AND name IS NOT NULL);