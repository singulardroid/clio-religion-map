"""Tests for parse_fb2.py using an inline FB2 XML fixture."""
import sys, os, textwrap, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from lxml import etree
from scripts.parse_fb2 import extract_chapters, title_of, _collect_paragraphs

FIXTURE_FB2 = textwrap.dedent("""\
<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
  <body>
    <section>
      <title><p>Глава 1. Доисторический период</p></title>
      <p>Первый абзац о палеолите.</p>
      <p>Второй абзац о захоронениях.</p>
      <section>
        <title><p>§1. Шаманизм</p></title>
        <p>Шаманы Сибири.</p>
      </section>
    </section>
    <section>
      <title><p>Глава 2. Месопотамия</p></title>
      <p>Боги Шумера.</p>
      <empty-line/>
      <p>Культ Инанны.</p>
    </section>
  </body>
</FictionBook>
""")


def parse_fixture():
    tree = etree.fromstring(FIXTURE_FB2.encode("utf-8"))
    return etree.ElementTree(tree)


def test_chapter_count():
    tree = parse_fixture()
    chapters = extract_chapters(tree)
    assert len(chapters) == 2


def test_chapter_titles():
    tree = parse_fixture()
    chapters = extract_chapters(tree)
    assert "Глава 1" in chapters[0]["title"]
    assert "Глава 2" in chapters[1]["title"]


def test_chapter_body_non_empty():
    tree = parse_fixture()
    chapters = extract_chapters(tree)
    for ch in chapters:
        assert len(ch["body"].strip()) > 0


def test_sub_section_included_in_parent():
    tree = parse_fixture()
    chapters = extract_chapters(tree)
    # Sub-section text "Шаманы Сибири" should be in chapter 1's body
    assert "Шаманы" in chapters[0]["body"]


def test_chapter_numbering_starts_at_one():
    tree = parse_fixture()
    chapters = extract_chapters(tree)
    assert chapters[0]["num"] == 1
    assert chapters[1]["num"] == 2
