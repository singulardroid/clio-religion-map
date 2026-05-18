#!/usr/bin/env python3
"""Normalize extracted relation verbs into a compact review taxonomy."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

SEED_TAXONOMY = {
    "first_attestation": {
        "description": "The text presents an idea as appearing, emerging, arising, or being attested.",
        "verbs": {"appear", "appears", "appeared", "emerge", "emerges", "emerged", "arise", "arises", "arose", "is attested", "are attested"},
    },
    "derivation": {
        "description": "The text says an idea comes from, originates in, or is derived from another.",
        "verbs": {"derive", "derives", "derived", "come from", "comes from", "came from", "originate", "originates", "originated"},
    },
    "inheritance_preservation": {
        "description": "The text marks continuity, inheritance, preservation, or survival.",
        "verbs": {"inherit", "inherits", "inherited", "preserve", "preserves", "preserved", "survive", "survives", "survived"},
    },
    "adoption_borrowing": {
        "description": "The text marks borrowing, adoption, reception, or taking over from another context.",
        "verbs": {"borrow", "borrows", "borrowed", "adopt", "adopts", "adopted", "receive", "receives", "received"},
    },
    "influence_transmission": {
        "description": "The text marks influence, inspiration, transmission, or diffusion.",
        "verbs": {"influence", "influences", "influenced", "inspire", "inspires", "inspired", "transmit", "transmits", "transmitted", "diffuse", "diffuses", "diffused"},
    },
    "transformation_reinterpretation": {
        "description": "The text marks transformation, reinterpretation, revaluation, or changed meaning.",
        "verbs": {"transform", "transforms", "transformed", "reinterpret", "reinterprets", "reinterpreted", "revalue", "revalues", "revalued"},
    },
    "assimilation_integration": {
        "description": "The text marks assimilation, absorption, or integration into another system.",
        "verbs": {"assimilate", "assimilates", "assimilated", "absorb", "absorbs", "absorbed", "integrate", "integrates", "integrated"},
    },
    "identification_equivalence": {
        "description": "The text identifies, equates, links, or connects ideas.",
        "verbs": {"identify", "identifies", "identified", "equate", "equates", "equated", "connect", "connects", "connected", "link", "links", "linked"},
    },
    "parallel_similarity": {
        "description": "The text marks resemblance, correspondence, analogy, or parallel development without clear derivation.",
        "verbs": {"parallel", "parallels", "resemble", "resembles", "correspond", "corresponds", "similar to", "analogous to"},
    },
    "contrast_replacement": {
        "description": "The text marks contrast, opposition, substitution, or replacement.",
        "verbs": {"contrast", "contrasts", "oppose", "opposes", "replace", "replaces", "replaced", "substitute", "substitutes", "substituted"},
    },
}


def _lemma_candidates(verb: str) -> set[str]:
    v = verb.lower().strip()
    candidates = {v}
    for suffix in ("ing", "ed", "es", "s"):
        if v.endswith(suffix) and len(v) > len(suffix) + 2:
            candidates.add(v[: -len(suffix)])
    if v.endswith("ied"):
        candidates.add(v[:-3] + "y")
    return candidates


def normalize_verb(verb: str) -> str | None:
    candidates = _lemma_candidates(verb)
    for relation_type, spec in SEED_TAXONOMY.items():
        if candidates & spec["verbs"]:
            return relation_type
    return None


def load_graph(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def normalize_graph(graph: dict) -> dict:
    counts: Counter[str] = Counter()
    unmapped: Counter[str] = Counter()
    examples: dict[str, list[dict[str, str]]] = {key: [] for key in SEED_TAXONOMY}

    for assertion in graph.get("assertions") or []:
        for evidence in assertion.get("relation_evidence") or []:
            verb = str(evidence.get("verb") or "").lower().strip()
            if not verb:
                continue
            relation_type = normalize_verb(verb)
            if relation_type:
                evidence["relation_type"] = relation_type
                counts[relation_type] += 1
                if len(examples[relation_type]) < 5:
                    examples[relation_type].append(
                        {
                            "verb": verb,
                            "phrase": re.sub(r"\s+", " ", str(evidence.get("phrase") or "")).strip(),
                            "assertion_id": assertion.get("assertion_id", ""),
                        }
                    )
            else:
                evidence["relation_type"] = "needs_taxonomy_review"
                unmapped[verb] += 1

    return {
        "schema_version": 1,
        "taxonomy_status": "seeded_from_observed_verbs",
        "relation_types": [
            {
                "id": relation_type,
                "description": spec["description"],
                "count": counts[relation_type],
                "examples": examples[relation_type],
            }
            for relation_type, spec in SEED_TAXONOMY.items()
        ],
        "unmapped_verbs": [
            {"verb": verb, "count": count} for verb, count in unmapped.most_common()
        ],
        "graph": graph,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize relation verbs into taxonomy candidates")
    parser.add_argument(
        "--graph",
        type=Path,
        default=REPO_ROOT / "data" / "source-kg" / "idea-graph-candidates.json",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=REPO_ROOT / "data" / "source-kg" / "idea-graph-taxonomy.json",
    )
    args = parser.parse_args()

    graph = load_graph(args.graph)
    normalized = normalize_graph(graph)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(normalized, f, ensure_ascii=False, indent=2)
        f.write("\n")
    relation_total = sum(item["count"] for item in normalized["relation_types"])
    print(
        f"Normalized {relation_total} relation evidence item(s); "
        f"{len(normalized['unmapped_verbs'])} verb(s) need review"
    )
    print(f"Output: {args.out}")


if __name__ == "__main__":
    main()
