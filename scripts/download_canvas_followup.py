"""Fetch leftover syllabus images and per-quiz questions after the main dump."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from download_canvas_edge import (  # noqa: E402
    COURSE,
    OUT,
    api_all,
    clone_edge_profile,
    save_file_meta,
    wait_for_login,
)

QUIZ_IDS = []
for p in (OUT / "modules").rglob("quiz-*.json"):
    data = json.loads(p.read_text(encoding="utf-8"))
    qid = data.get("id")
    if qid:
        QUIZ_IDS.append((qid, p.parent))

EXTRA_FILES = ["10062580", "10062694"]  # syllabus images


def main() -> None:
    print(f"Follow-up: {len(QUIZ_IDS)} quizzes, {len(EXTRA_FILES)} syllabus files", flush=True)
    with sync_playwright() as p:
        cloned = clone_edge_profile()
        context = p.chromium.launch_persistent_context(
            str(cloned),
            channel="msedge",
            headless=False,
            args=["--profile-directory=Default", "--disable-session-crashed-bubble"],
        )
        page = context.pages[0] if context.pages else context.new_page()
        wait_for_login(page)
        for fid in EXTRA_FILES:
            save_file_meta(page, fid, OUT / "files" / "syllabus")
        qdir = OUT / "quizzes"
        qdir.mkdir(exist_ok=True)
        for qid, parent in QUIZ_IDS:
            dest = qdir / f"{qid}-questions.json"
            try:
                qs = api_all(page, f"/api/v1/courses/{COURSE}/quizzes/{qid}/questions?per_page=100")
                dest.write_text(json.dumps(qs, indent=2, ensure_ascii=False), encoding="utf-8")
                (parent / f"{qid}-questions.json").write_text(
                    json.dumps(qs, indent=2, ensure_ascii=False), encoding="utf-8"
                )
                n = len(qs) if isinstance(qs, list) else qs
                print(f"  quiz {qid} questions: {n}", flush=True)
            except Exception as e:
                dest.write_text(json.dumps({"error": str(e)}, indent=2), encoding="utf-8")
                print(f"  FAIL quiz {qid} questions: {e}", flush=True)
        context.close()
    print("Follow-up done.", flush=True)


if __name__ == "__main__":
    main()
