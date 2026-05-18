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


def test_parse_epub_fixture():
    out = REPO / "data" / "en-epub-test"
    out.mkdir(parents=True, exist_ok=True)
    proc = _run(
        str(SCRIPTS / "parse_epub.py"),
        "--inputs",
        str(FIXTURE_VOL),
        "--out-dir",
        str(out),
    )
    assert proc.returncode == 0, proc.stderr
    assert (out / "vol1-fulltext.json").is_file()


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
