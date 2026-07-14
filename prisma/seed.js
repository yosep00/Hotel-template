const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ROOMS = [
  {
    name: 'Suite Deluxe con Vista al Mar',
    description: 'Disfruta de una experiencia exclusiva con vistas panorámicas al océano. Cuenta con cama King Size, balcón privado, jacuzzi y acabados de lujo.',
    basePrice: 150.0,
    capacityAdults: 2,
    capacityChildren: 1,
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['wifi', 'ac', 'tv', 'jacuzzi', 'minibar', 'ocean_view', 'breakfast'],
  },
  {
    name: 'Habitación Doble Superior',
    description: 'Habitación espaciosa equipada con dos camas matrimoniales, ideal para viajes de negocios o vacaciones familiares. Diseño contemporáneo y acogedor.',
    basePrice: 95.0,
    capacityAdults: 2,
    capacityChildren: 2,
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['wifi', 'ac', 'tv', 'safe', 'desk'],
  },
  {
    name: 'Villa Privada con Piscina',
    description: 'El máximo confort y privacidad. Villa independiente de dos niveles con piscina privada, cocina completa, terraza y servicio a la habitación VIP.',
    basePrice: 280.0,
    capacityAdults: 4,
    capacityChildren: 2,
    stock: 1,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['wifi', 'ac', 'tv', 'pool', 'kitchen', 'terrace', 'parking', 'breakfast'],
  },
];

async function main() {
  // Configuración del hotel (fila única)
  await prisma.hotel.upsert({
    where: { id: 'hotel-1' },
    update: {},
    create: {
      id: 'hotel-1',
      hotelName: 'Grand Oasis Resort & Spa',
      hotelEmail: 'reservas@grandoasisresort.com',
      hotelPhone: '+1 (555) 123-4567',
      hotelAddress: 'Km 14.5, Boulevard Kukulcan, Zona Hotelera, Cancún',
      currency: 'USD',
    },
  });

  // Habitaciones iniciales (solo si no hay ninguna)
  const existingRooms = await prisma.room.count();
  if (existingRooms === 0) {
    for (const room of ROOMS) {
      await prisma.room.create({ data: room });
    }
    console.log('Habitaciones iniciales creadas.');
  }

  // Usuario administrador por defecto
  const adminEmail = 'admin@grandoasis.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrador General',
        email: adminEmail,
        password: hashed,
        role: 'admin',
      },
    });
    console.log('Administrador por defecto creado (admin@grandoasis.com / admin123).');
  }

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
