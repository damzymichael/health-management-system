import { prisma } from "@/lib/auth";

export async function getAppointments(status?: string, date?: string) {
  const where: any = {};
  if (status) where.status = status;
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    where.scheduledAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  return prisma.appointment.findMany({
    where,
    include: {
      patient: {
        select: {
          fullName: true,
          patientNumber: true,
        }
      },
      staff: {
        select: {
          fullName: true,
          specialty: true,
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  });
}
