#!/usr/bin/env python3
"""Extract candidate ideas, assertions, and relation verbs from English source caches."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

IDEA_TERMS = (
    "idea",
    "belief",
    "myth",
    "mythology",
    "ritual",
    "cult",
    "sacrifice",
    "god",
    "goddess",
    "divinity",
    "soul",
    "spirit",
    "immortality",
    "afterlife",
    "creation",
    "cosmos",
    "cosmogony",
    "initiation",
    "shaman",
    "ancestor",
    "rebirth",
    "salvation",
    "liberation",
    "mystery",
    "symbol",
    "sacred",
    "profane",
)

RELATION_PATTERNS = (
    r"\b(?:appears?|appeared|emerges?|emerged|arises?|arose|is attested|are attested)\b",
    r"\b(?:derives?|derived|comes from|came from|originates?|originated)\b",
    r"\b(?:inherits?|inherited|preserves?|preserved|survives?|survived)\b",
    r"\b(?:borrows?|borrowed|adopts?|adopted|receives?|received)\b",
    r"\b(?:influences?|influenced|inspired|transmitted|diffused)\b",
    r"\b(?:transforms?|transformed|reinterpret(?:s|ed)?|revalues?|revalued)\b",
    r"\b(?:assimilates?|assimilated|absorbs?|absorbed|integrates?|integrated)\b",
    r"\b(?:identifies?|identified|equates?|equated|connects?|connected|links?|linked)\b",
    r"\b(?:parallels?|resembles?|corresponds?|similar to|analogous to)\b",
    r"\b(?:contrasts?|opposes?|replaces?|replaced|substitutes?|substituted)\b",
)

RUNNING_TITLES = (
    "A History of Religious Ideas, Volume 1: From the Stone Age to the Eleusinian Mysteries",
    "A History of Religious Ideas, Volume 2: From Gautama Buddha to the Triumph of Christianity",
    "A History of Religious Ideas, Volume 3: From Muhammad to the Age of Reforms",
)


def _slug(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:80] or "idea"


def _clean(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    for title in RUNNING_TITLES:
        text = text.replace(title, "").strip()
    return text


def _is_noise_sentence(sentence: str) -> bool:
    lowered = sentence.lower()
    if not sentence:
        return True
    if lowered.startswith(("contents ", "preface ", "bibliography ", "index ")):
        return True
    if " all rights reserved" in lowered or "university of chicago press" in lowered:
        return True
    if len(re.findall(r"\b\d{1,3}\.", sentence)) >= 4:
        return True
    words = re.findall(r"[A-Za-z][A-Za-z'-]*", sentence)
    if words and sum(1 for word in words if word[:1].isupper()) / len(words) > 0.75:
        return True
    return False


def _iter_sentences(text: str):
    start = 0
    for match in re.finditer(r"(?<=[.!?])\s+(?=[A-Z\"'])", text):
        end = match.start()
        sentence = _clean(text[start:end])
        if sentence:
            yield start, end, sentence
        start = match.end()
    tail = _clean(text[start:])
    if tail:
        yield start, len(text), tail


def _idea_label(sentence: str) -> str | None:
    lowered = sentence.lower()
    hits = [term for term in IDEA_TERMS if re.search(rf"\b{re.escape(term)}\b", lowered)]
    if not hits:
        return None
    term = hits[0]
    words = re.findall(r"[A-Za-z][A-Za-z'-]*", sentence)
    for idx, word in enumerate(words):
        if word.lower() == term:
            left = max(0, idx - 3)
            right = min(len(words), idx + 4)
            return " ".join(words[left:right]).lower()
    return term


def _relation_evidence(sentence: str) -> list[dict[str, str]]:
    evidence: list[dict[str, str]] = []
    for pattern in RELATION_PATTERNS:
        for match in re.finditer(pattern, sentence, flags=re.IGNORECASE):
            start = max(0, match.start() - 80)
            end = min(len(sentence), match.end() + 120)
            evidence.append(
                {
                    "verb": match.group(0).lower(),
                    "phrase": _clean(sentence[start:end]),
                }
            )
    return evidence


def load_english_caches(source_cache_dir: Path) -> list[dict]:
    paths = sorted((source_cache_dir / "en").glob("vol*-source.json"))
    caches = []
    for path in paths:
        with path.open(encoding="utf-8") as f:
            cache = json.load(f)
        if cache.get("language") == "en":
            caches.append(cache)
    return caches


def extract_candidates(caches: list[dict], max_assertions: int | None = None) -> dict:
    ideas: dict[str, dict] = {}
    assertions: list[dict] = []
    verb_counts: Counter[str] = Counter()
    idea_assertions: defaultdict[str, list[str]] = defaultdict(list)

    for cache in caches:
        volume = cache["volume"]
        for section in cache.get("sections") or []:
            section_text = section.get("text") or ""
            section_start = int(section.get("char_start") or 0)
            for rel_start, rel_end, sentence in _iter_sentences(section_text):
                if len(sentence) < 80 or len(sentence) > 700:
                    continue
                if _is_noise_sentence(sentence):
                    continue
                label = _idea_label(sentence)
                if not label:
                    continue
                relation_evidence = _relation_evidence(sentence)
                if not relation_evidence and len(assertions) >= 100:
                    # Prefer relation-bearing candidates once the general sample is populated.
                    continue

                idea_id = f"idea-{_slug(label)}"
                assertion_id = f"assertion-v{volume}-{len(assertions) + 1:05d}"
                ideas.setdefault(
                    idea_id,
                    {
                        "idea_id": idea_id,
                        "label": label,
                        "source_language": "en",
                        "support_count": 0,
                    },
                )
                ideas[idea_id]["support_count"] += 1
                idea_assertions[idea_id].append(assertion_id)

                for ev in relation_evidence:
                    verb_counts[ev["verb"]] += 1

                assertions.append(
                    {
                        "assertion_id": assertion_id,
                        "idea_id": idea_id,
                        "statement": sentence,
                        "quote": sentence,
                        "relation_evidence": relation_evidence,
                        "provenance": {
                            "language": "en",
                            "volume": volume,
                            "source": cache["source"]["name"],
                            "section_id": section.get("id"),
                            "section_label": section.get("label"),
                            "char_start": section_start + rel_start,
                            "char_end": section_start + rel_end,
                        },
                        "status": "candidate",
                    }
                )
                if max_assertions and len(assertions) >= max_assertions:
                    return _build_output(caches, ideas, idea_assertions, assertions, verb_counts)

    return _build_output(caches, ideas, idea_assertions, assertions, verb_counts)


def _build_output(
    caches: list[dict],
    ideas: dict[str, dict],
    idea_assertions: defaultdict[str, list[str]],
    assertions: list[dict],
    verb_counts: Counter[str],
) -> dict:
    idea_list = []
    for idea in sorted(ideas.values(), key=lambda item: (-item["support_count"], item["idea_id"])):
        idea_list.append({**idea, "assertion_ids": idea_assertions[idea["idea_id"]]})
    return {
        "schema_version": 1,
        "status": "candidate",
        "source_policy": "English source text is canonical; every accepted assertion requires quote provenance.",
        "source_volumes": [
            {
                "language": cache["language"],
                "volume": cache["volume"],
                "source": cache["source"]["name"],
                "sha256": cache["source"]["sha256"],
                "char_count": cache["char_count"],
            }
            for cache in caches
        ],
        "ideas": idea_list,
        "assertions": assertions,
        "verb_inventory": [
            {"verb": verb, "count": count} for verb, count in verb_counts.most_common()
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract candidate source-grounded idea graph")
    parser.add_argument(
        "--source-cache-dir",
        type=Path,
        default=REPO_ROOT / "data" / "source-cache",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=REPO_ROOT / "data" / "source-kg" / "idea-graph-candidates.json",
    )
    parser.add_argument("--max-assertions", type=int, default=None)
    args = parser.parse_args()

    caches = load_english_caches(args.source_cache_dir)
    if not caches:
        print(f"ERROR: no English source caches found in {args.source_cache_dir / 'en'}", file=sys.stderr)
        sys.exit(2)

    graph = extract_candidates(caches, args.max_assertions)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(graph, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(
        f"Extracted {len(graph['ideas'])} idea candidate(s), "
        f"{len(graph['assertions'])} assertion candidate(s), "
        f"{len(graph['verb_inventory'])} relation verb(s)"
    )
    print(f"Output: {args.out}")


if __name__ == "__main__":
    main()
