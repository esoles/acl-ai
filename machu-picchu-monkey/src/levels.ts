export interface Goal {
  label: string;               // objetivo mostrado al empezar el nivel
  sprite: 'goal' | 'idol';     // 'goal' = Puerta del Sol, 'idol' = Intihuatana
  tint?: number;
  coins?: number;              // monedas necesarias para activar la meta
  kills?: boolean;             // hay que derrotar a todas las llamas
}
export interface LevelDef {
  name: string; floors: number; sky: number; goal: Goal;
  enemies: { floor: number; kind: 'spit' | 'charge' }[];
}
const S = 'spit' as const, C = 'charge' as const;
/** Añade niveles aquí: el motor genera terrazas, escaleras, monedas y meta a partir de estos datos. */
export const LEVELS: LevelDef[] = [
  { name: 'Nivel 1 · Terrazas de Machu Picchu', floors: 8, sky: 0x7ec8f0,
    goal: { label: 'Llega a la Puerta del Sol', sprite: 'goal' },
    enemies: [{ floor: 1, kind: C }, { floor: 2, kind: S }, { floor: 3, kind: C }, { floor: 4, kind: S }, { floor: 5, kind: C }, { floor: 6, kind: S }] },
  { name: 'Nivel 2 · Tesoro del Cóndor', floors: 9, sky: 0xf0a070,
    goal: { label: 'Reúne 30 monedas y toca el Intihuatana', sprite: 'idol', tint: 0xffd060, coins: 30 },
    enemies: [{ floor: 1, kind: S }, { floor: 2, kind: C }, { floor: 3, kind: S }, { floor: 4, kind: C }, { floor: 5, kind: S }, { floor: 6, kind: C }, { floor: 7, kind: S }] },
  { name: 'Nivel 3 · Guardianes del Templo', floors: 10, sky: 0x6a7fc0,
    goal: { label: 'Aplasta a todas las llamas y toca el Intihuatana', sprite: 'idol', tint: 0x80d0ff, kills: true },
    enemies: [{ floor: 1, kind: C }, { floor: 2, kind: S }, { floor: 3, kind: C }, { floor: 4, kind: S }, { floor: 5, kind: C },
      { floor: 6, kind: S }, { floor: 7, kind: C }, { floor: 8, kind: S }] },
  { name: 'Nivel 4 · Camino Inca de Medianoche', floors: 11, sky: 0x1a2040,
    goal: { label: 'Reúne 40 monedas, derrota a las llamas y toca el Intihuatana', sprite: 'idol', tint: 0xff80d0, coins: 40, kills: true },
    enemies: [{ floor: 1, kind: C }, { floor: 2, kind: S }, { floor: 2, kind: C }, { floor: 3, kind: S }, { floor: 4, kind: C }, { floor: 4, kind: S },
      { floor: 5, kind: C }, { floor: 6, kind: S }, { floor: 7, kind: C }, { floor: 7, kind: S }, { floor: 8, kind: C }, { floor: 9, kind: S }] },
];
