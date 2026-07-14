import { NextResponse } from 'next/server';
import { getBookingById, getRoomById, getSettings } from '@/lib/db';

export async function POST(request) {
  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId es requerido" }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    const room = await getRoomById(booking.roomId);
    if (!room) {
      return NextResponse.json({ error: "Habitación asociada no encontrada" }, { status: 404 });
    }

    const settings = await getSettings();
    const isRealStripeConfigured = 
      process.env.STRIPE_SECRET_KEY && 
      !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_mock') &&
      process.env.STRIPE_SECRET_KEY !== '';

    // URL base del sitio web (para las redirecciones de Stripe)
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    if (isRealStripeConfigured) {
      try {
        // Carga dinámica de Stripe para evitar errores si no está instalado en local
        const { default: Stripe } = await import('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Crear una sesión de Stripe Checkout
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: settings.currency.toLowerCase(),
                product_data: {
                  name: `Reserva - ${room.name}`,
                  description: `Estadía desde ${booking.checkIn} hasta ${booking.checkOut}`,
                  images: room.images && room.images.length > 0 ? [room.images[0]] : [],
                },
                unit_amount: Math.round(booking.totalPrice * 100), // Stripe recibe centavos
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${origin}/booking-success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/rooms/${room.id}?bookingId=${booking.id}&cancelled=true`,
          metadata: {
            bookingId: booking.id
          }
        });

        return NextResponse.json({ url: session.url, isMock: false });
      } catch (stripeError) {
        console.error("Error al inicializar o usar Stripe Real. Usando Mock como alternativa:", stripeError);
        // Fallback a Stripe Mock si falla la inicialización real
      }
    }

    // --- STRIPE MOCK (Entorno de pruebas local sin claves reales) ---
    // Si no hay Stripe real configurado, redirigimos a nuestra página de simulación local
    const mockCheckoutUrl = `/stripe-mock?bookingId=${booking.id}`;
    return NextResponse.json({ url: mockCheckoutUrl, isMock: true });

  } catch (error) {
    console.error("Error en checkout API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
