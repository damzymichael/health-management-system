import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import Link from "next/link";
import {
  Calendar,
  Users,
  Activity,
  ShieldAlert,
  Clock,
  HeartPulse,
  UserPlus,
  ArrowRight,
  FileText,
  Shield,
  Stethoscope,
  Pill,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Building,
} from "lucide-react";
import { StaffDashboardCharts, PatientDashboardCharts } from "./DashboardCharts";

export default async function DashboardPage() {
  const session = await requireSession();
  const role = session.user.role;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Common stats
  const [
    patientsCount,
    openAlertsCount,
    todayAppts,
    activeStaff,
    patientData,
    patientNextAppts,
    patientLatestVitals,
    patientVitalsList,
    patientPrescriptions,
    todayApptsList,
    openAlertsList,
    todayConsultationsCount,
    recentAuditLogs,
    recentStaffList,
    appointmentsAgg,
    alertsAgg,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.alert.count({ where: { status: "OPEN" } }),
    prisma.appointment.count({
      where: {
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
    }),
    prisma.staff.count(),
    // Patient queries
    role === "patient"
      ? prisma.patient.findUnique({
          where: { userId: session.user.id },
        })
      : Promise.resolve(null),
    role === "patient"
      ? prisma.appointment.findMany({
          where: {
            patient: { userId: session.user.id },
            scheduledAt: { gte: new Date() },
            status: { in: ["SCHEDULED", "CONFIRMED"] },
          },
          orderBy: { scheduledAt: "asc" },
          take: 3,
          include: { staff: true },
        })
      : Promise.resolve([]),
    role === "patient"
      ? prisma.vitalsLabEntry.findFirst({
          where: { patient: { userId: session.user.id }, entryType: "VITALS" },
          orderBy: { recordedAt: "desc" },
        })
      : Promise.resolve(null),
    role === "patient"
      ? prisma.vitalsLabEntry.findMany({
          where: { patient: { userId: session.user.id }, entryType: "VITALS" },
          orderBy: { recordedAt: "desc" },
          take: 7,
        })
      : Promise.resolve([]),
    role === "patient"
      ? prisma.prescription.findMany({
          where: {
            consultation: { patient: { userId: session.user.id } },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: {
            consultation: {
              include: { staff: true },
            },
          },
        })
      : Promise.resolve([]),
    // Clinical queries (Doctor/Nurse)
    ["doctor", "nurse"].includes(role)
      ? prisma.appointment.findMany({
          where: {
            scheduledAt: { gte: todayStart, lte: todayEnd },
          },
          orderBy: { scheduledAt: "asc" },
          take: 5,
          include: { patient: true, staff: true },
        })
      : Promise.resolve([]),
    ["doctor", "nurse"].includes(role)
      ? prisma.alert.findMany({
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
          take: 4,
          include: { patient: true },
        })
      : Promise.resolve([]),
    ["doctor", "nurse"].includes(role)
      ? prisma.consultation.count({
          where: { visitDate: { gte: todayStart, lte: todayEnd } },
        })
      : Promise.resolve(0),
    // Admin queries
    ["admin", "receptionist"].includes(role)
      ? prisma.auditLog.findMany({
          orderBy: { timestamp: "desc" },
          take: 5,
          include: { user: true },
        })
      : Promise.resolve([]),
    ["admin", "receptionist"].includes(role)
      ? prisma.staff.findMany({
          orderBy: { createdAt: "desc" },
          take: 4,
          include: { user: true },
        })
      : Promise.resolve([]),
    // Chart aggregations for staff/admin
    role !== "patient"
      ? prisma.appointment.groupBy({ by: ["status"], _count: { id: true } })
      : Promise.resolve([]),
    role !== "patient"
      ? prisma.alert.groupBy({ by: ["severity"], _count: { id: true } })
      : Promise.resolve([]),
  ]);

  const appointmentsData = appointmentsAgg.map((a) => ({
    status: a.status,
    count: a._count.id,
  }));
  const alertsData = alertsAgg.map((a) => ({
    severity: a.severity,
    count: a._count.id,
  }));

  // ==========================================
  // PATIENT VIEW
  // ==========================================
  if (role === "patient") {
    const nextAppt = patientNextAppts[0];

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-8 md:p-10 shadow-lg">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold uppercase tracking-wider">
                <Sparkles size={14} className="text-emerald-300" /> Patient Health Portal
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Welcome back, {session.user.name}
              </h1>
              <p className="text-emerald-100/90 text-sm md:text-base max-w-xl">
                Here is your centralized medical summary. Stay informed on your schedule, track biometric trends, and review current prescriptions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/appointments/new"
                className="px-5 py-2.5 bg-white text-emerald-800 font-semibold text-sm rounded-xl hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2"
              >
                <Calendar size={16} /> Book Visit
              </Link>
              <Link
                href="/profile"
                className="px-5 py-2.5 bg-emerald-600/60 hover:bg-emerald-600/80 text-white border border-white/20 font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <HeartPulse size={16} /> Medical Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Top Key Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Next Appointment */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Calendar size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Next Visit
              </span>
            </div>

            {nextAppt ? (
              <div className="space-y-3">
                <p className="text-xl font-bold text-slate-800">
                  {new Date(nextAppt.scheduledAt).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Clock size={15} className="text-slate-400" />
                  {new Date(nextAppt.scheduledAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Provider:</span>
                  <span className="font-semibold text-slate-800">{nextAppt.staff.fullName}</span>
                </div>
              </div>
            ) : (
              <div className="py-5 text-center text-slate-400">
                <p className="text-sm font-medium">No upcoming appointments</p>
                <Link
                  href="/appointments/new"
                  className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  Schedule one now <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* Card 2: Latest Vitals Snapshot */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                <Activity size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                Latest Vitals
              </span>
            </div>

            {patientLatestVitals ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Blood Pressure</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {patientLatestVitals.bpSystolic && patientLatestVitals.bpDiastolic
                        ? `${patientLatestVitals.bpSystolic}/${patientLatestVitals.bpDiastolic}`
                        : "N/A"}{" "}
                      <span className="text-xs font-normal text-slate-400">mmHg</span>
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Temp</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      {patientLatestVitals.temperature ? `${patientLatestVitals.temperature}°C` : "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  Recorded on {new Date(patientLatestVitals.recordedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="py-5 text-center text-slate-400">
                <p className="text-sm font-medium">No biometric records logged</p>
                <p className="text-xs text-slate-400 mt-1">Vitals are logged during your checkups</p>
              </div>
            )}
          </div>

          {/* Card 3: Patient Profile Quick Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
                <HeartPulse size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-100">
                ID: {patientData?.patientNumber || "HMS"}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-slate-800">{patientData?.bloodGroup || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Allergies:</span>
                <span className="font-medium text-slate-800 truncate max-w-[140px]">
                  {patientData?.allergies && patientData.allergies.length > 0
                    ? patientData.allergies.join(", ")
                    : "None recorded"}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-400">Emergency Care 24/7</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Interactive Section */}
        <PatientDashboardCharts vitals={patientVitalsList} />

        {/* Two Column Grid: Upcoming Visits & Current Prescriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Upcoming Schedule */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Upcoming Appointments</h3>
                  <p className="text-xs text-slate-400">Scheduled clinical consultations</p>
                </div>
              </div>
              <Link
                href="/appointments"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {patientNextAppts.length === 0 ? (
              <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Calendar size={28} className="mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium">No future visits scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientNextAppts.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(app.scheduledAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(app.scheduledAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-slate-500">Doctor: {app.staff.fullName}</p>
                      {app.reason && <p className="text-xs text-slate-400 italic">"{app.reason}"</p>}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Prescriptions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Pill size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Recent Prescriptions</h3>
                  <p className="text-xs text-slate-400">Medications ordered by care providers</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View profile <ArrowRight size={12} />
              </Link>
            </div>

            {patientPrescriptions.length === 0 ? (
              <div className="py-10 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Pill size={28} className="mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium">No recent prescriptions recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/20 transition-all flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        {rx.drugName}{" "}
                        <span className="text-xs font-normal text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                          {rx.dosage}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Duration: {rx.duration} &bull; Dr. {rx.consultation.staff.fullName}
                      </p>
                      {rx.instructions && (
                        <p className="text-xs text-slate-500 italic mt-1">"{rx.instructions}"</p>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(rx.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CLINICAL VIEW (Doctor & Nurse)
  // ==========================================
  if (["doctor", "nurse"].includes(role)) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 text-white p-8 md:p-10 shadow-lg">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-teal-100 text-xs font-semibold uppercase tracking-wider">
                <Stethoscope size={14} className="text-teal-300" /> Clinical Operations Portal
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Welcome, {session.user.name}
              </h1>
              <p className="text-teal-100/90 text-sm md:text-base max-w-xl">
                Real-time patient census, risk alerting telemetry, and schedule management for clinical staff.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/appointments/new"
                className="px-4 py-2.5 bg-white text-slate-900 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2"
              >
                <Calendar size={16} className="text-emerald-600" /> New Appointment
              </Link>
              <Link
                href="/patients/new"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <UserPlus size={16} /> New Patient
              </Link>
              <Link
                href="/alerts"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <ShieldAlert size={16} /> View Alerts
              </Link>
            </div>
          </div>
        </div>

        {/* Clinical KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Visits</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Calendar size={20} />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-slate-800 mt-3">{todayAppts}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{todayApptsList.length}</span> scheduled on today's calendar
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Risk Alerts</span>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl relative">
                <ShieldAlert size={20} />
                {openAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                )}
              </div>
            </div>
            <p className="text-4xl font-extrabold text-slate-800 mt-3">{openAlertsCount}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-rose-600 font-semibold">{openAlertsList.filter(a => a.severity === "CRITICAL").length}</span> critical triggers
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Patients</span>
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                <Users size={20} />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-slate-800 mt-3">{patientsCount}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-sky-600 font-semibold">Active</span> facility patient registry
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Consults</span>
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
                <FileText size={20} />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-slate-800 mt-3">{todayConsultationsCount}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="text-teal-600 font-semibold">Logged</span> clinical encounters
            </p>
          </div>
        </div>

        {/* Two Column Layout: Today's Appointments & Active Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Today's Appointment Schedule</h3>
                  <p className="text-xs text-slate-400">Active consultations queued for today</p>
                </div>
              </div>
              <Link
                href="/appointments"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {todayApptsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Calendar size={32} className="mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-medium">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayApptsList.map((app) => (
                  <div key={app.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                    <div className="space-y-0.5">
                      <Link
                        href={`/patients/${app.patientId}`}
                        className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                      >
                        {app.patient.fullName}
                      </Link>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-medium text-slate-700">
                          {new Date(app.scheduledAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>&bull;</span>
                        <span>Provider: {app.staff.fullName}</span>
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        app.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : app.status === "CONFIRMED"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Alerts Feed */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Open Risk Triggers</h3>
                  <p className="text-xs text-slate-400">Patients requiring clinical triage</p>
                </div>
              </div>
              <Link
                href="/alerts"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                Review alerts <ArrowRight size={12} />
              </Link>
            </div>

            {openAlertsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-emerald-50/30 rounded-xl border border-dashed border-emerald-200">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-emerald-900">Zero active clinical alerts</p>
                <p className="text-xs text-emerald-600 mt-0.5">All monitored patient thresholds are normal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openAlertsList.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-rose-200 bg-slate-50/40 hover:bg-rose-50/20 transition-all flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/patients/${alt.patientId}`}
                          className="text-sm font-bold text-slate-800 hover:text-rose-600 transition-colors"
                        >
                          {alt.patient.fullName}
                        </Link>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            alt.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : alt.severity === "HIGH"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-sky-100 text-sky-700 border border-sky-200"
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{alt.message}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap pl-2">
                      {new Date(alt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <StaffDashboardCharts appointments={appointmentsData} alerts={alertsData} />
      </div>
    );
  }

  // ==========================================
  // MANAGEMENT / ADMIN VIEW
  // ==========================================
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 text-white p-8 md:p-10 shadow-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <Shield size={14} className="text-indigo-400" /> System Control & Administration
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hospital Administration Console
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-xl">
              Facility metrics, clinical personnel configuration, security audit records, and system health status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/users/new"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <UserPlus size={16} /> Add Staff
            </Link>
            <Link
              href="/admin/audit-log"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
            >
              <History size={16} /> Audit Trail
            </Link>
            <Link
              href="/patients"
              className="px-4 py-2.5 bg-white text-slate-900 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2"
            >
              <Users size={16} className="text-slate-700" /> Patient Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Admin KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Patients</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-800 mt-3">{patientsCount}</p>
          <p className="text-xs text-slate-500 mt-2">Total registered health records</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Staff</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Stethoscope size={20} />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-800 mt-3">{activeStaff}</p>
          <p className="text-xs text-slate-500 mt-2">Doctors, nurses & receptionists</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Appointments</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-4xl font-extrabold text-slate-800 mt-3">{todayAppts}</p>
          <p className="text-xs text-slate-500 mt-2">Appointments scheduled today</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Infrastructure</span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Building size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-2xl font-bold text-slate-800">Operational</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">MongoDB & Better Auth connected</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Audit Activity & Medical Staff Directory Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Log Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <History size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Recent Audit Logs</h3>
                <p className="text-xs text-slate-400">Security & compliance events</p>
              </div>
            </div>
            <Link
              href="/admin/audit-log"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Full log <ArrowRight size={12} />
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <History size={32} className="mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No audit logs recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                        {log.action}
                      </span>
                      <span>by {log.user?.name || "System"}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Entity: {log.entity || "General"} {log.entityId ? `(#${log.entityId.slice(-6)})` : ""}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Directory Snapshot */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Medical Staff Roster</h3>
                <p className="text-xs text-slate-400">Active clinicians and providers</p>
              </div>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Manage staff <ArrowRight size={12} />
            </Link>
          </div>

          {recentStaffList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Users size={32} className="mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No staff members created yet</p>
              <Link
                href="/admin/users/new"
                className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                Create first staff account <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentStaffList.map((st) => (
                <div key={st.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {st.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{st.fullName}</p>
                      <p className="text-xs text-slate-400">
                        {st.department || "General"} &bull; {st.specialty || "General Practice"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts */}
      <StaffDashboardCharts appointments={appointmentsData} alerts={alertsData} />
    </div>
  );
}
