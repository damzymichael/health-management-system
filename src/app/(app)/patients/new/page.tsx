import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { redirect } from "next/navigation";
import { audit } from "@/modules/audit";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ObjectId } from "bson";

export default async function RegisterPatientPage() {
  const session = await requireRole("receptionist", "admin");

  async function registerPatient(formData: FormData) {
    "use server";

    // In a real app, you'd use zod for validation here
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const gender = formData.get("gender") as "FEMALE" | "MALE" | "OTHER";
    const dob = formData.get("dob") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const bloodGroup = formData.get("bloodGroup") as string;

    const patientCount = await prisma.patient.count();
    const patientNumber = `HMS-${String(patientCount + 1).padStart(6, '0')}`;

    // Note: Creating User directly bypasses Better Auth's password hashing. 
    // The patient would need to use "Forgot Password" to set a password later.
    const userId = new ObjectId().toString(); // e.g. "650c1f2e8f1b2c001f3e4d5a"
    const patientId = new ObjectId().toString();

    const user = await prisma.user.create({
      data: {
        id: userId,
        name: fullName,
        email,
        role: "patient",
        patient: {
          create: {
            id: patientId,
            patientNumber,
            fullName,
            gender,
            dateOfBirth: new Date(dob),
            phone,
            address,
            bloodGroup,
          },
        },
      },
      include: { patient: true },
    });

    await audit({
      userId: session.user.id,
      action: "PATIENT_CREATE",
      entity: "Patient",
      entityId: user.patient?.id,
      details: { patientNumber }
    });

    redirect(`/patients/${user.patient?.id}`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/patients" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Register New Patient</h1>
          <p className="text-slate-500">Create a new patient record and portal account.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form action={registerPatient} className="p-6 md:p-8 space-y-8">

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input required type="text" name="fullName" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                <input required type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                <input required type="date" name="dob" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                <select required name="gender" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 bg-white">
                  <option value="">Select gender...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2">Contact & Medical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="tel" name="phone" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="+234..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                <select name="bloodGroup" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 bg-white">
                  <option value="">Select blood group...</option>
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
                <input type="text" name="address" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" placeholder="123 Main St..." />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
            <Link href="/patients" className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm">
              Save Patient Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
