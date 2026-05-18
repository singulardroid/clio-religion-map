#!/usr/bin/env python3
"""Populate locales.en from English EPUB fulltext (search) with RU-bootstrap fallback."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from locale_schema import LOCALIZABLE_EVENT_FIELDS, locale_block
from repo_paths import REPO_ROOT


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.lower().strip())


def _search_snippet(haystack: str, needle: str, window: int = 400) -> str | None:
    if not needle or len(needle) < 12:
        return None
    nh = _norm(haystack)
    words = [w for w in re.findall(r"[\w']+", _norm(needle)) if len(w) > 3][:8]
    if not words:
        return None
    probe = " ".join(words[:4])
    idx = nh.find(probe)
    if idx < 0 and len(words) >= 2:
        idx = nh.find(" ".join(words[:2]))
    if idx < 0:
        return None
    # map back approximately via ratio
    ratio = len(haystack) / max(len(nh), 1)
    start = max(0, int(idx * ratio) - 80)
    end = min(len(haystack), start + window)
    return haystack[start:end].strip()


def _bootstrap_from_ru(event: dict) -> dict[str, str]:
    ru = locale_block(event, "ru")
    en: dict[str, str] = {}
    for key in LOCALIZABLE_EVENT_FIELDS:
        if ru.get(key):
            en[key] = ru[key]
    return en


def align_chapter(path: Path, vol_text: str, force_bootstrap: bool) -> tuple[int, int]:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    matched = 0
    bootstrapped = 0
    for ev in data.get("events") or []:
        if not isinstance(ev, dict):
            continue
        loc = ev.setdefault("locales", {})
        ru = locale_block(ev, "ru")
        existing = locale_block(ev, "en")
        if existing.get("quote") and existing.get("statement") and not force_bootstrap:
            continue
        quote_ru = ru.get("quote") or ""
        snippet = None if force_bootstrap else _search_snippet(vol_text, quote_ru)
        if snippet:
            en = dict(existing)
            en.setdefault("statement", ru.get("statement", ""))
            en.setdefault("period", ru.get("period", ""))
            en.setdefault("religion", ru.get("religion", ""))
            en.setdefault("source_ref", ru.get("source_ref", ""))
            en["quote"] = snippet
            if ru.get("description"):
                en.setdefault("description", ru["description"])
            loc["en"] = en
            matched += 1
        else:
            loc["en"] = _bootstrap_from_ru(ev)
            bootstrapped += 1
        # localized connection labels
        for c in ev.get("connections") or []:
            if not isinstance(c, dict):
                continue
            lab = c.get("label")
            if isinstance(lab, str):
                c["label"] = {"ru": lab, "en": lab}
            elif isinstance(lab, dict) and not lab.get("en"):
                lab["en"] = lab.get("ru") or ""
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return matched, bootstrapped


def load_vol_text(cache_dir: Path, vol: int) -> str:
    p = cache_dir / f"vol{vol}-fulltext.json"
    if not p.is_file():
        return ""
    with p.open(encoding="utf-8") as f:
        data = json.load(f)
    return data.get("text") or ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Align locales.en from EPUB cache")
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=REPO_ROOT / "data" / "en-epub",
    )
    parser.add_argument("--bootstrap-only", action="store_true", help="Copy RU→EN without search")
    args = parser.parse_args()

    vol_dirs = [REPO_ROOT / ".scratch" / "religion-map" / f"vol{i}" for i in (1, 2, 3)]
    total_m = total_b = 0
    for vol_dir in vol_dirs:
        vol = int(vol_dir.name.replace("vol", ""))
        text = "" if args.bootstrap_only else load_vol_text(args.cache_dir, vol)
        for path in sorted(vol_dir.glob("ch*-events.json")):
            m, b = align_chapter(path, text, args.bootstrap_only)
            if m or b:
                print(f"{path.name}: epub={m} bootstrap={b}")
            total_m += m
            total_b += b
    print(f"Done — epub matches {total_m}, bootstrap {total_b}")


if __name__ == "__main__":
    main()
