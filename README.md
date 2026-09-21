# MAT 252 · Statistics practice

Unofficial student practice for Ensign College **MAT 252 Statistics**, built on the same React + Vite + Cloudflare Workers UI framework as [dashboard.ensign.quest](https://dashboard.ensign.quest/) (ENG 301 Student Outcomes Dashboard). Quiz behavior follows [mat107.ensign.quest](https://mat107.ensign.quest/): mastery at **10 unaided correct** per topic, hint penalties, and themed boss fights.

Weeks follow Canvas course 27287. Weekly quizzes and both midterms have a **no-hints testing portion**. Midterm 1 covers Weeks 1–3 (due Sep 21). Printable 5×7 study-template notecard: `/notecard-midterm1.html`.

Canvas source: [course 27287 modules](https://ensign.instructure.com/courses/27287/modules). A signed-in dump of modules lives in `course-content/` (gitignored). Assignment snapshot used by the home page is in `src/data/canvas.ts`.

## Local development

```bash
npm install
npm run dev
```

Or double-click `win_run.bat`.

## Build / deploy

```bash
npm run build
npm run preview
npm run deploy
```
