import json
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

_CH03 = REPO_ROOT / ".scratch" / "religion-map" / "vol1" / "ch03-events.json"

with open(_CH03, "r", encoding="utf-8") as f:
    events = json.load(f)

# If it's already a dict with "events", we extract it, else it's a list
if isinstance(events, dict) and "events" in events:
    events = events["events"]

output = {
    "volume": 1,
    "chapter_num": 3,
    "chapter_title": "Глава III РЕЛИГИИ МЕСОПОТАМИИ",
    "source_file": "data/vol1/chapters/ch04.txt",
    "events": events,
}

with open(_CH03, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
