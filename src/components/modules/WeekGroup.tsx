import { useState } from 'react';
import type { Assessment, WeekGroup as WeekGroupType } from '../../data/catalog';
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
  const isOverview = week.id === 'overview';
  const weekMastery = readWeekMasteryView(week.id);
  const [collapsed, setCollapsed] = useState(() =>
    isOverview ? false : Boolean(readCollapsed()[week.id]),
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
            <span className={styles.title}>{week.title}</span>
            <span className={styles.blurb}>{week.blurb}</span>
          </div>
        ) : (
          <button type="button" className={styles.toggle} onClick={toggle} aria-expanded={!collapsed}>
            <span className={styles.chevron} aria-hidden="true" />
            <span>
              <span className={styles.title}>{week.title}</span>
              <span className={styles.blurb}>{week.blurb}</span>
            </span>
          </button>
        )}
        {weekMastery.total > 0 ? (
          <div className={styles.ring} title={`${weekMastery.mastered}/${weekMastery.total} topics mastered`}>
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
