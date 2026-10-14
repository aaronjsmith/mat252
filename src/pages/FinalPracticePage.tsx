import { useState } from 'react';
import { TitleBar } from '../components/header/TitleBar';
import { LanguageToggle, ThemeToggle } from '../components/header/Toggles';
import { useI18n } from '../context/LanguageContext';
import { finalPracticeContent } from './finalPracticeContent';
import styles from './FinalPracticePage.module.css';

const TEXT = {
  en: {
    subtitle: 'MAT 252 · Final exam review',
    back: '← All practice quizzes',
    lead: 'Work each multi-step problem before opening its solution. Show your formulas and intermediate steps in the workspace.',
    duration: 'Part 2 · 50 points · 5 questions',
    examFormat: 'Final exam format',
    part1: 'Part 1 · ALEKS · 50 points · 13 questions',
    part1Breakdown: 'Normal probability (means/proportions): 2 questions · Confidence intervals for means: 3 · Confidence intervals for proportions: 1 · Hypothesis tests for means: 3 · Hypothesis tests for proportions: 1 · Correlation and regression: 3',
    part2: 'Part 2 · Written in class · 50 points · 5 questions',
    part2Breakdown: 'Sample size for a proportion CI: 4 points · Hypothesis testing for means: 13 · Correlation and regression: 10 · Normal probability: 11 · Confidence interval for proportions: 12',
    workspace: 'Your work',
    placeholder: 'Write your setup, calculations, and conclusion here…',
    solution: 'Show worked solution',
    step: 'Part',
    caution: 'Try each part first; the solution includes the reasoning and final answer.',
    points: 'pts',
  },
  es: {
    subtitle: 'MAT 252 · Repaso del examen final',
    back: '← Todos los cuestionarios',
    lead: 'Resuelve cada problema de varios pasos antes de abrir la solución. Muestra las fórmulas y los pasos intermedios en el espacio de trabajo.',
    duration: 'Parte 2 · 50 puntos · 5 preguntas',
    examFormat: 'Formato del examen final',
    part1: 'Parte 1 · ALEKS · 50 puntos · 13 preguntas',
    part1Breakdown: 'Probabilidad normal (medias/proporciones): 2 preguntas · Intervalos de confianza para medias: 3 · Intervalos de confianza para proporciones: 1 · Pruebas de hipótesis para medias: 3 · Pruebas de hipótesis para proporciones: 1 · Correlación y regresión: 3',
    part2: 'Parte 2 · Escrita en clase · 50 puntos · 5 preguntas',
    part2Breakdown: 'Tamaño de muestra para IC de una proporción: 4 puntos · Pruebas de hipótesis para medias: 13 · Correlación y regresión: 10 · Probabilidad normal: 11 · Intervalo de confianza para proporciones: 12',
    workspace: 'Tu trabajo',
    placeholder: 'Escribe aquí el planteamiento, los cálculos y la conclusión…',
    solution: 'Mostrar solución desarrollada',
    step: 'Parte',
    caution: 'Intenta cada parte primero; la solución incluye el razonamiento y la respuesta final.',
    points: 'ptos',
  },
} as const;

function readDraft(id: string): string {
  try {
    return localStorage.getItem(`mat252-written-${id}`) ?? '';
  } catch {
    return '';
  }
}

export function FinalPracticePage() {
  const { locale, t } = useI18n();
  const copy = TEXT[locale];
  const problems = finalPracticeContent(locale);
  const [drafts, setDrafts] = useState<Record<number, string>>(() =>
    Object.fromEntries(problems.map((_, i) => [i, readDraft(String(i))])),
  );

  function updateDraft(index: number, value: string) {
    setDrafts((current) => ({ ...current, [index]: value }));
    try {
      localStorage.setItem(`mat252-written-${index}`, value);
    } catch {
      // Keep the practice usable when browser storage is unavailable.
    }
  }

  return (
    <div className={styles.page}>
      <TitleBar
        title={t.finalPracticeTitle}
        subtitle={copy.subtitle}
        backHref="/"
        backLabel={copy.back}
      />
      <div className={styles.toolbar}>
        <p className={styles.lead}>{copy.lead}</p>
        <span className={styles.spacer} />
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h2>{copy.examFormat}</h2>
          <div className={styles.examParts}>
            <section>
              <strong>{copy.part1}</strong>
              <p>{copy.part1Breakdown}</p>
            </section>
            <section>
              <strong>{copy.part2}</strong>
              <p>{copy.part2Breakdown}</p>
            </section>
          </div>
          <strong className={styles.practiceLabel}>{copy.duration}</strong>
          <span>{copy.caution}</span>
        </div>
        {problems.map((problem, index) => (
          <article className={styles.problem} key={problem.title}>
            <div className={styles.problemHeader}>
              <span className={styles.number}>{index + 1}</span>
              <div>
                <p className={styles.topic}>{problem.topic}</p>
                <h2>{problem.title}</h2>
              </div>
              <span className={styles.problemPoints}>
                {problem.partPoints.reduce((sum, points) => sum + points, 0)} {copy.points}
              </span>
            </div>
            <p className={styles.context}>{problem.context}</p>
            {index === 4 && (
              <div className={styles.dataTable} role="table" aria-label={locale === 'en' ? 'Temperature and revenue data' : 'Datos de temperatura e ingresos'}>
                <div role="row"><strong role="columnheader">{locale === 'en' ? 'Temperature x (°C)' : 'Temperatura x (°C)'}</strong><strong role="columnheader">{locale === 'en' ? 'Revenue y ($)' : 'Ingresos y ($)'}</strong></div>
                {[['12', '140'], ['15', '180'], ['18', '215'], ['20', '250'], ['22', '270'], ['25', '335'], ['28', '375'], ['30', '390']].map(([x, y]) => (
                  <div role="row" key={x}><span role="cell">{x}</span><span role="cell">{y}</span></div>
                ))}
              </div>
            )}
            <ol className={styles.parts}>
              {problem.parts.map((part, partIndex) => (
                <li key={part}><span>{part}</span><small>{problem.partPoints[partIndex]} {copy.points}</small></li>
              ))}
            </ol>
            <label className={styles.workLabel} htmlFor={`work-${index}`}>{copy.workspace}</label>
            <textarea
              id={`work-${index}`}
              className={styles.workspace}
              value={drafts[index] ?? ''}
              onChange={(event) => updateDraft(index, event.target.value)}
              placeholder={copy.placeholder}
              rows={5}
            />
            <details className={styles.solution}>
              <summary>{copy.solution}</summary>
              <ol>
                {problem.solution.map((step, stepIndex) => (
                  <li key={step}><span>{copy.step} {String.fromCharCode(97 + stepIndex)}. </span>{step}</li>
                ))}
              </ol>
            </details>
          </article>
        ))}
      </main>
    </div>
  );
}
