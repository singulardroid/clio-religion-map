#!/usr/bin/env python3
"""Export open editorial issues + event context for local agent review."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from locale_schema import locale_block
from repo_paths import REPO_ROOT

DEFAULT_OVERLAY = REPO_ROOT / "data" / "editorial" / "event-overlays.json"
DEFAULT_EVENTS = REPO_ROOT / "app" / "src" / "data" / "events.json"
DEFAULT_OUT = REPO_ROOT / "data" / "editorial" / "issues-review.json"


def main() -> None:
    parser = argparse.ArgumentParser(description="Export open issues for agent review")
    parser.add_argument("--overlay", type=Path, default=DEFAULT_OVERLAY)
    parser.add_argument("--events", type=Path, default=DEFAULT_EVENTS)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    with args.overlay.open(encoding="utf-8") as f:
        overlay = json.load(f).get("by_concept_id") or {}

    if not args.events.is_file():
        print("ERROR: run compile_events.py first", file=sys.stderr)
        sys.exit(1)
    with args.events.open(encoding="utf-8") as f:
        events = json.load(f)
    by_id = {e["concept_id"]: e for e in events if e.get("concept_id")}

    records = []
    for cid, ovl in overlay.items():
        issues = ovl.get("issues") or []
        open_issues = [i for i in issues if isinstance(i, dict) and not i.get("resolved")]
        if not open_issues:
            continue
        ev = by_id.get(cid, {})
        records.append(
            {
                "concept_id": cid,
                "volume": ev.get("volume"),
                "chapter_num": ev.get("chapter_num"),
                "issues": open_issues,
                "locales": {
                    "en": locale_block(ev, "en"),
                    "ru": locale_block(ev, "ru"),
                },
                "connections": ev.get("connections") or [],
                "inputs": {
                    "epub_glob": "inputs/A History of Religious Ideas, Volume *.epub",
                    "fb2_glob": "inputs/*Том_*.fb2",
                },
            }
        )

    out_doc = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "open_issue_count": sum(len(r["issues"]) for r in records),
        "records": records,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(out_doc, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(records)} record(s) → {args.out}")


if __name__ == "__main__":
    main()
