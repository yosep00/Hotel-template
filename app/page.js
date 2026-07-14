'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [availabilities, setAvailabilities] = useState({}); // { roomId: { available: boolean, remaining: number } }

  // Estados para el Modal de Reserva
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  // Cerrar el menú de usuario al hacer clic fuera de él
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const userMenuItemStyle = {
    display: 'block',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--text, #2b2b2b)',
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif'
  };

  // Inicializar fechas con hoy y mañana
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    setCheckIn(formatDate(today));
    setCheckOut(formatDate(tomorrow));

    // Cargar sesión del usuario (nombre, rol) para el header
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => {});

    // Cargar habitaciones
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar habitaciones:", err);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;

    setLoading(true);
    setSearchTriggered(true);
    const newAvailabilities = {};

    // Consultar disponibilidad de cada habitación para el rango de fechas seleccionado
    for (const room of rooms) {
      try {
        const res = await fetch(`/api/check-availability?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`);
        const data = await res.json();
        newAvailabilities[room.id] = {
          available: data.available,
          remaining: data.remaining
        };
      } catch (err) {
        console.error(`Error verificando disponibilidad para ${room.name}:`, err);
        newAvailabilities[room.id] = { available: false, remaining: 0 };
      }
    }

    setAvailabilities(newAvailabilities);
    setLoading(false);

    // Scroll suave a la sección de habitaciones
    document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenBookingModal = (room) => {
    setSelectedRoom(room);
  };

  const handleCloseBookingModal = () => {
    setSelectedRoom(null);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignorar errores de red al cerrar sesión
    }
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedRoom || !checkIn || !checkOut) return;

    setBookingLoading(true);

    try {
      // 1. Crear la reserva en el backend
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn,
          checkOut,
          guestName,
          guestEmail,
          guestPhone
        })
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || "No se pudo procesar la reserva");
      }

      // 2. Crear la sesión de Checkout (Stripe Real o Mock)
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingData.id
        })
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.error || "No se pudo iniciar la pasarela de pagos");
      }

      // 3. Redirigir a la pasarela (Stripe real o simulador mock)
      window.location.href = checkoutData.url;

    } catch (err) {
      alert("Error en el proceso de reserva: " + err.message);
      setBookingLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER NAVIGATION */}
      <header className="header">
        <Link href="/" className="logo">
          GRAND<span>OASIS</span>
        </Link>
        <nav>
          <ul className="nav-links">
            <li><a href="#hero" className="nav-link">Inicio</a></li>
            <li><a href="#rooms-section" className="nav-link">Habitaciones</a></li>
            <li><a href="#services" className="nav-link">Servicios</a></li>
            <li><a href="#contact" className="nav-link">Contacto</a></li>
          </ul>
        </nav>
        <div style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAdmin && (
            <Link href="/admin" className="btn-admin-header">
              🔧 Panel Admin (Ver Reservas)
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }} ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: '1px solid var(--border, #e2d9c8)',
                  background: 'var(--surface, #fff)',
                  color: 'var(--text, #2b2b2b)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--primary, #b08458)', color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '600'
                }}>
                  {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </span>
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.email}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: '220px',
                  background: '#fff',
                  border: '1px solid var(--border, #e2d9c8)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  padding: '8px',
                  zIndex: 50,
                  fontFamily: 'Inter, sans-serif'
                }}>
                  <div style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid var(--border, #e2d9c8)',
                    marginBottom: '6px'
                  }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text, #2b2b2b)' }}>
                      {user.name || 'Usuario'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary, #8a8175)' }}>
                      {user.email}
                    </p>
                    <span style={{
                      display: 'inline-block', marginTop: '6px',
                      fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                      background: isAdmin ? 'rgba(176,132,88,0.15)' : 'rgba(0,0,0,0.05)',
                      color: isAdmin ? 'var(--primary, #b08458)' : 'var(--text-secondary, #8a8175)',
                      fontWeight: '600', textTransform: 'capitalize'
                    }}>
                      {user.role}
                    </span>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      style={userMenuItemStyle}
                    >
                      🔧 Panel Admin
                    </Link>
                  )}
                  <Link
                    href="/"
                    onClick={() => setUserMenuOpen(false)}
                    style={userMenuItemStyle}
                  >
                    🏠 Inicio
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ ...userMenuItemStyle, width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
                  >
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-admin-header" style={{ textDecoration: 'none' }}>
              Iniciar Sesión
            </Link>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" style={styles.hero}>
        <div style={styles.heroContent} className="animate-slide">
          <span style={styles.heroSubtitle}>ESTADÍAS DE DISEÑO EXCLUSIVO</span>
          <h1 style={styles.heroTitle}>Simplicidad, Naturaleza y Silencio</h1>
          <p style={styles.heroDescription}>
            Villas independientes y suites de diseño minimalista integradas con el entorno. Un refugio pensado para desconectar del ruido exterior.
          </p>
          <a href="#rooms-section" style={styles.heroBtn}>Ver Habitaciones</a>
        </div>

        {/* BOOKING BAR */}
        <div style={styles.searchBarWrapper}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchGroup}>
              <label style={styles.searchLabel}>Entrada</label>
              <input 
                type="date" 
                value={checkIn} 
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="input-field"
                style={styles.searchInputCustom}
              />
            </div>
            
            <div style={styles.searchGroup}>
              <label style={styles.searchLabel}>Salida</label>
              <input 
                type="date" 
                value={checkOut} 
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn ? checkIn : new Date().toISOString().split('T')[0]}
                required
                className="input-field"
                style={styles.searchInputCustom}
              />
            </div>

            <div style={styles.searchGroup}>
              <label style={styles.searchLabel}>Huéspedes</label>
              <select 
                value={guests} 
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="input-field"
                style={styles.searchInputCustom}
              >
                <option value={1}>1 Huésped</option>
                <option value={2}>2 Huéspedes</option>
                <option value={3}>3 Huéspedes</option>
                <option value={4}>4+ Huéspedes</option>
              </select>
            </div>
            
            <button type="submit" style={styles.searchBtn}>Buscar Disponibilidad</button>
          </form>
        </div>
      </section>

      {/* ROOMS SECTION */}
      <section id="rooms-section" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionSubtitle}>NUESTROS ESPACIOS</span>
          <h2 style={styles.sectionTitle}>Habitaciones Disponibles</h2>
          <div style={styles.underline}></div>
          {searchTriggered && (
            <p style={styles.searchAlert}>
              Resultados para estadía del <strong>{checkIn}</strong> al <strong>{checkOut}</strong>:
            </p>
          )}
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Buscando habitaciones...</p>
          </div>
        ) : (
          <div style={styles.roomsGrid}>
            {rooms.map(room => {
              const searchInfo = availabilities[room.id];
              const isAvailable = !searchTriggered || (searchInfo && searchInfo.available);
              const remaining = searchTriggered && searchInfo ? searchInfo.remaining : room.stock;
              
              return (
                <div key={room.id} style={styles.roomCard}>
                  <div style={styles.roomImageWrapper}>
                    <img 
                      src={room.images[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"} 
                      alt={room.name} 
                      style={styles.roomImg} 
                    />
                    <div style={styles.roomPriceBadge}>
                      ${room.basePrice.toFixed(2)} <span>/ noche</span>
                    </div>
                  </div>

                  <div style={styles.roomInfo}>
                    <h3 style={styles.roomName}>{room.name}</h3>
                    <p style={styles.roomDesc}>{room.description}</p>
                    
                    <div style={styles.roomDetailsRow}>
                      <span>Capacidad: {room.capacityAdults} ad. + {room.capacityChildren} niñ.</span>
                    </div>

                    <div style={styles.amenitiesList}>
                      {room.amenities.map(amenity => (
                        <span key={amenity} style={styles.amenityTag}>
                          {amenity === 'wifi' && '📶 Wi-Fi'}
                          {amenity === 'ac' && '❄️ A/C'}
                          {amenity === 'tv' && '📺 TV'}
                          {amenity === 'pool' && '🏊 Piscina'}
                          {amenity === 'jacuzzi' && '🛁 Jacuzzi'}
                          {amenity === 'breakfast' && '🍳 Desayuno'}
                          {amenity === 'minibar' && '🍷 Minibar'}
                          {amenity === 'kitchen' && '🍳 Cocina'}
                          {amenity === 'ocean_view' && '🌊 Vistas'}
                          {amenity === 'parking' && '🚗 Parking'}
                          {!['wifi','ac','tv','pool','jacuzzi','breakfast','minibar','kitchen','ocean_view','parking'].includes(amenity) && amenity}
                        </span>
                      ))}
                    </div>

                    {/* MOSTRAR CUANTAS HABITACIONES QUEDAN DISPONIBLES */}
                    <div style={styles.availabilityStatusRow}>
                      {searchTriggered ? (
                        remaining > 0 ? (
                          <div style={{ ...styles.stockLabel, color: remaining <= 2 ? 'var(--danger)' : 'var(--success)' }}>
                            {remaining === 1 ? '⚠️ ¡Última habitación disponible!' : `✓ Quedan ${remaining} habitaciones disponibles`}
                          </div>
                        ) : (
                          <div style={{ ...styles.stockLabel, color: 'var(--danger)' }}>
                            ✕ Agotado para estas fechas
                          </div>
                        )
                      ) : (
                        <div style={styles.stockLabelMuted}>
                          Disponibilidad base: {room.stock} habitaciones
                        </div>
                      )}
                    </div>

                    <div style={styles.roomActionRow}>
                      {isAvailable ? (
                        <button 
                          onClick={() => handleOpenBookingModal(room)}
                          style={styles.bookBtn}
                        >
                          Reservar Habitación
                        </button>
                      ) : (
                        <button 
                          disabled 
                          style={styles.soldOutBtn}
                        >
                          No disponible
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SERVICES SECTION */}
      <section id="services" style={styles.darkSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionSubtitle}>CONFORT Y SERVICIO</span>
          <h2 style={styles.sectionTitle}>Servicios Esenciales</h2>
          <div style={styles.underline}></div>
        </div>

        <div style={styles.servicesGrid}>
          <div style={styles.serviceCard} className="glass">
            <span style={styles.serviceIcon}>☕</span>
            <h3>Desayuno Artesanal</h3>
            <p>Ingredientes locales y frescos preparados a la carta cada mañana en nuestro huerto orgánico.</p>
          </div>
          <div style={styles.serviceCard} className="glass">
            <span style={styles.serviceIcon}>🧘</span>
            <h3>Zonas de Meditación</h3>
            <p>Espacios silenciosos integrados en la naturaleza para yoga, lectura y descanso mental profundo.</p>
          </div>
          <div style={styles.serviceCard} className="glass">
            <span style={styles.serviceIcon}>🚲</span>
            <h3>Bicicletas de Cortesía</h3>
            <p>Explora los alrededores rurales, senderos forestales o playas cercanas sin costo adicional.</p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionSubtitle}>CONTACTO</span>
          <h2 style={styles.sectionTitle}>Ubicación del Refugio</h2>
          <div style={styles.underline}></div>
        </div>

        <div style={styles.contactWrapper}>
          <div style={styles.contactInfoCard}>
            <h3>Grand Oasis Resort</h3>
            <p style={styles.contactText}>📍 Km 14.5, Boulevard Kukulcan, Zona Hotelera, Cancún</p>
            <p style={styles.contactText}>📞 Teléfono: +1 (555) 123-4567</p>
            <p style={styles.contactText}>✉️ Email: reservas@grandoasisresort.com</p>
            <div style={styles.mapMock}>
              <span>Mapa de Google</span>
            </div>
          </div>

          <form style={styles.contactForm}>
            <input type="text" placeholder="Tu Nombre" required className="input-field" style={styles.contactInput} />
            <input type="email" placeholder="Tu Correo" required className="input-field" style={styles.contactInput} />
            <textarea placeholder="¿Qué necesitas?" rows={3} required className="input-field" style={styles.contactTextarea}></textarea>
            <button type="submit" style={styles.heroBtn}>Enviar Mensaje</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>GRAND<span>OASIS</span></h3>
            <p>Un concepto hotelero simplificado. Enfocado en la arquitectura honesta, el descanso absoluto y el servicio directo.</p>
          </div>
          <div className="footer-column">
            <h4>Navegación</h4>
            <ul className="footer-links">
              <li><a href="#hero">Inicio</a></li>
              <li><a href="#rooms-section">Habitaciones</a></li>
              <li><a href="#services">Servicios</a></li>
              <li><a href="#contact">Contacto</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Administración</h4>
            <ul className="footer-links">
              {isAdmin && (
                <li>
                  <Link href="/admin" style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    🔧 Ver Reservas Hechas (Panel Admin)
                  </Link>
                </li>
              )}
              <li><a href="#">Políticas de Cancelación</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Contacto</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>reservas@grandoasisresort.com<br />+1 (555) 123-4567</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Grand Oasis Resort & Spa. Creado como plantilla de hotel minimalista moderna.</p>
          <p>Términos | Privacidad</p>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {selectedRoom && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="glass">
            <div style={styles.modalHeader}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px' }}>Datos del Huésped</h3>
              <button onClick={handleCloseBookingModal} style={styles.closeBtn}>×</button>
            </div>
            
            <form onSubmit={handleConfirmBooking} style={styles.modalForm}>
              <div style={styles.modalRoomDetails}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{selectedRoom.name}</h4>
                  <p style={{ color: 'var(--accent)', fontWeight: '600', fontSize: '14px', marginTop: '4px' }}>
                    ${selectedRoom.basePrice.toFixed(2)} USD / noche
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Estadía: <strong>{checkIn}</strong> al <strong>{checkOut}</strong>
                  </p>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Nombre Completo</label>
                <input 
                  type="text" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)} 
                  placeholder="Ej: Carlos Gómez"
                  required 
                  className="input-field"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Correo Electrónico</label>
                <input 
                  type="email" 
                  value={guestEmail} 
                  onChange={(e) => setGuestEmail(e.target.value)} 
                  placeholder="Ej: carlos@correo.com"
                  required 
                  className="input-field"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Teléfono</label>
                <input 
                  type="tel" 
                  value={guestPhone} 
                  onChange={(e) => setGuestPhone(e.target.value)} 
                  placeholder="Ej: +57 300 123 4567"
                  required 
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={bookingLoading} style={styles.modalSubmitBtn}>
                {bookingLoading ? (
                  <div style={styles.modalBtnSpinner}></div>
                ) : (
                  "Proceder al Pago Seguro"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  hero: {
    minHeight: '70vh',
    backgroundImage: 'linear-gradient(rgba(26,26,26,0.45), rgba(26,26,26,0.45)), url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#f5f2ed', // Fondo crema cálido minimalista (fallback)
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '80px 20px 100px 20px',
    position: 'relative',
    borderBottom: '1px solid var(--border-color)',
  },
  heroContent: {
    maxWidth: '750px',
    textAlign: 'center',
    marginBottom: '40px',
  },
  heroSubtitle: {
    color: '#e8e1d6',
    fontWeight: '700',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '44px',
    fontWeight: '500',
    color: '#ffffff',
    margin: '15px 0 20px 0',
    lineHeight: '1.2',
    letterSpacing: '-0.5px',
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: '15px',
    lineHeight: '1.7',
    marginBottom: '28px',
  },
  heroBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '500',
    fontSize: '13px',
    textDecoration: 'none',
    transition: 'var(--transition)',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  searchBarWrapper: {
    position: 'absolute',
    bottom: '-34px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '960px',
    zIndex: 10,
  },
  searchForm: {
    display: 'flex',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    padding: '16px 24px',
    borderRadius: 'var(--radius-lg)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'flex-end',
  },
  searchGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    minWidth: '180px',
    gap: '6px',
  },
  searchLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  searchInputCustom: {
    borderColor: 'var(--border-color)',
    height: '45px',
    fontSize: '13px',
  },
  searchBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '0 24px',
    height: '45px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--transition)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  section: {
    padding: '100px 40px 60px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  darkSection: {
    padding: '80px 40px',
    backgroundColor: '#f5f2ed',
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  sectionSubtitle: {
    color: 'var(--accent)',
    fontWeight: '600',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '32px',
    fontWeight: '500',
    marginTop: '8px',
    color: 'var(--primary)',
  },
  underline: {
    width: '40px',
    height: '1px',
    backgroundColor: 'var(--accent)',
    margin: '12px auto 0 auto',
  },
  searchAlert: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '12px',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '30px',
  },
  roomCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'var(--transition)',
  },
  roomImageWrapper: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden',
    borderBottom: '1px solid var(--border-color)',
  },
  roomImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  roomPriceBadge: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    backgroundColor: 'var(--primary)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
  },
  roomInfo: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
  },
  roomName: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: 'var(--primary)',
  },
  roomDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '16px',
    flex: '1',
  },
  roomDetailsRow: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginBottom: '14px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
  },
  amenitiesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px',
  },
  amenityTag: {
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border-color)',
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  availabilityStatusRow: {
    marginBottom: '16px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
  },
  stockLabel: {
    fontSize: '13px',
    fontWeight: '600',
  },
  stockLabelMuted: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  roomActionRow: {
    marginTop: 'auto',
  },
  bookBtn: {
    width: '100%',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--transition)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  soldOutBtn: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    color: 'var(--text-muted)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #e0e0e0',
    cursor: 'not-allowed',
    textTransform: 'uppercase',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  serviceCard: {
    padding: '30px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    textAlign: 'center',
  },
  serviceIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '16px',
  },
  contactWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '45px',
    alignItems: 'start',
  },
  contactInfoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  contactText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  mapMock: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    height: '180px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  contactForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  contactInput: {
    height: '42px',
  },
  contactTextarea: {
    resize: 'none',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '60px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--border-color)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,26,26,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '480px',
    maxWidth: '100%',
    borderRadius: 'var(--radius-lg)',
    padding: '30px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '24px',
    cursor: 'pointer',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalRoomDetails: {
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border-color)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '4px',
  },
  modalLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  modalSubmitBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '44px',
    marginTop: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  modalBtnSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.2)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }
};
