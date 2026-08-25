import { TitleBar } from './components/header/TitleBar';
import { ThemeToggle } from './components/header/Toggles';
import { StatusBar } from './components/StatusBar';
import { WeekGroup } from './components/modules/WeekGroup';
import { ASSESSMENTS, WEEK_GROUPS } from './data/catalog';
import { readProgressSummary } from './state/progress';
import styles from './App.module.css';

export default function App() {
  const overview = ASSESSMENTS.find((a) => a.id === 'overview')!;
  const summary = readProgressSummary(overview);

  return (
    <div className={styles.app}>
      <TitleBar title="MAT 252 · Statistics Practice" subtitle="Ensign College · Unofficial student practice" />

      <div className={styles.toolbar}>
        <p className={styles.lead} style={{ margin: 0 }}>
          Quizzes are grouped to match a 7-week Canvas statistics course. Master each topic with 10
          unaided correct answers.
        </p>
        <span className={styles.spacer} />
        <div className={styles.actions}>
          <ThemeToggle />
        </div>
      </div>

      <main className={styles.body}>
        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <p className={styles.kicker}>Course</p>
            <h2 style={{ margin: 0, fontSize: 18 }}>MAT 252 practice</h2>
            <p className={styles.lead}>
              Data collection, sampling, graphs, probability, inference, correlation, and
              regression — unofficial practice aligned to Ensign College MAT 252.
            </p>
          </section>
          <section className={styles.panel}>
            <blockquote className={styles.quote}>
              <p style={{ margin: 0 }}>
                “But behold, if ye will awake and arouse your faculties, even to an experiment upon
                my words, and exercise a particle of faith…”
              </p>
              <cite>— Alma 32:27</cite>
            </blockquote>
            <p className={styles.disclaimer}>
              Unofficial student practice tool for Ensign College MAT 252. Not affiliated with,
              endorsed by, or connected to Ensign College or The Church of Jesus Christ of
              Latter-day Saints. Made by a student for personal study. UI framework from the{' '}
              <a href="https://dashboard.ensign.quest/" target="_blank" rel="noopener noreferrer">
                ENG 301 dashboard
              </a>
              .
            </p>
          </section>
        </aside>

        <div className={styles.weeks}>
          {WEEK_GROUPS.map((week) => (
            <WeekGroup
              key={week.id}
              week={week}
              quizzes={ASSESSMENTS.filter((a) => a.available && a.weekId === week.id)}
            />
          ))}
        </div>
      </main>

      <StatusBar
        mastered={summary.mastered}
        total={summary.total}
        attempted={summary.attempted}
        accuracy={summary.accuracy}
      />
    </div>
  );
}
