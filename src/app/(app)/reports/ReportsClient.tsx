"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  BarChart3,
  Calendar,
  Users,
  AlertTriangle,
  HeartPulse,
  Download,
  Activity,
  CheckCircle,
  Clock,
  Shield,
  FileSpreadsheet,
  ArrowUpRight,
  Info
} from "lucide-react";
import type { ReportsAnalyticsData } from "@/modules/reports";

interface ReportsClientProps {
  data?: ReportsAnalyticsData;
  userRole?: string;
  selectedMonths?: number;
}

export function ReportsClient({ data, userRole = "staff", selectedMonths = 6 }: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "alerts" | "clinical">("overview");

  const kpis = data?.kpis || {
    totalPatients: 0,
    patientsSeenThisMonth: 0,
    totalConsultations: 0,
    totalAppointments: 0,
    missedAppointments: 0,
    missedRatePercent: 0,
    totalAlerts: 0,
    openAlerts: 0,
    criticalAlerts: 0,
    totalAntenatalRecords: 0
  };

  const monthlyTrends = data?.monthlyTrends || [];
  const appointmentsByStatus = data?.appointmentsByStatus || [];
  const alertsBySeverity = data?.alertsBySeverity || [];
  const alertsByStatus = data?.alertsByStatus || [];
  const topDiagnoses = data?.topDiagnoses || [];

  const statusColors: Record<string, string> = {
    SCHEDULED: "#3b82f6", // blue
    CONFIRMED: "#0ea5e9", // sky
    COMPLETED: "#10b981", // emerald
    CANCELLED: "#f43f5e", // rose
    MISSED: "#64748b"    // slate
  };

  const severityColors: Record<string, string> = {
    CRITICAL: "#ef4444", // rose
    HIGH: "#f59e0b",     // amber
    INFO: "#0284c7"      // sky
  };

  // CSV Export utility
  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportMonthlySummary = () => {
    const headers = [
      "Month",
      "Consultations",
      "Distinct Patients Seen",
      "Total Appointments",
      "Missed Appointments",
      "Antenatal Records",
      "Alerts Raised"
    ];
    const rows = (monthlyTrends || []).map(m => [
      m.monthLabel,
      m.consultationsCount,
      m.distinctPatientsSeen,
      m.appointmentsCount,
      m.missedAppointmentsCount,
      m.antenatalRecordsCount,
      m.alertsCount
    ]);
    downloadCsv("HMS_Monthly_Operations_Summary", headers, rows);
  };

  const exportAppointments = () => {
    const headers = ["Status", "Count", "Percentage of Total"];
    const total = kpis.totalAppointments || 1;
    const rows = (appointmentsByStatus || []).map(s => [
      s.status,
      s.count,
      `${Math.round((s.count / total) * 100)}%`
    ]);
    downloadCsv("HMS_Appointments_Breakdown", headers, rows);
  };

  const exportDiagnoses = () => {
    const headers = ["Diagnosis Condition", "Frequency Count", "Share (%)"];
    const totalConsults = kpis.totalConsultations || 1;
    const rows = (topDiagnoses || []).map(d => [
      d.diagnosis,
      d.count,
      `${Math.round((d.count / totalConsults) * 100)}%`
    ]);
    downloadCsv("HMS_Top_Diagnoses_Report", headers, rows);
  };

  const exportAlerts = () => {
    const headers = ["Severity", "Open Count", "Resolved/Acknowledged Count"];
    const rows = (alertsBySeverity || []).map(a => [
      a.severity,
      a.count,
      "Aggregated in system"
    ]);
    downloadCsv("HMS_Risk_Alerts_Summary", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="text-emerald-600" size={28} /> Analytics & Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              {userRole} view
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Aggregated clinical flow, operational throughput, and automated risk metrics.
          </p>
        </div>

        {/* Timeframe & Export Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {[3, 6, 12].map(m => (
              <Link
                key={m}
                href={`/reports?months=${m}`}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedMonths === m
                    ? "bg-white text-emerald-700 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Last {m}M
              </Link>
            ))}
          </div>

          <div className="relative group">
            <button
              onClick={exportMonthlySummary}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Admin Privacy & Compliance Banner */}
      {userRole === "admin" && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-slate-700 text-sm">
          <Shield className="text-emerald-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <span className="font-semibold text-slate-900">Confidentiality & Compliance Guard:</span>{" "}
            This administrator dashboard presents anonymized aggregate metrics only. Individual patient identity and clinical consultation notes are strictly withheld from administrative roles per hospital privacy policy.
          </div>
        </div>
      )}

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Patients</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{kpis.totalPatients}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Registered facility-wide
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Patients Seen (Mo)</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{kpis.patientsSeenThisMonth}</div>
            <p className="text-xs text-slate-500 mt-1">
              {kpis.totalConsultations} total consults ({selectedMonths}M)
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{kpis.totalAppointments}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                kpis.missedRatePercent > 20
                  ? "bg-rose-100 text-rose-700"
                  : kpis.missedRatePercent > 10
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {kpis.missedRatePercent}% missed
              </span>
              <span className="text-xs text-slate-400">({kpis.missedAppointments} missed)</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Open Risk Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{kpis.openAlerts}</div>
            <p className="text-xs text-slate-500 mt-1">
              {kpis.criticalAlerts} critical flag{kpis.criticalAlerts === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Antenatal Care</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <HeartPulse size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{kpis.totalAntenatalRecords}</div>
            <p className="text-xs text-slate-500 mt-1">
              Maternal records logged
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Monthly Throughput & Antenatal Visits */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Visits & Antenatal Activity</h3>
              <p className="text-xs text-slate-500">Monthly consultation volume vs antenatal registrations</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
              Trend ({selectedMonths}M)
            </span>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="consultGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="antenatalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="monthLabel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consultationsCount"
                  name="Consultations"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#consultGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="antenatalRecordsCount"
                  name="Antenatal Care"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#antenatalGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Consultations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>Antenatal Care Records</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Appointment Status & Retention */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Appointments by Operational Status</h3>
              <p className="text-xs text-slate-500">Attendance completion vs missed appointments</p>
            </div>
            <button
              onClick={exportAppointments}
              className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
            >
              <Download size={13} /> CSV
            </button>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                  }}
                />
                <Bar dataKey="count" name="Appointments" radius={[6, 6, 0, 0]}>
                  {appointmentsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-appt-${index}`}
                      fill={statusColors[entry.status] || "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            {appointmentsByStatus.map(s => (
              <div key={s.status} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: statusColors[s.status] || "#94a3b8" }}
                ></span>
                <span className="capitalize">{s.status.toLowerCase()}</span>: <strong className="text-slate-800">{s.count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Risk Alerts by Severity & Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Clinical Risk Alerts Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution by severity classification</p>
            </div>
            <button
              onClick={exportAlerts}
              className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
            >
              <Download size={13} /> CSV
            </button>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {alertsBySeverity.reduce((acc, curr) => acc + curr.count, 0) === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
                <p className="text-sm font-medium text-slate-600">No alerts triggered in this window</p>
                <p className="text-xs text-slate-400 mt-1">All vitals readings within normal limits</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertsBySeverity}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="severity"
                  >
                    {alertsBySeverity.map((entry, index) => (
                      <Cell
                        key={`cell-alert-${index}`}
                        fill={severityColors[entry.severity] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center text-xs">
            {alertsBySeverity.map(a => (
              <div key={a.severity} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-center gap-1.5 font-bold mb-1" style={{ color: severityColors[a.severity] }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[a.severity] }}></span>
                  {a.severity}
                </div>
                <div className="text-lg font-bold text-slate-900">{a.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Top 10 Clinical Diagnoses */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Top 10 Diagnoses</h3>
              <p className="text-xs text-slate-500">Most frequent clinical presentations in timeframe</p>
            </div>
            <button
              onClick={exportDiagnoses}
              className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
            >
              <Download size={13} /> CSV
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {topDiagnoses.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Info className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm font-medium text-slate-600">No diagnoses recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">Consultation diagnoses will populate here</p>
              </div>
            ) : (
              <div className="space-y-3 my-2">
                {topDiagnoses.slice(0, 6).map((item, index) => {
                  const maxCount = topDiagnoses[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.diagnosis} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[220px]">
                          {index + 1}. {item.diagnosis}
                        </span>
                        <span className="text-slate-500 font-mono">{item.count} cases</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 text-center mt-4 pt-3 border-t border-slate-100">
            Ranked by documented diagnosis from doctor consultation records
          </div>
        </div>

      </div>

      {/* Comprehensive Operational Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-600" size={20} />
              Monthly Operational Activity Log
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Consolidated month-by-month summary of consultations, attendance retention, antenatal care, and flags.
            </p>
          </div>

          <button
            onClick={exportMonthlySummary}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Download size={14} /> Download Table CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4 text-center">Consultations</th>
                <th className="px-6 py-4 text-center">Patients Seen</th>
                <th className="px-6 py-4 text-center">Appointments</th>
                <th className="px-6 py-4 text-center">Missed (Rate)</th>
                <th className="px-6 py-4 text-center">Antenatal Records</th>
                <th className="px-6 py-4 text-center">Alerts Fired</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyTrends.map((row) => {
                const missedRate = row.appointmentsCount > 0
                  ? Math.round((row.missedAppointmentsCount / row.appointmentsCount) * 100)
                  : 0;

                return (
                  <tr key={row.monthKey} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {row.monthLabel}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-800">
                      {row.consultationsCount}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs">
                        {row.distinctPatientsSeen} distinct
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-800">
                      {row.appointmentsCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        missedRate > 20
                          ? "bg-rose-100 text-rose-700"
                          : missedRate > 10
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {row.missedAppointmentsCount} ({missedRate}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-purple-700">
                      {row.antenatalRecordsCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.alertsCount > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {row.alertsCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
