import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function MyAppointmentsPage() {
  const session = await requireRole("patient");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id }
  });

  if (!patient) {
    redirect("/onboarding");
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
    include: { staff: true },
    orderBy: { scheduledAt: "desc" }
  });

  async function cancelAppointment(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" }
    });
    revalidatePath("/my/appointments");
  }

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.scheduledAt) >= now && a.status !== "CANCELLED"
  );
  const pastAppointments = appointments.filter(
    (a) => new Date(a.scheduledAt) < now || a.status === "CANCELLED"
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="text-emerald-600" /> My Appointments
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your scheduled visits, assigned physicians, and consultation statuses.
          </p>
        </div>

        <Link
          href="/my/appointments/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} /> Book New Appointment
        </Link>
      </div>

      {/* Upcoming / Active Visits */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Upcoming & Pending Visits</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
            {upcomingAppointments.length}
          </span>
        </h2>

        {upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
            <Calendar size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Upcoming Appointments</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              You do not have any consultations scheduled right now. You can book an appointment anytime.
            </p>
            <Link
              href="/my/appointments/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <Plus size={14} /> Schedule a Consultation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingAppointments.map((appt) => {
              const isTriage =
                appt.staff?.department === "TRIAGE" ||
                appt.staff?.specialty === "Awaiting Admin Match";

              return (
                <div
                  key={appt.id}
                  className={`bg-white rounded-2xl p-6 border shadow-sm transition-all flex flex-col justify-between ${
                    isTriage ? "border-amber-200 bg-amber-50/20" : "border-slate-200 hover:border-emerald-200"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Status Pill */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(appt.scheduledAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>

                      {isTriage ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 border border-amber-200">
                          <AlertCircle size={12} /> Awaiting Doctor Match
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 size={12} /> Confirmed
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        {new Date(appt.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                      {appt.reason && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          <strong>Reason:</strong> {appt.reason}
                        </p>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isTriage
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">
                          Assigned Physician
                        </span>
                        {isTriage ? (
                          <p className="text-sm font-semibold text-amber-800">
                            Matching in progress...
                          </p>
                        ) : (
                          <p className="text-sm font-bold text-slate-900">
                            {appt.staff.fullName}
                            {appt.staff.specialty && (
                              <span className="text-xs font-normal text-slate-500 ml-1">
                                ({appt.staff.specialty})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      ID: {appt.id.slice(-6).toUpperCase()}
                    </span>
                    <form action={cancelAppointment}>
                      <input type="hidden" name="id" value={appt.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Cancel Appointment
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Past & History</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {pastAppointments.length}
            </span>
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Physician</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastAppointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        {new Date(a.scheduledAt).toLocaleDateString()} at{" "}
                        {new Date(a.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {a.staff?.fullName || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                        {a.reason || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            a.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-700"
                              : a.status === "CANCELLED"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
