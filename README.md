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

- `poster`: an image in `assets/` (portrait 4:5 looks best on phones; leave empty for a blue title card)
- `youtube`: a YouTube link for the full film (plays in privacy-enhanced mode)
- `src`: a short video file in `assets/` instead of YouTube (keep it small, see below)

## Video files

Keep full-length films on YouTube or Vimeo. Only short, silent, compressed clips (H.264 MP4, around 720p, ideally under 5 MB)
belong in this repo: GitHub refuses files over 100 MB, and every visitor's download counts against Vercel's bandwidth.

## Health check

`checks/` holds a local test run (not deployed, see `.vercelignore`):

    node checks/serve.js . 8787 &      # mimics Vercel: clean URLs + headers from vercel.json
    node checks/check.js http://localhost:8787

It loads the site at desktop and phone sizes, opens every panel, scrolls the name animation, switches views,
checks every asset and the privacy page, and lists any problems. Screenshots land in /tmp (or $OUT).
