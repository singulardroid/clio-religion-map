#!/usr/bin/env python3
"""Match existing event IDs against English source-cache assertions for review."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from compile_events import compile_events, load_chapter_files, load_overlay
from extract_idea_graph import _iter_sentences, _relation_evidence
from locale_schema import locale_block
from repo_paths import REPO_ROOT


def _terms_for_event(event: dict) -> list[str]:
    terms: list[str] = []
    for key in ("concept_id", "concept", "event_name", "name"):
        value = event.get(key)
        if isinstance(value, str):
            terms.extend(re.findall(r"[A-Za-z][A-Za-z'-]{3,}", value.replace("-", " ")))
    for code in ("en", "ru"):
        block = locale_block(event, code)
        for key in ("name", "statement", "description", "religion", "precise_location"):
            value = block.get(key)
            if isinstance(value, str):
                terms.extend(re.findall(r"[A-Za-z][A-Za-z'-]{3,}", value.replace("-", " ")))
    seen: set[str] = set()
    out: list[str] = []
    for term in terms:
        low = term.lower()
        if low in seen or low in {"religion", "religious", "history", "idea", "ideas"}:
            continue
        seen.add(low)
        out.append(low)
    return out[:12]


def _distinctive_terms(terms: list[str]) -> list[str]:
    generic = {
        "ancient",
        "christian",
        "christianity",
        "council",
        "cult",
        "divine",
        "doctrine",
        "event",
        "god",
        "gods",
        "great",
        "history",
        "idea",
        "ideas",
        "king",
        "literature",
        "myth",
        "mythology",
        "religion",
        "religious",
        "ritual",
        "sacred",
        "saint",
        "spirit",
        "temple",
        "theology",
    }
    return [term for term in terms if len(term) >= 6 and term not in generic]


def _score_sentence(sentence: str, terms: list[str]) -> int:
    lowered = sentence.lower()
    score = 0
    for term in terms:
        if re.search(rf"\b{re.escape(term)}\b", lowered):
            score += 3 if len(term) > 6 else 1
    if _relation_evidence(sentence):
        score += 2
    return score


def _load_source_cache(cache_dir: Path, volume: int) -> dict | None:
    path = cache_dir / "en" / f"vol{volume}-source.json"
    if not path.is_file():
        return None
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def index_source_sentences(cache: dict) -> list[dict]:
    sentences: list[dict] = []
    for section in cache.get("sections") or []:
        section_text = section.get("text") or ""
        section_start = int(section.get("char_start") or 0)
        for rel_start, rel_end, sentence in _iter_sentences(section_text):
            if len(sentence) < 60 or len(sentence) > 800:
                continue
            sentences.append(
                {
                    "sentence": sentence,
                    "lower": sentence.lower(),
                    "section": section,
                    "char_start": section_start + rel_start,
                    "char_end": section_start + rel_end,
                    "relation_evidence": _relation_evidence(sentence),
                }
            )
    return sentences


def best_source_match(event: dict, cache_or_sentences: dict | list[dict], min_score: int) -> dict | None:
    terms = _terms_for_event(event)
    if not terms:
        return None
    distinctive = _distinctive_terms(terms)
    if isinstance(cache_or_sentences, dict):
        cache = cache_or_sentences
        sentences = index_source_sentences(cache)
        volume = cache["volume"]
        source = cache["source"]["name"]
    else:
        sentences = cache_or_sentences
        volume = event.get("volume")
        source = ""
    best: dict | None = None
    for indexed in sentences:
        sentence = indexed["sentence"]
        lowered = indexed["lower"]
        if not any(term in lowered for term in terms):
            continue
        score = _score_sentence(sentence, terms)
        if score < min_score:
            continue
        distinctive_hits = [term for term in distinctive if re.search(rf"\b{re.escape(term)}\b", lowered)]
        if distinctive and len(distinctive_hits) < min(2, len(distinctive)):
            continue
        section = indexed["section"]
        candidate = {
            "score": score,
            "matched_terms": [term for term in terms if term in lowered],
            "distinctive_terms": distinctive,
            "distinctive_hits": distinctive_hits,
            "quote": sentence,
            "relation_evidence": indexed["relation_evidence"],
            "provenance": {
                "language": "en",
                "volume": volume,
                "source": source,
                "section_id": section.get("id"),
                "section_label": section.get("label"),
                "char_start": indexed["char_start"],
                "char_end": indexed["char_end"],
            },
        }
        if best is None or candidate["score"] > best["score"]:
            best = candidate
    return best


def event_status(event: dict) -> dict[str, bool]:
    ru = locale_block(event, "ru")
    en = locale_block(event, "en")
    return {
        "ru_display": any((ru.get(k) or "").strip() for k in ("statement", "description", "quote")),
        "en_display": any((en.get(k) or "").strip() for k in ("statement", "description", "quote")),
        "en_quote": bool((en.get("quote") or "").strip()),
    }


def apply_en_matches(records: list[dict], min_apply_score: int) -> int:
    by_id = {
        record["concept_id"]: record
        for record in records
        if record.get("concept_id")
        and "en_display" in record.get("needs", [])
        and record.get("source_match")
        and int(record["source_match"].get("score") or 0) >= min_apply_score
    }
    applied = 0
    for vol_dir in [REPO_ROOT / ".scratch" / "religion-map" / f"vol{i}" for i in (1, 2, 3)]:
        for path in sorted(vol_dir.glob("ch*-events.json")):
            with path.open(encoding="utf-8") as f:
                chapter = json.load(f)
            changed = False
            for event in chapter.get("events") or []:
                cid = event.get("concept_id") or event.get("concept") or event.get("id") or event.get("event_id")
                record = by_id.get(cid)
                if not record:
                    continue
                match = record["source_match"]
                loc = event.setdefault("locales", {})
                en = loc.setdefault("en", {})
                if not isinstance(en, dict):
                    en = {}
                    loc["en"] = en
                if en.get("statement") or en.get("quote"):
                    continue
                quote = match["quote"]
                en["statement"] = quote
                en["quote"] = quote
                en["source_ref"] = f"Eliade vol.{match['provenance']['volume']} ({match['provenance']['section_label']})"
                en["_source"] = {
                    "method": "source_reconciliation",
                    "confidence": match["score"],
                    **match["provenance"],
                }
                if match.get("relation_evidence"):
                    en["_relation_evidence"] = match["relation_evidence"]
                changed = True
                applied += 1
            if changed:
                with path.open("w", encoding="utf-8") as f:
                    json.dump(chapter, f, ensure_ascii=False, indent=2)
                    f.write("\n")
    return applied


def main() -> None:
    parser = argparse.ArgumentParser(description="Reconcile existing events with English source cache")
    parser.add_argument(
        "--source-cache-dir",
        type=Path,
        default=REPO_ROOT / "data" / "source-cache",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=REPO_ROOT / "data" / "source-kg" / "event-source-reconciliation.json",
    )
    parser.add_argument("--min-score", type=int, default=6)
    parser.add_argument(
        "--apply-en-display",
        action="store_true",
        help="Write high-confidence English source matches into chapter locales.en",
    )
    parser.add_argument("--min-apply-score", type=int, default=9)
    args = parser.parse_args()

    vol_dirs = [str(REPO_ROOT / ".scratch" / "religion-map" / f"vol{i}") for i in (1, 2, 3)]
    events = compile_events(load_chapter_files(vol_dirs), load_overlay(REPO_ROOT / "data" / "editorial" / "event-overlays.json"))
    indexes: dict[int, list[dict]] = {}
    records = []
    for event in events:
        volume = int(event.get("volume") or 0)
        if volume not in indexes:
            cache = _load_source_cache(args.source_cache_dir, volume)
            if cache:
                indexed = index_source_sentences(cache)
                for sentence in indexed:
                    sentence["volume"] = cache["volume"]
                    sentence["source"] = cache["source"]["name"]
                indexes[volume] = indexed
        status = event_status(event)
        match = best_source_match(event, indexes[volume], args.min_score) if volume in indexes else None
        if match and not match["provenance"]["source"]:
            match["provenance"]["source"] = indexes[volume][0].get("source", "")
            match["provenance"]["volume"] = indexes[volume][0].get("volume", volume)
        records.append(
            {
                "concept_id": event.get("concept_id"),
                "volume": volume,
                "chapter_num": event.get("chapter_num"),
                "status": status,
                "needs": [
                    key
                    for key, ok in (
                        ("ru_display", status["ru_display"]),
                        ("en_display", status["en_display"]),
                        ("en_quote", status["en_quote"]),
                    )
                    if not ok
                ],
                "terms": _terms_for_event(event),
                "source_match": match,
            }
        )

    summary = {
        "events": len(records),
        "matched": sum(1 for r in records if r["source_match"]),
        "needs_ru_display": sum(1 for r in records if "ru_display" in r["needs"]),
        "needs_en_display": sum(1 for r in records if "en_display" in r["needs"]),
        "needs_en_quote": sum(1 for r in records if "en_quote" in r["needs"]),
        "relation_evidence_records": sum(
            1 for r in records if (r.get("source_match") or {}).get("relation_evidence")
        ),
    }
    out = {"schema_version": 1, "summary": summary, "records": records}
    if args.apply_en_display:
        summary["applied_en_display"] = apply_en_matches(records, args.min_apply_score)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"Output: {args.out}")


if __name__ == "__main__":
    main()
