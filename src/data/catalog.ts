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

export const DESC_TOPICS: TopicId[] = [
  'data_types',
  'sampling',
  'graphs',
  'center',
  'spread',
  'z_scores',
  'literacy',
];
export const PROB_TOPICS: TopicId[] = [
  'prob_basic',
  'prob_compound',
  'discrete',
  'normal',
  'clt',
];
export const INFER_TOPICS: TopicId[] = [
  'ci',
  'ht_one',
  'ht_two',
  'chi_square',
  'regression',
];
export const ALL_TOPICS: TopicId[] = [...DESC_TOPICS, ...PROB_TOPICS, ...INFER_TOPICS];

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
  | 'line';

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
  topicIds: TopicId[];
}

export interface WeekGroup {
  id: string;
  title: string;
  blurb: string;
}

export const WEEK_GROUPS: WeekGroup[] = [
  {
    id: 'overview',
    title: 'Full course',
    blurb: 'Every MAT 252 topic in one quiz — Nourish and Strengthen across the term.',
  },
  {
    id: 'weeks12',
    title: 'Weeks 1–2 · Data & description',
    blurb: 'Data collection, sampling, graphs, center, spread, and z-scores.',
  },
  {
    id: 'weeks34',
    title: 'Weeks 3–4 · Probability & models',
    blurb: 'Probability, discrete random variables, the normal curve, and the CLT.',
  },
  {
    id: 'weeks57',
    title: 'Weeks 5–7 · Inference',
    blurb: 'Confidence intervals, hypothesis tests, chi-square, correlation, and regression.',
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
    topicIds: ALL_TOPICS.slice(),
  },
  {
    id: 'assessment1',
    weekId: 'weeks12',
    number: 1,
    title: 'Assessment 1',
    summary: 'Data, graphs, and descriptive statistics — Weeks 1–2 with the False Weights boss fight.',
    badge: 'Weeks 1–2 · Zarahemla',
    theme: 'zarahemla',
    available: true,
    flashcards: true,
    boss: true,
    topicIds: DESC_TOPICS.slice(),
  },
  {
    id: 'lesson_data',
    weekId: 'weeks12',
    number: 11,
    title: 'Data & sampling',
    summary: 'Types of data, measurement levels, sampling methods, and bias.',
    badge: 'Week 1 · Meetinghouse',
    theme: 'meetinghouse',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['data_types', 'sampling'],
  },
  {
    id: 'lesson_desc',
    weekId: 'weeks12',
    number: 12,
    title: 'Descriptive statistics',
    summary: 'Frequency tables, graphs, center, and spread.',
    badge: 'Week 2 · Institute',
    theme: 'institute',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['graphs', 'center', 'spread'],
  },
  {
    id: 'assessment2',
    weekId: 'weeks34',
    number: 2,
    title: 'Assessment 2',
    summary: 'Probability and distribution models — Weeks 3–4 with The Tempest boss fight.',
    badge: 'Weeks 3–4 · Bountiful',
    theme: 'bountiful',
    available: true,
    flashcards: true,
    boss: true,
    topicIds: PROB_TOPICS.slice(),
  },
  {
    id: 'lesson_prob',
    weekId: 'weeks34',
    number: 3,
    title: 'Probability',
    summary: 'Classical probability, complements, and compound events.',
    badge: 'Week 3 · Casting Lots',
    theme: 'lots',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['prob_basic', 'prob_compound'],
  },
  {
    id: 'lesson_dist',
    weekId: 'weeks34',
    number: 4,
    title: 'Distributions & CLT',
    summary: 'Binomial, normal, z-scores, and sampling distributions.',
    badge: 'Week 4 · Daily Manna',
    theme: 'manna',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['discrete', 'normal', 'clt'],
  },
  {
    id: 'assessment3',
    weekId: 'weeks57',
    number: 3,
    title: 'Assessment 3',
    summary: 'Inference: intervals, tests, chi-square, and regression — Weeks 5–7.',
    badge: 'Weeks 5–7 · Deseret',
    theme: 'deseret',
    available: true,
    flashcards: true,
    boss: true,
    topicIds: INFER_TOPICS.slice(),
  },
  {
    id: 'lesson_ci',
    weekId: 'weeks57',
    number: 5,
    title: 'Confidence intervals',
    summary: 'Point estimates and confidence intervals for means and proportions.',
    badge: 'Week 5 · Urim',
    theme: 'urim',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['ci'],
  },
  {
    id: 'lesson_ht',
    weekId: 'weeks57',
    number: 6,
    title: 'Hypothesis tests',
    summary: 'One- and two-sample tests — experiment on the word (Alma 32).',
    badge: 'Week 6 · Alma 32',
    theme: 'alma',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['ht_one', 'ht_two'],
  },
  {
    id: 'lesson_rel',
    weekId: 'weeks57',
    number: 7,
    title: 'Chi-square & regression',
    summary: 'Independence, correlation, slope, and r² — line upon line.',
    badge: 'Week 7 · Line upon Line',
    theme: 'line',
    available: true,
    flashcards: false,
    boss: true,
    topicIds: ['chi_square', 'regression'],
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
  return ASSESSMENTS.find((a) => !a.compose && a.topicIds.includes(topicId));
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
    front: 'Binomial probability',
    back: 'P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ',
    choices: [
      'P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ',
      'P(X = k) = n p k',
      'P(X = k) = pᵏ / n',
      'P(X = k) = C(n, k) / p',
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
