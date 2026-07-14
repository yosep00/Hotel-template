'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const HotelSettingsContext = createContext(null);

export function useHotelSettings() {
  return useContext(HotelSettingsContext);
}

const DEFAULT_SETTINGS = {
  hotelName: 'Grand Oasis Resort & Spa',
  logoUrl: '',
  primaryColor: '',
  accentColor: '',
};

export default function HotelBrandingProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let active = true;
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setSettings((prev) => ({ ...prev, ...data }));
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--primary', data.primaryColor);
        }
        if (data.accentColor) {
          document.documentElement.style.setProperty('--accent', data.accentColor);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <HotelSettingsContext.Provider value={settings}>
      {children}
    </HotelSettingsContext.Provider>
  );
}

export function BrandLogo({ className = 'logo' }) {
  const s = useHotelSettings() || DEFAULT_SETTINGS;
  if (s.logoUrl) {
    return (
      <img
        src={s.logoUrl}
        alt={s.hotelName || 'Hotel'}
        className="brand-logo"
        style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
      />
    );
  }
  return <span className={className}>{s.hotelName || 'Grand Oasis Resort & Spa'}</span>;
}

export function BrandName() {
  const s = useHotelSettings() || DEFAULT_SETTINGS;
  return <>{s.hotelName || 'Grand Oasis Resort & Spa'}</>;
}
