import { requireRole } from "@/lib/rbac";
import { getPatientById } from "@/modules/patients";
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
            <div className="p-6 flex-1 bg-white">
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <Activity className="text-emerald-500" size={32} />
                </div>
                <h4 className="text-lg font-medium text-slate-900">No Clinical Records Yet</h4>
                <p className="text-slate-500 max-w-sm mt-2">
                  This patient has no recorded vitals, consultations, or lab results.
                </p>
                
                {["doctor", "nurse"].includes(session.user.role) && (
                  <div className="mt-6 flex gap-3">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm shadow-sm flex items-center gap-2">
                      <Activity size={16} /> Record Vitals
                    </button>
                    {session.user.role === "doctor" && (
                      <button className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl font-medium transition-colors text-sm flex items-center gap-2">
                        <FileText size={16} /> New Consultation
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
