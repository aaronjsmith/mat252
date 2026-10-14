import type { Locale } from '../i18n/locale';

export interface WrittenProblem {
  title: string;
  topic: string;
  context: string;
  parts: string[];
  partPoints: number[];
  solution: string[];
}

const CONTENT: Record<Locale, WrittenProblem[]> = {
  en: [
    {
      title: 'Plan a proportion study',
      topic: 'Sample size',
      context: 'A college wants to estimate the proportion of students who use tutoring during a semester. A previous survey suggests 64%. Plan for 95% confidence and a margin of error no larger than 0.04.',
      parts: [
        'Identify the population parameter and the planning values p-hat, confidence level, and margin of error.',
        'Find the minimum sample size. Show the formula, substitution, and rounding.',
        'Check the large-count condition with your planned sample size. Explain the 10% condition for sampling without replacement.',
        'If each of two campuses needs this precision independently, how many students should each sample and how many in total?',
      ],
      partPoints: [1, 1, 1, 1],
      solution: [
        'The parameter is p, the true proportion of all students who use tutoring. Use p-hat = 0.64, confidence level 95%, and E = 0.04.',
        'n = z*^2 p-hat(1 - p-hat) / E^2 = 1.96^2(0.64)(0.36) / 0.04^2 = 553.19. Round up to 554.',
        'At n = 554, expected successes = 354.56 and failures = 199.44, both at least 10. The 10% condition requires n <= 0.10N and supports independence when sampling without replacement.',
        'Sample 554 students at each campus, 1,108 total, if each campus needs the stated precision on its own.',
      ],
    },
    {
      title: 'Test a mean battery life',
      topic: 'One-sample t test',
      context: 'A manufacturer advertises an average battery life of 8.5 hours. A retailer suspects the average is lower. A random sample of 36 batteries has mean life 8.32 hours and sample standard deviation 0.48 hours. Use alpha = 0.05.',
      parts: [
        'Define the population parameter and state the null and alternative hypotheses in symbols and in context.',
        'Check the test conditions. Identify any assumptions that cannot be confirmed from the prompt.',
        'Calculate the standard error, test statistic, and degrees of freedom.',
        'Find the left-tail p-value. Make a decision and state the conclusion in context.',
        'Explain what a Type I error would mean here.',
      ],
      partPoints: [2, 2, 3, 4, 2],
      solution: [
        'Let mu be the population mean battery life. H0: mu = 8.5 hours. Ha: mu < 8.5 hours. The alternative says the mean life is below 8.5 hours.',
        'The sample is random. n = 36 supports an approximately normal sampling distribution by the CLT. Independence is reasonable if the sample is less than 10% of all batteries. The population shape is not provided.',
        'SE = s/sqrt(n) = 0.48/6 = 0.08 hour. t = (8.32 - 8.5)/0.08 = -2.25. df = 35.',
        'The left-tail p-value for t = -2.25 with 35 df is about 0.0154. Since 0.0154 < 0.05, reject H0. There is sufficient evidence that mean battery life is below 8.5 hours. Excel: =T.DIST(-2.25,35,TRUE).',
        'A Type I error means concluding the mean battery life is below 8.5 hours when it is actually 8.5 hours.',
      ],
    },
    {
      title: 'Compare individuals and sample means',
      topic: 'Normal and sampling distributions',
      context: 'Daily study time is approximately normal with population mean 5.4 hours and population standard deviation 2.4 hours. Consider a random sample of 36 students.',
      parts: [
        'Find the probability that one student studies more than 8 hours. Show the z-score.',
        'Describe the sampling distribution of the sample mean. Give its mean and standard deviation and justify its shape.',
        'Find P(sample mean < 4.8 hours).',
        'Find P(5.0 < sample mean < 6.0 hours).',
        'Find the probability that the sample mean is within 0.5 hour of the population mean. Explain why this differs from part (a).',
      ],
      partPoints: [2, 2, 2, 2, 3],
      solution: [
        'z = (8 - 5.4)/2.4 = 1.0833. P(X > 8) = 1 - Phi(1.0833) = about 0.1394.',
        'The sample mean is normally distributed because the population is normal. Its mean is 5.4 hours and its standard error is 2.4/sqrt(36) = 0.4 hour.',
        'z = (4.8 - 5.4)/0.4 = -1.5, so P(X-bar < 4.8) = 0.0668.',
        'The z-scores are -1 and 1.5. Probability = Phi(1.5) - Phi(-1) = 0.7745.',
        'Within 0.5 means 4.9 < X-bar < 5.9. The z-scores are -1.25 and 1.25, giving probability about 0.7887. A sample mean varies less (SD 0.4) than an individual value (SD 2.4).',
      ],
    },
    {
      title: 'Estimate a population proportion',
      topic: 'Confidence interval',
      context: 'In a random sample of 500 students, 286 say they would use a campus tutoring center if it offered evening hours. The college has more than 5,000 students. Construct a 95% confidence interval.',
      parts: [
        'Find the sample proportion and check the success-failure and independence conditions.',
        'Find the standard error, critical z-value, and margin of error. Show the formulas.',
        'Write and interpret the confidence interval in context.',
        'A student claims that 64% of all students would use evening tutoring. Is that value consistent with this interval?',
      ],
      partPoints: [2, 2, 4, 4],
      solution: [
        'p-hat = 286/500 = 0.572. There are 286 successes and 214 failures, both at least 10. Since 500 <= 10% of 5,000 and the sample is random, independence is reasonable.',
        'SE = sqrt[(0.572)(0.428)/500] = 0.02213. For 95% confidence, z* = 1.96. ME = 1.96(0.02213) = 0.04337.',
        'The interval is 0.572 +/- 0.04337 = (0.5286, 0.6154). We are 95% confident that about 52.9% to 61.5% of all students would use evening tutoring.',
        'No. 0.64 is above the interval upper bound of 0.6154, so it is not consistent with this 95% interval.',
      ],
    },
    {
      title: 'Analyze temperature and outdoor sales',
      topic: 'Correlation and regression',
      context: 'A student club records temperature x (°C) and lemonade revenue y ($) on eight event days.',
      parts: [
        'Use the data below to describe direction, form, strength, and context. Find the correlation coefficient r.',
        'Find the least-squares regression line. State its slope and intercept.',
        'Interpret the slope. Explain why the intercept is not practically meaningful.',
        'Predict revenue at 22°C. Actual revenue that day was $270. Find and interpret the residual.',
        'Add a ninth day (30°C, $100). Predict the effect on r and explain.',
      ],
      partPoints: [3, 2, 2, 2, 1],
      solution: [
        'Data: (12,140), (15,180), (18,215), (20,250), (22,270), (25,335), (28,375), (30,390). The association is positive, roughly linear, and very strong. r = 0.9965.',
        'The least-squares line is y-hat = 14.5201x - 39.1773. Slope b = 14.5201 and intercept a = -39.1773.',
        'For each 1°C increase, predicted revenue increases by about $14.52 on average over the observed range. The intercept predicts revenue at 0°C, outside the observed 12°C–30°C range, so it is not useful in context.',
        'At 22°C, predicted revenue is $280.27. Residual = observed - predicted = $270 - $280.27 = -$10.27, so revenue was about $10.27 below the line’s prediction.',
        'The point is far below the upward trend and weakens the positive linear association, so r would decrease.',
      ],
    },
  ],
  es: [
    {
      title: 'Planifica un estudio de proporciones',
      topic: 'Tamaño de muestra',
      context: 'Una universidad quiere estimar la proporción de estudiantes que usa tutorías durante un semestre. Una encuesta anterior estima 64%. Planifica con 95% de confianza y un margen de error no mayor que 0.04.',
      parts: [
        'Identifica el parámetro poblacional y los valores de planificación p-hat, nivel de confianza y margen de error.',
        'Calcula el tamaño mínimo de muestra. Muestra la fórmula, sustitución y redondeo.',
        'Verifica la condición de conteos grandes con tu tamaño de muestra. Explica la condición del 10% para muestrear sin reemplazo.',
        'Si cada uno de dos campus necesita esta precisión por separado, ¿cuántos estudiantes debe incluir cada muestra y cuántos en total?',
      ],
      partPoints: [1, 1, 1, 1],
      solution: [
        'El parámetro es p, la proporción verdadera de todos los estudiantes que usa tutorías. Usa p-hat = 0.64, nivel 95% y E = 0.04.',
        'n = z*² p-hat(1 - p-hat) / E² = 1.96²(0.64)(0.36) / 0.04² = 553.19. Redondea hacia arriba: 554.',
        'Con n = 554, éxitos esperados = 354.56 y fracasos = 199.44; ambos son al menos 10. La condición del 10% requiere n <= 0.10N y apoya la independencia al muestrear sin reemplazo.',
        'Muestrea 554 estudiantes en cada campus, 1,108 en total, si cada campus necesita la precisión indicada.',
      ],
    },
    {
      title: 'Prueba la vida media de una batería',
      topic: 'Prueba t de una muestra',
      context: 'Un fabricante anuncia una vida media de 8.5 horas. Un vendedor sospecha que el promedio es menor. Una muestra aleatoria de 36 baterías tiene media de 8.32 horas y desviación estándar de 0.48 horas. Usa alfa = 0.05.',
      parts: [
        'Define el parámetro poblacional y formula H0 y Ha con símbolos y en contexto.',
        'Verifica las condiciones de la prueba. Indica qué supuestos no se confirman con los datos.',
        'Calcula el error estándar, estadístico de prueba y grados de libertad.',
        'Encuentra el valor p de cola izquierda. Decide y concluye en contexto.',
        'Explica qué significaría un error tipo I en este caso.',
      ],
      partPoints: [2, 2, 3, 4, 2],
      solution: [
        'Sea mu la vida media poblacional. H0: mu = 8.5 horas. Ha: mu < 8.5 horas. La alternativa afirma que la vida media es menor que 8.5 horas.',
        'La muestra es aleatoria. n = 36 permite aproximar la distribución de la media con la TCL. La independencia es razonable si la muestra es menos del 10% de todas las baterías. No se indica la forma poblacional.',
        'SE = s/raíz(n) = 0.48/6 = 0.08 hora. t = (8.32 - 8.5)/0.08 = -2.25. gl = 35.',
        'El valor p de cola izquierda para t = -2.25 y 35 gl es aproximadamente 0.0154. Como 0.0154 < 0.05, rechazamos H0. Hay evidencia suficiente de que la vida media es menor de 8.5 horas. Excel: =T.DIST(-2.25,35,TRUE).',
        'Un error tipo I sería concluir que la vida media es menor que 8.5 horas cuando en realidad es 8.5 horas.',
      ],
    },
    {
      title: 'Compara individuos y medias muestrales',
      topic: 'Distribuciones normal y muestral',
      context: 'El tiempo diario de estudio tiene distribución aproximadamente normal, media poblacional de 5.4 horas y desviación estándar de 2.4 horas. Considera una muestra aleatoria de 36 estudiantes.',
      parts: [
        'Encuentra la probabilidad de que un estudiante estudie más de 8 horas. Muestra la puntuación z.',
        'Describe la distribución muestral de la media. Da su media y desviación estándar y justifica la forma.',
        'Calcula P(media muestral < 4.8 horas).',
        'Calcula P(5.0 < media muestral < 6.0 horas).',
        'Encuentra la probabilidad de que la media muestral esté a menos de 0.5 hora de la media poblacional. Explica la diferencia con la parte (a).',
      ],
      partPoints: [2, 2, 2, 2, 3],
      solution: [
        'z = (8 - 5.4)/2.4 = 1.0833. P(X > 8) = 1 - Phi(1.0833) = aproximadamente 0.1394.',
        'La media muestral tiene distribución normal porque la población es normal. Su media es 5.4 horas y su error estándar es 2.4/raíz(36) = 0.4 hora.',
        'z = (4.8 - 5.4)/0.4 = -1.5, entonces P(X-barra < 4.8) = 0.0668.',
        'Las puntuaciones z son -1 y 1.5. La probabilidad es Phi(1.5) - Phi(-1) = 0.7745.',
        'Estar a menos de 0.5 significa 4.9 < X-barra < 5.9. Las puntuaciones z son -1.25 y 1.25; la probabilidad es aproximadamente 0.7887. La media muestral varía menos (DE 0.4) que un valor individual (DE 2.4).',
      ],
    },
    {
      title: 'Estima una proporción poblacional',
      topic: 'Intervalo de confianza',
      context: 'En una muestra aleatoria de 500 estudiantes, 286 dicen que usarían un centro de tutorías si ofreciera horario nocturno. La universidad tiene más de 5,000 estudiantes. Construye un intervalo de confianza del 95%.',
      parts: [
        'Calcula la proporción muestral y verifica las condiciones de éxitos-fracasos e independencia.',
        'Calcula el error estándar, valor crítico z y margen de error. Muestra las fórmulas.',
        'Escribe e interpreta el intervalo en contexto.',
        'Un estudiante afirma que el 64% usaría las tutorías nocturnas. ¿Es compatible con este intervalo?',
      ],
      partPoints: [2, 2, 4, 4],
      solution: [
        'p-hat = 286/500 = 0.572. Hay 286 éxitos y 214 fracasos, ambos al menos 10. Como 500 <= 10% de 5,000 y la muestra es aleatoria, la independencia es razonable.',
        'EE = raíz[(0.572)(0.428)/500] = 0.02213. Para 95% de confianza, z* = 1.96. ME = 1.96(0.02213) = 0.04337.',
        'El intervalo es 0.572 +/- 0.04337 = (0.5286, 0.6154). Tenemos 95% de confianza en que entre 52.9% y 61.5% de los estudiantes usaría tutorías nocturnas.',
        'No. 0.64 supera el límite superior de 0.6154, así que no es compatible con este intervalo del 95%.',
      ],
    },
    {
      title: 'Analiza temperatura y ventas al aire libre',
      topic: 'Correlación y regresión',
      context: 'Un club estudiantil registra la temperatura x (°C) y los ingresos y ($) por limonada durante ocho eventos.',
      parts: [
        'Usa los datos para describir dirección, forma, fuerza y contexto. Calcula el coeficiente de correlación r.',
        'Encuentra la recta de regresión por mínimos cuadrados. Indica pendiente e intercepto.',
        'Interpreta la pendiente. Explica por qué el intercepto no tiene significado práctico.',
        'Predice los ingresos a 22°C. Ese día los ingresos reales fueron $270. Calcula e interpreta el residuo.',
        'Añade un noveno día (30°C, $100). Predice el efecto sobre r y explica.',
      ],
      partPoints: [3, 2, 2, 2, 1],
      solution: [
        'Datos: (12,140), (15,180), (18,215), (20,250), (22,270), (25,335), (28,375), (30,390). La asociación es positiva, aproximadamente lineal y muy fuerte. r = 0.9965.',
        'La recta es y-hat = 14.5201x - 39.1773. Pendiente b = 14.5201 e intercepto a = -39.1773.',
        'Por cada aumento de 1°C, los ingresos predichos aumentan unos $14.52 en promedio dentro del rango observado. El intercepto predice ingresos a 0°C, fuera del rango observado de 12°C a 30°C, por lo que no sirve en este contexto.',
        'A 22°C, los ingresos predichos son $280.27. Residuo = observado - predicho = $270 - $280.27 = -$10.27; los ingresos fueron unos $10.27 menores que la predicción.',
        'El punto está muy por debajo de la tendencia ascendente y debilita la asociación lineal positiva, así que r disminuiría.',
      ],
    },
  ],
};

export function finalPracticeContent(locale: Locale): WrittenProblem[] {
  const questions = CONTENT[locale];
  // Match the written exam sequence: sample size, mean test, regression, normal, proportion CI.
  return [questions[0]!, questions[1]!, questions[4]!, questions[2]!, questions[3]!];
}
