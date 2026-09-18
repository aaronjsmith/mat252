import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TitleBar } from '../components/header/TitleBar';
import { LanguageToggle, ThemeToggle } from '../components/header/Toggles';
import { StatusBar } from '../components/StatusBar';
import {
  ASSESSMENTS,
  HINT_CREDIT,
  MASTER,
  RETRY_CREDIT,
  examLengthOf,
  getAssessment,
  type TopicId,
} from '../data/catalog';
import { useI18n } from '../context/LanguageContext';
import { assessmentText, themeCopy, topicLabel } from '../i18n/catalog';
import { fmt } from '../i18n/locale';
import { checkAnswer, generateQuestion, type Question } from '../questions/generate';
import { MasteryChart } from '../components/progress/MasteryChart';
import { MathText } from '../components/quiz/MathText';
import { ScratchPad } from '../components/quiz/ScratchPad';
import {
  copyTextToClipboard,
  excelValuesTsv,
  parseNoteNumbers,
  valuesFromPrompt,
} from '../lib/scratch';
import {
  allMastered,
  effectiveTopicUnaided,
  notesKey,
  readMasteryView,
  readProgress,
  readProgressSummary,
  recordExamScore,
  setTopicUnaided,
  syncTopicToRelated,
  topicUnaided,
  writeProgress,
} from '../state/progress';
import styles from './QuizPage.module.css';

type Mode = 'smart' | 'all' | 'teachme' | 'nourish' | 'flashcards' | 'finalboss' | 'exam' | TopicId;

function param(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

/** Keep ?mode= in sync so refresh does not jump back to an old exam URL. */
function syncModeToUrl(assessmentId: string, mode: Mode): void {
  const url = new URL(window.location.href);
  url.searchParams.set('a', assessmentId);
  if (mode === 'smart') url.searchParams.delete('mode');
  else url.searchParams.set('mode', mode);
  const next = `${url.pathname}?${url.searchParams.toString()}`;
  const cur = `${window.location.pathname}${window.location.search}`;
  if (next !== cur) window.history.replaceState({}, '', next);
}

function buildExamQuestions(topics: TopicId[], n: number, locale: 'en' | 'es'): Question[] {
  const qs: Question[] = [];
  let prev: Question | null = null;
  for (let i = 0; i < n; i++) {
    const next = generateQuestion(topics[i % topics.length]!, false, locale, prev);
    qs.push(next);
    prev = next;
  }
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = qs[i]!;
    qs[i] = qs[j]!;
    qs[j] = tmp;
  }
  return qs;
}

function pickTopic(topics: TopicId[], progressId: string, preferUnmastered: boolean): TopicId {
  const assessment = getAssessment(progressId) ?? getAssessment('overview')!;
  const unaided = (tid: TopicId) => effectiveTopicUnaided(assessment, tid);
  const pool = preferUnmastered ? topics.filter((t) => unaided(t) < MASTER) : topics;
  const use = pool.length ? pool : topics;
  use.sort((a, b) => unaided(a) - unaided(b));
  const lowest = unaided(use[0]!);
  const tied = use.filter((t) => unaided(t) === lowest);
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
  const [answered, setAnswered] = useState(false);
  const [remixAfterFail, setRemixAfterFail] = useState(false);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const [boss, setBoss] = useState<{
    active: boolean;
    practice: boolean;
    queue: TopicId[];
    index: number;
  } | null>(null);
  const [invite, setInvite] = useState(false);
  const [exam, setExam] = useState<{
    questions: Question[];
    index: number;
    results: (boolean | null)[];
    done: boolean;
  } | null>(null);
  const [examGen, setExamGen] = useState(0);
  const [copyFlash, setCopyFlash] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');
  const [padInsert, setPadInsert] = useState<{ key: number; text: string } | undefined>();
  const copyTimer = useRef<number | null>(null);

  const summary = useMemo(() => readProgressSummary(assessment), [assessment, tick]);
  const mastery = useMemo(() => readMasteryView(assessment), [assessment, tick]);
  const bossRef = useRef(boss);

  const resetItem = useCallback(
    (teach: boolean) => {
      setPicked('');
      setHints(teach ? 3 : 0);
      setShow1(teach);
      setShow2(teach);
      setShow3(teach);
      setFeedback(null);
      setRetry(false);
      setAnswered(false);
      setWrongPicks([]);
    },
    [],
  );

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
      } else if (m === 'finalboss' || m === 'exam') {
        topic = pickTopic(assessment.topicIds, assessment.id, true);
      } else {
        topic = m;
      }
      setRemixAfterFail(false);
      setQ((prev) => generateQuestion(topic, flash, locale, prev));
      resetItem(m === 'teachme');
    },
    [assessment, locale, resetItem],
  );

  const remixQuestion = useCallback(
    (carry?: { ok: boolean; text: string }) => {
      if (!q) {
        nextQuestion(mode, boss ?? undefined);
        return;
      }
      const flash = mode === 'flashcards';
      setRemixAfterFail(false);
      setQ(generateQuestion(q.topic, flash, locale, q));
      resetItem(mode === 'teachme');
      if (carry) setFeedback(carry);
    },
    [q, mode, boss, locale, nextQuestion, resetItem],
  );

  useEffect(() => {
    bossRef.current = boss;
  }, [boss]);

  useEffect(() => {
    syncModeToUrl(assessment.id, mode);
  }, [assessment.id, mode]);

  useEffect(() => {
    if (mode === 'exam' && assessment.exam) {
      const n = examLengthOf(assessment);
      const questions = buildExamQuestions(assessment.topicIds, n, locale);
      setExam({ questions, index: 0, results: Array(n).fill(null), done: false });
      setQ(questions[0]!);
      resetItem(false);
      setBoss(null);
      setRemixAfterFail(false);
      return;
    }
    setExam(null);
    nextQuestion(mode, bossRef.current ?? undefined);
    // Restart only when the quiz identity changes, not when nextQuestion updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, locale, assessment.id, examGen]);

  useEffect(() => {
    if (allMastered(assessment, readProgress(assessment.id)) && !readProgress(assessment.id).final_boss_cleared) {
      setInvite(true);
    }
  }, [assessment, tick]);

  function bump(topic: TopicId, unaidedDelta: number, credit: number, attempted = true) {
    let p = readProgress(assessment.id);
    const nextUnaided = Math.max(0, Math.min(MASTER, topicUnaided(p, topic) + unaidedDelta));
    p = setTopicUnaided(p, topic, nextUnaided);
    p = {
      ...p,
      total_attempted: p.total_attempted + (attempted ? 1 : 0),
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
    setExam(null);
    setBoss(state);
    setInvite(false);
    setMode('finalboss');
    nextQuestion('finalboss', state);
  }

  function finishExam(results: (boolean | null)[]) {
    const correct = results.filter((r) => r === true).length;
    recordExamScore(assessment.id, correct, results.length);
    setTick((n) => n + 1);
  }

  function examAdvance(results: (boolean | null)[]) {
    if (!exam) return;
    const nextIndex = exam.index + 1;
    if (nextIndex >= exam.questions.length) {
      finishExam(results);
      setExam({ ...exam, results, done: true });
      return;
    }
    const nextQ = exam.questions[nextIndex]!;
    setExam({ ...exam, results, index: nextIndex });
    setQ(nextQ);
    resetItem(false);
  }

  function questionValues(): number[] {
    if (q?.values && q.values.length >= 2) return q.values;
    if (q) return valuesFromPrompt(q.prompt);
    return [];
  }

  async function copyExcelValues(notesText = '') {
    const fromQ = questionValues();
    let notes = notesText;
    if (!notes) {
      try {
        notes = localStorage.getItem(notesKey(assessment.id)) || '';
      } catch {
        notes = '';
      }
    }
    const nums = fromQ.length >= 2 ? fromQ : parseNoteNumbers(notes);
    if (!nums.length) {
      setCopyMsg(t.excelCopyEmpty);
      return;
    }
    const tsv = excelValuesTsv(nums);
    const ok = await copyTextToClipboard(tsv);
    setCopyMsg(ok ? fmt(t.excelCopyOk, { n: nums.length }) : t.excelCopyFail);
    setCopyFlash(ok);
    if (!ok) {
      let notes = notesText;
      if (!notes) {
        try {
          notes = localStorage.getItem(notesKey(assessment.id)) || '';
        } catch {
          notes = '';
        }
      }
      const next = notes.trim() ? `${notes.replace(/\s+$/, '')}\n${tsv}` : tsv;
      setPadInsert({ key: Date.now(), text: next });
    }
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopyFlash(false), 1400);
  }

  function goToNextQuestion() {
    if (exam && !exam.done) {
      examAdvance(exam.results);
      return;
    }
    if (!boss && mode === 'finalboss') {
      setMode('smart');
      return;
    }
    if (remixAfterFail && q) {
      remixQuestion();
      return;
    }
    nextQuestion(mode, boss ?? undefined);
  }

  function onRemix() {
    if (retry) setRetry(false);
    remixQuestion();
  }

  function onSkip() {
    if (!q) return;
    if (exam && !exam.done) {
      const results = exam.results.slice();
      if (results[exam.index] == null) results[exam.index] = false;
      examAdvance(results);
      return;
    }
    if (retry) {
      finishRetry(false);
      return;
    }
    if (mode !== 'teachme' && hints > 0 && !answered) {
      bump(q.topic, -1, 0, false);
    }
    setRemixAfterFail(false);
    nextQuestion(mode, boss ?? undefined);
  }

  function finishRetry(ok: boolean) {
    if (!q) return;
    setRetry(false);
    setAnswered(true);
    if (ok) {
      setRemixAfterFail(false);
      bump(q.topic, 0, RETRY_CREDIT, false);
      setFeedback({ ok: true, text: t.retryOk });
      return;
    }
    setFeedback({
      ok: false,
      text: fmt(t.retryFail, { expected: String(q.answer) }),
    });
  }

  function onCheck() {
    if (!q) return;
    if (answered && !retry) {
      goToNextQuestion();
      return;
    }

    const ok = checkAnswer(q, picked);

    if (exam && !exam.done) {
      if (exam.results[exam.index] != null) {
        examAdvance(exam.results);
        return;
      }
      const results = exam.results.slice();
      results[exam.index] = ok;
      setExam({ ...exam, results });
      setAnswered(true);
      if (ok) bump(q.topic, 1, 1);
      else {
        const p = readProgress(assessment.id);
        writeProgress(assessment.id, {
          ...p,
          total_attempted: p.total_attempted + 1,
        });
        setTick((n) => n + 1);
      }
      setFeedback({
        ok,
        text: ok ? t.examCorrect : t.examIncorrect,
      });
      return;
    }

    if (retry) {
      finishRetry(ok);
      return;
    }

    if (boss?.active) {
      setAnswered(true);
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
        nextQuestion('finalboss', next);
        setFeedback({
          ok: true,
          text: theme.ok
            .replace('{current}', String(nextIndex))
            .replace('{total}', String(boss.queue.length)),
        });
        return;
      }
      const unaided = bump(q.topic, -1, 0);
      remixQuestion({
        ok: false,
        text: theme.miss
          .replace('{topic}', topicLabel(q.topic, locale))
          .replace('{progress}', `${unaided}/${MASTER}`),
      });
      return;
    }

    if (ok) {
      setAnswered(true);
      setRemixAfterFail(false);
      if (mode === 'teachme') {
        setFeedback({
          ok: true,
          text: t.teachCorrect,
        });
        return;
      }
      const credit = HINT_CREDIT[Math.min(hints, 3)] ?? 0.25;
      const unaidedDelta = hints === 0 ? 1 : -1;
      const n = bump(q.topic, unaidedDelta, credit);
      setFeedback({
        ok: true,
        text:
          hints === 0
            ? fmt(t.correctUnaided, { n, master: MASTER })
            : fmt(t.correctHinted, { pct: Math.round(credit * 100), n, master: MASTER }),
      });
      return;
    }

    bump(q.topic, 0, 0);
    setAnswered(true);
    setRetry(true);
    setRemixAfterFail(true);
    setShow1(true);
    if (q.type === 'mc') setWrongPicks((prev) => [...prev, picked]);
    else setPicked('');
    setFeedback({
      ok: false,
      text: fmt(t.notQuite, { pct: Math.round(RETRY_CREDIT * 100) }),
    });
  }

  if (!q) {
    return <div className={styles.page}>{t.loading}</div>;
  }

  const inExam = Boolean(exam && !exam.done);
  const examDone = Boolean(exam?.done);
  const locked = answered && !retry;
  const noHints = Boolean(boss?.active || inExam || examDone || locked);
  const examCorrectCount = exam ? exam.results.filter((r) => r === true).length : 0;
  const examMissedTopics = exam
    ? Array.from(
        new Set(
          exam.questions.filter((_, i) => exam.results[i] === false).map((item) => item.topic),
        ),
      )
    : [];
  const showCheck = !locked;
  const showNext = locked;
  const showRemix = !boss && !inExam && (!answered || retry);
  const showSkip = !boss && (!answered || retry);

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
          {summary.examBest && (
            <div className={styles.stat}>
              <span className={styles.statVal}>
                {summary.examBest.correct}/{summary.examBest.total}
              </span>
              <span className={styles.statLbl}>{t.takeTest}</span>
            </div>
          )}
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
              data-active={mode === id && !boss && !exam}
              onClick={() => {
                setBoss(null);
                setMode(id);
              }}
            >
              {label}
            </button>
          ))}
          {assessment.exam && (
            <button
              type="button"
              className={styles.topic}
              data-boss="true"
              data-active={mode === 'exam'}
              onClick={() => {
                if (mode === 'exam') setExamGen((n) => n + 1);
                else setMode('exam');
              }}
            >
              {fmt(t.takeTestN, { n: examLengthOf(assessment) })}
            </button>
          )}
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
              data-active={mode === tid && !boss && !exam}
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
          {invite && !boss && !exam && (
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
          {inExam && exam && (
            <p className={styles.banner}>
              {fmt(t.examQuestion, { current: exam.index + 1, total: exam.questions.length })}
              {' · '}
              {topicLabel(q.topic, locale)}
            </p>
          )}

          {examDone && exam ? (
            <div className={styles.examDone}>
              <h1 className={styles.prompt}>{t.examDone}</h1>
              <p className={styles.examScore}>
                {fmt(t.examScore, {
                  correct: examCorrectCount,
                  total: exam.questions.length,
                  pct: Math.round((100 * examCorrectCount) / exam.questions.length),
                })}
              </p>
              <p className={styles.blurb}>
                {examMissedTopics.length
                  ? `${t.examMissed}: ${examMissedTopics.map((id) => topicLabel(id, locale)).join(', ')}`
                  : t.examNoneMissed}
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => {
                    if (mode === 'exam') setExamGen((n) => n + 1);
                    else setMode('exam');
                  }}
                >
                  {t.retakeTest}
                </button>
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => setMode('smart')}
                >
                  {t.openPractice}
                </button>
              </div>
            </div>
          ) : (
            <>
          <div className={styles.meta}>
            {boss && <span className={styles.bossFace}>{theme.emoji}</span>}
            <span className={styles.pill}>{topicLabel(q.topic, locale)}</span>
          </div>
          <MathText as="h1" className={styles.prompt} rich text={q.prompt} />
          {q.svg ? (
            <div
              className={styles.figure}
              dangerouslySetInnerHTML={{ __html: q.svg }}
            />
          ) : null}

          {q.type === 'mc' && q.choices && (
            <div className={styles.choices} role="group" aria-label={t.choices}>
              {q.choices.map((c) => {
                const isWrong = wrongPicks.includes(c);
                const isRight = locked && String(q.answer) === c;
                return (
                  <button
                    key={c}
                    type="button"
                    className={styles.choice}
                    data-on={picked === c}
                    data-wrong={isWrong}
                    data-right={isRight}
                    onClick={() => setPicked(c)}
                    disabled={locked || isWrong}
                  >
                    <MathText text={c} />
                  </button>
                );
              })}
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
              disabled={locked}
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
              {show1 && (
                <div className={styles.hintBox}>
                  <MathText rich text={q.hint} />
                </div>
              )}
              {show2 && q.setup && (
                <div className={styles.hintBox}>
                  <MathText rich text={q.setup} />
                </div>
              )}
              {show3 && (q.calc.ti || q.calc.excel) && (
                <div className={styles.hintBox}>
                  <MathText
                    rich
                    text={[
                      q.calc.ti ? `${t.calcTi}${q.calc.ti}` : '',
                      q.calc.excel ? `${t.calcExcel}${q.calc.excel}` : '',
                    ]
                      .filter(Boolean)
                      .join('\n')}
                  />
                </div>
              )}
            </>
          )}

          {feedback && (
            <div className={`${styles.feedback} ${feedback.ok ? styles.ok : styles.bad}`}>
              <MathText rich text={feedback.text} />
              {feedback.ok && !retry && locked && q.type === 'numeric' ? (
                <MathText text={fmt(t.answerSuffix, { answer: String(q.answer) })} />
              ) : null}
            </div>
          )}

          <div className={styles.actions}>
            {showCheck && (
              <button type="button" className={styles.primary} onClick={onCheck} disabled={!picked}>
                {retry ? t.checkAgain : t.check}
              </button>
            )}
            {showNext && (
              <button type="button" className={styles.primary} onClick={goToNextQuestion}>
                {t.next}
              </button>
            )}
            {showSkip && (
              <button type="button" className={styles.ghost} onClick={onSkip}>
                {t.skip}
              </button>
            )}
            {showRemix && (
              <button type="button" className={styles.ghost} onClick={onRemix}>
                {t.remix}
              </button>
            )}
            <button
              type="button"
              className={styles.ghost}
              title={t.excelCopyAria}
              aria-label={t.excelCopyAria}
              onClick={() => copyExcelValues()}
            >
              {copyFlash ? t.excelCopied : t.excelCopyValues}
            </button>
            {inExam && (
              <button type="button" className={styles.ghost} onClick={() => setMode('smart')}>
                {t.examAbandon}
              </button>
            )}
          </div>
            </>
          )}
          {copyMsg && <p className={styles.copyMsg}>{copyMsg}</p>}
          <ScratchPad
            storageKey={notesKey(assessment.id)}
            copyBusy={copyFlash}
            insert={padInsert}
            onCopyExcel={(notesText) => {
              void copyExcelValues(notesText);
            }}
          />
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
