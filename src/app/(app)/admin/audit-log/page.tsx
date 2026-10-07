import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { FileText, Search } from "lucide-react";

export default async function AuditLogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireRole("admin");
  const { q } = await searchParams;
  
  const logs = await prisma.auditLog.findMany({
    where: q ? {
      OR: [
        { action: { contains: q, mode: 'insensitive' } },
        { entity: { contains: q, mode: 'insensitive' } },
      ]
    } : undefined,
    orderBy: { timestamp: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-emerald-600" /> System Audit Log
          </h1>
          <p className="text-slate-500 mt-1">Immutable record of all system events. Showing last 100 entries.</p>
        </div>
        <form className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="Search action or entity..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No logs found matching your search.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{log.entity || "-"}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{log.user?.name || "SYSTEM"}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 max-w-[200px] truncate" title={JSON.stringify(log.details)}>
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
