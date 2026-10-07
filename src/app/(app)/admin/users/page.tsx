import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { Users as UsersIcon, Shield, Search, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function ManageUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireRole("admin");
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' }
  });

  async function toggleUserStatus(formData: FormData) {
    "use server";
    await requireRole("admin");
    const id = formData.get("id") as string;
    const isActive = formData.get("isActive") === "true";
    
    await prisma.user.update({
      where: { id },
      data: { isActive: !isActive }
    });

    // We don't delete sessions here to keep it simple, but in prod we would invalidate them
    revalidatePath("/admin/users");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="text-emerald-600" /> Manage Staff & Users
          </h1>
          <p className="text-slate-500 mt-1">Control access to the Precious HMS system.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <form className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.role === "admin" ? "bg-fuchsia-100 text-fuchsia-700" :
                      user.role === "doctor" ? "bg-emerald-100 text-emerald-700" :
                      user.role === "nurse" ? "bg-blue-100 text-blue-700" :
                      user.role === "receptionist" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium"><CheckCircle size={14}/> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500 font-medium"><XCircle size={14}/> Suspended</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={toggleUserStatus}>
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="isActive" value={user.isActive ? "true" : "false"} />
                      <button 
                        type="submit" 
                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                          user.isActive ? "bg-rose-50 hover:bg-rose-100 text-rose-700" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {user.isActive ? "Suspend" : "Activate"}
                      </button>
                    </form>
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
