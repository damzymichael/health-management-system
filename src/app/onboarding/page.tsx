"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (isPending) return <div className="min-h-screen flex items-center justify-center bg-sky-50 text-emerald-600">Loading...</div>;
  if (!session) {
    router.push("/login");
    return null;
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In a real app, this would call a Server Action to create the Patient profile
    // For now, we mock the success and redirect
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 py-12 px-4 transition-colors duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all hover:shadow-2xl duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Complete Your Profile</h1>
          <p className="text-slate-500 mt-2">Welcome {session.user.name}. We need a few more details to set up your health record.</p>
        </div>
        
        <form onSubmit={handleComplete} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all bg-white text-slate-900">
                <option value="">Select...</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input type="tel" placeholder="+234..." required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group (Optional)</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all bg-white text-slate-900">
                <option value="">Select...</option>
                <option value="A+">A+</option>
                <option value="O+">O+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 flex justify-center items-center shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving Profile...
                </span>
              ) : "Save and Continue to Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
