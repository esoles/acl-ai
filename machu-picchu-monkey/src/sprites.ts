import Phaser from 'phaser';
const PAL: Record<string, number> = { r: 0xc8372d, Y: 0xf2c230, b: 0x7a4a21, f: 0xe8b887, k: 0x111111, w: 0xf1e6d0, n: 0x3a2a1a, g: 0x57b947, s: 0x9a9a8a, d: 0x6d6d60 };

export function px(scene: Phaser.Scene, key: string, rows: string[]) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') { g.fillStyle(PAL[ch]); g.fillRect(x, y, 1, 1); } }));
  g.generateTexture(key, rows[0].length, rows.length); g.destroy();
}

export function makeTextures(s: Phaser.Scene) {
  // Monito con chullo y poncho inca
  px(s, 'monkey', ['..rrrrrr..', '.rYrYrYrr.', '..bbbbbb..', 'bbfffffbb.', '.bfkffkfb.', '..bffffb..',
    '..rrrrrr..', '.rrYYYYrr.', 'brrrrrrrrb', 'b.rrrrrr.b', '..bb..bb..', '..bb..bb..']);
  px(s, 'llama', ['..........ww..', '.........wwwww', '.........wkwwn', '........www...', '.wwwwwwwww....', 'wwwwwwwwww....',
    'wwwwwwwwww....', 'wwrrrrwwww....', '.wwwwwwww.....', '.w.w..w.w.....', '.w.w..w.w.....', '.w.w..w.w.....']);
  px(s, 'coin', ['..YYYY..', '.YYYYYY.', 'YYYfYYYY', 'YYYfYYYY', 'YYYfYYYY', 'YYYfYYYY', '.YYYYYY.', '..YYYY..']);
  px(s, 'idol', ['....YY....', '...YYYY...', '....dd....', '..ssssss..', '.sssYYsss.', '..ssssss..', '...dssd...', '...ssss...', '..ssssss..', '.dssssssd.', 'dddddddddd', 'dddddddddd']);
  px(s, 'spit', ['.gg.', 'gggg', 'gggg', '.gg.']);
  px(s, 'stone', Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) =>
    y === 0 ? 'g' : (y === 8 || y === 15 || x === (y < 8 ? 8 : 0)) ? 'd' : 's').join('')));
  px(s, 'ladder', Array.from({ length: 16 }, (_, y) => (y % 8 === 3 ? 'bbbbbbbbbbbbbb' : 'bb..........bb')));
  px(s, 'goal', Array.from({ length: 12 }, (_, y) => Array.from({ length: 12 }, (_, x) =>
    Math.hypot(x - 5.5, y - 5.5) < 5.2 ? (Math.hypot(x - 5.5, y - 5.5) < 3 ? 'Y' : 'r') : '.').join('')));
}
