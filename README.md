# pierresebastien.com

Portfolio site for Pierre-Sebastien Cabrejo-Jones. Plain HTML, no build step, no dependencies.
Every change pushed to `main` goes live automatically on Vercel.

## Files

- `index.html`: the whole site (styles, markup, script). The list of work is the `WORKS` block in the script.
- `privacy.html`: privacy and site notice, served at `/privacy`.
- `assets/`: headshot, posters, and `fonts/` (Space Mono Bold, self-hosted, SIL Open Font License).
- `vercel.json`: clean URLs, security headers, caching.
- `robots.txt`: search engines allowed, AI training crawlers asked to stay out.

## Adding a piece of work

Add an entry to `WORKS` in `index.html`:

- `poster`: a wide JPEG in `assets/` (leave empty for a blue title card); `posterTall`: an optional 4:5 JPEG for phones
- Each cover also gets a lighter `.avif` copy beside it with the same name, which browsers use when they can:
  `python3 -c "from PIL import Image; Image.open('assets/NAME.jpg').save('assets/NAME.avif', 'AVIF', quality=70)"`
- `youtube`: a YouTube link for the full film (plays in privacy-enhanced mode)
- `src`: a short video file in `assets/` instead of YouTube (keep it small, see below)

## Video files

Keep full-length films on YouTube or Vimeo. Only short, silent, compressed clips (H.264 MP4, around 720p, ideally under 5 MB)
belong in this repo: GitHub refuses files over 100 MB, and every visitor's download counts against Vercel's bandwidth.

## Health check

`checks/` holds a local test run (not deployed, see `.vercelignore`):

    node checks/serve.js . 8787 &      # mimics Vercel: clean URLs + headers from vercel.json
    node checks/check.js http://localhost:8787

It loads the site at desktop (wide and tall windows) and phone sizes, opens every panel, scrolls the name animation, checks the accordion and grid,
checks every asset and the privacy page, and lists any problems. Screenshots land in /tmp (or $OUT).

## Link preview image

`og-share.jpg` is what iMessage, WhatsApp and LinkedIn show when the link is shared. When the work changes,
update the covers in `checks/og.html` and run `node checks/og.js`.
Run it three ways before shipping animation changes: as is, with `FALLBACK=1` (no scroll-linked animations, as on older Safari),
and with `REDUCED=1` (reduce motion turned on).
