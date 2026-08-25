import styles from './StatusBar.module.css';

interface StatusBarProps {
  mastered: number;
  total: number;
  attempted: number;
  accuracy: number | null;
}

export function StatusBar({ mastered, total, attempted, accuracy }: StatusBarProps) {
  const pct = total ? Math.round((mastered / total) * 100) : 0;
  return (
    <footer className={styles.bar}>
      <span className={styles.chip}>
        <span className={styles.dot} data-tone={mastered === total && total ? 'ok' : 'pending'} />
        Mastery: {mastered}/{total} topics ({pct}%)
      </span>
      <span className={styles.chip}>
        Answered: {attempted}
        {accuracy != null ? ` · Grade ${accuracy}%` : ''}
      </span>
      <span className={styles.spacer} />
      <span className={styles.chip}>Unofficial student practice · Ensign College MAT 252</span>
    </footer>
  );
}
