#!/usr/bin/env python3
"""Extract plain text from English EPUB volumes in inputs/."""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from html.parser import HTMLParser
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

VOL_EPUB_NAMES = {
    1: "A History of Religious Ideas, Volume 1 - Eliade, Mircea.epub",
    2: "A History of Religious Ideas, Volume 2 - Eliade, Mircea.epub",
    3: "A History of Religious Ideas, Volume 3 - Eliade, Mircea.epub",
}


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
    chunks: list[str] = []
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
                chunks.append(txt)
    return "\n\n".join(chunks)


def main() -> None:
    parser = argparse.ArgumentParser(description="Parse English EPUBs to text cache")
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
        help="Output directory for volume text JSON",
    )
    args = parser.parse_args()

    args.out_dir.mkdir(parents=True, exist_ok=True)
    for vol, name in VOL_EPUB_NAMES.items():
        epub = args.inputs / name
        if not epub.is_file():
            print(f"WARN: missing {epub}", file=sys.stderr)
            continue
        text = epub_to_text(epub)
        out = {
            "volume": vol,
            "source": name,
            "char_count": len(text),
            "text": text,
        }
        out_path = args.out_dir / f"vol{vol}-fulltext.json"
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False)
        print(f"Volume {vol}: {len(text):,} chars → {out_path}")


if __name__ == "__main__":
    main()
