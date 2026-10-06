import { requireSession } from "@/lib/rbac";

export default async function DashboardPage() {
  const session = await requireSession();
  const role = session.user.role;

  if (role === "patient") {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hello, {session.user.name}</h1>
          <p className="text-slate-500 mt-1">Here is your health overview.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800">Next Appointment</h3>
            <div className="mt-4 flex flex-col items-center justify-center h-24 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-sm">No upcoming appointments.</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800">Latest Vitals</h3>
            <div className="mt-4 flex flex-col items-center justify-center h-24 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-sm">No readings recorded yet.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "doctor" || role === "nurse") {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your patients and schedule.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Today's Appointments</h3>
            <p className="text-4xl font-bold text-slate-800 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Open Risk Alerts</h3>
            <p className="text-4xl font-bold text-slate-800 mt-2">0</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for Admin/Receptionist
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">{role} Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome to the management portal.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">System Status</h3>
          <p className="text-lg font-semibold text-emerald-600 mt-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
          </p>
        </div>
      </div>
    </div>
  );
}
