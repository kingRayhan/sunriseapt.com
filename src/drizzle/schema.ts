import {
  boolean,
  date,
  doublePrecision,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export interface ProjectDetail {
  label: string;
  value: string;
}

export const propertiesTable = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
  type: varchar("type", { length: 50 }).notNull().default("apartment"),
  status: varchar("status", { length: 50 }).notNull().default("available"),
  published: boolean("published").notNull().default(true),
  bedrooms: smallint("bedrooms").notNull().default(0),
  bathrooms: smallint("bathrooms").notNull().default(0),
  area: varchar("area", { length: 50 }).notNull().default("0"),
  yearBuilt: varchar("year_built", { length: 50 }),
  location: text("location"),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  featured: boolean("featured").notNull().default(false),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  projectDetails: jsonb("project_details")
    .$type<ProjectDetail[]>()
    .notNull()
    .default([]),
  brochureKey: text("brochure_key"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teamMembersTable = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio"),
  imageKey: text("image_key"),
  sortOrder: smallint("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const blogPostsTable = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  date: date("date").notNull().defaultNow(),
  author: text("author"),
  imageKey: text("image_key"),
  category: text("category"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contactInquiriesTable = pgTable("contact_inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  propertyId: uuid("property_id").references(() => propertiesTable.id, {
    onDelete: "set null",
  }),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const galleryImagesTable = pgTable("gallery_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageKey: text("image_key").notNull(),
  altText: text("alt_text"),
  sortOrder: smallint("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const testimonialsTable = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull(),
  authorName: text("author_name").notNull(),
  authorTitle: text("author_title").notNull(),
  projectBrand: text("project_brand").notNull(),
  overlayLine: text("overlay_line"),
  videoUrl: text("video_url").notNull(),
  posterKey: text("poster_key").notNull(),
  sortOrder: smallint("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const siteSettingsTable = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Property = typeof propertiesTable.$inferSelect;
export type NewProperty = typeof propertiesTable.$inferInsert;

export type TeamMember = typeof teamMembersTable.$inferSelect;
export type NewTeamMember = typeof teamMembersTable.$inferInsert;

export type BlogPost = typeof blogPostsTable.$inferSelect;
export type NewBlogPost = typeof blogPostsTable.$inferInsert;

export type ContactInquiry = typeof contactInquiriesTable.$inferSelect;
export type NewContactInquiry = typeof contactInquiriesTable.$inferInsert;

export type GalleryImage = typeof galleryImagesTable.$inferSelect;
export type NewGalleryImage = typeof galleryImagesTable.$inferInsert;

export type Testimonial = typeof testimonialsTable.$inferSelect;
export type NewTestimonial = typeof testimonialsTable.$inferInsert;

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
