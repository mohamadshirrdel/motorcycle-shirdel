import { chromium } from 'playwright';
const BASE = 'http://localhost:27017';
const browser = await chromium.launch();
for (const [width, height, name] of [[375, 667, 'se-375.png'], [320, 568, 'se-320.png'], [390, 844, 'iphone-390.png']]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: `/home/user/aria-motor/.audit/${name}` });
  await page.close();
}
await browser.close();
console.log('done');
