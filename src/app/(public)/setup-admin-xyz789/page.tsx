import { prisma } from "@/lib/auth";
import { hashPassword } from "better-auth/crypto";
import { redirect } from "next/navigation";
import { Shield, Key } from "lucide-react";
import { ObjectId } from "bson";

export default function SetupAdminPage() {
  async function createInitialAdmin(formData: FormData) {
    "use server";
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    
    // Quick check if any admin exists to prevent abuse
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount > 0) {
      redirect("/login");
    }

    const hashedPassword = await hashPassword(password);

    const userId = new ObjectId().toString()
    const accountId = new ObjectId().toString()

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          name,
          email: email.toLowerCase(),
          role: "admin",
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
    });

    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 transform -rotate-6">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Setup</h1>
          <p className="text-slate-500 text-sm mt-2">Create the first system administrator account. This page will lock once an admin exists.</p>
        </div>

        <form action={createInitialAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="System Administrator" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
            <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="admin@hms.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Secure Password</label>
            <input type="password" name="password" required minLength={8} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mt-6">
            <Key size={18} /> Initialize System
          </button>
        </form>
      </div>
    </div>
  );
}
