"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { upsertPatientProfile } from "@/modules/patients/actions";
import { HeartPulse, User, Mail, Lock, Calendar, Phone, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"FEMALE" | "MALE" | "OTHER">("FEMALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signUp.email({
        email,
        password,
        name,
      });

      if (res.error) {
        setError(res.error.message || "Failed to register account");
        setLoading(false);
        return;
      }

      // Immediately create or update the Patient record for this new user
      if (res.data?.user?.id) {
        await upsertPatientProfile({
          userId: res.data.user.id,
          fullName: name,
          gender,
          dateOfBirth: dateOfBirth || "2000-01-01",
          phone: phone || undefined,
        });
      }

      // Successfully registered and patient record created
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.message || "An unexpected error occurred during registration");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 transition-colors duration-500">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80 w-full max-w-lg transform transition-all duration-300">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-500/20">
            <HeartPulse size={26} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Registration</h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Create your personal health record and patient account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 text-sm"
                placeholder="Jane Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 text-sm"
                placeholder="jane@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 text-sm"
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Date of Birth *
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "FEMALE" | "MALE" | "OTHER")}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white text-slate-900 text-sm"
                required
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 text-sm"
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-70 flex justify-center items-center shadow-md shadow-emerald-600/20 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Health Record...
                </span>
              ) : (
                "Create Account & Medical File"
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
