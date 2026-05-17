#!/usr/bin/env python3
"""
parse_fb2.py — extract chapters from an .fb2 file into plain-text files.

Usage (from repo root or from scripts/):
    python scripts/parse_fb2.py
    cd scripts && python parse_fb2.py

Defaults:
    fb2 file : inputs/01_История_веры_и_религиозных_идей_Том_1_*.fb2  (first match)
    out dir  : data/vol1/chapters
"""

import argparse
import glob
import json
import os
import re
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from lxml import etree

from repo_paths import REPO_ROOT

# FB2 uses a default namespace; we strip it for simpler XPath.
FB2_NS = "http://www.gribuser.ru/xml/fictionbook/2.0"


def strip_ns(tag: str) -> str:
    return re.sub(r"\{[^}]*\}", "", tag)


def text_of(element) -> str:
    """Recursively collect plain text from an element, preserving paragraph breaks."""
    parts = []
    if element.text:
        parts.append(element.text.strip())
    for child in element:
        tag = strip_ns(child.tag)
        if tag in ("title", "section"):
            # nested titles/sections handled separately
            pass
        elif tag == "p":
            inner = "".join(child.itertext()).strip()
            if inner:
                parts.append(inner)
        elif tag in ("emphasis", "strong", "a", "sup", "sub", "code", "strikethrough"):
            inner = "".join(child.itertext()).strip()
            if inner:
                parts.append(inner)
        elif tag == "empty-line":
            parts.append("")
        else:
            inner = text_of(child)
            if inner:
                parts.append(inner)
        if child.tail:
            tail = child.tail.strip()
            if tail:
                parts.append(tail)
    return "\n".join(p for p in parts if p is not None)


def title_of(section) -> str:
    """Extract plain title text from a <section>'s <title> child."""
    for child in section:
        if strip_ns(child.tag) == "title":
            return " ".join("".join(child.itertext()).split())
    return ""


def extract_notes(tree) -> dict[str, str]:
    """
    Parse the <body name="notes"> section and return a mapping of reference id
    to full bibliographic text, e.g. {"n_1": "Eliade M. Le Mythe...", ...}.
    Returns an empty dict if no notes body is present.
    """
    root = tree.getroot()
    notes_body = None
    for el in root.iter():
        if strip_ns(el.tag) == "body" and el.get("name") == "notes":
            notes_body = el
            break
    if notes_body is None:
        return {}

    refs: dict[str, str] = {}
    for section in notes_body:
        if strip_ns(section.tag) != "section":
            continue
        ref_id = section.get("id", "").strip()
        if not ref_id:
            continue
        text = " ".join("".join(section.itertext()).split()).strip()
        if text:
            refs[ref_id] = text
    return refs


def extract_chapters(tree) -> list[dict]:
    """
    Return a list of dicts: {num, title, body}
    Top-level <section> elements inside <body> are treated as chapters.
    Nested <section> elements are flattened into the parent chapter body.
    """
    root = tree.getroot()
    # Find all <body> elements (FB2 may have multiple bodies for notes)
    bodies = [el for el in root.iter() if strip_ns(el.tag) == "body"
              and el.get("name") is None]  # skip footnote bodies

    chapters = []
    ch_num = 0

    for body in bodies:
        for section in body:
            if strip_ns(section.tag) != "section":
                continue
            ch_num += 1
            title = title_of(section)
            # Collect all text recursively (including sub-sections)
            paragraphs = []
            _collect_paragraphs(section, paragraphs, depth=0)
            body_text = "\n\n".join(p for p in paragraphs if p.strip())
            chapters.append({"num": ch_num, "title": title, "body": body_text})

    return chapters


def _collect_paragraphs(element, out: list, depth: int):
    """Depth-first walk; emit paragraphs as plain strings."""
    for child in element:
        tag = strip_ns(child.tag)
        if tag == "title":
            text = " ".join("".join(child.itertext()).split())
            if text:
                prefix = "#" * max(1, depth + 1)
                out.append(f"{prefix} {text}")
        elif tag == "p":
            text = " ".join("".join(child.itertext()).split())
            if text:
                out.append(text)
        elif tag == "empty-line":
            out.append("")
        elif tag == "section":
            _collect_paragraphs(child, out, depth + 1)
        elif tag in ("epigraph", "cite", "poem", "subtitle", "table"):
            text = " ".join("".join(child.itertext()).split())
            if text:
                out.append(text)


def main():
    parser = argparse.ArgumentParser(description="Parse .fb2 → chapter text files")
    parser.add_argument(
        "fb2_file",
        nargs="?",
        default=None,
        help="Path to .fb2 file (default: first match in inputs/)",
    )
    parser.add_argument(
        "--out-dir",
        default=None,
        help="Output directory for chapter text files (default: data/vol1/chapters)",
    )
    args = parser.parse_args()

    out_dir = Path(args.out_dir) if args.out_dir else REPO_ROOT / "data" / "vol1" / "chapters"
    if not out_dir.is_absolute():
        out_dir = (REPO_ROOT / out_dir).resolve()
    else:
        out_dir = out_dir.resolve()
    out_dir_str = str(out_dir)

    # Resolve fb2 file
    fb2_path = args.fb2_file
    if not fb2_path:
        inputs = REPO_ROOT / "inputs"
        matches = sorted(
            glob.glob(str(inputs / "*Том_1*.fb2")) + glob.glob(str(inputs / "*Tom_1*.fb2"))
        )
        if not matches:
            matches = sorted(glob.glob(str(inputs / "*.fb2")))
        if not matches:
            print("ERROR: No .fb2 file found in inputs/. Pass path explicitly.", file=sys.stderr)
            sys.exit(1)
        fb2_path = matches[0]
    else:
        p = Path(fb2_path)
        fb2_path = str(p if p.is_absolute() else (REPO_ROOT / p).resolve())

    print(f"Parsing: {fb2_path}")

    # Parse XML
    try:
        tree = etree.parse(fb2_path)
    except etree.XMLSyntaxError as e:
        # Some fb2 files have encoding issues — retry with recovery
        parser_obj = etree.XMLParser(recover=True, encoding="utf-8")
        tree = etree.parse(fb2_path, parser_obj)

    chapters = extract_chapters(tree)

    if not chapters:
        print("WARNING: No chapters found. Check .fb2 structure.", file=sys.stderr)
        sys.exit(1)

    os.makedirs(out_dir_str, exist_ok=True)

    # Extract and save bibliographic references
    notes = extract_notes(tree)
    refs_path = os.path.join(out_dir_str, "refs.json")
    with open(refs_path, "w", encoding="utf-8") as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)
    print(f"References:     {len(notes)} entries → {refs_path}")

    print(f"\n{'#':>4}  {'Words':>6}  Title")
    print("-" * 70)

    for ch in chapters:
        filename = os.path.join(out_dir_str, f"ch{ch['num']:02d}.txt")
        content = f"{ch['title']}\n{'=' * len(ch['title'])}\n\n{ch['body']}" if ch['title'] else ch['body']
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)
        word_count = len(ch["body"].split())
        title_display = ch["title"][:55] + "…" if len(ch["title"]) > 55 else ch["title"]
        print(f"{ch['num']:>4}  {word_count:>6}  {title_display}")

    print("-" * 70)
    print(f"Total chapters: {len(chapters)}")
    print(f"Output dir:     {out_dir_str}/")


if __name__ == "__main__":
    main()
