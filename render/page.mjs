import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
import path from 'path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

export async function openFilm() {
  const browser = await chromium.launch({
    executablePath: EXE,
    args: ['--allow-file-access-from-files', '--disable-web-security', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
  await page.goto(pathToFileURL(path.join(ROOT, 'src', process.env.FILM || 'index.html')).href, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready !== undefined, null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => window.__ready);
  if (errors.length) console.error('[page]', errors.join('\n'));
  const duration = await page.evaluate(() => window.DURATION);
  const cdp = await page.context().newCDPSession(page);
  async function frame(t, format = 'jpeg', quality = 95) {
    await page.evaluate((t) => window.__seek(t), t);
    const { data } = await cdp.send('Page.captureScreenshot', { format, quality: format === 'jpeg' ? quality : undefined, optimizeForSpeed: true });
    return Buffer.from(data, 'base64');
  }
  return { browser, page, frame, duration, errors };
}
