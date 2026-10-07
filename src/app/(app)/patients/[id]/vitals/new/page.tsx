import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { recordPatientVitals } from "@/modules/clinical";
import { audit } from "@/modules/audit";

export default async function RecordVitalsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("doctor", "nurse");
  const { id } = await params;
  
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) notFound();

  async function submitVitals(formData: FormData) {
    "use server";
    
    const getFloat = (name: string) => {
      const val = formData.get(name);
      return val ? parseFloat(val as string) : undefined;
    };
    const getInt = (name: string) => {
      const val = formData.get(name);
      return val ? parseInt(val as string, 10) : undefined;
    };

    const vitals = await recordPatientVitals({
      patientId: id,
      recordedByUserId: session.user.id,
      source: "STAFF",
      temperature: getFloat("temperature"),
      pulse: getInt("pulse"),
      bpSystolic: getInt("bpSystolic"),
      bpDiastolic: getInt("bpDiastolic"),
      weight: getFloat("weight"),
      height: getFloat("height"),
      bloodSugar: getFloat("bloodSugar")
    });

    await audit({
      userId: session.user.id,
      action: "VITALS_CREATE",
      entity: "VitalsLabEntry",
      entityId: vitals.id,
      details: { patientId: id }
    });

    redirect(`/patients/${id}`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${id}`} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Record Vitals</h1>
          <p className="text-slate-500">Patient: {patient.fullName} ({patient.patientNumber})</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form action={submitVitals} className="p-6 md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure (Systolic)</label>
              <input type="number" name="bpSystolic" min={50} max={260} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="mmHg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure (Diastolic)</label>
              <input type="number" name="bpDiastolic" min={30} max={160} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="mmHg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Temperature</label>
              <input type="number" step="0.1" name="temperature" min={30} max={45} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="°C" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pulse</label>
              <input type="number" name="pulse" min={20} max={250} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="bpm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Weight</label>
              <input type="number" step="0.1" name="weight" min={1} max={400} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="kg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Sugar</label>
              <input type="number" step="0.1" name="bloodSugar" min={1} max={50} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="mmol/L" />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
            <Link href={`/patients/${id}`} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm">
              Save Vitals
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
