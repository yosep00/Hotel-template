'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminUserMenu from '@/components/AdminUserMenu';
import { BrandLogo } from '@/components/HotelBranding';
import { useTranslation } from '@/components/LanguageProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    avgBooking: 0,
    confirmedBookings: 0,
    cancelRate: 0,
    pendingPayments: 0,
  });
  const [monthly, setMonthly] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [topRooms, setTopRooms] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/rooms'),
      ]);
      const bookings = await bookingsRes.json();
      const rooms = await roomsRes.json();

      const paid = bookings.filter(
        (b) => b.paymentStatus === 'paid' && b.status !== 'cancelled'
      );
      const totalRevenue = paid.reduce((s, b) => s + b.totalPrice, 0);
      const confirmedBookings = bookings.filter(
        (b) => b.status === 'confirmed'
      ).length;
      const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
      const pendingPayments = bookings.filter(
        (b) => b.paymentStatus === 'unpaid' && b.status !== 'cancelled'
      ).length;

      setKpis({
        totalRevenue,
        avgBooking: paid.length > 0 ? totalRevenue / paid.length : 0,
        confirmedBookings,
        cancelRate:
          bookings.length > 0
            ? Math.round((cancelled / bookings.length) * 100)
            : 0,
        pendingPayments,
      });

      // Ingresos últimos 6 meses
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          label: d.toLocaleString(undefined, { month: 'short' }),
          revenue: 0,
        });
      }
      paid.forEach((b) => {
        const d = new Date(b.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const m = months.find((x) => x.key === key);
        if (m) m.revenue += b.totalPrice;
      });
      setMonthly(months);

      // Reservas por estado
      setStatusBreakdown([
        {
          label: t('admin.statusConfirmed'),
          value: confirmedBookings,
          color: '#2e7d32',
        },
        {
          label: t('admin.statusPending'),
          value: bookings.filter((b) => b.status === 'pending').length,
          color: '#e65100',
        },
        {
          label: t('admin.statusCancelled'),
          value: cancelled,
          color: '#c62828',
        },
      ]);

      // Top habitaciones por ingresos
      const roomMap = {};
      rooms.forEach((r) => {
        roomMap[r.id] = { name: r.name, revenue: 0, count: 0 };
      });
      paid.forEach((b) => {
        if (roomMap[b.roomId]) {
          roomMap[b.roomId].revenue += b.totalPrice;
          roomMap[b.roomId].count += 1;
        }
      });
      const sortedRooms = Object.values(roomMap)
        .filter((r) => r.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopRooms(sortedRooms);

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar analíticas:', err);
      setLoading(false);
    }
  }

  const maxMonthly = Math.max(1, ...monthly.map((m) => m.revenue));
  const totalStatus = statusBreakdown.reduce((s, x) => s + x.value, 0);
  const maxRoomRevenue = Math.max(1, ...topRooms.map((r) => r.revenue));

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
          <Link
            href="/admin/analytics"
            style={{ ...styles.navItem, ...styles.navItemActive }}
          >
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

      <main style={styles.main}>
        <header style={styles.topBar}>
          <div>
            <h2 style={styles.title}>{t('admin.analyticsTitle')}</h2>
            <p style={styles.subtitle}>{t('admin.analyticsSub')}</p>
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
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>💸</span>
                <div>
                  <h4 style={styles.statLabel}>
                    {t('admin.confirmedRevenue')}
                  </h4>
                  <p style={styles.statVal}>
                    ${kpis.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>🧾</span>
                <div>
                  <h4 style={styles.statLabel}>{t('admin.avgBooking')}</h4>
                  <p style={styles.statVal}>${kpis.avgBooking.toFixed(2)}</p>
                </div>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>✅</span>
                <div>
                  <h4 style={styles.statLabel}>
                    {t('admin.confirmedBookings')}
                  </h4>
                  <p style={styles.statVal}>{kpis.confirmedBookings}</p>
                </div>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>🚫</span>
                <div>
                  <h4 style={styles.statLabel}>{t('admin.cancelRate')}</h4>
                  <p style={styles.statVal}>{kpis.cancelRate}%</p>
                </div>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>⏳</span>
                <div>
                  <h4 style={styles.statLabel}>
                    {t('admin.pendingPayments')}
                  </h4>
                  <p style={styles.statVal}>{kpis.pendingPayments}</p>
                </div>
              </div>
            </div>

            <div style={styles.chartsRow}>
              {/* REVENUE BY MONTH */}
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>{t('admin.revenueByMonth')}</h3>
                {maxMonthly <= 1 && monthly.every((m) => m.revenue === 0) ? (
                  <p style={styles.noData}>{t('admin.noData')}</p>
                ) : (
                  <div style={styles.barChart}>
                    {monthly.map((m) => (
                      <div key={m.key} style={styles.barCol}>
                        <span style={styles.barValue}>
                          ${Math.round(m.revenue)}
                        </span>
                        <div
                          style={{
                            ...styles.bar,
                            height: `${(m.revenue / maxMonthly) * 140 + 2}px`,
                          }}
                        ></div>
                        <span style={styles.barLabel}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BOOKINGS BY STATUS */}
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>{t('admin.bookingsByStatus')}</h3>
                {totalStatus === 0 ? (
                  <p style={styles.noData}>{t('admin.noData')}</p>
                ) : (
                  <div style={styles.statusList}>
                    {statusBreakdown.map((s) => (
                      <div key={s.label} style={styles.statusRow}>
                        <div style={styles.statusHead}>
                          <span
                            style={{ ...styles.dot, backgroundColor: s.color }}
                          ></span>
                          <span style={styles.statusLabel}>{s.label}</span>
                          <span style={styles.statusCount}>
                            {s.value} (
                            {Math.round((s.value / totalStatus) * 100)}%)
                          </span>
                        </div>
                        <div style={styles.progressTrack}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${(s.value / totalStatus) * 100}%`,
                              backgroundColor: s.color,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TOP ROOMS */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>{t('admin.topRooms')}</h3>
              {topRooms.length === 0 ? (
                <p style={styles.noData}>{t('admin.noData')}</p>
              ) : (
                <div style={styles.statusList}>
                  {topRooms.map((r) => (
                    <div key={r.name} style={styles.statusRow}>
                      <div style={styles.statusHead}>
                        <span style={styles.statusLabel}>{r.name}</span>
                        <span style={styles.statusCount}>
                          ${r.revenue.toFixed(2)} · {r.count}{' '}
                          {t('admin.bookingsUnit')}
                        </span>
                      </div>
                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${(r.revenue / maxRoomRevenue) * 100}%`,
                            backgroundColor: 'var(--accent)',
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    padding: '30px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '24px',
  },
  barChart: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '12px',
    height: '190px',
    paddingTop: '20px',
  },
  barCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: '1',
    height: '100%',
    gap: '6px',
  },
  bar: {
    width: '100%',
    maxWidth: '46px',
    backgroundColor: 'var(--primary)',
    borderRadius: '6px 6px 0 0',
    transition: 'var(--transition)',
  },
  barValue: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  barLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize',
  },
  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  statusRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  statusLabel: {
    fontWeight: '600',
    color: 'var(--primary)',
  },
  statusCount: {
    marginLeft: 'auto',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: '600',
  },
  progressTrack: {
    height: '8px',
    borderRadius: '4px',
    backgroundColor: '#f2efeb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'var(--transition)',
  },
  noData: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    padding: '30px 0',
    textAlign: 'center',
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
  },
};
