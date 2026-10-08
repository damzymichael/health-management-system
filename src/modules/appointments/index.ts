import { prisma } from "@/lib/auth";
import { ObjectId } from "bson";
import { sendNotification } from "@/modules/notifications";
import { audit } from "@/modules/audit";

export async function getOrCreateTriageStaff() {
  let triageStaff = await prisma.staff.findFirst({
    where: { department: "TRIAGE" }
  });

  if (!triageStaff) {
    let triageUser = await prisma.user.findFirst({
      where: { email: "triage@hms.internal" }
    });

    if (!triageUser) {
      triageUser = await prisma.user.create({
        data: {
          id: new ObjectId().toString(),
          name: "Pending Doctor Assignment",
          email: "triage@hms.internal",
          role: "receptionist",
          isActive: false
        }
      });
    }

    triageStaff = await prisma.staff.create({
      data: {
        id: new ObjectId().toString(),
        userId: triageUser.id,
        fullName: "Pending Doctor Assignment",
        specialty: "Awaiting Admin Match",
        department: "TRIAGE"
      }
    });
  }

  return triageStaff;
}

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
          id: true,
          fullName: true,
          patientNumber: true,
          phone: true
        }
      },
      staff: {
        select: {
          id: true,
          fullName: true,
          specialty: true,
          department: true
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  });
}

export async function requestPatientAppointment(data: {
  userId: string;
  scheduledAt: Date;
  reason?: string;
}) {
  const patient = await prisma.patient.findUnique({
    where: { userId: data.userId }
  });

  if (!patient) {
    throw new Error("Patient profile not found. Please complete profile first.");
  }

  const triageStaff = await getOrCreateTriageStaff();

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      staffId: triageStaff.id,
      scheduledAt: data.scheduledAt,
      reason: data.reason || "General Consultation Request",
      status: "SCHEDULED"
    }
  });

  // Notify patient
  await sendNotification({
    userId: data.userId,
    channel: "IN_APP",
    type: "APPOINTMENT_REMINDER",
    title: "Appointment Request Received",
    body: `Your request for ${data.scheduledAt.toLocaleDateString()} at ${data.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} has been submitted. Our team will match you with a physician.`
  });

  // Notify active admins
  const admins = await prisma.user.findMany({
    where: { role: "admin", isActive: true },
    select: { id: true }
  });
  for (const adm of admins) {
    await sendNotification({
      userId: adm.id,
      channel: "IN_APP",
      type: "SYSTEM",
      title: "New Appointment to Match",
      body: `Patient ${patient.fullName} requested an appointment for ${data.scheduledAt.toLocaleDateString()}. Please assign a doctor.`
    });
  }

  await audit({
    userId: data.userId,
    action: "APPOINTMENT_REQUEST",
    entity: "Appointment",
    entityId: appointment.id,
    details: { patientId: patient.id, scheduledAt: data.scheduledAt }
  });

  return appointment;
}

export async function matchAppointmentWithDoctor(data: {
  appointmentId: string;
  doctorStaffId: string;
  matchedByUserId: string;
}) {
  const doctor = await prisma.staff.findUnique({
    where: { id: data.doctorStaffId },
    include: { user: true }
  });

  if (!doctor) {
    throw new Error("Selected doctor was not found.");
  }

  const appointment = await prisma.appointment.update({
    where: { id: data.appointmentId },
    data: {
      staffId: doctor.id,
      status: "CONFIRMED"
    },
    include: {
      patient: {
        include: { user: true }
      }
    }
  });

  // Notify patient about the match
  if (appointment.patient?.user) {
    await sendNotification({
      userId: appointment.patient.user.id,
      channel: "IN_APP",
      type: "APPOINTMENT_REMINDER",
      title: "Doctor Assigned!",
      body: `Great news! You have been matched with ${doctor.fullName}${doctor.specialty ? ` (${doctor.specialty})` : ""} for your appointment on ${new Date(appointment.scheduledAt).toLocaleDateString()} at ${new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    });
  }

  // Notify doctor
  if (doctor.user) {
    await sendNotification({
      userId: doctor.user.id,
      channel: "IN_APP",
      type: "APPOINTMENT_REMINDER",
      title: "New Patient Consultation Assigned",
      body: `You have been assigned to patient ${appointment.patient.fullName} for ${new Date(appointment.scheduledAt).toLocaleDateString()} at ${new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    });
  }

  await audit({
    userId: data.matchedByUserId,
    action: "APPOINTMENT_MATCH_DOCTOR",
    entity: "Appointment",
    entityId: appointment.id,
    details: { doctorId: doctor.id, doctorName: doctor.fullName }
  });

  return appointment;
}
