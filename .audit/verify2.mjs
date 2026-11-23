import { chromium } from 'playwright';
const BASE = 'http://localhost:27017';
const browser = await chromium.launch();
for (const width of [320, 360, 375, 390, 414]) {
  const page = await browser.newPage({ viewport: { width, height: 667 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
  const m = await page.evaluate(() => {
    const header = document.querySelector('header');
    const row = header?.querySelector('.container-x.flex.h-16');
    const kids = row ? [...row.children] : [];
    const boxes = kids.map(k => { const r = k.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) }; });
    const clipped = boxes.some(b => b.left < -1 || b.right > document.documentElement.clientWidth + 1);
    return { vw: document.documentElement.clientWidth, boxes, clipped, docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  console.log('width', width, 'clipped:', m.clipped, 'docOverflow:', m.docOverflow);
  console.log('   ', JSON.stringify(m.boxes));
  await page.close();
}
await browser.close();
