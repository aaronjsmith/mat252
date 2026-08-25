import { useTheme } from '../../context/ThemeContext';
import styles from './Toggles.module.css';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={dark}
      data-on={dark}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
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
      {dark ? 'Dark' : 'Light'}
    </button>
  );
}
