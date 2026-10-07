import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { audit } from "@/modules/audit";
import { revalidatePath } from "next/cache";

export default async function AlertsPage() {
  const session = await requireRole("doctor", "nurse");
  
  const alerts = await prisma.alert.findMany({
    where: { status: "OPEN" },
    include: { patient: true },
    orderBy: [
      { severity: "desc" },
      { createdAt: "desc" }
    ]
  });

  await audit({
    userId: session.user.id,
    action: "ALERT_LIST_VIEW",
  });

  async function acknowledgeAlert(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.alert.update({
      where: { id },
      data: { status: "ACKNOWLEDGED", acknowledgedByUserId: session.user.id }
    });
    revalidatePath("/alerts");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Risk Alerts</h1>
          <p className="text-slate-500">Monitor and respond to critical patient readings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">All Clear</h3>
            <p className="text-slate-500 mt-1">There are no open risk alerts right now.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`bg-white rounded-2xl shadow-sm border-l-4 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between ${
              alert.severity === "CRITICAL" ? "border-rose-500 border-y-slate-200 border-r-slate-200" : 
              alert.severity === "HIGH" ? "border-amber-500 border-y-slate-200 border-r-slate-200" : 
              "border-sky-500 border-y-slate-200 border-r-slate-200"
            }`}>
              <div className="flex gap-4 items-start">
                <div className={`mt-1 p-2 rounded-full ${
                  alert.severity === "CRITICAL" ? "bg-rose-100 text-rose-600" : 
                  alert.severity === "HIGH" ? "bg-amber-100 text-amber-600" : 
                  "bg-sky-100 text-sky-600"
                }`}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      alert.severity === "CRITICAL" ? "text-rose-600" : 
                      alert.severity === "HIGH" ? "text-amber-600" : "text-sky-600"
                    }`}>
                      {alert.severity} PRIORITY
                    </span>
                    <span className="text-slate-400 text-sm">•</span>
                    <span className="text-slate-500 text-sm">{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mt-1">{alert.message}</h3>
                  <div className="mt-2 text-sm text-slate-600">
                    Patient: <Link href={`/patients/${alert.patientId}`} className="font-medium text-emerald-600 hover:underline">{alert.patient.fullName}</Link> ({alert.patient.patientNumber})
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <form action={acknowledgeAlert}>
                  <input type="hidden" name="id" value={alert.id} />
                  <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-sm whitespace-nowrap">
                    Acknowledge
                  </button>
                </form>
                <Link href={`/patients/${alert.patientId}`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm shadow-sm whitespace-nowrap flex items-center gap-2">
                  <Activity size={16} /> View Record
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
