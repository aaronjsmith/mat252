import { useState } from 'react';
import type { Assessment, WeekGroup as WeekGroupType } from '../../data/catalog';
import { useI18n } from '../../context/LanguageContext';
import { weekText } from '../../i18n/catalog';
import { fmt } from '../../i18n/locale';
import { collapseKey, readWeekMasteryView } from '../../state/progress';
import { MasteryChart } from '../progress/MasteryChart';
import { QuizCard } from './QuizCard';
import styles from './WeekGroup.module.css';

function readCollapsed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(collapseKey());
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeCollapsed(map: Record<string, boolean>): void {
  localStorage.setItem(collapseKey(), JSON.stringify(map));
}

export function WeekGroup({
  week,
  quizzes,
}: {
  week: WeekGroupType;
  quizzes: Assessment[];
}) {
  const { locale, t } = useI18n();
  const text = weekText(week, locale);
  const isOverview = week.id === 'overview';
  const weekMastery = readWeekMasteryView(week.id);
  const [collapsed, setCollapsed] = useState(() =>
    isOverview || week.current ? false : Boolean(readCollapsed()[week.id]),
  );

  const toggle = () => {
    if (isOverview) return;
    const next = !collapsed;
    setCollapsed(next);
    const map = readCollapsed();
    if (next) map[week.id] = true;
    else delete map[week.id];
    writeCollapsed(map);
  };

  return (
    <section className={styles.group} data-week={week.id} data-collapsed={collapsed}>
      <header className={styles.head}>
        {isOverview ? (
          <div>
            <span className={styles.title}>{text.title}</span>
            <span className={styles.blurb}>{text.blurb}</span>
          </div>
        ) : (
          <button type="button" className={styles.toggle} onClick={toggle} aria-expanded={!collapsed}>
            <span className={styles.chevron} aria-hidden="true" />
            <span>
              <span className={styles.title}>{text.title}</span>
              <span className={styles.blurb}>{text.blurb}</span>
            </span>
          </button>
        )}
        {weekMastery.total > 0 ? (
          <div
            className={styles.ring}
            title={fmt(t.weekMasteryTitle, {
              mastered: weekMastery.mastered,
              total: weekMastery.total,
            })}
          >
            <MasteryChart view={weekMastery} compact />
          </div>
        ) : null}
      </header>
      {!collapsed && (
        <div className={isOverview ? styles.compactGrid : styles.grid}>
          {quizzes.map((a) => (
            <QuizCard key={a.id} assessment={a} />
          ))}
        </div>
      )}
    </section>
  );
}
