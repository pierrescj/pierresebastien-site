// Full regression: desktop + phone, CSP errors, fonts, name morph, rule, panels, swipe, grid, privacy page
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8787';
const OUT = process.env.OUT || '/tmp';
(async () => {
  const b = await chromium.launch(); const problems = []; const log = m => console.log(m);
  const watch = (p, tag) => { p.on('pageerror', e => problems.push(`${tag} JS error: ${e.message}`));
    p.on('console', m => { if (m.type()==='error') problems.push(`${tag} console: ${m.text()}`); });
    p.on('requestfailed', r => { if (!/youtube|ytimg|google|gstatic|doubleclick/.test(r.url())) problems.push(`${tag} failed request: ${r.url()}`); }); };
  // desktop
  const d = await b.newPage({viewport:{width:1440,height:900}}); watch(d,'desktop');
  const t0 = Date.now(); await d.goto(BASE + '/', {waitUntil:'load'}); log(`desktop load ${Date.now()-t0}ms`);
  await d.waitForTimeout(500);
  log('font loaded: ' + await d.evaluate(()=>document.fonts.check('700 20px "Space Mono"')));
  await d.hover('.row[data-id="figma"]'); await d.waitForTimeout(250);
  log('hover sets stage: ' + await d.$eval('.layer.on', e=>e.dataset.id));
  await d.click('button[data-open="infoPanel"]'); await d.waitForTimeout(500);
  log('info open: ' + await d.$eval('#infoPanel', e=>e.open)); await d.screenshot({path:OUT + '/chk-desk-info.png'});
  await d.keyboard.press('Escape'); await d.waitForTimeout(300);
  await d.click('.row[data-id="figma"]'); await d.waitForTimeout(400); log('viewer open: ' + await d.$eval('#viewer', e=>e.open));
  const embed = await d.$eval('#screen', e=>{ const f=e.querySelector('iframe'); return f ? f.src : 'no player'; });
  log('player: ' + embed); if (!/youtube-nocookie\.com\/embed\/[\w-]{11}/.test(embed)) problems.push('figma does not open a YouTube player');
  await d.click('#viewer .x'); await d.waitForTimeout(400); log('viewer closed: ' + !(await d.$eval('#viewer', e=>e.open)));
  await d.screenshot({path:OUT + '/chk-desk.png'});
  const ov = await d.evaluate(()=>document.documentElement.scrollWidth > innerWidth); if (ov) problems.push('desktop horizontal overflow');
  // phone
  const p = await b.newPage({viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true}); watch(p,'phone');
  await p.goto(BASE + '/'); await p.waitForTimeout(700);
  for (const y of [0,60,120,200]) { await p.evaluate(y=>{document.documentElement.style.scrollSnapType='none';scrollTo(0,y)},y); await p.waitForTimeout(80);
    const r = await p.evaluate(()=>{ const w=[...document.querySelectorAll('#nbName .nw')].map(x=>x.getBoundingClientRect());
      return {overlap: w[1].left < w[0].right-1 && w[1].top < w[0].bottom-2 && w[1].bottom > w[0].top+2, rule: document.getElementById('nbLine').getBoundingClientRect().top}; });
    if (r.overlap) problems.push(`phone name words overlap at scroll ${y}`); }
  await p.evaluate(()=>{document.documentElement.style.scrollSnapType='';scrollTo(0,0)}); await p.waitForTimeout(200);
  await p.screenshot({path:OUT + '/chk-phone.png'});
  if (await p.evaluate(()=>document.documentElement.scrollWidth > innerWidth)) problems.push('phone horizontal overflow');
  await p.tap('.vbtn[data-view="grid"]'); await p.waitForTimeout(700); log('grid: ' + await p.evaluate(()=>document.documentElement.classList.contains('grid-view')));
  await p.tap('.vbtn[data-view="stack"]'); await p.waitForTimeout(700);
  const st = await p.evaluate(()=>{ const a=document.getElementById('acc'); return {shown: getComputedStyle(a).display!=='none', items: a.querySelectorAll('.acc-item').length, open: [...a.querySelectorAll('.acc-item')].map(e=>e.offsetHeight)}; });
  log('stack: ' + JSON.stringify(st)); if (!st.shown || st.items < 1 || Math.max(...st.open) < 200) problems.push('stack view did not open a panel');
  await p.tap('.vbtn[data-view="list"]'); await p.waitForTimeout(700);
  await p.tap('button[data-open="infoPanel"]'); await p.waitForTimeout(500); log('phone info open, page locked: ' + await p.evaluate(()=>getComputedStyle(document.documentElement).overflow));
  await p.tap('#infoPanel .x'); await p.waitForTimeout(400);
  await p.evaluate(()=>scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(400);
  log('footer visible at end: ' + await p.evaluate(()=>{const r=document.querySelector('.foot').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0;}));
  // privacy
  const q = await b.newPage({viewport:{width:390,height:844}, isMobile:true}); watch(q,'privacy');
  const res = await q.goto(BASE + '/privacy'); log('privacy status ' + res.status());
  await q.screenshot({path:OUT + '/chk-privacy.png', fullPage:true});
  // every image the site references (posters, phone covers, headshot) plus the fixed files
  const refs = await d.evaluate(()=>[...new Set([...document.querySelectorAll('img[src],source[srcset]')].map(e=>new URL(e.getAttribute('src')||e.getAttribute('srcset'), location.href).pathname))]);
  for (const f of ['/robots.txt','/sitemap.xml','/og.png','/og-share.jpg','/favicon.svg','/apple-touch-icon.png', ...refs]) {
    const r = await q.request.get(BASE + f); if (r.status() !== 200) problems.push(`${f} -> ${r.status()}`); }
  log(`checked ${refs.length} images`);
  log('PROBLEMS: ' + (problems.length ? '\n - ' + problems.join('\n - ') : 'none'));
  await b.close();
})();
