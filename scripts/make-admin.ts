// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const result = await prisma.user.updateMany({
//     data: { role: 'admin' }
//   });
//   console.log(`Updated ${result.count} users to admin role.`);
// }

// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the email from the 3rd command-line argument
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Please provide an email address.');
    console.log('Usage: npx tsx scripts/make-admin.ts user@example.com');
    process.exit(1);
  }

  const result = await prisma.user.updateMany({
    where: { email },
    data: { role: 'admin' },
  });

  if (result.count === 0) {
    console.log(`⚠️ No user found with the email: ${email}`);
  } else {
    console.log(`✅ Successfully updated user (${email}) to admin role.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
  