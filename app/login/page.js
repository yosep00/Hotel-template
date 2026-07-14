'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si ya tiene sesión activa, redirigir automáticamente
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          router.push(data.user.role === 'admin' ? '/admin' : '/');
        }
      });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // Redirigir según el rol del usuario
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }
      
      // Forzar recarga de cabeceras para actualizar estados de login
      router.refresh();

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="glass">
        <Link href="/" style={styles.logoLink}>
          <div className="logo" style={{ textAlign: 'center', justifyContent: 'center' }}>
            GRAND<span>OASIS</span>
          </div>
        </Link>

        <h2 style={styles.title}>Iniciar Sesión</h2>
        <p style={styles.subtitle}>Ingresa tus credenciales para acceder a tu cuenta.</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@grandoasis.com"
              required
              className="input-field"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-field"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <div style={styles.spinner}></div> : "Ingresar"}
          </button>
        </form>

        <div style={styles.divider}></div>

        <p style={styles.footerText}>
          ¿No tienes una cuenta de cliente? <Link href="/register" style={styles.link}>Regístrate aquí</Link>
        </p>

        <div style={styles.demoCredentials}>
          <p style={{ fontWeight: '700', marginBottom: '4px' }}>🔑 Cuentas de demostración:</p>
          <p>• <strong>Administrador del Hotel:</strong> admin@grandoasis.com / admin123</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={styles.page}>
        <div style={styles.card}>
          <p>Cargando inicio de sesión...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

const styles = {
  page: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: '#faf9f6',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '400px',
    maxWidth: '100%',
    padding: '40px 30px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.02)',
  },
  logoLink: {
    textDecoration: 'none',
    display: 'block',
    marginBottom: '30px',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '24px',
    fontWeight: '500',
    textAlign: 'center',
    color: 'var(--primary)',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
  },
  errorAlert: {
    backgroundColor: '#ffe5e5',
    color: '#c62828',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  submitBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--transition)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '44px',
    marginTop: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '24px 0',
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    margin: 0,
  },
  link: {
    color: 'var(--accent)',
    fontWeight: '600',
    textDecoration: 'none',
  },
  demoCredentials: {
    marginTop: '24px',
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border-color)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.2)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }
};
