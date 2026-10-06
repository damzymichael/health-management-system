import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    data: { role: 'admin' }
  });
  console.log(`Updated ${result.count} users to admin role.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
