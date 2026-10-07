import { prisma } from "@/lib/auth";
import { checkAlertsForVitals } from "@/modules/alerts";

export async function recordWomensHealth(data: any) {
  const record = await prisma.womenHealthRecord.create({
    data
  });

  if (data.bpSystolic || data.bpDiastolic) {
    // If BP is provided, it goes into the Alert engine. 
    // We create a mirror vitals entry to run the engine logic seamlessly.
    await prisma.vitalsLabEntry.create({
       data: {
         patientId: data.patientId,
         entryType: "VITALS",
         bpSystolic: data.bpSystolic,
         bpDiastolic: data.bpDiastolic,
         recordedByUserId: data.recordedByUserId || "SYSTEM"
       }
    }).then(v => checkAlertsForVitals(v.id).catch(console.error));
  }

  return record;
}

export async function getWomensHealthRecords(patientId: string) {
  return prisma.womenHealthRecord.findMany({
    where: { patientId },
    orderBy: { recordedAt: 'desc' }
  });
}
