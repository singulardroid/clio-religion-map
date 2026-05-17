import re
import json

def find_events():
    with open('data/vol1/chapters/ch18.txt', 'r', encoding='utf-8') as f:
        text = f.read()
    
    paragraphs = text.split('\n\n')
    
    territories = ['Месопотами', 'Егип', 'Иран', 'Перси', 'Инди', 'Греци', 'Израиль', 'Ханаан', 'Рим', 'Арави', 'Европ', 'Афри', 'Ази', 'Анатоли', 'Крит', 'Палестин', 'Сири']
    time_markers = ['до н', 'тыс', 'век', ' в.', 'период', 'эпох']
    
    results = []
    
    for i, p in enumerate(paragraphs):
        p_lower = p.lower()
        has_terr = any(t.lower() in p_lower for t in territories)
        has_time = any(tm.lower() in p_lower for tm in time_markers)
        if has_terr and has_time:
            results.append(f"Para {i}:\n{p}\n")
            
    with open('.scratch/potential_events.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(results))

if __name__ == '__main__':
    find_events()