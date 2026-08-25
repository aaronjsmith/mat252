import type { Assessment } from '../../data/catalog';
import { TOPIC_LABEL, quizHref } from '../../data/catalog';
import { readProgressSummary } from '../../state/progress';
import { Link } from '../nav';
import styles from './QuizCard.module.css';

export function QuizCard({ assessment }: { assessment: Assessment }) {
  const summary = readProgressSummary(assessment);
  const pct = summary.total ? Math.round((summary.mastered / summary.total) * 100) : 0;
  const progressText = summary.total
    ? `${summary.mastered}/${summary.total} mastered (${pct}%)` +
      (summary.attempted && summary.accuracy != null
        ? ` · Grade ${summary.accuracy}% (${summary.attempted} answered)`
        : '') +
      (summary.bossCleared ? ' · boss cleared' : '')
    : 'No progress yet';

  if (assessment.compact) {
    return (
      <article className={`${styles.card} ${styles.compact}`}>
        <div className={styles.compactRow}>
          <span className={styles.badge}>{assessment.badge}</span>
          <h3 className={styles.title}>{assessment.title}</h3>
          <div>
            <p className={styles.progress}>{summary.total ? `${summary.mastered}/${summary.total}` : '—'}</p>
            <div className={styles.bar} role="presentation">
              <div className={styles.fill} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className={styles.actions}>
            <Link className={styles.primary} href={quizHref(assessment.id)}>
              Open
            </Link>
            {assessment.nourish ? (
              <Link className={styles.ghost} href={quizHref(assessment.id, { mode: 'nourish' })}>
                Nourish
              </Link>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card} aria-label={assessment.title}>
      <span className={styles.badge}>{assessment.badge}</span>
      <h3 className={styles.title}>{assessment.title}</h3>
      <p className={styles.summary}>{assessment.summary}</p>
      <div className={styles.pills}>
        {assessment.topicIds.map((tid) => (
          <span key={tid} className={styles.pill}>
            {TOPIC_LABEL[tid]}
          </span>
        ))}
      </div>
      <p className={styles.progress}>{progressText}</p>
      <div className={styles.bar} role="presentation">
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.actions}>
        <Link className={styles.primary} href={quizHref(assessment.id)}>
          Open practice
        </Link>
      </div>
    </article>
  );
}
