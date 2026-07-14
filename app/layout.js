import "./globals.css";
import HotelBrandingProvider from "@/components/HotelBranding";

export const metadata = {
  title: "Hotel | Reserva Tu Estadía de Lujo",
  description: "Disfruta de una experiencia exclusiva en nuestro hotel resort. Reserva directa sin comisiones.",
  keywords: "hotel, resort, lujo, vacaciones, playa, villas, spa, reserva de hotel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <HotelBrandingProvider>{children}</HotelBrandingProvider>
      </body>
    </html>
  );
}
