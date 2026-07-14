'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminUserMenu from '@/components/AdminUserMenu';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/rooms')
      ]);

      const bookingsData = await bookingsRes.json();
      const roomsData = await roomsRes.json();

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar reservas:", err);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus, newPaymentStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus
        })
      });

      if (!res.ok) throw new Error("No se pudo actualizar la reserva");
      
      // Recargar datos localmente
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta reserva del sistema permanentemente?")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("No se pudo eliminar la reserva");

      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getRoomName = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : "Habitación Desconocida";
  };

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <Link href="/" style={styles.logoLink}>
          <div className="logo">
            GRAND<span>OASIS</span>
          </div>
          <span style={styles.logoSub}>Panel Admin</span>
        </Link>
        
        <nav style={styles.nav}>
          <Link href="/admin" style={styles.navItem}>
            📊 Dashboard
          </Link>
          <Link href="/admin/bookings" style={{ ...styles.navItem, ...styles.navItemActive }}>
            📅 Reservas
          </Link>
          <Link href="/admin/rooms" style={styles.navItem}>
            🔑 Habitaciones / Inventario
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <Link href="/" style={styles.backLink}>
            ← Volver a la Web Principal
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        {/* TOP BAR */}
        <header style={styles.topBar}>
          <div>
            <h2 style={styles.title}>Listado de Reservas</h2>
            <p style={styles.subtitle}>Consulta y actualiza el estado de las estadías.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={styles.filters}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Filtrar por Estado:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field"
                style={styles.filterSelect}
              >
                <option value="all">Todas las Reservas</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
            <AdminUserMenu />
          </div>
        </header>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Cargando reservas...</p>
          </div>
        ) : (
          <div style={styles.content}>
            {filteredBookings.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No se encontraron reservas.</p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Huésped</th>
                      <th style={styles.th}>Habitación</th>
                      <th style={styles.th}>Estadía</th>
                      <th style={styles.th}>Monto</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Pago</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b.id} style={styles.tr}>
                        <td style={styles.tdCode}>{b.id}</td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{b.guestName}</div>
                          <div style={styles.guestSub}>{b.guestEmail} • {b.guestPhone}</div>
                        </td>
                        <td style={styles.td}>{getRoomName(b.roomId)}</td>
                        <td style={styles.td}>
                          <div>{b.checkIn} al {b.checkOut}</div>
                        </td>
                        <td style={styles.tdPrice}>${b.totalPrice.toFixed(2)}</td>
                        <td style={styles.td}>
                          <span style={b.status === 'confirmed' ? styles.badgeSuccess : b.status === 'pending' ? styles.badgeWarning : styles.badgeDanger}>
                            {b.status === 'confirmed' ? 'Confirmado' : b.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={b.paymentStatus === 'paid' ? styles.badgeSuccess : styles.badgeDanger}>
                            {b.paymentStatus === 'paid' ? 'Pagado' : 'Impago'}
                          </span>
                        </td>
                        <td style={styles.tdActions}>
                          <div style={styles.actionBtnGroup}>
                            {b.status === 'pending' && (
                              <button 
                                onClick={() => handleUpdateStatus(b.id, 'confirmed', 'paid')}
                                style={styles.btnActionConfirm}
                              >
                                Confirmar
                              </button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button 
                                onClick={() => handleUpdateStatus(b.id, 'cancelled', b.paymentStatus)}
                                style={styles.btnActionCancel}
                              >
                                Cancelar
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteBooking(b.id)}
                              style={styles.btnActionDelete}
                              title="Eliminar del sistema"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterSelect: {
    width: '180px',
    height: '38px',
    padding: '0 10px',
  },
  content: {
    padding: '30px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
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
  guestSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '2px',
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
  tdActions: {
    padding: '14px 16px',
  },
  actionBtnGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  btnActionConfirm: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'var(--transition)',
  },
  btnActionCancel: {
    backgroundColor: '#ffffff',
    color: '#c62828',
    border: '1px solid #c62828',
    padding: '5px 12px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'var(--transition)',
  },
  btnActionDelete: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
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
