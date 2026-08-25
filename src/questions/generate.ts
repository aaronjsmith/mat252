import type { TopicId } from '../data/catalog';
import { FLASHCARDS } from '../data/catalog';

export type Question = {
  id: string;
  topic: TopicId;
  type: 'mc' | 'numeric';
  prompt: string;
  choices?: string[];
  answer: string | number;
  tolerance?: number;
  hint: string;
  setup: string;
  calc: { ti: string; casio: string; excel: string };
  unit?: string;
};

function id(): string {
  return 'q-' + Math.random().toString(36).slice(2, 10);
}

function choice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function num(x: number, places = 4): number {
  const p = 10 ** places;
  return Math.round(Number(x) * p) / p;
}

function ds(data: number[]): string {
  return '{' + data.join(', ') + '}';
}

function mean(data: number[]): number {
  return data.reduce((s, x) => s + x, 0) / data.length;
}

function median(data: number[]): number {
  const s = data.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

function mode(data: number[]): number | null {
  const counts: Record<number, number> = {};
  let m = 0;
  for (const x of data) {
    counts[x] = (counts[x] || 0) + 1;
    if (counts[x]! > m) m = counts[x]!;
  }
  if (m === 1) return null;
  const modes = Object.keys(counts)
    .map(Number)
    .filter((k) => counts[k] === m);
  return modes.length === 1 ? modes[0]! : null;
}

function nCk(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

function calc(ti: string, excel = ''): Question['calc'] {
  return { ti, casio: ti, excel: excel || `=${ti.replace(/÷/g, '/').replace(/×/g, '*')}` };
}

function mc(
  prompt: string,
  choices: string[],
  answer: string,
  topic: TopicId,
  hint: string,
  setup = '',
): Question {
  return {
    id: id(),
    topic,
    type: 'mc',
    prompt,
    choices: shuffle(choices),
    answer,
    hint,
    setup,
    calc: calc(''),
  };
}

function numeric(
  prompt: string,
  answer: number,
  topic: TopicId,
  tolerance: number,
  hint: string,
  setup: string,
  calcHelp: Question['calc'],
  unit = '',
): Question {
  return {
    id: id(),
    topic,
    type: 'numeric',
    prompt,
    answer: num(answer),
    tolerance,
    hint,
    setup,
    calc: calcHelp,
    unit,
  };
}

function dataSet(n = 8): number[] {
  return Array.from({ length: n }, () => randInt(4, 40));
}

function genDataTypes(): Question {
  const items = [
    [
      'Number of institute students in a ward (count)',
      'Quantitative · discrete',
      ['Quantitative · discrete', 'Quantitative · continuous', 'Qualitative · nominal', 'Qualitative · ordinal'],
      'Counts of people are numeric and cannot be fractions of a person in this context — discrete quantitative.',
    ],
    [
      'Time (in minutes) to walk to the temple',
      'Quantitative · continuous',
      ['Quantitative · continuous', 'Quantitative · discrete', 'Qualitative · nominal', 'Qualitative · ordinal'],
      'Time can take any value in an interval — continuous quantitative.',
    ],
    [
      'Home ward (name of congregation)',
      'Qualitative · nominal',
      ['Qualitative · nominal', 'Qualitative · ordinal', 'Quantitative · discrete', 'Quantitative · continuous'],
      'Names of wards are categories with no ranking — nominal.',
    ],
    [
      'Temple recommend status: none / limited / full',
      'Qualitative · ordinal',
      ['Qualitative · ordinal', 'Qualitative · nominal', 'Quantitative · discrete', 'Quantitative · continuous'],
      'The statuses have a natural order — ordinal.',
    ],
  ] as const;
  const [prompt, answer, choices, hint] = choice(items);
  return mc(`Classify this variable: ${prompt}.`, [...choices], answer, 'data_types', hint);
}

function genSampling(): Question {
  const items = [
    [
      'Every 10th name on a stake directory after a random start.',
      'Systematic',
      ['Systematic', 'Simple random', 'Stratified', 'Cluster', 'Convenience'],
      'A random start, then every k-th unit, is systematic sampling.',
    ],
    [
      'Randomly choose 4 wards in a stake, then survey every member of those wards.',
      'Cluster',
      ['Cluster', 'Stratified', 'Simple random', 'Systematic', 'Convenience'],
      'Wards are clusters; all units inside the selected clusters are taken.',
    ],
    [
      'Split a campus into first-year / returning students, then take an SRS from each group.',
      'Stratified',
      ['Stratified', 'Cluster', 'Simple random', 'Systematic', 'Convenience'],
      'Strata are sampled separately so each group is represented.',
    ],
    [
      'Survey the first 30 people who walk into the testing center.',
      'Convenience',
      ['Convenience', 'Simple random', 'Stratified', 'Cluster', 'Systematic'],
      'Whoever is handy is a convenience sample — often biased.',
    ],
    [
      'Every equally likely sample of 40 students from the college roster.',
      'Simple random',
      ['Simple random', 'Stratified', 'Cluster', 'Systematic', 'Convenience'],
      'An SRS gives every sample of size n the same chance.',
    ],
  ] as const;
  const [prompt, answer, choices, hint] = choice(items);
  return mc(`Which sampling method is this? ${prompt}`, [...choices], answer, 'sampling', hint);
}

function genGraphs(): Question {
  const n = randInt(20, 40);
  const freq = [randInt(3, 9), randInt(4, 10), randInt(2, 8), randInt(3, 9)];
  freq[3] = n - freq[0]! - freq[1]! - freq[2]!;
  if (freq[3]! < 1) return genGraphs();
  const ask = choice(['rel', 'which']);
  if (ask === 'rel') {
    const i = randInt(0, 3);
    const ans = num(freq[i]! / n, 4);
    return numeric(
      `A class of ${n} students has frequencies ${freq.join(', ')} in four bins. What is the relative frequency of bin ${i + 1}?`,
      ans,
      'graphs',
      0.01,
      'Relative frequency = class count / n.',
      `${freq[i]} / ${n}`,
      calc(`(${freq[i]}) ÷ ${n} =`, `=${freq[i]}/${n}`),
    );
  }
  return mc(
    'Which display is best for a single quantitative variable’s shape (univariate)?',
    ['Histogram', 'Pie chart of categories', 'Scatterplot', 'Two-way table'],
    'Histogram',
    'graphs',
    'Histograms (or stemplots) show shape, center, and spread of one quantitative variable.',
  );
}

function genCenter(): Question {
  const base = Array.from({ length: 5 }, () => randInt(5, 35));
  const modeVal = choice(base);
  const data = shuffle([...base, modeVal, modeVal, randInt(5, 35)]);
  const ask = choice(['mean', 'median', 'mode', 'range']);
  if (ask === 'mean') {
    const ans = mean(data);
    const terms = data.join(' + ');
    return numeric(
      `Find the mean of ${ds(data)}.`,
      ans,
      'center',
      0.05,
      'Mean = sum of values ÷ how many values.',
      `mean = (${terms}) / ${data.length}`,
      calc(`(${terms}) ÷ ${data.length} =`, `=AVERAGE(${data.join(',')})`),
    );
  }
  if (ask === 'median') {
    const sorted = data.slice().sort((a, b) => a - b);
    return numeric(
      `Find the median of ${ds(data)}.`,
      median(data),
      'center',
      0.01,
      'Order the list; the median is the middle (or average of the two middles).',
      `Sorted: ${ds(sorted)}`,
      calc(''),
    );
  }
  if (ask === 'mode') {
    const m = mode(data);
    if (m === null) return genCenter();
    return numeric(
      `Find the mode of ${ds(data)}.`,
      m,
      'center',
      0,
      'The mode is the value that appears most often.',
      'Count frequencies; pick the most frequent value.',
      calc(''),
    );
  }
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  return numeric(
    `Find the range of ${ds(data)}.`,
    hi - lo,
    'center',
    0,
    'Range = maximum − minimum.',
    `range = ${hi} − ${lo}`,
    calc(`${hi} − ${lo} =`),
  );
}

function genSpread(): Question {
  const data = dataSet(8);
  const ask = choice(['iqr', 'range4', 'outlier']);
  const sorted = data.slice().sort((a, b) => a - b);
  const q1 = median(sorted.slice(0, 4));
  const q3 = median(sorted.slice(4));
  const iqr = q3 - q1;
  if (ask === 'iqr') {
    return numeric(
      `For ${ds(data)}, find the IQR (use the median of the lower half and upper half after sorting; n = 8).`,
      iqr,
      'spread',
      0.05,
      'IQR = Q3 − Q1.',
      `Sorted ${ds(sorted)}. Q1 = ${q1}, Q3 = ${q3}.`,
      calc(`${q3} − ${q1} =`),
    );
  }
  if (ask === 'range4') {
    const approx = (Math.max(...data) - Math.min(...data)) / 4;
    return numeric(
      `Estimate s for ${ds(data)} using the range rule of thumb (range / 4).`,
      approx,
      'spread',
      0.05,
      'A rough estimate is s ≈ (max − min) / 4.',
      `s ≈ (${Math.max(...data)} − ${Math.min(...data)}) / 4`,
      calc(`(${Math.max(...data)} − ${Math.min(...data)}) ÷ 4 =`),
    );
  }
  const fence = q3 + 1.5 * iqr;
  const has = sorted.some((x) => x > fence || x < q1 - 1.5 * iqr);
  return mc(
    `Using 1.5·IQR fences on ${ds(data)} (Q1 = ${q1}, Q3 = ${q3}), are there any outliers?`,
    ['Yes', 'No'],
    has ? 'Yes' : 'No',
    'spread',
    'Outliers lie below Q1 − 1.5·IQR or above Q3 + 1.5·IQR.',
    `Lower fence ${num(q1 - 1.5 * iqr)}; upper fence ${num(fence)}.`,
  );
}

function genZScores(): Question {
  const mu = choice([70, 75, 80, 100, 500]);
  const sigma = choice([5, 8, 10, 15, 20]);
  const x = mu + choice([-2, -1, 1, 1.5, 2, 2.5]) * sigma;
  const z = (x - mu) / sigma;
  const ask = choice(['z', 'x']);
  if (ask === 'z') {
    return numeric(
      `If μ = ${mu} and σ = ${sigma}, what is the z-score for x = ${x}?`,
      z,
      'z_scores',
      0.05,
      'z = (x − μ) / σ. Sign tells you which side of the mean.',
      `z = (${x} − ${mu}) / ${sigma}`,
      calc(`(${x} − ${mu}) ÷ ${sigma} =`),
    );
  }
  const zAsk = choice([-1.5, -1, 0.5, 1, 2]);
  const xv = mu + zAsk * sigma;
  return numeric(
    `μ = ${mu}, σ = ${sigma}. What x has z = ${zAsk}?`,
    xv,
    'z_scores',
    0.05,
    'x = μ + zσ.',
    `x = ${mu} + (${zAsk})(${sigma})`,
    calc(`${mu} + (${zAsk})×${sigma} =`),
  );
}

function genLiteracy(): Question {
  const items = [
    [
      'A study finds r = 0.82 between ice cream sales and drowning deaths. The best conclusion is:',
      'A lurking variable (like heat) may drive both; correlation is not causation.',
      [
        'A lurking variable (like heat) may drive both; correlation is not causation.',
        'Eating ice cream causes drowning.',
        'Banning ice cream would stop drowning.',
        'r = 0.82 proves a causal link.',
      ],
    ],
    [
      'A poll of 12 friends on social media is used to estimate a national opinion. The main problem is:',
      'The sample is not representative (voluntary / convenience bias).',
      [
        'The sample is not representative (voluntary / convenience bias).',
        'n = 12 is always large enough by the CLT.',
        'Friends are a stratified sample of the nation.',
        'Bias is impossible if you compute a mean.',
      ],
    ],
    [
      'A histogram of household income is strongly right-skewed. The mean compared with the median is usually:',
      'Mean > median',
      ['Mean > median', 'Mean < median', 'Mean = median always', 'The mode equals the mean'],
    ],
  ] as const;
  const [prompt, answer, choices] = choice(items);
  return mc(prompt, [...choices], answer, 'literacy', 'Watch for bias, confounding, and shape vs center.');
}

function genProbBasic(): Question {
  const n = choice([6, 8, 10, 12, 52]);
  const k = randInt(1, Math.min(5, n - 1));
  const p = k / n;
  return numeric(
    `A fair process has ${n} equally likely outcomes. Event A has ${k} of them. Find P(A).`,
    p,
    'prob_basic',
    0.01,
    'Classical probability: favorable ÷ total, for equally likely outcomes.',
    `P(A) = ${k}/${n}`,
    calc(`${k} ÷ ${n} =`, `=${k}/${n}`),
  );
}

function genProbCompound(): Question {
  const pA = choice([0.2, 0.3, 0.4, 0.5]);
  const pB = choice([0.2, 0.3, 0.4]);
  const ask = choice(['and', 'or', 'comp']);
  if (ask === 'and') {
    const ans = num(pA * pB);
    return numeric(
      `A and B are independent with P(A) = ${pA} and P(B) = ${pB}. Find P(A and B).`,
      ans,
      'prob_compound',
      0.01,
      'Independence: multiply.',
      `P(A and B) = ${pA} × ${pB}`,
      calc(`${pA} × ${pB} =`, `=${pA}*${pB}`),
    );
  }
  if (ask === 'or') {
    const both = num(pA * pB);
    const ans = num(pA + pB - both);
    return numeric(
      `Independent events: P(A) = ${pA}, P(B) = ${pB}. Find P(A or B).`,
      ans,
      'prob_compound',
      0.01,
      'P(A or B) = P(A) + P(B) − P(A and B).',
      `P(A or B) = ${pA} + ${pB} − ${both}`,
      calc(`${pA} + ${pB} − ${both} =`),
    );
  }
  return numeric(
    `P(A) = ${pA}. Find P(Aᶜ).`,
    num(1 - pA),
    'prob_compound',
    0.01,
    'Complement: 1 − P(A).',
    `1 − ${pA}`,
    calc(`1 − ${pA} =`),
  );
}

function genDiscrete(): Question {
  const n = randInt(4, 7);
  const p = choice([0.2, 0.25, 0.5]);
  const k = randInt(0, 3);
  const pk = nCk(n, k) * p ** k * (1 - p) ** (n - k);
  const ask = choice(['binom', 'expect']);
  if (ask === 'binom') {
    return numeric(
      `X ~ Binomial(n = ${n}, p = ${p}). Find P(X = ${k}). Round to 4 decimals.`,
      num(pk, 4),
      'discrete',
      0.002,
      'P(X = k) = C(n,k) p^k (1−p)^{n−k}.',
      `C(${n},${k}) = ${nCk(n, k)}; then multiply by ${p}^${k} (1−${p})^${n - k}.`,
      calc(`nCr(${n},${k}) × ${p}^${k} × ${(1 - p)}^${n - k} =`, `=BINOM.DIST(${k},${n},${p},FALSE)`),
    );
  }
  const mu = n * p;
  return numeric(
    `X ~ Binomial(n = ${n}, p = ${p}). Find E(X).`,
    mu,
    'discrete',
    0.01,
    'For a binomial, E(X) = np.',
    `E(X) = ${n} × ${p}`,
    calc(`${n} × ${p} =`),
  );
}

function genNormal(): Question {
  const mu = choice([50, 70, 100, 500]);
  const sigma = choice([5, 10, 15, 20]);
  const ask = choice(['emp', 'between']);
  if (ask === 'emp') {
    const lo = mu - 2 * sigma;
    const hi = mu + 2 * sigma;
    return numeric(
      `Mound-shaped with μ = ${mu}, σ = ${sigma}. About what percent of values lie between ${lo} and ${hi}? (Empirical rule)`,
      95,
      'normal',
      0.5,
      'About 95% lie within 2 standard deviations of the mean.',
      `${lo} and ${hi} are μ ± 2σ.`,
      calc(''),
      '%',
    );
  }
  const z = 1;
  const x = mu + z * sigma;
  return mc(
    `μ = ${mu}, σ = ${sigma}. The value x = ${x} is how many standard deviations from the mean?`,
    ['1 above', '1 below', '2 above', '0 (it is the mean)'],
    '1 above',
    'normal',
    'Distance in σ units is the z-score: (x − μ)/σ.',
  );
}

function genClt(): Question {
  const sigma = choice([12, 15, 18, 20, 24]);
  const n = choice([9, 16, 25, 36, 49, 64]);
  const se = sigma / Math.sqrt(n);
  const ask = choice(['se', 'z']);
  if (ask === 'se') {
    return numeric(
      `σ = ${sigma} and n = ${n}. What is the standard error of x̄?`,
      se,
      'clt',
      0.05,
      'SE(x̄) = σ / √n.',
      `${sigma} / √${n}`,
      calc(`${sigma} ÷ √(${n}) =`, `=${sigma}/SQRT(${n})`),
    );
  }
  const mu = choice([80, 100, 120]);
  const xbar = mu + choice([-se, se, 2 * se]);
  const z = (xbar - mu) / se;
  return numeric(
    `μ = ${mu}, σ = ${sigma}, n = ${n}. A sample mean is x̄ = ${num(xbar, 2)}. Find the z-score of x̄.`,
    z,
    'clt',
    0.08,
    'z = (x̄ − μ) / (σ/√n).',
    `SE = ${num(se, 4)}; z = (${num(xbar, 2)} − ${mu}) / SE`,
    calc(`(${num(xbar, 2)} − ${mu}) ÷ (${sigma}÷√${n}) =`),
  );
}

function genCi(): Question {
  const n = choice([25, 36, 49, 64, 100]);
  const s = choice([4, 5, 8, 10, 12]);
  const xbar = choice([50, 72, 80, 100, 210]);
  const z = 1.96;
  const me = z * (s / Math.sqrt(n));
  const ask = choice(['me', 'low']);
  if (ask === 'me') {
    return numeric(
      `A 95% CI uses z* = 1.96. If n = ${n}, s = ${s}, find the margin of error for a mean (use s for σ).`,
      me,
      'ci',
      0.05,
      'ME = z* · (s / √n).',
      `ME = 1.96 × (${s}/√${n})`,
      calc(`1.96 × (${s}÷√${n}) =`, `=1.96*${s}/SQRT(${n})`),
    );
  }
  const low = xbar - me;
  return numeric(
    `x̄ = ${xbar}, n = ${n}, s = ${s}, 95% (z* = 1.96). Find the lower endpoint of the CI for μ.`,
    low,
    'ci',
    0.08,
    'Lower = x̄ − z* · (s/√n).',
    `ME = 1.96×(${s}/√${n}); lower = ${xbar} − ME`,
    calc(`${xbar} − 1.96×(${s}÷√${n}) =`),
  );
}

function genHtOne(): Question {
  const mu0 = choice([50, 100, 12, 75]);
  const n = choice([16, 25, 36, 49]);
  const sigma = choice([4, 5, 8, 10]);
  const xbar = mu0 + choice([-sigma / Math.sqrt(n), sigma / Math.sqrt(n), 2 * (sigma / Math.sqrt(n))]);
  const z = (xbar - mu0) / (sigma / Math.sqrt(n));
  const ask = choice(['z', 'h0']);
  if (ask === 'z') {
    return numeric(
      `Test H₀: μ = ${mu0} vs Hₐ: μ ≠ ${mu0}. n = ${n}, σ = ${sigma}, x̄ = ${num(xbar, 2)}. Compute the z test statistic.`,
      z,
      'ht_one',
      0.08,
      'z = (x̄ − μ₀) / (σ/√n).',
      `z = (${num(xbar, 2)} − ${mu0}) / (${sigma}/√${n})`,
      calc(`(${num(xbar, 2)} − ${mu0}) ÷ (${sigma}÷√${n}) =`),
    );
  }
  return mc(
    'In a test of H₀: μ = 100 vs Hₐ: μ > 100, a tiny p-value means:',
    [
      'The data are unusual if H₀ is true — evidence against H₀',
      'H₀ is definitely true',
      'The sample was biased for sure',
      'μ must equal 100',
    ],
    'The data are unusual if H₀ is true — evidence against H₀',
    'ht_one',
    'A small p-value is evidence against the null, not proof of the alternative in a logical-certainty sense.',
  );
}

function genHtTwo(): Question {
  return mc(
    'Paired data (before/after the same 20 missionaries) should be analyzed with:',
    [
      'A paired (matched) t procedure on the differences',
      'Two independent two-sample z tests on unrelated groups',
      'A chi-square goodness-of-fit with 20 categories',
      'A pie chart of the differences only',
    ],
    'A paired (matched) t procedure on the differences',
    'ht_two',
    'The same units measured twice are dependent — use differences.',
  );
}

function genChi(): Question {
  const ask = choice(['exp', 'idea']);
  if (ask === 'exp') {
    const row = choice([20, 30, 40, 50]);
    const col = choice([0.2, 0.25, 0.5]);
    const n = 100;
    const exp = (row * (col * n)) / n;
    return numeric(
      `In a 2×2 table, a row total is ${row} and a column total is ${col * n} out of n = ${n}. Expected count for that cell?`,
      exp,
      'chi_square',
      0.05,
      'Expected = (row total)(column total) / n.',
      `(${row})(${col * n}) / ${n}`,
      calc(`(${row}×${col * n}) ÷ ${n} =`),
    );
  }
  return mc(
    'A chi-square test of independence is used when:',
    [
      'Two categorical variables are displayed in a two-way table',
      'You have one quantitative variable and want a mean CI',
      'You compare two means with paired numeric data',
      'You need a z-score for a single x',
    ],
    'Two categorical variables are displayed in a two-way table',
    'chi_square',
    'Independence: categorical vs categorical in a contingency table.',
  );
}

function genRegression(): Question {
  const ask = choice(['slope', 'r', 'r2']);
  if (ask === 'slope') {
    const x1 = 2;
    const y1 = randInt(4, 10);
    const x2 = 6;
    const y2 = y1 + choice([4, 8, 12, -4]);
    const m = (y2 - y1) / (x2 - x1);
    return numeric(
      `A line through (${x1}, ${y1}) and (${x2}, ${y2}) has slope m. Find m.`,
      m,
      'regression',
      0.05,
      'm = (y₂ − y₁) / (x₂ − x₁).',
      `m = (${y2} − ${y1}) / (${x2} − ${x1})`,
      calc(`(${y2} − ${y1}) ÷ (${x2} − ${x1}) =`),
    );
  }
  if (ask === 'r') {
    return mc(
      'If r = −0.91 for hours of sleep vs. mistakes on a quiz, this means:',
      [
        'A strong negative linear association',
        'Sleep causes mistakes',
        'Almost no linear association',
        'A strong positive linear association',
      ],
      'A strong negative linear association',
      'regression',
      '|r| near 1 is strong; the sign is the direction. Causation needs more than r.',
    );
  }
  const r = choice([0.4, 0.5, 0.6, 0.8, 0.9]);
  return numeric(
    `If the correlation is r = ${r}, what is r²?`,
    num(r * r),
    'regression',
    0.01,
    'Square r. That is the fraction of variation in y explained by the line.',
    `r² = (${r})²`,
    calc(`${r}² =`),
  );
}

function genFlash(topic: TopicId): Question | null {
  const bank = FLASHCARDS.filter((f) => f.topic === topic);
  if (!bank.length) return null;
  const card = choice(bank);
  return mc(card.front, card.choices, card.back, topic, 'Recall the formula or definition; then check units and conditions.');
}

const GENERATORS: Record<TopicId, () => Question> = {
  data_types: genDataTypes,
  sampling: genSampling,
  graphs: genGraphs,
  center: genCenter,
  spread: genSpread,
  z_scores: genZScores,
  literacy: genLiteracy,
  prob_basic: genProbBasic,
  prob_compound: genProbCompound,
  discrete: genDiscrete,
  normal: genNormal,
  clt: genClt,
  ci: genCi,
  ht_one: genHtOne,
  ht_two: genHtTwo,
  chi_square: genChi,
  regression: genRegression,
};

export function generateQuestion(topic: TopicId, flash = false): Question {
  if (flash) {
    const q = genFlash(topic);
    if (q) return q;
  }
  return GENERATORS[topic]();
}

export function checkAnswer(q: Question, raw: string): boolean {
  const s = raw.trim();
  if (q.type === 'mc') return s === String(q.answer);
  const n = Number(s.replace(/%/g, ''));
  if (!Number.isFinite(n)) return false;
  const tol = q.tolerance ?? 0;
  return Math.abs(n - Number(q.answer)) <= tol + 1e-9;
}
