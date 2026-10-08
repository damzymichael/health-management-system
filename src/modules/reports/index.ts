import { prisma } from "@/lib/auth";

export interface MonthlyMetric {
  monthKey: string;      // "2026-05"
  monthLabel: string;    // "May 2026"
  consultationsCount: number;
  distinctPatientsSeen: number;
  appointmentsCount: number;
  missedAppointmentsCount: number;
  antenatalRecordsCount: number;
  alertsCount: number;
}

export interface ReportsAnalyticsData {
  timeframeMonths: number;
  kpis: {
    totalPatients: number;
    patientsSeenThisMonth: number;
    totalConsultations: number;
    totalAppointments: number;
    missedAppointments: number;
    missedRatePercent: number;
    totalAlerts: number;
    openAlerts: number;
    criticalAlerts: number;
    totalAntenatalRecords: number;
  };
  monthlyTrends: MonthlyMetric[];
  appointmentsByStatus: { status: string; count: number; color?: string }[];
  alertsBySeverity: { severity: string; count: number }[];
  alertsByStatus: { status: string; count: number }[];
  topDiagnoses: { diagnosis: string; count: number }[];
}

export async function getFacilityAnalytics(monthsCount = 6): Promise<ReportsAnalyticsData> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);

  // Generate month buckets
  const monthBuckets: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    monthBuckets.push({ key, label, start, end });
  }

  // Concurrent queries for top-level aggregates
  const [
    totalPatients,
    allAppointments,
    allAlerts,
    allConsultations,
    allWomensRecords
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: startDate }
      },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        patientId: true
      }
    }),
    prisma.alert.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        severity: true,
        status: true,
        createdAt: true
      }
    }),
    prisma.consultation.findMany({
      where: {
        visitDate: { gte: startDate }
      },
      select: {
        id: true,
        patientId: true,
        diagnosis: true,
        visitDate: true
      }
    }),
    prisma.womenHealthRecord.findMany({
      where: {
        recordedAt: { gte: startDate },
        recordType: "ANTENATAL"
      },
      select: {
        id: true,
        recordedAt: true
      }
    })
  ]);

  // Appointments by status
  const statusMap: Record<string, number> = {
    SCHEDULED: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    MISSED: 0
  };
  for (const appt of allAppointments) {
    statusMap[appt.status] = (statusMap[appt.status] || 0) + 1;
  }
  const appointmentsByStatus = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count
  }));

  // Alerts by severity and status
  const severityMap: Record<string, number> = { INFO: 0, HIGH: 0, CRITICAL: 0 };
  const alertStatusMap: Record<string, number> = { OPEN: 0, ACKNOWLEDGED: 0, RESOLVED: 0 };
  for (const alert of allAlerts) {
    severityMap[alert.severity] = (severityMap[alert.severity] || 0) + 1;
    alertStatusMap[alert.status] = (alertStatusMap[alert.status] || 0) + 1;
  }
  const alertsBySeverity = Object.entries(severityMap).map(([severity, count]) => ({
    severity,
    count
  }));
  const alertsByStatus = Object.entries(alertStatusMap).map(([status, count]) => ({
    status,
    count
  }));

  // Top 10 diagnoses (anonymized aggregates)
  const diagnosisFreq: Record<string, number> = {};
  for (const c of allConsultations) {
    const raw = (c.diagnosis || "").trim();
    if (raw) {
      // Normalize diagnosis name
      const clean = raw.charAt(0).toUpperCase() + raw.slice(1);
      diagnosisFreq[clean] = (diagnosisFreq[clean] || 0) + 1;
    }
  }
  const topDiagnoses = Object.entries(diagnosisFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([diagnosis, count]) => ({ diagnosis, count }));

  // Monthly trends
  const monthlyTrends: MonthlyMetric[] = monthBuckets.map(bucket => {
    // Consultations in bucket
    const bucketConsultations = allConsultations.filter(
      c => c.visitDate >= bucket.start && c.visitDate <= bucket.end
    );
    const distinctPatients = new Set(bucketConsultations.map(c => c.patientId)).size;

    // Appointments in bucket
    const bucketAppointments = allAppointments.filter(
      a => a.scheduledAt >= bucket.start && a.scheduledAt <= bucket.end
    );
    const missed = bucketAppointments.filter(a => a.status === "MISSED").length;

    // Antenatal records in bucket
    const antenatal = allWomensRecords.filter(
      w => w.recordedAt >= bucket.start && w.recordedAt <= bucket.end
    ).length;

    // Alerts in bucket
    const alerts = allAlerts.filter(
      al => al.createdAt >= bucket.start && al.createdAt <= bucket.end
    ).length;

    return {
      monthKey: bucket.key,
      monthLabel: bucket.label,
      consultationsCount: bucketConsultations.length,
      distinctPatientsSeen: distinctPatients,
      appointmentsCount: bucketAppointments.length,
      missedAppointmentsCount: missed,
      antenatalRecordsCount: antenatal,
      alertsCount: alerts
    };
  });

  // Calculate KPIs
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const consultationsThisMonth = allConsultations.filter(c => c.visitDate >= currentMonthStart);
  const distinctPatientsThisMonth = new Set(consultationsThisMonth.map(c => c.patientId)).size;

  const totalApptsCount = allAppointments.length;
  const missedApptsCount = statusMap.MISSED || 0;
  const missedRate = totalApptsCount > 0 ? (missedApptsCount / totalApptsCount) * 100 : 0;

  const openAlertsCount = alertStatusMap.OPEN || 0;
  const criticalAlertsCount = severityMap.CRITICAL || 0;

  return {
    timeframeMonths: monthsCount,
    kpis: {
      totalPatients,
      patientsSeenThisMonth: distinctPatientsThisMonth,
      totalConsultations: allConsultations.length,
      totalAppointments: totalApptsCount,
      missedAppointments: missedApptsCount,
      missedRatePercent: Math.round(missedRate * 10) / 10,
      totalAlerts: allAlerts.length,
      openAlerts: openAlertsCount,
      criticalAlerts: criticalAlertsCount,
      totalAntenatalRecords: allWomensRecords.length
    },
    monthlyTrends,
    appointmentsByStatus,
    alertsBySeverity,
    alertsByStatus,
    topDiagnoses
  };
}
