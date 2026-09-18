# Canvas course 27287 (MAT 252)

Live: https://ensign.instructure.com/courses/27287/modules

Last signed-in pull: **2026-09-17** (MDT). Assignment scores and the Week 3 / Midterm 1 structure are baked into `src/data/canvas.ts` for the practice site.

**Midterm 1** (2 parts) is available Sep 16–21, 2026 — no extensions. Part 1 is ALEKS; Part 2 is written in the testing center (5×7 notecard + Midterm Excel Sheet only). Weeks 1–3 work last day: Sep 23.

Binaries and a full HTML dump land in `course-content/` (gitignored) after one of these:

1. **Canvas access token (simplest)**  
   Canvas → Account → Settings → New Access Token, then in PowerShell:

   ```powershell
   $env:CANVAS_TOKEN = "paste-token-here"
   python scripts/download_canvas.py
   ```

2. **Close every Edge window**, then:

   ```powershell
   python scripts/download_canvas_edge.py
   ```

Until a full dump exists, the practice site uses the catalog + `src/data/canvas.ts` snapshot.
