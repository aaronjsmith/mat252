import { useCallback, useEffect, useMemo, useState } from 'react';
import { TitleBar } from '../components/header/TitleBar';
import { ThemeToggle } from '../components/header/Toggles';
import { StatusBar } from '../components/StatusBar';
import {
  ASSESSMENTS,
  HINT_CREDIT,
  MASTER,
  RETRY_CREDIT,
  THEMES,
  TOPIC_LABEL,
  getAssessment,
  type TopicId,
} from '../data/catalog';
import { checkAnswer, generateQuestion, type Question } from '../questions/generate';
import {
  allMastered,
  isMastered,
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
  const assessment = getAssessment(param('a')) ?? getAssessment('overview')!;
  const theme = THEMES[assessment.theme];
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

  const progress = useMemo(() => readProgress(assessment.id), [assessment.id, tick]);
  const summary = useMemo(() => readProgressSummary(assessment), [assessment, tick]);

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
      const nq = generateQuestion(topic, flash);
      setQ(nq);
      setPicked('');
      setHints(m === 'teachme' ? 3 : 0);
      setShow1(m === 'teachme');
      setShow2(m === 'teachme');
      setShow3(m === 'teachme');
      setFeedback(null);
      setRetry(false);
    },
    [assessment],
  );

  useEffect(() => {
    nextQuestion(mode);
  }, [mode, nextQuestion]);

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
          .replace('{topic}', TOPIC_LABEL[q.topic])
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
          ? `Correct · unaided (+1 mastery, now ${Math.min(MASTER, topicUnaided(readProgress(assessment.id), q.topic))}/${MASTER})`
          : `Correct · credit ${Math.round(credit * 100)}% (hints used, no mastery)`,
      });
    } else {
      setRetry(true);
      setFeedback({
        ok: false,
        text: `Not quite. Try again for ${Math.round(RETRY_CREDIT * 100)}% credit, or skip.`,
      });
    }
  }

  if (!q) {
    return <div className={styles.page}>Loading…</div>;
  }

  const noHints = Boolean(boss?.active);

  return (
    <div className={styles.page}>
      <TitleBar
        title={assessment.title}
        subtitle={`MAT 252 · ${theme.name}`}
        backHref="/"
      />

      <div className={styles.toolbar}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{summary.accuracy != null ? `${summary.accuracy}%` : '—'}</span>
            <span className={styles.statLbl}>Grade</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{summary.mastered}/{summary.total}</span>
            <span className={styles.statLbl}>Mastered</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{summary.attempted}</span>
            <span className={styles.statLbl}>Answered</span>
          </div>
        </div>
        <span className={styles.spacer} />
        <ThemeToggle />
      </div>

      <main className={styles.body}>
        <aside className={styles.topics}>
          <h2>Topics</h2>
          <p className={styles.blurb}>
            Mastery = <strong>10 correct with no hints</strong> per topic. Hints never reveal the
            answer — only how to work. Penalty if correct: Hint 1 −25%, Hint 2 −50%, Hint 3 −75%.
          </p>
          {(
            [
              ['smart', 'Smart pick'],
              ['all', 'All topics'],
              ['teachme', 'Teach me'],
              ...(assessment.nourish ? [['nourish', 'Nourish and Strengthen'] as const] : []),
              ...(assessment.flashcards ? [['flashcards', 'Formula flashcards'] as const] : []),
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
              <span>{TOPIC_LABEL[tid]}</span>
              <span className={styles.mastery}>{topicUnaided(progress, tid)}/{MASTER}</span>
            </button>
          ))}
        </aside>

        <section className={styles.quiz}>
          {invite && !boss && (
            <div className={styles.banner}>
              <strong>{theme.name}.</strong> {theme.invite}{' '}
              <button type="button" className={styles.linkish} onClick={() => startBoss(false)}>
                Fight
              </button>
              <button type="button" className={styles.linkish} onClick={() => setInvite(false)}>
                Not now
              </button>
            </div>
          )}
          {boss && (
            <p className={styles.banner}>
              {theme.progress
                .replace('{current}', String(boss.index + 1))
                .replace('{total}', String(boss.queue.length))
                .replace('{topic}', TOPIC_LABEL[q.topic])}
            </p>
          )}
          <div className={styles.meta}>
            {boss && <span className={styles.bossFace}>{theme.emoji}</span>}
            <span className={styles.pill}>{TOPIC_LABEL[q.topic]}</span>
          </div>
          <h1 className={styles.prompt}>{q.prompt}</h1>

          {q.type === 'mc' && q.choices && (
            <div className={styles.choices} role="group" aria-label="Choices">
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
              placeholder={q.unit ? `Number (${q.unit})` : 'Number'}
              aria-label="Numeric answer"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCheck();
              }}
            />
          )}

          {!noHints && (
            <>
              <div className={styles.hintRow}>
                <button type="button" className={styles.linkish} disabled={show1} onClick={() => { setShow1(true); setHints((h) => Math.max(h, 1)); }}>
                  Hint 1 · approach (−25%)
                </button>
                <button type="button" className={styles.linkish} disabled={!show1 || show2} onClick={() => { setShow2(true); setHints((h) => Math.max(h, 2)); }}>
                  Hint 2 · setup (−50%)
                </button>
                <button type="button" className={styles.linkish} disabled={!show2 || show3} onClick={() => { setShow3(true); setHints((h) => Math.max(h, 3)); }}>
                  Calculator / Excel (−75%)
                </button>
              </div>
              {show1 && <div className={styles.hintBox}>{q.hint}</div>}
              {show2 && q.setup && <div className={styles.hintBox}>{q.setup}</div>}
              {show3 && (q.calc.ti || q.calc.excel) && (
                <div className={styles.hintBox}>
                  {q.calc.ti ? `TI / Casio: ${q.calc.ti}\n` : ''}
                  {q.calc.excel ? `Excel: ${q.calc.excel}` : ''}
                </div>
              )}
            </>
          )}

          {feedback && (
            <div className={`${styles.feedback} ${feedback.ok ? styles.ok : styles.bad}`}>
              {feedback.text}
              {feedback.ok && q.type === 'numeric' ? ` · answer ${q.answer}` : ''}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onCheck} disabled={!picked}>
              {retry ? 'Check again · 5%' : 'Check'}
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => nextQuestion(mode, boss ?? undefined)}
            >
              {retry ? 'Skip · 0%' : 'Remix'}
            </button>
          </div>
        </section>
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
