import json
import os
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

_CH02 = REPO_ROOT / ".scratch" / "religion-map" / "vol1" / "ch02-events.json"

with open(_CH02, "r", encoding="utf-8") as f:
    events = json.load(f)

chapter_data = {
    "volume": 1,
    "chapter_num": 2,
    "chapter_title": "Глава II САМАЯ ДОЛГАЯ РЕВОЛЮЦИЯ: ОТКРЫТИЕ ЗЕМЛЕДЕЛИЯ — МЕЗОЛИТ И НЕОЛИТ",
    "events": events
}

with open(_CH02, "w", encoding="utf-8") as f:
    json.dump(chapter_data, f, ensure_ascii=False, indent=2)

print("Fixed ch02-events.json")
