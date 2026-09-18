import type { TopicId } from '../data/catalog';
import { localizedFlashcards } from '../i18n/catalog';
import type { Locale } from '../i18n/locale';

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
  values?: number[];
};

let loc: Locale = 'en';

function t(en: string, es: string): string {
  return loc === 'es' ? es : en;
}

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

/** Plain-language gloss for Greek / stats symbols used in prompts. */
function glossMuSigma(): string {
  return t(
    'μ (mu) = population mean; σ (sigma) = population standard deviation.',
    'μ (mu) = media poblacional; σ (sigma) = desviación estándar poblacional.',
  );
}

function glossSample(): string {
  return t(
    'x̄ (x-bar) = sample mean; n = sample size; s = sample standard deviation.',
    'x̄ (x-barra) = media muestral; n = tamaño de muestra; s = desviación estándar muestral.',
  );
}

function withGloss(hint: string, ...glosses: string[]): string {
  return [hint, ...glosses].filter(Boolean).join('\n');
}

function mc(
  prompt: string,
  choices: string[],
  answer: string,
  topic: TopicId,
  hint: string,
  setup = '',
  values?: number[],
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
    values,
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
  values?: number[],
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
    values,
  };
}

function dataSet(n = 8): number[] {
  return Array.from({ length: n }, () => randInt(4, 40));
}

function genDataTypes(): Question {
  const items = [
    [
      t(
        'Number of institute students in a ward (count)',
        'Número de estudiantes del instituto en un barrio (conteo)',
      ),
      t('Quantitative · discrete', 'Cuantitativa · discreta'),
      [
        t('Quantitative · discrete', 'Cuantitativa · discreta'),
        t('Quantitative · continuous', 'Cuantitativa · continua'),
        t('Qualitative · nominal', 'Cualitativa · nominal'),
        t('Qualitative · ordinal', 'Cualitativa · ordinal'),
      ],
      t(
        'Counts of people are numeric and cannot be fractions of a person in this context — discrete quantitative.',
        'Los conteos de personas son numéricos y no pueden ser fracciones de persona en este contexto — cuantitativa discreta.',
      ),
    ],
    [
      t('Time (in minutes) to walk to the temple', 'Tiempo (en minutos) para caminar al templo'),
      t('Quantitative · continuous', 'Cuantitativa · continua'),
      [
        t('Quantitative · continuous', 'Cuantitativa · continua'),
        t('Quantitative · discrete', 'Cuantitativa · discreta'),
        t('Qualitative · nominal', 'Cualitativa · nominal'),
        t('Qualitative · ordinal', 'Cualitativa · ordinal'),
      ],
      t(
        'Time can take any value in an interval — continuous quantitative.',
        'El tiempo puede tomar cualquier valor en un intervalo — cuantitativa continua.',
      ),
    ],
    [
      t('Home ward (name of congregation)', 'Barrio de origen (nombre de la congregación)'),
      t('Qualitative · nominal', 'Cualitativa · nominal'),
      [
        t('Qualitative · nominal', 'Cualitativa · nominal'),
        t('Qualitative · ordinal', 'Cualitativa · ordinal'),
        t('Quantitative · discrete', 'Cuantitativa · discreta'),
        t('Quantitative · continuous', 'Cuantitativa · continua'),
      ],
      t(
        'Names of wards are categories with no ranking — nominal.',
        'Los nombres de barrios son categorías sin orden — nominal.',
      ),
    ],
    [
      t(
        'Temple recommend status: none / limited / full',
        'Estado de la recomendación para el templo: ninguna / limitada / completa',
      ),
      t('Qualitative · ordinal', 'Cualitativa · ordinal'),
      [
        t('Qualitative · ordinal', 'Cualitativa · ordinal'),
        t('Qualitative · nominal', 'Cualitativa · nominal'),
        t('Quantitative · discrete', 'Cuantitativa · discreta'),
        t('Quantitative · continuous', 'Cuantitativa · continua'),
      ],
      t('The statuses have a natural order — ordinal.', 'Los estados tienen un orden natural — ordinal.'),
    ],
  ] as const;
  const [prompt, answer, choices, hint] = choice(items);
  return mc(
    t(`Classify this variable: ${prompt}.`, `Clasifica esta variable: ${prompt}.`),
    [...choices],
    answer,
    'data_types',
    hint,
  );
}

function genSampling(): Question {
  const items = [
    [
      t(
        'Every 10th name on a stake directory after a random start.',
        'Cada décimo nombre en un directorio de estaca después de un inicio aleatorio.',
      ),
      t('Systematic', 'Sistemático'),
      [
        t('Systematic', 'Sistemático'),
        t('Simple random', 'Aleatorio simple'),
        t('Stratified', 'Estratificado'),
        t('Cluster', 'Por conglomerados'),
        t('Convenience', 'Por conveniencia'),
      ],
      t(
        'A random start, then every k-th unit, is systematic sampling.',
        'Un inicio aleatorio y luego cada k-ésima unidad es muestreo sistemático.',
      ),
    ],
    [
      t(
        'Randomly choose 4 wards in a stake, then survey every member of those wards.',
        'Elegir al azar 4 barrios de una estaca y encuestar a todos los miembros de esos barrios.',
      ),
      t('Cluster', 'Por conglomerados'),
      [
        t('Cluster', 'Por conglomerados'),
        t('Stratified', 'Estratificado'),
        t('Simple random', 'Aleatorio simple'),
        t('Systematic', 'Sistemático'),
        t('Convenience', 'Por conveniencia'),
      ],
      t(
        'Wards are clusters; all units inside the selected clusters are taken.',
        'Los barrios son conglomerados; se toman todas las unidades de los conglomerados elegidos.',
      ),
    ],
    [
      t(
        'Split a campus into first-year / returning students, then take an SRS from each group.',
        'Dividir un campus en estudiantes de primer año / que regresan y tomar una MAS de cada grupo.',
      ),
      t('Stratified', 'Estratificado'),
      [
        t('Stratified', 'Estratificado'),
        t('Cluster', 'Por conglomerados'),
        t('Simple random', 'Aleatorio simple'),
        t('Systematic', 'Sistemático'),
        t('Convenience', 'Por conveniencia'),
      ],
      t(
        'Strata are sampled separately so each group is represented.',
        'Los estratos se muestrean por separado para que cada grupo esté representado.',
      ),
    ],
    [
      t(
        'Survey the first 30 people who walk into the testing center.',
        'Encuestar a las primeras 30 personas que entran al centro de exámenes.',
      ),
      t('Convenience', 'Por conveniencia'),
      [
        t('Convenience', 'Por conveniencia'),
        t('Simple random', 'Aleatorio simple'),
        t('Stratified', 'Estratificado'),
        t('Cluster', 'Por conglomerados'),
        t('Systematic', 'Sistemático'),
      ],
      t(
        'Whoever is handy is a convenience sample — often biased.',
        'Quien esté a la mano es una muestra por conveniencia — a menudo sesgada.',
      ),
    ],
    [
      t(
        'Every equally likely sample of 40 students from the college roster.',
        'Toda muestra igualmente probable de 40 estudiantes de la lista del colegio.',
      ),
      t('Simple random', 'Aleatorio simple'),
      [
        t('Simple random', 'Aleatorio simple'),
        t('Stratified', 'Estratificado'),
        t('Cluster', 'Por conglomerados'),
        t('Systematic', 'Sistemático'),
        t('Convenience', 'Por conveniencia'),
      ],
      t(
        'An SRS gives every sample of size n the same chance.',
        'Una MAS da a cada muestra de tamaño n la misma probabilidad.',
      ),
    ],
    [
      t(
        'Researchers randomly assign institute students to a new study app or the usual notes, then compare quiz scores.',
        'Los investigadores asignan al azar a estudiantes del instituto a una nueva app de estudio o a las notas usuales y comparan las calificaciones.',
      ),
      t('Statistical experiment', 'Experimento estadístico'),
      [
        t('Statistical experiment', 'Experimento estadístico'),
        t('Observational study', 'Estudio observacional'),
        t('Census of a population', 'Censo de una población'),
        t('Convenience sample only', 'Solo muestra por conveniencia'),
      ],
      t(
        'A treatment is imposed (the app vs usual notes) — that is an experiment.',
        'Se impone un tratamiento (la app vs las notas usuales) — eso es un experimento.',
      ),
    ],
    [
      t(
        'A poll asks students how many hours they sleep and records their GPA. No treatment is assigned.',
        'Una encuesta pregunta a estudiantes cuántas horas duermen y anota su GPA. No se asigna ningún tratamiento.',
      ),
      t('Observational study', 'Estudio observacional'),
      [
        t('Observational study', 'Estudio observacional'),
        t('Statistical experiment', 'Experimento estadístico'),
        t('Simple random sample of treatments', 'Muestra aleatoria simple de tratamientos'),
        t('Matched-pairs experiment', 'Experimento de pares emparejados'),
      ],
      t(
        'Values are recorded as they are — no treatment is imposed.',
        'Se registran los valores tal como son — no se impone un tratamiento.',
      ),
    ],
  ] as const;
  const [prompt, answer, choices, hint] = choice(items);
  return mc(
    t(`Which sampling method is this? ${prompt}`, `¿Qué método de muestreo es este? ${prompt}`),
    [...choices],
    answer,
    'sampling',
    hint,
  );
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
      t(
        `A class of ${n} students has frequencies ${freq.join(', ')} in four bins. What is the relative frequency of bin ${i + 1}?`,
        `Una clase de ${n} estudiantes tiene frecuencias ${freq.join(', ')} en cuatro intervalos. ¿Cuál es la frecuencia relativa del intervalo ${i + 1}?`,
      ),
      ans,
      'graphs',
      0.01,
      t('Relative frequency = class count / n.', 'Frecuencia relativa = conteo de la clase / n.'),
      `${freq[i]} / ${n}`,
      calc(`(${freq[i]}) ÷ ${n} =`, `=${freq[i]}/${n}`),
      '',
      freq,
    );
  }
  return mc(
    t(
      'Which display is best for a single quantitative variable’s shape (univariate)?',
      '¿Qué gráfica es mejor para la forma de una sola variable cuantitativa (univariada)?',
    ),
    [
      t('Histogram', 'Histograma'),
      t('Pie chart of categories', 'Gráfica circular de categorías'),
      t('Scatterplot', 'Diagrama de dispersión'),
      t('Two-way table', 'Tabla de doble entrada'),
    ],
    t('Histogram', 'Histograma'),
    'graphs',
    t(
      'Histograms (or stemplots) show shape, center, and spread of one quantitative variable.',
      'Los histogramas (o diagramas de tallo) muestran forma, centro y dispersión de una variable cuantitativa.',
    ),
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
      t(`Find the mean of ${ds(data)}.`, `Halla la media de ${ds(data)}.`),
      ans,
      'center',
      0.05,
      t('Mean = sum of values ÷ how many values.', 'Media = suma de los valores ÷ cuántos valores hay.'),
      t(`mean = (${terms}) / ${data.length}`, `media = (${terms}) / ${data.length}`),
      calc(`(${terms}) ÷ ${data.length} =`, `=AVERAGE(${data.join(',')})`),
      '',
      data,
    );
  }
  if (ask === 'median') {
    const sorted = data.slice().sort((a, b) => a - b);
    return numeric(
      t(`Find the median of ${ds(data)}.`, `Halla la mediana de ${ds(data)}.`),
      median(data),
      'center',
      0.01,
      t(
        'Order the list; the median is the middle (or average of the two middles).',
        'Ordena la lista; la mediana es el valor central (o el promedio de los dos centrales).',
      ),
      t(`Sorted: ${ds(sorted)}`, `Ordenado: ${ds(sorted)}`),
      calc(''),
      '',
      data,
    );
  }
  if (ask === 'mode') {
    const m = mode(data);
    if (m === null) return genCenter();
    return numeric(
      t(`Find the mode of ${ds(data)}.`, `Halla la moda de ${ds(data)}.`),
      m,
      'center',
      0,
      t('The mode is the value that appears most often.', 'La moda es el valor que aparece con más frecuencia.'),
      t('Count frequencies; pick the most frequent value.', 'Cuenta las frecuencias; elige el valor más frecuente.'),
      calc(''),
      '',
      data,
    );
  }
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  return numeric(
    t(`Find the range of ${ds(data)}.`, `Halla el rango de ${ds(data)}.`),
    hi - lo,
    'center',
    0,
    t('Range = maximum − minimum.', 'Rango = máximo − mínimo.'),
    t(`range = ${hi} − ${lo}`, `rango = ${hi} − ${lo}`),
    calc(`${hi} − ${lo} =`),
    '',
    data,
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
      t(
        `For ${ds(data)}, find the IQR (use the median of the lower half and upper half after sorting; n = 8).`,
        `Para ${ds(data)}, halla el RIC (usa la mediana de la mitad inferior y de la superior después de ordenar; n = 8).`,
      ),
      iqr,
      'spread',
      0.05,
      t('IQR = Q3 − Q1.', 'RIC = Q3 − Q1.'),
      t(`Sorted ${ds(sorted)}. Q1 = ${q1}, Q3 = ${q3}.`, `Ordenado ${ds(sorted)}. Q1 = ${q1}, Q3 = ${q3}.`),
      calc(`${q3} − ${q1} =`),
      '',
      data,
    );
  }
  if (ask === 'range4') {
    const approx = (Math.max(...data) - Math.min(...data)) / 4;
    return numeric(
      t(
        `Estimate s for ${ds(data)} using the range rule of thumb (range / 4).`,
        `Estima s para ${ds(data)} usando la regla del rango (rango / 4).`,
      ),
      approx,
      'spread',
      0.05,
      t('A rough estimate is s ≈ (max − min) / 4.', 'Una estimación aproximada es s ≈ (máx − mín) / 4.'),
      `s ≈ (${Math.max(...data)} − ${Math.min(...data)}) / 4`,
      calc(`(${Math.max(...data)} − ${Math.min(...data)}) ÷ 4 =`),
      '',
      data,
    );
  }
  const fence = q3 + 1.5 * iqr;
  const has = sorted.some((x) => x > fence || x < q1 - 1.5 * iqr);
  return mc(
    t(
      `Using 1.5·IQR fences on ${ds(data)} (Q1 = ${q1}, Q3 = ${q3}), are there any outliers?`,
      `Usando cercas de 1.5·RIC en ${ds(data)} (Q1 = ${q1}, Q3 = ${q3}), ¿hay valores atípicos?`,
    ),
    [t('Yes', 'Sí'), t('No', 'No')],
    has ? t('Yes', 'Sí') : t('No', 'No'),
    'spread',
    t(
      'Outliers lie below Q1 − 1.5·IQR or above Q3 + 1.5·IQR.',
      'Los atípicos quedan por debajo de Q1 − 1.5·RIC o por encima de Q3 + 1.5·RIC.',
    ),
    t(
      `Lower fence ${num(q1 - 1.5 * iqr)}; upper fence ${num(fence)}.`,
      `Cerca inferior ${num(q1 - 1.5 * iqr)}; cerca superior ${num(fence)}.`,
    ),
    data,
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
      t(
        `If μ = ${mu} and σ = ${sigma}, what is the z-score for x = ${x}?`,
        `Si μ = ${mu} y σ = ${sigma}, ¿cuál es la puntuación z de x = ${x}?`,
      ),
      z,
      'z_scores',
      0.05,
      withGloss(
        t(
          'z = (x − μ) / σ. The sign tells you which side of the mean x is on.',
          'z = (x − μ) / σ. El signo indica de qué lado de la media está x.',
        ),
        glossMuSigma(),
      ),
      `z = (${x} − ${mu}) / ${sigma}`,
      calc(`(${x} − ${mu}) ÷ ${sigma} =`),
    );
  }
  const zAsk = choice([-1.5, -1, 0.5, 1, 2]);
  const xv = mu + zAsk * sigma;
  return numeric(
    t(`μ = ${mu}, σ = ${sigma}. What x has z = ${zAsk}?`, `μ = ${mu}, σ = ${sigma}. ¿Qué x tiene z = ${zAsk}?`),
    xv,
    'z_scores',
    0.05,
    withGloss(
      t(
        'Solve for x: x = μ + zσ (start at the mean, then move z standard deviations).',
        'Despeja x: x = μ + zσ (parte de la media y muévete z desviaciones estándar).',
      ),
      glossMuSigma(),
    ),
    `x = ${mu} + (${zAsk})(${sigma})`,
    calc(`${mu} + (${zAsk})×${sigma} =`),
  );
}

function genLiteracy(): Question {
  const items = [
    [
      t(
        'A study finds r = 0.82 between ice cream sales and drowning deaths. The best conclusion is:',
        'Un estudio halla r = 0.82 entre ventas de helado y muertes por ahogamiento. La mejor conclusión es:',
      ),
      t(
        'A lurking variable (like heat) may drive both; correlation is not causation.',
        'Una variable oculta (como el calor) puede impulsar ambas; correlación no es causalidad.',
      ),
      [
        t(
          'A lurking variable (like heat) may drive both; correlation is not causation.',
          'Una variable oculta (como el calor) puede impulsar ambas; correlación no es causalidad.',
        ),
        t('Eating ice cream causes drowning.', 'Comer helado causa ahogamientos.'),
        t('Banning ice cream would stop drowning.', 'Prohibir el helado detendría los ahogamientos.'),
        t('r = 0.82 proves a causal link.', 'r = 0.82 prueba un vínculo causal.'),
      ],
    ],
    [
      t(
        'A poll of 12 friends on social media is used to estimate a national opinion. The main problem is:',
        'Una encuesta a 12 amigos en redes sociales se usa para estimar una opinión nacional. El problema principal es:',
      ),
      t(
        'The sample is not representative (voluntary / convenience bias).',
        'La muestra no es representativa (sesgo voluntario / por conveniencia).',
      ),
      [
        t(
          'The sample is not representative (voluntary / convenience bias).',
          'La muestra no es representativa (sesgo voluntario / por conveniencia).',
        ),
        t('n = 12 is always large enough by the CLT.', 'n = 12 siempre es suficientemente grande por el TLC.'),
        t(
          'Friends are a stratified sample of the nation.',
          'Los amigos son una muestra estratificada de la nación.',
        ),
        t(
          'Bias is impossible if you compute a mean.',
          'El sesgo es imposible si calculas una media.',
        ),
      ],
    ],
    [
      t(
        'A histogram of household income is strongly right-skewed. The mean compared with the median is usually:',
        'Un histograma del ingreso familiar está fuertemente sesgado a la derecha. La media comparada con la mediana suele ser:',
      ),
      t('Mean > median', 'Media > mediana'),
      [
        t('Mean > median', 'Media > mediana'),
        t('Mean < median', 'Media < mediana'),
        t('Mean = median always', 'Media = mediana siempre'),
        t('The mode equals the mean', 'La moda es igual a la media'),
      ],
    ],
  ] as const;
  const [prompt, answer, choices] = choice(items);
  return mc(
    prompt,
    [...choices],
    answer,
    'literacy',
    t(
      'Watch for bias, confounding, and shape vs center.',
      'Cuida el sesgo, la confusión y la forma frente al centro.',
    ),
  );
}

function genProbBasic(): Question {
  const n = choice([6, 8, 10, 12, 52]);
  const k = randInt(1, Math.min(5, n - 1));
  const p = k / n;
  return numeric(
    t(
      `A fair process has ${n} equally likely outcomes. Event A has ${k} of them. Find P(A).`,
      `Un proceso justo tiene ${n} resultados igualmente posibles. El evento A tiene ${k} de ellos. Halla P(A).`,
    ),
    p,
    'prob_basic',
    0.01,
    t(
      'Classical probability: favorable ÷ total, for equally likely outcomes.',
      'Probabilidad clásica: favorables ÷ total, para resultados igualmente posibles.',
    ),
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
      t(
        `A and B are independent with P(A) = ${pA} and P(B) = ${pB}. Find P(A and B).`,
        `A y B son independientes con P(A) = ${pA} y P(B) = ${pB}. Halla P(A y B).`,
      ),
      ans,
      'prob_compound',
      0.01,
      t('Independence: multiply.', 'Independencia: multiplica.'),
      t(`P(A and B) = ${pA} × ${pB}`, `P(A y B) = ${pA} × ${pB}`),
      calc(`${pA} × ${pB} =`, `=${pA}*${pB}`),
    );
  }
  if (ask === 'or') {
    const both = num(pA * pB);
    const ans = num(pA + pB - both);
    return numeric(
      t(
        `Independent events: P(A) = ${pA}, P(B) = ${pB}. Find P(A or B).`,
        `Eventos independientes: P(A) = ${pA}, P(B) = ${pB}. Halla P(A o B).`,
      ),
      ans,
      'prob_compound',
      0.01,
      t(
        'P(A or B) = P(A) + P(B) − P(A and B).',
        'P(A o B) = P(A) + P(B) − P(A y B).',
      ),
      t(`P(A or B) = ${pA} + ${pB} − ${both}`, `P(A o B) = ${pA} + ${pB} − ${both}`),
      calc(`${pA} + ${pB} − ${both} =`),
    );
  }
  return numeric(
    t(`P(A) = ${pA}. Find P(Aᶜ).`, `P(A) = ${pA}. Halla P(Aᶜ).`),
    num(1 - pA),
    'prob_compound',
    0.01,
    t('Complement: 1 − P(A).', 'Complemento: 1 − P(A).'),
    `1 − ${pA}`,
    calc(`1 − ${pA} =`),
  );
}

function genDiscrete(): Question {
  const n = randInt(4, 8);
  const p = choice([0.2, 0.25, 0.4, 0.5]);
  const k = randInt(0, Math.min(3, n));
  const pk = nCk(n, k) * p ** k * (1 - p) ** (n - k);
  const ask = choice(['binom', 'expect', 'var', 'atleast', 'unusual']);
  if (ask === 'binom') {
    return numeric(
      t(
        `X ~ Binomial(n = ${n}, p = ${p}). Find P(X = ${k}). Round to 4 decimals.`,
        `X ~ Binomial(n = ${n}, p = ${p}). Halla P(X = ${k}). Redondea a 4 decimales.`,
      ),
      num(pk, 4),
      'discrete',
      0.002,
      'P(X = k) = C(n,k) p^k (1−p)^{n−k}. Excel: BINOM.DIST(k, n, p, FALSE).',
      t(
        `C(${n},${k}) = ${nCk(n, k)}; then multiply by ${p}^${k} (1−${p})^${n - k}.`,
        `C(${n},${k}) = ${nCk(n, k)}; luego multiplica por ${p}^${k} (1−${p})^${n - k}.`,
      ),
      calc(`nCr(${n},${k}) × ${p}^${k} × ${(1 - p)}^${n - k} =`, `=BINOM.DIST(${k},${n},${p},FALSE)`),
    );
  }
  if (ask === 'expect') {
    const mu = n * p;
    return numeric(
      t(`X ~ Binomial(n = ${n}, p = ${p}). Find E(X).`, `X ~ Binomial(n = ${n}, p = ${p}). Halla E(X).`),
      mu,
      'discrete',
      0.01,
      t('For a binomial, E(X) = np.', 'Para una binomial, E(X) = np.'),
      `E(X) = ${n} × ${p}`,
      calc(`${n} × ${p} =`),
    );
  }
  if (ask === 'var') {
    const v = n * p * (1 - p);
    return numeric(
      t(
        `X ~ Binomial(n = ${n}, p = ${p}). Find Var(X).`,
        `X ~ Binomial(n = ${n}, p = ${p}). Halla Var(X).`,
      ),
      v,
      'discrete',
      0.02,
      t('For a binomial, Var(X) = np(1 − p).', 'Para una binomial, Var(X) = np(1 − p).'),
      `Var(X) = ${n} × ${p} × ${1 - p}`,
      calc(`${n} × ${p} × ${1 - p} =`),
    );
  }
  if (ask === 'atleast') {
    const p0 = (1 - p) ** n;
    const ans = num(1 - p0, 4);
    return numeric(
      t(
        `X ~ Binomial(n = ${n}, p = ${p}). Find P(X ≥ 1). Round to 4 decimals.`,
        `X ~ Binomial(n = ${n}, p = ${p}). Halla P(X ≥ 1). Redondea a 4 decimales.`,
      ),
      ans,
      'discrete',
      0.002,
      t(
        'P(X ≥ 1) = 1 − P(X = 0) = 1 − (1 − p)^n.',
        'P(X ≥ 1) = 1 − P(X = 0) = 1 − (1 − p)^n.',
      ),
      `1 − (${1 - p})^${n}`,
      calc(`1 − ${1 - p}^${n} =`, `=1-BINOM.DIST(0,${n},${p},FALSE)`),
    );
  }
  const pEvent = num(pk, 4);
  const unusual = pEvent < 0.05;
  return mc(
    t(
      `A binomial probability is P(X = ${k}) = ${pEvent} (n = ${n}, p = ${p}). Using the 0.05 guideline, is this outcome unusual?`,
      `Una probabilidad binomial es P(X = ${k}) = ${pEvent} (n = ${n}, p = ${p}). Usando la pauta de 0.05, ¿es inusual este resultado?`,
    ),
    [t('Yes, unusual', 'Sí, inusual'), t('No, not unusual', 'No, no es inusual')],
    unusual ? t('Yes, unusual', 'Sí, inusual') : t('No, not unusual', 'No, no es inusual'),
    'discrete',
    t(
      'A common rule: an event with probability less than 0.05 is unusual.',
      'Una regla común: un evento con probabilidad menor que 0.05 es inusual.',
    ),
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
      t(
        `Mound-shaped with μ = ${mu}, σ = ${sigma}. About what percent of values lie between ${lo} and ${hi}? (Empirical rule)`,
        `Forma acampanada con μ = ${mu}, σ = ${sigma}. ¿Aproximadamente qué porcentaje de valores está entre ${lo} y ${hi}? (Regla empírica)`,
      ),
      95,
      'normal',
      0.5,
      withGloss(
        t(
          'Empirical rule: about 95% of values lie within 2 standard deviations of the mean (μ ± 2σ).',
          'Regla empírica: cerca del 95% de los valores queda a 2 desviaciones estándar de la media (μ ± 2σ).',
        ),
        glossMuSigma(),
      ),
      t(`${lo} and ${hi} are μ ± 2σ.`, `${lo} y ${hi} son μ ± 2σ.`),
      calc(''),
      '%',
    );
  }
  const z = 1;
  const x = mu + z * sigma;
  return mc(
    t(
      `μ = ${mu}, σ = ${sigma}. The value x = ${x} is how many standard deviations from the mean?`,
      `μ = ${mu}, σ = ${sigma}. ¿El valor x = ${x} está a cuántas desviaciones estándar de la media?`,
    ),
    [
      t('1 above', '1 por encima'),
      t('1 below', '1 por debajo'),
      t('2 above', '2 por encima'),
      t('0 (it is the mean)', '0 (es la media)'),
    ],
    t('1 above', '1 por encima'),
    'normal',
    withGloss(
      t(
        'Distance in σ units is the z-score: (x − μ)/σ.',
        'La distancia en unidades de σ es la puntuación z: (x − μ)/σ.',
      ),
      glossMuSigma(),
    ),
  );
}

function genClt(): Question {
  const sigma = choice([12, 15, 18, 20, 24]);
  const n = choice([9, 16, 25, 36, 49, 64]);
  const se = sigma / Math.sqrt(n);
  const ask = choice(['se', 'z']);
  if (ask === 'se') {
    return numeric(
      t(
        `σ = ${sigma} and n = ${n}. What is the standard error of x̄?`,
        `σ = ${sigma} y n = ${n}. ¿Cuál es el error estándar de x̄?`,
      ),
      se,
      'clt',
      0.05,
      withGloss(
        t(
          'Standard error of the sample mean: SE(x̄) = σ / √n.',
          'Error estándar de la media muestral: EE(x̄) = σ / √n.',
        ),
        glossMuSigma(),
        glossSample(),
      ),
      `${sigma} / √${n}`,
      calc(`${sigma} ÷ √(${n}) =`, `=${sigma}/SQRT(${n})`),
    );
  }
  const mu = choice([80, 100, 120]);
  const xbar = mu + choice([-se, se, 2 * se]);
  const z = (xbar - mu) / se;
  return numeric(
    t(
      `μ = ${mu}, σ = ${sigma}, n = ${n}. A sample mean is x̄ = ${num(xbar, 2)}. Find the z-score of x̄.`,
      `μ = ${mu}, σ = ${sigma}, n = ${n}. Una media muestral es x̄ = ${num(xbar, 2)}. Halla la puntuación z de x̄.`,
    ),
    z,
    'clt',
    0.08,
    withGloss(
      t(
        'z = (x̄ − μ) / (σ/√n). Use the SE of x̄ in the denominator, not σ alone.',
        'z = (x̄ − μ) / (σ/√n). Usa el EE de x̄ en el denominador, no σ sola.',
      ),
      glossMuSigma(),
      glossSample(),
    ),
    t(
      `SE = ${num(se, 4)}; z = (${num(xbar, 2)} − ${mu}) / SE`,
      `EE = ${num(se, 4)}; z = (${num(xbar, 2)} − ${mu}) / EE`,
    ),
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
      t(
        `A 95% CI uses z* = 1.96. If n = ${n}, s = ${s}, find the margin of error for a mean (use s for σ).`,
        `Un IC del 95% usa z* = 1.96. Si n = ${n}, s = ${s}, halla el margen de error para una media (usa s por σ).`,
      ),
      me,
      'ci',
      0.05,
      withGloss(
        t(
          'Margin of error: ME = z* · (s / √n). Here s stands in for σ when σ is unknown.',
          'Margen de error: ME = z* · (s / √n). Aquí s hace de σ cuando σ es desconocida.',
        ),
        glossSample(),
        glossMuSigma(),
      ),
      `ME = 1.96 × (${s}/√${n})`,
      calc(`1.96 × (${s}÷√${n}) =`, `=1.96*${s}/SQRT(${n})`),
    );
  }
  const low = xbar - me;
  return numeric(
    t(
      `x̄ = ${xbar}, n = ${n}, s = ${s}, 95% (z* = 1.96). Find the lower endpoint of the CI for μ.`,
      `x̄ = ${xbar}, n = ${n}, s = ${s}, 95% (z* = 1.96). Halla el extremo inferior del IC para μ.`,
    ),
    low,
    'ci',
    0.08,
    withGloss(
      t(
        'Lower endpoint = x̄ − z* · (s/√n). μ is the population mean the interval estimates.',
        'Extremo inferior = x̄ − z* · (s/√n). μ es la media poblacional que estima el intervalo.',
      ),
      glossSample(),
      glossMuSigma(),
    ),
    t(
      `ME = 1.96×(${s}/√${n}); lower = ${xbar} − ME`,
      `ME = 1.96×(${s}/√${n}); inferior = ${xbar} − ME`,
    ),
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
      t(
        `Test H₀: μ = ${mu0} vs Hₐ: μ ≠ ${mu0}. n = ${n}, σ = ${sigma}, x̄ = ${num(xbar, 2)}. Compute the z test statistic.`,
        `Prueba H₀: μ = ${mu0} vs Hₐ: μ ≠ ${mu0}. n = ${n}, σ = ${sigma}, x̄ = ${num(xbar, 2)}. Calcula el estadístico z.`,
      ),
      z,
      'ht_one',
      0.08,
      withGloss(
        t(
          'z = (x̄ − μ₀) / (σ/√n). μ₀ is the hypothesized mean under H₀; Hₐ is the alternative.',
          'z = (x̄ − μ₀) / (σ/√n). μ₀ es la media hipotética bajo H₀; Hₐ es la alternativa.',
        ),
        glossMuSigma(),
        glossSample(),
      ),
      `z = (${num(xbar, 2)} − ${mu0}) / (${sigma}/√${n})`,
      calc(`(${num(xbar, 2)} − ${mu0}) ÷ (${sigma}÷√${n}) =`),
    );
  }
  return mc(
    t(
      'In a test of H₀: μ = 100 vs Hₐ: μ > 100, a tiny p-value means:',
      'En una prueba de H₀: μ = 100 vs Hₐ: μ > 100, un valor p muy pequeño significa:',
    ),
    [
      t(
        'The data are unusual if H₀ is true — evidence against H₀',
        'Los datos son inusuales si H₀ es verdadera — evidencia contra H₀',
      ),
      t('H₀ is definitely true', 'H₀ es definitivamente verdadera'),
      t('The sample was biased for sure', 'La muestra estaba sesgada con certeza'),
      t('μ must equal 100', 'μ debe ser igual a 100'),
    ],
    t(
      'The data are unusual if H₀ is true — evidence against H₀',
      'Los datos son inusuales si H₀ es verdadera — evidencia contra H₀',
    ),
    'ht_one',
    withGloss(
      t(
        'A small p-value is evidence against the null, not proof of the alternative in a logical-certainty sense.',
        'Un valor p pequeño es evidencia contra la nula, no una prueba de certeza lógica de la alternativa.',
      ),
      t(
        'H₀ = null hypothesis; Hₐ = alternative; μ = population mean.',
        'H₀ = hipótesis nula; Hₐ = alternativa; μ = media poblacional.',
      ),
    ),
  );
}

function genHtTwo(): Question {
  return mc(
    t(
      'Paired data (before/after the same 20 missionaries) should be analyzed with:',
      'Datos pareados (antes/después de los mismos 20 misioneros) deben analizarse con:',
    ),
    [
      t(
        'A paired (matched) t procedure on the differences',
        'Un procedimiento t pareado (emparejado) sobre las diferencias',
      ),
      t(
        'Two independent two-sample z tests on unrelated groups',
        'Dos pruebas z independientes de dos muestras en grupos no relacionados',
      ),
      t(
        'A chi-square goodness-of-fit with 20 categories',
        'Una prueba de bondad de ajuste chi-cuadrado con 20 categorías',
      ),
      t(
        'A pie chart of the differences only',
        'Una gráfica circular solo de las diferencias',
      ),
    ],
    t(
      'A paired (matched) t procedure on the differences',
      'Un procedimiento t pareado (emparejado) sobre las diferencias',
    ),
    'ht_two',
    t(
      'The same units measured twice are dependent — use differences.',
      'Las mismas unidades medidas dos veces son dependientes — usa las diferencias.',
    ),
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
      t(
        `In a 2×2 table, a row total is ${row} and a column total is ${col * n} out of n = ${n}. Expected count for that cell?`,
        `En una tabla 2×2, un total de fila es ${row} y un total de columna es ${col * n} de n = ${n}. ¿Conteo esperado de esa celda?`,
      ),
      exp,
      'chi_square',
      0.05,
      t('Expected = (row total)(column total) / n.', 'Esperado = (total de fila)(total de columna) / n.'),
      `(${row})(${col * n}) / ${n}`,
      calc(`(${row}×${col * n}) ÷ ${n} =`),
    );
  }
  return mc(
    t(
      'A chi-square test of independence is used when:',
      'Una prueba de independencia chi-cuadrado se usa cuando:',
    ),
    [
      t(
        'Two categorical variables are displayed in a two-way table',
        'Dos variables categóricas se muestran en una tabla de doble entrada',
      ),
      t(
        'You have one quantitative variable and want a mean CI',
        'Tienes una variable cuantitativa y quieres un IC para la media',
      ),
      t(
        'You compare two means with paired numeric data',
        'Comparas dos medias con datos numéricos pareados',
      ),
      t('You need a z-score for a single x', 'Necesitas una puntuación z para un solo x'),
    ],
    t(
      'Two categorical variables are displayed in a two-way table',
      'Dos variables categóricas se muestran en una tabla de doble entrada',
    ),
    'chi_square',
    t(
      'Independence: categorical vs categorical in a contingency table.',
      'Independencia: categórica vs categórica en una tabla de contingencia.',
    ),
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
      t(
        `A line through (${x1}, ${y1}) and (${x2}, ${y2}) has slope m. Find m.`,
        `Una recta por (${x1}, ${y1}) y (${x2}, ${y2}) tiene pendiente m. Halla m.`,
      ),
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
      t(
        'If r = −0.91 for hours of sleep vs. mistakes on a quiz, this means:',
        'Si r = −0.91 para horas de sueño frente a errores en un cuestionario, esto significa:',
      ),
      [
        t('A strong negative linear association', 'Una asociación lineal negativa fuerte'),
        t('Sleep causes mistakes', 'Dormir causa errores'),
        t('Almost no linear association', 'Casi ninguna asociación lineal'),
        t('A strong positive linear association', 'Una asociación lineal positiva fuerte'),
      ],
      t('A strong negative linear association', 'Una asociación lineal negativa fuerte'),
      'regression',
      t(
        '|r| near 1 is strong; the sign is the direction. Causation needs more than r.',
        '|r| cerca de 1 es fuerte; el signo es la dirección. La causalidad necesita más que r.',
      ),
    );
  }
  const r = choice([0.4, 0.5, 0.6, 0.8, 0.9]);
  return numeric(
    t(`If the correlation is r = ${r}, what is r²?`, `Si la correlación es r = ${r}, ¿cuál es r²?`),
    num(r * r),
    'regression',
    0.01,
    t(
      'Square r. That is the fraction of variation in y explained by the line.',
      'Eleva r al cuadrado. Esa es la fracción de variación de y explicada por la recta.',
    ),
    `r² = (${r})²`,
    calc(`${r}² =`),
  );
}

function genFlash(topic: TopicId): Question | null {
  const bank = localizedFlashcards(loc).filter((f) => f.topic === topic);
  if (!bank.length) return null;
  const card = choice(bank);
  return mc(
    card.front,
    card.choices,
    card.back,
    topic,
    t(
      'Recall the formula or definition; then check units and conditions.',
      'Recuerda la fórmula o definición; luego revisa unidades y condiciones.',
    ),
  );
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

export function generateQuestion(topic: TopicId, flash = false, locale: Locale = 'en'): Question {
  loc = locale;
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
