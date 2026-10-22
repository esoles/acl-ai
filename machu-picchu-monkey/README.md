# Machu Picchu Monkey — La Aventura del Monito Inca

Juego arcade 2D de plataformas verticales (TypeScript + Vite + Phaser 3). Un monito con chullo y poncho inca sube las terrazas de Machu Picchu esquivando llamas, recogiendo monedas y llegando a la Puerta del Sol.

## Jugabilidad
- **Llamas verdes** escupen proyectiles; **llamas naranjas** embisten (se ponen rojas al atacar). Se las puede aplastar saltando encima (+100).
- Monedas +10, nivel completo +500 (+50 por vida restante). 3 vidas, invulnerabilidad breve tras un golpe.
- Récord guardado en `localStorage`.
- **Teclado:** ←/→ (o A/D) mover · ↑/W subir escalera o saltar · ↓/S bajar · Espacio saltar · P/Esc pausa · M silenciar · Enter confirmar.
- **Móvil:** botones táctiles en pantalla (aparecen en dispositivos táctiles) y botón ❚❚ de pausa.
- Música y efectos generados con WebAudio (escala pentatónica andina, punteo tipo charango y quena sintética): original, sin recursos de terceros.

## Requisitos e instalación
Node.js 20+.
```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # typecheck + build en dist/
npm run preview    # servir el build
```

## Pruebas
```bash
npm test                              # Vitest (unitarias)
npx playwright install chromium       # una sola vez
npm run test:e2e                      # Playwright (humo: carga y arranque)
```

## Publicación en GitHub Pages
1. Crea un repositorio en GitHub y sube el proyecto a la rama `main`:
   ```bash
   git init && git add . && git commit -m "Machu Picchu Monkey"
   git branch -M main && git remote add origin https://github.com/<usuario>/<repo>.git && git push -u origin main
   ```
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada push a `main` ejecuta `.github/workflows/deploy.yml` (tests → build → deploy). La URL queda en `https://<usuario>.github.io/<repo>/`.
4. `vite.config.ts` usa `base: './'`, por lo que funciona bajo cualquier nombre de repo.

## Arquitectura
```
src/main.ts          configuración Phaser
src/levels.ts        definición de niveles (datos) → añade niveles/enemigos aquí
src/logic.ts         reglas puras y récords (testeadas)
src/sprites.ts       pixel art definido en código
src/audio.ts         música y SFX procedurales
src/scenes/Menu.ts   menú · src/scenes/Game.ts  juego, HUD, pausa, victoria/Game Over
```
Para un nuevo tipo de enemigo: amplía `kind` en `levels.ts` y su rama de IA en `Game.update`.
