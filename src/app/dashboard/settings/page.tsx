import { getSiteSettings } from "@/drizzle/queries/settings";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const revalidate = 60;

export default async function DashboardSettingsPage() {
  const initialSettings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Site-wide settings: social links, contact info, support chat, and home slider.
        </p>
      </div>
      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
