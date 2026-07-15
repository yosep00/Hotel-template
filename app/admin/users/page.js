'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminUserMenu from '@/components/AdminUserMenu';
import { BrandLogo } from '@/components/HotelBranding';
import { useTranslation } from '@/components/LanguageProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [usersRes, roomsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/rooms'),
      ]);
      const usersData = await usersRes.json();
      const roomsData = await roomsRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setLoading(false);
    }
  }

  const roomName = (id) => {
    const r = rooms.find((x) => x.id === id);
    return r ? r.name : id;
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <Link href="/" style={styles.logoLink}>
          <BrandLogo />
          <span style={styles.logoSub}>{t('nav.admin')}</span>
        </Link>

        <nav style={styles.nav}>
          <Link href="/admin" style={styles.navItem}>
            📊 {t('admin.dashboard')}
          </Link>
          <Link href="/admin/analytics" style={styles.navItem}>
            📈 {t('admin.analytics')}
          </Link>
          <Link href="/admin/bookings" style={styles.navItem}>
            📅 {t('admin.bookings')}
          </Link>
          <Link href="/admin/rooms" style={styles.navItem}>
            🛏️ {t('admin.rooms')}
          </Link>
          <Link href="/admin/services" style={styles.navItem}>
            💎 {t('admin.services')}
          </Link>
          <Link
            href="/admin/users"
            style={{ ...styles.navItem, ...styles.navItemActive }}
          >
            👥 {t('admin.users')}
          </Link>
          <Link href="/admin/settings" style={styles.navItem}>
            ⚙️ {t('admin.settings')}
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <Link href="/" style={styles.backLink}>
            ← {t('nav.backToSite')}
          </Link>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.topBar}>
          <div>
            <h2 style={styles.title}>{t('admin.usersTitle')}</h2>
            <p style={styles.subtitle}>{t('admin.usersSub')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSwitcher />
            <AdminUserMenu />
          </div>
        </header>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Cargando información...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={styles.emptyState}>
            <p>{t('admin.noUsers')}</p>
          </div>
        ) : (
          <div style={styles.dashboardSection}>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>{t('admin.guest')}</th>
                    <th style={styles.th}>{t('admin.role')}</th>
                    <th style={styles.th}>{t('admin.registered')}</th>
                    <th style={styles.th}>{t('admin.bookingsCount')}</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <FragmentRow
                      key={u.id}
                      user={u}
                      roomName={roomName}
                      t={t}
                      expanded={expanded === u.id}
                      onToggle={() =>
                        setExpanded((prev) => (prev === u.id ? null : u.id))
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function FragmentRow({ user, roomName, t, expanded, onToggle }) {
  const created = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : '-';
  return (
    <>
      <tr style={styles.tr} onClick={onToggle} className="user-row">
        <td style={styles.td}>
          <div style={{ fontWeight: '600' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {user.email}
          </div>
        </td>
        <td style={styles.td}>
          <span
            style={
              user.role === 'admin' ? styles.badgeInfo : styles.badgeNeutral
            }
          >
            {user.role === 'admin' ? t('admin.roleAdmin') : t('admin.roleClient')}
          </span>
        </td>
        <td style={styles.td}>{created}</td>
        <td style={styles.tdPrice}>{user.bookings?.length || 0}</td>
        <td style={{ ...styles.td, textAlign: 'right' }}>
          <span style={{ color: 'var(--accent)', fontSize: '12px' }}>
            {expanded ? '▲' : '▼'} {t('admin.viewBookings')}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} style={styles.detailCell}>
            {!user.bookings || user.bookings.length === 0 ? (
              <p style={styles.detailEmpty}>{t('admin.noUserBookings')}</p>
            ) : (
              <div style={styles.bookingList}>
                {user.bookings.map((b) => (
                  <div key={b.id} style={styles.bookingItem}>
                    <div>
                      <strong>{roomName(b.roomId)}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {b.checkIn} → {b.checkOut}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600' }}>
                        ${b.totalPrice?.toFixed?.(2) || b.totalPrice}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <span
                          style={
                            b.status === 'confirmed'
                              ? styles.badgeSuccess
                              : b.status === 'pending'
                              ? styles.badgeWarning
                              : styles.badgeDanger
                          }
                        >
                          {b.status === 'confirmed'
                            ? t('admin.statusConfirmed')
                            : b.status === 'pending'
                            ? t('admin.statusPending')
                            : t('admin.statusCancelled')}
                        </span>
                        <span
                          style={
                            b.paymentStatus === 'paid'
                              ? styles.badgeSuccess
                              : styles.badgeDanger
                          }
                        >
                          {b.paymentStatus === 'paid' ? t('admin.paid') : t('admin.unpaid')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#faf9f6',
    color: '#1a1a1a',
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid var(--border-color)',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
  logoLink: { textDecoration: 'none', marginBottom: '40px', display: 'block' },
  logoSub: {
    fontSize: '10px',
    color: 'var(--accent)',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginTop: '4px',
    display: 'block',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: '6px', flex: '1' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'var(--transition)',
  },
  navItemActive: {
    backgroundColor: '#f5f2ed',
    color: 'var(--primary)',
    fontWeight: '600',
  },
  sidebarFooter: { marginTop: 'auto' },
  backLink: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    textDecoration: 'none',
    fontWeight: '500',
  },
  main: { flex: '1', marginLeft: '280px', padding: '40px 60px', minHeight: '100vh' },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '24px',
  },
  title: { fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '500' },
  subtitle: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 0',
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
  emptyState: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '40px 0',
    fontSize: '13px',
  },
  dashboardSection: {
    padding: '30px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f2efeb',
    transition: 'var(--transition)',
    cursor: 'pointer',
  },
  td: { padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' },
  tdPrice: { padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: 'var(--primary)' },
  detailCell: {
    padding: '20px 16px',
    backgroundColor: '#faf9f6',
    borderBottom: '1px solid #f2efeb',
  },
  detailEmpty: { fontSize: '13px', color: 'var(--text-muted)', margin: 0 },
  bookingList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  bookingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
  },
  badgeSuccess: {
    backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 8px',
    borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600',
  },
  badgeWarning: {
    backgroundColor: '#fff3e0', color: '#e65100', padding: '4px 8px',
    borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600',
  },
  badgeDanger: {
    backgroundColor: '#ffe5e5', color: '#c62828', padding: '4px 8px',
    borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600',
  },
  badgeInfo: {
    backgroundColor: '#e3f2fd', color: '#1565c0', padding: '4px 8px',
    borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600',
  },
  badgeNeutral: {
    backgroundColor: '#f2efeb', color: 'var(--text-secondary)', padding: '4px 8px',
    borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600',
  },
};
