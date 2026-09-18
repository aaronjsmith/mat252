import type { Assessment, TopicId } from '../data/catalog';
import {
  ASSESSMENTS,
  MASTER,
  TOPIC_LABEL,
  topicsForWeek,
} from '../data/catalog';

export interface TopicProgress {
  unaided_correct: number;
}

export interface ExamRecord {
  correct: number;
  total: number;
  at: number;
}

export interface ProgressState {
  version: 1;
  topics: Partial<Record<TopicId, TopicProgress>>;
  total_attempted: number;
  total_credit: number;
  final_boss_cleared: boolean;
  exam_last?: ExamRecord;
  exam_best?: ExamRecord;
}

function empty(): ProgressState {
  return {
    version: 1,
    topics: {},
    total_attempted: 0,
    total_credit: 0,
    final_boss_cleared: false,
  };
}

export function progressKey(assessmentId: string): string {
  return `mat252-${assessmentId}-progress`;
}

export function notesKey(assessmentId: string): string {
  return `mat252-${assessmentId}-notes`;
}

export function collapseKey(): string {
  return 'mat252-week-collapsed';
}

export function readProgress(assessmentId: string): ProgressState {
  try {
    const raw = localStorage.getItem(progressKey(assessmentId));
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || parsed.version !== 1) return empty();
    return {
      ...empty(),
      ...parsed,
      topics: parsed.topics || {},
    };
  } catch {
    return empty();
  }
}

export function writeProgress(assessmentId: string, state: ProgressState): void {
  localStorage.setItem(progressKey(assessmentId), JSON.stringify(state));
}

export function topicUnaided(state: ProgressState, topicId: TopicId): number {
  return Number(state.topics[topicId]?.unaided_correct) || 0;
}

/**
 * Display/logic unaided for a topic. Use the best progress across this quiz,
 * its week siblings (week quiz ↔ lesson cards), and the course overview.
 */
export function effectiveTopicUnaided(assessment: Assessment, topicId: TopicId): number {
  let n = topicUnaided(readProgress(assessment.id), topicId);
  for (const a of ASSESSMENTS) {
    if (!a.available || a.id === assessment.id || !a.topicIds.includes(topicId)) continue;
    if (assessment.compose || a.compose || a.weekId === assessment.weekId) {
      n = Math.max(n, topicUnaided(readProgress(a.id), topicId));
    }
  }
  return Math.min(MASTER, n);
}

/** Mastery percent for one topic (one decimal), matching MAT 107. */
export function topicMasteryPct(unaided: number): number {
  return Math.round((1000 * Math.min(unaided, MASTER)) / MASTER) / 10;
}

/** Dashboard slice colors — cycle the green/gold token ramp. */
export const SLICE_COLORS = [
  'var(--accent-module)',
  'var(--chart-2)',
  'var(--accent-presets)',
  'var(--accent-highlights)',
  'var(--accent-sync)',
  'var(--chart-3)',
  'var(--accent-new-chart)',
  'var(--chart-1)',
] as const;

export interface MasterySlice {
  id: TopicId;
  label: string;
  unaided: number;
  needed: number;
  mastery: number;
  mastered: boolean;
  color: string;
}

export interface MasteryView {
  slices: MasterySlice[];
  overall: number;
  mastered: number;
  total: number;
  unaidedNeeded: number;
}

function masteryViewForTopics(
  topicIds: TopicId[],
  unaidedOf: (id: TopicId) => number,
): MasteryView {
  const slices: MasterySlice[] = topicIds.map((id, i) => {
    const unaided = unaidedOf(id);
    const mastery = topicMasteryPct(unaided);
    return {
      id,
      label: TOPIC_LABEL[id],
      unaided,
      needed: MASTER,
      mastery,
      mastered: unaided >= MASTER,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    };
  });
  const unaidedSum = slices.reduce((sum, s) => sum + s.unaided, 0);
  const total = slices.length;
  const overallNeeded = total * MASTER;
  const overall =
    overallNeeded > 0 ? Math.round((1000 * unaidedSum) / overallNeeded) / 10 : 0;
  return {
    slices,
    overall,
    mastered: slices.filter((s) => s.mastered).length,
    total,
    unaidedNeeded: MASTER,
  };
}

export function readMasteryView(assessment: Assessment): MasteryView {
  return masteryViewForTopics(assessment.topicIds, (id) =>
    effectiveTopicUnaided(assessment, id),
  );
}

/** Week-group chart: unique week topics, max unaided across that week and overview. */
export function readWeekMasteryView(weekId: string): MasteryView {
  const topicIds = topicsForWeek(weekId);
  return masteryViewForTopics(topicIds, (id) => {
    let n = 0;
    for (const a of ASSESSMENTS) {
      if (!a.available || !a.topicIds.includes(id)) continue;
      if (a.weekId !== weekId && !a.compose) continue;
      n = Math.max(n, topicUnaided(readProgress(a.id), id));
    }
    return Math.min(MASTER, n);
  });
}

export function setTopicUnaided(
  state: ProgressState,
  topicId: TopicId,
  n: number,
): ProgressState {
  const next = Math.max(0, Math.min(MASTER, Math.round(n)));
  return {
    ...state,
    topics: {
      ...state.topics,
      [topicId]: { unaided_correct: next },
    },
  };
}

export function isMastered(state: ProgressState, topicId: TopicId): boolean {
  return topicUnaided(state, topicId) >= MASTER;
}

export function allMastered(assessment: Assessment, _state?: ProgressState): boolean {
  return assessment.topicIds.every((tid) => effectiveTopicUnaided(assessment, tid) >= MASTER);
}

export interface ProgressSummary {
  mastered: number;
  total: number;
  attempted: number;
  accuracy: number | null;
  bossCleared: boolean;
  examLast: ExamRecord | null;
  examBest: ExamRecord | null;
}

export function readProgressSummary(assessment: Assessment): ProgressSummary {
  const topicIds = assessment.topicIds;
  const emptySum: ProgressSummary = {
    mastered: 0,
    total: topicIds.length,
    attempted: 0,
    accuracy: null,
    bossCleared: false,
    examLast: null,
    examBest: null,
  };
  try {
    const p = readProgress(assessment.id);
    let mastered = 0;
    for (const tid of topicIds) {
      if (effectiveTopicUnaided(assessment, tid) >= MASTER) mastered += 1;
    }
    const attempted = Number(p.total_attempted) || 0;
    const credit = Number(p.total_credit) || 0;
    return {
      mastered,
      total: topicIds.length,
      attempted,
      accuracy: attempted ? Math.round((credit / attempted) * 100) : null,
      bossCleared: Boolean(p.final_boss_cleared),
      examLast: p.exam_last ?? null,
      examBest: p.exam_best ?? null,
    };
  } catch {
    return emptySum;
  }
}

export function relatedAssessmentIds(topicId: TopicId, fromId: string, assessments: Assessment[]): string[] {
  const from = assessments.find((a) => a.id === fromId);
  if (!from || !from.topicIds.includes(topicId)) return [];
  return assessments
    .filter((a) => {
      if (a.id === fromId || !a.available || !a.topicIds.includes(topicId)) return false;
      // Overview ↔ everything with the topic; within a week, quiz ↔ lesson cards.
      return from.compose || a.compose || a.weekId === from.weekId;
    })
    .map((a) => a.id);
}

export function syncTopicToRelated(
  topicId: TopicId,
  fromId: string,
  unaided: number,
  assessments: Assessment[],
): void {
  for (const id of relatedAssessmentIds(topicId, fromId, assessments)) {
    const cur = topicUnaided(readProgress(id), topicId);
    const p = setTopicUnaided(readProgress(id), topicId, Math.max(cur, unaided));
    writeProgress(id, p);
  }
}

export function recordExamScore(assessmentId: string, correct: number, total: number): ProgressState {
  const p = readProgress(assessmentId);
  const rec: ExamRecord = { correct, total, at: Date.now() };
  const best =
    p.exam_best && p.exam_best.total
      ? p.exam_best.correct / p.exam_best.total >= correct / total
        ? p.exam_best
        : rec
      : rec;
  const next = { ...p, exam_last: rec, exam_best: best };
  writeProgress(assessmentId, next);
  return next;
}
