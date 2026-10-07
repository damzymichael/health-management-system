"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, Users, Calendar, Activity, Bell, Menu, X, BarChart, Shield, Settings, FileText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AppSidebar({ role, userName }: { role: string, userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h2 className="text-xl font-bold text-emerald-700 tracking-tight">HMS</h2>
        <button onClick={toggle} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={close} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-700 tracking-tight">HMS</h2>
            <p className="text-sm text-slate-500 capitalize mt-1 font-medium">{role} Portal</p>
          </div>
          <button onClick={close} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Links */}
          <Link href="/dashboard" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === "/dashboard" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          
          {["doctor", "nurse", "receptionist", "admin"].includes(role) && (
            <>
              <Link href="/patients" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/patients") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <Users size={20} /> Patients
              </Link>
              <Link href="/appointments" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/appointments") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <Calendar size={20} /> Appointments
              </Link>
            </>
          )}

          {["doctor", "nurse"].includes(role) && (
            <Link href="/alerts" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/alerts") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <Activity size={20} /> Risk Alerts
            </Link>
          )}

          {["doctor", "receptionist", "admin"].includes(role) && (
            <Link href="/reports" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/reports") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <BarChart size={20} /> Reports
            </Link>
          )}

          {role === "admin" && (
            <>
              <div className="px-4 py-2 mt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin</p>
              </div>
              <Link href="/admin/users" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/admin/users") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <Shield size={20} /> Manage Staff
              </Link>
              <Link href="/admin/alert-rules" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/admin/alert-rules") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <Settings size={20} /> Alert Rules
              </Link>
              <Link href="/admin/audit-log" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/admin/audit-log") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <FileText size={20} /> Audit Log
              </Link>
            </>
          )}

          {role === "patient" && (
            <>
              <Link href="/my/appointments" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/my/appointments") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <Calendar size={20} /> My Appointments
              </Link>
              <Link href="/my/records" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/my/records") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <Activity size={20} /> My Health Records
              </Link>
            </>
          )}
          
          <Link href="/notifications" onClick={close} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith("/notifications") ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Bell size={20} /> Notifications
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-700 rounded-xl bg-white border border-slate-200 shadow-sm transition-colors relative group">
            <Link href="/profile" onClick={close} className="absolute inset-0 z-0 rounded-xl hover:border-emerald-300 border border-transparent transition-colors" title="View Profile"></Link>
            
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold z-10 pointer-events-none">
              {userName.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 truncate z-10 pointer-events-none">
              <p className="text-sm font-semibold truncate text-slate-800">{userName}</p>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="text-slate-400 hover:text-rose-500 transition-colors z-10 p-1 rounded-md hover:bg-rose-50" 
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
