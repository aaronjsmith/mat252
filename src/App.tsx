import { TitleBar } from './components/header/TitleBar';
import { LanguageToggle, ThemeToggle } from './components/header/Toggles';
import { StatusBar } from './components/StatusBar';
import { WeekGroup } from './components/modules/WeekGroup';
import { MasteryChart } from './components/progress/MasteryChart';
import { ASSESSMENTS, WEEK_GROUPS, quizHref } from './data/catalog';
import { useI18n } from './context/LanguageContext';
import { readMasteryView, readProgressSummary } from './state/progress';
import styles from './App.module.css';

function go(href: string) {
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function App() {
  const { t } = useI18n();
  const overview = ASSESSMENTS.find((a) => a.id === 'overview')!;
  const summary = readProgressSummary(overview);
  const mastery = readMasteryView(overview);

  return (
    <div className={styles.app}>
      <TitleBar title={t.appTitle} subtitle={t.appSubtitle} />

      <div className={styles.toolbar}>
        <p className={styles.lead} style={{ margin: 0 }}>
          {t.homeLead}
        </p>
        <span className={styles.spacer} />
        <div className={styles.actions}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <main className={styles.body}>
        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <p className={styles.kicker}>{t.kickerProgress}</p>
            <h2 style={{ margin: 0, fontSize: 16 }}>{t.masteryTitle}</h2>
            <p className={styles.lead}>{t.masteryLead}</p>
            <MasteryChart
              view={mastery}
              onTopicClick={(id) => go(quizHref('overview', { mode: id }))}
            />
          </section>
          <section className={styles.panel}>
            <blockquote className={styles.quote}>
              <p style={{ margin: 0 }}>{t.quote}</p>
              <cite>{t.quoteCite}</cite>
            </blockquote>
            <p className={styles.disclaimer}>
              {t.disclaimerBefore}
              <a href="https://dashboard.ensign.quest/" target="_blank" rel="noopener noreferrer">
                {t.disclaimerLink}
              </a>
              {t.disclaimerAfter}
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
