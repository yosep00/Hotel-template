from fpdf import FPDF
from fpdf.enums import XPos, YPos

PRIMARY = (30, 58, 95)      # azul corporativo
ACCENT  = (197, 157, 95)    # dorado
GREY    = (90, 90, 90)
LIGHT   = (245, 242, 237)

class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            self.set_fill_color(*PRIMARY)
            self.rect(0, 0, 210, 46, 'F')
            self.set_xy(15, 12)
            self.set_font('Helvetica', 'B', 20)
            self.set_text_color(255, 255, 255)
            self.multi_cell(180, 9, "Tu hotel, online y reservando en días")
            self.set_xy(15, 30)
            self.set_font('Helvetica', '', 11)
            self.set_text_color(*ACCENT)
            self.multi_cell(180, 6, "Solución web white-label llave en mano para hoteles")
            self.set_y(56)
        else:
            self.set_y(15)

    def footer(self):
        self.set_y(-14)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(*GREY)
        self.cell(0, 6, "Plantilla hotelera white-label  ·  Propuesta comercial", align='L')
        self.cell(0, 6, f"Página {self.page_no()}", align='R')

def h1(pdf, text):
    pdf.set_font('Helvetica', 'B', 13)
    pdf.set_text_color(*PRIMARY)
    pdf.set_fill_color(*LIGHT)
    pdf.cell(0, 9, "  " + text, new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
    pdf.ln(2)

def bullet(pdf, text):
    pdf.set_font('Helvetica', '', 10.5)
    pdf.set_text_color(30, 30, 30)
    x = pdf.get_x()
    pdf.set_text_color(*ACCENT)
    pdf.cell(6, 5.5, "»")
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 5.5, text)
    pdf.set_x(x)

def para(pdf, text):
    pdf.set_font('Helvetica', '', 10.5)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 5.5, text)
    pdf.ln(1.5)

pdf = PDF(format='A4')
pdf.set_auto_page_break(auto=True, margin=18)
pdf.add_page()
pdf.set_margins(15, 15, 15)

pdf.set_font('Helvetica', '', 10.5)
pdf.set_text_color(30, 30, 30)
pdf.multi_cell(0, 5.5, "Estimado [Nombre del hotel]:")
pdf.ln(1)
para(pdf,
    "¿Quiere un sitio web profesional donde sus huéspedes reserven directo, sin comisiones de "
    "plataformas externas, con panel de administración, pagos online y disponibilidad en español "
    "e inglés? Le ofrezco una plantilla hotelera white-label, funcional de punta a punta y "
    "personalizada con la marca de su hotel.")

h1(pdf, "Qué incluye")
bullet(pdf, "Reservas públicas en su web: motor de disponibilidad, fechas, habitaciones y precios, sin intermediarios.")
bullet(pdf, "Panel de administración: gestione habitaciones, reservas, servicios y la configuración del hotel.")
bullet(pdf, "Pagos con Stripe (modo test listo; conecta su cuenta y cobra directo a su banco).")
bullet(pdf, "Base de datos persistida (Supabase Postgres) dedicada a su hotel.")
bullet(pdf, "SEO incluido: sitemap, robots, metadatos Open Graph, JSON-LD de Hotel y versiones ES/EN.")
bullet(pdf, "Analíticas: ingresos confirmados, reservas, tasa de cancelación y ocupación por habitación.")
bullet(pdf, "Gestión de usuarios y sus reservas desde el panel.")
bullet(pdf, "Seguridad: sesión firmada (HMAC), APIs protegidas y headers de seguridad (CSP, etc.).")
bullet(pdf, "100% de su propiedad: un repositorio GitHub, un proyecto Vercel y una base de datos por hotel, con despliegue automático.")

h1(pdf, "Modelo de entrega (llave en mano)")
bullet(pdf, "Configuro la instancia con el nombre, dirección, logo y colores de su hotel.")
bullet(pdf, "Le entrego acceso a su repositorio, proyecto en Vercel y base de datos.")
bullet(pdf, "Manual de operación incluido paso a paso.")
bullet(pdf, "La demo se reinicia sola cada 24 h a estado de fábrica para sus pruebas.")

h1(pdf, "Por qué vale la pena")
bullet(pdf, "Sin comisiones de OTA: ahorra entre un 15 % y 25 % por cada reserva.")
bullet(pdf, "Control total y propiedad del código y de los datos de sus huéspedes.")
bullet(pdf, "Listo para producción, no un prototipo: reservas reales desde el primer día.")

h1(pdf, "Inversión y soporte")
para(pdf,
    "Precio único: USD 500 por hotel (configuración, despliegue y puesta a marca incluida). "
    "Sin mensualidad: usted solo paga las comisiones de Stripe directamente a su banco. "
    "Incluye 30 días de soporte para garantizar un arranque sin fricciones.")
para(pdf,
    "Responda este mensaje y agendamos una demo de 15 minutos con su hotel ya cargado en la plataforma.")
pdf.ln(2)
pdf.set_font('Helvetica', 'B', 10.5)
pdf.set_text_color(*PRIMARY)
pdf.multi_cell(0, 5.5, "Quedo atento a sus comentarios. Saludos cordiales,")
pdf.ln(1)
pdf.set_font('Helvetica', '', 10.5)
pdf.set_text_color(30, 30, 30)
pdf.multi_cell(0, 5.5, "Jose Pablo Correa  ·  josepa9510@hotmail.com  ·  +57 320 734 8684")

out = r"C:\Users\Josep\.gemini\antigravity\scratch\hotel-turnkey-template\docs\propuesta-cliente.pdf"
pdf.output(out)
print("PDF generado en:", out)
