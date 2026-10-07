import { PrismaClient } from '@prisma/client';
import { ObjectId } from "bson";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mock staff members...");

  let userId =  new ObjectId().toString();
  let staffId =   new ObjectId().toString();
  const doctor = await prisma.user.create({
    data: {
      id: userId,
      name: "Dr. Gregory House",
      email: "house@hms.demo",
      role: "doctor",
      staff: {
        create: {
          id: staffId,
          fullName: "Dr. Gregory House",
          specialty: "Diagnostics",
          department: "Internal Medicine",
          phone: "+1234567890"
        }
      }
    }
  });

  userId =  new ObjectId().toString();
  staffId=  new ObjectId().toString();
  const nurse = await prisma.user.create({
    data: {
      id: userId,
      name: "Nurse Jackie",
      email: "jackie@hms.demo",
      role: "nurse",
      staff: {
        create: {
          id: staffId,
          fullName: "Nurse Jackie",
          specialty: "Emergency",
          department: "ER",
          phone: "+1987654321"
        }
      }
    }
  });

  console.log(`✅ Created mock doctor: ${doctor.name} (${doctor.email})`);
  console.log(`✅ Created mock nurse: ${nurse.name} (${nurse.email})`);
  
  // Note: Since these bypass Better Auth for password hashing, 
  // you wouldn't be able to log in as them without a "Forgot Password" flow, 
  // but they are perfect for selecting in the Appointments UI!
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
