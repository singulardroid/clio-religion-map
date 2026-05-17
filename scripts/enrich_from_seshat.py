import json
import os
import requests

def territory_to_search(term: str) -> str:
    """
    Map Russian lane / territory labels to an English token Seshat's /ngas/
    search seems to tolerate.
    """
    t = term or ""
    if "Египет" in t:
        return "Egypt"
    if "Месопотамия" in t:
        return "Mesopotamia"
    if "Иран" in t or "Персия" in t:
        return "Susiana"
    if "Греция" in t:
        return "Crete"
    if "Израиль" in t or "Ханаан" in t:
        return "Galilee"
    if "Аравия" in t:
        return "Arabia"
    if "Индия" in t:
        return "Ganga"
    if "Китай" in t:
        return "China"
    if "Тибет" in t:
        return "Tibet"
    if "Евразийская степь" in t or "Еврази" in t:
        return "Mongolia"
    if "Западная Европа" in t:
        return "France"
    if "Рим" in t:
        return "Latium"
    if "Кельт" in t or "Герман" in t:
        return "Germany"
    # broad fallbacks sometimes used by imports
    if "Европа" in t and "Запад" not in t:
        return "France"
    return term


def enrich_events(base_dirs=['.scratch/religion-map/vol1', '.scratch/religion-map/vol2', '.scratch/religion-map/vol3']):
    files = []
    for base_dir in base_dirs:
        if os.path.exists(base_dir):
            dir_files = [os.path.join(base_dir, f) for f in os.listdir(base_dir) if f.endswith('-events.json')]
            files.extend(dir_files)
    files.sort()
    
    # Simple cache to avoid redundant API calls
    nga_cache = {}
    
    for filepath in files:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        changed = False
        for event in data.get('events', []):
            seshat = event.setdefault('seshat', {})
            if seshat.get('enriched'):
                continue
                
            territory = event.get('territory', '')
            year_from = seshat.get('year_from')
            if year_from is None and isinstance(event.get('year_from'), int):
                year_from = event['year_from']
            year_to = seshat.get('year_to')
            if year_to is None and isinstance(event.get('year_to'), int):
                year_to = event['year_to']

            search_term = territory_to_search(territory)
            if not search_term or search_term.strip() == "":
                continue
            if (
                ("Доисторический" in territory)
                or ("Глобальн" in territory)
            ):
                continue

            # 1. Lookup NGA
            nga_id = None
            nga_name = None
            if search_term in nga_cache:
                nga_id, nga_name = nga_cache[search_term]
            else:
                try:
                    resp = requests.get(
                        "https://seshat-db.com/api/core/ngas/",
                        params={"search": search_term},
                        timeout=45,
                    )
                    if resp.status_code == 200:
                        results = resp.json().get('results', [])
                        if results:
                            nga_id = results[0]['id']
                            nga_name = results[0]['name']
                            nga_cache[search_term] = (nga_id, nga_name)
                except Exception as e:
                    print(f"NGA API Error: {e}")
                    
            if nga_id:
                seshat['nga_id'] = str(nga_id)
                seshat['nga_name'] = nga_name
                anchor_y = None
                if isinstance(year_from, int) and isinstance(year_to, int):
                    anchor_y = (year_from + year_to) // 2
                elif isinstance(year_from, int):
                    anchor_y = year_from
                
                # 2. Lookup Polity
                if anchor_y is not None:
                    try:
                        # Find overlapping polity in this NGA
                        # The API returns relations. We need to filter by year.
                        rel_resp = requests.get(
                            "https://seshat-db.com/api/core/nga-polity-relations/",
                            timeout=45,
                        )
                        if rel_resp.status_code == 200:
                            # In a real app we'd paginate or filter on the server.
                            # For this script we just grab the first page of relations and check overlap.
                            relations = rel_resp.json().get('results', [])
                            matched_polity_id = None
                            for rel in relations:
                                if rel.get('nga_party') == nga_id:
                                    r_from = rel.get('year_from', -999999)
                                    r_to = rel.get('year_to', 999999)
                                    if r_from <= anchor_y <= r_to:
                                        matched_polity_id = rel.get('polity_party')
                                        break
                                        
                            if matched_polity_id:
                                seshat['polity_id'] = str(matched_polity_id)
                                # Lookup polity name
                                pol_resp = requests.get(
                                    f'https://seshat-db.com/api/core/polities/{matched_polity_id}/',
                                    timeout=45,
                                )
                                if pol_resp.status_code == 200:
                                    seshat['polity_name'] = pol_resp.json().get('name')
                    except Exception as e:
                        print(f"Polity API Error: {e}")
                        
            # Mark enriched if we at least attempted and found NGA
            if nga_id:
                seshat['enriched'] = True
                changed = True
                
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Enriched {filepath}")

if __name__ == "__main__":
    print("Starting Seshat enrichment...")
    enrich_events()
    print("Done.")
