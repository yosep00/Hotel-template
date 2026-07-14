'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación en cada navegación
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.role === 'admin') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al validar sesión:", err);
        setAuthorized(false);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={styles.accessDeniedPage}>
        <div style={styles.accessDeniedCard} className="glass">
          <span style={styles.icon}>🔒</span>
          <h1 style={styles.title}>Acceso Denegado</h1>
          <p style={styles.description}>
            Esta sección es exclusiva para el personal del hotel. No tienes permisos de administrador asociados a tu sesión.
          </p>
          <div style={styles.btnGroup}>
            <Link href="/login?redirect=/admin" style={styles.btnPrimary}>
              Iniciar Sesión como Admin
            </Link>
            <Link href="/" style={styles.btnSecondary}>
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si está autorizado (es admin), renderizar las páginas del dashboard
  return <>{children}</>;
}

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#faf9f6',
    color: '#1a1a1a',
    gap: '20px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--border-color)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  accessDeniedPage: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: '#faf9f6',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  accessDeniedCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
    padding: '40px',
    width: '450px',
    maxWidth: '100%',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  icon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '20px',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '24px',
    fontWeight: '500',
    marginBottom: '12px',
  },
  description: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '28px',
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  btnPrimary: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  btnSecondary: {
    backgroundColor: '#ffffff',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '11px 24px',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }
};
