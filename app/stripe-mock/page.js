'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BrandName } from '@/components/HotelBranding';

function StripeMockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  // Campos de tarjeta
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expDate, setExpDate] = useState('12/28');
  const [cvc, setCvc] = useState('424');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError("Falta el ID de la reserva");
      setLoading(false);
      return;
    }

    // Cargar datos de la reserva
    fetch(`/api/bookings/${bookingId}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la reserva");
        return res.json();
      })
      .then(bookingData => {
        setBooking(bookingData);
        setName(bookingData.guestName);
        // Cargar datos de la habitación
        return fetch(`/api/rooms/${bookingData.roomId}`);
      })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar la habitación");
        return res.json();
      })
      .then(roomData => {
        setRoom(roomData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookingId]);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);

    try {
      // Simular procesamiento del pago (1.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Actualizar el estado de la reserva a Confirmada y Pagada
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          paymentStatus: 'paid'
        })
      });

      if (!response.ok) throw new Error("No se pudo actualizar el estado de la reserva");

      // Redirigir a la pantalla de éxito
      router.push(`/booking-success?bookingId=${bookingId}`);
    } catch (err) {
      alert("Error al procesar el pago simulado: " + err.message);
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando Stripe Checkout...</p>
      </div>
    );
  }

  if (error || !booking || !room) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error de Pago</h2>
        <p>{error || "No se encontró la reserva solicitada."}</p>
        <Link href="/" style={styles.backButton}>Volver al Inicio</Link>
      </div>
    );
  }

  // Calcular noches
  const inDate = new Date(booking.checkIn);
  const outDate = new Date(booking.checkOut);
  const nights = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* LADO IZQUIERDO: Resumen de Compra */}
        <div style={styles.leftColumn}>
          <Link href="/" style={styles.stripeLogoLink}>
            <div style={styles.stripeBadge}>MOCK SANDBOX</div>
          </Link>
          <div style={styles.summaryContent}>
            <Link href="/" style={styles.backLinkTop}>← Volver</Link>
            <span style={styles.hotelName}><BrandName /></span>
            <h1 style={styles.amount}>${booking.totalPrice.toFixed(2)} <span style={styles.currency}>USD</span></h1>
            
            <div style={styles.roomCard}>
              {room.images && room.images[0] && (
                <img src={room.images[0]} alt={room.name} style={styles.roomImage} />
              )}
              <div>
                <h3 style={styles.roomName}>{room.name}</h3>
                <p style={styles.roomDetails}>{nights} {nights === 1 ? 'noche' : 'noches'} • {booking.checkIn} al {booking.checkOut}</p>
              </div>
            </div>

            <div style={styles.priceBreakdown}>
              <div style={styles.breakdownRow}>
                <span>Subtotal ({nights} noches x ${room.basePrice.toFixed(2)})</span>
                <span>${(nights * room.basePrice).toFixed(2)}</span>
              </div>
              <div style={styles.breakdownRow}>
                <span>Impuestos de hospedaje (0%)</span>
                <span>$0.00</span>
              </div>
              <div style={{ ...styles.breakdownRow, ...styles.totalRow }}>
                <span>Total a pagar</span>
                <span>${booking.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Formulario de Pago */}
        <div style={styles.rightColumn}>
          <form onSubmit={handlePay} style={styles.form}>
            <h2 style={styles.formTitle}>Pagar con tarjeta</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Correo electrónico</label>
              <input 
                type="email" 
                defaultValue={booking.guestEmail} 
                disabled 
                style={styles.inputDisabled} 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Información de la tarjeta</label>
              <div style={styles.cardInputWrapper}>
                <input 
                  type="text" 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456" 
                  required 
                  style={styles.cardInputNumber}
                />
                <div style={styles.cardInputRow}>
                  <input 
                    type="text" 
                    value={expDate} 
                    onChange={(e) => setExpDate(e.target.value)}
                    placeholder="MM/AA" 
                    required 
                    style={styles.cardInputHalf}
                  />
                  <input 
                    type="text" 
                    value={cvc} 
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="CVC" 
                    required 
                    style={styles.cardInputHalf}
                  />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre del titular</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre como aparece en la tarjeta" 
                required 
                style={styles.input} 
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>País o región</label>
              <select style={styles.input}>
                <option>México</option>
                <option>Colombia</option>
                <option>España</option>
                <option>Estados Unidos</option>
                <option>Otros</option>
              </select>
            </div>

            <button type="submit" disabled={paying} style={styles.payButton}>
              {paying ? (
                <div style={styles.btnSpinner}></div>
              ) : (
                `Pagar $${booking.totalPrice.toFixed(2)}`
              )}
            </button>

            <p style={styles.disclaimer}>
              Esta es una pasarela de pago simulada para demostración. No ingreses datos reales de tarjetas de crédito. Utiliza la tarjeta de pruebas proporcionada.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StripeMock() {
  return (
    <Suspense fallback={
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando Stripe Checkout...</p>
      </div>
    }>
      <StripeMockContent />
    </Suspense>
  );
}

const styles = {
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#30313d',
    padding: '20px',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0px 15px 35px rgba(50, 50, 93, 0.1), 0px 5px 15px rgba(0, 0, 0, 0.07)',
    display: 'flex',
    flexDirection: 'row',
    width: '1000px',
    maxWidth: '100%',
    minHeight: '600px',
    overflow: 'hidden',
    flexWrap: 'wrap',
  },
  leftColumn: {
    backgroundColor: '#f3f4f6',
    flex: '1.2',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: '320px',
    borderRight: '1px solid #e5e7eb',
  },
  rightColumn: {
    flex: '1',
    padding: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '320px',
  },
  stripeLogoLink: {
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: '20px',
  },
  stripeBadge: {
    backgroundColor: '#635bff',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    display: 'inline-block',
  },
  summaryContent: {
    marginTop: '20px',
  },
  hotelName: {
    color: '#697386',
    fontSize: '16px',
    fontWeight: '500',
  },
  amount: {
    fontSize: '40px',
    margin: '10px 0 30px 0',
    color: '#1a1f36',
    fontWeight: '700',
  },
  currency: {
    fontSize: '20px',
    color: '#697386',
    fontWeight: 'normal',
  },
  roomCard: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    marginBottom: '30px',
    gap: '16px',
  },
  roomImage: {
    width: '64px',
    height: '64px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  roomName: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: '#1a1f36',
  },
  roomDetails: {
    fontSize: '13px',
    color: '#697386',
    margin: 0,
  },
  priceBreakdown: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px',
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#697386',
    marginBottom: '12px',
  },
  totalRow: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1f36',
    marginTop: '12px',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1f36',
    margin: '0 0 10px 0',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#30313d',
  },
  input: {
    padding: '12px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #e0e6ed',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    backgroundColor: '#ffffff',
  },
  inputDisabled: {
    padding: '12px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #e0e6ed',
    backgroundColor: '#f3f4f6',
    color: '#697386',
    cursor: 'not-allowed',
  },
  cardInputWrapper: {
    border: '1px solid #e0e6ed',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  cardInputNumber: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    border: 'none',
    borderBottom: '1px solid #e0e6ed',
    outline: 'none',
    boxSizing: 'border-box',
  },
  cardInputRow: {
    display: 'flex',
  },
  cardInputHalf: {
    width: '50%',
    padding: '12px',
    fontSize: '15px',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    borderRight: '1px solid #e0e6ed',
  },
  payButton: {
    backgroundColor: '#635bff',
    color: '#ffffff',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '48px',
    marginTop: '10px',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#697386',
    textAlign: 'center',
    lineHeight: '1.5',
    margin: 0,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'system-ui',
    gap: '20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e0e6ed',
    borderTop: '5px solid #635bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  btnSpinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'system-ui',
    padding: '20px',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#111827',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '20px',
  },
  backLinkTop: {
    display: 'inline-block',
    color: '#697386',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    marginBottom: '24px',
  },
};
