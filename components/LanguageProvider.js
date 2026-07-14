'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LANG, LANGS, translate } from '@/lib/i18n';

const Ctx = createContext(null);

export function useTranslation() {
  const c = useContext(Ctx) || { lang: DEFAULT_LANG, setLang: () => {} };
  const t = (key) => translate(c.lang || DEFAULT_LANG, key);
  return { lang: c.lang || DEFAULT_LANG, setLang: c.setLang, t };
}

export default function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    let initial = DEFAULT_LANG;
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('lang');
      if (q && LANGS.includes(q)) {
        initial = q;
      } else {
        const cookie = document.cookie
          .split('; ')
          .find((r) => r.startsWith('lang='));
        if (cookie) {
          const v = cookie.split('=')[1];
          if (LANGS.includes(v)) initial = v;
        } else {
          const ls = localStorage.getItem('lang');
          if (ls && LANGS.includes(ls)) initial = ls;
        }
      }
    }
    setLangState(initial);
    if (typeof document !== 'undefined') document.documentElement.lang = initial;
  }, []);

  const setLang = (l) => {
    if (!LANGS.includes(l)) return;
    setLangState(l);
    if (typeof document !== 'undefined') {
      document.cookie = `lang=${l};path=/;max-age=31536000`;
      document.documentElement.lang = l;
      try {
        localStorage.setItem('lang', l);
      } catch {}
    }
  };

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}
