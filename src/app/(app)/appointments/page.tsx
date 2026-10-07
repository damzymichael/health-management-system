import { requireRole } from "@/lib/rbac";
import { getAppointments } from "@/modules/appointments";
import Link from "next/link";
import { Plus, Calendar as CalendarIcon, Clock, User as UserIcon } from "lucide-react";
import { audit } from "@/modules/audit";

export default async function AppointmentsPage({ searchParams }: { searchParams: Promise<{ date?: string, status?: string }> }) {
  const session = await requireRole("doctor", "nurse", "receptionist", "admin");
  const { date, status } = await searchParams;
  
  const appointments = await getAppointments(status, date);

  await audit({
    userId: session.user.id,
    action: "APPOINTMENT_LIST_VIEW",
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500">Manage patient schedules</p>
        </div>
        <Link href="/appointments/new" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
          <Plus size={18} /> Schedule Appointment
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-4">
            <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
               <CalendarIcon size={16} className="text-emerald-600" /> Filtered by: {date || "All Time"} 
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Provider</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarIcon size={32} className="text-slate-300 mb-3" />
                      <p>No appointments scheduled.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-900 font-medium whitespace-nowrap">
                        <Clock size={14} className="text-emerald-600" />
                        {new Date(app.scheduledAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/patients/${app.patientId}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 whitespace-nowrap">
                        {app.patient.fullName}
                      </Link>
                      <div className="text-xs text-slate-500">{app.patient.patientNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                       <div className="flex items-center gap-1 whitespace-nowrap"><UserIcon size={14} className="text-slate-400"/> {app.staff.fullName}</div>
                       <div className="text-xs text-slate-500 ml-5">{app.staff.specialty || "General"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                      {app.reason || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        app.status === 'SCHEDULED' ? 'bg-sky-50 text-sky-700 border-sky-200' : 
                        app.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        app.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Update</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
