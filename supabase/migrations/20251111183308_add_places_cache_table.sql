/*
  # Add Places Cache Table

  1. New Tables
    - `places_cache`
      - `id` (uuid, primary key)
      - `query` (text) - Search query
      - `location` (text) - Location name
      - `results` (jsonb) - Cached results from API
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
  
  2. Security
    - Enable RLS on `places_cache` table
    - Add policy for authenticated users to read cached places
    - Add policy for the system to insert/update cache entries

  3. Indexes
    - Create index on query and location for faster lookups
    - Create index on expires_at for cleanup operations
*/

CREATE TABLE IF NOT EXISTS places_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  location text NOT NULL,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

ALTER TABLE places_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached places"
  ON places_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert cache"
  ON places_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cache"
  ON places_cache
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_places_cache_query_location 
  ON places_cache(query, location);

CREATE INDEX IF NOT EXISTS idx_places_cache_expires_at 
  ON places_cache(expires_at);
