"""Probe remaining Canvas endpoints students might still hit."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from download_canvas_edge import (  # noqa: E402
    COURSE,
    BASE,
    OUT,
    api,
    api_json,
    clone_edge_profile,
    save_file_meta,
    wait_for_login,
    write_json,
)

PATHS = [
    f"/api/v1/courses/{COURSE}/files?search_term=excel&per_page=100",
    f"/api/v1/courses/{COURSE}/files?search_term=.pdf&per_page=100",
    f"/api/v1/courses/{COURSE}/pages/homepage",
    f"/api/v1/courses/{COURSE}/front_page",
    "/api/graphql",
]


def main() -> None:
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

        for path in PATHS[:-1]:
            try:
                data, resp = api(page, path)
                n = len(data) if isinstance(data, list) else type(data).__name__
                print(f"{resp.status} {path} -> {n}", flush=True)
                slug = path.split("?")[0].rstrip("/").replace("/", "_")[-80:]
                write_json(OUT / "probes" / f"{slug}.json", data)
            except Exception as e:
                print(f"FAIL {path}: {e}", flush=True)

        gql = {
            "query": """
            query CourseFiles($id: ID!) {
              course(id: $id) {
                name
                filesConnection(first: 100) {
                  nodes { _id displayName contentType url }
                  pageInfo { hasNextPage endCursor }
                }
              }
            }
            """,
            "variables": {"id": COURSE},
        }
        try:
            resp = page.request.post(
                f"{BASE}/api/graphql",
                data=json.dumps(gql),
                headers={"Content-Type": "application/json", "Accept": "application/json"},
            )
            print(f"GraphQL {resp.status}", flush=True)
            body = resp.json()
            write_json(OUT / "probes" / "graphql-files.json", body)
            nodes = (
                (((body or {}).get("data") or {}).get("course") or {})
                .get("filesConnection") or {}
            ).get("nodes") or []
            print(f"GraphQL nodes: {len(nodes)}", flush=True)
            dest = OUT / "files" / "graphql"
            for n in nodes:
                fid = n.get("_id")
                if fid:
                    save_file_meta(page, fid, dest, extra=n)
        except Exception as e:
            print(f"FAIL graphql: {e}", flush=True)

        try:
            home = api_json(page, f"/api/v1/courses/{COURSE}/pages/homepage")
            write_json(OUT / "pages" / "homepage.json", home)
            if isinstance(home, dict) and home.get("body"):
                (OUT / "pages" / "homepage.html").write_text(str(home["body"]), encoding="utf-8")
                print("Saved homepage", flush=True)
        except Exception as e:
            print(f"FAIL homepage: {e}", flush=True)

        context.close()
    print("Probe done.", flush=True)


if __name__ == "__main__":
    main()
