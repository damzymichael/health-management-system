import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { BarChart as BarChartIcon } from "lucide-react";
import { ReportsClient } from "./ReportsClient";

export default async function ReportsPage() {
  await requireRole("admin", "doctor", "receptionist");

  const [appointmentsAgg, alertsAgg] = await Promise.all([
    prisma.appointment.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    prisma.alert.groupBy({
      by: ['severity'],
      _count: { id: true }
    })
  ]);

  const appointmentsData = appointmentsAgg.map(a => ({ status: a.status, count: a._count.id }));
  const alertsData = alertsAgg.map(a => ({ severity: a.severity, count: a._count.id }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChartIcon className="text-emerald-600" /> Analytics & Reports
          </h1>
          <p className="text-slate-500 mt-1">High-level insights into facility operations.</p>
        </div>
      </div>

      <ReportsClient appointments={appointmentsData} alerts={alertsData} />

    </div>
  );
}
