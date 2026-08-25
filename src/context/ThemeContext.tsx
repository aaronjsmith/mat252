import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'mat252-theme';

function readTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch {
    /* ignore */
  }
  return 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : '';
  if (theme === 'light') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', 'dark');
}

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const t = readTheme();
    applyTheme(t);
    return t;
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
    }),
    [theme],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
