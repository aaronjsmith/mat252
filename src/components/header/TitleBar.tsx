import { Link } from '../nav';
import styles from './TitleBar.module.css';

interface TitleBarProps {
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
}

export function TitleBar({ title, subtitle, backHref, backLabel }: TitleBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        {backHref ? (
          <Link className={styles.back} href={backHref}>
            {backLabel ?? '← All practice quizzes'}
          </Link>
        ) : null}
        <img
          className={styles.logo}
          src="/ensign-logo.png"
          alt="Ensign College"
          height={40}
        />
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
