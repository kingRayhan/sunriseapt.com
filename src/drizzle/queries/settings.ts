import { eq } from "drizzle-orm";
import { db } from "../db";
import { siteSettingsTable } from "../schema";

export async function getSiteSettings() {
  const rows = await db.select().from(siteSettingsTable);

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function getAllSiteSettingsRows() {
  return db.select().from(siteSettingsTable).orderBy(siteSettingsTable.key);
}

export async function upsertSiteSetting(key: string, value: string) {
  const existing = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, key))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(siteSettingsTable)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettingsTable.key, key));
  } else {
    await db.insert(siteSettingsTable).values({ key, value });
  }
}
