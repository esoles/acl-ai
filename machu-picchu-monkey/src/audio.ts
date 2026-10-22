// Música y efectos 100% procedurales (WebAudio): sin archivos ni material protegido.
let ctx: AudioContext | undefined, master: GainNode, timer: number | undefined, nextT = 0, step = 0, muted = false;
const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);
// Escala pentatónica menor de La (típica andina)
const LEAD = [69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 76, 79, 76, 74, 72, 74];
const BASS = [45, 45, 52, 45, 43, 43, 50, 43, 45, 45, 52, 45, 41, 41, 48, 50];

function tone(f: number, t: number, d: number, type: OscillatorType, v: number, vib = 0) {
  const c = ctx!, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = f;
  if (vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.5; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + d + 0.02); }
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.02);
}
function playStep(s: number, t: number) {
  const i = s % 16;
  tone(hz(LEAD[i]), t, 0.12, 'square', 0.04);            // punteo tipo charango
  tone(hz(BASS[i]), t, 0.14, 'triangle', 0.12);          // bajo
  if (i === 0 || i === 8) tone(hz(LEAD[(i + 3) % 16] + 12), t, 0.6, 'sine', 0.07, 1); // quena con vibrato
}
export const music = {
  start() {
    if (!ctx) { ctx = new AudioContext(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(ctx.destination); }
    ctx.resume();
    if (timer !== undefined) return;
    nextT = ctx.currentTime + 0.1;
    timer = window.setInterval(() => { while (nextT < ctx!.currentTime + 0.25) { playStep(step++, nextT); nextT += 0.15; } }, 60);
  },
  pause() { ctx?.suspend(); },
  resume() { ctx?.resume(); },
  toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.6; },
};
export function sfx(k: 'jump' | 'coin' | 'hit' | 'win' | 'spit') {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  if (k === 'jump') { tone(520, t, 0.1, 'square', 0.07); tone(780, t + 0.06, 0.1, 'square', 0.07); }
  else if (k === 'coin') { tone(988, t, 0.07, 'square', 0.07); tone(1319, t + 0.07, 0.2, 'square', 0.07); }
  else if (k === 'hit') tone(110, t, 0.3, 'sawtooth', 0.15);
  else if (k === 'spit') tone(300, t, 0.1, 'sawtooth', 0.05);
  else [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.12, 0.2, 'square', 0.08));
}
