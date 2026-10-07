"use server";

import { prisma } from "@/lib/auth";

export async function upsertPatientProfile({
  userId,
  fullName,
  dateOfBirth,
  gender,
  phone,
  address,
  bloodGroup,
}: {
  userId: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  phone?: string;
  address?: string;
  bloodGroup?: string;
}) {
  if (!userId) {
    throw new Error("Missing userId");
  }

  const existing = await prisma.patient.findUnique({ where: { userId } });

  if (existing) {
    return await prisma.patient.update({
      where: { userId },
      data: {
        fullName: fullName || existing.fullName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existing.dateOfBirth,
        gender: gender || existing.gender,
        phone: phone !== undefined ? phone : existing.phone,
        address: address !== undefined ? address : existing.address,
        bloodGroup: bloodGroup !== undefined ? bloodGroup : existing.bloodGroup,
      },
    });
  }

  const count = await prisma.patient.count();
  const patientNumber = `HMS-${String(count + 1).padStart(6, "0")}`;

  return await prisma.patient.create({
    data: {
      userId,
      patientNumber,
      fullName: fullName || "New Patient",
      gender: gender || "OTHER",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date("2000-01-01"),
      phone: phone || null,
      address: address || null,
      bloodGroup: bloodGroup || null,
    },
  });
}
