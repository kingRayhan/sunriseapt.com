export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "apartment" | "villa" | "house" | "penthouse" | "townhouse";
  bedrooms: number;
  bathrooms: number;
  area: number;
  yearBuilt: number;
  location: string;
  address: string;
  lat: number;
  lng: number;
  images: string[];
  featured: boolean;
  features: string[];
}

export const properties: Property[] = [
  {
    id: "1",
    title: "Luxury Waterfront Villa",
    description: "Stunning waterfront villa with panoramic ocean views. This exquisite property features floor-to-ceiling windows, a private infinity pool, and direct beach access. The open-plan living area seamlessly connects to an expansive terrace, perfect for entertaining. Premium finishes throughout including marble flooring, custom cabinetry, and a state-of-the-art kitchen.",
    price: 2500000,
    type: "villa",
    bedrooms: 5,
    bathrooms: 4,
    area: 4500,
    yearBuilt: 2022,
    location: "Palm Beach",
    address: "123 Ocean Drive, Palm Beach",
    lat: 26.7056,
    lng: -80.0364,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    featured: true,
    features: ["Pool", "Beach Access", "Smart Home", "Wine Cellar", "Home Theater"],
  },
  {
    id: "2",
    title: "Modern Downtown Penthouse",
    description: "Sleek penthouse in the heart of the city with breathtaking skyline views. This contemporary residence boasts an open floor plan with double-height ceilings, a chef's kitchen with top-of-the-line appliances, and a wrap-around terrace. Building amenities include a rooftop pool, fitness center, and 24-hour concierge.",
    price: 1800000,
    type: "penthouse",
    bedrooms: 3,
    bathrooms: 3,
    area: 3200,
    yearBuilt: 2023,
    location: "Downtown Miami",
    address: "456 Brickell Ave, Miami",
    lat: 25.7617,
    lng: -80.1918,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    ],
    featured: true,
    features: ["Concierge", "Rooftop Pool", "Gym", "Parking", "City Views"],
  },
  {
    id: "3",
    title: "Elegant Family Home",
    description: "Beautiful family home in a quiet, tree-lined neighborhood. Features a spacious backyard with a pool, gourmet kitchen, and a cozy fireplace in the living room. The master suite includes a walk-in closet and spa-like bathroom. Close to top-rated schools and parks.",
    price: 950000,
    type: "house",
    bedrooms: 4,
    bathrooms: 3,
    area: 3000,
    yearBuilt: 2019,
    location: "Coral Gables",
    address: "789 Granada Blvd, Coral Gables",
    lat: 25.7215,
    lng: -80.2684,
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
    ],
    featured: true,
    features: ["Pool", "Garden", "Fireplace", "Garage", "Near Schools"],
  },
  {
    id: "4",
    title: "Chic Studio Apartment",
    description: "Beautifully designed studio apartment in a trendy neighborhood. Features high ceilings, exposed brick walls, and modern finishes. The open layout maximizes space with a clever kitchen design and Murphy bed. Walking distance to restaurants, shops, and nightlife.",
    price: 320000,
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    yearBuilt: 2021,
    location: "Wynwood",
    address: "101 NW 25th St, Miami",
    lat: 25.8003,
    lng: -80.1996,
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
    ],
    featured: false,
    features: ["Modern Design", "Walkable", "Laundry", "Pet Friendly"],
  },
  {
    id: "5",
    title: "Beachside Townhouse",
    description: "Charming townhouse steps from the beach. This three-story home features a rooftop terrace with ocean views, a private garage, and a sun-drenched living area. The kitchen opens to a dining area perfect for family gatherings. Community pool and lush tropical landscaping.",
    price: 720000,
    type: "townhouse",
    bedrooms: 3,
    bathrooms: 2,
    area: 2100,
    yearBuilt: 2020,
    location: "Fort Lauderdale",
    address: "555 A1A, Fort Lauderdale",
    lat: 26.1224,
    lng: -80.1373,
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
    ],
    featured: false,
    features: ["Near Beach", "Rooftop Terrace", "Garage", "Community Pool"],
  },
  {
    id: "6",
    title: "Luxury Garden Apartment",
    description: "Ground-floor luxury apartment with a private garden oasis. This spacious two-bedroom residence features Italian marble floors, a designer kitchen, and floor-to-ceiling sliding doors that open to a beautifully landscaped terrace. Resort-style amenities include a spa, pool, and tennis courts.",
    price: 580000,
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1400,
    yearBuilt: 2022,
    location: "Key Biscayne",
    address: "200 Crandon Blvd, Key Biscayne",
    lat: 25.6938,
    lng: -80.1625,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18f6b6a6c?w=800",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800",
    ],
    featured: true,
    features: ["Private Garden", "Spa", "Tennis", "Pool", "Security"],
  },
  {
    id: "7",
    title: "Contemporary Loft",
    description: "Industrial-chic loft with soaring ceilings and an abundance of natural light. The open floor plan showcases polished concrete floors, a gourmet kitchen island, and a mezzanine bedroom with a glass railing. Located in a converted warehouse with a vibrant arts community.",
    price: 450000,
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 1100,
    yearBuilt: 2018,
    location: "Design District",
    address: "300 NE 40th St, Miami",
    lat: 25.8138,
    lng: -80.1867,
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
      "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
    ],
    featured: false,
    features: ["High Ceilings", "Natural Light", "Arts District", "Parking"],
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};
