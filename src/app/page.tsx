import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  HeartPulse,
  Activity,
  Shield,
  Stethoscope,
  Calendar,
  Users,
  Pill,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Baby,
  Zap,
  BarChart3,
  Clock,
  Lock,
  ChevronRight,
  Building2,
  BellRing,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* ────────────────── Header / Navigation ────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartPulse size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                HMS
              </span>
              <span className="text-xs block font-semibold uppercase tracking-wider text-emerald-600 -mt-1">
                Clinical Health
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              Clinical Features
            </a>
            <a href="#workflows" className="hover:text-emerald-700 transition-colors">
              Role Workflows
            </a>
            <a href="#security" className="hover:text-emerald-700 transition-colors">
              Security & Compliance
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-emerald-600/20 flex items-center gap-2 group"
              >
                <span>Dashboard ({session.user.name.split(" ")[0]})</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-2"
                >
                  <span>Patient Register</span>
                  <ChevronRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ────────────────── Hero Section ────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/40 via-teal-200/30 to-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles size={14} className="text-emerald-600" />
              Next-Generation Hospital & Clinical Care
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Unified Clinical Management,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                Elevated Care.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Empower clinicians, protect patients, and streamline healthcare operations with real-time biometric telemetry, risk alerts, digital consultations, and prescription workflows.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
                >
                  <Activity size={18} />
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
                  >
                    <span>Enter Clinical Portal</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                  >
                    <span>Patient Self-Enrollment</span>
                  </Link>
                </>
              )}
            </div>

            {/* Micro badges below CTA */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Role-Based Access Control (RBAC)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Real-Time Clinical Alert Engine
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Audit Trail Compliance
              </span>
            </div>
          </div>

          {/* ─── Hero Visual Floating Showcase Card ─── */}
          <div className="mt-16 max-w-5xl mx-auto relative">
            <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-slate-200/80">
              {/* Fake Browser/App Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-400 ml-2">hms.healthcare.local / clinical-hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Tele-Engine Active
                  </span>
                </div>
              </div>

              {/* Showcase Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Live Vitals Telemetry</span>
                    <Activity size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-800">120/80 <span className="text-xs font-normal text-slate-400">mmHg</span></p>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Blood pressure normalized
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-rose-50/30 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Automated Alert Engine</span>
                    <BellRing size={16} className="text-rose-500" />
                  </div>
                  <p className="text-2xl font-black text-rose-600">0 Critical</p>
                  <p className="text-xs text-slate-500">Maternal & vitals threshold checks</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/30 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Digital Consultations</span>
                    <Stethoscope size={16} className="text-sky-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-800">E-Rx Ready</p>
                  <p className="text-xs text-slate-500">Integrated diagnosis & prescriptions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 6 Core Pillars ────────────────── */}
      <section id="features" className="py-20 md:py-28 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Enterprise Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for Clinical Precision & Operational Agility
            </p>
            <p className="text-slate-500 text-base">
              Every feature is architected for patient safety, clinician speed, and administrative rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <HeartPulse size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Patient Records & Portal</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comprehensive electronic medical files, demographic records, allergies, known conditions, lifestyle tracking, and patient self-service.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Doctor Consultations</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Structured clinical encounter logs, chief complaints, ICD diagnostic documentation, and seamless patient medical history access.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BellRing size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Automated Risk Alerts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time rule engine automatically evaluating systolic/diastolic BP, fever, and blood sugar, alerting physicians to critical deviations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Pill size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Digital E-Prescriptions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Multi-item prescription entries tied directly to consultations, including drug dosage, frequency, duration, and patient instructions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Baby size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Maternal Health Tracking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Specialized antenatal and postnatal care logging, gestational age calculations, fundal height tracking, and fetal monitoring telemetry.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Audit Trails & Governance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Immutable system audit logging capturing patient file access, user credentials, role changes, and compliance events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── Role Workflows ────────────────── */}
      <section id="workflows" className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600">Tailored Experiences</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Dedicated Portal for Every Healthcare Role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Patients */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                  Patients
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Personal Health Portal</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>View upcoming appointments & provider details</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Monitor blood pressure & biometric trend graphs</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Access active e-prescriptions and doctor instructions</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5"
              >
                Register as Patient <ArrowRight size={14} />
              </Link>
            </div>

            {/* For Doctors & Nurses */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Physicians & Nurses
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Clinical Operations Hub</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Real-time patient schedule & daily appointment queues</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Rapid consultation recording & digital e-prescribing</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>High-priority alert notifications on physiological risk</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5"
              >
                Clinician Login <ArrowRight size={14} />
              </Link>
            </div>

            {/* For Administrators */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100">
                  Administrators
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Facility Governance</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Staff provisioning with role and department assignments</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Customizable alert rules and clinical thresholds</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>Comprehensive compliance audit trails & system status</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1.5"
              >
                Administrative Portal <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── Security & Trust Banner ────────────────── */}
      <section id="security" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-bold text-sm">
                <Lock size={18} /> Better Auth Security
              </div>
              <p className="text-xs text-slate-400">
                Salted credential hashing and secure HTTP-only cookie sessions.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck size={18} /> Role Enforcement
              </div>
              <p className="text-xs text-slate-400">
                Server-side RBAC protection preventing unauthorized clinical actions.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-bold text-sm">
                <Activity size={18} /> 99.9% Uptime Engine
              </div>
              <p className="text-xs text-slate-400">
                Resilient MongoDB database adapter with reactive schema integrity.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-bold text-sm">
                <FileText size={18} /> Full Audit Trail
              </div>
              <p className="text-xs text-slate-400">
                Traceable timestamps and user accountability on every encounter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── CTA Section ────────────────── */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience Modern Healthcare Management?
          </h2>
          <p className="text-emerald-100 text-base sm:text-lg max-w-xl mx-auto">
            Connect patients, clinicians, and hospital teams on a single unified platform.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/login"}
              className="px-8 py-3.5 rounded-2xl bg-white text-emerald-800 font-bold text-base shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <span>{session ? "Enter Your Dashboard" : "Sign In to Portal"}</span>
              <ArrowRight size={18} />
            </Link>
            {!session && (
              <Link
                href="/register"
                className="px-8 py-3.5 rounded-2xl bg-emerald-600/70 border border-white/30 text-white font-bold text-base hover:bg-emerald-600/90 transition-all"
              >
                Create Patient Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ────────────────── Footer ────────────────── */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <HeartPulse size={16} />
            </div>
            <span className="font-bold tracking-tight">HMS</span>
            <span className="text-xs text-slate-400">&bull; Health Management System</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <Link href="/login" className="hover:text-emerald-700 transition-colors">
              Staff & Patient Login
            </Link>
            <Link href="/register" className="hover:text-emerald-700 transition-colors">
              Register Patient
            </Link>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              System Operational
            </span>
          </div>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} HMS Healthcare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
