import json

registry_path = '.scratch/religion-map/concept-registry.json'
events_path = '.scratch/religion-map/vol1/ch12-events.json'

with open(registry_path, 'r', encoding='utf-8') as f:
    registry = json.load(f)

with open(events_path, 'r', encoding='utf-8') as f:
    events_data = json.load(f)

for event in events_data.get('events', []):
    if event.get('is_first_occurrence'):
        concept_id = event['concept_id']
        registry['concepts'][concept_id] = {
            'first_seen_volume': events_data['volume'],
            'first_seen_chapter': events_data['chapter_num'],
            'first_seen_chapter_title': events_data['chapter_title'],
            'source_ref': event['source_ref']
        }

with open(registry_path, 'w', encoding='utf-8') as f:
    json.dump(registry, f, ensure_ascii=False, indent=2)

print("Registry updated.")
