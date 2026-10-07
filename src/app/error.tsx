"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-slate-500 mt-2 text-sm">We encountered an unexpected error. Please try again or return to safety.</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200 overflow-auto max-h-32">
          <p className="text-xs font-mono text-slate-600 break-all">{error.message || "Unknown Application Error"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors text-sm"
          >
            <RefreshCcw size={16} /> Try Again
          </button>
          
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-xl transition-colors text-sm"
          >
            <Home size={16} /> Home
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-xl transition-colors text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
