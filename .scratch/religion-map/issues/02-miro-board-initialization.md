Status: ready-for-agent

## Parent

.scratch/religion-map/PRD.md

## What to build

Initialize the Miro board (`uXjVHSThVzc=`) with the structural skeleton that all subsequent chapter pushes will populate. This is a one-time setup of the board layout — no event nodes yet.

The board needs:
- **Era band background panels** spanning the full vertical height of the canvas, positioned left-to-right in chronological order: Палеолит (до 10 000 до н.э.), Неолит (10 000–3 500 до н.э.), Ранняя бронза (3 500–2 000 до н.э.), Поздняя бронза (2 000–1 200 до н.э.), Осевое время (800–200 до н.э.), Эллинистический период (300 до н.э. – 300 н.э.)
- **Territory lane labels** on the left edge, one per cultural region, top to bottom: Доисторический/Глобальный, Месопотамия, Египет, Иран/Персия, Индия (Ведийская), Греция, Израиль/Ханаан, Рим, Аравия
- **Master event table** with columns: `Эра`, `Период`, `Территория`, `Религия`, `Высказывание`, `Первое появление`

All item IDs created must be appended to `.scratch/religion-map/miro-items.json` so they can be rolled back.

## Acceptance criteria

- [ ] Six era band panels are visible on the board, labeled and ordered chronologically left to right
- [ ] Nine territory lane labels are visible on the left edge of the board, ordered top to bottom as specified
- [ ] Master event table exists on the board with the six correct column names
- [ ] All created Miro item IDs are recorded in `.scratch/religion-map/miro-items.json`

## Blocked by

None — can start immediately
