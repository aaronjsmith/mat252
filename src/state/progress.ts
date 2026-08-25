import type { Assessment, TopicId } from '../data/catalog';
import { MASTER, weekAssessmentForTopic } from '../data/catalog';

export interface TopicProgress {
  unaided_correct: number;
}

export interface ProgressState {
  version: 1;
  topics: Partial<Record<TopicId, TopicProgress>>;
  total_attempted: number;
  total_credit: number;
  final_boss_cleared: boolean;
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

export function allMastered(assessment: Assessment, state: ProgressState): boolean {
  return assessment.topicIds.every((tid) => isMastered(state, tid));
}

export interface ProgressSummary {
  mastered: number;
  total: number;
  attempted: number;
  accuracy: number | null;
  bossCleared: boolean;
}

export function readProgressSummary(assessment: Assessment): ProgressSummary {
  const topicIds = assessment.topicIds;
  const emptySum: ProgressSummary = {
    mastered: 0,
    total: topicIds.length,
    attempted: 0,
    accuracy: null,
    bossCleared: false,
  };
  try {
    const p = readProgress(assessment.id);
    let mastered = 0;
    for (const tid of topicIds) {
      let n = topicUnaided(p, tid);
      if (assessment.compose) {
        const week = weekAssessmentForTopic(tid);
        if (week) n = Math.max(n, topicUnaided(readProgress(week.id), tid));
      }
      if (n >= MASTER) mastered += 1;
    }
    const attempted = Number(p.total_attempted) || 0;
    const credit = Number(p.total_credit) || 0;
    return {
      mastered,
      total: topicIds.length,
      attempted,
      accuracy: attempted ? Math.round((credit / attempted) * 100) : null,
      bossCleared: Boolean(p.final_boss_cleared),
    };
  } catch {
    return emptySum;
  }
}

export function relatedAssessmentIds(topicId: TopicId, fromId: string, assessments: Assessment[]): string[] {
  const from = assessments.find((a) => a.id === fromId);
  if (!from || !from.topicIds.includes(topicId)) return [];
  if (from.compose) {
    return assessments.filter((a) => !a.compose && a.topicIds.includes(topicId)).map((a) => a.id);
  }
  return assessments.filter((a) => a.compose && a.topicIds.includes(topicId)).map((a) => a.id);
}

export function syncTopicToRelated(
  topicId: TopicId,
  fromId: string,
  unaided: number,
  assessments: Assessment[],
): void {
  for (const id of relatedAssessmentIds(topicId, fromId, assessments)) {
    const p = setTopicUnaided(readProgress(id), topicId, unaided);
    writeProgress(id, p);
  }
}
