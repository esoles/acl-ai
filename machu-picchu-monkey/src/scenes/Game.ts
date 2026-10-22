import Phaser from 'phaser';
import { LEVELS, LevelDef } from '../levels';
import { COIN_POINTS, STOMP_POINTS, LEVEL_BONUS, shouldCharge, loseLife, saveBest } from '../logic';
import { music, sfx } from '../audio';

const W = 360, VH = 640, FH = 110;
type Body = Phaser.Physics.Arcade.Body;
interface Llama extends Phaser.Physics.Arcade.Sprite { kind: 'spit' | 'charge'; dir: number; fl: number; nextShot: number; }
const font = (s: number) => ({ fontFamily: 'monospace', fontSize: s + 'px', color: '#fff', stroke: '#000', strokeThickness: 3, align: 'center' as const });

export class Game extends Phaser.Scene {
  private L: LevelDef = LEVELS[0]; private got = 0; private flashUntil = 0; private lvl = 0; private score = 0; private lives = 3;
  private player!: Phaser.Physics.Arcade.Sprite;
  private llamas!: Phaser.Physics.Arcade.Group;
  private shots!: Phaser.Physics.Arcade.Group;
  private near: Phaser.GameObjects.TileSprite | null = null;
  private climbing = false; private paused = false; private over = false; private won = false;
  private invulUntil = 0; private knockUntil = 0; private stamp = 0;
  private hud!: Phaser.GameObjects.Text; private msg!: Phaser.GameObjects.Text;
  private keys!: any; private cur!: Phaser.Types.Input.Keyboard.CursorKeys;
  private t = { l: false, r: false, u: false, d: false, j: false };
  private fy!: (i: number) => number;

  constructor() { super('Game'); }
  init(d: { level?: number; score?: number; lives?: number }) { this.lvl = d.level ?? 0; this.score = d.score ?? 0; this.lives = d.lives ?? 3; }

  create() {
    const L = (this.L = LEVELS[this.lvl]); this.got = 0; this.flashUntil = 0; const top = L.floors - 1, H = L.floors * FH + 160;
    const fy = (this.fy = (i: number) => H - 40 - i * FH);
    this.climbing = this.paused = this.over = this.won = false; this.invulUntil = this.knockUntil = 0; this.near = null;
    this.t = { l: false, r: false, u: false, d: false, j: false };
    this.physics.resume(); this.time.paused = false;
    this.physics.world.setBounds(0, 0, W, H); this.cameras.main.setBounds(0, 0, W, H).setBackgroundColor(L.sky);

    // Montañas lejanas (parallax)
    const base = 600 + 0.5 * (H - VH);
    this.add.graphics().setScrollFactor(0.3, 0.5).setDepth(-5)
      .fillStyle(0x6f8fa8).fillTriangle(-80, base, 100, base - 300, 280, base)
      .fillStyle(0x4f7a62).fillTriangle(120, base, 300, base - 220, 480, base)
      .fillStyle(0x3f6a52).fillTriangle(-20, base, 60, base - 120, 140, base)
      .fillStyle(0x57b947).fillRect(-100, base, 600, 3000);

    // Terrazas: muros de piedra, plataformas de un solo sentido y escaleras
    const plats = this.physics.add.staticGroup(), ladders = this.physics.add.staticGroup();
    for (let i = 0; i < L.floors; i++) {
      const wh = i === 0 ? 32 : FH - 16;
      this.add.tileSprite(180, fy(i) + 8 + wh / 2, W, wh, 'stone').setTint(0x8a8a7a).setDepth(-3);
      const p = this.add.tileSprite(180, fy(i), W, 16, 'stone'); plats.add(p);
      const cc = (p.body as Body).checkCollision; cc.down = cc.left = cc.right = false;
      if (i < top) {
        const tp = fy(i + 1) - 10, h = fy(i) - tp;
        ladders.add(this.add.tileSprite(i % 2 === 0 ? 40 : 320, tp + h / 2, 14, h, 'ladder').setDepth(-1));
      }
    }

    // Monedas y meta
    const coins = this.physics.add.group({ allowGravity: false, immovable: true });
    for (let i = 0; i <= top; i++) for (let k = 0; k < 5; k++)
      coins.create(50 + k * 65 + (i % 2) * 15, fy(i) - (k % 2 ? 56 : 26), 'coin').setScale(2).setDepth(2);
    const goal = this.physics.add.sprite(180, fy(top) - 30, L.goal.sprite).setScale(3).setDepth(1);
    if (L.goal.tint) goal.setTint(L.goal.tint);
    (goal.body as Body).setAllowGravity(false);
    if (L.goal.sprite === 'goal') this.tweens.add({ targets: goal, angle: 360, duration: 6000, repeat: -1 });
    else this.tweens.add({ targets: goal, y: goal.y - 6, yoyo: true, repeat: -1, duration: 700 });

    // Jugador
    this.player = this.physics.add.sprite(60, fy(0) - 30, 'monkey').setScale(2).setCollideWorldBounds(true).setDepth(5);
    (this.player.body as Body).setSize(8, 12);
    this.cameras.main.startFollow(this.player, true, 1, 0.1);

    // Llamas
    this.llamas = this.physics.add.group({ allowGravity: false });
    this.shots = this.physics.add.group({ allowGravity: false });
    L.enemies.forEach((e) => {
      const l = this.llamas.create(Phaser.Math.Between(100, 280), fy(e.floor) - 8 - 12, 'llama') as Llama;
      l.setScale(2).setDepth(4).setTint(e.kind === 'spit' ? 0xa8e0a0 : 0xe8b070);
      Object.assign(l, { kind: e.kind, dir: Math.random() < 0.5 ? -1 : 1, fl: e.floor, nextShot: 0 });
    });

    this.physics.add.collider(this.player, plats, undefined, () => !this.climbing);
    this.physics.add.overlap(this.player, ladders, (_p, l) => { this.near = l as Phaser.GameObjects.TileSprite; });
    this.physics.add.overlap(this.player, coins, (_p, c) => { c.destroy(); this.got++; this.addScore(COIN_POINTS); sfx('coin'); });
    this.physics.add.overlap(this.player, goal, () => this.tryGoal());
    this.physics.add.overlap(this.player, this.shots, (_p, s) => { const x = (s as Phaser.GameObjects.Sprite).x; s.destroy(); this.hit(x); });
    this.physics.add.overlap(this.player, this.llamas, (_p, o) => {
      const l = o as Llama, pb = this.player.body as Body;
      if (pb.velocity.y > 40 && pb.bottom < l.y) { l.destroy(); this.player.setVelocityY(-230); this.addScore(STOMP_POINTS); sfx('coin'); }
      else this.hit(l.x);
    });

    // HUD, pausa y controles
    this.hud = this.add.text(8, 8, '', font(14)).setScrollFactor(0).setDepth(20);
    this.msg = this.add.text(W / 2, VH / 2, '', font(22)).setOrigin(0.5).setScrollFactor(0).setDepth(30).setPadding(14).setBackgroundColor('rgba(0,0,0,0.65)').setVisible(false);
    this.add.text(W - 10, 8, '❚❚', font(18)).setOrigin(1, 0).setScrollFactor(0).setDepth(20).setInteractive()
      .on('pointerdown', () => { if (Date.now() - this.stamp > 300) this.togglePause(); });
    this.refresh();
    const bn = this.add.text(W / 2, 230, `${L.name}\n\n${L.goal.label}`, { ...font(16), wordWrap: { width: 320 } }).setOrigin(0.5).setScrollFactor(0).setDepth(25);
    this.tweens.add({ targets: bn, alpha: 0, delay: 3000, duration: 800, onComplete: () => bn.destroy() });
    const kb = this.input.keyboard!;
    this.cur = kb.createCursorKeys(); this.keys = kb.addKeys('W,A,S,D');
    kb.on('keydown-P', () => this.togglePause()); kb.on('keydown-ESC', () => this.togglePause());
    kb.on('keydown-M', () => music.toggleMute()); kb.on('keydown-ENTER', () => this.proceed());
    this.input.on('pointerdown', () => { if (Date.now() - this.stamp > 300 && (this.paused || this.over)) this.proceed(); });
    if (this.sys.game.device.input.touch) {
      this.input.addPointer(3);
      const mk = (x: number, y: number, label: string, key: keyof Game['t'], w = 56) => {
        const r = this.add.rectangle(x, y, w, 52, 0x000000, 0.35).setStrokeStyle(2, 0xffffff, 0.6).setScrollFactor(0).setDepth(20).setInteractive();
        this.add.text(x, y, label, font(16)).setOrigin(0.5).setScrollFactor(0).setDepth(21);
        r.on('pointerdown', () => (this.t[key] = true));
        ['pointerup', 'pointerout'].forEach((e) => r.on(e, () => (this.t[key] = false)));
      };
      mk(36, 604, '◀', 'l'); mk(100, 604, '▶', 'r'); mk(180, 576, '▲', 'u', 48); mk(180, 628, '▼', 'd', 48); mk(310, 604, 'SALTO', 'j', 80);
    }
  }

  private refresh() {
    const g = this.L.goal, obj: string[] = [];
    if (g.coins) obj.push(`Monedas ${Math.min(this.got, g.coins)}/${g.coins}`);
    if (g.kills) obj.push(`Llamas ${this.llamas.countActive(true)}`);
    this.hud.setText(`PTS ${String(this.score).padStart(5, '0')} ${'♥'.repeat(this.lives)} NV${this.lvl + 1}` + (obj.length ? '\n' + obj.join('  ') : ''));
  }
  private tryGoal() {
    const g = this.L.goal, miss: string[] = [], alive = this.llamas.countActive(true);
    if (g.coins && this.got < g.coins) miss.push(`Faltan ${g.coins - this.got} monedas`);
    if (g.kills && alive > 0) miss.push(`Faltan ${alive} llamas`);
    if (!miss.length) return this.finish(true);
    if (this.time.now < this.flashUntil) return;
    this.flashUntil = this.time.now + 1500;
    const t = this.add.text(W / 2, 200, miss.join('\n'), font(16)).setOrigin(0.5).setScrollFactor(0).setDepth(25);
    this.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 600, onComplete: () => t.destroy() });
  }
  private addScore(n: number) { this.score += n; this.refresh(); }
  private stopClimb() { this.climbing = false; (this.player.body as Body).setAllowGravity(true); }

  private hit(fromX: number) {
    const now = this.time.now; if (now < this.invulUntil || this.over) return;
    this.invulUntil = now + 1600; this.knockUntil = now + 300;
    this.lives = loseLife(this.lives); this.refresh(); sfx('hit');
    if (this.climbing) this.stopClimb();
    this.player.setVelocity(this.player.x < fromX ? -160 : 160, -220);
    this.tweens.add({ targets: this.player, alpha: 0.3, yoyo: true, repeat: 6, duration: 110, onComplete: () => this.player.setAlpha(1) });
    if (this.lives <= 0) this.finish(false);
  }

  private finish(win: boolean) {
    if (this.over) return;
    this.over = true; this.won = win; this.stamp = Date.now(); this.physics.pause();
    if (win) { this.addScore(LEVEL_BONUS + this.lives * 50); sfx('win'); }
    const best = saveBest(this.score), s = this.score;
    const more = win && this.lvl + 1 < LEVELS.length;
    this.msg.setText(!win ? `GAME OVER\n\nPuntos: ${s}\nRécord: ${best}\n\nToca para volver`
      : more ? `¡NIVEL COMPLETO!\n\nPuntos: ${s}\n\nToca para continuar`
      : `¡VICTORIA!\n¡Completaste el\nCamino Inca!\n\nPuntos: ${s}\nRécord: ${best}\n\nToca para volver`).setVisible(true);
  }

  private proceed() {
    if (this.paused) return this.togglePause();
    if (!this.over || Date.now() - this.stamp < 600) return;
    if (this.won && this.lvl + 1 < LEVELS.length) this.scene.restart({ level: this.lvl + 1, score: this.score, lives: this.lives });
    else this.scene.start('Menu');
  }

  private togglePause() {
    if (this.over) return;
    this.paused = !this.paused; this.stamp = Date.now();
    if (this.paused) { this.physics.pause(); this.time.paused = true; music.pause(); this.msg.setText('PAUSA\n\nToca o pulsa P\npara continuar').setVisible(true); }
    else { this.physics.resume(); this.time.paused = false; music.resume(); this.msg.setVisible(false); }
  }

  update(time: number) {
    if (this.over || this.paused) return;
    const c = this.cur, k = this.keys, t = this.t, fy = this.fy;
    const left = c.left.isDown || k.A.isDown || t.l, right = c.right.isDown || k.D.isDown || t.r;
    const up = c.up.isDown || k.W.isDown || t.u, down = c.down.isDown || k.S.isDown || t.d;
    const jump = c.space.isDown || t.j;
    const b = this.player.body as Body, n = this.near;
    const nb = n ? (n.body as Phaser.Physics.Arcade.StaticBody) : null;

    // Escaleras
    if (!this.climbing && nb && ((up && b.bottom > nb.top + 4) || (down && b.bottom < nb.bottom - 10))) {
      this.climbing = true; b.setAllowGravity(false); b.setVelocity(0, 0); this.player.x = n!.x;
    }
    if (this.climbing) {
      if (!nb || (up && b.bottom <= nb.top + 2)) this.stopClimb();
      else if (down && b.bottom >= nb.bottom - 8) { this.player.y -= b.bottom - (nb.bottom - 8); this.stopClimb(); }
      else { b.setVelocity(0, up ? -70 : down ? 70 : 0); this.player.angle = 0; if (up || down) this.player.setFlipX(Math.floor(time / 120) % 2 === 0); }
    }
    // Correr y saltar
    if (!this.climbing && time > this.knockUntil) {
      const vx = left ? -125 : right ? 125 : 0;
      this.player.setVelocityX(vx); if (vx) this.player.setFlipX(vx < 0);
      const ground = b.blocked.down || b.touching.down;
      if (ground && (jump || (up && !n))) { this.player.setVelocityY(-340); sfx('jump'); }
      this.player.angle = ground && vx ? Math.sin(time / 55) * 9 : 0;
    }
    this.near = null;

    // IA de llamas: las verdes escupen, las naranjas embisten
    this.llamas.getChildren().forEach((o) => {
      const l = o as Llama; if (!l.active) return;
      const dx = this.player.x - l.x, same = Math.abs(b.bottom - (fy(l.fl) - 8)) < 24;
      let spd = l.kind === 'charge' ? 45 : 30, charging = false;
      if (l.kind === 'charge' && shouldCharge(dx, same)) { spd = 175; charging = true; l.dir = Math.sign(dx) || l.dir; }
      else if (l.kind === 'spit' && same && Math.abs(dx) < 230 && time > l.nextShot) {
        l.nextShot = time + 1800; l.dir = Math.sign(dx) || l.dir;
        const s = this.shots.create(l.x + l.dir * 18, l.y - 8, 'spit').setScale(2).setDepth(4);
        s.setVelocityX(l.dir * 110); this.time.delayedCall(3500, () => s.destroy()); sfx('spit');
      }
      if (l.x < 24) l.dir = 1; if (l.x > W - 24) l.dir = -1;
      l.setVelocityX(l.dir * spd).setFlipX(l.dir < 0);
      if (l.kind === 'charge') l.setTint(charging ? 0xff4040 : 0xe8b070);
    });
  }
}
