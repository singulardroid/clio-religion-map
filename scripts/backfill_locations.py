import json
import os
import glob
import re

def backfill_locations():
    # Simple hardcoded backfill for known entities in early chapters
    # to avoid needing full LLM API setup in this simple script.
    
    known_locations = {
        "fire-domestication-paleolithic": "Чжоу-Коу-Тянь",
        "burial-ritual-paleolithic": "Европа",
        "red-ochre-ritual": "Чжоу-Коу-Тянь",
        "cave-art-franco-cantabrian": "Франко-кантабрийский регион",
        "paleolithic-venus-figurines": "Гагарино и Мезин",
        "gender-binary-cosmology-paleolithic": "Мальта",
        "lunar-calendar-upper-paleolithic": "Пеш-де-л'Азе",
        
        # Natufian / Neolithic
        "natufian-skull-cult": "Иерихон / Айн Маллах",
        "agriculture-discovery-myth": "Чатал-Хююк",
        
        # Mesopotamia
        "city-state-creation": "Эриду / Урук",
        "ziggurat-cosmic-mountain": "Урук",
        "cuneiform-writing": "Урук",
        "akitu-festival-renewal": "Вавилон",
        
        # Egypt
        "pharaoh-incarnation-horus": "Египет (Мемфис)",
        "ptah-logos-creation": "Мемфис",
        "atenism-solar-monotheism": "Ахетатон (Амарна)",
        "osiris-democratization": "Абидос",
        
        # Megaliths
        "megalithic-cult-of-dead": "Западная Европа",
        "maltese-temples-goddess": "Мальта",
        "minoan-labyrinth-initiation": "Крит",
        
        # Hittites
        "hittite-religious-syncretism": "Хаттуса",
        "telepinus-myth-vegetation": "Хаттуса",
        
        # Canaan
        "canaanite-pantheon-el-baal": "Угарит",
        
        # Israel
        "yahwist-creation-myth": "Иерусалим",
        
        # India
        "aryan-invasion-india": "Пенджаб",
    }
    
    files = glob.glob(".scratch/religion-map/vol1/ch*-events.json")
    for file in files:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        changed = False
        for event in data.get('events', []):
            if 'precise_location' not in event and event['concept_id'] in known_locations:
                event['precise_location'] = known_locations[event['concept_id']]
                changed = True
                
        if changed:
            with open(file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Updated {file}")

if __name__ == "__main__":
    backfill_locations()
