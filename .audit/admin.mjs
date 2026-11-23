import { chromium } from 'playwright';

const BASE = 'http://localhost:27017';
const widths = [360, 390, 768, 1024, 1280, 1440];
const adminPaths = ['/admin', '/admin/products', '/admin/orders', '/admin/comments', '/admin/tickets', '/admin/users'];

const browser = await chromium.launch();
const context = await browser.newContext();

// ورود ادمین از طریق API
const resp = await context.request.post(BASE + '/api/admin/login', {
  data: { username: 'mohammad', password: 'mmd073191' },
  headers: { 'Content-Type': 'application/json' },
});
console.log('login status:', resp.status());
const body = await resp.text();
console.log('login body:', body.slice(0, 200));

for (const width of widths) {
  const page = await context.newPage();
  await page.setViewportSize({ width, height: 800 });
  for (const path of adminPaths) {
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const url = page.url();
      const flag = overflow > 0 ? `OVERFLOW +${overflow}px` : 'ok';
      console.log(String(width).padEnd(5), path.padEnd(18), flag, url.includes('/admin/login') ? 'REDIRECTED-TO-LOGIN' : '');
    } catch (e) {
      console.log(String(width).padEnd(5), path.padEnd(18), 'ERROR:', e.message.split('\n')[0]);
    }
  }
  await page.close();
}

// اسکرین‌شات ادمین در موبایل و تبلت
const shots = [
  ['/admin', 390, 'admin-dash-390.png'],
  ['/admin/orders', 390, 'admin-orders-390.png'],
  ['/admin/products', 390, 'admin-products-390.png'],
  ['/admin/orders', 768, 'admin-orders-768.png'],
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
