#!/usr/bin/env python3
"""Propose reviewable graph connection opportunities from source relation evidence."""

from __future__ import annotations

import argparse
import json
import re
from itertools import combinations
from pathlib import Path

from normalize_relation_taxonomy import normalize_verb
from repo_paths import REPO_ROOT


def _shared_terms(a: list[str], b: list[str]) -> list[str]:
    generic = {"ancient", "christian", "religion", "religious", "history", "sacred"}
    return sorted({x for x in a if len(x) >= 6 and x not in generic} & {x for x in b if len(x) >= 6})


def _phrase_terms(text: str) -> set[str]:
    return {w.lower() for w in re.findall(r"[A-Za-z][A-Za-z'-]{5,}", text)}


def propose_connections(reconciliation: dict, min_score: int) -> list[dict]:
    records = [
        r
        for r in reconciliation.get("records", [])
        if r.get("source_match")
        and int(r["source_match"].get("score") or 0) >= min_score
        and r["source_match"].get("relation_evidence")
    ]
    proposals: list[dict] = []
    for left, right in combinations(records, 2):
        if left.get("concept_id") == right.get("concept_id"):
            continue
        shared = _shared_terms(left.get("terms") or [], right.get("terms") or [])
        phrase_overlap = (
            _phrase_terms(left["source_match"]["quote"]) & _phrase_terms(right["source_match"]["quote"])
        )
        if not shared and len(phrase_overlap) < 2:
            continue
        left_evidence = left["source_match"]["relation_evidence"][0]
        relation_type = normalize_verb(left_evidence.get("verb", "")) or "needs_taxonomy_review"
        proposals.append(
            {
                "source_concept_id": left["concept_id"],
                "target_concept_id": right["concept_id"],
                "relation_type": relation_type,
                "raw_verb": left_evidence.get("verb"),
                "confidence": min(left["source_match"]["score"], right["source_match"]["score"]),
                "shared_terms": shared,
                "phrase_overlap": sorted(phrase_overlap)[:10],
                "evidence": [
                    {
                        "concept_id": left["concept_id"],
                        "quote": left["source_match"]["quote"],
                        "provenance": left["source_match"]["provenance"],
                    },
                    {
                        "concept_id": right["concept_id"],
                        "quote": right["source_match"]["quote"],
                        "provenance": right["source_match"]["provenance"],
                    },
                ],
                "status": "review_required",
            }
        )
    proposals.sort(key=lambda item: (-item["confidence"], item["source_concept_id"], item["target_concept_id"]))
    return proposals


def main() -> None:
    parser = argparse.ArgumentParser(description="Propose graph connection review items")
    parser.add_argument(
        "--reconciliation",
        type=Path,
        default=REPO_ROOT / "data" / "source-kg" / "event-source-reconciliation.json",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=REPO_ROOT / "data" / "source-kg" / "connection-proposals.json",
    )
    parser.add_argument("--min-score", type=int, default=8)
    args = parser.parse_args()

    with args.reconciliation.open(encoding="utf-8") as f:
        reconciliation = json.load(f)
    proposals = propose_connections(reconciliation, args.min_score)
    out = {
        "schema_version": 1,
        "status": "review_required",
        "summary": {"proposals": len(proposals), "min_score": args.min_score},
        "proposals": proposals,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(json.dumps(out["summary"], ensure_ascii=False, indent=2))
    print(f"Output: {args.out}")


if __name__ == "__main__":
    main()
