import { useI18n } from '../context/LanguageContext';
import { fmt } from '../i18n/locale';
import styles from './StatusBar.module.css';

interface StatusBarProps {
  mastered: number;
  total: number;
  attempted: number;
  accuracy: number | null;
}

export function StatusBar({ mastered, total, attempted, accuracy }: StatusBarProps) {
  const { t } = useI18n();
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <footer className={styles.bar}>
      <span className={styles.chip}>
        <span className={styles.dot} data-tone={mastered === total && total ? 'ok' : 'pending'} />
        {fmt(t.statusMastery, { mastered, total, pct })}
      </span>
      <span className={styles.chip}>
        {fmt(t.statusAnswered, { attempted })}
        {accuracy != null ? fmt(t.statusGrade, { accuracy }) : ''}
      </span>
      <span className={styles.spacer} />
      <span className={styles.chip}>{t.statusFooter}</span>
    </footer>
  );
}
