// Export subtitles to pe-asteptare.srt from window.SUBS (the same cues as the burned-in subtitles). Run from anywhere: node srt.mjs
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const { openDemo, closeServer } = await import(path.join(process.env.LIB, 'core/render/page.mjs'));
const { browser, page } = await openDemo(dir);
const subs = await page.evaluate(() => window.SUBS);
const ts = t => { const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
fs.writeFileSync(path.join(dir, 'pe-asteptare.srt'), subs.map((s, i) => `${i + 1}\n${ts(s.t0)} --> ${ts(s.t1)}\n${s.who}: ${s.text}\n`).join('\n'));
console.log('srt', subs.length); await browser.close(); closeServer();
