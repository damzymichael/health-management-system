import { auth } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "patient" | "doctor" | "nurse" | "receptionist" | "admin";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(...allowedRoles: Role[]) {
  const session = await requireSession();
  if (!allowedRoles.includes(session.user.role as Role)) {
    redirect("/dashboard");
  }
  return session;
}

export function can(role: Role, capability: string): boolean {
  switch (capability) {
    case "register_patient":
      return ["receptionist", "admin"].includes(role);
    case "view_patient_demographics":
      return ["doctor", "nurse", "receptionist"].includes(role);
    case "view_clinical_record":
      return ["doctor", "nurse"].includes(role);
    case "manage_appointments":
      return ["doctor", "nurse", "receptionist"].includes(role);
    case "create_consultation":
    case "create_prescription":
    case "order_lab_test":
      return role === "doctor";
    case "enter_lab_result":
      return ["doctor", "nurse"].includes(role);
    case "record_vitals":
    case "record_womens_health":
      return ["doctor", "nurse"].includes(role);
    case "manage_alerts":
      return ["doctor", "nurse"].includes(role);
    case "manage_users":
    case "edit_alert_rules":
    case "view_audit_log":
      return role === "admin";
    default:
      return false;
  }
}

export async function assertPatientOwnership(patientId: string) {
  const session = await requireSession();
  if (session.user.role === "patient") {
    // We would look up the Patient record by userId here and ensure it matches patientId
    // If not, redirect or throw Error
  }
}
