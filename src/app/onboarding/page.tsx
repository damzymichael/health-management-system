"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { upsertPatientProfile } from "@/modules/patients/actions";

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"FEMALE" | "MALE" | "OTHER">("FEMALE");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const router = useRouter();

  if (isPending) return <div className="min-h-screen flex items-center justify-center bg-sky-50 text-emerald-600">Loading...</div>;
  if (!session) {
    router.push("/login");
    return null;
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await upsertPatientProfile({
        userId: session.user.id,
        fullName: session.user.name,
        dateOfBirth: dob || "2000-01-01",
        gender,
        phone,
        bloodGroup: bloodGroup || undefined,
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err?.message || "Failed to save profile");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 py-12 px-4 transition-colors duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all hover:shadow-2xl duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Complete Your Profile</h1>
          <p className="text-slate-500 mt-2">Welcome {session.user.name}. We need a few more details to set up your health record.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}
        
        <form onSubmit={handleComplete} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value as "FEMALE" | "MALE" | "OTHER")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all bg-white text-slate-900"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group (Optional)</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all bg-white text-slate-900"
              >
                <option value="">Select...</option>
                <option value="A+">A+</option>
                <option value="O+">O+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="A-">A-</option>
                <option value="O-">O-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 flex justify-center items-center shadow-md hover:shadow-lg disabled:opacity-70"
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
