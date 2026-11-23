import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
await page.goto('http://localhost:27017/bikes/ktm-390-duke-2024', { waitUntil: 'networkidle' });
const info = await page.evaluate(() => {
  const out = [];
  const vw = document.documentElement.clientWidth;
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > vw + 50 || r.right > vw + 50 || r.left < -50) {
      out.push({
        tag: el.tagName,
        cls: (el.className && el.className.baseVal !== undefined ? '' : el.className)?.toString().slice(0, 120),
        w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right),
        scrollW: el.scrollWidth,
      });
    }
  });
  return { vw, scrollW: document.documentElement.scrollWidth, count: out.length, items: out.slice(0, 30) };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
