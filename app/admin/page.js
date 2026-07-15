'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminUserMenu from '@/components/AdminUserMenu';
import { BrandLogo } from '@/components/HotelBranding';
import { useTranslation } from '@/components/LanguageProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    occupancyRate: 0,
    totalBookings: 0,
    activeRooms: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/rooms')
      ]);

      const bookings = await bookingsRes.json();
      const rooms = await roomsRes.json();

      // Calcular estadísticas
      const paidBookings = bookings.filter(b => b.paymentStatus === 'paid' && b.status !== 'cancelled');
      const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

      // Calcular tasa de ocupación aproximada para hoy
      const todayStr = new Date().toISOString().split('T')[0];
      const todayBookingsCount = bookings.filter(b => {
        return b.status === 'confirmed' && b.checkIn <= todayStr && b.checkOut >= todayStr;
      }).length;

      const totalStock = rooms.reduce((sum, r) => sum + r.stock, 0);
      const occupancyRate = totalStock > 0 ? Math.round((todayBookingsCount / totalStock) * 100) : 0;

      setStats({
        totalRevenue,
        occupancyRate,
        totalBookings: bookings.length,
        activeRooms: rooms.length
      });

      // Ordenar por fecha de creación (los más recientes primero)
      const sortedBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentBookings(sortedBookings.slice(0, 5)); // Mostrar solo los 5 más recientes
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <Link href="/" style={styles.logoLink}>
          <BrandLogo />
          <span style={styles.logoSub}>{t('nav.admin')}</span>
        </Link>

        <nav style={styles.nav}>
          <Link href="/admin" style={{ ...styles.navItem, ...styles.navItemActive }}>
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
          <Link href="/admin/users" style={styles.navItem}>
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

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        {/* TOP BAR */}
        <header style={styles.topBar}>
          <div>
            <h2 style={styles.title}>{t('admin.panel')}</h2>
            <p style={styles.subtitle}>{t('admin.panelSub')}</p>
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
        ) : (
          <div style={styles.content}>
            {/* STATS CARDS */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>💸</span>
                <div>
                 <h4 style={styles.statLabel}>{t('admin.confirmedRevenue')}</h4>
                 <p style={styles.statVal}>${stats.totalRevenue.toFixed(2)} USD</p>
               </div>
             </div>
             <div style={styles.statCard}>
               <span style={styles.statIcon}>🛌</span>
               <div>
                 <h4 style={styles.statLabel}>{t('admin.occupancy')}</h4>
                 <p style={styles.statVal}>{stats.occupancyRate}%</p>
               </div>
             </div>
             <div style={styles.statCard}>
               <span style={styles.statIcon}>📅</span>
               <div>
                 <h4 style={styles.statLabel}>{t('admin.totalBookings')}</h4>
                 <p style={styles.statVal}>{stats.totalBookings}</p>
               </div>
             </div>
             <div style={styles.statCard}>
               <span style={styles.statIcon}>🔑</span>
               <div>
                 <h4 style={styles.statLabel}>{t('admin.roomsCount')}</h4>
                 <p style={styles.statVal}>{stats.activeRooms}</p>
               </div>
             </div>
            </div>

            {/* RECENT BOOKINGS */}
            <div style={styles.dashboardSection}>
              <div style={styles.sectionHeader}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{t('admin.recent')}</h3>
                <Link href="/admin/bookings" style={styles.viewAllBtn}>{t('admin.viewAll')}</Link>
              </div>

              {recentBookings.length === 0 ? (
                <div style={styles.emptyState}>
                   <p>{t('admin.emptyBookings')}</p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                         <th style={styles.th}>ID</th>
                         <th style={styles.th}>{t('admin.guest')}</th>
                         <th style={styles.th}>{t('admin.checkIn')}</th>
                         <th style={styles.th}>{t('admin.checkOut')}</th>
                         <th style={styles.th}>{t('admin.total')}</th>
                         <th style={styles.th}>{t('admin.status')}</th>
                         <th style={styles.th}>{t('admin.payment')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map(b => (
                        <tr key={b.id} style={styles.tr}>
                          <td style={styles.tdCode}>{b.id}</td>
                          <td style={styles.td}>{b.guestName}</td>
                          <td style={styles.td}>{b.checkIn}</td>
                          <td style={styles.td}>{b.checkOut}</td>
                          <td style={styles.tdPrice}>${b.totalPrice.toFixed(2)}</td>
                          <td style={styles.td}>
                            <span style={b.status === 'confirmed' ? styles.badgeSuccess : b.status === 'pending' ? styles.badgeWarning : styles.badgeDanger}>
                              {b.status === 'confirmed' ? t('admin.statusConfirmed') : b.status === 'pending' ? t('admin.statusPending') : t('admin.statusCancelled')}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={b.paymentStatus === 'paid' ? styles.badgeSuccess : styles.badgeDanger}>
                              {b.paymentStatus === 'paid' ? t('admin.paid') : t('admin.unpaid')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#faf9f6', // Fondo off-white minimalista
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
  logoLink: {
    textDecoration: 'none',
    marginBottom: '40px',
    display: 'block',
  },
  logoSub: {
    fontSize: '10px',
    color: 'var(--accent)',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginTop: '4px',
    display: 'block',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: '1',
  },
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
  sidebarFooter: {
    marginTop: 'auto',
  },
  backLink: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    textDecoration: 'none',
    transition: 'var(--transition)',
    fontWeight: '500',
  },
  main: {
    flex: '1',
    marginLeft: '280px',
    padding: '40px 60px',
    minHeight: '100vh',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '24px',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '28px',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  adminProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '12px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    gap: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
  },
  statIcon: {
    fontSize: '28px',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  statVal: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  dashboardSection: {
    padding: '30px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  viewAllBtn: {
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  emptyState: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '40px 0',
    fontSize: '13px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
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
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  tdCode: {
    padding: '14px 16px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: 'var(--accent)',
    fontWeight: '600',
  },
  tdPrice: {
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--primary)',
  },
  badgeSuccess: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: '600',
  },
  badgeWarning: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: '600',
  },
  badgeDanger: {
    backgroundColor: '#ffe5e5',
    color: '#c62828',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: '600',
  },
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
  }
};
