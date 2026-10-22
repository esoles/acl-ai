import Phaser from 'phaser';
import { makeTextures } from '../sprites';
import { loadBest } from '../logic';
import { music } from '../audio';

export class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    if (!this.textures.exists('monkey')) makeTextures(this);
    this.cameras.main.setBackgroundColor(0x7ec8f0);
    const g = this.add.graphics();
    g.fillStyle(0x6f8fa8).fillTriangle(-80, 600, 100, 300, 280, 600);
    g.fillStyle(0x4f7a62).fillTriangle(120, 600, 300, 380, 480, 600);
    g.fillStyle(0x57b947).fillRect(0, 560, 360, 80);
    const T = (y: number, s: string, size: number, color = '#fff') =>
      this.add.text(180, y, s, { fontFamily: 'monospace', fontSize: size + 'px', color, align: 'center', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    T(110, 'MACHU PICCHU\nARCADE', 34, '#f2c230');
    T(185, 'La Aventura del Monito Inca', 14);
    const m = this.add.sprite(150, 470, 'monkey').setScale(6);
    this.add.sprite(250, 500, 'llama').setScale(4).setFlipX(true);
    this.tweens.add({ targets: m, y: 450, yoyo: true, repeat: -1, duration: 400 });
    T(300, `RÉCORD: ${loadBest()}`, 18, '#ffd');
    T(350, '← → mover   ↑ saltar/escalar\nESPACIO saltar   P pausa   M sonido', 12);
    const go = T(410, 'TOCA O PULSA ENTER', 18, '#fff');
    this.tweens.add({ targets: go, alpha: 0.2, yoyo: true, repeat: -1, duration: 600 });
    const start = () => { music.start(); this.scene.start('Game', { level: 0 }); };
    this.input.once('pointerdown', start);
    this.input.keyboard!.once('keydown-ENTER', start);
    this.input.keyboard!.once('keydown-SPACE', start);
  }
}
