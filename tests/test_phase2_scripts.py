"""Phase 2 data pipeline smoke tests."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[1]
FIXTURE_VOL = REPO / "tests" / "fixtures" / "phase2"
SCRIPTS = REPO / "scripts"


def _run(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, *args],
        cwd=REPO,
        capture_output=True,
        text=True,
        check=False,
    )


def test_locale_schema_en_complete():
    sys.path.insert(0, str(SCRIPTS))
    from locale_schema import en_is_complete

    complete = {
        "locales": {
            "ru": {"statement": "ru", "quote": "q"},
            "en": {"statement": "en", "quote": "q", "source_ref": "ref"},
        }
    }
    incomplete = {
        "locales": {
            "ru": {"statement": "ru", "quote": "q"},
            "en": {},
        }
    }
    assert en_is_complete(complete)
    assert not en_is_complete(incomplete)


def test_locale_schema_backfills_partial_locale_from_legacy_fields():
    sys.path.insert(0, str(SCRIPTS))
    from locale_schema import ensure_locales_shape

    event = {
        "event_name": "Legacy name",
        "event_description": "Legacy description",
        "locales": {
            "ru": {"precise_location": "Legacy place"},
            "en": {},
        },
    }
    shaped = ensure_locales_shape(event)
    assert shaped["locales"]["ru"]["name"] == "Legacy name"
    assert shaped["locales"]["ru"]["description"] == "Legacy description"
    assert shaped["locales"]["ru"]["precise_location"] == "Legacy place"


def test_compile_normalizes_legacy_id_fields():
    sys.path.insert(0, str(SCRIPTS))
    from compile_events import normalize_event

    assert normalize_event({"id": "legacy-id"})["concept_id"] == "legacy-id"
    assert normalize_event({"event_id": "legacy-event-id"})["concept_id"] == "legacy-event-id"


def test_parse_epub_fixture():
    out = REPO / "data" / "en-epub-test"
    source_cache = REPO / "data" / "source-cache-test"
    out.mkdir(parents=True, exist_ok=True)
    proc = _run(
        str(SCRIPTS / "parse_epub.py"),
        "--inputs",
        str(FIXTURE_VOL),
        "--out-dir",
        str(out),
        "--source-cache-dir",
        str(source_cache),
    )
    assert proc.returncode == 0, proc.stderr
    assert (out / "vol1-fulltext.json").is_file()
    en_cache = json.loads((source_cache / "en" / "vol1-source.json").read_text(encoding="utf-8"))
    assert en_cache["language"] == "en"
    assert en_cache["sections"]


def test_parse_epub_inventory_reports_missing_sources(tmp_path: Path):
    proc = _run(
        str(SCRIPTS / "parse_epub.py"),
        "--inputs",
        str(tmp_path),
        "--inventory",
    )
    assert proc.returncode == 2
    data = json.loads(proc.stdout)
    assert not data["complete"]
    assert all(not v["present"] for v in data["languages"]["en"]["volumes"])
    assert all(not v["present"] for v in data["languages"]["ru"]["volumes"])


def test_parse_epub_russian_fb2_cache(tmp_path: Path):
    fixture = tmp_path / "inputs"
    fixture.mkdir()
    (fixture / "01_fixture.fb2").write_text(
        """<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
  <body>
    <section>
      <title><p>Глава первая</p></title>
      <p>Русский источник описывает переход идеи.</p>
    </section>
  </body>
</FictionBook>
""",
        encoding="utf-8",
    )
    out = tmp_path / "en"
    source_cache = tmp_path / "source-cache"
    proc = _run(
        str(SCRIPTS / "parse_epub.py"),
        "--inputs",
        str(fixture),
        "--out-dir",
        str(out),
        "--source-cache-dir",
        str(source_cache),
    )
    assert proc.returncode == 0, proc.stderr
    ru_cache = json.loads((source_cache / "ru" / "vol1-source.json").read_text(encoding="utf-8"))
    assert ru_cache["language"] == "ru"
    assert ru_cache["source"]["format"] == "fb2"
    assert "переход идеи" in ru_cache["text"]


def test_extract_idea_graph_candidates(tmp_path: Path):
    cache_dir = tmp_path / "source-cache" / "en"
    cache_dir.mkdir(parents=True)
    cache = {
        "schema_version": 1,
        "language": "en",
        "volume": 1,
        "source": {"name": "fixture.epub", "sha256": "fixture"},
        "char_count": 260,
        "sections": [
            {
                "id": "fixture:section",
                "label": "Fixture section",
                "char_start": 0,
                "char_end": 260,
                "text": (
                    "The myth of cosmic sacrifice appears in this tradition as a sacred pattern "
                    "that later transforms older ritual ideas. "
                    "A separate belief in the soul resembles another doctrine but develops in parallel."
                ),
            }
        ],
    }
    (cache_dir / "vol1-source.json").write_text(json.dumps(cache), encoding="utf-8")
    out = tmp_path / "kg.json"
    proc = _run(
        str(SCRIPTS / "extract_idea_graph.py"),
        "--source-cache-dir",
        str(tmp_path / "source-cache"),
        "--out",
        str(out),
    )
    assert proc.returncode == 0, proc.stderr
    graph = json.loads(out.read_text(encoding="utf-8"))
    assert graph["ideas"]
    assert graph["assertions"]
    verbs = {item["verb"] for item in graph["verb_inventory"]}
    assert {"appears", "transforms", "resembles"} <= verbs
    assertion = graph["assertions"][0]
    assert assertion["provenance"]["language"] == "en"
    assert assertion["quote"] == assertion["statement"]


def test_normalize_relation_taxonomy(tmp_path: Path):
    graph = {
        "schema_version": 1,
        "assertions": [
            {
                "assertion_id": "a1",
                "relation_evidence": [
                    {"verb": "borrowed", "phrase": "this belief was borrowed"},
                    {"verb": "transformed", "phrase": "the myth was transformed"},
                    {"verb": "resembles", "phrase": "the ritual resembles another"},
                ],
            }
        ],
    }
    graph_path = tmp_path / "graph.json"
    out = tmp_path / "taxonomy.json"
    graph_path.write_text(json.dumps(graph), encoding="utf-8")
    proc = _run(
        str(SCRIPTS / "normalize_relation_taxonomy.py"),
        "--graph",
        str(graph_path),
        "--out",
        str(out),
    )
    assert proc.returncode == 0, proc.stderr
    taxonomy = json.loads(out.read_text(encoding="utf-8"))
    counts = {item["id"]: item["count"] for item in taxonomy["relation_types"]}
    assert counts["adoption_borrowing"] == 1
    assert counts["transformation_reinterpretation"] == 1
    assert counts["parallel_similarity"] == 1
    evidence = taxonomy["graph"]["assertions"][0]["relation_evidence"]
    assert {item["relation_type"] for item in evidence} == {
        "adoption_borrowing",
        "transformation_reinterpretation",
        "parallel_similarity",
    }


def test_reconcile_source_graph_best_match():
    sys.path.insert(0, str(SCRIPTS))
    from reconcile_source_graph import best_source_match

    event = {"concept_id": "cosmic-sacrifice", "volume": 1}
    cache = {
        "volume": 1,
        "source": {"name": "fixture.epub"},
        "sections": [
            {
                "id": "s1",
                "label": "Section",
                "char_start": 10,
                "text": (
                    "The myth of cosmic sacrifice appears in the ritual system and later "
                    "transforms ideas about creation."
                ),
            }
        ],
    }
    match = best_source_match(event, cache, min_score=4)
    assert match is not None
    assert match["provenance"]["char_start"] == 10
    assert "cosmic sacrifice" in match["quote"]
    assert {item["verb"] for item in match["relation_evidence"]} >= {"appears", "transforms"}


def test_reconcile_apply_en_matches(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    sys.path.insert(0, str(SCRIPTS))
    import reconcile_source_graph

    root = tmp_path
    vol = root / ".scratch" / "religion-map" / "vol1"
    vol.mkdir(parents=True)
    chapter = {
        "events": [
            {
                "concept_id": "cosmic-sacrifice",
                "locales": {"ru": {"statement": "ru"}, "en": {}},
            }
        ]
    }
    (vol / "ch01-events.json").write_text(json.dumps(chapter), encoding="utf-8")
    monkeypatch.setattr(reconcile_source_graph, "REPO_ROOT", root)
    applied = reconcile_source_graph.apply_en_matches(
        [
            {
                "concept_id": "cosmic-sacrifice",
                "needs": ["en_display"],
                "source_match": {
                    "score": 9,
                    "quote": "The myth of cosmic sacrifice appears in ritual.",
                    "relation_evidence": [{"verb": "appears"}],
                    "provenance": {
                        "volume": 1,
                        "section_label": "Section",
                        "language": "en",
                        "source": "fixture.epub",
                        "char_start": 1,
                        "char_end": 47,
                    },
                },
            }
        ],
        min_apply_score=8,
    )
    assert applied == 1
    updated = json.loads((vol / "ch01-events.json").read_text(encoding="utf-8"))
    en = updated["events"][0]["locales"]["en"]
    assert en["quote"] == "The myth of cosmic sacrifice appears in ritual."
    assert en["_source"]["method"] == "source_reconciliation"


def test_propose_graph_connections_from_relation_evidence():
    sys.path.insert(0, str(SCRIPTS))
    from propose_graph_connections import propose_connections

    reconciliation = {
        "records": [
            {
                "concept_id": "cosmic-sacrifice",
                "terms": ["cosmic", "sacrifice"],
                "source_match": {
                    "score": 9,
                    "quote": "The cosmic sacrifice appears in ritual.",
                    "relation_evidence": [{"verb": "appears"}],
                    "provenance": {"volume": 1},
                },
            },
            {
                "concept_id": "ritual-sacrifice",
                "terms": ["ritual", "sacrifice"],
                "source_match": {
                    "score": 8,
                    "quote": "The ritual sacrifice is transformed in another cult.",
                    "relation_evidence": [{"verb": "transformed"}],
                    "provenance": {"volume": 1},
                },
            },
        ]
    }
    proposals = propose_connections(reconciliation, min_score=8)
    assert len(proposals) == 1
    assert proposals[0]["relation_type"] == "first_attestation"
    assert proposals[0]["shared_terms"] == ["sacrifice"]


def test_compile_strict_en_fails_on_incomplete_fixture(tmp_path: Path):
    vol = tmp_path / "vol99"
    vol.mkdir()
    src = REPO / "tests" / "fixtures" / "phase2-strict-fail" / "ch99b-events.json"
    (vol / "ch99b-events.json").write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
    out = tmp_path / "events.json"
    overlay = tmp_path / "overlay.json"
    overlay.write_text(json.dumps({"by_concept_id": {}}), encoding="utf-8")
    proc = _run(
        str(SCRIPTS / "compile_events.py"),
        "--strict-en",
        "--vol-dirs",
        str(vol),
        "--overlay",
        str(overlay),
        "--out",
        str(out),
    )
    assert proc.returncode != 0


def test_export_issues_fixture(tmp_path: Path):
    out = tmp_path / "issues-review.json"
    overlay = FIXTURE_VOL / "event-overlays.json"
    events = REPO / "app" / "src" / "data" / "events.json"
    if not events.is_file():
        pytest.skip("events.json missing — run compile_events.py first")
    proc = _run(
        str(SCRIPTS / "export_issues_for_review.py"),
        "--overlay",
        str(overlay),
        "--events",
        str(events),
        "--out",
        str(out),
    )
    assert proc.returncode == 0, proc.stderr
    data = json.loads(out.read_text(encoding="utf-8"))
    assert any(r.get("concept_id") == "phase2-en-complete" for r in data.get("records", []))
