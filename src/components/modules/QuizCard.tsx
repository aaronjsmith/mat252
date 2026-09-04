import type { Assessment } from '../../data/catalog';
import { quizHref } from '../../data/catalog';
import { useI18n } from '../../context/LanguageContext';
import { assessmentText, topicLabel } from '../../i18n/catalog';
import { fmt } from '../../i18n/locale';
import { readProgressSummary } from '../../state/progress';
import { Link } from '../nav';
import styles from './QuizCard.module.css';

export function QuizCard({ assessment }: { assessment: Assessment }) {
  const { locale, t } = useI18n();
  const copy = assessmentText(assessment, locale);
  const summary = readProgressSummary(assessment);
  const pct = summary.total ? Math.round((summary.mastered / summary.total) * 100) : 0;
  const progressText = summary.total
    ? fmt(t.progressMastered, { mastered: summary.mastered, total: summary.total, pct }) +
      (summary.attempted && summary.accuracy != null
        ? fmt(t.progressGrade, { accuracy: summary.accuracy, attempted: summary.attempted })
        : '') +
      (summary.bossCleared ? t.bossCleared : '')
    : t.noProgress;

  if (assessment.compact) {
    return (
      <article className={`${styles.card} ${styles.compact}`}>
        <div className={styles.compactRow}>
          <span className={styles.badge}>{copy.badge}</span>
          <h3 className={styles.title}>{copy.title}</h3>
          <div>
            <p className={styles.progress}>{summary.total ? `${summary.mastered}/${summary.total}` : '—'}</p>
            <div className={styles.bar} role="presentation">
              <div className={styles.fill} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className={styles.actions}>
            <Link className={styles.primary} href={quizHref(assessment.id)}>
              {t.open}
            </Link>
            {assessment.nourish ? (
              <Link className={styles.ghost} href={quizHref(assessment.id, { mode: 'nourish' })}>
                {t.nourishShort}
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card} aria-label={copy.title}>
      <span className={styles.badge}>{copy.badge}</span>
      <h3 className={styles.title}>{copy.title}</h3>
      <p className={styles.summary}>{copy.summary}</p>
      <div className={styles.pills}>
        {assessment.topicIds.map((tid) => (
          <span key={tid} className={styles.pill}>
            {topicLabel(tid, locale)}
          </span>
        ))}
      </div>
      <p className={styles.progress}>{progressText}</p>
      <div className={styles.bar} role="presentation">
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.actions}>
        <Link className={styles.primary} href={quizHref(assessment.id)}>
          {t.openPractice}
        </Link>
      </div>
    </article>
  );
}
