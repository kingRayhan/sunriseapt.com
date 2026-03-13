-- ============================================================
-- Sunrise Property Hub — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to create all tables,
-- indexes, RLS policies, and storage buckets.
-- ============================================================


-- No enums — using VARCHAR for flexibility.


-- ---------- PROPERTIES ----------

-- images:          JSONB array of storage keys (resolve to full URL via Supabase Storage)
--                  e.g. ["property-images/abc/img1.jpg", "property-images/abc/img2.jpg"]
--
-- features:        JSONB array of tag strings
--                  e.g. ["Pool", "Smart Home", "Garage"]
--
-- project_details: JSONB array of {label, value} objects (the "Project At A Glance" section)
--                  e.g. [{"label": "Front Road", "value": "60 Feet"},
--                        {"label": "Land size", "value": "3 Katha"}]

CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  price           NUMERIC(14,2) NOT NULL DEFAULT 0,
  type            VARCHAR(50) NOT NULL DEFAULT 'apartment',
  status          VARCHAR(50) NOT NULL DEFAULT 'available',
  bedrooms        SMALLINT NOT NULL DEFAULT 0,
  bathrooms       SMALLINT NOT NULL DEFAULT 0,
  area            NUMERIC(10,2) NOT NULL DEFAULT 0,
  year_built      SMALLINT,
  location        TEXT,
  address         TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  images          JSONB NOT NULL DEFAULT '[]'::JSONB,
  features        JSONB NOT NULL DEFAULT '[]'::JSONB,
  project_details JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_type     ON properties (type);
CREATE INDEX idx_properties_status   ON properties (status);
CREATE INDEX idx_properties_featured ON properties (featured) WHERE featured = TRUE;
CREATE INDEX idx_properties_slug     ON properties (slug);


-- ---------- TEAM MEMBERS ----------

CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  role        TEXT NOT NULL,
  bio         TEXT,
  image_key   TEXT,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ---------- BLOG POSTS ----------

CREATE TABLE blog_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  excerpt     TEXT,
  content     TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  author      TEXT,
  image_key   TEXT,
  category    TEXT,
  published   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug      ON blog_posts (slug);
CREATE INDEX idx_blog_posts_published ON blog_posts (published, date DESC);
CREATE INDEX idx_blog_posts_category  ON blog_posts (category);


-- ---------- CONTACT INQUIRIES ----------

CREATE TABLE contact_inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  status      VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_status ON contact_inquiries (status, created_at DESC);


-- ---------- GALLERY IMAGES ----------

CREATE TABLE gallery_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_key   TEXT NOT NULL,
  alt_text    TEXT,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ---------- SITE SETTINGS (key-value for company info) ----------

CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('company_name',  'Sunrise Apartments Ltd.'),
  ('address',       'Garden Valley Matin, House # 36 Flat E-1, 5th Floor, Garibe-e-Newaz Avenue Sector# 13, Uttara, Dhaka-1230'),
  ('phone_1',       '+88 01713 841977'),
  ('phone_2',       '+88 01713 873 944'),
  ('email_sales',   'Sales@sunriseapt.com'),
  ('email_info',    'Info@sunriseapt.com'),
  ('logo_key',      'branding/full-logo.png');


-- ---------- AUTO-UPDATE updated_at TRIGGER ----------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ---------- ROW LEVEL SECURITY ----------

ALTER TABLE properties        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings     ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public read properties"      ON properties        FOR SELECT USING (true);
CREATE POLICY "Public read team"            ON team_members      FOR SELECT USING (true);
CREATE POLICY "Public read published posts" ON blog_posts        FOR SELECT USING (published = true);
CREATE POLICY "Public read gallery"         ON gallery_images    FOR SELECT USING (true);
CREATE POLICY "Public read settings"        ON site_settings     FOR SELECT USING (true);

-- Anyone can submit a contact inquiry
CREATE POLICY "Public insert inquiries"     ON contact_inquiries FOR INSERT WITH CHECK (true);

-- Authenticated users (admin) get full access
CREATE POLICY "Admin full access properties"      ON properties        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access team"            ON team_members      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access blog"            ON blog_posts        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access inquiries"       ON contact_inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access gallery"         ON gallery_images    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access settings"        ON site_settings     FOR ALL USING (auth.role() = 'authenticated');


-- ---------- STORAGE BUCKETS ----------
-- Run these via Supabase dashboard or management API:
--
--   1. "property-images"  — public bucket for property photos
--   2. "gallery"          — public bucket for company gallery
--   3. "team"             — public bucket for team member photos
--   4. "blog"             — public bucket for blog post images
