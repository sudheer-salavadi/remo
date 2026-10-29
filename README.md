# Remo

Make polished launch, promo and social videos for your apps with code: React components rendered to MP4 by [Remotion](https://remotion.dev). Comes with After Effects style easing, film grain, transitions, and ready-made templates you fill in with your own brand and content.

## Quick start

```bash
npm install
npm run dev        # opens Remotion Studio: preview, edit props in the side panel, render
```

Open the **Demo-Social** folder in Studio to see every template with a sample brand.

## Templates

| Template | What it makes | You provide |
|---|---|---|
| `Social/StatCards` | 9:16 stat reel; `stack`, `grid` or `spotlight` layout | title, 1–6 stats (label, value, note, emoji, visual), source |
| `Social/BarChart` | 9:16 animated bar chart with optional "top" range | rows (name, emoji, value, top), prefix/suffix, source |
| `Social/Quote` | 9:16 photo + headline with a marker-highlighted phrase | photo, headline parts, source |
| `AppPromo` | 16:9 / 9:16 app promo (hook, feature showcase, end card) | name, colours, headline, features, screenshot |

Social reels share a hook (big emoji, flags, or a full-bleed photo), your logo on screen throughout, an end card and a source line. Numbers like `46,100`, `$37.50` and `25%` count up on their own.

## Add your app

1. Copy `src/apps/demo/` to `src/apps/<your-app>/` and rename the file to `<your-app>.compositions.tsx`. It is picked up automatically.
2. Set your brand: name, URL, colours, and an SVG logo path.
3. Put images and footage in `public/apps/<your-app>/`.
4. Edit the props, preview in Studio, render.

**Your apps stay private.** `.gitignore` excludes everything in `src/apps/` and `public/apps/` except `demo/`, and all rendered output in `out/`. If you fork this repo, your brands and videos are not committed.

## Rendering

```bash
npm run lint                                         # eslint + tsc + motion checks (jitter, CSS 3D)
npm run render:final -- Demo-Stats out/stats.mp4     # recommended: verified, flicker-free H.264
npm run still -- Demo-Stats out/frame.jpg --frame=300
npm run render -- Demo-Stats out/stats.mp4           # plain H.264
npm run render:prores -- Demo-Stats out/stats.mov    # ProRes HQ for Premiere / AE / FCP
```

`render:final` (`scripts/render-clean.py`) renders an image sequence, detects corrupted captures (Chrome occasionally returns tiled or glitched frames), re-renders just those frames, then encodes H.264 + AAC. It needs **Python 3** and **ffmpeg** on your PATH.

`remotion.config.ts` uses Chrome for Testing, because the default headless shell hangs on some recent macOS versions.

## Conventions

See [`CLAUDE.md`](CLAUDE.md) for the motion quality rules (animate only transforms, opacity, filter and clip-path; no CSS 3D; hold text layers still) and project layout. It also works as instructions for AI coding agents.

## Licence

This project's code is MIT licensed (see [`LICENSE`](LICENSE)).

Remotion itself has its own licence: free for individuals and companies of up to 3 people; larger companies need a [Remotion company licence](https://www.remotion.pro/license). Using this project means you also accept Remotion's terms.

Fonts (Inter, Newsreader, Instrument Serif) load from Google Fonts under the SIL Open Font License. Emoji render with your system's emoji font.
