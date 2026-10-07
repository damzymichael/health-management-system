import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/auth";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      patient: {
        include: {
          _count: {
            select: {
              appointments: true,
              consultations: true,
              vitalsLabs: true,
            },
          },
        },
      },
      staff: {
        include: {
          _count: {
            select: {
              appointments: true,
              consultations: true,
            },
          },
        },
      },
      sessions: {
        take: 3,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) return null;

  // Serialize any Date objects for safe client passing
  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    patient: user.patient
      ? {
          ...user.patient,
          dateOfBirth: user.patient.dateOfBirth.toISOString(),
        }
      : null,
    staff: user.staff ? { ...user.staff } : null,
    sessions: user.sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
    })),
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <ProfileClient user={serializedUser} />
    </div>
  );
}
