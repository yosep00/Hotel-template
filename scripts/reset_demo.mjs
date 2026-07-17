// Reset de la instancia DEMO: borra todos los datos generados por los
// testers (usuarios, reservas, habitaciones/servicios creados y cambios de
// configuración del hotel) y los deja en estado de fábrica cada 24h.
//
// SOLO se ejecuta contra la base de datos que indique DATABASE_URL. Nunca lo
// corras contra la base de un cliente real.
//
// Uso local:  DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1&sslmode=require" node scripts/reset_demo.mjs
// Programado: .github/workflows/reset-demo.yml (diario + manual).

import { PrismaClient } from '@prisma/client';
import { seedData } from './seed_data.mjs';

const prisma = new PrismaClient({
  // El pooler 6543 tiene connection_limit=1; forzamos una sola conexión al pool
  // para evitar "Connection pool timeout / Connection limit reached" durante el seed.
  datasources: process.env.DATABASE_URL
    ? {
        db: {
          url: process.env.DATABASE_URL.trim()
            .replace(/^﻿/, '')
            .replace(/^postgres:\/\//, 'postgresql://'),
        },
      }
    : undefined,
});

async function main() {
  let raw = process.env.DATABASE_URL;
  if (!raw) {
    console.error(
      'ERROR: Falta DATABASE_URL. Configura el secreto DEMO_DATABASE_URL en GitHub ' +
        '(Settings > Secrets and variables > Actions) con el DATABASE_URL (pooler 6543) ' +
        'de la base que usa la demo en Vercel.'
    );
    process.exit(1);
  }

  // Normaliza: quita BOM/espacios/saltos de línea y acepta el protocolo
  // corto `postgres://` que usa Supabase (Prisma exige `postgresql://`).
  raw = raw.trim().replace(/^﻿/, '');
  const url = raw.replace(/^postgres:\/\//, 'postgresql://');

  if (!/^postgresql:\/\//.test(url)) {
    console.error(
      'ERROR: El DATABASE_URL no empieza con "postgresql://" ni "postgres://". ' +
        'Protocolo recibido: ' +
        (url.split('://')[0] || '(vacío)')
    );
    process.exit(1);
  }
  console.log('Usando DATABASE_URL:', url.replace(/:[^:@]+@/, ':***@'));

  console.log('Borrando datos del demo...');
  // Orden: Booking antes que Room (FK onDelete Cascade), el resto independientes.
  await prisma.booking.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});

  console.log('Resembrando datos por defecto...');
  await seedData(prisma);

  console.log('Reset del demo completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
