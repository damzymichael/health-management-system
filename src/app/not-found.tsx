import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">404</h1>
          <p className="text-slate-500 mt-2">The page you are looking for does not exist or has been moved.</p>
        </div>
        <Link href="/" className="inline-block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
