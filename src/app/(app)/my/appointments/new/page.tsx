import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Stethoscope, Sparkles, Clock, FileText } from "lucide-react";
import { requestPatientAppointment } from "@/modules/appointments";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function PatientBookAppointmentPage() {
  const session = await requireRole("patient");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id }
  });

  if (!patient) {
    redirect("/onboarding");
  }

  async function handleBookAppointment(formData: FormData) {
    "use server";
    const scheduledAtStr = formData.get("scheduledAt") as string;
    const reason = formData.get("reason") as string;

    if (!scheduledAtStr) {
      throw new Error("Date and time are required.");
    }

    const scheduledAt = new Date(scheduledAtStr);

    await requestPatientAppointment({
      userId: session.user.id,
      scheduledAt,
      reason
    });

    redirect("/my/appointments");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/my/appointments"
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="text-emerald-600" /> Book an Appointment
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Request a visit and our administration will match you with the right specialist.
          </p>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 flex items-start gap-3.5">
        <Sparkles className="text-emerald-600 shrink-0 mt-0.5" size={20} />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-emerald-900">Physician Matching Protocol</p>
          <p className="text-emerald-800/90 text-xs leading-relaxed">
            Choose your preferred date and describe your symptoms. Our clinic team will assess your complaint and assign the optimal available doctor or specialist. You will receive an instant notification when your doctor is assigned.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form action={handleBookAppointment} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Clock size={16} className="text-slate-500" /> Preferred Date & Time *
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              required
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 transition-all text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              Clinic hours are 8:00 AM - 6:00 PM (Monday through Saturday).
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <FileText size={16} className="text-slate-500" /> Symptoms or Reason for Consultation *
            </label>
            <textarea
              name="reason"
              required
              rows={4}
              placeholder="e.g. Experiencing persistent headaches and mild fever for the past 3 days..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 transition-all text-sm resize-none"
            ></textarea>
            <p className="text-xs text-slate-400 mt-1">
              Providing details helps our team match you with the right department or physician.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/my/appointments"
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <SubmitButton
              loadingText="Submitting Request..."
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm"
            >
              Request Consultation
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
