# Canvas course 27287 (MAT 252)

Live: https://ensign.instructure.com/courses/27287/modules

Automation could not reuse the already-open Edge window (profile locked) and a fresh Edge window hit Microsoft login. Course files will land in `course-content/` after one of these:

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

Until that dump exists, the practice site uses catalog MAT 252 outcomes in a 7-week grouping (data, probability, inference).
