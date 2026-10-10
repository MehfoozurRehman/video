// Which Chromium to drive: $CHROME if set, else Playwright's own install (npx playwright install chromium),
// else the cloud session's pre-installed headless shell.
import fs from 'fs';
import { chromium } from 'playwright-core';
const CLOUD = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
export function chromePath() {
  if (process.env.CHROME) return process.env.CHROME;
  try { const p = chromium.executablePath(); if (p && fs.existsSync(p)) return p; } catch (e) {}
  if (fs.existsSync(CLOUD)) return CLOUD;
  throw new Error('No Chromium found. Run: npx playwright install chromium   (or set CHROME=/path/to/chrome)');
}
