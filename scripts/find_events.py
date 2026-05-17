import re
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT


def find_events():
    ch_path = REPO_ROOT / "data" / "vol1" / "chapters" / "ch18.txt"
    with open(ch_path, "r", encoding="utf-8") as f:
        text = f.read()

    paragraphs = text.split("\n\n")

    territories = [
        "Месопотами",
        "Егип",
        "Иран",
        "Перси",
        "Инди",
        "Греци",
        "Израиль",
        "Ханаан",
        "Рим",
        "Арави",
        "Европ",
        "Афри",
        "Ази",
        "Анатоли",
        "Крит",
        "Палестин",
        "Сири",
    ]
    time_markers = ["до н", "тыс", "век", " в.", "период", "эпох"]

    results = []

    for i, p in enumerate(paragraphs):
        p_lower = p.lower()
        has_terr = any(t.lower() in p_lower for t in territories)
        has_time = any(tm.lower() in p_lower for tm in time_markers)
        if has_terr and has_time:
            results.append(f"Para {i}:\n{p}\n")

    out_path = REPO_ROOT / ".scratch" / "potential_events.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(results))


if __name__ == "__main__":
    find_events()
