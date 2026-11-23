import { chromium } from 'playwright';
const BASE = 'http://localhost:27017';
const paths = ['/', '/bikes', '/bikes/ktm-390-duke-2024', '/cart', '/checkout', '/track', '/tickets', '/login', '/contact', '/about'];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  try {
    const cart = [{ id: 'x1', slug: 'ktm-390-duke-2024', title: 'KTM 390 Duke 2024', image: '/images/bikes/ktm-390-duke.webp', price: 820000000, qty: 1, stock: 12 }];
    if (!localStorage.getItem('shirdel-cart-v1')) localStorage.setItem('shirdel-cart-v1', JSON.stringify(cart));
  } catch {}
});
for (const path of paths) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(800);
    const interesting = errors.filter(e => !/\b401\b|Failed to load resource/.test(e));
    console.log(path.padEnd(28), interesting.length ? 'ERRORS:\n   ' + interesting.join('\n   ') : 'clean');
  } catch (e) {
    console.log(path.padEnd(28), 'NAV-ERROR:', e.message.split('\n')[0]);
  }
  await page.close();
}
await browser.close();
