export interface Era {
  name: string
  yearFrom: number
  yearTo: number
  color: string
  widthPx: number
}

export interface Territory {
  name: string
  order: number
}

// Era bands — X-axis, chronological left to right.
// yearFrom/yearTo in integer years (negative = BCE).
// widthPx determines how wide this era is on the canvas, creating a non-linear scale 
// where dense recent eras get more space.
export const ERAS: Era[] = [
  { name: 'Древний палеолит',       yearFrom: -700000, yearTo: -100000, color: '#ede0c4', widthPx: 600 },
  { name: 'Палеолит',               yearFrom: -100000, yearTo: -10000,  color: '#f5e6cc', widthPx: 600 },
  { name: 'Неолит',                 yearFrom: -10000,  yearTo: -3500,   color: '#e8f0d8', widthPx: 1200 },
  { name: 'Ранняя бронза',          yearFrom: -3500,   yearTo: -2000,   color: '#d8e8f0', widthPx: 1200 },
  { name: 'Поздняя бронза',         yearFrom: -2000,   yearTo: -1200,   color: '#e8d8f0', widthPx: 1200 },
  { name: 'Железный век',           yearFrom: -1200,   yearTo: -800,    color: '#f0e8d8', widthPx: 1200 },
  { name: 'Осевое время',           yearFrom: -800,    yearTo: -200,    color: '#d8f0e8', widthPx: 1200 },
  { name: 'Эллинистический период', yearFrom: -200,    yearTo: 400,     color: '#f0d8d8', widthPx: 1200 },
  { name: 'Поздняя античность',     yearFrom: 400,     yearTo: 600,     color: '#d8e8f0', widthPx: 800 },
  { name: 'Раннее средневековье',   yearFrom: 600,     yearTo: 1000,    color: '#e8f0d8', widthPx: 1000 },
  { name: 'Высокое средневековье',  yearFrom: 1000,    yearTo: 1300,    color: '#f0e8d8', widthPx: 800 },
  { name: 'Позднее средневековье',  yearFrom: 1300,    yearTo: 1500,    color: '#f5e6cc', widthPx: 800 },
  { name: 'Реформация',             yearFrom: 1500,    yearTo: 1700,    color: '#e8d8f0', widthPx: 800 },
  { name: 'Новое время',            yearFrom: 1700,    yearTo: 2000,    color: '#ede0c4', widthPx: 800 },
]

// Territory lanes — Y-axis, top to bottom.
export const TERRITORIES: Territory[] = [
  { name: 'Доисторический / Глобальный', order: 0 },
  { name: 'Месопотамия',                 order: 1 },
  { name: 'Египет',                      order: 2 },
  { name: 'Иран / Персия',               order: 3 },
  { name: 'Индия',                       order: 4 },
  { name: 'Китай',                       order: 5 },
  { name: 'Греция',                      order: 6 },
  { name: 'Израиль / Ханаан',            order: 7 },
  { name: 'Рим',                         order: 8 },
  { name: 'Аравия',                      order: 9 },
  { name: 'Кельты / Германцы',           order: 10 },
  { name: 'Евразийская степь',           order: 11 },
  { name: 'Западная Европа',             order: 12 },
  { name: 'Тибет',                       order: 13 },
]

// Canvas dimensions
export const CANVAS_YEAR_START = -700000  // extends back to cover oldest events
export const CANVAS_YEAR_END   = 2000
export const LANE_HEIGHT       = 480      // px per territory lane (tall enough for stacked nodes)
export const LANE_LABEL_WIDTH  = 220      // px reserved on left for territory labels

// Auto-layout node dimensions (approximate)
export const NODE_WIDTH  = 280
export const NODE_HEIGHT = 160
export const NODE_PAD_X  = 20    // horizontal gap when stacking
export const NODE_PAD_Y  = 18    // vertical gap when stacking
