import Phaser from 'phaser';
import { Menu } from './scenes/Menu';
import { Game } from './scenes/Game';

const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'app', width: 360, height: 640, pixelArt: true, backgroundColor: '#1b1b2f',
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 800 }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [Menu, Game],
});
(window as any).__game = game;
