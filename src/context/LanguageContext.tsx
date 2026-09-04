import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from '../i18n/locale';
import { STRINGS } from '../i18n/strings';

const KEY = 'mat252-locale';

function readLocale(): Locale {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'es' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

function applyLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.title = STRINGS[locale].appTitle;
}

interface LanguageCtx {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const Ctx = createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const next = readLocale();
    applyLocale(next);
    return next;
  });

  useEffect(() => {
    applyLocale(locale);
    try {
      localStorage.setItem(KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleState,
    }),
    [locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLanguage(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useI18n() {
  const { locale, setLocale } = useLanguage();
  return { locale, setLocale, t: STRINGS[locale] };
}
