import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Activity,
  HeartPulse,
  FileText,
  Pill,
  Calendar,
  AlertCircle,
  Thermometer,
  Droplet,
  User,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { audit } from "@/modules/audit";

export default async function MyHealthRecordsPage() {
  const session = await requireRole("patient");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      consultations: {
        include: {
          staff: true,
          prescriptions: true
        },
        orderBy: { visitDate: "desc" }
      },
      vitalsLabs: {
        orderBy: { recordedAt: "desc" },
        take: 20
      },
      womenHealth: {
        orderBy: { recordedAt: "desc" }
      }
    }
  });

  if (!patient) {
    redirect("/onboarding");
  }

  await audit({
    userId: session.user.id,
    action: "PATIENT_VIEW",
    entity: "Patient",
    entityId: patient.id,
    details: { selfService: true }
  });

  // Extract all prescriptions
  const allPrescriptions = patient.consultations.flatMap((c) =>
    c.prescriptions.map((p) => ({
      ...p,
      visitDate: c.visitDate,
      doctorName: c.staff?.fullName || "Physician"
    }))
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="text-emerald-600" /> My Health Records
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Official consolidated medical history, clinical diagnoses, and prescriptions.
          </p>
        </div>

        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 rounded-xl text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <User size={14} /> Update Profile Info
        </Link>
      </div>

      {/* Patient Medical Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Patient No.
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {patient.patientNumber}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Blood Group
          </span>
          <span className="text-lg font-bold text-slate-900 mt-1 block">
            {patient.bloodGroup || "Not recorded"}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Allergies
          </span>
          <span className="text-sm font-semibold text-rose-600 mt-1 block">
            {patient.allergies.length > 0
              ? patient.allergies.join(", ")
              : "None documented"}
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Known Conditions
          </span>
          <span className="text-sm font-semibold text-slate-800 mt-1 block">
            {patient.knownConditions.length > 0
              ? patient.knownConditions.join(", ")
              : "None documented"}
          </span>
        </div>
      </div>

      {/* Section 1: Prescriptions & Medications */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Pill size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Prescriptions & Medications
              </h2>
              <p className="text-xs text-slate-500">
                Medications ordered during your consultations
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {allPrescriptions.length} items
          </span>
        </div>

        {allPrescriptions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No medications have been prescribed yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPrescriptions.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-base">
                    {p.drugName}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {new Date(p.visitDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-700">Dosage:</strong> {p.dosage}
                  </p>
                  <p>
                    <strong className="text-slate-700">Duration:</strong> {p.duration}
                  </p>
                  {p.instructions && (
                    <p className="italic text-slate-500 pt-1">
                      &ldquo;{p.instructions}&rdquo;
                    </p>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                  Prescribing Physician: {p.doctorName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Clinical Consultations */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Clinical Consultations & Diagnoses
              </h2>
              <p className="text-xs text-slate-500">
                Doctor visit assessments and documented clinical findings
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
            {patient.consultations.length} encounters
          </span>
        </div>

        {patient.consultations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No consultations recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {patient.consultations.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Diagnosis
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {c.diagnosis}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(c.visitDate).toLocaleDateString(undefined, {
                      dateStyle: "medium"
                    })}{" "}
                    &bull; {c.staff?.fullName || "Physician"}
                  </div>
                </div>

                {c.complaint && (
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Chief Complaint:</strong> {c.complaint}
                  </p>
                )}

                {c.notes && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-700 block mb-1">Clinical Notes:</strong>
                    {c.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Vitals History */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <HeartPulse size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Vitals & Readings History
              </h2>
              <p className="text-xs text-slate-500">
                Blood pressure, pulse, temperature, and biometric logs
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full">
            {patient.vitalsLabs.length} readings
          </span>
        </div>

        {patient.vitalsLabs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No vitals recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Recorded At</th>
                  <th className="px-4 py-3">Blood Pressure</th>
                  <th className="px-4 py-3">Pulse</th>
                  <th className="px-4 py-3">Temp</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3">Blood Sugar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {patient.vitalsLabs.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {new Date(v.recordedAt).toLocaleDateString()} at{" "}
                      {new Date(v.recordedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {v.bpSystolic && v.bpDiastolic ? (
                        <span
                          className={`font-bold ${
                            v.bpSystolic >= 140 || v.bpDiastolic >= 90
                              ? "text-rose-600"
                              : "text-slate-800"
                          }`}
                        >
                          {v.bpSystolic}/{v.bpDiastolic} mmHg
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">{v.pulse ? `${v.pulse} bpm` : "—"}</td>
                    <td className="px-4 py-3">
                      {v.temperature ? `${v.temperature} °C` : "—"}
                    </td>
                    <td className="px-4 py-3">{v.weight ? `${v.weight} kg` : "—"}</td>
                    <td className="px-4 py-3">
                      {v.bloodSugar ? `${v.bloodSugar} mmol/L` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 4: Maternal / Women's Health (if applicable) */}
      {patient.womenHealth.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Droplet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Maternal & Women&apos;s Health Follow-up
              </h2>
              <p className="text-xs text-slate-500">
                Antenatal records and reproductive health tracking
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.womenHealth.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-2 text-xs text-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 uppercase">
                    {w.recordType} Record
                  </span>
                  <span className="text-slate-400">
                    {new Date(w.recordedAt).toLocaleDateString()}
                  </span>
                </div>
                {w.pregnancyWeek && (
                  <p>
                    <strong>Gestational Age:</strong> Week {w.pregnancyWeek}
                  </p>
                )}
                {w.bpSystolic && w.bpDiastolic && (
                  <p>
                    <strong>Blood Pressure:</strong> {w.bpSystolic}/{w.bpDiastolic} mmHg
                  </p>
                )}
                {w.notes && <p className="italic text-slate-600">&ldquo;{w.notes}&rdquo;</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
