import { test, expect } from '@playwright/test';
test('carga el juego y empieza a jugar', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window as any).__game?.scene.isActive('Game'));
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(800); await page.keyboard.up('ArrowRight');
  expect(errors).toEqual([]);
});
