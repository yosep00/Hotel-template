'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminUserMenu from '@/components/AdminUserMenu';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el formulario modal (Creación / Edición)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  // Campos del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [capacityAdults, setCapacityAdults] = useState(2);
  const [capacityChildren, setCapacityChildren] = useState(0);
  const [stock, setStock] = useState(1);
  const [imageInput, setImageInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB por archivo

  const availableAmenities = [
    { id: 'wifi', label: '📶 Wi-Fi' },
    { id: 'ac', label: '❄️ Aire Acondicionado' },
    { id: 'tv', label: '📺 Smart TV' },
    { id: 'pool', label: '🏊 Piscina' },
    { id: 'jacuzzi', label: '🛁 Jacuzzi' },
    { id: 'breakfast', label: '🍳 Desayuno Incluido' },
    { id: 'minibar', label: '🍷 Minibar' },
    { id: 'kitchen', label: '🍳 Cocina Equipada' },
    { id: 'ocean_view', label: '🌊 Vista al Mar' },
    { id: 'parking', label: '🚗 Estacionamiento' }
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar habitaciones:", err);
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRoom(null);
    setName('');
    setDescription('');
    setBasePrice('');
    setCapacityAdults(2);
    setCapacityChildren(0);
    setStock(2);
    setImageInput('');
    setUploadedImages([]);
    setSelectedAmenities([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setName(room.name);
    setDescription(room.description);
    setBasePrice(room.basePrice);
    setCapacityAdults(room.capacityAdults);
    setCapacityChildren(room.capacityChildren);
    setStock(room.stock);
    setImageInput('');
    setUploadedImages(room.images || []);
    setSelectedAmenities(room.amenities || []);
    setIsModalOpen(true);
  };

  const handleToggleAmenity = (amenityId) => {
    if (selectedAmenities.includes(amenityId)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenityId));
    } else {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen (JPG, PNG, WebP).');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert(`La imagen "${file.name}" supera el tamaño máximo recomendado de 3 MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    // Permitir volver a seleccionar el mismo archivo
    e.target.value = '';
  };

  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !basePrice || !stock) return;

    // Procesar imágenes (subidas desde el dispositivo + URLs de texto)
    const urlImages = imageInput
      ? imageInput.split(',').map(img => img.trim()).filter(img => img !== '')
      : [];
    const images = [...uploadedImages, ...urlImages];

    const finalImages = images.length > 0
      ? images
      : ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"];

    const roomPayload = {
      name,
      description,
      basePrice: parseFloat(basePrice),
      capacityAdults: parseInt(capacityAdults),
      capacityChildren: parseInt(capacityChildren),
      stock: parseInt(stock),
      images,
      amenities: selectedAmenities
    };

    if (editingRoom) {
      roomPayload.id = editingRoom.id;
    }

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomPayload)
      });

      if (!res.ok) throw new Error("No se pudo guardar la habitación");

      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta habitación? Se cancelarán y eliminarán también todas sus reservas asociadas.")) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("No se pudo eliminar la habitación");
      fetchRooms();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

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
          <Link href="/admin/bookings" style={styles.navItem}>
            📅 Reservas
          </Link>
          <Link href="/admin/rooms" style={{ ...styles.navItem, ...styles.navItemActive }}>
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
            <h2 style={styles.title}>Inventario del Hotel</h2>
            <p style={styles.subtitle}>Crea, edita o elimina tipos de habitación y ajusta el stock disponible.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleOpenCreateModal} style={styles.createBtn}>
              + Agregar Habitación
            </button>
            <AdminUserMenu />
          </div>
        </header>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Cargando habitaciones...</p>
          </div>
        ) : (
          <div style={styles.roomsGrid}>
            {rooms.map(room => (
              <div key={room.id} style={styles.roomCard}>
                <div style={styles.roomImgWrapper}>
                  <img src={room.images[0]} alt={room.name} style={styles.roomImg} />
                  <div style={styles.priceBadge}>${room.basePrice.toFixed(2)} USD</div>
                </div>

                <div style={styles.roomContent}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{room.name}</h3>
                  <p style={styles.roomDesc}>{room.description}</p>
                  
                  <div style={styles.metaInfo}>
                    <span>Capacidad: {room.capacityAdults} ad. + {room.capacityChildren} niñ.</span>
                    <span>Stock Base: <strong>{room.stock}</strong></span>
                  </div>

                  <div style={styles.amenities}>
                    {room.amenities.map(amenity => (
                      <span key={amenity} style={styles.amenityTag}>
                        {availableAmenities.find(a => a.id === amenity)?.label || amenity}
                      </span>
                    ))}
                  </div>

                  <div style={styles.actionBtnGroup}>
                    <button 
                      onClick={() => handleOpenEditModal(room)} 
                      style={styles.editBtn}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteRoom(room.id)} 
                      style={styles.deleteBtn}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="glass">
            <div style={styles.modalHeader}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px' }}>
                {editingRoom ? "Editar Habitación" : "Nueva Habitación"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre de la Habitación</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ej: Suite Deluxe con Vista" 
                  required 
                  className="input-field"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Descripción de la habitación..." 
                  rows={3} 
                  required 
                  className="input-field"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: '1' }}>
                  <label style={styles.label}>Precio por Noche (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={basePrice} 
                    onChange={(e) => setBasePrice(e.target.value)} 
                    placeholder="120.00" 
                    required 
                    className="input-field"
                  />
                </div>
                <div style={{ ...styles.formGroup, flex: '1' }}>
                  <label style={styles.label}>Stock Físico (Cantidad)</label>
                  <input 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    placeholder="3" 
                    required 
                    className="input-field"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: '1' }}>
                  <label style={styles.label}>Capacidad Adultos</label>
                  <input 
                    type="number" 
                    value={capacityAdults} 
                    onChange={(e) => setCapacityAdults(e.target.value)} 
                    required 
                    className="input-field"
                  />
                </div>
                <div style={{ ...styles.formGroup, flex: '1' }}>
                  <label style={styles.label}>Capacidad Niños</label>
                  <input 
                    type="number" 
                    value={capacityChildren} 
                    onChange={(e) => setCapacityChildren(e.target.value)} 
                    required 
                    className="input-field"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Imágenes de la Habitación</label>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Sube imágenes desde tu dispositivo. Tamaño recomendado: <strong>800 × 600 px</strong> (mínimo 600 × 400). Formatos JPG, PNG o WebP. Máximo 3 MB por archivo.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="input-field"
                  style={{ padding: '10px', cursor: 'pointer' }}
                />

                {uploadedImages.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                    {uploadedImages.map((src, i) => (
                      <div key={i} style={{
                        position: 'relative',
                        width: '96px',
                        height: '72px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)'
                      }}>
                        <img src={src} alt={`Imagen ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(i)}
                          style={{
                            position: 'absolute',
                            top: '3px',
                            right: '3px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(26,26,26,0.7)',
                            color: '#fff',
                            fontSize: '13px',
                            lineHeight: '1',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label style={{ ...styles.label, marginTop: '16px' }}>
                  O pega URLs de fotos (separadas por comas)
                </label>
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1.jpg"
                  className="input-field"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Servicios / Comodidades</label>
                <div style={styles.amenitiesChecklist}>
                  {availableAmenities.map(amenity => (
                    <label key={amenity.id} style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={selectedAmenities.includes(amenity.id)} 
                        onChange={() => handleToggleAmenity(amenity.id)} 
                        style={styles.checkbox}
                      />
                      {amenity.label}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" style={styles.submitBtn}>
                {editingRoom ? "Guardar Cambios" : "Crear Habitación"}
              </button>
            </form>
          </div>
        </div>
      )}
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
  createBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'var(--transition)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
  },
  roomCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  roomImgWrapper: {
    position: 'relative',
    height: '180px',
    borderBottom: '1px solid var(--border-color)',
  },
  roomImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  priceBadge: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'var(--primary)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
  },
  roomContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: '1',
  },
  roomDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    minHeight: '40px',
  },
  metaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '10px',
  },
  amenities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  amenityTag: {
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border-color)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  actionBtnGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto',
    paddingTop: '15px',
    borderTop: '1px solid var(--border-color)',
  },
  editBtn: {
    flex: '1',
    backgroundColor: '#ffffff',
    color: 'var(--primary)',
    border: '1px solid var(--border-color)',
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  deleteBtn: {
    flex: '1',
    backgroundColor: '#ffffff',
    color: '#c62828',
    border: '1px solid #c62828',
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition)',
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
    width: '500px',
    maxWidth: '100%',
    borderRadius: 'var(--radius-lg)',
    padding: '30px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  amenitiesChecklist: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    backgroundColor: 'var(--bg-base)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'var(--transition)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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
