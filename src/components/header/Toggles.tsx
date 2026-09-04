import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/LanguageContext';
import styles from './Toggles.module.css';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={dark}
      data-on={dark}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title={dark ? t.themeToLight : t.themeToDark}
    >
      {dark ? (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M13.2 9.8A5.6 5.6 0 1 1 6.2 2.8a4.5 4.5 0 0 0 7 7z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M8 1.4v1.8M8 12.8v1.8M1.4 8h1.8M12.8 8h1.8M3.3 3.3l1.3 1.3M11.4 11.4l1.3 1.3M12.7 3.3l-1.3 1.3M4.6 11.4l-1.3 1.3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
      {dark ? t.themeDark : t.themeLight}
    </button>
  );
}

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  const es = locale === 'es';
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={es}
      data-on={es}
      onClick={() => setLocale(es ? 'en' : 'es')}
      title={es ? t.langToEnglish : t.langToSpanish}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2 8h12M8 2c1.8 1.8 2.7 3.8 2.7 6S9.8 12.2 8 14C6.2 12.2 5.3 10.2 5.3 8S6.2 3.8 8 2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
      {es ? t.langSpanish : t.langEnglish}
    </button>
  );
}
