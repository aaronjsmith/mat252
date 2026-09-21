import type { TopicId } from '../data/catalog';
import { localizedFlashcards } from '../i18n/catalog';
import type { Locale } from '../i18n/locale';
import { barChartSvg, normalCurveSvg, skewHistogramSvg } from './figures';

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
  /** Inline SVG figure (histogram, bar chart, curve). */
  svg?: string;
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
  return [hint, ...glosses].filter(Boolean).join('\n\n');
}

function mc(
  prompt: string,
  choices: string[],
  answer: string,
  topic: TopicId,
  hint: string,
  setup = '',
  values?: number[],
  svg?: string,
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
    svg,
  };
}

type McSpec = readonly [prompt: string, answer: string, choices: readonly string[], hint: string];

function pickMc(items: readonly McSpec[], topic: TopicId): Question {
  const [prompt, answer, choices, hint] = choice(items);
  return mc(prompt, [...choices], answer, topic, hint);
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
  svg?: string,
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
    svg,
  };
}

function dataSet(n = 8): number[] {
  return Array.from({ length: n }, () => randInt(4, 40));
}

function genDataTypes(): Question {
  const kind = choice(['quantCat', 'discCont', 'fourWay'] as const);
  const quantitative = t('Quantitative', 'Cuantitativa');
  const categorical = t('Categorical (qualitative)', 'Categórica (cualitativa)');
  const quantCatChoices = [quantitative, categorical];
  const discrete = t('Discrete', 'Discreta');
  const continuous = t('Continuous', 'Continua');
  const discContChoices = [discrete, continuous];

  if (kind === 'quantCat') {
    const items: McSpec[] = [
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Favorite TV game show.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Programa de concursos favorito.',
        ),
        categorical,
        quantCatChoices,
        t(
          'A favorite show is a label / category, not a number you average — categorical.',
          'Un programa favorito es una etiqueta / categoría, no un número que se promedia — categórica.',
        ),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Price (in dollars) of a shirt on the clearance rack.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Precio (en dólares) de una camisa en el estante de liquidación.',
        ),
        quantitative,
        quantCatChoices,
        t(
          'Price is a numeric measurement — quantitative.',
          'El precio es una medición numérica — cuantitativa.',
        ),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Name of manufacturer of an automobile.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Nombre del fabricante de un automóvil.',
        ),
        categorical,
        quantCatChoices,
        t(
          'Manufacturer names are categories with no numeric meaning — categorical.',
          'Los nombres de fabricantes son categorías sin significado numérico — categórica.',
        ),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Height (in centimeters) of an Olympic athlete.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Estatura (en centímetros) de un atleta olímpico.',
        ),
        quantitative,
        quantCatChoices,
        t('Height is a numeric measurement — quantitative.', 'La estatura es una medición numérica — cuantitativa.'),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): ZIP code of a student’s home.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Código postal del hogar de un estudiante.',
        ),
        categorical,
        quantCatChoices,
        t(
          'ZIP codes look numeric but are labels for places — you would not average them — categorical.',
          'Los códigos postales parecen números pero son etiquetas de lugares — no se promedian — categórica.',
        ),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Number of siblings a student has.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Número de hermanos que tiene un estudiante.',
        ),
        quantitative,
        quantCatChoices,
        t('A count of siblings is numeric — quantitative.', 'Un conteo de hermanos es numérico — cuantitativa.'),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Blood type (A, B, AB, O).',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Tipo de sangre (A, B, AB, O).',
        ),
        categorical,
        quantCatChoices,
        t('Blood type is a named category — categorical.', 'El tipo de sangre es una categoría con nombre — categórica.'),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Annual tuition (in dollars) at a college.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Matrícula anual (en dólares) de un colegio.',
        ),
        quantitative,
        quantCatChoices,
        t('Tuition is a numeric amount — quantitative.', 'La matrícula es una cantidad numérica — cuantitativa.'),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Letter grade in a course (A, B, C, D, F).',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Calificación con letra en un curso (A, B, C, D, F).',
        ),
        categorical,
        quantCatChoices,
        t(
          'Letter grades are ordered categories, not measurements you add — categorical (ordinal).',
          'Las letras son categorías ordenadas, no mediciones que se suman — categórica (ordinal).',
        ),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Time (in minutes) spent studying last night.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Tiempo (en minutos) dedicado a estudiar anoche.',
        ),
        quantitative,
        quantCatChoices,
        t('Study time is a numeric measurement — quantitative.', 'El tiempo de estudio es una medición numérica — cuantitativa.'),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Brand of phone a student uses.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Marca del teléfono que usa un estudiante.',
        ),
        categorical,
        quantCatChoices,
        t('Phone brand is a label — categorical.', 'La marca del teléfono es una etiqueta — categórica.'),
      ],
      [
        t(
          'Indicate whether the variable is quantitative or categorical (qualitative): Temperature (in °F) of a patient.',
          'Indica si la variable es cuantitativa o categórica (cualitativa): Temperatura (en °F) de un paciente.',
        ),
        quantitative,
        quantCatChoices,
        t('Temperature is a numeric measurement — quantitative.', 'La temperatura es una medición numérica — cuantitativa.'),
      ],
    ];
    return pickMc(items, 'data_types');
  }

  if (kind === 'discCont') {
    const items: McSpec[] = [
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The number of occupied tables at a cafe at 8 p.m. next Friday.',
          'Determina si la variable se piensa mejor como discreta o continua: El número de mesas ocupadas en un café a las 8 p.m. el próximo viernes.',
        ),
        discrete,
        discContChoices,
        t(
          'Tables are counted in whole numbers — discrete.',
          'Las mesas se cuentan en números enteros — discreta.',
        ),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The cranial capacity (space inside the skull) of a human skull.',
          'Determina si la variable se piensa mejor como discreta o continua: La capacidad craneal (espacio dentro del cráneo) de un cráneo humano.',
        ),
        continuous,
        discContChoices,
        t(
          'Capacity is a measurement that can take any value in an interval — continuous.',
          'La capacidad es una medición que puede tomar cualquier valor en un intervalo — continua.',
        ),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The height of a fifth-grade student.',
          'Determina si la variable se piensa mejor como discreta o continua: La estatura de un estudiante de quinto grado.',
        ),
        continuous,
        discContChoices,
        t('Height can take any value in a range — continuous.', 'La estatura puede tomar cualquier valor en un rango — continua.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The total number of goals scored by a soccer team in a season.',
          'Determina si la variable se piensa mejor como discreta o continua: El número total de goles de un equipo de fútbol en una temporada.',
        ),
        discrete,
        discContChoices,
        t('Goals are counted in whole numbers — discrete.', 'Los goles se cuentan en números enteros — discreta.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The number of textbooks a student bought this term.',
          'Determina si la variable se piensa mejor como discreta o continua: El número de libros de texto que un estudiante compró este término.',
        ),
        discrete,
        discContChoices,
        t('Books are counted — discrete.', 'Los libros se cuentan — discreta.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The length (in minutes) of a sacrament meeting.',
          'Determina si la variable se piensa mejor como discreta o continua: La duración (en minutos) de una reunión sacramental.',
        ),
        continuous,
        discContChoices,
        t('Time can take any value in an interval — continuous.', 'El tiempo puede tomar cualquier valor en un intervalo — continua.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The number of institute classes a student is enrolled in.',
          'Determina si la variable se piensa mejor como discreta o continua: El número de clases del instituto en las que está inscrito un estudiante.',
        ),
        discrete,
        discContChoices,
        t('Class counts are whole numbers — discrete.', 'Los conteos de clases son números enteros — discreta.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: Weight (in pounds) of a newborn.',
          'Determina si la variable se piensa mejor como discreta o continua: Peso (en libras) de un recién nacido.',
        ),
        continuous,
        discContChoices,
        t('Weight is a measurement on a continuous scale — continuous.', 'El peso es una medición en una escala continua — continua.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The number of emails received in a day.',
          'Determina si la variable se piensa mejor como discreta o continua: El número de correos recibidos en un día.',
        ),
        discrete,
        discContChoices,
        t('Emails are counted — discrete.', 'Los correos se cuentan — discreta.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The amount of rainfall (in inches) in a storm.',
          'Determina si la variable se piensa mejor como discreta o continua: La cantidad de lluvia (en pulgadas) en una tormenta.',
        ),
        continuous,
        discContChoices,
        t('Rainfall is a measurement that can be any value in a range — continuous.', 'La lluvia es una medición que puede ser cualquier valor en un rango — continua.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: The number of cars in a testing-center parking lot.',
          'Determina si la variable se piensa mejor como discreta o continua: El número de autos en el estacionamiento del centro de exámenes.',
        ),
        discrete,
        discContChoices,
        t('Cars are counted in whole numbers — discrete.', 'Los autos se cuentan en números enteros — discreta.'),
      ],
      [
        t(
          'Determine whether the variable is best thought of as discrete or continuous: Distance (in miles) a commuter drives to campus.',
          'Determina si la variable se piensa mejor como discreta o continua: Distancia (en millas) que un estudiante maneja al campus.',
        ),
        continuous,
        discContChoices,
        t('Distance can take any value in an interval — continuous.', 'La distancia puede tomar cualquier valor en un intervalo — continua.'),
      ],
    ];
    return pickMc(items, 'data_types');
  }

  const qd = t('Quantitative · discrete', 'Cuantitativa · discreta');
  const qc = t('Quantitative · continuous', 'Cuantitativa · continua');
  const qn = t('Qualitative · nominal', 'Cualitativa · nominal');
  const qo = t('Qualitative · ordinal', 'Cualitativa · ordinal');
  const four = [qd, qc, qn, qo];
  const items: McSpec[] = [
    [
      t(
        'Classify this variable: Number of institute students in a ward (count).',
        'Clasifica esta variable: Número de estudiantes del instituto en un barrio (conteo).',
      ),
      qd,
      four,
      t(
        'Counts of people are numeric and cannot be fractions of a person in this context — discrete quantitative.',
        'Los conteos de personas son numéricos y no pueden ser fracciones de persona en este contexto — cuantitativa discreta.',
      ),
    ],
    [
      t(
        'Classify this variable: Time (in minutes) to walk to the temple.',
        'Clasifica esta variable: Tiempo (en minutos) para caminar al templo.',
      ),
      qc,
      four,
      t(
        'Time can take any value in an interval — continuous quantitative.',
        'El tiempo puede tomar cualquier valor en un intervalo — cuantitativa continua.',
      ),
    ],
    [
      t(
        'Classify this variable: Home ward (name of congregation).',
        'Clasifica esta variable: Barrio de origen (nombre de la congregación).',
      ),
      qn,
      four,
      t(
        'Names of wards are categories with no ranking — nominal.',
        'Los nombres de barrios son categorías sin orden — nominal.',
      ),
    ],
    [
      t(
        'Classify this variable: Temple recommend status: none / limited / full.',
        'Clasifica esta variable: Estado de la recomendación para el templo: ninguna / limitada / completa.',
      ),
      qo,
      four,
      t('The statuses have a natural order — ordinal.', 'Los estados tienen un orden natural — ordinal.'),
    ],
    [
      t(
        'Classify this variable: Shirt size (S / M / L / XL).',
        'Clasifica esta variable: Talla de camisa (S / M / L / XL).',
      ),
      qo,
      four,
      t('Sizes have a natural order — ordinal.', 'Las tallas tienen un orden natural — ordinal.'),
    ],
    [
      t(
        'Classify this variable: Amount of tithing (in dollars) paid last month.',
        'Clasifica esta variable: Cantidad de diezmo (en dólares) pagada el mes pasado.',
      ),
      qc,
      four,
      t('Money is a measurement that can take any dollar-and-cent value — continuous quantitative.', 'El dinero es una medición que puede tomar cualquier valor en dólares y centavos — cuantitativa continua.'),
    ],
    [
      t(
        'Classify this variable: Number of times a hymn is sung in sacrament meeting.',
        'Clasifica esta variable: Número de veces que se canta un himno en la reunión sacramental.',
      ),
      qd,
      four,
      t('This is a count — discrete quantitative.', 'Esto es un conteo — cuantitativa discreta.'),
    ],
    [
      t(
        'Classify this variable: Country of birth.',
        'Clasifica esta variable: País de nacimiento.',
      ),
      qn,
      four,
      t('Country names are unordered categories — nominal.', 'Los nombres de países son categorías sin orden — nominal.'),
    ],
  ];
  return pickMc(items, 'data_types');
}

function genSampling(): Question {
  const kind = choice(['popParam', 'popParam', 'methodName', 'methodDesc', 'study'] as const);
  const parameter = t('Parameter', 'Parámetro');
  const statistic = t('Statistic', 'Estadístico');
  const paramChoices = [parameter, statistic];

  if (kind === 'popParam') {
    const n = randInt(80, 240);
    const popAvg = num(choice([3.6, 4.2, 4.8, 5.1, 6.4, 7.2]), 1);
    const sampAvg = num(popAvg + choice([-0.7, -0.4, 0.3, 0.5, 0.8]), 1);
    const popMax = randInt(14, 22);
    const sampMax = popMax - randInt(1, 5);
    const popPct = randInt(90, 99);
    const sampPct = Math.max(70, popPct - randInt(1, 8));
    const popMed = randInt(18, 45);
    const sampMed = popMed + choice([-3, -2, 1, 2, 4]);

    const stories = [
      {
        story: t(
          `According to a report, the average length of stay for a hospital's flu-stricken patients is ${popAvg} days, with a maximum stay of ${popMax} days, and a recovery rate of ${popPct}%. An auditor selected a random group of ${n} of the hospital's flu-stricken patients. The average stay of the audited patients was ${sampAvg} days, their maximum stay was ${sampMax} days, and their recovery rate was ${sampPct}%.`,
          `Según un informe, la estancia promedio de los pacientes con gripe de un hospital es ${popAvg} días, con una estancia máxima de ${popMax} días y una tasa de recuperación del ${popPct}%. Un auditor eligió un grupo aleatorio de ${n} de los pacientes con gripe del hospital. La estancia promedio de los auditados fue ${sampAvg} días, su estancia máxima fue ${sampMax} días y su tasa de recuperación fue ${sampPct}%.`,
        ),
        pop: t("All the hospital's flu-stricken patients", 'Todos los pacientes con gripe del hospital'),
        sample: t(
          `The auditor's random group of ${n} of the hospital's flu-stricken patients`,
          `El grupo aleatorio de ${n} pacientes con gripe del hospital que eligió el auditor`,
        ),
        popWrong: t('All hospitals in the state', 'Todos los hospitales del estado'),
        sampWrong: t('The first patients who recovered', 'Los primeros pacientes que se recuperaron'),
        facts: [
          [
            t(
              `The maximum stay of ${sampMax} days among the auditor's random group of ${n} of the hospital's flu-stricken patients`,
              `La estancia máxima de ${sampMax} días en el grupo aleatorio de ${n} pacientes con gripe del auditor`,
            ),
            statistic,
          ],
          [
            t(
              `The average length of stay of ${popAvg} days among all of the hospital's flu-stricken patients`,
              `La estancia promedio de ${popAvg} días entre todos los pacientes con gripe del hospital`,
            ),
            parameter,
          ],
          [
            t(
              `The ${popPct}% recovery rate among all of the hospital's flu-stricken patients`,
              `La tasa de recuperación del ${popPct}% entre todos los pacientes con gripe del hospital`,
            ),
            parameter,
          ],
          [
            t(
              `The average stay of ${sampAvg} days among the auditor's random group of ${n} patients`,
              `La estancia promedio de ${sampAvg} días en el grupo aleatorio de ${n} pacientes del auditor`,
            ),
            statistic,
          ],
          [
            t(
              `The ${sampPct}% recovery rate among the auditor's random group of ${n} patients`,
              `La tasa de recuperación del ${sampPct}% en el grupo aleatorio de ${n} pacientes del auditor`,
            ),
            statistic,
          ],
        ],
      },
      {
        story: t(
          `A college reports that all ${popMed * 40} enrolled students have a mean GPA of ${popAvg} and a median age of ${popMed}. Researchers survey a random sample of ${n} students; the sample mean GPA is ${sampAvg} and the sample median age is ${sampMed}.`,
          `Un colegio informa que los ${popMed * 40} estudiantes inscritos tienen un GPA medio de ${popAvg} y una edad mediana de ${popMed}. Los investigadores encuestan una muestra aleatoria de ${n} estudiantes; el GPA medio muestral es ${sampAvg} y la edad mediana muestral es ${sampMed}.`,
        ),
        pop: t('All enrolled students at the college', 'Todos los estudiantes inscritos del colegio'),
        sample: t(`The random sample of ${n} students`, `La muestra aleatoria de ${n} estudiantes`),
        popWrong: t('All colleges in the country', 'Todos los colegios del país'),
        sampWrong: t('Students who volunteer to post their GPA online', 'Estudiantes que se ofrecen a publicar su GPA en línea'),
        facts: [
          [
            t(
              `The mean GPA of ${popAvg} among all enrolled students at the college`,
              `El GPA medio de ${popAvg} entre todos los estudiantes inscritos del colegio`,
            ),
            parameter,
          ],
          [
            t(
              `The sample mean GPA of ${sampAvg} among the ${n} surveyed students`,
              `El GPA medio muestral de ${sampAvg} entre los ${n} estudiantes encuestados`,
            ),
            statistic,
          ],
          [
            t(
              `The median age of ${popMed} among all enrolled students`,
              `La edad mediana de ${popMed} entre todos los estudiantes inscritos`,
            ),
            parameter,
          ],
          [
            t(
              `The median age of ${sampMed} in the sample of ${n} students`,
              `La edad mediana de ${sampMed} en la muestra de ${n} estudiantes`,
            ),
            statistic,
          ],
        ],
      },
      {
        story: t(
          `A factory's quality report says ${popPct}% of all microscopes in a new batch pass inspection, and the mean defect count per microscope is ${popAvg}. An inspector randomly tests ${n} microscopes from the batch. In that sample, ${sampPct}% pass and the mean defect count is ${sampAvg}.`,
          `El informe de calidad de una fábrica dice que el ${popPct}% de todos los microscopios de un lote nuevo pasan la inspección, y el conteo medio de defectos por microscopio es ${popAvg}. Un inspector prueba al azar ${n} microscopios del lote. En esa muestra, el ${sampPct}% pasa y el conteo medio de defectos es ${sampAvg}.`,
        ),
        pop: t('All microscopes in the new batch', 'Todos los microscopios del lote nuevo'),
        sample: t(
          `The inspector's random sample of ${n} microscopes`,
          `La muestra aleatoria de ${n} microscopios del inspector`,
        ),
        popWrong: t('All products the factory has ever made', 'Todos los productos que la fábrica ha hecho'),
        sampWrong: t('The first shipment that was easy to reach', 'El primer envío que era fácil de alcanzar'),
        facts: [
          [
            t(
              `The ${popPct}% pass rate among all microscopes in the new batch`,
              `La tasa de aprobación del ${popPct}% entre todos los microscopios del lote nuevo`,
            ),
            parameter,
          ],
          [
            t(
              `The ${sampPct}% pass rate among the ${n} tested microscopes`,
              `La tasa de aprobación del ${sampPct}% entre los ${n} microscopios probados`,
            ),
            statistic,
          ],
          [
            t(
              `The mean defect count of ${popAvg} for the whole batch`,
              `El conteo medio de defectos de ${popAvg} para todo el lote`,
            ),
            parameter,
          ],
          [
            t(
              `The mean defect count of ${sampAvg} in the inspector's sample of ${n}`,
              `El conteo medio de defectos de ${sampAvg} en la muestra de ${n} del inspector`,
            ),
            statistic,
          ],
        ],
      },
      {
        story: t(
          `A stake directory lists every member. The average weekly church-meeting attendance among all members is ${popPct}%, and the mean commute is ${popAvg} miles. Missionaries randomly interview ${n} members. In the interviews, attendance is ${sampPct}% and the mean commute is ${sampAvg} miles.`,
          `Un directorio de estaca lista a todos los miembros. La asistencia semanal promedio a las reuniones entre todos los miembros es ${popPct}%, y el traslado medio es ${popAvg} millas. Los misioneros entrevistan al azar a ${n} miembros. En las entrevistas, la asistencia es ${sampPct}% y el traslado medio es ${sampAvg} millas.`,
        ),
        pop: t('All members listed in the stake directory', 'Todos los miembros listados en el directorio de estaca'),
        sample: t(`The ${n} members randomly interviewed`, `Los ${n} miembros entrevistados al azar`),
        popWrong: t('All members of the Church worldwide', 'Todos los miembros de la Iglesia en el mundo'),
        sampWrong: t('Members who walk into the building first', 'Los miembros que entran primero al edificio'),
        facts: [
          [
            t(
              `The ${popPct}% average attendance among all stake members`,
              `La asistencia promedio del ${popPct}% entre todos los miembros de la estaca`,
            ),
            parameter,
          ],
          [
            t(
              `The ${sampPct}% attendance among the ${n} interviewed members`,
              `La asistencia del ${sampPct}% entre los ${n} miembros entrevistados`,
            ),
            statistic,
          ],
          [
            t(
              `The mean commute of ${sampAvg} miles in the interview sample`,
              `El traslado medio de ${sampAvg} millas en la muestra de entrevistas`,
            ),
            statistic,
          ],
          [
            t(
              `The mean commute of ${popAvg} miles among all stake members`,
              `El traslado medio de ${popAvg} millas entre todos los miembros de la estaca`,
            ),
            parameter,
          ],
        ],
      },
    ] as const;

    const sc = choice(stories);
    const ask = choice(['pop', 'sample', 'param'] as const);
    const popChoices = [sc.pop, sc.sample, sc.popWrong, sc.sampWrong];
    if (ask === 'pop') {
      return mc(
        t(
          `${sc.story}\n\nFor this study, identify the population.`,
          `${sc.story}\n\nPara este estudio, identifica la población.`,
        ),
        popChoices,
        sc.pop,
        'sampling',
        t(
          'The population is the entire group we want to describe — not just the people who were measured.',
          'La población es todo el grupo que queremos describir — no solo las personas que se midieron.',
        ),
      );
    }
    if (ask === 'sample') {
      return mc(
        t(
          `${sc.story}\n\nFor this study, identify the sample.`,
          `${sc.story}\n\nPara este estudio, identifica la muestra.`,
        ),
        popChoices,
        sc.sample,
        'sampling',
        t(
          'The sample is the subset of the population that was actually selected and measured.',
          'La muestra es el subconjunto de la población que realmente se eligió y se midió.',
        ),
      );
    }
    const [fact, ans] = choice(sc.facts);
    return mc(
      t(
        `${sc.story}\n\nIs this number a parameter or a statistic?\n${fact}`,
        `${sc.story}\n\n¿Este número es un parámetro o un estadístico?\n${fact}`,
      ),
      paramChoices,
      ans,
      'sampling',
      t(
        'A parameter describes the whole population. A statistic describes the sample that was measured.',
        'Un parámetro describe toda la población. Un estadístico describe la muestra que se midió.',
      ),
    );
  }

  const methodNames = [
    t('Simple random', 'Aleatorio simple'),
    t('Stratified', 'Estratificado'),
    t('Cluster', 'Por conglomerados'),
    t('Systematic', 'Sistemático'),
    t('Convenience', 'Por conveniencia'),
    t('Voluntary response', 'Respuesta voluntaria'),
  ];

  if (kind === 'methodDesc') {
    const step = randInt(4, 10);
    const nTake = randInt(50, 120);
    const groups = randInt(4, 8);
    const perGroup = randInt(8, 16);
    const items: McSpec[] = [
      [
        t(
          `Counselors at a college want to poll students about study time. Which of the following best describes a systematic sample of students?`,
          `Los consejeros de un colegio quieren encuestar a los estudiantes sobre el tiempo de estudio. ¿Cuál describe mejor una muestra sistemática de estudiantes?`,
        ),
        t(
          `The counselors take a list of the students and select every ${step}th student until ${nTake} students are selected.`,
          `Los consejeros toman una lista de estudiantes y eligen cada ${step}.º estudiante hasta seleccionar ${nTake}.`,
        ),
        [
          t(
            `The counselors take a list of the students and select every ${step}th student until ${nTake} students are selected.`,
            `Los consejeros toman una lista de estudiantes y eligen cada ${step}.º estudiante hasta seleccionar ${nTake}.`,
          ),
          t(
            `The counselors form ${groups} groups of students based on the numbers of classes the students are taking. Then they select ${perGroup} students at random from each group.`,
            `Los consejeros forman ${groups} grupos según el número de clases. Luego eligen ${perGroup} estudiantes al azar de cada grupo.`,
          ),
          t(
            `The counselors use a computer program to draw ${nTake} students at random. Every set of ${nTake} students is equally likely.`,
            `Los consejeros usan un programa para extraer ${nTake} estudiantes al azar. Todo conjunto de ${nTake} es igualmente probable.`,
          ),
        ],
        t(
          'Systematic sampling takes every k-th unit from a list (often after a random start).',
          'El muestreo sistemático toma cada k-ésima unidad de una lista (a menudo después de un inicio aleatorio).',
        ),
      ],
      [
        t(
          `The organizers of a conference want to survey attendees about the registration fee. Which of the following best describes a convenience sample of attendees?`,
          `Los organizadores de una conferencia quieren encuestar a los asistentes sobre la cuota de inscripción. ¿Cuál describe mejor una muestra por conveniencia de asistentes?`,
        ),
        t(
          `The organizers select the first ${nTake} attendees who register for the conference because these attendees are easily accessible.`,
          `Los organizadores eligen a los primeros ${nTake} asistentes que se inscriben porque son fáciles de alcanzar.`,
        ),
        [
          t(
            `The organizers select the first ${nTake} attendees who register for the conference because these attendees are easily accessible.`,
            `Los organizadores eligen a los primeros ${nTake} asistentes que se inscriben porque son fáciles de alcanzar.`,
          ),
          t(
            `The organizers take a list of the attendees and select every ${step}th attendee until ${nTake} attendees are selected.`,
            `Los organizadores toman una lista de asistentes y eligen cada ${step}.º hasta seleccionar ${nTake}.`,
          ),
          t(
            `The organizers assign each attendee a number. Using a random number table they draw ${nTake} numbers, then select those attendees. Every set of ${nTake} attendees is equally likely.`,
            `Los organizadores asignan un número a cada asistente. Con una tabla aleatoria extraen ${nTake} números y eligen a esos asistentes. Todo conjunto de ${nTake} es igualmente probable.`,
          ),
        ],
        t(
          'A convenience sample uses whoever is easiest to reach — often biased.',
          'Una muestra por conveniencia usa a quien es más fácil de alcanzar — a menudo sesgada.',
        ),
      ],
      [
        t(
          `A chemist wants to test the quality of a new batch of microscopes. Which of the following best describes a stratified sample of microscopes?`,
          `Un químico quiere probar la calidad de un lote nuevo de microscopios. ¿Cuál describe mejor una muestra estratificada de microscopios?`,
        ),
        t(
          `The chemist forms ${groups} groups of microscopes based on the prices of the microscopes. Then he selects ${perGroup} microscopes at random from each group.`,
          `El químico forma ${groups} grupos de microscopios según el precio. Luego elige ${perGroup} microscopios al azar de cada grupo.`,
        ),
        [
          t(
            `The chemist forms ${groups} groups of microscopes based on the prices of the microscopes. Then he selects ${perGroup} microscopes at random from each group.`,
            `El químico forma ${groups} grupos de microscopios según el precio. Luego elige ${perGroup} microscopios al azar de cada grupo.`,
          ),
          t(
            `The chemist forms groups of ${perGroup} microscopes based on the laboratories they are in. Then he randomly chooses ${groups} groups and selects all of the microscopes in these groups.`,
            `El químico forma grupos de ${perGroup} microscopios según el laboratorio. Luego elige al azar ${groups} grupos y toma todos los microscopios de esos grupos.`,
          ),
          t(
            `The microscopes in the first shipment that was received are easily accessible, so he selects all ${groups * perGroup} of the microscopes in this shipment.`,
            `Los microscopios del primer envío son fáciles de alcanzar, así que selecciona los ${groups * perGroup} microscopios de ese envío.`,
          ),
        ],
        t(
          'Stratified sampling draws a random sample from every subgroup (stratum). Cluster sampling takes whole groups. Convenience takes whatever is handy.',
          'El muestreo estratificado extrae una muestra aleatoria de cada subgrupo (estrato). El de conglomerados toma grupos enteros. El de conveniencia toma lo que esté a la mano.',
        ),
      ],
      [
        t(
          `The student government draws a random sample of 20 freshmen, 20 sophomores, 30 juniors, and 30 seniors to ask about a new grading policy. Identify the kind of sample.`,
          `El gobierno estudiantil extrae una muestra aleatoria de 20 de primer año, 20 de segundo, 30 de tercero y 30 de cuarto para opinar sobre una nueva política de calificaciones. Identifica el tipo de muestra.`,
        ),
        t('Stratified', 'Estratificada'),
        [
          t('Stratified', 'Estratificada'),
          t('Cluster', 'Por conglomerados'),
          t('Simple random', 'Aleatoria simple'),
          t('Systematic', 'Sistemática'),
          t('Convenience', 'Por conveniencia'),
          t('Voluntary response', 'Respuesta voluntaria'),
        ],
        t(
          'Class year is the stratum. A random sample is taken from every class year, so the sample is stratified.',
          'El año de estudio es el estrato. Se toma una muestra aleatoria de cada año, así que la muestra es estratificada.',
        ),
      ],
      [
        t(
          `In a large retail company, a note is placed with each employee's paycheck inviting them to post their opinion about new benefits on a company blog. Identify the kind of sample.`,
          `En una gran empresa, se coloca una nota con cada cheque invitando a los empleados a publicar su opinión sobre nuevos beneficios en un blog de la compañía. Identifica el tipo de muestra.`,
        ),
        t('Voluntary response', 'Respuesta voluntaria'),
        [
          t('Voluntary response', 'Respuesta voluntaria'),
          t('Simple random', 'Aleatoria simple'),
          t('Stratified', 'Estratificada'),
          t('Cluster', 'Por conglomerados'),
          t('Systematic', 'Sistemática'),
          t('Convenience', 'Por conveniencia'),
        ],
        t(
          'People choose themselves to respond — that is a voluntary response sample (often biased toward strong opinions).',
          'Las personas se eligen a sí mismas para responder — eso es una muestra de respuesta voluntaria (a menudo sesgada hacia opiniones fuertes).',
        ),
      ],
      [
        t(
          `Which of the following best describes a cluster sample of wards in a stake?`,
          `¿Cuál describe mejor una muestra por conglomerados de barrios en una estaca?`,
        ),
        t(
          `Randomly choose ${groups} wards, then survey every member of those wards.`,
          `Elegir al azar ${groups} barrios y encuestar a todos los miembros de esos barrios.`,
        ),
        [
          t(
            `Randomly choose ${groups} wards, then survey every member of those wards.`,
            `Elegir al azar ${groups} barrios y encuestar a todos los miembros de esos barrios.`,
          ),
          t(
            `Split members by age group, then take an SRS from every age group.`,
            `Dividir a los miembros por grupo de edad y tomar una MAS de cada grupo.`,
          ),
          t(
            `Select every ${step}th name on the stake directory after a random start.`,
            `Elegir cada ${step}.º nombre del directorio de estaca después de un inicio aleatorio.`,
          ),
        ],
        t(
          'Cluster sampling selects some groups (clusters) and takes all units inside those groups.',
          'El muestreo por conglomerados elige algunos grupos y toma todas las unidades de esos grupos.',
        ),
      ],
      [
        t(
          `Which of the following best describes a simple random sample of ${nTake} students?`,
          `¿Cuál describe mejor una muestra aleatoria simple de ${nTake} estudiantes?`,
        ),
        t(
          `A computer draws ${nTake} students from the roster so that every set of ${nTake} students is equally likely.`,
          `Una computadora extrae ${nTake} estudiantes de la lista de modo que todo conjunto de ${nTake} es igualmente probable.`,
        ),
        [
          t(
            `A computer draws ${nTake} students from the roster so that every set of ${nTake} students is equally likely.`,
            `Una computadora extrae ${nTake} estudiantes de la lista de modo que todo conjunto de ${nTake} es igualmente probable.`,
          ),
          t(
            `Counselors poll the first ${nTake} students who walk into the testing center.`,
            `Los consejeros encuestan a los primeros ${nTake} estudiantes que entran al centro de exámenes.`,
          ),
          t(
            `A note on the portal invites any student who wants to post an opinion.`,
            `Una nota en el portal invita a cualquier estudiante que quiera publicar una opinión.`,
          ),
        ],
        t(
          'In an SRS, every sample of size n from the population has the same chance of being chosen.',
          'En una MAS, toda muestra de tamaño n de la población tiene la misma probabilidad de ser elegida.',
        ),
      ],
    ];
    return pickMc(items, 'sampling');
  }

  if (kind === 'study') {
    const items: McSpec[] = [
      [
        t(
          'Researchers randomly assign institute students to a new study app or the usual notes, then compare quiz scores. What kind of study is this?',
          'Los investigadores asignan al azar a estudiantes del instituto a una nueva app de estudio o a las notas usuales y comparan las calificaciones. ¿Qué tipo de estudio es este?',
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
          'A poll asks students how many hours they sleep and records their GPA. No treatment is assigned. What kind of study is this?',
          'Una encuesta pregunta a estudiantes cuántas horas duermen y anota su GPA. No se asigna ningún tratamiento. ¿Qué tipo de estudio es este?',
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
    ];
    return pickMc(items, 'sampling');
  }

  const kth = randInt(5, 12);
  const nSrs = randInt(30, 80);
  const nWards = randInt(3, 6);
  const items: McSpec[] = [
    [
      t(
        `Which sampling method is this? Every ${kth}th name on a stake directory after a random start.`,
        `¿Qué método de muestreo es este? Cada ${kth}.º nombre en un directorio de estaca después de un inicio aleatorio.`,
      ),
      t('Systematic', 'Sistemático'),
      methodNames,
      t(
        'A random start, then every k-th unit, is systematic sampling.',
        'Un inicio aleatorio y luego cada k-ésima unidad es muestreo sistemático.',
      ),
    ],
    [
      t(
        `Which sampling method is this? Randomly choose ${nWards} wards in a stake, then survey every member of those wards.`,
        `¿Qué método de muestreo es este? Elegir al azar ${nWards} barrios de una estaca y encuestar a todos los miembros de esos barrios.`,
      ),
      t('Cluster', 'Por conglomerados'),
      methodNames,
      t(
        'Wards are clusters; all units inside the selected clusters are taken.',
        'Los barrios son conglomerados; se toman todas las unidades de los conglomerados elegidos.',
      ),
    ],
    [
      t(
        'Which sampling method is this? Split a campus into first-year / returning students, then take an SRS from each group.',
        '¿Qué método de muestreo es este? Dividir un campus en estudiantes de primer año / que regresan y tomar una MAS de cada grupo.',
      ),
      t('Stratified', 'Estratificado'),
      methodNames,
      t(
        'Strata are sampled separately so each group is represented.',
        'Los estratos se muestrean por separado para que cada grupo esté representado.',
      ),
    ],
    [
      t(
        `Which sampling method is this? Survey the first ${nSrs} people who walk into the testing center.`,
        `¿Qué método de muestreo es este? Encuestar a las primeras ${nSrs} personas que entran al centro de exámenes.`,
      ),
      t('Convenience', 'Por conveniencia'),
      methodNames,
      t(
        'Whoever is handy is a convenience sample — often biased.',
        'Quien esté a la mano es una muestra por conveniencia — a menudo sesgada.',
      ),
    ],
    [
      t(
        `Which sampling method is this? Every equally likely sample of ${nSrs} students from the college roster.`,
        `¿Qué método de muestreo es este? Toda muestra igualmente probable de ${nSrs} estudiantes de la lista del colegio.`,
      ),
      t('Simple random', 'Aleatorio simple'),
      methodNames,
      t(
        'An SRS gives every sample of size n the same chance.',
        'Una MAS da a cada muestra de tamaño n la misma probabilidad.',
      ),
    ],
    [
      t(
        'Which sampling method is this? A radio host asks listeners to call in with their opinion on a new policy.',
        '¿Qué método de muestreo es este? Un locutor de radio pide a los oyentes que llamen con su opinión sobre una nueva política.',
      ),
      t('Voluntary response', 'Respuesta voluntaria'),
      methodNames,
      t(
        'Call-in and write-in polls are voluntary response — people choose themselves.',
        'Las encuestas de llamadas y mensajes son de respuesta voluntaria — las personas se eligen a sí mismas.',
      ),
    ],
    [
      t(
        'Identify the kind of sample: random samples of 20 freshmen, 20 sophomores, 30 juniors, and 30 seniors.',
        'Identifica el tipo de muestra: muestras aleatorias de 20 de primer año, 20 de segundo, 30 de tercero y 30 de cuarto.',
      ),
      t('Stratified', 'Estratificado'),
      methodNames,
      t(
        'Each class year is a stratum and every stratum is sampled — stratified.',
        'Cada año de estudio es un estrato y se muestrea cada estrato — estratificado.',
      ),
    ],
    [
      t(
        'Identify the kind of sample: a note with each paycheck invites employees to post opinions on a company blog.',
        'Identifica el tipo de muestra: una nota con cada cheque invita a los empleados a publicar opiniones en un blog de la compañía.',
      ),
      t('Voluntary response', 'Respuesta voluntaria'),
      methodNames,
      t(
        'Employees decide whether to respond — voluntary response.',
        'Los empleados deciden si responden — respuesta voluntaria.',
      ),
    ],
  ];
  return pickMc(items, 'sampling');
}

function genGraphs(): Question {
  const ask = choice(['rel', 'count', 'tallest', 'shape', 'which'] as const);

  if (ask === 'which') {
    const items = [
      [
        t(
          'Which display is best for a single quantitative variable’s shape (univariate)?',
          '¿Qué gráfica es mejor para la forma de una sola variable cuantitativa (univariada)?',
        ),
        t('Histogram', 'Histograma'),
        [
          t('Histogram', 'Histograma'),
          t('Pie chart of categories', 'Gráfica circular de categorías'),
          t('Scatterplot', 'Diagrama de dispersión'),
          t('Two-way table', 'Tabla de doble entrada'),
        ],
        t(
          'Histograms (or stemplots) show shape, center, and spread of one quantitative variable.',
          'Los histogramas (o diagramas de tallo) muestran forma, centro y dispersión de una variable cuantitativa.',
        ),
      ],
      [
        t(
          'You have favorite hymn (categorical) counts for a class. Which display fits best?',
          'Tienes conteos de himno favorito (categórico) de una clase. ¿Qué gráfica encaja mejor?',
        ),
        t('Bar chart (or pie chart)', 'Gráfica de barras (o circular)'),
        [
          t('Bar chart (or pie chart)', 'Gráfica de barras (o circular)'),
          t('Histogram of continuous bins', 'Histograma de intervalos continuos'),
          t('Scatterplot of two numbers', 'Diagrama de dispersión de dos números'),
          t('Boxplot of a quantitative variable', 'Diagrama de caja de una variable cuantitativa'),
        ],
        t(
          'Categorical counts use bar or pie charts; histograms need quantitative bins.',
          'Los conteos categóricos usan barras o circular; los histogramas necesitan intervalos cuantitativos.',
        ),
      ],
      [
        t(
          'You want to compare two quantitative variables for a possible linear relationship. Best display?',
          'Quieres comparar dos variables cuantitativas por una posible relación lineal. ¿Mejor gráfica?',
        ),
        t('Scatterplot', 'Diagrama de dispersión'),
        [
          t('Scatterplot', 'Diagrama de dispersión'),
          t('Pie chart', 'Gráfica circular'),
          t('Single histogram', 'Un solo histograma'),
          t('Frequency table of one variable', 'Tabla de frecuencias de una variable'),
        ],
        t(
          'Scatterplots show association between two quantitative variables.',
          'Los diagramas de dispersión muestran la asociación entre dos variables cuantitativas.',
        ),
      ],
    ] as const;
    const [prompt, answer, choices, hint] = choice(items);
    return mc(prompt, [...choices], answer, 'graphs', hint);
  }

  if (ask === 'shape') {
    const kind = choice(['left', 'right', 'symmetric'] as const);
    const answer =
      kind === 'left'
        ? t('Left-skewed (tail to the left)', 'Sesgado a la izquierda (cola a la izquierda)')
        : kind === 'right'
          ? t('Right-skewed (tail to the right)', 'Sesgado a la derecha (cola a la derecha)')
          : t('Roughly symmetric', 'Aproximadamente simétrico');
    const choices = [
      t('Left-skewed (tail to the left)', 'Sesgado a la izquierda (cola a la izquierda)'),
      t('Right-skewed (tail to the right)', 'Sesgado a la derecha (cola a la derecha)'),
      t('Roughly symmetric', 'Aproximadamente simétrico'),
      t('Uniform with no peak', 'Uniforme sin pico'),
    ];
    return mc(
      t(
        'What shape best describes this histogram?',
        '¿Qué forma describe mejor este histograma?',
      ),
      choices,
      answer,
      'graphs',
      t(
        'Skew direction follows the longer tail. Symmetric distributions look mirrored about the center.',
        'La dirección del sesgo sigue la cola más larga. Las distribuciones simétricas se ven reflejadas en el centro.',
      ),
      t(
        'Compare bar heights from left to right; the long thin side is the skew direction.',
        'Compara las alturas de las barras de izquierda a derecha; el lado largo y delgado es la dirección del sesgo.',
      ),
      undefined,
      skewHistogramSvg(kind, loc),
    );
  }

  const n = randInt(20, 40);
  const freq = [randInt(3, 9), randInt(4, 10), randInt(2, 8), randInt(3, 9)];
  freq[3] = n - freq[0]! - freq[1]! - freq[2]!;
  if (freq[3]! < 1) return genGraphs();

  const labels =
    loc === 'es'
      ? ['Int. 1', 'Int. 2', 'Int. 3', 'Int. 4']
      : ['Bin 1', 'Bin 2', 'Bin 3', 'Bin 4'];
  const chartTitle = t('Class frequencies', 'Frecuencias de clase');
  const yLabel = t('Frequency', 'Frecuencia');

  if (ask === 'tallest') {
    const maxF = Math.max(...freq);
    if (freq.filter((f) => f === maxF).length > 1) return genGraphs();
    const i = freq.indexOf(maxF);
    const chart = barChartSvg({
      values: freq,
      labels,
      title: chartTitle,
      yLabel,
      highlight: i,
      ariaLabel: chartTitle,
    });
    return mc(
      t(
        `The histogram shows scores for a class of ${n} students. Which bin has the highest frequency?`,
        `El histograma muestra puntuaciones de una clase de ${n} estudiantes. ¿Qué intervalo tiene la mayor frecuencia?`,
      ),
      [...labels],
      labels[i]!,
      'graphs',
      t(
        'The tallest bar is the bin with the greatest frequency (count).',
        'La barra más alta es el intervalo con la mayor frecuencia (conteo).',
      ),
      t(`Tallest bar: ${labels[i]} (frequency ${maxF}).`, `Barra más alta: ${labels[i]} (frecuencia ${maxF}).`),
      freq,
      chart,
    );
  }

  const i = randInt(0, 3);
  const chart = barChartSvg({
    values: freq,
    labels,
    title: chartTitle,
    yLabel,
    highlight: i,
    ariaLabel: chartTitle,
  });

  if (ask === 'count') {
    return numeric(
      t(
        `From the histogram, what is the frequency of ${labels[i]}?`,
        `Según el histograma, ¿cuál es la frecuencia de ${labels[i]}?`,
      ),
      freq[i]!,
      'graphs',
      0,
      t(
        'Read the height (count) printed on the bar for that bin.',
        'Lee la altura (conteo) impresa en la barra de ese intervalo.',
      ),
      t(`${labels[i]} has frequency ${freq[i]}.`, `${labels[i]} tiene frecuencia ${freq[i]}.`),
      calc(''),
      '',
      freq,
      chart,
    );
  }

  const ans = num(freq[i]! / n, 4);
  return numeric(
    t(
      `The histogram shows a class of ${n} students. What is the relative frequency of ${labels[i]}?`,
      `El histograma muestra una clase de ${n} estudiantes. ¿Cuál es la frecuencia relativa de ${labels[i]}?`,
    ),
    ans,
    'graphs',
    0.01,
    t('Relative frequency = class count / n.', 'Frecuencia relativa = conteo de la clase / n.'),
    `${freq[i]} / ${n}`,
    calc(`(${freq[i]}) ÷ ${n} =`, `=${freq[i]}/${n}`),
    '',
    freq,
    chart,
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
          'Use the z-score formula. The sign tells you which side of the mean x is on.',
          'Usa la fórmula de la puntuación z. El signo indica de qué lado de la media está x.',
        ),
        'z = (x − μ) / σ',
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
        'Solve for x: start at the mean, then move z standard deviations.',
        'Despeja x: parte de la media y muévete z desviaciones estándar.',
      ),
      'x = μ + zσ',
      glossMuSigma(),
    ),
    `x = ${mu} + (${zAsk})(${sigma})`,
    calc(`${mu} + (${zAsk})×${sigma} =`),
  );
}

function genLiteracy(): Question {
  const kind = choice(['ice', 'poll', 'skew'] as const);
  if (kind === 'skew') {
    return mc(
      t(
        'Household income often looks like this histogram. The mean compared with the median is usually:',
        'El ingreso familiar suele verse como este histograma. La media comparada con la mediana suele ser:',
      ),
      [
        t('Mean > median', 'Media > mediana'),
        t('Mean < median', 'Media < mediana'),
        t('Mean = median always', 'Media = mediana siempre'),
        t('The mode equals the mean', 'La moda es igual a la media'),
      ],
      t('Mean > median', 'Media > mediana'),
      'literacy',
      t(
        'Right-skewed distributions pull the mean toward the long right tail, so mean > median.',
        'Las distribuciones sesgadas a la derecha jalan la media hacia la cola derecha larga, así que media > mediana.',
      ),
      t(
        'The long right tail means a few large values inflate the mean.',
        'La cola derecha larga significa que unos pocos valores grandes inflan la media.',
      ),
      undefined,
      skewHistogramSvg('right', loc),
    );
  }
  if (kind === 'poll') {
    return mc(
      t(
        'A poll of 12 friends on social media is used to estimate a national opinion. The main problem is:',
        'Una encuesta a 12 amigos en redes sociales se usa para estimar una opinión nacional. El problema principal es:',
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
      t(
        'The sample is not representative (voluntary / convenience bias).',
        'La muestra no es representativa (sesgo voluntario / por conveniencia).',
      ),
      'literacy',
      t(
        'Watch for bias, confounding, and shape vs center.',
        'Cuida el sesgo, la confusión y la forma frente al centro.',
      ),
    );
  }
  return mc(
    t(
      'A study finds r = 0.82 between ice cream sales and drowning deaths. The best conclusion is:',
      'Un estudio halla r = 0.82 entre ventas de helado y muertes por ahogamiento. La mejor conclusión es:',
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
    t(
      'A lurking variable (like heat) may drive both; correlation is not causation.',
      'Una variable oculta (como el calor) puede impulsar ambas; correlación no es causalidad.',
    ),
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
  const ask = choice(['binom', 'expect', 'var', 'atleast', 'unusual', 'word'] as const);

  if (ask === 'word') {
    const trials = randInt(5, 10);
    const succP = choice([0.2, 0.25, 0.3, 0.4, 0.5]);
    const x = randInt(0, Math.min(3, trials));
    const px = nCk(trials, x) * succP ** x * (1 - succP) ** (trials - x);
    const stories = [
      t(
        `A quiz has ${trials} independent multiple-choice questions. A student guesses with P(correct) = ${succP} on each. Find P(exactly ${x} correct). Round to 4 decimals.`,
        `Un cuestionario tiene ${trials} preguntas de opción múltiple independientes. Un estudiante adivina con P(correcto) = ${succP} en cada una. Halla P(exactamente ${x} correctas). Redondea a 4 decimales.`,
      ),
      t(
        `A free-throw shooter makes each shot independently with probability ${succP}. She takes ${trials} shots. Find P(exactly ${x} makes). Round to 4 decimals.`,
        `Una tiradora de tiros libres encesta cada tiro independientemente con probabilidad ${succP}. Lanza ${trials} veces. Halla P(exactamente ${x} encestes). Redondea a 4 decimales.`,
      ),
      t(
        `Each of ${trials} independently manufactured parts is defective with probability ${succP}. Find P(exactly ${x} defectives). Round to 4 decimals.`,
        `Cada una de ${trials} piezas fabricadas de forma independiente es defectuosa con probabilidad ${succP}. Halla P(exactamente ${x} defectuosas). Redondea a 4 decimales.`,
      ),
      t(
        `A seed germinates independently with probability ${succP}. If ${trials} seeds are planted, find P(exactly ${x} germinate). Round to 4 decimals.`,
        `Una semilla germina independientemente con probabilidad ${succP}. Si se plantan ${trials} semillas, halla P(exactamente ${x} germinan). Redondea a 4 decimales.`,
      ),
    ];
    return numeric(
      choice(stories),
      num(px, 4),
      'discrete',
      0.002,
      'Binomial: P(X = k) = C(n,k) p^k (1−p)^{n−k}. Excel: BINOM.DIST(k, n, p, FALSE).',
      t(
        `n = ${trials}, k = ${x}, p = ${succP}. C(${trials},${x}) = ${nCk(trials, x)}.`,
        `n = ${trials}, k = ${x}, p = ${succP}. C(${trials},${x}) = ${nCk(trials, x)}.`,
      ),
      calc(
        `nCr(${trials},${x}) × ${succP}^${x} × ${1 - succP}^${trials - x} =`,
        `=BINOM.DIST(${x},${trials},${succP},FALSE)`,
      ),
    );
  }
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
          'Empirical rule: about 95% of values lie within 2 standard deviations of the mean.',
          'Regla empírica: cerca del 95% de los valores queda a 2 desviaciones estándar de la media.',
        ),
        'μ ± 2σ',
        glossMuSigma(),
      ),
      t(`${lo} and ${hi} are μ ± 2σ.`, `${lo} y ${hi} son μ ± 2σ.`),
      calc(''),
      '%',
      undefined,
      normalCurveSvg(mu, sigma, lo, hi, loc),
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
        'Distance in σ units is the z-score.',
        'La distancia en unidades de σ es la puntuación z.',
      ),
      'z = (x − μ) / σ',
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
          'Standard error of the sample mean.',
          'Error estándar de la media muestral.',
        ),
        'SE(x̄) = σ / √n',
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
        'Use the SE of x̄ in the denominator, not σ alone.',
        'Usa el EE de x̄ en el denominador, no σ sola.',
      ),
      'z = (x̄ − μ) / (σ / √n)',
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
          'Margin of error. Here s stands in for σ when σ is unknown.',
          'Margen de error. Aquí s hace de σ cuando σ es desconocida.',
        ),
        'ME = z* · (s / √n)',
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
        'Lower endpoint of the CI. μ is the population mean the interval estimates.',
        'Extremo inferior del IC. μ es la media poblacional que estima el intervalo.',
      ),
      'x̄ − z* · (s / √n)',
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
          'μ₀ is the hypothesized mean under H₀; Hₐ is the alternative.',
          'μ₀ es la media hipotética bajo H₀; Hₐ es la alternativa.',
        ),
        'z = (x̄ − μ₀) / (σ / √n)',
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

const RECENT_KEEP = 64;
const recentFingerprints: string[] = [];

function fingerprint(q: Question): string {
  return `${q.topic}::${q.type}::${q.prompt}::${String(q.answer)}`;
}

function rememberFingerprint(fp: string): void {
  recentFingerprints.unshift(fp);
  if (recentFingerprints.length > RECENT_KEEP) recentFingerprints.length = RECENT_KEEP;
}

function craftOnce(topic: TopicId, flash: boolean): Question {
  if (flash) {
    const q = genFlash(topic);
    if (q) return q;
  }
  return GENERATORS[topic]!();
}

/** Fresh question for a topic; skips recent prompts and the previous item when possible. */
export function generateQuestion(
  topic: TopicId,
  flash = false,
  locale: Locale = 'en',
  previous: Question | null = null,
): Question {
  loc = locale;
  const avoid = previous ? fingerprint(previous) : '';
  for (let attempt = 0; attempt < 16; attempt++) {
    const q = craftOnce(topic, flash);
    const fp = fingerprint(q);
    if (avoid && fp === avoid) continue;
    if (recentFingerprints.includes(fp) && attempt < 15) continue;
    rememberFingerprint(fp);
    return q;
  }
  const q = craftOnce(topic, flash);
  rememberFingerprint(fingerprint(q));
  return q;
}

export function checkAnswer(q: Question, raw: string): boolean {
  const s = raw.trim();
  if (q.type === 'mc') return s === String(q.answer);
  const n = Number(s.replace(/%/g, ''));
  if (!Number.isFinite(n)) return false;
  const tol = q.tolerance ?? 0;
  return Math.abs(n - Number(q.answer)) <= tol + 1e-9;
}
