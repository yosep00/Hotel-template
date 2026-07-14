'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminUserMenu from '@/components/AdminUserMenu';
import { BrandLogo } from '@/components/HotelBranding';
import { useTranslation } from '@/components/LanguageProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminServices() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('✨');
  const [imageInput, setImageInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');

  const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setIcon('✨');
    setImageInput('');
    setUploadedImage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description);
    setIcon(service.icon || '✨');
    setImageInput('');
    setUploadedImage(service.image || '');
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(t('admin.imageOnly'));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert(t('admin.imageTooLarge').replace('{name}', file.name));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description) return;

    const finalImage = uploadedImage || (imageInput ? imageInput.trim() : '') || null;

    const payload = { name, description, icon, image: finalImage };
    if (editingService) payload.id = editingService.id;

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t('admin.saveServiceError'));
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!confirm(t('admin.deleteServiceConfirm'))) return;
    try {
      const res = await fetch(`/api/services/${serviceId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(t('admin.deleteServiceError'));
      fetchServices();
    } catch (err) {
      alert("Error: " + err.message);
    }
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
          <Link href="/admin/bookings" style={styles.navItem}>
            📅 {t('admin.bookings')}
          </Link>
          <Link href="/admin/rooms" style={styles.navItem}>
            🛏️ {t('admin.rooms')}
          </Link>
          <Link href="/admin/services" style={{ ...styles.navItem, ...styles.navItemActive }}>
            💎 {t('admin.services')}
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
            <h2 style={styles.title}>{t('admin.servicesTitle')}</h2>
            <p style={styles.subtitle}>{t('admin.servicesSub')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleOpenCreateModal} style={styles.createBtn}>
              {t('admin.addService')}
            </button>
            <LanguageSwitcher />
            <AdminUserMenu />
          </div>
        </header>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : services.length === 0 ? (
          <div style={styles.emptyState}>
            <p>{t('admin.noServices')}</p>
          </div>
        ) : (
          <div style={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} style={styles.serviceCard}>
                {service.image && (
                  <div style={styles.serviceImgWrapper}>
                    <img src={service.image} alt={service.name} style={styles.serviceImg} />
                  </div>
                )}
                <div style={styles.serviceContent}>
                  <div style={styles.serviceIcon}>{service.icon || '✨'}</div>
                  <h3 style={styles.serviceName}>{service.name}</h3>
                  <p style={styles.serviceDesc}>{service.description}</p>
                  <div style={styles.actionBtnGroup}>
                    <button onClick={() => handleOpenEditModal(service)} style={styles.editBtn}>
                      ✏️ {t('admin.edit')}
                    </button>
                    <button onClick={() => handleDeleteService(service.id)} style={styles.deleteBtn}>
                      🗑️ {t('admin.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="glass">
            <div style={styles.modalHeader}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px' }}>
                {editingService ? t('admin.editService') : t('admin.newService')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>{t('admin.serviceName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Spa & Wellness"
                  required
                  className="input-field"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{t('admin.serviceIcon')}</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="✨"
                  maxLength={4}
                  className="input-field"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{t('admin.description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el servicio..."
                  rows={3}
                  required
                  className="input-field"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{t('admin.serviceImage')}</label>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {t('admin.heroHint')}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="input-field"
                  style={{ padding: '10px', cursor: 'pointer' }}
                />
                {uploadedImage && (
                  <img src={uploadedImage} alt="Vista previa" style={{ marginTop: '10px', maxHeight: '120px', borderRadius: 'var(--radius-sm)' }} />
                )}
                <label style={{ ...styles.label, marginTop: '12px' }}>
                  {t('admin.pasteUrl')}
                </label>
                <input
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1.jpg"
                  className="input-field"
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                {editingService ? t('common.save') : t('admin.createService')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#faf9f6', color: '#1a1a1a' },
  sidebar: { width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid var(--border-color)', padding: '30px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 10 },
  logoLink: { textDecoration: 'none', marginBottom: '40px', display: 'block' },
  logoSub: { fontSize: '10px', color: 'var(--accent)', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px', display: 'block' },
  nav: { display: 'flex', flexDirection: 'column', gap: '6px', flex: '1' },
  navItem: { display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', fontWeight: '500', transition: 'var(--transition)' },
  navItemActive: { backgroundColor: '#f5f2ed', color: 'var(--primary)', fontWeight: '600' },
  sidebarFooter: { marginTop: 'auto' },
  backLink: { color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none', transition: 'var(--transition)', fontWeight: '500' },
  main: { flex: '1', marginLeft: '280px', padding: '40px 60px', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' },
  title: { fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '500' },
  subtitle: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' },
  createBtn: { backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'var(--transition)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '20px' },
  spinner: { width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyState: { textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '13px' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
  serviceCard: { backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  serviceImgWrapper: { height: '160px', borderBottom: '1px solid var(--border-color)' },
  serviceImg: { width: '100%', height: '100%', objectFit: 'cover' },
  serviceContent: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: '1' },
  serviceIcon: { fontSize: '32px', lineHeight: '1' },
  serviceName: { fontSize: '16px', fontWeight: '700', margin: 0 },
  serviceDesc: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 },
  actionBtnGroup: { display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--border-color)' },
  editBtn: { flex: '1', backgroundColor: '#ffffff', color: 'var(--primary)', border: '1px solid var(--border-color)', padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)' },
  deleteBtn: { flex: '1', backgroundColor: '#ffffff', color: '#c62828', border: '1px solid #c62828', padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26,26,26,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { width: '500px', maxWidth: '100%', borderRadius: 'var(--radius-lg)', padding: '30px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' },
  submitBtn: { backgroundColor: 'var(--primary)', color: '#ffffff', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', marginTop: '10px', transition: 'var(--transition)', textTransform: 'uppercase', letterSpacing: '0.5px' },
};
