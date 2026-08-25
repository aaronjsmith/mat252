"""Download all Canvas course 27287 materials into course-content/.

Uses the signed-in Edge/Chrome cookie store on this machine. Cookie values
are never written to disk except as an ephemeral HTTP header in memory.
"""
from __future__ import annotations

import base64
import json
import os
import shutil
import sqlite3
import sys
import tempfile
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urljoin, urlparse
from urllib.request import Request, urlopen

COURSE_ID = "27287"
BASE = "https://ensign.instructure.com"
OUT = Path(__file__).resolve().parents[1] / "course-content"
TOKEN = os.environ.get("CANVAS_TOKEN", "").strip()

LOCALAPPDATA = Path(os.environ["LOCALAPPDATA"])
PROFILES = [
    LOCALAPPDATA / "Microsoft" / "Edge" / "User Data" / "Default",
    LOCALAPPDATA / "Microsoft" / "Edge" / "User Data" / "Profile 1",
    LOCALAPPDATA / "Microsoft" / "Edge" / "User Data" / "Profile 2",
    LOCALAPPDATA / "Google" / "Chrome" / "User Data" / "Default",
]


def dpapi_unprotect(data: bytes) -> bytes:
    import ctypes
    import ctypes.wintypes as wt

    class DATA_BLOB(ctypes.Structure):
        _fields_ = [("cbData", wt.DWORD), ("pbData", ctypes.POINTER(ctypes.c_char))]

    crypt32 = ctypes.windll.crypt32
    kernel32 = ctypes.windll.kernel32
    blob_in = DATA_BLOB(len(data), ctypes.create_string_buffer(data, len(data)))
    blob_out = DATA_BLOB()
    if not crypt32.CryptUnprotectData(
        ctypes.byref(blob_in), None, None, None, None, 0, ctypes.byref(blob_out)
    ):
        raise OSError("CryptUnprotectData failed")
    try:
        return ctypes.string_at(blob_out.pbData, blob_out.cbData)
    finally:
        kernel32.LocalFree(blob_out.pbData)


def chrome_key(user_data_parent: Path) -> bytes | None:
    local_state = user_data_parent / "Local State"
    if not local_state.exists():
        local_state = user_data_parent.parent / "Local State"
    if not local_state.exists():
        return None
    payload = json.loads(local_state.read_text(encoding="utf-8"))
    enc = payload.get("os_crypt", {}).get("encrypted_key")
    if not enc:
        return None
    raw = base64.b64decode(enc)
    if raw.startswith(b"DPAPI"):
        raw = raw[5:]
    return dpapi_unprotect(raw)


def aes_gcm_decrypt(key: bytes, blob: bytes) -> bytes | None:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    if blob.startswith(b"v10") or blob.startswith(b"v11"):
        nonce, rest = blob[3:15], blob[15:]
        try:
            return AESGCM(key).decrypt(nonce, rest, None)
        except Exception:
            return None
    if blob.startswith(b"v20"):
        # App-bound encryption — try the same key anyway (older Edge).
        nonce, rest = blob[3:15], blob[15:]
        try:
            return AESGCM(key).decrypt(nonce, rest, None)
        except Exception:
            return None
    try:
        return dpapi_unprotect(blob)
    except Exception:
        return None


def copy_locked_file(src: Path, dest: Path) -> None:
    """Read a file even when Edge/Chrome has it open."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(src, "rb") as fh:
            dest.write_bytes(fh.read())
        if dest.stat().st_size > 0:
            return
    except Exception:
        pass
    import subprocess

    ps = (
        f"$in = [IO.File]::Open({json.dumps(str(src))}, 'Open', 'Read', 'ReadWrite,Delete'); "
        f"try {{ $out = [IO.File]::Create({json.dumps(str(dest))}); "
        f"try {{ $in.CopyTo($out) }} finally {{ $out.Dispose() }} }} finally {{ $in.Dispose() }}"
    )
    subprocess.check_call(["powershell", "-NoProfile", "-Command", ps], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if not dest.exists() or dest.stat().st_size == 0:
        raise OSError(f"share-read copy produced empty file: {src}")


def copy_db(src: Path) -> Path:
    tmpdir = Path(tempfile.mkdtemp(prefix="canvas-cookies-"))
    tmp = tmpdir / "Cookies"
    siblings = [src]
    for extra in ("-journal", "-wal", "-shm"):
        p = src.parent / (src.name + extra)
        if p.exists():
            siblings.append(p)
    for p in siblings:
        dest = tmpdir / p.name
        try:
            copy_locked_file(p, dest)
        except Exception:
            try:
                shutil.copyfile(p, dest)
            except Exception:
                os.system(f'cmd /c copy /y "{p}" "{dest}" >nul')
    if not (tmp.exists() and tmp.stat().st_size > 0):
        raise OSError(f"could not copy {src}")
    return tmp


def cookies_from_profile(profile: Path) -> dict[str, str]:
    network = profile / "Network" / "Cookies"
    if not network.exists():
        return {}
    key = chrome_key(profile)
    if not key:
        print(f"  no DPAPI key for {profile}", flush=True)
        return {}
    try:
        db_path = copy_db(network)
    except Exception as e:
        print(f"  cookie DB locked/unreadable at {profile}: {e}", flush=True)
        return {}
    con = sqlite3.connect(db_path.as_posix())
    con.row_factory = sqlite3.Row
    rows = con.execute(
        "SELECT host_key, name, encrypted_value, expires_utc FROM cookies "
        "WHERE host_key LIKE '%instructure.com%' OR host_key LIKE '%canvas%' "
        "OR host_key LIKE '%ensign%'"
    ).fetchall()
    con.close()
    out: dict[str, str] = {}
    prefixes: dict[str, int] = {}
    decrypted = 0
    for row in rows:
        blob = bytes(row["encrypted_value"] or b"")
        prefixes[blob[:3].decode("latin1", "replace")] = prefixes.get(blob[:3].decode("latin1", "replace"), 0) + 1
        blob = bytes(row["encrypted_value"] or b"")
        val = aes_gcm_decrypt(key, blob)
        if val is None:
            continue
        candidates = [val]
        if len(val) > 32:
            candidates.append(val[32:])
        text = ""
        for cand in candidates:
            try:
                t = cand.decode("utf-8")
            except Exception:
                continue
            if t:
                text = t
                break
        if not text:
            continue
        decrypted += 1
        out[row["name"]] = text
    print(
        f"  {profile.name}: {len(rows)} canvas-related cookies, {decrypted} decrypted, prefixes={prefixes}",
        flush=True,
    )
    try:
        shutil.rmtree(db_path.parent, ignore_errors=True)
    except Exception:
        pass
    return out


def cookie_header() -> str:
    for profile in PROFILES:
        if not profile.exists():
            continue
        jar = cookies_from_profile(profile)
        # Canvas session cookies
        useful = {
            k: v
            for k, v in jar.items()
            if k.lower() in {
                "canvas_session",
                "_legacy_normandy_session",
                "log_session_id",
                "_csrf_token",
            }
            or "session" in k.lower()
        }
        if useful.get("canvas_session") or len(useful) >= 1:
            print(f"Using cookies from {profile} ({len(useful)} names)", flush=True)
            return "; ".join(f"{k}={v}" for k, v in jar.items())
    raise SystemExit("No Canvas cookies found in Edge/Chrome. Stay signed in, then re-run.")


COOKIE = ""
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MAT252CourseExport/1.0"


def auth_headers() -> dict[str, str]:
    h = {"Accept": "*/*", "User-Agent": UA}
    if TOKEN:
        h["Authorization"] = f"Bearer {TOKEN}"
    elif COOKIE:
        h["Cookie"] = COOKIE
    return h


def request(url: str, binary=False):
    req = Request(url, headers=auth_headers())
    try:
        with urlopen(req, timeout=60) as res:
            data = res.read()
            ctype = res.headers.get("Content-Type", "")
            final = res.geturl()
            return data, ctype, final
    except HTTPError as e:
        body = e.read()
        raise RuntimeError(f"{e.code} {e.reason} for {url}: {body[:200]!r}") from e


def get_json(url: str):
    data, ctype, _ = request(url)
    if b"unauthenticated" in data[:200] or b"user authorization required" in data[:400]:
        raise RuntimeError(f"Still unauthenticated for {url}")
    return json.loads(data.decode("utf-8"))


def get_all(url: str) -> list:
    out = []
    next_url = url
    while next_url:
        req = Request(next_url, headers=auth_headers() | {"Accept": "application/json"})
        with urlopen(req, timeout=60) as res:
            page = json.loads(res.read().decode("utf-8"))
            if isinstance(page, dict) and page.get("status") == "unauthenticated":
                raise RuntimeError("Canvas session cookie did not authenticate")
            if isinstance(page, list):
                out.extend(page)
            else:
                return page
            link = res.headers.get("Link") or ""
            m = None
            for part in link.split(","):
                if 'rel="next"' in part:
                    m = part[part.find("<") + 1 : part.find(">")]
            next_url = m
    return out


def safe_name(s: str, limit=120) -> str:
    cleaned = "".join(c if c.isalnum() or c in "._- " else "_" for c in str(s))
    return cleaned.strip(" ._")[:limit] or "item"


def write_bytes(path: Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def write_json(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False), encoding="utf-8")


def download_file(url: str, dest: Path):
    data, ctype, final = request(url, binary=True)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return len(data), ctype, final


def main():
    global COOKIE
    if TOKEN:
        print("Using CANVAS_TOKEN from the environment.", flush=True)
    else:
        print("Reading signed-in browser cookies…", flush=True)
        COOKIE = cookie_header()
    OUT.mkdir(parents=True, exist_ok=True)

    print("Fetching course…", flush=True)
    course = get_json(f"{BASE}/api/v1/courses/{COURSE_ID}?include[]=syllabus_body&include[]=term")
    write_json(OUT / "course.json", course)
    print(f"Course: {course.get('name')}", flush=True)

    print("Fetching modules…", flush=True)
    modules = get_all(f"{BASE}/api/v1/courses/{COURSE_ID}/modules?per_page=100")
    write_json(OUT / "modules.json", modules)

    print("Fetching files list…", flush=True)
    files = get_all(f"{BASE}/api/v1/courses/{COURSE_ID}/files?per_page=100")
    write_json(OUT / "files.json", files)

    print("Fetching pages…", flush=True)
    pages = get_all(f"{BASE}/api/v1/courses/{COURSE_ID}/pages?per_page=100")
    write_json(OUT / "pages-index.json", pages)

    print("Fetching assignments…", flush=True)
    try:
        assignments = get_all(f"{BASE}/api/v1/courses/{COURSE_ID}/assignments?per_page=100")
    except Exception as e:
        assignments = []
        write_json(OUT / "assignments.error.json", {"error": str(e)})
    write_json(OUT / "assignments.json", assignments)

    print("Fetching quizzes…", flush=True)
    try:
        quizzes = get_all(f"{BASE}/api/v1/courses/{COURSE_ID}/quizzes?per_page=100")
    except Exception as e:
        quizzes = []
        write_json(OUT / "quizzes.error.json", {"error": str(e)})
    write_json(OUT / "quizzes.json", quizzes)

    print("Fetching discussions…", flush=True)
    try:
        discussions = get_all(f"{BASE}/api/v1/courses/{COURSE_ID}/discussion_topics?per_page=100")
    except Exception as e:
        discussions = []
        write_json(OUT / "discussions.error.json", {"error": str(e)})
    write_json(OUT / "discussions.json", discussions)

    print("Fetching modules via HTML fallback…", flush=True)
    try:
        html, _, _ = request(f"{BASE}/courses/{COURSE_ID}/modules")
        write_bytes(OUT / "modules.html", html)
    except Exception as e:
        (OUT / "modules.html.error.txt").write_text(str(e), encoding="utf-8")

    # Pages bodies
    pages_dir = OUT / "pages"
    for page in pages:
        slug = page.get("url") or page.get("page_id")
        try:
            body = get_json(f"{BASE}/api/v1/courses/{COURSE_ID}/pages/{quote(str(slug))}")
            write_json(pages_dir / f"{safe_name(slug)}.json", body)
            html = (body.get("body") or "").encode("utf-8")
            write_bytes(pages_dir / f"{safe_name(slug)}.html", html)
            print(f"  page {slug}", flush=True)
        except Exception as e:
            write_json(pages_dir / f"{safe_name(slug)}.error.json", {"error": str(e)})

    # Assignments
    asg_dir = OUT / "assignments"
    for asg in assignments:
        aid = asg.get("id")
        write_json(asg_dir / f"{aid}-{safe_name(asg.get('name'))}.json", asg)
        if asg.get("description"):
            write_bytes(
                asg_dir / f"{aid}-{safe_name(asg.get('name'))}.html",
                str(asg["description"]).encode("utf-8"),
            )

    # Quizzes
    qz_dir = OUT / "quizzes"
    for qz in quizzes:
        qid = qz.get("id")
        write_json(qz_dir / f"{qid}-{safe_name(qz.get('title'))}.json", qz)
        try:
            qs = get_all(f"{BASE}/api/v1/courses/{COURSE_ID}/quizzes/{qid}/questions?per_page=100")
            write_json(qz_dir / f"{qid}-questions.json", qs)
        except Exception as e:
            write_json(qz_dir / f"{qid}-questions.error.json", {"error": str(e)})

    # Files
    files_dir = OUT / "files"
    for f in files:
        fid = f.get("id")
        name = safe_name(f.get("display_name") or f.get("filename") or fid)
        folder = safe_name(f.get("folder_id") or "root", 40)
        dest = files_dir / str(folder) / f"{fid}-{name}"
        url = f.get("url") or f"{BASE}/api/v1/files/{fid}"
        try:
            size, ctype, final = download_file(url, dest)
            print(f"  file {name} ({size} bytes)", flush=True)
            write_json(dest.with_suffix(dest.suffix + ".meta.json"), {**f, "saved_as": str(dest), "bytes": size, "content_type": ctype, "final_url": final})
        except Exception as e:
            write_json(dest.with_suffix(".error.json"), {"error": str(e), "file": f})

    # Module items + nested content
    mods_dir = OUT / "modules"
    index = []
    for mod in modules:
        mid = mod.get("id")
        mname = safe_name(mod.get("name") or mid)
        mdir = mods_dir / f"{mid}-{mname}"
        items = get_all(
            f"{BASE}/api/v1/courses/{COURSE_ID}/modules/{mid}/items?per_page=100&include[]=content_details"
        )
        write_json(mdir / "items.json", items)
        print(f"Module {mod.get('name')} ({len(items)} items)", flush=True)
        for item in items:
            itype = item.get("type")
            iid = item.get("id")
            url = item.get("url")
            html_url = item.get("html_url")
            try:
                if itype == "Page" and item.get("page_url"):
                    body = get_json(
                        f"{BASE}/api/v1/courses/{COURSE_ID}/pages/{quote(str(item['page_url']))}"
                    )
                    write_json(mdir / f"page-{iid}.json", body)
                    write_bytes(mdir / f"page-{iid}.html", str(body.get("body") or "").encode("utf-8"))
                elif itype == "File" and url:
                    meta = get_json(url)
                    write_json(mdir / f"file-{iid}.json", meta)
                    file_url = meta.get("url")
                    if file_url:
                        fname = safe_name(meta.get("display_name") or meta.get("filename") or iid)
                        download_file(file_url, mdir / f"file-{iid}-{fname}")
                elif itype in {"Assignment", "Quiz", "Discussion", "ExternalUrl"} and url:
                    try:
                        body = get_json(url)
                        write_json(mdir / f"{itype.lower()}-{iid}.json", body)
                    except Exception:
                        if html_url:
                            data, _, _ = request(html_url)
                            write_bytes(mdir / f"{itype.lower()}-{iid}.html", data)
                elif html_url:
                    data, _, _ = request(html_url)
                    write_bytes(mdir / f"item-{iid}.html", data)
            except Exception as e:
                write_json(mdir / f"item-{iid}.error.json", {"error": str(e), "item": item})
        index.append({"id": mid, "name": mod.get("name"), "items": len(items)})

    write_json(OUT / "index.json", index)
    print(f"Done. Wrote {OUT}", flush=True)


if __name__ == "__main__":
    main()
