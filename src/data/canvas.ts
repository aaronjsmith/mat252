/** Snapshot of Ensign Canvas course 27287 (MAT 252-01 B1), pulled from a signed-in session. */

export const CANVAS_COURSE_ID = 27287;
export const CANVAS_URL = 'https://ensign.instructure.com/courses/27287';
export const CANVAS_PULLED_AT = '2026-09-18T00:12:00Z';

export const COURSE = {
  name: 'MAT 252-01 (B1) Statistics',
  code: 'MAT 252 Section 01',
  term: '2026 Fall Semester',
  currentScore: 99.41,
  currentGrade: 'A',
};

export const DEADLINES = {
  midterm1Open: '2026-09-16T06:00:00Z',
  midterm1Due: '2026-09-22T05:59:59Z',
  weeks13LastDay: '2026-09-24T05:59:59Z',
  midterm2Open: '2026-10-12T06:00:00Z',
  midterm2Due: '2026-10-17T05:59:59Z',
  weeks47LastDay: '2026-10-16T05:59:59Z',
};

export type CanvasWorkState = 'graded' | 'submitted' | 'pending_review' | 'unsubmitted';

export interface CanvasWork {
  id: number;
  week: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  name: string;
  pts: number;
  score: number | null;
  state: CanvasWorkState;
  submitted: string | null;
  due: string | null;
  exam?: boolean;
}

/** Graded-or-due student work (attendance / setup omitted). */
export const WORK: CanvasWork[] = [
  { id: 1601354, week: 1, name: '1.1 PCQ Ch 1', pts: 15, score: 15, state: 'graded', submitted: '2026-08-31T17:48:57Z', due: '2026-09-01T05:59:59Z' },
  { id: 1601355, week: 1, name: '1.2 HW Ch 1', pts: 15, score: 15, state: 'graded', submitted: '2026-09-01T23:55:01Z', due: '2026-09-03T05:59:59Z' },
  { id: 1601349, week: 1, name: '1.2b Identify the Type', pts: 10, score: 10, state: 'graded', submitted: '2026-09-01T23:18:38Z', due: '2026-09-03T05:59:00Z' },
  { id: 1601356, week: 1, name: '1.3 GW Rolling Down the River', pts: 20, score: 20, state: 'graded', submitted: '2026-09-06T01:34:33Z', due: '2026-09-02T03:00:00Z' },
  { id: 1601368, week: 1, name: '2.1 PCQ Ch 2', pts: 15, score: 15, state: 'graded', submitted: '2026-09-02T03:25:16Z', due: '2026-09-03T05:59:59Z' },
  { id: 1601369, week: 1, name: '2.2 HW Ch 2', pts: 15, score: 15, state: 'graded', submitted: '2026-09-05T05:07:55Z', due: '2026-09-05T05:59:59Z' },
  { id: 1601370, week: 1, name: '2.3 GW Describing Data Graphically', pts: 20, score: 18, state: 'graded', submitted: '2026-09-04T01:22:07Z', due: '2026-09-04T03:00:00Z' },
  { id: 1601398, week: 1, name: 'Week 1 Quiz', pts: 20, score: 20, state: 'graded', submitted: '2026-09-05T20:32:02Z', due: '2026-09-06T05:59:59Z' },
  { id: 1601397, week: 1, name: 'Week 1 Post-Group Reflection', pts: 10, score: 10, state: 'graded', submitted: '2026-09-06T00:26:28Z', due: '2026-09-06T05:59:00Z' },
  { id: 1601371, week: 2, name: '3.1 PCQ Ch 3', pts: 15, score: 15, state: 'graded', submitted: '2026-09-07T23:24:12Z', due: '2026-09-08T05:59:59Z' },
  { id: 1601372, week: 2, name: '3.2 HW Ch 3', pts: 15, score: 15, state: 'graded', submitted: '2026-09-09T23:52:48Z', due: '2026-09-10T05:59:59Z' },
  { id: 1601351, week: 2, name: '3.3 GW State Funds', pts: 20, score: 20, state: 'graded', submitted: '2026-09-09T03:30:17Z', due: '2026-09-09T05:59:59Z' },
  { id: 1601373, week: 2, name: '4.1 PCQ Ch 4', pts: 15, score: 15, state: 'graded', submitted: '2026-09-10T01:41:21Z', due: '2026-09-10T05:59:59Z' },
  { id: 1601374, week: 2, name: '4.2 HW Ch 4', pts: 15, score: 15, state: 'graded', submitted: '2026-09-10T21:40:46Z', due: '2026-09-12T05:59:59Z' },
  { id: 1601375, week: 2, name: '4.3 GW Dice Probability', pts: 20, score: 20, state: 'graded', submitted: '2026-09-11T01:39:25Z', due: '2026-09-11T03:00:00Z' },
  { id: 1601400, week: 2, name: 'Week 2 Quiz', pts: 20, score: 19.67, state: 'graded', submitted: '2026-09-13T04:27:25Z', due: '2026-09-13T05:59:59Z' },
  { id: 1601399, week: 2, name: 'Week 2 Post-Group Reflection', pts: 10, score: 10, state: 'graded', submitted: '2026-09-13T05:13:27Z', due: '2026-09-13T05:59:00Z' },
  { id: 1601376, week: 3, name: '5.1 PCQ Ch 5', pts: 15, score: 15, state: 'graded', submitted: '2026-09-14T20:42:57Z', due: '2026-09-15T05:59:59Z' },
  { id: 1601377, week: 3, name: '5.2 HW Ch 5', pts: 15, score: 15, state: 'graded', submitted: '2026-09-16T21:36:28Z', due: '2026-09-17T05:59:59Z' },
  { id: 351425, week: 3, name: '5.3a Binomial Probability Quiz (guessing)', pts: 20, score: 6, state: 'graded', submitted: '2026-09-15T21:57:06Z', due: '2026-09-15T23:00:00Z' },
  { id: 1601348, week: 3, name: '5.3 GW Binomial Probability Activity', pts: 20, score: 13, state: 'pending_review', submitted: '2026-09-16T03:42:47Z', due: '2026-09-16T05:59:59Z' },
  { id: 1617045, week: 3, name: '6.1 Midterm 1 Part 1 Review — ALEKS', pts: 30, score: 30, state: 'graded', submitted: '2026-09-17T04:06:12Z', due: '2026-09-17T05:59:59Z' },
  { id: 1601379, week: 3, name: '6.2 Midterm 1 Part 2 Review — Written', pts: 30, score: null, state: 'submitted', submitted: '2026-09-17T04:50:17Z', due: '2026-09-17T05:59:59Z' },
  { id: 1601391, week: 3, name: 'Midterm 1 Part 1 — ALEKS', pts: 50, score: null, state: 'unsubmitted', submitted: null, due: '2026-09-22T05:59:59Z', exam: true },
  { id: 1601392, week: 3, name: 'Midterm 1 Part 2 — Written (testing center)', pts: 50, score: null, state: 'unsubmitted', submitted: null, due: '2026-09-22T05:59:59Z', exam: true },
];

export function workHref(id: number): string {
  if (id === 351425) return `${CANVAS_URL}/quizzes/351425`;
  return `${CANVAS_URL}/assignments/${id}`;
}

export function formatMd(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Denver',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function openExams(): CanvasWork[] {
  return WORK.filter((w) => w.exam && w.state === 'unsubmitted');
}
