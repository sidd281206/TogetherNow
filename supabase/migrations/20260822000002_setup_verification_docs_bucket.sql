-- Enable storage bucket for verification documents if not already created
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-docs', 'verification-docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to verification-docs bucket
CREATE POLICY "Public Read Access for verification-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'verification-docs');

-- Allow authenticated users to upload verification docs
CREATE POLICY "Authenticated users can upload verification docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'verification-docs');

-- Allow users to update their uploaded verification docs
CREATE POLICY "Users can update their verification docs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'verification-docs');
