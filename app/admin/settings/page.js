'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminUserMenu from '@/components/AdminUserMenu';
import { BrandLogo } from '@/components/HotelBranding';
import { useTranslation } from '@/components/LanguageProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const PUBLIC_FIELDS = [
  { key: 'hotelName', label: 'admin.fHotelName', type: 'text', placeholder: 'Grand Oasis Resort & Spa' },
  { key: 'hotelEmail', label: 'admin.fHotelEmail', type: 'email', placeholder: 'reservas@hotel.com' },
  { key: 'hotelPhone', label: 'admin.fHotelPhone', type: 'text', placeholder: '+1 (555) 123-4567' },
  { key: 'currency', label: 'admin.fCurrency', type: 'text', placeholder: 'USD' },
  { key: 'hotelAddress', label: 'admin.fHotelAddress', type: 'textarea', placeholder: 'Calle, Ciudad, País' },
  { key: 'logoUrl', label: 'admin.fLogo', type: 'logo' },
  { key: 'primaryColor', label: 'admin.fPrimary', type: 'color' },
  { key: 'accentColor', label: 'admin.fAccent', type: 'color' },
  { key: 'heroImage', label: 'admin.fHeroImage', type: 'logo' },
  { key: 'heroTitle', label: 'admin.fHeroTitle', type: 'text', placeholder: 'Grand Oasis' },
  { key: 'heroDescription', label: 'admin.fHeroDescription', type: 'textarea', placeholder: 'Descubre el lujo frente al mar...' },
];

export default function AdminSettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    hotelName: '',
    hotelEmail: '',
    hotelPhone: '',
    hotelAddress: '',
    currency: 'USD',
    logoUrl: '',
    primaryColor: '',
    accentColor: '',
  });
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar los datos');
      setForm((prev) => ({ ...prev, ...data }));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleChange('logoUrl', reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setForm((prev) => ({ ...prev, ...data }));
      setMessage({ type: 'success', text: t('common.success') });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
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
          <Link href="/admin/services" style={styles.navItem}>
            💎 {t('admin.services')}
          </Link>
          <Link
            href="/admin/settings"
            style={{ ...styles.navItem, ...styles.navItemActive }}
          >
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
        <header style={styles.topBar}>
          <div>
            <h2 style={styles.title}>{t('admin.settingsTitle')}</h2>
            <p style={styles.subtitle}>
              {t('admin.settingsSub')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSwitcher />
            <AdminUserMenu />
          </div>
        </header>

        {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <div style={styles.content}>
              <form style={styles.card} onSubmit={handleSubmit}>
                <div style={styles.sectionHeader}>
                  <h3 style={styles.sectionTitle}>{t('admin.generalInfo')}</h3>
                  <p style={styles.sectionDesc}>
                    {t('admin.generalDesc')}
                  </p>
                </div>

                {PUBLIC_FIELDS.map((field) => (
                  <div style={styles.formGroup} key={field.key}>
                    <label style={styles.label} htmlFor={field.key}>
                      {t(field.label)}
                    </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.key}
                      style={{ ...styles.input, ...styles.textarea }}
                      value={form[field.key] || ''}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  ) : field.type === 'color' ? (
                    <div style={styles.colorRow}>
                      <input
                        id={field.key}
                        type="color"
                        value={form[field.key] || '#1a1a1a'}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        style={styles.colorInput}
                      />
                      <input
                        type="text"
                        style={styles.input}
                        value={form[field.key] || ''}
                        placeholder="#1a1a1a"
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    </div>
                  ) : field.type === 'logo' ? (
                    <div style={styles.logoField}>
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="Logo actual"
                          style={styles.logoPreview}
                        />
                      ) : null}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        style={styles.fileInput}
                      />
                      <input
                        type="text"
                        style={styles.input}
                        value={form.logoUrl || ''}
                        placeholder="https://... o imagen embebida"
                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                      />
                      <p style={styles.hint}>
                        {t('admin.logoHint')}
                      </p>
                    </div>
                  ) : (
                    <input
                      id={field.key}
                      type={field.type}
                      style={styles.input}
                      value={form[field.key] || ''}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {message && (
                <div
                  style={
                    message.type === 'success'
                      ? styles.messageSuccess
                      : styles.messageError
                  }
                >
                  {message.text}
                </div>
              )}

              <div style={styles.actions}>
                <button type="submit" style={styles.saveBtn} disabled={saving}>
                  {saving ? t('admin.saving') : t('common.save')}
                </button>
              </div>
            </form>
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
  card: {
    padding: '30px',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    maxWidth: '640px',
  },
  sectionHeader: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontFamily: 'Playfair Display, serif',
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '6px',
  },
  sectionDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'var(--transition)',
  },
  textarea: {
    minHeight: '90px',
    resize: 'vertical',
    fontFamily: 'Inter, sans-serif',
  },
  colorRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  colorInput: {
    width: '52px',
    height: '44px',
    padding: '4px',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    flexShrink: 0,
  },
  logoField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  logoPreview: {
    maxHeight: '60px',
    width: 'auto',
    objectFit: 'contain',
    marginBottom: '4px',
  },
  fileInput: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  actions: {
    marginTop: '8px',
  },
  saveBtn: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    padding: '13px 28px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    cursor: 'pointer',
  },
  messageSuccess: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    marginBottom: '8px',
  },
  messageError: {
    backgroundColor: '#ffe5e5',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    marginBottom: '8px',
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
