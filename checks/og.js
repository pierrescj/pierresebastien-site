// Rebuilds the link-preview image (og-share.jpg + og.png) from checks/og.html.
// Edit the covers in og.html when the work changes, then run: node checks/og.js
const { chromium } = require('playwright'); const path = require('path'); const { execFileSync } = require('child_process');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1200,height:630}});
  await p.goto('file://' + path.join(__dirname, 'og.html')); await p.waitForTimeout(600);
  const png = path.join(__dirname, '..', 'og.png'); await p.screenshot({path: png}); await b.close();
  execFileSync('python3', ['-c', `from PIL import Image; Image.open(r"${png}").convert("RGB").save(r"${path.join(__dirname,'..','og-share.jpg')}", quality=88, optimize=True, progressive=True)`]);
  console.log('og.png and og-share.jpg updated. Bump ?v= on og-share.jpg in index.html so apps refetch it.');
})();
