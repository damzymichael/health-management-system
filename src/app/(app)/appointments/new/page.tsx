import { requireRole, requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { sendNotification } from "@/modules/notifications";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function ScheduleAppointmentPage() {
  const session = await requireSession();
  if (session.user.role === "patient") {
    redirect("/my/appointments/new");
  }
  await requireRole("doctor", "nurse", "receptionist", "admin");

  const patients = await prisma.patient.findMany({ orderBy: { fullName: 'asc' }});
  const staff = await prisma.staff.findMany({ orderBy: { fullName: 'asc' }});

  console.log(patients)
  async function scheduleAppointment(formData: FormData) {
    "use server";
    
    const patientId = formData.get("patientId") as string;
    const staffId = formData.get("staffId") as string;
    const scheduledAt = formData.get("scheduledAt") as string;
    const reason = formData.get("reason") as string;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        staffId,
        scheduledAt: new Date(scheduledAt),
        reason,
        status: "SCHEDULED"
      },
      include: {
        patient: { include: { user: true } }
      }
    });

    // Send mock notification
    await sendNotification({
      userId: appointment.patient.user.id,
      channel: "EMAIL",
      type: "APPOINTMENT_REMINDER",
      title: "Appointment Scheduled",
      body: `You have an appointment scheduled for ${new Date(scheduledAt).toLocaleString()}. Reason: ${reason}`
    });

    redirect("/appointments");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/appointments" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Schedule Appointment</h1>
          <p className="text-slate-500">Book a new consultation slot.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form action={scheduleAppointment} className="p-6 md:p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Patient *</label>
            <select required name="patientId" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 bg-white">
              <option value="">Choose a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName} ({p.patientNumber})</option>
              ))}
            </select>
            {patients.length === 0 && (
              <p className="text-sm text-rose-500 mt-1">No patients registered. Please register a patient first.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Provider (Staff) *</label>
            <select required name="staffId" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 bg-white">
              <option value="">Choose a provider...</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} {s.specialty ? `(${s.specialty})` : ""}</option>
              ))}
            </select>
            {staff.length === 0 && (
              <p className="text-sm text-rose-500 mt-1">No staff registered. You need to create a staff record first to book an appointment.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time *</label>
            <input required type="datetime-local" name="scheduledAt" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit</label>
            <textarea name="reason" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 resize-none" placeholder="Brief description of symptoms or reason for visit..."></textarea>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
            <Link href="/appointments" className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Cancel
            </Link>
            <SubmitButton
              loadingText="Scheduling Appointment..."
              disabled={patients.length === 0 || staff.length === 0}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              Schedule Appointment
            </SubmitButton>
          </div>

        </form>
      </div>
    </div>
  );
}
