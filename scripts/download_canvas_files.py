"""Download every file from Canvas Files folders (course list API is 403 for students)."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from download_canvas_edge import (  # noqa: E402
    COURSE,
    BASE,
    OUT,
    api_all,
    api_json,
    clone_edge_profile,
    harvest_file_ids,
    save_file_meta,
    wait_for_login,
    write_json,
    FAILED,
    STATS,
)

EXISTING_IDS = set()


def already_have() -> set[str]:
    ids: set[str] = set()
    for p in (OUT / "files").rglob("*.meta.json"):
        m = re.match(r"^(\d+)-", p.name)
        if m:
            ids.add(m.group(1))
    for p in (OUT / "modules").rglob("*"):
        m = re.match(r"^(\d+)-", p.name)
        if m:
            ids.add(m.group(1))
    return ids


def main() -> None:
    existing = already_have()
    print(f"Already have {len(existing)} file ids", flush=True)
    folders = json.loads((OUT / "folders.json").read_text(encoding="utf-8"))
    extra_ids: set[str] = set()

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

        listed: list[dict] = []
        for folder in folders:
            fid = folder.get("id")
            name = folder.get("full_name") or folder.get("name")
            print(f"Folder {name} (id {fid}, files_count={folder.get('files_count')})", flush=True)
            files = []
            for path in (
                f"/api/v1/folders/{fid}/files?per_page=100",
                f"/api/v1/folders/{fid}/all?per_page=100",
            ):
                try:
                    chunk = api_all(page, path)
                    if isinstance(chunk, list) and chunk:
                        files = chunk
                        print(f"  listed {len(files)} via {path}", flush=True)
                        break
                    if isinstance(chunk, dict):
                        print(f"  {path} -> {str(chunk)[:200]}", flush=True)
                except Exception as e:
                    print(f"  FAIL {path}: {e}", flush=True)
            dest = OUT / "files" / "folders" / str(fid)
            write_json(dest / "_list.json", files if files else {"empty_or_forbidden": True, "folder": folder})
            for f in files if isinstance(files, list) else []:
                if not isinstance(f, dict) or not f.get("id"):
                    continue
                listed.append(f)
                extra_ids.add(str(f["id"]))

        # Harvest IDs from assignment HTML + syllabus + pages already on disk.
        blobs = []
        for p in OUT.rglob("*.html"):
            try:
                blobs.append(p.read_text(encoding="utf-8", errors="ignore"))
            except Exception:
                pass
        extra_ids |= harvest_file_ids(*blobs)

        # Files SPA
        try:
            page.goto(f"{BASE}/courses/{COURSE}/files", wait_until="domcontentloaded")
            page.wait_for_timeout(4000)
            html = page.content()
            (OUT / "files-spa.html").write_text(html, encoding="utf-8")
            extra_ids |= harvest_file_ids(html)
            print(f"Files SPA harvested {len(harvest_file_ids(html))} ids", flush=True)
        except Exception as e:
            print(f"FAIL files SPA: {e}", flush=True)

        write_json(OUT / "files-from-folders.json", listed)
        print(f"Total unique ids to consider: {len(extra_ids)}", flush=True)

        dest = OUT / "files" / "all"
        n_new = 0
        n_skip = 0
        for fid in sorted(extra_ids, key=lambda x: int(x) if x.isdigit() else 0):
            if fid in existing:
                n_skip += 1
                continue
            before = len(FAILED)
            save_file_meta(page, fid, dest)
            if len(FAILED) == before:
                n_new += 1
                existing.add(fid)

        context.close()

    write_json(
        OUT / "_files_dump.json",
        {"new": n_new, "skipped_existing": n_skip, "failed": FAILED, "stats": STATS},
    )
    print(f"Downloaded {n_new} new files, skipped {n_skip} existing, failed {len(FAILED)}", flush=True)
    print("FAILED:", FAILED, flush=True)


if __name__ == "__main__":
    main()
