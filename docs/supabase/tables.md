# Supabase Tables Plan

Database schema for **Sunrise Property Hub**. The full SQL migration is in [`schema.sql`](./schema.sql).

---

## Entity Relationship Diagram

```
properties               (images, features, project_details as JSONB columns)
└── contact_inquiries    (0:N, optional FK)

team_members             (standalone)
blog_posts               (standalone)
gallery_images           (standalone)
site_settings            (key-value store)
```

---

## Tables Overview (6 tables)

### 1. `properties`

The core table. Each row is a property listing. Images, features, and project details are stored as nested JSONB to avoid unnecessary joins -- they are always read/written together with the property.

| Column            | Type               | Notes                                      |
|-------------------|--------------------|---------------------------------------------|
| `id`              | `UUID` PK          | Auto-generated                              |
| `title`           | `TEXT`             | e.g. "Luxury Waterfront Villa"              |
| `slug`            | `TEXT` UNIQUE      | URL-friendly identifier                     |
| `description`     | `TEXT`             | Full description                            |
| `price`           | `NUMERIC(14,2)`   | Price in local currency                     |
| `type`            | `VARCHAR(50)`      | e.g. apartment, villa, house, penthouse, townhouse |
| `status`          | `VARCHAR(50)`      | e.g. available, sold, reserved, upcoming    |
| `bedrooms`        | `SMALLINT`         |                                             |
| `bathrooms`       | `SMALLINT`         |                                             |
| `area`            | `NUMERIC(10,2)`    | Square footage                              |
| `year_built`      | `SMALLINT`         |                                             |
| `location`        | `TEXT`             | Neighborhood/area name                      |
| `address`         | `TEXT`             | Full street address                         |
| `lat`             | `DOUBLE PRECISION` | Latitude for map pin                        |
| `lng`             | `DOUBLE PRECISION` | Longitude for map pin                       |
| `featured`        | `BOOLEAN`          | Show on homepage                            |
| `images`          | `JSONB`            | Array of image URLs (see below)             |
| `features`        | `JSONB`            | Array of tag strings (see below)            |
| `project_details` | `JSONB`            | Array of {label, value} objects (see below) |
| `created_at`      | `TIMESTAMPTZ`      | Auto-set                                    |
| `updated_at`      | `TIMESTAMPTZ`      | Auto-updated via trigger                    |

**Indexes:** `type`, `status`, `featured` (partial), `slug`

#### JSONB column formats

**`images`** -- ordered array of storage keys, first entry is the thumbnail (resolve to full URL via Supabase Storage):
```json
[
  "property-images/abc/img1.jpg",
  "property-images/abc/img2.jpg"
]
```

**`features`** -- array of tag strings:
```json
["Pool", "Smart Home", "Wine Cellar", "Garage"]
```

**`project_details`** -- ordered array of label/value pairs ("Project At A Glance"):
```json
[
  { "label": "Front Road", "value": "60 Feet" },
  { "label": "Land size", "value": "3 Katha" },
  { "label": "Apartment Size", "value": "1682 SFT." },
  { "label": "Number of Unit", "value": "6 Nos." },
  { "label": "Number of Floor", "value": "G+7" },
  { "label": "Developer", "value": "Sunrise Apartments Ltd." }
]
```

---

### 2. `team_members`

Company team displayed on the About page.

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `id`         | `UUID` PK |                                |
| `name`       | `TEXT`    |                                |
| `role`       | `TEXT`    | e.g. "Founder & CEO"          |
| `bio`        | `TEXT`    | Short biography                |
| `image_key`  | `TEXT`    | Storage key for photo           |
| `sort_order` | `SMALLINT`| Display order                  |
| `created_at` | `TIMESTAMPTZ` |                            |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated via trigger   |

---

### 3. `blog_posts`

Blog articles with publish control.

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `id`         | `UUID` PK |                                |
| `title`      | `TEXT`    |                                |
| `slug`       | `TEXT` UNIQUE | URL-friendly identifier    |
| `excerpt`    | `TEXT`    | Short summary for cards        |
| `content`    | `TEXT`    | Full article body (Markdown)   |
| `date`       | `DATE`    | Publish date                   |
| `author`     | `TEXT`    | Author name                    |
| `image_key`  | `TEXT`    | Storage key for cover image     |
| `category`   | `TEXT`    | e.g. "Market Insights"         |
| `published`  | `BOOLEAN` | Only published posts are public|
| `created_at` | `TIMESTAMPTZ` |                            |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated via trigger   |

**Indexes:** `slug`, `(published, date DESC)`, `category`

---

### 4. `contact_inquiries`

Submissions from the Contact page and property detail "Ask a Question".

| Column        | Type             | Notes                          |
|---------------|------------------|--------------------------------|
| `id`          | `UUID` PK        |                                |
| `name`        | `TEXT`           |                                |
| `email`       | `TEXT`           |                                |
| `phone`       | `TEXT`           | Optional                       |
| `message`     | `TEXT`           |                                |
| `property_id` | `UUID` FK (nullable) | Links to a property if inquiry is property-specific |
| `status`      | `VARCHAR(50)`    | e.g. new, contacted, closed    |
| `created_at`  | `TIMESTAMPTZ`    |                                |

---

### 5. `gallery_images`

Company gallery images shown on the homepage.

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `id`         | `UUID` PK |                                |
| `image_key`  | `TEXT`    | Storage key for image           |
| `alt_text`   | `TEXT`    | Accessibility text             |
| `sort_order` | `SMALLINT`| Display order                  |
| `created_at` | `TIMESTAMPTZ` |                            |

---

### 6. `site_settings`

Key-value store for global company info (address, phones, emails, logo).

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `key`        | `TEXT` PK | e.g. "company_name", "phone_1" |
| `value`      | `TEXT`    | The setting value              |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated via trigger   |

**Seeded keys:** `company_name`, `address`, `phone_1`, `phone_2`, `email_sales`, `email_info`, `logo_key`

---

## Security (Row Level Security)

| Table              | Public (anon)          | Authenticated (admin)  |
|--------------------|------------------------|------------------------|
| `properties`       | SELECT                 | ALL                    |
| `team_members`     | SELECT                 | ALL                    |
| `blog_posts`       | SELECT (published only)| ALL                    |
| `contact_inquiries`| INSERT only            | ALL                    |
| `gallery_images`   | SELECT                 | ALL                    |
| `site_settings`    | SELECT                 | ALL                    |

---

## Storage Buckets

| Bucket             | Access  | Purpose                        |
|--------------------|---------|--------------------------------|
| `property-images`  | Public  | Property listing photos        |
| `gallery`          | Public  | Company gallery images         |
| `team`             | Public  | Team member headshots          |
| `blog`             | Public  | Blog post cover images         |

---

## Auto-Updated Timestamps

Tables with `updated_at` columns use a shared `update_updated_at()` trigger function that sets `updated_at = now()` on every UPDATE.

Applied to: `properties`, `team_members`, `blog_posts`, `site_settings`
