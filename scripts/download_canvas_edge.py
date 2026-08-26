"""Download Canvas course 27287 through headed Edge (uses the live browser session)."""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import quote, urljoin

from playwright.sync_api import sync_playwright

COURSE = "27287"
BASE = "https://ensign.instructure.com"
OUT = Path(__file__).resolve().parents[1] / "course-content"
FILE_ID_RE = re.compile(r"/files/(\d+)", re.I)
FAILED: list[str] = []
STATS = {"modules": 0, "pages": 0, "assignments": 0, "quizzes": 0, "files": 0, "discussions": 0}


def safe(name: object, limit: int = 80) -> str:
    s = re.sub(r"[^\w.\- ]+", "_", str(name))
    return (s.strip(" ._") or "item")[:limit]


def write_json(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding="utf-8")


def note_fail(label: str, err: object) -> None:
    FAILED.append(f"{label}: {err}")
    print(f"  FAIL {label}: {err}", flush=True)


def api(page, path: str):
    url = path if path.startswith("http") else f"{BASE}{path}"
    resp = page.request.get(url, headers={"Accept": "application/json"})
    if resp.status in (401, 403):
        raise RuntimeError(f"HTTP {resp.status} for {url}")
    text = resp.text()
    ctype = resp.headers.get("content-type") or ""
    if "json" in ctype or text.lstrip().startswith(("[", "{")):
        try:
            return resp.json(), resp
        except Exception:
            return {"raw": text[:5000], "status": resp.status}, resp
    return {"raw": text, "status": resp.status}, resp


def api_json(page, path: str):
    data, _ = api(page, path)
    return data


def next_from_link(link: str | None) -> str | None:
    if not link:
        return None
    for part in link.split(","):
        if 'rel="next"' in part:
            start = part.find("<")
            end = part.find(">")
            if start >= 0 and end > start:
                return part[start + 1 : end]
    return None


def api_all(page, path: str) -> list:
    items: list = []
    url = path if str(path).startswith("http") else f"{BASE}{path}"
    for _ in range(50):
        chunk, resp = api(page, url)
        if isinstance(chunk, dict) and chunk.get("status") == "unauthenticated":
            raise RuntimeError("Canvas still unauthenticated in this Edge window")
        if not isinstance(chunk, list):
            return chunk
        items.extend(chunk)
        nxt = next_from_link(resp.headers.get("link"))
        if not nxt:
            if len(chunk) >= 100:
                if "page=" in url:
                    m = re.search(r"[?&]page=(\d+)", url)
                    n = int(m.group(1)) + 1 if m else 2
                    url = re.sub(r"([?&]page=)\d+", rf"\g<1>{n}", url)
                else:
                    url = url + ("&" if "?" in url else "?") + "page=2"
                continue
            break
        url = nxt
    return items


def download_binary(page, url: str, dest: Path) -> int:
    dest.parent.mkdir(parents=True, exist_ok=True)
    resp = page.request.get(url)
    if resp.status >= 400:
        raise RuntimeError(f"HTTP {resp.status} downloading {url}")
    data = resp.body()
    dest.write_bytes(data)
    STATS["files"] += 1
    return len(data)


def share_copy(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    ps = (
        f"$in = [IO.File]::Open({json.dumps(str(src))}, 'Open', 'Read', 'ReadWrite'); "
        f"try {{ $out = [IO.File]::Create({json.dumps(str(dest))}); "
        f"try {{ $in.CopyTo($out) }} finally {{ $out.Dispose() }} }} finally {{ $in.Dispose() }}"
    )
    subprocess.check_call(
        ["powershell", "-NoProfile", "-Command", ps],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def clone_edge_profile() -> Path | None:
    """Copy enough of the signed-in Edge profile into TEMP so Playwright can launch it."""
    src_root = Path(os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\User Data"))
    if not src_root.exists():
        return None
    dest_root = Path(tempfile.gettempdir()) / "mat252-edge-profile"
    if dest_root.exists():
        shutil.rmtree(dest_root, ignore_errors=True)
    dest_root.mkdir(parents=True, exist_ok=True)
    copied = 0
    pairs = [
        (src_root / "Local State", dest_root / "Local State"),
        (src_root / "Default" / "Preferences", dest_root / "Default" / "Preferences"),
        (src_root / "Default" / "Secure Preferences", dest_root / "Default" / "Secure Preferences"),
        (src_root / "Default" / "Network" / "Cookies", dest_root / "Default" / "Network" / "Cookies"),
        (
            src_root / "Default" / "Network" / "Cookies-journal",
            dest_root / "Default" / "Network" / "Cookies-journal",
        ),
    ]
    for src, dest in pairs:
        if not src.exists():
            continue
        try:
            share_copy(src, dest)
            copied += 1
        except Exception:
            try:
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, dest)
                copied += 1
            except Exception as e:
                print(f"  could not copy {src.name}: {e}", flush=True)
    if copied == 0:
        return None
    print(f"Cloned {copied} Edge profile files to {dest_root}", flush=True)
    return dest_root


def wait_for_login(page) -> None:
    page.goto(f"{BASE}/courses/{COURSE}/modules", wait_until="domcontentloaded")
    print(
        "If Microsoft sign-in appears in the Edge window, pick your Ensign account. Waiting…",
        flush=True,
    )
    for i in range(180):
        url = page.url
        title = page.title()
        if i % 5 == 0:
            print(f"  [{i}] {title!r} {url}", flush=True)
        logged_in = "/courses/27287" in url and "login" not in url.lower() and "microsoftonline" not in url
        if logged_in or (i > 0 and i % 3 == 0):
            try:
                me = api_json(page, "/api/v1/users/self")
                if isinstance(me, dict) and me.get("id"):
                    print(f"Authenticated as user id {me.get('id')}", flush=True)
                    return
            except Exception:
                pass
        time.sleep(2)
    raise RuntimeError("Could not see an authenticated Canvas session in Edge.")


def save_file_meta(page, fid: str | int, dest_dir: Path, extra: dict | None = None) -> None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    try:
        meta = extra or api_json(page, f"/api/v1/courses/{COURSE}/files/{fid}")
        if not isinstance(meta, dict) or meta.get("errors"):
            meta = extra or api_json(page, f"/api/v1/files/{fid}")
        if not isinstance(meta, dict):
            raise RuntimeError("unexpected file meta")
        name = safe(meta.get("display_name") or meta.get("filename") or fid, 120)
        dest = dest_dir / f"{fid}-{name}"
        url = meta.get("url") or f"{BASE}/files/{fid}/download?download_frd=1"
        n = download_binary(page, url, dest)
        write_json(dest.with_suffix(dest.suffix + ".meta.json"), {**meta, "bytes": n})
        print(f"  file {name} ({n} bytes)", flush=True)
    except Exception as e:
        note_fail(f"file {fid}", e)


def harvest_file_ids(*blobs: object) -> set[str]:
    ids: set[str] = set()
    for blob in blobs:
        text = blob if isinstance(blob, str) else json.dumps(blob)
        ids.update(FILE_ID_RE.findall(text))
    return ids


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("Opening Edge with a cloned copy of your signed-in profile…", flush=True)
    with sync_playwright() as p:
        browser = None
        cloned = clone_edge_profile()
        context = None
        if cloned:
            try:
                context = p.chromium.launch_persistent_context(
                    str(cloned),
                    channel="msedge",
                    headless=False,
                    args=["--profile-directory=Default", "--disable-session-crashed-bubble"],
                )
                page = context.pages[0] if context.pages else context.new_page()
            except Exception as e:
                print(f"Clone launch failed ({e}); falling back.", flush=True)
                context = None
        if context is None:
            try:
                user_data = os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\User Data")
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
        course = api_json(page, f"/api/v1/courses/{COURSE}?include[]=syllabus_body&include[]=term")
        write_json(OUT / "course.json", course)
        if isinstance(course, dict) and course.get("syllabus_body"):
            (OUT / "syllabus.html").write_text(str(course["syllabus_body"]), encoding="utf-8")
        print(f"Course: {course.get('name') if isinstance(course, dict) else course}", flush=True)

        try:
            tabs = api_all(page, f"/api/v1/courses/{COURSE}/tabs?per_page=100")
            write_json(OUT / "tabs.json", tabs)
        except Exception as e:
            note_fail("tabs", e)

        modules = api_all(
            page,
            f"/api/v1/courses/{COURSE}/modules?per_page=100&include[]=items&include[]=content_details",
        )
        write_json(OUT / "modules.json", modules)
        STATS["modules"] = len(modules) if isinstance(modules, list) else 0
        print(f"{STATS['modules']} modules", flush=True)

        try:
            files = api_all(page, f"/api/v1/courses/{COURSE}/files?per_page=100")
        except Exception as e:
            files = []
            note_fail("files list", e)
        write_json(OUT / "files.json", files)
        print(f"{len(files) if isinstance(files, list) else 0} files listed", flush=True)

        try:
            folders = api_all(page, f"/api/v1/courses/{COURSE}/folders?per_page=100")
            write_json(OUT / "folders.json", folders)
        except Exception as e:
            folders = []
            note_fail("folders", e)

        try:
            pages_idx = api_all(page, f"/api/v1/courses/{COURSE}/pages?per_page=100")
        except Exception as e:
            pages_idx = []
            note_fail("pages list", e)
        write_json(OUT / "pages-index.json", pages_idx)

        try:
            assignments = api_all(page, f"/api/v1/courses/{COURSE}/assignments?per_page=100")
        except Exception as e:
            assignments = []
            note_fail("assignments list", e)
        write_json(OUT / "assignments.json", assignments)

        try:
            quizzes = api_all(page, f"/api/v1/courses/{COURSE}/quizzes?per_page=100")
        except Exception as e:
            quizzes = []
            note_fail("quizzes list", e)
        write_json(OUT / "quizzes.json", quizzes)

        try:
            discussions = api_all(page, f"/api/v1/courses/{COURSE}/discussion_topics?per_page=100")
        except Exception as e:
            discussions = []
            note_fail("discussions list", e)
        write_json(OUT / "discussions.json", discussions)

        try:
            announcements = api_all(
                page,
                f"/api/v1/courses/{COURSE}/discussion_topics?only_announcements=true&per_page=100",
            )
            write_json(OUT / "announcements.json", announcements)
        except Exception as e:
            note_fail("announcements", e)

        html = page.content()
        (OUT / "modules.html").write_text(html, encoding="utf-8")
        try:
            files_html = page.request.get(f"{BASE}/courses/{COURSE}/files")
            (OUT / "files.html").write_text(files_html.text(), encoding="utf-8")
        except Exception as e:
            note_fail("files.html", e)

        extra_ids = harvest_file_ids(html, files, modules, pages_idx, assignments, quizzes, discussions)

        pages_dir = OUT / "pages"
        for pg in pages_idx if isinstance(pages_idx, list) else []:
            slug = pg.get("url") or pg.get("page_id")
            try:
                body = api_json(page, f"/api/v1/courses/{COURSE}/pages/{quote(str(slug))}")
                write_json(pages_dir / f"{safe(slug)}.json", body)
                html_body = body.get("body") or "" if isinstance(body, dict) else ""
                (pages_dir / f"{safe(slug)}.html").write_text(str(html_body), encoding="utf-8")
                extra_ids |= harvest_file_ids(html_body)
                STATS["pages"] += 1
                print(f"  page {slug}", flush=True)
            except Exception as e:
                note_fail(f"page {slug}", e)

        asg_dir = OUT / "assignments"
        for asg in assignments if isinstance(assignments, list) else []:
            aid = asg.get("id")
            write_json(asg_dir / f"{aid}-{safe(asg.get('name'))}.json", asg)
            desc = asg.get("description") or ""
            if desc:
                (asg_dir / f"{aid}-{safe(asg.get('name'))}.html").write_text(str(desc), encoding="utf-8")
                extra_ids |= harvest_file_ids(desc)
            STATS["assignments"] += 1

        qz_dir = OUT / "quizzes"
        for qz in quizzes if isinstance(quizzes, list) else []:
            qid = qz.get("id")
            write_json(qz_dir / f"{qid}-{safe(qz.get('title'))}.json", qz)
            STATS["quizzes"] += 1
            try:
                qs = api_all(page, f"/api/v1/courses/{COURSE}/quizzes/{qid}/questions?per_page=100")
                write_json(qz_dir / f"{qid}-questions.json", qs)
                extra_ids |= harvest_file_ids(qs)
            except Exception as e:
                note_fail(f"quiz questions {qid}", e)

        disc_dir = OUT / "discussions"
        for topic in discussions if isinstance(discussions, list) else []:
            tid = topic.get("id")
            write_json(disc_dir / f"{tid}-{safe(topic.get('title'))}.json", topic)
            STATS["discussions"] += 1
            extra_ids |= harvest_file_ids(topic.get("message") or "")
            try:
                view = api_json(page, f"/api/v1/courses/{COURSE}/discussion_topics/{tid}/view")
                write_json(disc_dir / f"{tid}-view.json", view)
                extra_ids |= harvest_file_ids(view)
            except Exception as e:
                note_fail(f"discussion view {tid}", e)

        files_dir = OUT / "files"
        listed_ids: set[str] = set()
        for f in files if isinstance(files, list) else []:
            fid = str(f.get("id"))
            listed_ids.add(fid)
            folder = safe(f.get("folder_id") or "root", 40)
            try:
                save_file_meta(page, fid, files_dir / folder, extra=f)
            except Exception as e:
                note_fail(f"listed file {fid}", e)

        for fid in sorted(extra_ids - listed_ids):
            save_file_meta(page, fid, files_dir / "linked")

        mods_dir = OUT / "modules"
        index = []
        for mod in modules if isinstance(modules, list) else []:
            mid = mod.get("id")
            mdir = mods_dir / f"{mid}-{safe(mod.get('name'))}"
            items = mod.get("items")
            if not items:
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
                        body = api_json(
                            page,
                            f"/api/v1/courses/{COURSE}/pages/{quote(str(item['page_url']))}",
                        )
                        write_json(mdir / f"page-{iid}.json", body)
                        html_body = body.get("body") or "" if isinstance(body, dict) else ""
                        (mdir / f"page-{iid}.html").write_text(str(html_body), encoding="utf-8")
                    elif itype == "File" and (url or item.get("content_id")):
                        fid = item.get("content_id") or iid
                        save_file_meta(page, fid, mdir)
                        listed_ids.add(str(fid))
                    elif itype in {"Assignment", "Quiz", "Discussion"} and url:
                        body = api_json(page, url)
                        write_json(mdir / f"{str(itype).lower()}-{iid}.json", body)
                    elif itype == "ExternalUrl":
                        write_json(
                            mdir / f"external-{iid}.json",
                            {"url": item.get("external_url") or item.get("html_url"), "item": item},
                        )
                    elif item.get("html_url"):
                        href = (
                            item["html_url"]
                            if str(item["html_url"]).startswith("http")
                            else urljoin(BASE, item["html_url"])
                        )
                        html_item = page.request.get(href).text()
                        (mdir / f"item-{iid}.html").write_text(html_item, encoding="utf-8")
                except Exception as e:
                    note_fail(f"module item {iid} ({itype})", e)
                    write_json(mdir / f"item-{iid}.error.json", {"error": str(e), "item": item})
            index.append({"id": mid, "name": mod.get("name"), "items": len(items) if isinstance(items, list) else 0})

        write_json(OUT / "index.json", index)
        write_json(OUT / "_download_summary.json", {"stats": STATS, "failed": FAILED})
        if browser:
            browser.close()
        else:
            context.close()
    print(f"Done. Wrote {OUT}", flush=True)
    print(f"STATS {STATS}", flush=True)
    print(f"FAILED {len(FAILED)}", flush=True)


if __name__ == "__main__":
    main()
