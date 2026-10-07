import { requireRole } from "@/lib/rbac";
import { getPatientById } from "@/modules/patients";
import { getPatientVitals, getPatientConsultations } from "@/modules/clinical";
import { getWomensHealthRecords } from "@/modules/womens-health";
import { notFound } from "next/navigation";
import { ArrowLeft, User as UserIcon, Phone, MapPin, Droplet, Activity, FileText } from "lucide-react";
import Link from "next/link";
import { audit } from "@/modules/audit";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("doctor", "nurse", "receptionist", "admin");
  const { id } = await params;

  const patient = await getPatientById(id);
  if (!patient) notFound();

  await audit({
    userId: session.user.id,
    action: "PATIENT_VIEW",
    entity: "Patient",
    entityId: patient.id,
  });

  const vitals = await getPatientVitals(id);
  const consultations = await getPatientConsultations(id);
  const womensHealth = patient.gender === "FEMALE" ? await getWomensHealthRecords(id) : [];
  const age = Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / 3.15576e+10);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/patients" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{patient.fullName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
              {patient.patientNumber}
            </span>
            <span className="text-slate-500 text-sm">{patient.gender} • {age} years old</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Demographics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <UserIcon size={18} className="text-emerald-600" /> Patient Profile
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase">Contact</p>
                <p className="text-slate-900 mt-1 flex items-center gap-2 text-sm"><Phone size={14} className="text-slate-400"/> {patient.phone || "No phone provided"}</p>
                <p className="text-slate-900 mt-1 flex items-center gap-2 text-sm"><MapPin size={14} className="text-slate-400"/> {patient.address || "No address provided"}</p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase">Medical Details</p>
                <p className="text-slate-900 mt-1 flex items-center gap-2 text-sm"><Droplet size={14} className="text-slate-400"/> Blood Group: {patient.bloodGroup || "Unknown"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Medical History Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[400px]">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/50">
              <button className="px-6 py-4 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600 whitespace-nowrap">
                Clinical Overview
              </button>
              <button className="px-6 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
                Consultations
              </button>
              <button className="px-6 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
                Vitals & Labs
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6 flex-1 bg-white space-y-10">
              
              {/* Vitals Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-semibold text-slate-800">Recent Vitals</h4>
                  {["doctor", "nurse"].includes(session.user.role) && (
                    <Link href={`/patients/${id}/vitals/new`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      <Activity size={14} /> Add Vitals
                    </Link>
                  )}
                </div>
                {vitals.length === 0 ? (
                  <p className="text-slate-500 text-sm">No vitals recorded.</p>
                ) : (
                  vitals.map(v => (
                     <div key={v.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-wrap gap-6 items-center">
                        <div className="min-w-[120px]">
                           <div className="text-xs text-slate-500 font-medium uppercase mb-1">Date</div>
                           <div className="text-sm text-slate-900 font-medium">{new Date(v.recordedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</div>
                        </div>
                        {v.bpSystolic && v.bpDiastolic && (
                           <div>
                             <div className="text-xs text-slate-500 font-medium uppercase mb-1">Blood Pressure</div>
                             <div className="text-sm text-slate-900 font-medium">{v.bpSystolic}/{v.bpDiastolic} mmHg</div>
                           </div>
                        )}
                        {v.temperature && (
                           <div>
                             <div className="text-xs text-slate-500 font-medium uppercase mb-1">Temp</div>
                             <div className="text-sm text-slate-900 font-medium">{v.temperature} °C</div>
                           </div>
                        )}
                        {v.pulse && (
                           <div>
                             <div className="text-xs text-slate-500 font-medium uppercase mb-1">Pulse</div>
                             <div className="text-sm text-slate-900 font-medium">{v.pulse} bpm</div>
                           </div>
                        )}
                        {v.weight && (
                           <div>
                             <div className="text-xs text-slate-500 font-medium uppercase mb-1">Weight</div>
                             <div className="text-sm text-slate-900 font-medium">{v.weight} kg</div>
                           </div>
                        )}
                     </div>
                  ))
                )}
              </div>

              {/* Consultations Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-semibold text-slate-800">Consultation History</h4>
                  {session.user.role === "doctor" && (
                    <Link href={`/patients/${id}/consultations/new`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      <FileText size={14} /> New Consultation
                    </Link>
                  )}
                </div>
                {consultations.length === 0 ? (
                  <p className="text-slate-500 text-sm">No consultations found.</p>
                ) : (
                  consultations.map(c => (
                     <div key={c.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="text-sm text-emerald-600 font-medium">{new Date(c.visitDate).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              <h5 className="font-semibold text-slate-900 mt-1">{c.diagnosis}</h5>
                           </div>
                           <div className="text-xs text-slate-500 flex items-center gap-1"><UserIcon size={12}/> {c.staff.fullName}</div>
                        </div>
                        {c.complaint && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">Complaint:</span>
                            <p className="text-sm text-slate-700 mt-1">{c.complaint}</p>
                          </div>
                        )}
                        {c.notes && (
                          <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">Notes:</span>
                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{c.notes}</p>
                          </div>
                        )}
                        {c.prescriptions && c.prescriptions.length > 0 && (
                          <div className="pt-3 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Prescriptions:</span>
                            <div className="space-y-2">
                              {c.prescriptions.map(p => (
                                <div key={p.id} className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-sm flex justify-between items-center">
                                  <div>
                                    <p className="font-semibold text-slate-800">{p.drugName}</p>
                                    <p className="text-slate-600 text-xs mt-0.5">{p.dosage}</p>
                                    {p.instructions && <p className="text-slate-500 text-xs italic mt-1">{p.instructions}</p>}
                                  </div>
                                  <div className="text-right">
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-medium">{p.duration}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                     </div>
                  ))
                )}
              </div>

              {/* Women's Health Section */}
              {patient.gender === "FEMALE" && (
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="font-semibold text-fuchsia-800">Women's Health Records</h4>
                    {["doctor", "nurse"].includes(session.user.role) && (
                      <Link href={`/patients/${id}/womens-health/new`} className="text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1">
                        <Activity size={14} /> Add Record
                      </Link>
                    )}
                  </div>
                  {womensHealth.length === 0 ? (
                    <p className="text-slate-500 text-sm">No records found.</p>
                  ) : (
                    womensHealth.map(w => (
                       <div key={w.id} className="p-4 rounded-xl border border-fuchsia-100 bg-fuchsia-50/30 flex flex-wrap gap-6 items-center">
                          <div className="min-w-[120px]">
                             <div className="text-xs text-slate-500 font-medium uppercase mb-1">Date</div>
                             <div className="text-sm text-slate-900 font-medium">{new Date(w.recordedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          </div>
                          <div>
                             <div className="text-xs text-slate-500 font-medium uppercase mb-1">Type</div>
                             <div className="text-sm text-fuchsia-700 font-semibold">{w.recordType}</div>
                          </div>
                          {w.pregnancyWeek && (
                             <div>
                               <div className="text-xs text-slate-500 font-medium uppercase mb-1">Gestational Age</div>
                               <div className="text-sm text-slate-900 font-medium">{w.pregnancyWeek} Weeks</div>
                             </div>
                          )}
                          {w.bpSystolic && w.bpDiastolic && (
                             <div>
                               <div className="text-xs text-slate-500 font-medium uppercase mb-1">Blood Pressure</div>
                               <div className="text-sm text-slate-900 font-medium">{w.bpSystolic}/{w.bpDiastolic} mmHg</div>
                             </div>
                          )}
                          {w.notes && (
                            <div className="w-full mt-2">
                              <p className="text-sm text-slate-700"><span className="font-medium text-slate-500">Notes:</span> {w.notes}</p>
                            </div>
                          )}
                       </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
