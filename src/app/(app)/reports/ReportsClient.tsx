"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function ReportsClient({ appointments, alerts }: { appointments: any[], alerts: any[] }) {
  const statusColors: any = {
    SCHEDULED: '#3b82f6',
    CONFIRMED: '#f59e0b',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444',
    MISSED: '#64748b'
  };

  const severityColors: any = {
    INFO: '#38bdf8',
    HIGH: '#f59e0b',
    CRITICAL: '#e11d48'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Appointments by Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={appointments}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {appointments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Risk Alerts by Severity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={alerts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="severity"
              >
                {alerts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={severityColors[entry.severity] || '#cbd5e1'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2 text-sm text-slate-600">
          {alerts.map(a => (
            <div key={a.severity} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: severityColors[a.severity] }}></div>
              {a.severity} ({a.count})
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
