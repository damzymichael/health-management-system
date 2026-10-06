import { prisma } from "@/lib/auth";

export async function getPatients(query = "", page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const where = query ? {
    OR: [
      { fullName: { contains: query, mode: "insensitive" as const } },
      { patientNumber: { contains: query, mode: "insensitive" as const } },
      { phone: { contains: query } }
    ]
  } : {};

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.patient.count({ where })
  ]);

  return { patients, total, pages: Math.ceil(total / limit) };
}

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: { user: true }
  });
}
