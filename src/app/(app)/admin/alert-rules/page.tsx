import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { Settings, Save, AlertTriangle } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AlertRulesAdminPage() {
  await requireRole("admin");
  const rules = await prisma.alertRule.findMany({
    orderBy: { code: 'asc' }
  });

  async function updateRule(formData: FormData) {
    "use server";
    await requireRole("admin");
    const id = formData.get("id") as string;
    const threshold = parseFloat(formData.get("threshold") as string);
    const enabled = formData.get("enabled") === "true";

    await prisma.alertRule.update({
      where: { id },
      data: { threshold, enabled }
    });

    revalidatePath("/admin/alert-rules");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="text-emerald-600" /> Alert Rules
          </h1>
          <p className="text-slate-500 mt-1">Configure thresholds for the clinical risk engine.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
        <AlertTriangle className="shrink-0" size={20} />
        <p><strong>Demo mode:</strong> These thresholds govern the automated alerts generated when vitals are saved. They are placeholders for the demo. <em>Not clinical guidance.</em></p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Rule Code</th>
                <th className="px-6 py-4">Metric & Operator</th>
                <th className="px-6 py-4">Threshold</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{rule.code}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold mr-2">{rule.metric}</span>
                    <span className="font-mono text-xs">{rule.operator}</span>
                  </td>
                  <td className="px-6 py-4">
                    <form action={updateRule} className="flex items-center gap-2" id={`form-${rule.id}`}>
                      <input type="hidden" name="id" value={rule.id} />
                      <input 
                        type="number" 
                        name="threshold" 
                        step="0.1"
                        defaultValue={rule.threshold}
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      rule.severity === "CRITICAL" ? "bg-rose-100 text-rose-700" :
                      rule.severity === "HIGH" ? "bg-amber-100 text-amber-700" :
                      "bg-sky-100 text-sky-700"
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      name="enabled" 
                      form={`form-${rule.id}`}
                      defaultValue={rule.enabled ? "true" : "false"}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none bg-white"
                    >
                      <option value="true">Enabled</option>
                      <option value="false">Disabled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      type="submit" 
                      form={`form-${rule.id}`}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium transition-colors text-xs flex items-center gap-1 inline-flex"
                    >
                      <Save size={14} /> Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
