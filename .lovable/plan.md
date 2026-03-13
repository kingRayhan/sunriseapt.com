

# Sunriseapt — Real Estate Property Listing Website

## Design
- **Style**: Modern & minimal with clean white space and sharp typography
- **Colors**: Navy blue accents (#1e3a5f) on white, with subtle gray tones
- **Font**: Clean sans-serif, professional feel

## Pages

### 1. Home Page
- **Navbar** with logo "Sunriseapt" + nav links (Home, Properties, About, Blog, Contact)
- **Full-screen hero carousel** with 3-4 property images, overlay text & CTA buttons
- **Mission / Vision / About section** — 3-column card layout with icons
- **Featured Properties** — Grid of 3-4 property cards (image, price, beds/baths/area, location)
- **Google Map section** with pins for property locations (using embedded iframe or Leaflet)
- **Footer** with contact info, quick links, social icons

### 2. Properties Listing Page
- Filter bar (property type, price range, bedrooms, location)
- Grid of property cards with hover effects
- Clicking a card navigates to Property Details

### 3. Property Details Page
- Photo gallery/slideshow at top
- Property info: price, bedrooms, bathrooms, area, property type, year built
- Description text
- Location map showing the property pin
- Related/similar properties section

### 4. About Us Page
- Company story section
- Mission & vision statements
- Team member cards (photo, name, role)

### 5. Blog / News Page
- Grid of blog post cards (image, title, date, excerpt)
- Individual blog post page with full content

### 6. Contact Page
- Contact form (name, email, phone, message)
- Office address, phone, email display
- Embedded Google Map showing office location

## Data
- All properties, blog posts, and team members will be hardcoded as static data arrays
- 6-8 sample properties with realistic details and placeholder images

## Shared Components
- Responsive navbar with mobile hamburger menu
- Footer
- Property card component (reused across pages)

