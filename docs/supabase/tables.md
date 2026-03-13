# Supabase Tables Plan

Database schema for **Sunrise Property Hub**. The full SQL migration is in [`schema.sql`](./schema.sql).

---

## Entity Relationship Diagram

```
properties
├── property_images    (1:N)
├── property_features  (1:N)
├── project_details    (1:N)
└── contact_inquiries  (0:N, optional FK)

team_members           (standalone)
blog_posts             (standalone)
gallery_images         (standalone)
site_settings          (key-value store)
```

---

## Tables Overview

### 1. `properties`

The core table. Each row is a property listing.

| Column       | Type               | Notes                                      |
|--------------|--------------------|--------------------------------------------|
| `id`         | `UUID` PK          | Auto-generated                             |
| `title`      | `TEXT`             | e.g. "Luxury Waterfront Villa"             |
| `slug`       | `TEXT` UNIQUE      | URL-friendly identifier                    |
| `description`| `TEXT`             | Full description                           |
| `price`      | `NUMERIC(14,2)`   | Price in local currency                    |
| `type`       | `property_type`    | ENUM: apartment, villa, house, penthouse, townhouse |
| `status`     | `property_status`  | ENUM: available, sold, reserved, upcoming  |
| `bedrooms`   | `SMALLINT`         |                                            |
| `bathrooms`  | `SMALLINT`         |                                            |
| `area`       | `NUMERIC(10,2)`    | Square footage                             |
| `year_built` | `SMALLINT`         |                                            |
| `location`   | `TEXT`             | Neighborhood/area name                     |
| `address`    | `TEXT`             | Full street address                        |
| `lat`        | `DOUBLE PRECISION` | Latitude for map pin                       |
| `lng`        | `DOUBLE PRECISION` | Longitude for map pin                      |
| `featured`   | `BOOLEAN`          | Show on homepage                           |
| `created_at` | `TIMESTAMPTZ`      | Auto-set                                   |
| `updated_at` | `TIMESTAMPTZ`      | Auto-updated via trigger                   |

**Indexes:** `type`, `status`, `featured` (partial), `slug`

---

### 2. `property_images`

Multiple images per property, ordered by `sort_order`.

| Column        | Type      | Notes                          |
|---------------|-----------|--------------------------------|
| `id`          | `UUID` PK |                                |
| `property_id` | `UUID` FK | → `properties.id` (CASCADE)   |
| `url`         | `TEXT`    | Supabase Storage URL or external |
| `alt_text`    | `TEXT`    | Accessibility text             |
| `sort_order`  | `SMALLINT`| First image = thumbnail        |
| `created_at`  | `TIMESTAMPTZ` |                            |

---

### 3. `property_features`

Tags/features for a property (e.g. "Pool", "Smart Home").

| Column        | Type      | Notes                          |
|---------------|-----------|--------------------------------|
| `id`          | `UUID` PK |                                |
| `property_id` | `UUID` FK | → `properties.id` (CASCADE)   |
| `feature`     | `TEXT`    | Unique per property            |

---

### 4. `project_details`

Key-value project spec rows (the "Project At A Glance" section).

| Column        | Type      | Notes                          |
|---------------|-----------|--------------------------------|
| `id`          | `UUID` PK |                                |
| `property_id` | `UUID` FK | → `properties.id` (CASCADE)   |
| `label`       | `TEXT`    | e.g. "Orientation"             |
| `value`       | `TEXT`    | e.g. "East Facing"             |
| `sort_order`  | `SMALLINT`| Display order                  |

---

### 5. `team_members`

Company team displayed on the About page.

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `id`         | `UUID` PK |                                |
| `name`       | `TEXT`    |                                |
| `role`       | `TEXT`    | e.g. "Founder & CEO"          |
| `bio`        | `TEXT`    | Short biography                |
| `image_url`  | `TEXT`    | Photo URL                      |
| `sort_order` | `SMALLINT`| Display order                  |
| `created_at` | `TIMESTAMPTZ` |                            |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated via trigger   |

---

### 6. `blog_posts`

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
| `image_url`  | `TEXT`    | Cover image                    |
| `category`   | `TEXT`    | e.g. "Market Insights"         |
| `published`  | `BOOLEAN` | Only published posts are public|
| `created_at` | `TIMESTAMPTZ` |                            |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated via trigger   |

**Indexes:** `slug`, `(published, date DESC)`, `category`

---

### 7. `contact_inquiries`

Submissions from the Contact page and property detail "Ask a Question".

| Column        | Type             | Notes                          |
|---------------|------------------|--------------------------------|
| `id`          | `UUID` PK        |                                |
| `name`        | `TEXT`           |                                |
| `email`       | `TEXT`           |                                |
| `phone`       | `TEXT`           | Optional                       |
| `message`     | `TEXT`           |                                |
| `property_id` | `UUID` FK (nullable) | Links to a property if inquiry is property-specific |
| `status`      | `inquiry_status` | ENUM: new, contacted, closed   |
| `created_at`  | `TIMESTAMPTZ`    |                                |

---

### 8. `gallery_images`

Company gallery images shown on the homepage.

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `id`         | `UUID` PK |                                |
| `url`        | `TEXT`    | Image URL                      |
| `alt_text`   | `TEXT`    | Accessibility text             |
| `sort_order` | `SMALLINT`| Display order                  |
| `created_at` | `TIMESTAMPTZ` |                            |

---

### 9. `site_settings`

Key-value store for global company info (address, phones, emails, logo).

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `key`        | `TEXT` PK | e.g. "company_name", "phone_1" |
| `value`      | `TEXT`    | The setting value              |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated via trigger   |

**Seeded keys:** `company_name`, `address`, `phone_1`, `phone_2`, `email_sales`, `email_info`, `logo_url`

---

## Security (Row Level Security)

| Table              | Public (anon)          | Authenticated (admin)  |
|--------------------|------------------------|------------------------|
| `properties`       | SELECT                 | ALL                    |
| `property_images`  | SELECT                 | ALL                    |
| `property_features`| SELECT                 | ALL                    |
| `project_details`  | SELECT                 | ALL                    |
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
