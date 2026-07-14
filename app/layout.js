import "./globals.css";
import HotelBrandingProvider from "@/components/HotelBranding";
import LanguageProvider from "@/components/LanguageProvider";

export const metadata = {
  metadataBase: new URL("https://hotel-template-theta.vercel.app"),
  title: {
    default: "Hotel | Reserva Tu Estadía de Lujo",
    template: "%s | Hotel",
  },
  description:
    "Reserva directa en nuestro hotel. Habitaciones premium, villas y vistas exclusivas. Sin comisiones de intermediarios.",
  keywords: ["hotel", "reserva de hotel", "lujo", "vacaciones", "playa", "spa", "villas"],
  alternates: {
    canonical: "/",
    languages: {
      es: "/",
      en: "/?lang=en",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "Hotel",
    title: "Hotel | Reserva Tu Estadía de Lujo",
    description:
      "Reserva directa en nuestro hotel. Habitaciones premium, villas y vistas exclusivas. Sin comisiones de intermediarios.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel | Reserva Tu Estadía de Lujo",
    description:
      "Reserva directa en nuestro hotel. Habitaciones premium, villas y vistas exclusivas. Sin comisiones de intermediarios.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <LanguageProvider>
          <HotelBrandingProvider>{children}</HotelBrandingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
