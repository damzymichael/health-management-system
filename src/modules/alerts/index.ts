import { prisma } from "@/lib/auth";
import { sendNotification } from "@/modules/notifications";

export async function checkAlertsForVitals(vitalsEntryId: string) {
  const vitals = await prisma.vitalsLabEntry.findUnique({
    where: { id: vitalsEntryId },
    include: { patient: { include: { user: true } } }
  });
  if (!vitals) return;

  const rules = await prisma.alertRule.findMany({ where: { enabled: true } });
  
  const antenatal = await prisma.womenHealthRecord.findFirst({
    where: { patientId: vitals.patientId, recordType: "ANTENATAL" },
    orderBy: { createdAt: "desc" }
  });
  const isPregnantPast20Weeks = antenatal && (antenatal.pregnancyWeek || 0) >= 20;

  // Group rules by metric to only keep highest severity
  const triggeredRules = [];

  for (const rule of rules) {
    let readingValue: number | null = null;
    switch(rule.metric) {
      case "bpSystolic": readingValue = vitals.bpSystolic; break;
      case "bpDiastolic": readingValue = vitals.bpDiastolic; break;
      case "temperature": readingValue = vitals.temperature; break;
      case "pulse": readingValue = vitals.pulse; break;
      case "bloodSugar": readingValue = vitals.bloodSugar; break;
    }

    if (readingValue !== null && readingValue !== undefined) {
      const isTriggered = rule.operator === "GTE" 
        ? readingValue >= rule.threshold 
        : readingValue <= rule.threshold;

      if (isTriggered) {
        triggeredRules.push({ rule, readingValue });
      }
    }
  }

  // Filter highest severity per metric if needed, but for simplicity we will just log all fired rules
  for (const { rule, readingValue } of triggeredRules) {
    let severity = rule.severity;
    let message = `${rule.label || rule.metric}: reading of ${readingValue} triggered rule ${rule.code} (Threshold: ${rule.operator} ${rule.threshold})`;

    if (isPregnantPast20Weeks && (rule.metric === "bpSystolic" || rule.metric === "bpDiastolic")) {
      if (severity === "HIGH") {
        severity = "CRITICAL";
        message += " [Severity elevated to CRITICAL due to gestation >= 20 weeks]";
      }
    }

    // Create alert
    await prisma.alert.create({
      data: {
        patientId: vitals.patientId,
        sourceType: "VITALS",
        sourceId: vitals.id,
        ruleCode: rule.code,
        severity,
        message,
        status: "OPEN"
      }
    });

    // Notify patient
    await sendNotification({
      userId: vitals.patient.user.id,
      channel: "IN_APP",
      type: "RISK_ALERT",
      title: "Health Alert",
      body: `A recent reading triggered a health alert. Your care team has been notified.`
    });
  }
}
