import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TitleBar } from '../components/header/TitleBar';
import { LanguageToggle, ThemeToggle } from '../components/header/Toggles';
import { StatusBar } from '../components/StatusBar';
import {
  ASSESSMENTS,
  HINT_CREDIT,
  MASTER,
  RETRY_CREDIT,
  getAssessment,
  type TopicId,
} from '../data/catalog';
import { useI18n } from '../context/LanguageContext';
import { assessmentText, themeCopy, topicLabel } from '../i18n/catalog';
import { fmt } from '../i18n/locale';
import { checkAnswer, generateQuestion, type Question } from '../questions/generate';
import { MasteryChart } from '../components/progress/MasteryChart';
import {
  allMastered,
  effectiveTopicUnaided,
  isMastered,
  readMasteryView,
  readProgress,
  readProgressSummary,
  setTopicUnaided,
  syncTopicToRelated,
  topicUnaided,
  writeProgress,
} from '../state/progress';
import styles from './QuizPage.module.css';

type Mode = 'smart' | 'all' | 'teachme' | 'nourish' | 'flashcards' | 'finalboss' | TopicId;

function param(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function pickTopic(topics: TopicId[], progressId: string, preferUnmastered: boolean): TopicId {
  const p = readProgress(progressId);
  const pool = preferUnmastered
    ? topics.filter((t) => !isMastered(p, t))
    : topics;
  const use = pool.length ? pool : topics;
  use.sort((a, b) => topicUnaided(p, a) - topicUnaided(p, b));
  const lowest = topicUnaided(p, use[0]!);
  const tied = use.filter((t) => topicUnaided(p, t) === lowest);
  return tied[Math.floor(Math.random() * tied.length)]!;
}

export function QuizPage() {
  const { locale, t } = useI18n();
  const assessment = getAssessment(param('a')) ?? getAssessment('overview')!;
  const copy = assessmentText(assessment, locale);
  const theme = themeCopy(assessment.theme, locale);
  const initialMode = (param('mode') as Mode | null) || 'smart';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [q, setQ] = useState<Question | null>(null);
  const [picked, setPicked] = useState('');
  const [hints, setHints] = useState(0);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [retry, setRetry] = useState(false);
  const [tick, setTick] = useState(0);
  const [boss, setBoss] = useState<{
    active: boolean;
    practice: boolean;
    queue: TopicId[];
    index: number;
  } | null>(null);
  const [invite, setInvite] = useState(false);

  const summary = useMemo(() => readProgressSummary(assessment), [assessment, tick]);
  const mastery = useMemo(() => readMasteryView(assessment), [assessment, tick]);
  const bossRef = useRef(boss);

  const nextQuestion = useCallback(
    (m: Mode, bossState?: typeof boss) => {
      let topic: TopicId;
      let flash = false;
      if (bossState?.active) {
        topic = bossState.queue[bossState.index] ?? assessment.topicIds[0]!;
      } else if (m === 'flashcards') {
        flash = true;
        topic = pickTopic(assessment.topicIds, assessment.id, true);
      } else if (m === 'nourish' || m === 'smart' || m === 'all' || m === 'teachme') {
        topic = pickTopic(assessment.topicIds, assessment.id, m !== 'all');
      } else if (m === 'finalboss') {
        topic = pickTopic(assessment.topicIds, assessment.id, true);
      } else {
        topic = m;
      }
      const nq = generateQuestion(topic, flash, locale);
      setQ(nq);
      setPicked('');
      setHints(m === 'teachme' ? 3 : 0);
      setShow1(m === 'teachme');
      setShow2(m === 'teachme');
      setShow3(m === 'teachme');
      setFeedback(null);
      setRetry(false);
    },
    [assessment, locale],
  );

  useEffect(() => {
    bossRef.current = boss;
  }, [boss]);

  useEffect(() => {
    nextQuestion(mode, bossRef.current ?? undefined);
  }, [mode, locale, assessment, nextQuestion]);

  useEffect(() => {
    if (allMastered(assessment, readProgress(assessment.id)) && !readProgress(assessment.id).final_boss_cleared) {
      setInvite(true);
    }
  }, [assessment, tick]);

  function bump(topic: TopicId, unaidedDelta: number, credit: number) {
    let p = readProgress(assessment.id);
    const nextUnaided = Math.max(0, Math.min(MASTER, topicUnaided(p, topic) + unaidedDelta));
    p = setTopicUnaided(p, topic, nextUnaided);
    p = {
      ...p,
      total_attempted: p.total_attempted + 1,
      total_credit: p.total_credit + credit,
    };
    writeProgress(assessment.id, p);
    syncTopicToRelated(topic, assessment.id, nextUnaided, ASSESSMENTS);
    setTick((n) => n + 1);
    return nextUnaided;
  }

  function startBoss(practice: boolean) {
    const queue = assessment.topicIds.slice();
    const state = { active: true, practice, queue, index: 0 };
    setBoss(state);
    setInvite(false);
    setMode('finalboss');
    nextQuestion('finalboss', state);
  }

  function onCheck() {
    if (!q) return;
    const ok = checkAnswer(q, picked);
    if (boss?.active) {
      if (ok) {
        const nextIndex = boss.index + 1;
        if (nextIndex >= boss.queue.length) {
          if (!boss.practice) {
            const p = { ...readProgress(assessment.id), final_boss_cleared: true };
            writeProgress(assessment.id, p);
          }
          setFeedback({
            ok: true,
            text: boss.practice ? theme.winPractice : theme.win,
          });
          setBoss(null);
          setTick((n) => n + 1);
          return;
        }
        const next = { ...boss, index: nextIndex };
        setBoss(next);
        setFeedback({
          ok: true,
          text: theme.ok
            .replace('{current}', String(nextIndex))
            .replace('{total}', String(boss.queue.length)),
        });
        nextQuestion('finalboss', next);
        return;
      }
      const unaided = bump(q.topic, -1, 0);
      setFeedback({
        ok: false,
        text: theme.miss
          .replace('{topic}', topicLabel(q.topic, locale))
          .replace('{progress}', `${unaided}/${MASTER}`),
      });
      nextQuestion('finalboss', boss);
      return;
    }

    if (ok) {
      const unaided = hints === 0 && !retry ? 1 : 0;
      const credit = retry ? RETRY_CREDIT : HINT_CREDIT[Math.min(hints, 3)] ?? 0.25;
      bump(q.topic, unaided, credit);
      setFeedback({
        ok: true,
        text: unaided
          ? fmt(t.correctUnaided, {
              n: Math.min(MASTER, topicUnaided(readProgress(assessment.id), q.topic)),
              master: MASTER,
            })
          : fmt(t.correctCredit, { pct: Math.round(credit * 100) }),
      });
    } else {
      setRetry(true);
      setFeedback({
        ok: false,
        text: fmt(t.notQuite, { pct: Math.round(RETRY_CREDIT * 100) }),
      });
    }
  }

  if (!q) {
    return <div className={styles.page}>{t.loading}</div>;
  }

  const noHints = Boolean(boss?.active);

  return (
    <div className={styles.page}>
      <TitleBar
        title={copy.title}
        subtitle={`MAT 252 · ${theme.name}`}
        backHref="/"
        backLabel={t.backQuizzes}
      />

      <div className={styles.toolbar}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{summary.accuracy != null ? `${summary.accuracy}%` : '—'}</span>
            <span className={styles.statLbl}>{t.grade}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{summary.mastered}/{summary.total}</span>
            <span className={styles.statLbl}>{t.mastered}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{summary.attempted}</span>
            <span className={styles.statLbl}>{t.answered}</span>
          </div>
        </div>
        <span className={styles.spacer} />
        <div className={styles.toggles}>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <main className={styles.body}>
        <aside className={styles.topics}>
          <h2>{t.topics}</h2>
          <p className={styles.blurb}>
            {t.topicsBlurbBefore}
            <strong>{t.topicsBlurbStrong}</strong>
            {t.topicsBlurbAfter}
          </p>
          {(
            [
              ['smart', t.smartPick],
              ['all', t.allTopics],
              ['teachme', t.teachMe],
              ...(assessment.nourish ? [['nourish', t.nourish] as const] : []),
              ...(assessment.flashcards ? [['flashcards', t.flashcards] as const] : []),
            ] as [Mode, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={styles.topic}
              data-active={mode === id && !boss}
              onClick={() => {
                setBoss(null);
                setMode(id);
              }}
            >
              {label}
            </button>
          ))}
          {assessment.boss && (
            <button
              type="button"
              className={styles.topic}
              data-boss="true"
              data-active={mode === 'finalboss'}
              onClick={() => startBoss(true)}
            >
              {theme.emoji} {theme.practiceLabel}
            </button>
          )}
          {assessment.topicIds.map((tid) => (
            <button
              key={tid}
              type="button"
              className={styles.topic}
              data-active={mode === tid && !boss}
              onClick={() => {
                setBoss(null);
                setMode(tid);
              }}
            >
              <span>{topicLabel(tid, locale)}</span>
              <span className={styles.mastery}>{effectiveTopicUnaided(assessment, tid)}/{MASTER}</span>
            </button>
          ))}
        </aside>

        <section className={styles.quiz}>
          {invite && !boss && (
            <div className={styles.banner}>
              <strong>{theme.name}.</strong> {theme.invite}{' '}
              <button type="button" className={styles.linkish} onClick={() => startBoss(false)}>
                {t.fight}
              </button>
              <button type="button" className={styles.linkish} onClick={() => setInvite(false)}>
                {t.notNow}
              </button>
            </div>
          )}
          {boss && (
            <p className={styles.banner}>
              {theme.progress
                .replace('{current}', String(boss.index + 1))
                .replace('{total}', String(boss.queue.length))
                .replace('{topic}', topicLabel(q.topic, locale))}
            </p>
          )}
          <div className={styles.meta}>
            {boss && <span className={styles.bossFace}>{theme.emoji}</span>}
            <span className={styles.pill}>{topicLabel(q.topic, locale)}</span>
          </div>
          <h1 className={styles.prompt}>{q.prompt}</h1>

          {q.type === 'mc' && q.choices && (
            <div className={styles.choices} role="group" aria-label={t.choices}>
              {q.choices.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={styles.choice}
                  data-on={picked === c}
                  onClick={() => setPicked(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          {q.type === 'numeric' && (
            <input
              className={styles.numeric}
              inputMode="decimal"
              value={picked}
              onChange={(e) => setPicked(e.target.value)}
              placeholder={q.unit ? fmt(t.numberPlaceholderUnit, { unit: q.unit }) : t.numberPlaceholder}
              aria-label={t.numericAria}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCheck();
              }}
            />
          )}

          {!noHints && (
            <>
              <div className={styles.hintRow}>
                <button type="button" className={styles.linkish} disabled={show1} onClick={() => { setShow1(true); setHints((h) => Math.max(h, 1)); }}>
                  {t.hint1}
                </button>
                <button type="button" className={styles.linkish} disabled={!show1 || show2} onClick={() => { setShow2(true); setHints((h) => Math.max(h, 2)); }}>
                  {t.hint2}
                </button>
                <button type="button" className={styles.linkish} disabled={!show2 || show3} onClick={() => { setShow3(true); setHints((h) => Math.max(h, 3)); }}>
                  {t.hint3}
                </button>
              </div>
              {show1 && <div className={styles.hintBox}>{q.hint}</div>}
              {show2 && q.setup && <div className={styles.hintBox}>{q.setup}</div>}
              {show3 && (q.calc.ti || q.calc.excel) && (
                <div className={styles.hintBox}>
                  {q.calc.ti ? `${t.calcTi}${q.calc.ti}\n` : ''}
                  {q.calc.excel ? `${t.calcExcel}${q.calc.excel}` : ''}
                </div>
              )}
            </>
          )}

          {feedback && (
            <div className={`${styles.feedback} ${feedback.ok ? styles.ok : styles.bad}`}>
              {feedback.text}
              {feedback.ok && q.type === 'numeric' ? fmt(t.answerSuffix, { answer: String(q.answer) }) : ''}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onCheck} disabled={!picked}>
              {retry ? t.checkAgain : t.check}
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => nextQuestion(mode, boss ?? undefined)}
            >
              {retry ? t.skip : t.remix}
            </button>
          </div>
        </section>

        <aside className={styles.mastery}>
          <h2>{t.mastery}</h2>
          <p className={styles.blurb}>
            {t.masteryBlurbBefore}
            <strong>{t.masteryBlurbStrong}</strong>
            {t.masteryBlurbAfter}
          </p>
          <MasteryChart
            view={mastery}
            onTopicClick={(id) => {
              setBoss(null);
              setMode(id);
            }}
          />
        </aside>
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
