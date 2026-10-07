"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Activity, ShieldAlert, HeartPulse, Thermometer, CalendarCheck2 } from "lucide-react";

interface StatusData {
  status: string;
  count: number;
}

interface AlertData {
  severity: string;
  count: number;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "#0284c7", // Sky 600
  CONFIRMED: "#0d9488", // Teal 600
  COMPLETED: "#10b981", // Emerald 500
  CANCELLED: "#f43f5e", // Rose 500
  MISSED: "#64748b",    // Slate 500
};

const severityColors: Record<string, string> = {
  INFO: "#38bdf8",     // Light blue
  HIGH: "#f59e0b",     // Amber
  CRITICAL: "#ef4444", // Red
};

export function StaffDashboardCharts({
  appointments,
  alerts,
}: {
  appointments: StatusData[];
  alerts: AlertData[];
}) {
  const totalAppointments = appointments.reduce((sum, item) => sum + item.count, 0);
  const totalAlerts = alerts.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Appointments by Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <CalendarCheck2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Appointments by Status</h3>
                <p className="text-xs text-slate-400">Current schedule distribution</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
              {totalAppointments} Total
            </span>
          </div>

          {appointments.length === 0 || totalAppointments === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <CalendarCheck2 size={36} className="text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No appointments to analyze yet</p>
            </div>
          ) : (
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointments} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="status"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                      padding: "8px 12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {appointments.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.status] || "#94a3b8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {appointments.map((item) => (
            <div
              key={item.status}
              className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusColors[item.status] || "#94a3b8" }}
              />
              <span className="capitalize">{item.status.toLowerCase()}</span>:
              <span className="font-semibold text-slate-800">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts by Severity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Risk Alerts by Severity</h3>
                <p className="text-xs text-slate-400">Clinical monitoring flags</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-100">
              {totalAlerts} Active
            </span>
          </div>

          {alerts.length === 0 || totalAlerts === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 bg-emerald-50/40 rounded-xl border border-dashed border-emerald-200">
              <Activity size={36} className="text-emerald-500 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-emerald-800">All alerts clear</p>
              <p className="text-xs text-emerald-600 mt-0.5">No unresolved patient risk triggers</p>
            </div>
          ) : (
            <div className="h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alerts}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="severity"
                  >
                    {alerts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={severityColors[entry.severity] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "12px",
                      padding: "8px 12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center donut label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">{totalAlerts}</span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Alerts</span>
              </div>
            </div>
          )}
        </div>

        {/* Severity Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-slate-100">
          {alerts.map((a) => (
            <div
              key={a.severity}
              className="flex items-center gap-2 text-xs font-medium text-slate-600 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: severityColors[a.severity] }}
              />
              <span>{a.severity}</span>
              <span className="font-bold text-slate-900">({a.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PatientDashboardCharts({ vitals }: { vitals: any[] }) {
  const [activeTab, setActiveTab] = useState<"bp" | "temp">("bp");

  if (!vitals || vitals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 mt-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <HeartPulse size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Vitals Trends Recorded Yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Whenever your clinical care team measures your blood pressure, temperature, or heart rate, you will see your interactive trends graphed here.
          </p>
        </div>
      </div>
    );
  }

  const data = [...vitals]
    .reverse()
    .map((v) => ({
      date: new Date(v.recordedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      systolic: v.bpSystolic,
      diastolic: v.bpDiastolic,
      temp: v.temperature,
      pulse: v.pulse,
    }));

  const latest = vitals[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mt-8 hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Biometric Health Trends</h3>
              <p className="text-xs text-slate-400">Historical physiological recordings</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("bp")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "bp"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HeartPulse size={14} /> Blood Pressure
          </button>
          <button
            onClick={() => setActiveTab("temp")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "temp"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Thermometer size={14} /> Temp & Pulse
          </button>
        </div>
      </div>

      {/* Snapshot badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Latest BP</span>
          <p className="text-lg font-black text-slate-800 mt-0.5">
            {latest?.bpSystolic && latest?.bpDiastolic ? `${latest.bpSystolic}/${latest.bpDiastolic}` : "—"}{" "}
            <span className="text-xs font-normal text-slate-400">mmHg</span>
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Temperature</span>
          <p className="text-lg font-black text-slate-800 mt-0.5">
            {latest?.temperature ? `${latest.temperature}°C` : "—"}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pulse</span>
          <p className="text-lg font-black text-slate-800 mt-0.5">
            {latest?.pulse ? `${latest.pulse}` : "—"}{" "}
            <span className="text-xs font-normal text-slate-400">bpm</span>
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Readings</span>
          <p className="text-lg font-black text-emerald-600 mt-0.5">
            {vitals.length}{" "}
            <span className="text-xs font-normal text-slate-400">logged</span>
          </p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "bp" ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} domain={["dataMin - 10", "dataMax + 10"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "12px",
                  padding: "8px 12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Systolic (mmHg)"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0284c7", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic (mmHg)"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis yAxisId="temp" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} domain={[35, 40]} />
              <YAxis yAxisId="pulse" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} domain={[40, 140]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "12px",
                  padding: "8px 12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                name="Temp (°C)"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="pulse"
                type="monotone"
                dataKey="pulse"
                name="Pulse (bpm)"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
