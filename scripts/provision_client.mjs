// Provisioning de un CLIENTE nuevo (llave en mano).
//
// Qué hace:
//   1. Aplica el esquema Prisma a la base del cliente (prisma db push).
//   2. Sembra los datos iniciales (hotel, habitaciones, servicios, admin).
//   3. Imprime las ENV VARS que debes pegar en el proyecto Vercel del cliente.
//
// Lo que NO hace (es manual / en una llamada con el cliente):
//   - Crear la cuenta Supabase, el repo GitHub, el proyecto Vercel ni el dominio.
//   - Cargar las tarjetas de facturación del cliente en esos servicios.
//
// Uso:
//   DATABASE_URL="postgresql://cliente...?pgbouncer=true&connection_limit=1&sslmode=require" \
//     node scripts/provision_client.mjs
//
// Requisito: el cliente ya debe tener su propio proyecto Supabase creado y
// haberte dado su DATABASE_URL (pooler 6543).

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { seedData } from './seed_data.mjs';

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en el entorno. Apúntalo a la base del cliente.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log('Aplicando esquema a la base del cliente (prisma db push)...');
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('Sembrando datos iniciales...');
  await seedData(prisma);

  console.log('\n=========================================================');
  console.log(' ENV VARS para pegar en Vercel (Settings > Environment)');
  console.log('=========================================================');
  console.log(`DATABASE_URL=${process.env.DATABASE_URL}`);
  console.log('STRIPE_SECRET_KEY=   # déjalo VACÍO para modo mock (sin cobros reales)');
  console.log('NEXT_PUBLIC_SITE_URL=https://TU-DOMINIO.com');
  console.log('\nAdmin por defecto: admin@grandoasis.com / admin123');
  console.log('(cámbialo desde /admin o directo en la base antes de entregar)');
  console.log('=========================================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
