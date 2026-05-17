#!/usr/bin/env python3
"""
compile_events.py — merge all chapter event JSON files into app/src/data/events.json.

Usage:
    python scripts/compile_events.py [--vol-dir .scratch/religion-map/vol1]
                                     [--out app/src/data/events.json]

Reads every ch*.json in --vol-dir, merges their events arrays,
deduplicates by concept_id (first occurrence wins), and writes
a single flat JSON array to --out.
"""

import argparse
import glob
import json
import os
import sys


def load_chapter_files(vol_dirs: list[str]) -> list[dict]:
    files = []
    for vol_dir in vol_dirs:
        pattern = os.path.join(vol_dir, "ch*-events.json") # match specifically chXX-events.json
        vol_files = sorted(glob.glob(pattern))
        files.extend(vol_files)
    
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


def normalize_event(event: dict) -> dict:
    """
    Unify heterogeneous chapter exports into the SPA-friendly shape.

    Older / volume-imported files sometimes use alternate field names from LLM pipelines.
    """
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
    return out


def compile_events(chapters: list[dict]) -> list[dict]:
    """
    Merge events from all chapters.
    Each event gets volume/chapter/chapter_title injected if missing.
    """
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
            # Inject source metadata if not already present
            event.setdefault("volume", vol)
            event.setdefault("chapter_num", ch_num)
            event.setdefault("chapter_title", ch_title)
            if cid in seen_ids:
                # Concept already recorded — this entry is a back-reference, not a first occurrence
                event["is_first_occurrence"] = False
            seen_ids.add(cid)
            all_events.append(event)

    return all_events


def main():
    parser = argparse.ArgumentParser(description="Compile chapter events → events.json")
    parser.add_argument(
        "--vol-dirs",
        nargs="+",
        default=[
            ".scratch/religion-map/vol1",
            ".scratch/religion-map/vol2",
            ".scratch/religion-map/vol3"
        ],
        help="Directories containing ch*-events.json files",
    )
    parser.add_argument(
        "--out",
        default="app/src/data/events.json",
        help="Output path for merged events JSON",
    )
    args = parser.parse_args()

    chapters = load_chapter_files(args.vol_dirs)
    events = compile_events(chapters)

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

    print(f"Compiled {len(events)} events from {len(chapters)} chapter file(s)")
    print(f"Output: {args.out}")


if __name__ == "__main__":
    main()
