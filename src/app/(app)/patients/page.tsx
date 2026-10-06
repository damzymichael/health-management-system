import { requireRole } from "@/lib/rbac";
import { getPatients } from "@/modules/patients";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { audit } from "@/modules/audit";

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await requireRole("doctor", "nurse", "receptionist", "admin");
  const q = (await searchParams).q || "";
  
  const { patients, total } = await getPatients(q);

  // Audit this view action
  await audit({
    userId: session.user.id,
    action: "PATIENT_LIST_VIEW",
    details: { query: q },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patients</h1>
          <p className="text-slate-500">Manage patient records ({total} total)</p>
        </div>
        {["receptionist", "admin"].includes(session.user.role) && (
          <Link href="/patients/new" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm flex items-center gap-2">
            <Plus size={18} /> Register Patient
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <form className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              name="q" 
              defaultValue={q}
              placeholder="Search by name, ID or phone..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm text-slate-900"
            />
          </form>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Patient ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Gender / DOB</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No patients found matching your search.
                  </td>
                </tr>
              ) : (
                patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                      <Link href={`/patients/${p.id}`}>{p.patientNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{p.fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {p.gender} • {new Date(p.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.phone || "N/A"}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/patients/${p.id}`} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                        View Record
                      </Link>
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
