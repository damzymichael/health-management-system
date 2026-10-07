import { prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, Lock, Mail, User } from "lucide-react";
import { hashPassword } from "better-auth/crypto";
import { requireRole } from "@/lib/rbac";
import { ObjectId } from "bson";

export default async function NewStaffPage() {
  await requireRole("admin"); // only admin can see this

  async function createStaff(formData: FormData) {
    "use server";
    await requireRole("admin");

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const specialty = formData.get("specialty") as string;
    const department = formData.get("department") as string;

    const hashedPassword = await hashPassword(password);

    const userId = new ObjectId().toString()
    const accountId = new ObjectId().toString()
    
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          name,
          email: email.toLowerCase(),
          role,
          isActive: true
        }
      });

      await tx.account.create({
        data: {
          id: accountId,
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: hashedPassword
        }
      });

      if (role === "doctor" || role === "nurse" || role === "receptionist") {
        await tx.staff.create({
          data: {
            userId: user.id,
            fullName: name,
            specialty: specialty || undefined,
            department: department || undefined,
          }
        });
      }
    });

    redirect("/admin/users");
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="text-emerald-600" /> Register New Staff
        </h1>
        <p className="text-slate-500 mt-1">Create an account for a new employee.</p>
      </header>

      <form action={createStaff} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" name="name" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="e.g. Dr. Jane Doe" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="email" name="email" required className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="jane@hms.demo" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" name="password" required minLength={8} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="e.g. Password123!" />
          </div>
          <p className="text-xs text-slate-500 mt-1">Share this password securely with the staff member.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select name="role" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 bg-white">
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="receptionist">Receptionist</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
            <input type="text" name="specialty" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <input type="text" name="department" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="Optional" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors">
            Create Staff Account
          </button>
        </div>
      </form>
    </div>
  );
}
