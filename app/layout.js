import "./globals.css";

export const metadata = {
  title: "Grand Oasis Resort & Spa | Reserva Tu Estadía de Lujo",
  description: "Disfruta de una experiencia exclusiva en nuestro hotel resort de 5 estrellas. Habitaciones premium, villas con piscina privada y vistas panorámicas al mar. Reserva directa sin comisiones.",
  keywords: "hotel, resort, cancun, lujo, vacaciones, playa, villas, spa, reserva de hotel, grand oasis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
