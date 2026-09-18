/** MAT 252 catalog aligned to Ensign Statistics (Canvas 27287 / ALEKS + catalog outcomes). */

export const MASTER = 10;
export const HINT_CREDIT = [1, 0.75, 0.5, 0.25] as const;
export const RETRY_CREDIT = 0.05;

export type TopicId =
  | 'data_types'
  | 'sampling'
  | 'graphs'
  | 'center'
  | 'spread'
  | 'z_scores'
  | 'literacy'
  | 'prob_basic'
  | 'prob_compound'
  | 'discrete'
  | 'normal'
  | 'clt'
  | 'ci'
  | 'ht_one'
  | 'ht_two'
  | 'chi_square'
  | 'regression';

export const TOPIC_LABEL: Record<TopicId, string> = {
  data_types: 'Data types & measurement',
  sampling: 'Sampling & bias',
  graphs: 'Graphs & frequency tables',
  center: 'Mean, median, mode',
  spread: 'Spread & five-number summary',
  z_scores: 'Z-scores & percentiles',
  literacy: 'Statistical literacy',
  prob_basic: 'Basic probability',
  prob_compound: 'Compound probability',
  discrete: 'Discrete RVs & binomial',
  normal: 'Normal distribution',
  clt: 'Sampling distributions & CLT',
  ci: 'Confidence intervals',
  ht_one: 'One-sample hypothesis tests',
  ht_two: 'Two-sample tests',
  chi_square: 'Chi-square tests',
  regression: 'Correlation & regression',
};

export const WEEK1_TOPICS: TopicId[] = ['data_types', 'sampling', 'graphs', 'literacy'];
export const WEEK2_TOPICS: TopicId[] = ['center', 'spread', 'z_scores', 'prob_basic', 'prob_compound'];
export const WEEK3_TOPICS: TopicId[] = ['discrete'];
export const MIDTERM1_TOPICS: TopicId[] = [...WEEK1_TOPICS, ...WEEK2_TOPICS, ...WEEK3_TOPICS];
export const WEEK4_TOPICS: TopicId[] = ['normal', 'clt', 'ci'];
export const WEEK5_TOPICS: TopicId[] = ['ci', 'ht_one'];
export const WEEK6_TOPICS: TopicId[] = ['ht_two', 'chi_square', 'regression'];
export const MIDTERM2_TOPICS: TopicId[] = ['normal', 'clt', 'ci', 'ht_one', 'ht_two', 'chi_square', 'regression'];
export const DESC_TOPICS: TopicId[] = WEEK1_TOPICS.slice();
export const PROB_TOPICS: TopicId[] = [...WEEK2_TOPICS, ...WEEK3_TOPICS];
export const INFER_TOPICS: TopicId[] = MIDTERM2_TOPICS.slice();
export const ALL_TOPICS: TopicId[] = [
  ...WEEK1_TOPICS,
  ...WEEK2_TOPICS,
  ...WEEK3_TOPICS,
  'normal',
  'clt',
  'ci',
  'ht_one',
  'ht_two',
  'chi_square',
  'regression',
];

export type ThemeId =
  | 'gathering'
  | 'zarahemla'
  | 'meetinghouse'
  | 'institute'
  | 'lots'
  | 'bountiful'
  | 'urim'
  | 'manna'
  | 'deseret'
  | 'alma'
  | 'line'
  | 'plates';

export interface BossCopy {
  name: string;
  invite: string;
  start: string;
  startPractice: string;
  progress: string;
  ok: string;
  miss: string;
  fail: string;
  win: string;
  winPractice: string;
  cleared: string;
  fightLabel: string;
  practiceLabel: string;
  emoji: string;
  emojiHit: string;
  emojiWin: string;
  emojiDead: string;
}

export const THEMES: Record<ThemeId, BossCopy> = {
  gathering: {
    name: 'The Scattering',
    invite: 'Every topic is mastered at 10/10. The Scattering threatens the record — fight now?',
    start: 'The Scattering threatens the record of the people. Answer one unaided question from each topic — no hints.',
    startPractice: 'Practice fight vs The Scattering: one unaided question per topic — no hints.',
    progress: 'The Scattering · {current}/{total} · {topic}',
    ok: 'The remnant gathers · {current}/{total}. Press on.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The record is at risk. The Scattering slips away on {topic} — that topic drops to {progress}.',
    win: 'The remnant is gathered — the record stands. You’re ready for the course.',
    winPractice: 'Practice victory! Master every topic at 10/10, then face The Scattering again.',
    cleared: 'The Scattering cleared',
    fightLabel: 'Face The Scattering',
    practiceLabel: 'Practice: The Scattering',
    emoji: '🌪️',
    emojiHit: '💨',
    emojiWin: '🧭',
    emojiDead: '✨',
  },
  zarahemla: {
    name: 'False Weights',
    invite: 'Every topic is mastered at 10/10. False weights threaten Zarahemla — fight now?',
    start: 'False weights threaten the merchants of Zarahemla. One unaided question per topic — no hints.',
    startPractice: 'Practice fight vs False Weights: one unaided question per topic — no hints.',
    progress: 'False Weights · {current}/{total} · {topic}',
    ok: 'The scales steady · {current}/{total}. Press on for Zarahemla.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'Zarahemla is in danger. False weights slip away on {topic} — that topic drops to {progress}.',
    win: 'The scales are true — Zarahemla is saved. You’re ready for the assessment.',
    winPractice: 'Practice victory! Master every topic at 10/10, then face False Weights again.',
    cleared: 'False Weights cleared',
    fightLabel: 'Face False Weights',
    practiceLabel: 'Practice: False Weights',
    emoji: '⚖️',
    emojiHit: '📉',
    emojiWin: '🛡️',
    emojiDead: '✅',
  },
  meetinghouse: {
    name: 'The Roll Call',
    invite: 'Every topic is mastered at 10/10. The Roll Call awaits — begin now?',
    start: 'The Roll Call: one unaided question per topic — no hints.',
    startPractice: 'Practice the Roll Call: one unaided question per topic — no hints.',
    progress: 'The Roll Call · {current}/{total} · {topic}',
    ok: 'Names recorded · {current}/{total}. Continue.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The roll is incomplete on {topic} — that topic drops to {progress}.',
    win: 'Every name is counted. You’re ready for this week.',
    winPractice: 'Practice victory! Master every topic at 10/10, then face the Roll Call again.',
    cleared: 'Roll Call cleared',
    fightLabel: 'Face the Roll Call',
    practiceLabel: 'Practice: Roll Call',
    emoji: '📋',
    emojiHit: '✏️',
    emojiWin: '📖',
    emojiDead: '✔️',
  },
  institute: {
    name: 'Rumors of the Adversary',
    invite: 'Every topic is mastered at 10/10. Rumors of the Adversary stir — fight now?',
    start: 'Rumors of the Adversary: one unaided question per topic — no hints.',
    startPractice: 'Practice fight: one unaided question per topic — no hints.',
    progress: 'Rumors · {current}/{total} · {topic}',
    ok: 'Truth cuts through · {current}/{total}. Press on.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'Rumors spread on {topic} — that topic drops to {progress}.',
    win: 'The rumors are quieted. You’re ready for this week.',
    winPractice: 'Practice victory! Master every topic at 10/10, then face the rumors again.',
    cleared: 'Rumors cleared',
    fightLabel: 'Face the Rumors',
    practiceLabel: 'Practice: Rumors',
    emoji: '🗣️',
    emojiHit: '🗯️',
    emojiWin: '📖',
    emojiDead: '🔇',
  },
  lots: {
    name: 'Casting Lots',
    invite: 'Every topic is mastered at 10/10. Casting Lots awaits — begin now?',
    start: 'Casting Lots: one unaided question per topic — no hints.',
    startPractice: 'Practice Casting Lots: one unaided question per topic — no hints.',
    progress: 'Casting Lots · {current}/{total} · {topic}',
    ok: 'The lot is cast · {current}/{total}. Continue.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The lot went against you on {topic} — that topic drops to {progress}.',
    win: 'The lot is understood. You’re ready for this week.',
    winPractice: 'Practice victory! Master every topic at 10/10, then cast lots again.',
    cleared: 'Casting Lots cleared',
    fightLabel: 'Cast Lots',
    practiceLabel: 'Practice: Casting Lots',
    emoji: '🎲',
    emojiHit: '💥',
    emojiWin: '🛡️',
    emojiDead: '🏳️',
  },
  bountiful: {
    name: 'The Tempest',
    invite: 'Every topic is mastered at 10/10. The Tempest awaits — begin now?',
    start: 'The Tempest threatens Nephi’s ship. One unaided question per topic — no hints.',
    startPractice: 'Practice fight vs The Tempest: one unaided question per topic — no hints.',
    progress: 'The Tempest · {current}/{total} · {topic}',
    ok: 'The storm breaks · {current}/{total}. Press on for Nephi’s ship.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'Nephi’s ship is at risk. The Tempest slips away on {topic} — that topic drops to {progress}.',
    win: 'The Tempest is calmed — Nephi’s ship is safe. You’re ready for the quiz.',
    winPractice: 'Practice victory! Master every topic at 10/10, then face The Tempest again.',
    cleared: 'The Tempest cleared',
    fightLabel: 'Face The Tempest',
    practiceLabel: 'Practice: The Tempest',
    emoji: '⛈️',
    emojiHit: '🌊',
    emojiWin: '⛵',
    emojiDead: '🌅',
  },
  urim: {
    name: 'Urim and Thummim',
    invite: 'Every topic is mastered at 10/10. Urim and Thummim await — begin now?',
    start: 'Urim and Thummim: one unaided question per topic — no hints.',
    startPractice: 'Practice: one unaided question per topic — no hints.',
    progress: 'Urim and Thummim · {current}/{total} · {topic}',
    ok: 'Light on the stones · {current}/{total}. Continue.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The stones dim on {topic} — that topic drops to {progress}.',
    win: 'The interpreters shine. You’re ready for this week.',
    winPractice: 'Practice victory! Master every topic at 10/10, then try again.',
    cleared: 'Urim and Thummim cleared',
    fightLabel: 'Face Urim and Thummim',
    practiceLabel: 'Practice: Urim and Thummim',
    emoji: '💎',
    emojiHit: '✨',
    emojiWin: '🔮',
    emojiDead: '🌟',
  },
  manna: {
    name: 'Daily Manna',
    invite: 'Every topic is mastered at 10/10. Daily Manna awaits — begin now?',
    start: 'Daily Manna: one unaided question per topic — no hints.',
    startPractice: 'Practice Daily Manna: one unaided question per topic — no hints.',
    progress: 'Daily Manna · {current}/{total} · {topic}',
    ok: 'Enough for today · {current}/{total}. Continue.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The manna spoiled on {topic} — that topic drops to {progress}.',
    win: 'Enough and to spare. You’re ready for this week.',
    winPractice: 'Practice victory! Master every topic at 10/10, then gather again.',
    cleared: 'Daily Manna cleared',
    fightLabel: 'Gather Daily Manna',
    practiceLabel: 'Practice: Daily Manna',
    emoji: '🌾',
    emojiHit: '🍂',
    emojiWin: '🧺',
    emojiDead: '☀️',
  },
  deseret: {
    name: 'The Honeybee',
    invite: 'Every topic is mastered at 10/10. The Honeybee’s work awaits — begin now?',
    start: 'The Honeybee: one unaided question per topic — no hints.',
    startPractice: 'Practice: one unaided question per topic — no hints.',
    progress: 'The Honeybee · {current}/{total} · {topic}',
    ok: 'The hive thrives · {current}/{total}. Press on.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The hive is threatened on {topic} — that topic drops to {progress}.',
    win: 'Deseret stands. You’re ready for the assessment.',
    winPractice: 'Practice victory! Master every topic at 10/10, then face the Honeybee again.',
    cleared: 'Honeybee cleared',
    fightLabel: 'Face the Honeybee',
    practiceLabel: 'Practice: Honeybee',
    emoji: '🐝',
    emojiHit: '🌼',
    emojiWin: '🍯',
    emojiDead: '🌿',
  },
  alma: {
    name: 'Experiment on the Word',
    invite: 'Every topic is mastered at 10/10. Experiment on the Word — begin now?',
    start: 'Experiment on the Word (Alma 32): one unaided question per topic — no hints.',
    startPractice: 'Practice the experiment: one unaided question per topic — no hints.',
    progress: 'The Experiment · {current}/{total} · {topic}',
    ok: 'The seed swells · {current}/{total}. Continue.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The seed withers on {topic} — that topic drops to {progress}.',
    win: 'The tree bears fruit. You’re ready for this week.',
    winPractice: 'Practice victory! Master every topic at 10/10, then experiment again.',
    cleared: 'Experiment cleared',
    fightLabel: 'Run the Experiment',
    practiceLabel: 'Practice: Experiment',
    emoji: '🌱',
    emojiHit: '🌧️',
    emojiWin: '🌳',
    emojiDead: '🍎',
  },
  line: {
    name: 'Line upon Line',
    invite: 'Every topic is mastered at 10/10. Line upon Line awaits — begin now?',
    start: 'Line upon Line: one unaided question per topic — no hints.',
    startPractice: 'Practice: one unaided question per topic — no hints.',
    progress: 'Line upon Line · {current}/{total} · {topic}',
    ok: 'Another line · {current}/{total}. Continue.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The line breaks on {topic} — that topic drops to {progress}.',
    win: 'Precept upon precept. You’re ready for this week.',
    winPractice: 'Practice victory! Master every topic at 10/10, then add another line.',
    cleared: 'Line upon Line cleared',
    fightLabel: 'Face Line upon Line',
    practiceLabel: 'Practice: Line upon Line',
    emoji: '📏',
    emojiHit: '📉',
    emojiWin: '📈',
    emojiDead: '🧭',
  },
  plates: {
    name: 'The Plates',
    invite: 'Every topic is mastered at 10/10. The plates are brought to the testing center — begin now?',
    start: 'The Plates: one unaided question per topic — no hints. This is Midterm 1 shape.',
    startPractice: 'Practice the plates: one unaided question per topic — no hints.',
    progress: 'The Plates · {current}/{total} · {topic}',
    ok: 'The record holds · {current}/{total}. Continue.',
    miss: 'Missed {topic} — mastery drops to {progress}. Clear a remix to proceed.',
    fail: 'The plates dim on {topic} — that topic drops to {progress}.',
    win: 'The record is secure. You’re ready for Midterm 1.',
    winPractice: 'Practice victory! Master every topic at 10/10, then face the plates again.',
    cleared: 'The Plates cleared',
    fightLabel: 'Face the Plates',
    practiceLabel: 'Practice: The Plates',
    emoji: '📜',
    emojiHit: '🔥',
    emojiWin: '🛡️',
    emojiDead: '✨',
  },
};

export interface Assessment {
  id: string;
  weekId: string;
  number: number;
  title: string;
  summary: string;
  badge: string;
  theme: ThemeId;
  available: boolean;
  compose?: boolean;
  compact?: boolean;
  nourish?: boolean;
  flashcards?: boolean;
  boss: boolean;
  exam?: boolean;
  examLength?: number;
  featured?: boolean;
  topicIds: TopicId[];
}

export interface WeekGroup {
  id: string;
  title: string;
  blurb: string;
  current?: boolean;
}

export const WEEK_GROUPS: WeekGroup[] = [
  {
    id: 'overview',
    title: 'Full course',
    blurb: 'Every MAT 252 topic in one quiz — Nourish and Strengthen across the term.',
  },
  {
    id: 'week1',
    title: 'Week 1 · Sampling & graphs',
    blurb: 'Data types, experimental design, sampling, and graphical summaries.',
  },
  {
    id: 'week2',
    title: 'Week 2 · Summaries & probability',
    blurb: 'Center, spread, z-scores, classical and compound probability.',
  },
  {
    id: 'week3',
    title: 'Week 3 · Binomial & Midterm 1',
    blurb: 'Discrete random variables and binomial models. Midterm 1 covers Weeks 1–3 (due Sep 21).',
    current: true,
  },
  {
    id: 'week4',
    title: 'Week 4 · Normal, CLT & CI',
    blurb: 'Normal curve, sampling distributions, and confidence intervals for means.',
  },
  {
    id: 'week5',
    title: 'Week 5 · Proportions & tests',
    blurb: 'Confidence intervals for proportions and hypothesis tests for means.',
  },
  {
    id: 'week6',
    title: 'Week 6 · Tests & regression',
    blurb: 'Hypothesis tests for proportions, chi-square, correlation, and regression.',
  },
  {
    id: 'week7',
    title: 'Week 7 · Midterm 2',
    blurb: 'Review and Midterm 2 (Weeks 4–6), available Oct 12–16.',
  },
];

export const ASSESSMENTS: Assessment[] = [
  {
    id: 'overview',
    weekId: 'overview',
    number: 0,
    title: 'Course overview',
    summary: 'All MAT 252 statistics topics with hints and The Scattering boss fight.',
    badge: 'Gathering · The Scattering',
    theme: 'gathering',
    available: true,
    compose: true,
    compact: true,
    nourish: true,
    flashcards: true,
    boss: true,
    exam: true,
    examLength: 20,
    topicIds: ALL_TOPICS.slice(),
  },
  {
    id: 'week1',
    weekId: 'week1',
    number: 1,
    title: 'Week 1 Quiz',
    summary: 'Sampling, data types, experimental design, and graphs — testing portion matches the Canvas week quiz.',
    badge: 'Week 1 · Meetinghouse',
    theme: 'meetinghouse',
    available: true,
    flashcards: true,
    boss: true,
    exam: true,
    examLength: 10,
    topicIds: WEEK1_TOPICS.slice(),
  },
  {
    id: 'lesson_data',
    weekId: 'week1',
    number: 11,
    title: 'Data & sampling',
    summary: 'Types of data, measurement levels, sampling methods, bias, and experiments.',
    badge: 'Ch 1 · Institute',
    theme: 'institute',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['data_types', 'sampling'],
  },
  {
    id: 'lesson_graphs',
    weekId: 'week1',
    number: 12,
    title: 'Graphical summaries',
    summary: 'Frequency tables, histograms, and statistical literacy (bad graphs, confounding).',
    badge: 'Ch 2 · Institute',
    theme: 'institute',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['graphs', 'literacy'],
  },
  {
    id: 'week2',
    weekId: 'week2',
    number: 2,
    title: 'Week 2 Quiz',
    summary: 'Numerical summaries and probability — testing portion matches the Canvas week quiz.',
    badge: 'Week 2 · Casting Lots',
    theme: 'lots',
    available: true,
    flashcards: true,
    boss: true,
    exam: true,
    examLength: 10,
    topicIds: WEEK2_TOPICS.slice(),
  },
  {
    id: 'lesson_desc',
    weekId: 'week2',
    number: 21,
    title: 'Numerical summaries',
    summary: 'Mean, median, mode, spread, five-number summary, and z-scores.',
    badge: 'Ch 3 · Daily Manna',
    theme: 'manna',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['center', 'spread', 'z_scores'],
  },
  {
    id: 'lesson_prob',
    weekId: 'week2',
    number: 22,
    title: 'Probability',
    summary: 'Classical probability, complements, and compound events.',
    badge: 'Ch 4 · Casting Lots',
    theme: 'lots',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['prob_basic', 'prob_compound'],
  },
  {
    id: 'midterm1',
    weekId: 'week3',
    number: 31,
    title: 'Midterm 1',
    summary:
      'Weeks 1–3: data, graphs, summaries, probability, and binomial. No hints. 20 questions in testing-center shape (ALEKS + written). Due Sep 21.',
    badge: 'Exam · The Plates',
    theme: 'plates',
    available: true,
    flashcards: true,
    boss: true,
    exam: true,
    examLength: 20,
    featured: true,
    topicIds: MIDTERM1_TOPICS.slice(),
  },
  {
    id: 'lesson_discrete',
    weekId: 'week3',
    number: 32,
    title: 'Discrete & binomial',
    summary: 'Discrete RVs, expected value, and binomial probability — Excel BINOM.DIST.',
    badge: 'Ch 5 · The Tempest',
    theme: 'bountiful',
    available: true,
    flashcards: false,
    boss: true,
    exam: true,
    examLength: 10,
    topicIds: WEEK3_TOPICS.slice(),
  },
  {
    id: 'week4',
    weekId: 'week4',
    number: 4,
    title: 'Week 4 Quiz',
    summary: 'Normal model, CLT, and confidence intervals for means.',
    badge: 'Week 4 · Urim',
    theme: 'urim',
    available: true,
    flashcards: true,
    boss: true,
    exam: true,
    examLength: 10,
    topicIds: WEEK4_TOPICS.slice(),
  },
  {
    id: 'lesson_dist',
    weekId: 'week4',
    number: 41,
    title: 'Normal & CLT',
    summary: 'Empirical rule, z-scores on the normal curve, and sampling distributions.',
    badge: 'Ch 6 · Daily Manna',
    theme: 'manna',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['normal', 'clt'],
  },
  {
    id: 'lesson_ci',
    weekId: 'week4',
    number: 42,
    title: 'CI for means',
    summary: 'Point estimates and confidence intervals for a population mean.',
    badge: 'Ch 7.1–7.2 · Urim',
    theme: 'urim',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['ci'],
  },
  {
    id: 'week5',
    weekId: 'week5',
    number: 5,
    title: 'Week 5 Quiz',
    summary: 'Confidence intervals for proportions and hypothesis tests for means.',
    badge: 'Week 5 · Alma 32',
    theme: 'alma',
    available: true,
    flashcards: true,
    boss: true,
    exam: true,
    examLength: 10,
    topicIds: WEEK5_TOPICS.slice(),
  },
  {
    id: 'lesson_ht',
    weekId: 'week5',
    number: 51,
    title: 'Hypothesis tests',
    summary: 'One-sample tests for a mean — experiment on the word (Alma 32).',
    badge: 'Ch 8.1–8.3 · Alma 32',
    theme: 'alma',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['ht_one'],
  },
  {
    id: 'week6',
    weekId: 'week6',
    number: 6,
    title: 'Week 6 Quiz',
    summary: 'Tests for proportions, chi-square, correlation, and regression.',
    badge: 'Week 6 · Line upon Line',
    theme: 'line',
    available: true,
    flashcards: true,
    boss: true,
    exam: true,
    examLength: 10,
    topicIds: WEEK6_TOPICS.slice(),
  },
  {
    id: 'lesson_rel',
    weekId: 'week6',
    number: 61,
    title: 'Chi-square & regression',
    summary: 'Independence, correlation, slope, and r² — line upon line.',
    badge: 'Ch 11 · Line upon Line',
    theme: 'line',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['chi_square', 'regression'],
  },
  {
    id: 'midterm2',
    weekId: 'week7',
    number: 7,
    title: 'Midterm 2',
    summary: 'Weeks 4–6: normal, CLT, intervals, tests, and regression. 20-question testing portion.',
    badge: 'Exam · Deseret',
    theme: 'deseret',
    available: true,
    flashcards: true,
    boss: true,
    exam: true,
    examLength: 20,
    featured: true,
    topicIds: MIDTERM2_TOPICS.slice(),
  },
];

export function getAssessment(id: string | null | undefined): Assessment | undefined {
  if (!id) return undefined;
  return ASSESSMENTS.find((a) => a.id === id);
}

export function quizHref(id: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ a: id, ...extra });
  return `/quiz?${params.toString()}`;
}

export function weekAssessmentForTopic(topicId: TopicId): Assessment | undefined {
  // Prefer the main week quiz (id === weekId), not lesson split cards.
  return (
    ASSESSMENTS.find((a) => a.id === a.weekId && a.topicIds.includes(topicId)) ||
    ASSESSMENTS.find((a) => a.exam && !a.compose && a.topicIds.includes(topicId)) ||
    ASSESSMENTS.find((a) => !a.compose && !a.featured && a.topicIds.includes(topicId))
  );
}

export function examLengthOf(assessment: Assessment): number {
  return assessment.examLength ?? Math.max(8, assessment.topicIds.length);
}

/** Unique topics in a week group, in course catalog order. */
export function topicsForWeek(weekId: string): TopicId[] {
  const inWeek = new Set<TopicId>();
  for (const a of ASSESSMENTS) {
    if (a.available && a.weekId === weekId) {
      for (const tid of a.topicIds) inWeek.add(tid);
    }
  }
  return ALL_TOPICS.filter((tid) => inWeek.has(tid));
}

export const FLASHCARDS: { topic: TopicId; front: string; back: string; choices: string[] }[] = [
  {
    topic: 'center',
    front: 'Sample mean',
    back: 'x̄ = Σx / n',
    choices: ['x̄ = Σx / n', 'μ = Σx / N', 'x̄ = (min + max) / 2', 'x̄ = n / Σx'],
  },
  {
    topic: 'center',
    front: 'Median (odd n)',
    back: 'Middle value of the ordered list',
    choices: [
      'Middle value of the ordered list',
      'Most frequent value',
      'Max − min',
      'Average of min and max',
    ],
  },
  {
    topic: 'spread',
    front: 'Sample standard deviation',
    back: 's = √[ Σ(x − x̄)² / (n − 1) ]',
    choices: [
      's = √[ Σ(x − x̄)² / (n − 1) ]',
      's = √[ Σ(x − x̄)² / n ]',
      's = (max − min) / n',
      's = Σ|x − x̄| / n',
    ],
  },
  {
    topic: 'spread',
    front: 'IQR',
    back: 'Q3 − Q1',
    choices: ['Q3 − Q1', 'Q1 − Q3', 'max − min', 'Q2 − Q1'],
  },
  {
    topic: 'z_scores',
    front: 'Z-score',
    back: 'z = (x − μ) / σ',
    choices: ['z = (x − μ) / σ', 'z = (μ − x) / σ', 'z = x / σ', 'z = (x − μ) · σ'],
  },
  {
    topic: 'normal',
    front: 'Empirical rule (68–95–99.7)',
    back: 'About 68% within 1σ, 95% within 2σ, 99.7% within 3σ of a mound-shaped distribution',
    choices: [
      'About 68% within 1σ, 95% within 2σ, 99.7% within 3σ of a mound-shaped distribution',
      '50% within 1σ, 75% within 2σ, 100% within 3σ',
      'Always exactly 68% of any data set lies within 1s of the mean',
      'Only applies to uniform distributions',
    ],
  },
  {
    topic: 'prob_basic',
    front: 'Classical probability',
    back: 'P(A) = (# of equally likely outcomes in A) / (# of equally likely outcomes)',
    choices: [
      'P(A) = (# of equally likely outcomes in A) / (# of equally likely outcomes)',
      'P(A) = 1 − n(A)',
      'P(A) = n(A) · n(S)',
      'P(A) = n(S) − n(A)',
    ],
  },
  {
    topic: 'prob_basic',
    front: 'Complement rule',
    back: 'P(Aᶜ) = 1 − P(A)',
    choices: ['P(Aᶜ) = 1 − P(A)', 'P(Aᶜ) = P(A) − 1', 'P(Aᶜ) = 1 / P(A)', 'P(Aᶜ) = P(A)'],
  },
  {
    topic: 'prob_compound',
    front: 'Independent events (and)',
    back: 'P(A and B) = P(A) · P(B)',
    choices: [
      'P(A and B) = P(A) · P(B)',
      'P(A and B) = P(A) + P(B)',
      'P(A and B) = P(A) + P(B) − P(A and B)',
      'P(A and B) = P(A) / P(B)',
    ],
  },
  {
    topic: 'prob_compound',
    front: 'Addition rule (or)',
    back: 'P(A or B) = P(A) + P(B) − P(A and B)',
    choices: [
      'P(A or B) = P(A) + P(B) − P(A and B)',
      'P(A or B) = P(A) · P(B)',
      'P(A or B) = P(A) + P(B) + P(A and B)',
      'P(A or B) = P(A) − P(B)',
    ],
  },
  {
    topic: 'discrete',
    front: 'Expected value of a discrete RV',
    back: 'E(X) = Σ [x · P(x)]',
    choices: [
      'E(X) = Σ [x · P(x)]',
      'E(X) = Σ P(x)',
      'E(X) = Σ x / n',
      'E(X) = max(x) · P(x)',
    ],
  },
  {
    topic: 'discrete',
    front: 'Binomial mean and variance',
    back: 'E(X) = np,  Var(X) = np(1 − p)',
    choices: [
      'E(X) = np,  Var(X) = np(1 − p)',
      'E(X) = n + p,  Var(X) = n − p',
      'E(X) = pⁿ,  Var(X) = √n',
      'E(X) = n/p,  Var(X) = p(1 − p)',
    ],
  },
  {
    topic: 'discrete',
    front: 'Excel binomial P(X = k)',
    back: 'BINOM.DIST(k, n, p, FALSE)',
    choices: [
      'BINOM.DIST(k, n, p, FALSE)',
      'BINOM.DIST(k, n, p, TRUE)',
      'NORM.DIST(k, n, p, FALSE)',
      'AVERAGE(k, n, p)',
    ],
  },
  {
    topic: 'clt',
    front: 'Standard error of the sample mean',
    back: 'σ / √n   (or s / √n when σ is unknown)',
    choices: [
      'σ / √n   (or s / √n when σ is unknown)',
      'σ · √n',
      'σ / n',
      's · n',
    ],
  },
  {
    topic: 'ci',
    front: 'CI for a mean (σ known / large n)',
    back: 'x̄ ± z* · (σ / √n)',
    choices: [
      'x̄ ± z* · (σ / √n)',
      'x̄ ± z* · σ',
      'μ ± z* · (σ / √n)',
      'x̄ ± z* / n',
    ],
  },
  {
    topic: 'ht_one',
    front: 'Test statistic for H₀: μ = μ₀ (σ known)',
    back: 'z = (x̄ − μ₀) / (σ / √n)',
    choices: [
      'z = (x̄ − μ₀) / (σ / √n)',
      'z = (μ₀ − x̄) · √n',
      'z = x̄ / σ',
      'z = (x̄ − μ₀) · σ',
    ],
  },
  {
    topic: 'regression',
    front: 'Correlation r',
    back: 'Measures the strength and direction of a linear association (−1 to 1)',
    choices: [
      'Measures the strength and direction of a linear association (−1 to 1)',
      'Equals the slope of the regression line',
      'Is always positive',
      'Proves that x causes y',
    ],
  },
  {
    topic: 'regression',
    front: 'Coefficient of determination',
    back: 'r² = fraction of variation in y explained by the linear model',
    choices: [
      'r² = fraction of variation in y explained by the linear model',
      'r² = slope of y on x',
      'r² = residual for the last point',
      'r² = P(Type I error)',
    ],
  },
  {
    topic: 'sampling',
    front: 'Simple random sample',
    back: 'Every sample of size n from the population is equally likely',
    choices: [
      'Every sample of size n from the population is equally likely',
      'The researcher picks convenient units',
      'Every k-th unit after a random start',
      'The population is split into clusters and all clusters are used',
    ],
  },
  {
    topic: 'literacy',
    front: 'Correlation vs causation',
    back: 'A strong r does not by itself prove that x causes y',
    choices: [
      'A strong r does not by itself prove that x causes y',
      'If r is close to 1, x must cause y',
      'If r = 0, x causes y',
      'Causation is the same as confounding',
    ],
  },
];
