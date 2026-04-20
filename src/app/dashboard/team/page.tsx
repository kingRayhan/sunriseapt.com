import { getTeamMembers } from "@/drizzle/queries/team";
import { TeamManager } from "@/components/dashboard/team-manager";

export const revalidate = 60;

export default async function DashboardTeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">
          Manage team members shown on the About page.
        </p>
      </div>
      <TeamManager members={members} />
    </div>
  );
}

