import { prisma } from "@/lib/auth";

export async function audit({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log", err);
  }
}
