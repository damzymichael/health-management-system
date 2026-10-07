import { prisma } from "@/lib/auth";
import { checkAlertsForVitals } from "@/modules/alerts";

export async function recordPatientVitals(data: any) {
  const vitals = await prisma.vitalsLabEntry.create({
    data: {
      ...data,
      entryType: "VITALS",
    }
  });

  // Evaluate alerts in the background without blocking
  checkAlertsForVitals(vitals.id).catch(console.error);

  return vitals;
}

export async function getPatientVitals(patientId: string) {
  return prisma.vitalsLabEntry.findMany({
    where: { patientId, entryType: "VITALS" },
    orderBy: { recordedAt: "desc" }
  });
}

export async function createConsultation(data: { 
  patientId: string, 
  staffUserId: string, 
  complaint: string, 
  diagnosis: string, 
  notes: string,
  prescriptions?: Array<{ medication: string, dosage: string, frequency: string, durationDays: number, instructions?: string }>
}) {
  let staff = await prisma.staff.findUnique({ where: { userId: data.staffUserId } });
  
  if (!staff) {
    const user = await prisma.user.findUnique({ where: { id: data.staffUserId } });
    staff = await prisma.staff.create({
      data: {
        userId: data.staffUserId,
        fullName: user?.name || "Doctor",
      }
    });
  }

  return prisma.consultation.create({
    data: {
      patientId: data.patientId,
      staffId: staff.id,
      complaint: data.complaint,
      diagnosis: data.diagnosis,
      notes: data.notes,
      prescriptions: data.prescriptions && data.prescriptions.length > 0 ? {
        create: data.prescriptions.map(p => ({
          drugName: p.medication,
          dosage: `${p.dosage} - ${p.frequency}`,
          duration: `${p.durationDays} Days`,
          instructions: p.instructions
        }))
      } : undefined
    },
    include: { prescriptions: true }
  });
}

export async function getPatientConsultations(patientId: string) {
  return prisma.consultation.findMany({
    where: { patientId },
    include: { staff: true, prescriptions: true },
    orderBy: { visitDate: 'desc' }
  });
}
