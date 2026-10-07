import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { recordWomensHealth } from "@/modules/womens-health";
import { audit } from "@/modules/audit";

export default async function RecordWomensHealthPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("doctor", "nurse");
  const { id } = await params;
  
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient || patient.gender !== "FEMALE") {
    // According to spec, Women's health data is only for gender = FEMALE
    notFound(); 
  }

  async function submitWomensHealth(formData: FormData) {
    "use server";
    
    const recordType = formData.get("recordType") as string;
    const cycleStart = formData.get("cycleStart") as string;
    const cycleLength = formData.get("cycleLength") as string;
    const pregnancyWeek = formData.get("pregnancyWeek") as string;
    const bpSystolic = formData.get("bpSystolic") as string;
    const bpDiastolic = formData.get("bpDiastolic") as string;
    const notes = formData.get("notes") as string;

    const record = await recordWomensHealth({
      patientId: id,
      recordedByUserId: session.user.id,
      source: "STAFF",
      recordType: recordType || "CYCLE",
      cycleStart: cycleStart ? new Date(cycleStart) : undefined,
      cycleLength: cycleLength ? parseInt(cycleLength, 10) : undefined,
      pregnancyWeek: pregnancyWeek ? parseInt(pregnancyWeek, 10) : undefined,
      bpSystolic: bpSystolic ? parseInt(bpSystolic, 10) : undefined,
      bpDiastolic: bpDiastolic ? parseInt(bpDiastolic, 10) : undefined,
      notes: notes || undefined
    });

    await audit({
      userId: session.user.id,
      action: "WOMEN_HEALTH_CREATE",
      entity: "WomenHealthRecord",
      entityId: record.id,
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Women's Health Record</h1>
          <p className="text-slate-500">Patient: {patient.fullName} ({patient.patientNumber})</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form action={submitWomensHealth} className="p-6 md:p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Record Type *</label>
            <select required name="recordType" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 bg-white">
              <option value="CYCLE">Menstrual Cycle</option>
              <option value="ANTENATAL">Antenatal (Pregnancy)</option>
              <option value="POSTNATAL">Postnatal</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cycle Start Date</label>
              <input type="date" name="cycleStart" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cycle Length (days)</label>
              <input type="number" name="cycleLength" min={15} max={60} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gestational Age (Weeks)</label>
              <input type="number" name="pregnancyWeek" min={1} max={45} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="e.g. 24" />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h4 className="font-semibold text-slate-800 mb-4">Blood Pressure (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Systolic</label>
                <input type="number" name="bpSystolic" min={50} max={260} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="mmHg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diastolic</label>
                <input type="number" name="bpDiastolic" min={30} max={160} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="mmHg" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Note: Entering BP here will automatically evaluate against the Risk Alert engine. If the patient is &gt;= 20 weeks pregnant, alerts are escalated.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Notes</label>
            <textarea name="notes" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 resize-none" placeholder="Additional observations..."></textarea>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
            <Link href={`/patients/${id}`} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-medium transition-colors shadow-sm">
              Save Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
