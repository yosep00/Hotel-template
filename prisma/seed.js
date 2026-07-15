// Wrapper para `prisma db seed`. Delega en la fuente única scripts/seed_data.mjs
// para no duplicar la lógica de datos iniciales.
const { PrismaClient } = require('@prisma/client');

(async () => {
  const { seedData } = await import('../scripts/seed_data.mjs');
  const prisma = new PrismaClient();
  try {
    await seedData(prisma);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
