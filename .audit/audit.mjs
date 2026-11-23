import { chromium } from 'playwright';

const BASE = 'http://localhost:27017';
const widths = [360, 390, 768, 1024, 1280, 1440];
const publicPaths = ['/', '/bikes', '/bikes/ktm-390-duke-2024', '/cart', '/checkout', '/track', '/tickets', '/tickets/T-DEMO1', '/login', '/contact', '/about'];

const browser = await chromium.launch();
const context = await browser.newContext();

// سبد خرید ساختگی برای صفحهٔ checkout
await context.addInitScript(() => {
  try {
    const cart = [
      { id: 'x1', slug: 'ktm-390-duke-2024', title: 'KTM 390 Duke 2024 — نیکد پرقدرت شهری', image: '/images/bikes/ktm-390-duke.webp', price: 820000000, qty: 2, stock: 12 },
      { id: 'x2', slug: 'honda-africa-twin-2024', title: 'Honda Africa Twin 2024 DCT World Tourer', image: '/images/bikes/honda-africa-twin.jpg', price: 2450000000, qty: 1, stock: 5 },
    ];
    if (!localStorage.getItem('shirdel-cart-v1')) localStorage.setItem('shirdel-cart-v1', JSON.stringify(cart));
  } catch {}
});

const results = [];
for (const width of widths) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 800 });
  for (const path of publicPaths) {
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      results.push([width, path, overflow]);
      const flag = overflow > 0 ? `OVERFLOW +${overflow}px` : 'ok';
      console.log(String(width).padEnd(5), path.padEnd(28), flag);
    } catch (e) {
      console.log(String(width).padEnd(5), path.padEnd(28), 'ERROR:', e.message.split('\n')[0]);
    }
  }
  await page.close();
}

// اسکرین‌شات‌های کلیدی برای بازبینی چشمی
const shots = [
  ['/', 390, 'home-390.png'],
  ['/bikes', 390, 'bikes-390.png'],
  ['/bikes/ktm-390-duke-2024', 390, 'product-390.png'],
  ['/checkout', 390, 'checkout-390.png'],
  ['/', 768, 'home-768.png'],
];
for (const [path, width, name] of shots) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: `/home/user/aria-motor/.audit/${name}`, fullPage: false });
  await page.close();
}

await browser.close();
console.log('done');
