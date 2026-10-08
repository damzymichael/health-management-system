import { requireRole } from "@/lib/rbac";
import { audit } from "@/modules/audit";
import { getFacilityAnalytics } from "@/modules/reports";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ months?: string }>;
}) {
  const session = await requireRole("admin", "doctor", "receptionist");
  const { months } = await searchParams;
  const parsedMonths = months ? Math.max(1, Math.min(24, parseInt(months, 10) || 6)) : 6;

  const data = await getFacilityAnalytics(parsedMonths);

  await audit({
    userId: session.user.id,
    action: "REPORTS_VIEW",
    details: { monthsCount: parsedMonths, role: session.user.role }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ReportsClient
        data={data}
        userRole={session.user.role}
        selectedMonths={parsedMonths}
      />
    </div>
  );
}
