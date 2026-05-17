import json

with open(".scratch/religion-map/vol1/ch03-events.json", "r", encoding="utf-8") as f:
    events = json.load(f)

# If it's already a dict with "events", we extract it, else it's a list
if isinstance(events, dict) and "events" in events:
    events = events["events"]

output = {
  "volume": 1,
  "chapter_num": 3,
  "chapter_title": "Глава III РЕЛИГИИ МЕСОПОТАМИИ",
  "source_file": "data/vol1/chapters/ch04.txt",
  "events": events
}

with open(".scratch/religion-map/vol1/ch03-events.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

