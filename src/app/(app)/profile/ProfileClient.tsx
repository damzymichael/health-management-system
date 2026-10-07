"use client";

import { useState } from "react";
import {
  User as UserIcon,
  Mail,
  Shield,
  Phone,
  MapPin,
  HeartPulse,
  Activity,
  Copy,
  Check,
  Calendar,
  Lock,
  Clock,
  FileText,
  AlertCircle,
  Stethoscope,
  Heart,
  Droplet,
  Sparkles,
  Info,
  ShieldCheck,
  Building,
  KeyRound,
} from "lucide-react";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    patient?: {
      id: string;
      patientNumber: string;
      fullName: string;
      gender: string;
      dateOfBirth: string;
      phone: string | null;
      address: string | null;
      nextOfKinName: string | null;
      nextOfKinPhone: string | null;
      bloodGroup: string | null;
      allergies: string[];
      knownConditions: string[];
      familyHistory: string | null;
      smokingStatus: string | null;
      alcoholUse: string | null;
      physicalActivity: string | null;
      dietNotes: string | null;
      _count?: {
        appointments: number;
        consultations: number;
        vitalsLabs: number;
      };
    } | null;
    staff?: {
      id: string;
      fullName: string;
      specialty: string | null;
      department: string | null;
      phone: string | null;
      _count?: {
        appointments: number;
        consultations: number;
      };
    } | null;
    sessions?: Array<{
      id: string;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: string;
    }>;
    recentAuditCount?: number;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "medical_or_work" | "security">("overview");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return {
          bg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
          ring: "ring-fuchsia-400",
          icon: <Shield size={14} className="text-fuchsia-600" />,
          label: "System Administrator",
        };
      case "doctor":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          ring: "ring-emerald-400",
          icon: <Stethoscope size={14} className="text-emerald-600" />,
          label: "Medical Doctor / Physician",
        };
      case "nurse":
        return {
          bg: "bg-teal-50 text-teal-700 border-teal-200",
          ring: "ring-teal-400",
          icon: <HeartPulse size={14} className="text-teal-600" />,
          label: "Clinical Registered Nurse",
        };
      case "receptionist":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          ring: "ring-amber-400",
          icon: <UserIcon size={14} className="text-amber-600" />,
          label: "Hospital Receptionist",
        };
      default:
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          ring: "ring-sky-400",
          icon: <Heart size={14} className="text-sky-600" />,
          label: "Registered Patient",
        };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        {/* Banner Pattern */}
        <div className="h-40 sm:h-48 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-white/20">
              <Sparkles size={13} className="text-emerald-200" /> HMS Verified
            </span>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-4xl shadow-xl ring-4 ring-white ${roleBadge.ring}`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active">
                  <Check size={14} strokeWidth={3} />
                </div>
              </div>

              {/* Title & Email */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {user.name}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${roleBadge.bg}`}>
                    {roleBadge.icon}
                    {roleBadge.label}
                  </span>
                </div>
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  <Mail size={15} className="text-slate-400" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Quick Identifier Pills */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              {user.patient?.patientNumber && (
                <button
                  onClick={() => copyToClipboard(user.patient!.patientNumber, "patientNumber")}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5"
                  title="Click to copy Patient ID"
                >
                  <span className="text-slate-400 font-semibold">ID:</span>
                  <span className="font-mono font-bold text-slate-900">{user.patient.patientNumber}</span>
                  {copiedId === "patientNumber" ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} className="text-slate-400" />
                  )}
                </button>
              )}

              <button
                onClick={() => copyToClipboard(user.id, "userId")}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1.5"
                title="Click to copy User ID"
              >
                <span className="text-slate-400 font-semibold">UID:</span>
                <span className="font-mono text-slate-600">{user.id.slice(-6)}</span>
                {copiedId === "userId" ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pt-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
                activeTab === "overview"
                  ? "text-emerald-700 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Overview & Details
            </button>
            <button
              onClick={() => setActiveTab("medical_or_work")}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
                activeTab === "medical_or_work"
                  ? "text-emerald-700 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {user.role === "patient"
                ? "Medical Record"
                : user.role === "admin"
                ? "Admin Privileges"
                : "Clinical Practice"}
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
                activeTab === "security"
                  ? "text-emerald-700 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Account Security & Access
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Personal Information */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Personal Details</h3>
              <p className="text-xs text-slate-400">Account identity and basic demographic information</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{user.name}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                <p className="text-sm font-bold text-slate-900 mt-1 break-all">{user.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Phone</span>
                <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  {user.patient?.phone || user.staff?.phone || "Not provided"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Since</span>
                <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {user.patient?.address && (
                <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Address</span>
                  <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    {user.patient.address}
                  </p>
                </div>
              )}
            </div>

            {/* If patient, show next of kin snapshot */}
            {user.patient && (user.patient.nextOfKinName || user.patient.nextOfKinPhone) && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Emergency / Next of Kin</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400">Contact Person</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user.patient.nextOfKinName || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400">Contact Number</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user.patient.nextOfKinPhone || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics & Account Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-800">Activity Summary</h3>

              {user.role === "patient" && user.patient && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-900">Total Appointments</span>
                    </div>
                    <span className="font-extrabold text-emerald-700">{user.patient._count?.appointments ?? 0}</span>
                  </div>

                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-teal-600" />
                      <span className="text-xs font-medium text-teal-900">Consultations</span>
                    </div>
                    <span className="font-extrabold text-teal-700">{user.patient._count?.consultations ?? 0}</span>
                  </div>

                  <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity size={18} className="text-sky-600" />
                      <span className="text-xs font-medium text-sky-900">Vitals Logged</span>
                    </div>
                    <span className="font-extrabold text-sky-700">{user.patient._count?.vitalsLabs ?? 0}</span>
                  </div>
                </div>
              )}

              {["doctor", "nurse"].includes(user.role) && user.staff && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-900">Assigned Appointments</span>
                    </div>
                    <span className="font-extrabold text-emerald-700">{user.staff._count?.appointments ?? 0}</span>
                  </div>

                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-teal-600" />
                      <span className="text-xs font-medium text-teal-900">Consultations Authored</span>
                    </div>
                    <span className="font-extrabold text-teal-700">{user.staff._count?.consultations ?? 0}</span>
                  </div>
                </div>
              )}

              {user.role === "admin" && (
                <div className="p-4 bg-fuchsia-50/60 rounded-xl border border-fuchsia-100 space-y-2">
                  <div className="flex items-center gap-2 text-fuchsia-800">
                    <ShieldCheck size={20} className="text-fuchsia-600" />
                    <span className="font-bold text-sm">Full Administrative Role</span>
                  </div>
                  <p className="text-xs text-fuchsia-700">
                    Authorizes governance over all clinicians, patient medical files, alert trigger rules, and audit logs.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-1.5">
                <Info size={14} />
                <span>Account status: Active & in good standing</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Medical Record or Clinical Practice */}
      {activeTab === "medical_or_work" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Patient Medical Details */}
          {user.role === "patient" && user.patient && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <HeartPulse size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Comprehensive Clinical Profile</h3>
                  <p className="text-xs text-slate-400">Electronic health record metadata and allergies</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Droplet size={13} className="text-rose-500" /> Blood Group
                  </span>
                  <p className="text-xl font-black text-slate-800 mt-1">
                    {user.patient.bloodGroup || "Not specified"}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Date of Birth</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {new Date(user.patient.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Gender</span>
                  <p className="text-sm font-bold text-slate-800 mt-1 capitalize">
                    {user.patient.gender.toLowerCase()}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Patient ID</span>
                  <p className="text-sm font-mono font-bold text-emerald-700 mt-1">
                    {user.patient.patientNumber}
                  </p>
                </div>
              </div>

              {/* Allergies & Known Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle size={15} className="text-rose-500" /> Known Allergies
                  </span>
                  {user.patient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.patient.allergies.map((allergy, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      No drug or environmental allergies recorded.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={15} className="text-amber-500" /> Chronic / Known Conditions
                  </span>
                  {user.patient.knownConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.patient.knownConditions.map((condition, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                      No chronic conditions logged.
                    </p>
                  )}
                </div>
              </div>

              {/* Lifestyle & Social History */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifestyle & Social History</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Smoking Status</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user.patient.smokingStatus || "Not recorded"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Alcohol Consumption</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user.patient.alcoholUse || "Not recorded"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Physical Activity</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{user.patient.physicalActivity || "Not recorded"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Clinical Practice Details */}
          {["doctor", "nurse", "receptionist"].includes(user.role) && user.staff && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Professional Clinical Assignment</h3>
                  <p className="text-xs text-slate-400">Departmental affiliation and institutional credentialing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Building size={13} className="text-slate-400" /> Assigned Department
                  </span>
                  <p className="text-base font-bold text-slate-900 mt-1">{user.staff.department || "General Hospital Wing"}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Specialty</span>
                  <p className="text-base font-bold text-slate-900 mt-1">{user.staff.specialty || "General Practice"}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Staff Extension / Phone</span>
                  <p className="text-base font-bold text-slate-900 mt-1">{user.staff.phone || "Hospital Main"}</p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                <p className="font-bold">Credential Verification</p>
                <p className="mt-1 opacity-90">
                  Authorized to examine assigned patients, log biometric records, and participate in clinical rounds.
                </p>
              </div>
            </div>
          )}

          {/* Admin Privileges */}
          {user.role === "admin" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-fuchsia-50 text-fuchsia-600 rounded-xl">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Administrative Capabilities</h3>
                  <p className="text-xs text-slate-400">Security permissions and system controls</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                  <p className="text-sm font-bold text-slate-800">Staff Account Management</p>
                  <p className="text-xs text-slate-500">Create, configure, and manage credentials for physicians, nurses, and receptionists.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                  <p className="text-sm font-bold text-slate-800">Clinical Alert Rules</p>
                  <p className="text-xs text-slate-500">Configure biometric thresholds for systolic/diastolic blood pressure, glucose, and fever.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                  <p className="text-sm font-bold text-slate-800">Audit Trail Access</p>
                  <p className="text-xs text-slate-500">Inspect full audit logs of record modifications, login actions, and patient views.</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                  <p className="text-sm font-bold text-slate-800">System Security Enforcement</p>
                  <p className="text-xs text-slate-500">Enforce role-based access control and session encryption policies.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Security & Access */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Authentication & Security Settings</h3>
                <p className="text-xs text-slate-400">Credential protection and session management</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <KeyRound size={16} className="text-emerald-600" />
                  <span>Password Authentication</span>
                </div>
                <p className="text-xs text-slate-500">
                  Your account is secured via Better Auth salted bcrypt encryption.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    <Check size={12} /> Active & Secured
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Clock size={16} className="text-sky-600" />
                  <span>Session Policy</span>
                </div>
                <p className="text-xs text-slate-500">
                  Sessions are stored with secure cookies and expire automatically on inactivity.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-[11px] font-bold">
                    Single Active Session
                  </span>
                </div>
              </div>
            </div>

            {user.sessions && user.sessions.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Recent Session Log
                </h4>
                <div className="space-y-2">
                  {user.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800">{sess.userAgent || "Web Browser"}</p>
                        <p className="text-slate-400">IP: {sess.ipAddress || "Localhost"}</p>
                      </div>
                      <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                        Current
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
