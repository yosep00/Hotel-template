'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminUserMenu() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignorar errores de red al cerrar sesión
    }
    setUser(null);
    setMenuOpen(false);
    router.push('/');
  };

  const displayName = user?.name || user?.email || 'Administrador';
  const initial = (user?.name?.[0] || user?.email?.[0] || 'A').toUpperCase();

  const menuItemStyle = {
    display: 'block',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--text, #1a1a1a)',
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif'
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '999px',
          border: '1px solid var(--border-color, #e2d9c8)',
          background: '#fff',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <span style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--accent, #b08458)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          {initial}
        </span>
        <span style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          maxWidth: '160px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {displayName}
        </span>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: '230px',
          background: '#fff',
          border: '1px solid var(--border-color, #e2d9c8)',
          borderRadius: '12px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          padding: '8px',
          zIndex: 50,
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-color, #e2d9c8)',
            marginBottom: '6px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text, #1a1a1a)' }}>
              {user?.name || 'Administrador'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {user?.email}
            </p>
            <span style={{
              display: 'inline-block',
              marginTop: '6px',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(176,132,88,0.15)',
              color: 'var(--accent, #b08458)',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {user?.role || 'admin'}
            </span>
          </div>

          <Link href="/" onClick={() => setMenuOpen(false)} style={menuItemStyle}>
            🏠 Volver a la Web Principal
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{ ...menuItemStyle, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
