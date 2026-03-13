import { db } from "../db";
import { siteSettings } from "../schema";

export async function getSiteSettings() {
  const rows = await db.select().from(siteSettings);

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}
