'use client';

import { useTranslation } from '@/components/LanguageProvider';
import { LANGS } from '@/lib/i18n';

export default function LanguageSwitcher({ style, className }) {
  const { lang, setLang } = useTranslation();

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        gap: '2px',
        alignItems: 'center',
        ...style,
      }}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            fontFamily: 'Inter, sans-serif',
            fontWeight: lang === l ? '700' : '400',
            color: lang === l ? 'var(--primary)' : 'var(--text-secondary)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '2px 4px',
          }}
        >
          {l === 'es' ? 'ES' : 'EN'}
        </button>
      ))}
    </div>
  );
}
