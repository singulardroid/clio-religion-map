import json
import os

with open('.scratch/religion-map/vol1/ch02-events.json', 'r', encoding='utf-8') as f:
    events = json.load(f)

chapter_data = {
    "volume": 1,
    "chapter_num": 2,
    "chapter_title": "Глава II САМАЯ ДОЛГАЯ РЕВОЛЮЦИЯ: ОТКРЫТИЕ ЗЕМЛЕДЕЛИЯ — МЕЗОЛИТ И НЕОЛИТ",
    "events": events
}

with open('.scratch/religion-map/vol1/ch02-events.json', 'w', encoding='utf-8') as f:
    json.dump(chapter_data, f, ensure_ascii=False, indent=2)

print("Fixed ch02-events.json")
