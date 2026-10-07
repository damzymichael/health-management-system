import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Please provide an email address.');
    console.log('Usage: npx tsx scripts/make-doctor.ts user@example.com');
    process.exit(1);
  }

  const result = await prisma.user.updateMany({
    where: { email },
    data: { role: 'doctor' },
  });

  if (result.count === 0) {
    console.log(`⚠️ No user found with the email: ${email}`);
  } else {
    console.log(`✅ Successfully updated user (${email}) to doctor role.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
