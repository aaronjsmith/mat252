"""Download Canvas course 27287 through headed Edge (uses the live browser session)."""
from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from urllib.parse import quote, urljoin

from playwright.sync_api import sync_playwright

COURSE = "27287"
BASE = "https://ensign.instructure.com"
OUT = Path(__file__).resolve().parents[1] / "course-content"


def safe(name: object, limit: int = 80) -> str:
    s = re.sub(r"[^\w.\- ]+", "_", str(name))
    return (s.strip(" ._") or "item")[:limit]


def write_json(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding="utf-8")


def api(page, path: str):
    url = path if path.startswith("http") else f"{BASE}{path}"
    resp = page.request.get(url, headers={"Accept": "application/json"})
    if resp.status in (401, 403):
        raise RuntimeError(f"HTTP {resp.status} for {url}")
    text = resp.text()
    ctype = resp.headers.get("content-type") or ""
    if "json" in ctype or text.lstrip().startswith(("[", "{")):
        try:
            return resp.json()
        except Exception:
            return {"raw": text[:5000], "status": resp.status}
    return {"raw": text, "status": resp.status}


def api_all(page, path: str) -> list:
    items: list = []
    url = path
    while url:
        if not url.startswith("http"):
            url = f"{BASE}{url}"
        chunk = api(page, url)
        if isinstance(chunk, dict) and chunk.get("status") == "unauthenticated":
            raise RuntimeError("Canvas still unauthenticated in this Edge window")
        if isinstance(chunk, list):
            items.extend(chunk)
        else:
            return chunk
        # Canvas pagination via Link is not visible to fetch(); use page number.
        if len(chunk) < 100:
            break
        if "page=" in url:
            m = re.search(r"page=(\d+)", url)
            n = int(m.group(1)) + 1 if m else 2
            url = re.sub(r"page=\d+", f"page={n}", url)
        else:
            url = url + ("&" if "?" in url else "?") + "page=2"
        if url.endswith("page=20"):
            break
    return items


def download_binary(page, url: str, dest: Path) -> int:
    dest.parent.mkdir(parents=True, exist_ok=True)
    resp = page.request.get(url)
    if resp.status >= 400:
        raise RuntimeError(f"HTTP {resp.status} downloading {url}")
    data = resp.body()
    dest.write_bytes(data)
    return len(data)


def wait_for_login(page) -> None:
    page.goto(f"{BASE}/courses/{COURSE}/modules", wait_until="domcontentloaded")
    for _ in range(60):
        url = page.url
        title = page.title()
        body = ""
        try:
            body = page.locator("body").inner_text(timeout=2000)[:500]
        except Exception:
            pass
        print(f"  url={url} title={title!r}", flush=True)
        if "unauthenticated" in body.lower() or "log in" in title.lower() or "login" in url.lower():
            time.sleep(2)
            continue
        if "/courses/27287" in url or "modules" in url:
            # Confirm API works.
            try:
                me = api(page, "/api/v1/users/self")
                if isinstance(me, dict) and me.get("id"):
                    print(f"Authenticated as user id {me.get('id')}", flush=True)
                    return
            except Exception as e:
                print(f"  api probe: {e}", flush=True)
        time.sleep(2)
    raise RuntimeError("Could not see an authenticated Canvas session in Edge.")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Opening Edge with your existing profile…", flush=True)
    with sync_playwright() as p:
        user_data = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\User Data")
        browser = None
        try:
            context = p.chromium.launch_persistent_context(
                user_data,
                channel="msedge",
                headless=False,
                args=["--profile-directory=Default", "--disable-session-crashed-bubble"],
            )
            page = context.pages[0] if context.pages else context.new_page()
        except Exception as e:
            print(
                f"Persistent profile in use ({e}). A new Edge window opened — pick your Ensign account if prompted.",
                flush=True,
            )
            browser = p.chromium.launch(channel="msedge", headless=False)
            context = browser.new_context()
            page = context.new_page()
        wait_for_login(page)

        print("Fetching course metadata…", flush=True)
        course = api(page, f"/api/v1/courses/{COURSE}?include[]=syllabus_body&include[]=term")
        write_json(OUT / "course.json", course)
        print(f"Course: {course.get('name')}", flush=True)

        modules = api_all(page, f"/api/v1/courses/{COURSE}/modules?per_page=100")
        write_json(OUT / "modules.json", modules)
        print(f"{len(modules)} modules", flush=True)

        files = api_all(page, f"/api/v1/courses/{COURSE}/files?per_page=100")
        write_json(OUT / "files.json", files)
        print(f"{len(files) if isinstance(files, list) else '?'} files", flush=True)

        pages_idx = api_all(page, f"/api/v1/courses/{COURSE}/pages?per_page=100")
        write_json(OUT / "pages-index.json", pages_idx)

        try:
            assignments = api_all(page, f"/api/v1/courses/{COURSE}/assignments?per_page=100")
        except Exception as e:
            assignments = []
            write_json(OUT / "assignments.error.json", {"error": str(e)})
        write_json(OUT / "assignments.json", assignments)

        try:
            quizzes = api_all(page, f"/api/v1/courses/{COURSE}/quizzes?per_page=100")
        except Exception as e:
            quizzes = []
            write_json(OUT / "quizzes.error.json", {"error": str(e)})
        write_json(OUT / "quizzes.json", quizzes)

        try:
            discussions = api_all(page, f"/api/v1/courses/{COURSE}/discussion_topics?per_page=100")
        except Exception as e:
            discussions = []
            write_json(OUT / "discussions.error.json", {"error": str(e)})
        write_json(OUT / "discussions.json", discussions)

        html = page.content()
        (OUT / "modules.html").write_text(html, encoding="utf-8")

        pages_dir = OUT / "pages"
        for pg in pages_idx if isinstance(pages_idx, list) else []:
            slug = pg.get("url") or pg.get("page_id")
            try:
                body = api(page, f"/api/v1/courses/{COURSE}/pages/{quote(str(slug))}")
                write_json(pages_dir / f"{safe(slug)}.json", body)
                (pages_dir / f"{safe(slug)}.html").write_text(body.get("body") or "", encoding="utf-8")
                print(f"  page {slug}", flush=True)
            except Exception as e:
                write_json(pages_dir / f"{safe(slug)}.error.json", {"error": str(e)})

        asg_dir = OUT / "assignments"
        for asg in assignments if isinstance(assignments, list) else []:
            aid = asg.get("id")
            write_json(asg_dir / f"{aid}-{safe(asg.get('name'))}.json", asg)
            if asg.get("description"):
                (asg_dir / f"{aid}-{safe(asg.get('name'))}.html").write_text(
                    str(asg["description"]), encoding="utf-8"
                )

        qz_dir = OUT / "quizzes"
        for qz in quizzes if isinstance(quizzes, list) else []:
            qid = qz.get("id")
            write_json(qz_dir / f"{qid}-{safe(qz.get('title'))}.json", qz)
            try:
                qs = api_all(page, f"/api/v1/courses/{COURSE}/quizzes/{qid}/questions?per_page=100")
                write_json(qz_dir / f"{qid}-questions.json", qs)
            except Exception as e:
                write_json(qz_dir / f"{qid}-questions.error.json", {"error": str(e)})

        files_dir = OUT / "files"
        for f in files if isinstance(files, list) else []:
            fid = f.get("id")
            name = safe(f.get("display_name") or f.get("filename") or fid, 120)
            dest = files_dir / str(f.get("folder_id") or "root") / f"{fid}-{name}"
            url = f.get("url") or f"{BASE}/files/{fid}/download?download_frd=1"
            try:
                n = download_binary(page, url, dest)
                write_json(dest.with_suffix(dest.suffix + ".meta.json"), {**f, "bytes": n})
                print(f"  file {name} ({n} bytes)", flush=True)
            except Exception as e:
                write_json(dest.with_suffix(".error.json"), {"error": str(e), "file": f})

        mods_dir = OUT / "modules"
        index = []
        for mod in modules if isinstance(modules, list) else []:
            mid = mod.get("id")
            mdir = mods_dir / f"{mid}-{safe(mod.get('name'))}"
            items = api_all(
                page,
                f"/api/v1/courses/{COURSE}/modules/{mid}/items?per_page=100&include[]=content_details",
            )
            write_json(mdir / "items.json", items)
            print(f"Module {mod.get('name')} ({len(items) if isinstance(items, list) else 0} items)", flush=True)
            for item in items if isinstance(items, list) else []:
                itype = item.get("type")
                iid = item.get("id")
                url = item.get("url")
                try:
                    if itype == "Page" and item.get("page_url"):
                        body = api(page, f"/api/v1/courses/{COURSE}/pages/{quote(str(item['page_url']))}")
                        write_json(mdir / f"page-{iid}.json", body)
                        (mdir / f"page-{iid}.html").write_text(body.get("body") or "", encoding="utf-8")
                    elif itype == "File" and url:
                        meta = api(page, url)
                        write_json(mdir / f"file-{iid}.json", meta)
                        file_url = meta.get("url") if isinstance(meta, dict) else None
                        if file_url:
                            fname = safe(meta.get("display_name") or meta.get("filename") or iid)
                            download_binary(page, file_url, mdir / f"file-{iid}-{fname}")
                    elif itype in {"Assignment", "Quiz", "Discussion"} and url:
                        body = api(page, url)
                        write_json(mdir / f"{str(itype).lower()}-{iid}.json", body)
                    elif item.get("html_url"):
                        html_item = page.evaluate(
                            """async (url) => {
                                const res = await fetch(url, { credentials: 'include' });
                                return await res.text();
                            }""",
                            item["html_url"] if str(item["html_url"]).startswith("http") else urljoin(BASE, item["html_url"]),
                        )
                        (mdir / f"item-{iid}.html").write_text(html_item, encoding="utf-8")
                except Exception as e:
                    write_json(mdir / f"item-{iid}.error.json", {"error": str(e), "item": item})
            index.append({"id": mid, "name": mod.get("name"), "items": len(items) if isinstance(items, list) else 0})

        write_json(OUT / "index.json", index)
        if browser:
            browser.close()
        else:
            context.close()
    print(f"Done. Wrote {OUT}", flush=True)


if __name__ == "__main__":
    main()
