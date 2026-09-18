import { CANVAS_URL, COURSE, DEADLINES, formatMd, openExams, workHref } from '../../data/canvas';
import { useI18n } from '../../context/LanguageContext';
import styles from './CanvasStatus.module.css';

export function CanvasStatus() {
  const { t } = useI18n();
  const exams = openExams();

  return (
    <section className={styles.panel}>
      <p className={styles.kicker}>{t.canvasKicker}</p>
      <h2 className={styles.title}>{COURSE.name}</h2>
      <p className={styles.grade}>
        {t.canvasGrade}: <strong>{COURSE.currentGrade}</strong> ({COURSE.currentScore}%)
      </p>
      <p className={styles.callout}>
        <strong>{t.canvasMidterm}.</strong> {t.canvasMidtermRange}
        <br />
        {t.canvasDue} · due {formatMd(DEADLINES.midterm1Due)} MDT
      </p>
      {exams.length > 0 && (
        <div>
          <p className={styles.subhead}>{t.canvasOpenExam}</p>
          <ul className={styles.list}>
            {exams.map((item) => (
              <li key={item.id}>
                <a href={workHref(item.id)} target="_blank" rel="noopener noreferrer">
                  {item.name}
                </a>
                <span> · {item.pts} pts · due {formatMd(item.due)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className={styles.footer}>
        <a href={`${CANVAS_URL}/modules`} target="_blank" rel="noopener noreferrer">
          {t.canvasLink}
        </a>
      </p>
    </section>
  );
}
