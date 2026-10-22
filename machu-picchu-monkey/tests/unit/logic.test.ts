import { describe, it, expect } from 'vitest';
import { loadBest, saveBest, shouldCharge, loseLife } from '../../src/logic';
import { LEVELS } from '../../src/levels';

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

describe('récords', () => {
  it('empieza en 0', () => expect(loadBest(mem())).toBe(0));
  it('guarda sólo el máximo', () => {
    const s = mem();
    expect(saveBest(300, s)).toBe(300);
    expect(saveBest(100, s)).toBe(300);
    expect(loadBest(s)).toBe(300);
  });
  it('ignora valores corruptos', () => { const s = mem(); s.setItem('machu-arcade-best', 'abc'); expect(loadBest(s)).toBe(0); });
});
describe('reglas', () => {
  it('la llama embiste sólo en el mismo piso y a rango', () => {
    expect(shouldCharge(100, true)).toBe(true);
    expect(shouldCharge(100, false)).toBe(false);
    expect(shouldCharge(300, true)).toBe(false);
  });
  it('las vidas no bajan de 0', () => { expect(loseLife(3)).toBe(2); expect(loseLife(0)).toBe(0); });
  it('los niveles tienen enemigos en pisos válidos', () => {
    LEVELS.forEach((l) => l.enemies.forEach((e) => { expect(e.floor).toBeGreaterThan(0); expect(e.floor).toBeLessThan(l.floors); }));
  });
});
