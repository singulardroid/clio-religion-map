#!/usr/bin/env python3
"""
compile_events.py — merge chapter JSON + editorial overlay → app/src/data/events.json
"""

import argparse
import glob
import json
import os
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from locale_schema import ensure_locales_shape, en_is_complete
from repo_paths import REPO_ROOT

DEFAULT_OVERLAY = REPO_ROOT / "data" / "editorial" / "event-overlays.json"
PHASE2_FIXTURE_VOL = REPO_ROOT / "tests" / "fixtures" / "phase2"
PHASE2_FIXTURE_OVERLAY = PHASE2_FIXTURE_VOL / "event-overlays.json"


def load_chapter_files(vol_dirs: list[str]) -> list[dict]:
    files = []
    for vol_dir in vol_dirs:
        pattern = os.path.join(vol_dir, "ch*-events.json")
        files.extend(sorted(glob.glob(pattern)))
    if not files:
        print(f"ERROR: No ch*-events.json files found in {vol_dirs}", file=sys.stderr)
        sys.exit(1)
    chapters = []
    for path in files:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
            data["_source_path"] = path
            chapters.append(data)
    return chapters


def load_overlay(path: Path) -> dict[str, dict]:
    if not path.is_file():
        return {}
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    by_id = data.get("by_concept_id") or {}
    return by_id if isinstance(by_id, dict) else {}


def normalize_event(event: dict) -> dict:
    out = dict(event)
    if not out.get("concept_id"):
        if isinstance(out.get("concept"), str) and out["concept"].strip():
            out["concept_id"] = out["concept"]
        elif isinstance(out.get("concepts"), list) and out["concepts"]:
            first = out["concepts"][0]
            if isinstance(first, str) and first.strip():
                out["concept_id"] = first
    if "event_name" in out and "name" not in out:
        out["name"] = out.pop("event_name")
    if "event_description" in out and "description" not in out:
        out["description"] = out.pop("event_description")
    if not out.get("statement"):
        stmt = out.get("description") or out.get("name")
        if stmt:
            out["statement"] = stmt
    if not out.get("period"):
        yf = out.get("year_from")
        yt = out.get("year_to")
        if isinstance(yf, int) and isinstance(yt, int):
            suf = " н. э." if yf > 0 and yt > 0 else ""
            bf = ""
            ae = ""
            if yf < 0:
                bf = f"{abs(yf)} до н.э."
            elif yf == 0:
                bf = "0"
            else:
                bf = str(yf)
            if yt < 0:
                ae = f"{abs(yt)} до н.э."
            elif yt == 0:
                ae = "0"
            else:
                ae = str(yt) + suf.strip()
            out["period"] = f"{bf} — {ae}"
    if "connections" not in out:
        out["connections"] = []
    if "seshat" not in out or out["seshat"] is None:
        yf = out.get("year_from")
        yt = out.get("year_to")
        if not isinstance(yf, int):
            yf = None
        if not isinstance(yt, int):
            yt = None
        out["seshat"] = {
            "nga_name": None,
            "polity_name": None,
            "year_from": yf,
            "year_to": yt,
            "mapping_confidence": "low",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False,
        }
    return ensure_locales_shape(out)


def apply_overlay(event: dict, overlay: dict | None) -> None:
    if not overlay:
        event["editorial"] = {"comments": [], "issues": []}
        return
    ed: dict = {
        "comments": overlay.get("comments") or [],
        "issues": overlay.get("issues") or [],
    }
    pos = overlay.get("position")
    if isinstance(pos, dict) and "x" in pos and "y" in pos:
        ed["position"] = {"x": float(pos["x"]), "y": float(pos["y"])}
    event["editorial"] = ed


def compile_events(chapters: list[dict], overlay_by_id: dict[str, dict]) -> list[dict]:
    all_events: list[dict] = []
    seen_ids: set[str] = set()

    for chapter in chapters:
        src = str(chapter.get("_source_path", "")).replace("\\", "/")
        vol = chapter.get("volume")
        if vol is None:
            if "/vol3/" in src:
                vol = 3
            elif "/vol2/" in src:
                vol = 2
            else:
                vol = 1
        ch_num = chapter.get("chapter_num")
        ch_title = chapter.get("chapter_title", "")
        for event in chapter.get("events", []):
            event = normalize_event(event)
            cid = event.get("concept_id")
            if not cid:
                continue
            event.setdefault("volume", vol)
            event.setdefault("chapter_num", ch_num)
            event.setdefault("chapter_title", ch_title)
            if cid in seen_ids:
                event["is_first_occurrence"] = False
            seen_ids.add(cid)
            apply_overlay(event, overlay_by_id.get(cid))
            all_events.append(event)

    return all_events


def validate_strict_en(events: list[dict]) -> list[str]:
    errors: list[str] = []
    for ev in events:
        cid = ev.get("concept_id", "?")
        if not en_is_complete(ev):
            errors.append(cid)
    return errors


def main():
    parser = argparse.ArgumentParser(description="Compile chapter events → events.json")
    parser.add_argument("--vol-dirs", nargs="+", default=None)
    parser.add_argument("--out", default=None)
    parser.add_argument("--overlay", default=str(DEFAULT_OVERLAY))
    parser.add_argument(
        "--strict-en",
        action="store_true",
        help="Fail if any event lacks required locales.en fields",
    )
    args = parser.parse_args()

    if args.vol_dirs is None:
        vol_dirs = [str(REPO_ROOT / ".scratch" / "religion-map" / f"vol{i}") for i in (1, 2, 3)]
        if PHASE2_FIXTURE_VOL.is_dir() and list(PHASE2_FIXTURE_VOL.glob("ch*-events.json")):
            vol_dirs.append(str(PHASE2_FIXTURE_VOL.resolve()))
    else:
        vol_dirs = []
        for d in args.vol_dirs:
            p = Path(d)
            vol_dirs.append(str(p if p.is_absolute() else (REPO_ROOT / p).resolve()))

    out_arg = args.out if args.out is not None else REPO_ROOT / "app" / "src" / "data" / "events.json"
    out_path = Path(out_arg)
    out_final = str(out_path if out_path.is_absolute() else (REPO_ROOT / out_path).resolve())

    overlay_path = Path(args.overlay)
    if not overlay_path.is_absolute():
        overlay_path = (REPO_ROOT / overlay_path).resolve()
    overlay_by_id = load_overlay(overlay_path)
    if PHASE2_FIXTURE_OVERLAY.is_file():
        fixture_overlay = load_overlay(PHASE2_FIXTURE_OVERLAY)
        overlay_by_id = {**overlay_by_id, **fixture_overlay}

    chapters = load_chapter_files(vol_dirs)
    events = compile_events(chapters, overlay_by_id)

    if args.strict_en:
        missing = validate_strict_en(events)
        if missing:
            print(f"ERROR: --strict-en failed for {len(missing)} event(s)", file=sys.stderr)
            for cid in missing[:20]:
                print(f"  - {cid}", file=sys.stderr)
            if len(missing) > 20:
                print(f"  ... and {len(missing) - 20} more", file=sys.stderr)
            sys.exit(1)

    os.makedirs(os.path.dirname(out_final), exist_ok=True)
    with open(out_final, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

    print(f"Compiled {len(events)} events from {len(chapters)} chapter file(s)")
    print(f"Output: {out_final}")


if __name__ == "__main__":
    main()
