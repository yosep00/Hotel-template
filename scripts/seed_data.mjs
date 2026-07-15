// Fuente única de datos iniciales (seed) para la plantilla.
// Usado por: prisma/seed.js, scripts/reset_demo.mjs y scripts/provision_client.mjs.
import bcrypt from 'bcryptjs';

const ROOMS = [
  {
    name: 'Suite Deluxe con Vista al Mar',
    description:
      'Disfruta de una experiencia exclusiva con vistas panorámicas al océano. Cuenta con cama King Size, balcón privado, jacuzzi y acabados de lujo.',
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
    description:
      'Habitación espaciosa equipada con dos camas matrimoniales, ideal para viajes de negocios o vacaciones familiares. Diseño contemporáneo y acogedor.',
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
    description:
      'El máximo confort y privacidad. Villa independiente de dos niveles con piscina privada, cocina completa, terraza y servicio a la habitación VIP.',
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

const SERVICES = [
  {
    name: 'Desayuno Buffet',
    description:
      'Desayuno internacional buffet con opciones locales e internacionales todas las mañanas.',
    icon: '☕',
    image: null,
  },
  {
    name: 'Meditación y Yoga',
    description:
      'Sesiones guiadas de yoga y meditación frente al mar para renovar cuerpo y mente.',
    icon: '🧘',
    image: null,
  },
  {
    name: 'Bicicletas Gratis',
    description:
      'Explora la zona hotelera con nuestras bicicletas de cortesía disponibles todo el día.',
    icon: '🚲',
    image: null,
  },
];

const ADMIN_EMAIL = 'admin@grandoasis.com';
const ADMIN_PASSWORD = 'admin123';

export async function seedData(prisma) {
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
  const roomsCount = await prisma.room.count();
  if (roomsCount === 0) {
    for (const room of ROOMS) {
      await prisma.room.create({ data: room });
    }
    console.log('Habitaciones iniciales creadas.');
  }

  // Servicios esenciales iniciales (solo si no hay ninguno)
  const servicesCount = await prisma.service.count();
  if (servicesCount === 0) {
    for (const service of SERVICES) {
      await prisma.service.create({ data: service });
    }
    console.log('Servicios esenciales creados.');
  }

  // Usuario administrador por defecto
  const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        name: 'Administrador General',
        email: ADMIN_EMAIL,
        password: hashed,
        role: 'admin',
      },
    });
    console.log(`Administrador por defecto creado (${ADMIN_EMAIL} / ${ADMIN_PASSWORD}).`);
  }

  console.log('Seed completado.');
}
