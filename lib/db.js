import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// --- OPERACIONES DE HABITACIONES ---

export async function getRooms() {
  return prisma.room.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function getRoomById(id) {
  return prisma.room.findUnique({ where: { id } });
}

export async function saveRoom(room) {
  if (room.id) {
    const { id, ...data } = room;
    return prisma.room.update({ where: { id }, data });
  }
  const { id, ...data } = room;
  return prisma.room.create({ data });
}

export async function deleteRoom(id) {
  await prisma.room.deleteMany({ where: { id } });
  return true;
}

// --- OPERACIONES DE SERVICIOS (página pública "Servicios Esenciales") ---

export async function getServices() {
  return prisma.service.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function getServiceById(id) {
  return prisma.service.findUnique({ where: { id } });
}

export async function saveService(service) {
  if (service.id) {
    const { id, ...data } = service;
    return prisma.service.update({ where: { id }, data });
  }
  const { id, ...data } = service;
  return prisma.service.create({ data });
}

export async function deleteService(id) {
  await prisma.service.deleteMany({ where: { id } });
  return true;
}

// --- OPERACIONES DE RESERVAS ---

export async function getBookings() {
  return prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getBookingById(id) {
  return prisma.booking.findUnique({ where: { id } });
}

export async function saveBooking(booking) {
  if (booking.id) {
    const { id, ...data } = booking;
    return prisma.booking.update({ where: { id }, data });
  }
  const { id, ...data } = booking;
  return prisma.booking.create({ data });
}

export async function deleteBooking(id) {
  await prisma.booking.deleteMany({ where: { id } });
  return true;
}

// --- MOTOR DE DISPONIBILIDAD (Lógica Anti-Overbooking) ---

export async function getRemainingStock(roomId, checkIn, checkOut, excludeBookingId = null) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return 0;

  const reqIn = new Date(checkIn);
  const reqOut = new Date(checkOut);

  if (isNaN(reqIn.getTime()) || isNaN(reqOut.getTime())) return 0;
  if (reqIn >= reqOut) return 0;

  const bookings = await prisma.booking.findMany({ where: { roomId } });

  const overlapping = bookings.filter((b) => {
    if (b.id === excludeBookingId) return false;
    if (b.status === 'cancelled') return false;
    const bIn = new Date(b.checkIn);
    const bOut = new Date(b.checkOut);
    return bIn < reqOut && bOut > reqIn;
  });

  return Math.max(0, room.stock - overlapping.length);
}

export async function checkAvailability(roomId, checkIn, checkOut, excludeBookingId = null) {
  return (await getRemainingStock(roomId, checkIn, checkOut, excludeBookingId)) > 0;
}

// --- CONFIGURACIONES (Hotel) ---

export async function getSettings() {
  return prisma.hotel.upsert({
    where: { id: 'hotel-1' },
    update: {},
    create: { id: 'hotel-1' },
  });
}

export async function saveSettings(newSettings) {
  return prisma.hotel.upsert({
    where: { id: 'hotel-1' },
    update: newSettings,
    create: { id: 'hotel-1', ...newSettings },
  });
}

// --- OPERACIONES DE USUARIOS (Autenticación) ---

export async function getUsers() {
  return prisma.user.findMany();
}

// Usuarios con sus reservas asociadas (emparejadas por email de huésped).
export async function getUsersWithBookings() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  const bookings = await prisma.booking.findMany();
  return users.map((u) => {
    const { password, ...safeUser } = u;
    return {
      ...safeUser,
      bookings: bookings.filter(
        (b) =>
          b.guestEmail &&
          u.email &&
          b.guestEmail.toLowerCase() === u.email.toLowerCase()
      ),
    };
  });
}

export async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function saveUser(user) {
  // Hashear la contraseña solo si viene en texto claro
  if (user.password && !/^\$2[aby]\$/.test(user.password)) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  if (user.id) {
    const existing = await prisma.user.findUnique({ where: { id: user.id } });
    if (existing) {
      const { id, ...data } = user;
      return prisma.user.update({ where: { id }, data });
    }
  }
  const { id, ...data } = user;
  return prisma.user.create({ data });
}

export async function deleteUser(id) {
  await prisma.user.deleteMany({ where: { id } });
  return true;
}
