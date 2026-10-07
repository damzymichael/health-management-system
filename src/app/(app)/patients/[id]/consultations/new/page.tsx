import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createConsultation } from "@/modules/clinical";
import { audit } from "@/modules/audit";
import { PrescriptionBuilder } from "@/components/clinical/PrescriptionBuilder";

export default async function NewConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("doctor");
  const { id } = await params;
  
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) notFound();

  async function submitConsultation(formData: FormData) {
    "use server";
    
    const complaint = formData.get("complaint") as string;
    const diagnosis = formData.get("diagnosis") as string;
    const notes = formData.get("notes") as string;

    const indexes = formData.getAll("prescription_indexes") as string[];
    const prescriptions = indexes.map(idx => ({
      medication: formData.get(`medication_${idx}`) as string,
      dosage: formData.get(`dosage_${idx}`) as string,
      frequency: formData.get(`frequency_${idx}`) as string,
      durationDays: parseInt(formData.get(`duration_${idx}`) as string, 10),
      instructions: (formData.get(`instructions_${idx}`) as string) || undefined,
    })).filter(p => p.medication && p.dosage && p.frequency && p.durationDays);

    const consultation = await createConsultation({
      patientId: id,
      staffUserId: session.user.id,
      complaint,
      diagnosis,
      notes,
      prescriptions
    });

    await audit({
      userId: session.user.id,
      action: "CONSULTATION_CREATE",
      entity: "Consultation",
      entityId: consultation.id,
      details: { patientId: id }
    });

    redirect(`/patients/${id}`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${id}`} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Consultation</h1>
          <p className="text-slate-500">Patient: {patient.fullName} ({patient.patientNumber})</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form action={submitConsultation} className="p-6 md:p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Presenting Complaint</label>
            <textarea name="complaint" rows={3} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 resize-none" placeholder="What brings the patient in today?"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
            <input type="text" name="diagnosis" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="Primary diagnosis" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Notes</label>
            <textarea name="notes" rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 resize-none" placeholder="Examination findings, history, and treatment plan..."></textarea>
          </div>

          <PrescriptionBuilder />

          <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
            <Link href={`/patients/${id}`} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm">
              Save Consultation
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
