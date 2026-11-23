import { chromium } from 'playwright';
const BASE = 'http://localhost:27017';
const browser = await chromium.launch();

// ۱) عرض دقیق نوار بالا در چند سایز گوشی
for (const width of [320, 360, 375, 390, 414, 768]) {
  const page = await browser.newPage({ viewport: { width, height: 667 } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
  const m = await page.evaluate(() => {
    const header = document.querySelector('header');
    const inner = header?.querySelector('.container-x');
    const kids = inner ? [...inner.children] : [];
    const boxes = kids.map(k => { const r = k.getBoundingClientRect(); return { cls: k.className.slice(0, 40), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) }; });
    const docOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const headerOverflow = boxes.length ? Math.round(Math.max(...boxes.map(b => b.right)) - Math.min(...boxes.map(b => b.left))) : 0;
    return { vw: document.documentElement.clientWidth, boxes, scrollWidth: document.documentElement.scrollWidth, docOverflow };
  });
  console.log('width', width, 'docOverflow', m.docOverflow, 'scrollWidth', m.scrollWidth);
  for (const b of m.boxes) console.log('     child:', b.left, '→', b.right, '(w', b.width + ')', b.cls);
  await page.close();
}

// ۲) کنسول صفحه‌ی محصول — خطای plain objects باید رفع شده باشد
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
await page.goto(BASE + '/bikes/ktm-390-duke-2024', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
console.log('console errors on product page:', errors.length ? JSON.stringify(errors, null, 2) : 'NONE');
await browser.close();
