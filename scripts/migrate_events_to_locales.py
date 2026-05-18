#!/usr/bin/env python3
"""Migrate chapter event JSON from flat RU strings to locales.en / locales.ru shape."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from locale_schema import ensure_locales_shape, event_has_locales
from repo_paths import REPO_ROOT


def migrate_chapter(path: Path, dry_run: bool) -> int:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    changed = 0
    events = data.get("events") or []
    for i, ev in enumerate(events):
        if not isinstance(ev, dict):
            continue
        if event_has_locales(ev):
            continue
        events[i] = ensure_locales_shape(ev)
        changed += 1
    data["events"] = events
    if changed and not dry_run:
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
    return changed


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate events to locales schema")
    parser.add_argument(
        "--vol-dirs",
        nargs="+",
        default=None,
        help="Chapter directories (default: .scratch/religion-map/vol1-3)",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.vol_dirs:
        vol_dirs = [Path(d) for d in args.vol_dirs]
    else:
        vol_dirs = [REPO_ROOT / ".scratch" / "religion-map" / f"vol{i}" for i in (1, 2, 3)]

    total = 0
    files = 0
    for vol_dir in vol_dirs:
        for path in sorted(vol_dir.glob("ch*-events.json")):
            n = migrate_chapter(path, args.dry_run)
            if n:
                print(f"{path.name}: migrated {n} events")
                total += n
                files += 1
    print(f"Done — {total} events in {files} file(s)" + (" (dry run)" if args.dry_run else ""))


if __name__ == "__main__":
    main()
