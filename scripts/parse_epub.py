#!/usr/bin/env python3
"""Inventory and cache source books for source-grounded extraction."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

VOL_EPUB_NAMES = {
    1: "A History of Religious Ideas, Volume 1 - Eliade, Mircea.epub",
    2: "A History of Religious Ideas, Volume 2 - Eliade, Mircea.epub",
    3: "A History of Religious Ideas, Volume 3 - Eliade, Mircea.epub",
}

RU_SOURCE_PATTERNS = {
    1: ["01_*.fb2", "*Том_1*.fb2", "*Volume 1*.fb2", "*Volume 1*.epub"],
    2: ["02_*.fb2", "*Том_2*.fb2", "*Volume 2*.fb2", "*Volume 2*.epub"],
    3: ["03_*.fb2", "*Том_3*.fb2", "*Volume 3*.fb2", "*Volume 3*.epub"],
}

LANGUAGE_NAMES = {"en": "English", "ru": "Russian"}


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        t = data.strip()
        if t:
            self.parts.append(t)

    def text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


def epub_to_text(epub_path: Path) -> str:
    return _combine_sections(epub_sections(epub_path))[0]


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _combine_sections(sections: list[dict[str, object]]) -> tuple[str, list[dict[str, object]]]:
    text_parts: list[str] = []
    offset = 0
    indexed: list[dict[str, object]] = []
    for section in sections:
        section_text = str(section["text"])
        if not section_text:
            continue
        if text_parts:
            text_parts.append("\n\n")
            offset += 2
        start = offset
        text_parts.append(section_text)
        offset += len(section_text)
        indexed.append({**section, "char_start": start, "char_end": offset})
    return "".join(text_parts), indexed


def epub_sections(epub_path: Path) -> list[dict[str, object]]:
    sections: list[dict[str, object]] = []
    with zipfile.ZipFile(epub_path) as zf:
        names = sorted(
            n
            for n in zf.namelist()
            if n.lower().endswith((".xhtml", ".html", ".htm"))
            and "nav" not in n.lower()
        )
        for name in names:
            raw = zf.read(name).decode("utf-8", errors="ignore")
            parser = _TextExtractor()
            parser.feed(raw)
            txt = parser.text()
            if txt:
                sections.append(
                    {
                        "id": f"epub:{name}",
                        "label": name,
                        "text": txt,
                    }
                )
    return sections


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def fb2_sections(fb2_path: Path) -> list[dict[str, object]]:
    tree = ElementTree.parse(fb2_path)
    root = tree.getroot()
    sections: list[dict[str, object]] = []
    for body in root.iter():
        if _local_name(body.tag) != "body":
            continue
        for idx, child in enumerate(list(body), start=1):
            if _local_name(child.tag) != "section":
                continue
            text = _normalize_text(" ".join(t for t in child.itertext() if t.strip()))
            if not text:
                continue
            title_parts = [
                _normalize_text(" ".join(t for t in title.itertext() if t.strip()))
                for title in child
                if _local_name(title.tag) == "title"
            ]
            sections.append(
                {
                    "id": f"fb2:section:{idx}",
                    "label": title_parts[0] if title_parts else f"Section {idx}",
                    "text": text,
                }
            )
    if sections:
        return sections

    text = _normalize_text(" ".join(t for t in root.itertext() if t.strip()))
    return [{"id": "fb2:fulltext", "label": fb2_path.name, "text": text}] if text else []


def source_to_cache(source_path: Path, language: str, volume: int) -> dict[str, object]:
    suffix = source_path.suffix.lower()
    if suffix == ".epub":
        sections = epub_sections(source_path)
        source_format = "epub"
    elif suffix == ".fb2":
        sections = fb2_sections(source_path)
        source_format = "fb2"
    else:
        raise ValueError(f"Unsupported source format: {source_path}")

    text, indexed_sections = _combine_sections(sections)
    digest = hashlib.sha256(source_path.read_bytes()).hexdigest()
    return {
        "schema_version": 1,
        "language": language,
        "language_name": LANGUAGE_NAMES[language],
        "volume": volume,
        "source": {
            "name": source_path.name,
            "path": str(source_path),
            "format": source_format,
            "sha256": digest,
        },
        "char_count": len(text),
        "section_count": len(indexed_sections),
        "sections": indexed_sections,
        "text": text,
    }


def _find_ru_source(inputs: Path, volume: int) -> Path | None:
    for pattern in RU_SOURCE_PATTERNS[volume]:
        matches = sorted(inputs.glob(pattern))
        if matches:
            return matches[0]
    return None


def inventory_sources(inputs: Path) -> dict[str, object]:
    languages: dict[str, object] = {"en": {"volumes": []}, "ru": {"volumes": []}}
    complete = True
    for vol in (1, 2, 3):
        en_path = inputs / VOL_EPUB_NAMES[vol]
        en_present = en_path.is_file()
        complete = complete and en_present
        languages["en"]["volumes"].append(
            {
                "volume": vol,
                "expected": VOL_EPUB_NAMES[vol],
                "present": en_present,
                "path": str(en_path) if en_present else None,
                "format": "epub",
            }
        )

        ru_path = _find_ru_source(inputs, vol)
        ru_present = ru_path is not None and ru_path.is_file()
        complete = complete and ru_present
        languages["ru"]["volumes"].append(
            {
                "volume": vol,
                "expected": RU_SOURCE_PATTERNS[vol],
                "present": ru_present,
                "path": str(ru_path) if ru_path else None,
                "format": ru_path.suffix.lower().lstrip(".") if ru_path else None,
            }
        )
    return {"inputs": str(inputs), "complete": complete, "languages": languages}


def write_json(path: Path, data: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Inventory and parse Eliade source books")
    parser.add_argument(
        "--inputs",
        type=Path,
        default=REPO_ROOT / "inputs",
        help="Directory containing EPUB files",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=REPO_ROOT / "data" / "en-epub",
        help="Legacy output directory for English volume text JSON",
    )
    parser.add_argument(
        "--source-cache-dir",
        type=Path,
        default=REPO_ROOT / "data" / "source-cache",
        help="Output directory for normalized multilingual source caches",
    )
    parser.add_argument(
        "--inventory",
        action="store_true",
        help="Print source inventory and exit without parsing",
    )
    parser.add_argument(
        "--inventory-out",
        type=Path,
        help="Optional path to write the source inventory report",
    )
    parser.add_argument(
        "--allow-missing",
        action="store_true",
        help="Return success for partial inventories; useful for fixtures",
    )
    args = parser.parse_args()

    inventory = inventory_sources(args.inputs)
    if args.inventory_out:
        write_json(args.inventory_out, inventory)
    if args.inventory:
        print(json.dumps(inventory, ensure_ascii=False, indent=2))
        if not inventory["complete"] and not args.allow_missing:
            sys.exit(2)
        return

    args.out_dir.mkdir(parents=True, exist_ok=True)
    wrote = 0
    for vol, name in VOL_EPUB_NAMES.items():
        epub = args.inputs / name
        if not epub.is_file():
            print(f"WARN: missing {epub}", file=sys.stderr)
            continue
        cache = source_to_cache(epub, "en", vol)
        legacy_out = {
            "volume": vol,
            "source": name,
            "char_count": cache["char_count"],
            "text": cache["text"],
        }
        out_path = args.out_dir / f"vol{vol}-fulltext.json"
        write_json(out_path, legacy_out)
        write_json(args.source_cache_dir / "en" / f"vol{vol}-source.json", cache)
        print(f"EN volume {vol}: {cache['char_count']:,} chars → {out_path}")
        wrote += 1

    for vol in (1, 2, 3):
        source = _find_ru_source(args.inputs, vol)
        if not source:
            print(f"WARN: missing Russian source for volume {vol}", file=sys.stderr)
            continue
        cache = source_to_cache(source, "ru", vol)
        write_json(args.source_cache_dir / "ru" / f"vol{vol}-source.json", cache)
        print(f"RU volume {vol}: {cache['char_count']:,} chars → {source.name}")
        wrote += 1

    if wrote == 0:
        print(f"ERROR: no supported source books found in {args.inputs}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
