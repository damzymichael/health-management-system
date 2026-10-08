import { requireRole } from "@/lib/rbac";
import { getAppointments, matchAppointmentWithDoctor } from "@/modules/appointments";
import { prisma } from "@/lib/auth";
import Link from "next/link";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { audit } from "@/modules/audit";
import { revalidatePath } from "next/cache";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const session = await requireRole("doctor", "nurse", "receptionist", "admin");
  const { date, status } = await searchParams;

  const [appointments, availableDoctors] = await Promise.all([
    getAppointments(status, date),
    prisma.staff.findMany({
      where: {
        user: {
          role: { in: ["doctor", "nurse"] },
          email: { not: "triage@hms.internal" }
        }
      },
      include: { user: true },
      orderBy: { fullName: "asc" }
    })
  ]);

  await audit({
    userId: session.user.id,
    action: "APPOINTMENT_LIST_VIEW"
  });

  async function assignDoctorAction(formData: FormData) {
    "use server";
    await requireRole("doctor", "nurse", "receptionist", "admin");
    const appointmentId = formData.get("appointmentId") as string;
    const doctorStaffId = formData.get("doctorStaffId") as string;

    await matchAppointmentWithDoctor({
      appointmentId,
      doctorStaffId,
      matchedByUserId: session.user.id
    });

    revalidatePath("/appointments");
  }

  async function updateStatusAction(formData: FormData) {
    "use server";
    await requireRole("doctor", "nurse", "receptionist", "admin");
    const id = formData.get("id") as string;
    const newStatus = formData.get("status") as any;

    await prisma.appointment.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath("/appointments");
  }

  // Triage / Unmatched appointments (patient requests needing admin matching)
  const unmatchedAppointments = appointments.filter(
    (app) =>
      app.staff?.department === "TRIAGE" ||
      app.staff?.specialty === "Awaiting Admin Match"
  );

  const matchedAppointments = appointments.filter(
    (app) =>
      app.staff?.department !== "TRIAGE" &&
      app.staff?.specialty !== "Awaiting Admin Match"
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage clinical appointments, review booking requests, and assign physicians.
          </p>
        </div>
        <Link
          href="/appointments/new"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Schedule Appointment
        </Link>
      </div>

      {/* Doctor Matching Queue (Shows when patients submit requests) */}
      {unmatchedAppointments.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  Doctor Matching Queue ({unmatchedAppointments.length})
                </h3>
                <p className="text-xs text-amber-800/80">
                  Patient requests waiting for an administrator to review symptoms and assign a physician.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 uppercase tracking-wider">
              Requires Action
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unmatchedAppointments.map((app) => (
              <div
                key={app.id}
                className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/patients/${app.patientId}`}
                      className="text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                    >
                      {app.patient.fullName}
                    </Link>
                    <span className="text-xs font-mono text-slate-400">
                      {app.patient.patientNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock size={14} className="text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      Requested: {new Date(app.scheduledAt).toLocaleDateString()} at{" "}
                      {new Date(app.scheduledAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  {app.reason && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                      <strong className="text-slate-900 block mb-0.5">Symptoms / Reason:</strong>
                      {app.reason}
                    </div>
                  )}
                </div>

                {/* Match Form */}
                <form
                  action={assignDoctorAction}
                  className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                >
                  <input type="hidden" name="appointmentId" value={app.id} />
                  <div className="flex-1">
                    <select
                      name="doctorStaffId"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-800 font-medium"
                    >
                      <option value="">Select Doctor / Provider to match...</option>
                      {availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.fullName} ({doc.user?.role === "doctor" ? "Doctor" : "Nurse"}{doc.specialty ? ` • ${doc.specialty}` : ""})
                        </option>
                      ))}
                    </select>
                  </div>
                  <SubmitButton
                    loadingText="Matching..."
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl whitespace-nowrap"
                  >
                    Match Doctor
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Appointments Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <CalendarIcon size={16} className="text-emerald-600" />
            Confirmed & Scheduled Appointments ({matchedAppointments.length})
          </div>
          {date && (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-100">
              Filtered for {date}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Assigned Provider</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {matchedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarIcon size={32} className="text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="font-semibold text-slate-700">No confirmed appointments scheduled.</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        New bookings or doctor assignments will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                matchedAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold whitespace-nowrap">
                        <Clock size={14} className="text-emerald-600" />
                        {new Date(app.scheduledAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/patients/${app.patientId}`}
                        className="font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
                      >
                        {app.patient.fullName}
                      </Link>
                      <div className="text-xs text-slate-400">{app.patient.patientNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                        <UserIcon size={14} className="text-slate-400" />
                        {app.staff.fullName}
                      </div>
                      <div className="text-xs text-slate-400 ml-5">
                        {app.staff.specialty || "General"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[220px] truncate">
                      {app.reason || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          app.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : app.status === "CONFIRMED"
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : app.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status !== "COMPLETED" && app.status !== "CANCELLED" ? (
                        <div className="flex items-center justify-end gap-2">
                          <form action={updateStatusAction}>
                            <input type="hidden" name="id" value={app.id} />
                            <input type="hidden" name="status" value="COMPLETED" />
                            <button
                              type="submit"
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                              Complete
                            </button>
                          </form>
                          <form action={updateStatusAction}>
                            <input type="hidden" name="id" value={app.id} />
                            <input type="hidden" name="status" value="CANCELLED" />
                            <button
                              type="submit"
                              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Archived</span>
                      )}
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
