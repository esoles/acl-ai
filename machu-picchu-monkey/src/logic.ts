export const COIN_POINTS = 10, STOMP_POINTS = 100, LEVEL_BONUS = 500;
const KEY = 'machu-arcade-best';
type Store = Pick<Storage, 'getItem' | 'setItem'>;
const store = (): Store | undefined => { try { return localStorage; } catch { return undefined; } };

export function loadBest(s: Store | undefined = store()): number {
  const n = Number(s?.getItem(KEY));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
export function saveBest(score: number, s: Store | undefined = store()): number {
  const best = Math.max(score, loadBest(s));
  try { s?.setItem(KEY, String(best)); } catch { /* almacenamiento no disponible */ }
  return best;
}
/** La llama embistedora ataca si el jugador está en su mismo piso y a rango. */
export const shouldCharge = (dx: number, sameFloor: boolean, range = 150) => sameFloor && Math.abs(dx) < range;
export const loseLife = (lives: number) => Math.max(0, lives - 1);
