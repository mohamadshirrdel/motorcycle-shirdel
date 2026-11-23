import { chromium } from 'playwright';
const BASE = 'http://localhost:27017';
const browser = await chromium.launch();
const context = await browser.newContext();
const resp = await context.request.post(BASE + '/api/admin/login', {
  data: { username: 'mohammad', password: 'mmd073191' },
  headers: { 'Content-Type': 'application/json' },
});
console.log('login:', resp.status());
for (const [path, width, name] of [
  ['/admin/products', 390, 'admin-products-390-full.png'],
  ['/admin/orders', 390, 'admin-orders-390-full.png'],
  ['/admin/products', 768, 'admin-products-768-full.png'],
  ['/admin/users', 390, 'admin-users-390-full.png'],
]) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 800 });
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: `/home/user/aria-motor/.audit/${name}`, fullPage: true });
  // اطلاعات نمایشی صفحه‌بندی
  const pag = await page.evaluate(() => {
    const el = document.querySelector('.pagination');
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const links = [...el.querySelectorAll('.page-link, a, button, li')].map(n => n.textContent.trim()).filter(Boolean);
    return { found: true, display: cs.display, flexDirection: cs.flexDirection, width: Math.round(r.width), items: links.slice(0, 12) };
  });
  console.log(path, width, JSON.stringify(pag));
  await page.close();
}
await browser.close();
console.log('done');
