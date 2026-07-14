'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("No se proporcionó el código de reserva");
      setLoading(false);
      return;
    }

    fetch(`/api/bookings/${bookingId}`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener la reserva");
        return res.json();
      })
      .then(bookingData => {
        setBooking(bookingData);
        return fetch(`/api/rooms/${bookingData.roomId}`);
      })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener la habitación");
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

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.user?.role === 'admin'))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Confirmando tu reserva...</p>
      </div>
    );
  }

  if (error || !booking || !room) {
    return (
      <div style={styles.errorContainer}>
        <h2>Ups, ocurrió un error</h2>
        <p>{error || "No pudimos cargar la información de tu reserva."}</p>
        <Link href="/" style={styles.btnPrimary}>Ir a la Página Principal</Link>
      </div>
    );
  }

  // Calcular noches
  const inDate = new Date(booking.checkIn);
  const outDate = new Date(booking.checkOut);
  const nights = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.successIconWrapper}>
          <svg style={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle style={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
            <path style={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <h1 style={styles.title}>¡Reserva Confirmada!</h1>
        <p style={styles.subtitle}>Hemos recibido tu pago de forma exitosa. Tu lugar está asegurado.</p>

        <div style={styles.divider}></div>

        <div style={styles.detailsList}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Código de Reserva</span>
            <span style={styles.detailValueCode}>{booking.id}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Huésped Principal</span>
            <span style={styles.detailValue}>{booking.guestName}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Alojamiento</span>
            <span style={styles.detailValue}>{room.name}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Fechas</span>
            <span style={styles.detailValue}>{booking.checkIn} al {booking.checkOut} ({nights} {nights === 1 ? 'noche' : 'noches'})</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Total Pagado</span>
            <span style={styles.detailValuePrice}>${booking.totalPrice.toFixed(2)} USD</span>
          </div>
        </div>

        <div style={styles.divider}></div>

        <p style={styles.infoText}>
          Te hemos enviado un correo a <strong>{booking.guestEmail}</strong> con todos los detalles de tu estadía y las indicaciones de llegada.
        </p>

        <div style={styles.btnGroup}>
          <Link href="/" style={styles.btnPrimary}>Volver al Inicio</Link>
          {isAdmin && (
            <Link href="/admin" style={styles.btnSecondary}>Ver Panel Admin</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccess() {
  return (
    <Suspense fallback={
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Confirmando tu reserva...</p>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}

const styles = {
  page: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: '#0a0b10', // Fondo oscuro premium
    backgroundImage: 'radial-gradient(circle at top right, rgba(99, 91, 255, 0.08), transparent 40%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    backgroundColor: '#12131a', // Negro-grisáceo premium
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    padding: '40px',
    width: '550px',
    maxWidth: '100%',
    textAlign: 'center',
    color: '#ffffff',
  },
  successIconWrapper: {
    margin: '0 auto 24px auto',
    width: '80px',
    height: '80px',
  },
  checkmark: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'block',
    strokeWidth: '2',
    stroke: '#10b981', // Verde
    strokeMiterlimit: '10',
    boxShadow: 'inset 0px 0px 0px #10b981',
    animation: 'fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both',
  },
  checkmarkCircle: {
    strokeDasharray: '166',
    strokeDashoffset: '166',
    strokeWidth: '2',
    strokeMiterlimit: '10',
    stroke: '#10b981',
    fill: 'none',
    animation: 'stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
  },
  checkmarkCheck: {
    transformOrigin: '50% 50%',
    strokeDasharray: '48',
    strokeDashoffset: '48',
    stroke: '#10b981',
    animation: 'stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#9ca3af',
    margin: '0 0 32px 0',
    lineHeight: '1.6',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    margin: '24px 0',
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  detailLabel: {
    color: '#9ca3af',
  },
  detailValue: {
    color: '#f3f4f6',
    fontWeight: '500',
  },
  detailValueCode: {
    color: '#635bff',
    fontWeight: '600',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(99,91,255,0.1)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  detailValuePrice: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: '16px',
  },
  infoText: {
    fontSize: '13px',
    color: '#9ca3af',
    lineHeight: '1.6',
    margin: '0 0 32px 0',
  },
  btnGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: '#635bff',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
    flex: '1',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '12px 24px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
    flex: '1',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#0a0b10',
    color: '#ffffff',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #635bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#0a0b10',
    color: '#ffffff',
    padding: '24px',
    textAlign: 'center',
    gap: '16px',
  }
};
