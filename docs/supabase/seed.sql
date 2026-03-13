-- ============================================================
-- Sunrise Property Hub — Seed Data
-- ============================================================
-- Run AFTER schema.sql. Inserts dummy content matching the
-- current frontend design so everything renders immediately.
-- ============================================================


-- ---------- PROPERTIES ----------

INSERT INTO properties (title, slug, description, price, type, status, bedrooms, bathrooms, area, year_built, location, address, lat, lng, featured, images, features, project_details) VALUES

(
  'Luxury Waterfront Villa',
  'luxury-waterfront-villa',
  'Stunning waterfront villa with panoramic ocean views. This exquisite property features floor-to-ceiling windows, a private infinity pool, and direct beach access. The open-plan living area seamlessly connects to an expansive terrace, perfect for entertaining. Premium finishes throughout including marble flooring, custom cabinetry, and a state-of-the-art kitchen.',
  2500000, 'villa', 'available', 5, 4, 4500, 2022,
  'Palm Beach', '123 Ocean Drive, Palm Beach',
  26.7056, -80.0364, TRUE,
  '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]'::JSONB,
  '["Pool", "Beach Access", "Smart Home", "Wine Cellar", "Home Theater"]'::JSONB,
  '[
    {"label": "Project Name", "value": "Plot # 9, Road-8 Sector-16/I, Uttara, 1230"},
    {"label": "Orientation", "value": "East Facing"},
    {"label": "Front Road", "value": "60 Feet"},
    {"label": "Land size", "value": "3 Katha"},
    {"label": "Apartment Size", "value": "1682 SFT."},
    {"label": "Duplex Villa", "value": "3364 sft. 1 Nos."},
    {"label": "Number of Unit", "value": "6 Nos."},
    {"label": "Number of Floor", "value": "G+7"},
    {"label": "Apartment Contain", "value": "04 Beds, 4 Baths (03 Attached) 02 Ver, Living & Dining, Kitchen"},
    {"label": "Developer", "value": "Sunrise Apartments Ltd."}
  ]'::JSONB
),

(
  'Modern Downtown Penthouse',
  'modern-downtown-penthouse',
  'Sleek penthouse in the heart of the city with breathtaking skyline views. This contemporary residence boasts an open floor plan with double-height ceilings, a chef''s kitchen with top-of-the-line appliances, and a wrap-around terrace. Building amenities include a rooftop pool, fitness center, and 24-hour concierge.',
  1800000, 'penthouse', 'available', 3, 3, 3200, 2023,
  'Downtown Miami', '456 Brickell Ave, Miami',
  25.7617, -80.1918, TRUE,
  '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'::JSONB,
  '["Concierge", "Rooftop Pool", "Gym", "Parking", "City Views"]'::JSONB,
  '[
    {"label": "Project Name", "value": "Sky Tower, 456 Brickell Ave, Miami"},
    {"label": "Orientation", "value": "South Facing"},
    {"label": "Front Road", "value": "80 Feet"},
    {"label": "Land size", "value": "5 Katha"},
    {"label": "Apartment Size", "value": "3200 SFT."},
    {"label": "Number of Unit", "value": "12 Nos."},
    {"label": "Number of Floor", "value": "G+25"},
    {"label": "Apartment Contain", "value": "03 Beds, 3 Baths (02 Attached) 01 Ver, Living & Dining, Kitchen"},
    {"label": "Developer", "value": "Sunrise Apartments Ltd."}
  ]'::JSONB
),

(
  'Elegant Family Home',
  'elegant-family-home',
  'Beautiful family home in a quiet, tree-lined neighborhood. Features a spacious backyard with a pool, gourmet kitchen, and a cozy fireplace in the living room. The master suite includes a walk-in closet and spa-like bathroom. Close to top-rated schools and parks.',
  950000, 'house', 'available', 4, 3, 3000, 2019,
  'Coral Gables', '789 Granada Blvd, Coral Gables',
  25.7215, -80.2684, TRUE,
  '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"]'::JSONB,
  '["Pool", "Garden", "Fireplace", "Garage", "Near Schools"]'::JSONB,
  '[
    {"label": "Project Name", "value": "Granada Residence, 789 Granada Blvd, Coral Gables"},
    {"label": "Orientation", "value": "West Facing"},
    {"label": "Front Road", "value": "50 Feet"},
    {"label": "Land size", "value": "4 Katha"},
    {"label": "Apartment Size", "value": "3000 SFT."},
    {"label": "Number of Unit", "value": "1 Nos."},
    {"label": "Number of Floor", "value": "G+2"},
    {"label": "Apartment Contain", "value": "04 Beds, 3 Baths (02 Attached) 01 Ver, Living & Dining, Kitchen, Family Room"},
    {"label": "Developer", "value": "Sunrise Apartments Ltd."}
  ]'::JSONB
),

(
  'Chic Studio Apartment',
  'chic-studio-apartment',
  'Beautifully designed studio apartment in a trendy neighborhood. Features high ceilings, exposed brick walls, and modern finishes. The open layout maximizes space with a clever kitchen design and Murphy bed. Walking distance to restaurants, shops, and nightlife.',
  320000, 'apartment', 'available', 1, 1, 650, 2021,
  'Wynwood', '101 NW 25th St, Miami',
  25.8003, -80.1996, FALSE,
  '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800", "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800", "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800"]'::JSONB,
  '["Modern Design", "Walkable", "Laundry", "Pet Friendly"]'::JSONB,
  '[
    {"label": "Project Name", "value": "Wynwood Lofts, 101 NW 25th St, Miami"},
    {"label": "Orientation", "value": "North Facing"},
    {"label": "Front Road", "value": "40 Feet"},
    {"label": "Land size", "value": "2 Katha"},
    {"label": "Apartment Size", "value": "650 SFT."},
    {"label": "Number of Unit", "value": "24 Nos."},
    {"label": "Number of Floor", "value": "G+10"},
    {"label": "Apartment Contain", "value": "01 Bed, 1 Bath, Living & Kitchen"},
    {"label": "Developer", "value": "Sunrise Apartments Ltd."}
  ]'::JSONB
),

(
  'Beachside Townhouse',
  'beachside-townhouse',
  'Charming townhouse steps from the beach. This three-story home features a rooftop terrace with ocean views, a private garage, and a sun-drenched living area. The kitchen opens to a dining area perfect for family gatherings. Community pool and lush tropical landscaping.',
  720000, 'townhouse', 'available', 3, 2, 2100, 2020,
  'Fort Lauderdale', '555 A1A, Fort Lauderdale',
  26.1224, -80.1373, FALSE,
  '["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"]'::JSONB,
  '["Near Beach", "Rooftop Terrace", "Garage", "Community Pool"]'::JSONB,
  '[
    {"label": "Project Name", "value": "Seaside Townhomes, 555 A1A, Fort Lauderdale"},
    {"label": "Orientation", "value": "East Facing"},
    {"label": "Front Road", "value": "45 Feet"},
    {"label": "Land size", "value": "2.5 Katha"},
    {"label": "Apartment Size", "value": "2100 SFT."},
    {"label": "Number of Unit", "value": "8 Nos."},
    {"label": "Number of Floor", "value": "G+3"},
    {"label": "Apartment Contain", "value": "03 Beds, 2 Baths (01 Attached) 01 Ver, Living & Dining, Kitchen"},
    {"label": "Developer", "value": "Sunrise Apartments Ltd."}
  ]'::JSONB
),

(
  'Luxury Garden Apartment',
  'luxury-garden-apartment',
  'Ground-floor luxury apartment with a private garden oasis. This spacious two-bedroom residence features Italian marble floors, a designer kitchen, and floor-to-ceiling sliding doors that open to a beautifully landscaped terrace. Resort-style amenities include a spa, pool, and tennis courts.',
  580000, 'apartment', 'available', 2, 2, 1400, 2022,
  'Key Biscayne', '200 Crandon Blvd, Key Biscayne',
  25.6938, -80.1625, TRUE,
  '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600566753086-00f18f6b6a6c?w=800", "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800"]'::JSONB,
  '["Private Garden", "Spa", "Tennis", "Pool", "Security"]'::JSONB,
  '[
    {"label": "Project Name", "value": "Garden Residences, 200 Crandon Blvd, Key Biscayne"},
    {"label": "Orientation", "value": "South Facing"},
    {"label": "Front Road", "value": "55 Feet"},
    {"label": "Land size", "value": "3.5 Katha"},
    {"label": "Apartment Size", "value": "1400 SFT."},
    {"label": "Number of Unit", "value": "16 Nos."},
    {"label": "Number of Floor", "value": "G+12"},
    {"label": "Apartment Contain", "value": "02 Beds, 2 Baths (01 Attached) Living & Dining, Kitchen"},
    {"label": "Developer", "value": "Sunrise Apartments Ltd."}
  ]'::JSONB
),

(
  'Contemporary Loft',
  'contemporary-loft',
  'Industrial-chic loft with soaring ceilings and an abundance of natural light. The open floor plan showcases polished concrete floors, a gourmet kitchen island, and a mezzanine bedroom with a glass railing. Located in a converted warehouse with a vibrant arts community.',
  450000, 'apartment', 'available', 1, 1, 1100, 2018,
  'Design District', '300 NE 40th St, Miami',
  25.8138, -80.1867, FALSE,
  '["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800", "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800", "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800"]'::JSONB,
  '["High Ceilings", "Natural Light", "Arts District", "Parking"]'::JSONB,
  '[
    {"label": "Project Name", "value": "Design Lofts, 300 NE 40th St, Miami"},
    {"label": "Orientation", "value": "West Facing"},
    {"label": "Front Road", "value": "35 Feet"},
    {"label": "Land size", "value": "1.5 Katha"},
    {"label": "Apartment Size", "value": "1100 SFT."},
    {"label": "Number of Unit", "value": "18 Nos."},
    {"label": "Number of Floor", "value": "G+8"},
    {"label": "Apartment Contain", "value": "01 Bed, 1 Bath, Living & Kitchen, Mezzanine"},
    {"label": "Developer", "value": "Sunrise Apartments Ltd."}
  ]'::JSONB
);


-- ---------- TEAM MEMBERS ----------

INSERT INTO team_members (name, role, bio, image_key, sort_order) VALUES
  ('Sarah Mitchell',  'Founder & CEO',      'With over 15 years of experience in South Florida real estate, Sarah founded Sunriseapt to provide a personalized and transparent property buying experience.', 'team/sarah-mitchell.jpg',  0),
  ('Michael Torres',  'Head of Sales',      'Michael brings a decade of expertise in luxury property sales. His deep knowledge of the local market helps clients find their perfect homes.',                 'team/michael-torres.jpg',  1),
  ('Emily Chen',      'Property Manager',   'Emily ensures every property in our portfolio meets the highest standards. Her attention to detail and client-first approach sets us apart.',                   'team/emily-chen.jpg',      2),
  ('David Okafor',    'Marketing Director', 'David leverages cutting-edge marketing strategies to showcase our properties to the right audience, ensuring maximum visibility and engagement.',              'team/david-okafor.jpg',    3);


-- ---------- BLOG POSTS ----------

INSERT INTO blog_posts (title, slug, excerpt, content, date, author, image_key, category, published) VALUES

(
  'Top 5 Neighborhoods for First-Time Buyers in 2026',
  'top-5-neighborhoods-first-time-buyers-2026',
  'Discover the most affordable and promising neighborhoods for first-time homebuyers looking to invest in South Florida real estate.',
  E'South Florida continues to be one of the most attractive real estate markets in the country. For first-time buyers, finding the right neighborhood can make all the difference between a good investment and a great one.\n\n**1. Wynwood** — Once an industrial district, Wynwood has transformed into one of Miami''s most vibrant neighborhoods. With new residential developments and a thriving arts scene, it offers excellent appreciation potential.\n\n**2. Coral Gables** — Known for its tree-lined streets and Mediterranean architecture, Coral Gables provides a suburban feel with urban amenities. Top-rated schools make it ideal for young families.\n\n**3. Fort Lauderdale Beach** — More affordable than Miami Beach, Fort Lauderdale offers beautiful beaches, a growing dining scene, and excellent connectivity.\n\n**4. Key Biscayne** — This island community provides a peaceful retreat with stunning ocean views, top schools, and resort-style living.\n\n**5. Design District** — Perfect for young professionals, this area combines luxury shopping, fine dining, and contemporary living spaces.',
  '2026-03-01', 'Sarah Mitchell', 'blog/neighborhoods-2026.jpg', 'Market Insights', TRUE
),

(
  'How to Stage Your Home for a Quick Sale',
  'how-to-stage-your-home-for-a-quick-sale',
  'Professional staging tips that can help your property sell faster and for a higher price in today''s competitive market.',
  E'Home staging has become an essential part of the selling process. A well-staged home can sell up to 73% faster than a non-staged one.\n\n**Declutter and Depersonalize** — Remove personal photos and excess furniture. Buyers need to envision themselves in the space.\n\n**Maximize Natural Light** — Open all curtains and blinds. Add mirrors to reflect light and make rooms appear larger.\n\n**Create Focal Points** — Each room should have a clear purpose and a visual anchor, whether it''s a piece of art or a statement furniture piece.\n\n**Don''t Forget Curb Appeal** — First impressions matter. Ensure your front entrance is welcoming with fresh paint, plants, and clean walkways.\n\n**Invest in Key Areas** — Kitchen and bathrooms sell homes. Even small updates like new hardware and fresh paint can make a big impact.',
  '2026-02-15', 'Michael Torres', 'blog/home-staging.jpg', 'Selling Tips', TRUE
),

(
  'Understanding the South Florida Real Estate Market Trends',
  'south-florida-real-estate-market-trends',
  'An in-depth analysis of current market conditions, pricing trends, and what buyers and sellers can expect in the coming months.',
  E'The South Florida real estate market continues to show resilience and growth. Here''s what you need to know about the current landscape.\n\n**Price Trends** — Median home prices have increased by 8% year-over-year, driven by strong demand and limited inventory. Luxury properties above $1M have seen particularly strong appreciation.\n\n**Inventory Levels** — While inventory remains tight, new construction projects are beginning to ease the supply shortage. Buyers should act quickly on well-priced properties.\n\n**Interest Rates** — Current mortgage rates have stabilized, making it an opportune time for both buyers and refinancers.\n\n**Foreign Investment** — International buyers continue to drive demand, particularly from South America and Europe, attracted by Florida''s favorable tax environment.\n\n**Looking Ahead** — Experts predict continued growth through 2026, with emerging neighborhoods offering the best value for investors.',
  '2026-02-01', 'Sarah Mitchell', 'blog/market-trends.jpg', 'Market Insights', TRUE
),

(
  'The Ultimate Guide to Waterfront Living',
  'ultimate-guide-waterfront-living',
  'Everything you need to know about purchasing and maintaining a waterfront property in South Florida.',
  E'Waterfront living is the ultimate South Florida dream. But before diving in, there are important factors to consider.\n\n**Insurance Considerations** — Waterfront properties require additional insurance coverage including flood and windstorm policies. Budget accordingly.\n\n**Maintenance Requirements** — Salt air and humidity can accelerate wear on exterior surfaces. Regular maintenance of seawalls, docks, and outdoor spaces is essential.\n\n**Lifestyle Benefits** — Direct water access for boating, kayaking, and paddleboarding. Stunning sunsets and a serene living environment.\n\n**Investment Value** — Waterfront properties consistently outperform inland properties in appreciation, making them excellent long-term investments.\n\n**Due Diligence** — Always get a marine survey if buying waterfront. Check seawall conditions, dock permits, and any water access restrictions.',
  '2026-01-20', 'Michael Torres', 'blog/waterfront-living.jpg', 'Buying Guide', TRUE
);


-- ---------- GALLERY IMAGES ----------

INSERT INTO gallery_images (image_key, alt_text, sort_order) VALUES
  ('gallery/apartment-exterior.jpg',  'Modern apartment exterior',     0),
  ('gallery/luxury-living-room.jpg',  'Luxury living room interior',   1),
  ('gallery/swimming-pool.jpg',       'Swimming pool area',            2),
  ('gallery/building-facade.jpg',     'Residential building facade',   3),
  ('gallery/balcony-view.jpg',        'Apartment balcony view',        4),
  ('gallery/landscaped-garden.jpg',   'Landscaped garden',             5),
  ('gallery/modern-kitchen.jpg',      'Modern kitchen design',         6),
  ('gallery/rooftop-lounge.jpg',      'Rooftop lounge',                7);


-- ---------- CONTACT INQUIRIES (sample) ----------

INSERT INTO contact_inquiries (name, email, phone, message, status) VALUES
  ('Rahim Uddin',   'rahim@example.com',   '+88 01711 000111', 'I am interested in the Luxury Waterfront Villa. Can I schedule a visit?',   'new'),
  ('Fatima Akhter',  'fatima@example.com',  '+88 01912 000222', 'Do you have any 2-bedroom apartments available in Uttara?',                 'contacted'),
  ('Kamal Hossain',  'kamal@example.com',   '+88 01815 000333', 'I would like to know the payment plan for the Beachside Townhouse.',       'new');
