# Remo: video production for all apps

Remotion 4.0.536 project. Goal: launch/promo/social videos for every app, at After Effects finish quality.

## Before writing composition code

Load the `remotion-best-practices` skill (installed in `.claude/skills/`). Remotion's API has moved well past most training data:
`Interactive.create()`, `Track`, connected compositions, `@remotion/effects` (WebGL effects on `<Solid>`/`<Img>`/`<Video>`), `HtmlInCanvas`.
`@remotion/light-leaks` is deprecated: use `lightLeak()` from `@remotion/effects/light-leak`.

## Layout

- `src/lib/easing.ts`: AE-equivalent curves (`ease.easy` = F9 Easy Ease, `ease.out`, `ease.in`, `ease.inOut`, `ease.overshoot`, springs). Use these, never linear, for anything that moves.
- `src/lib/fonts.ts`: Inter + Instrument Serif via `@remotion/google-fonts`.
- `src/components/`: shared building blocks: `Backdrop` (noise-driven gradient mesh), `FilmFinish` (SVG grain + vignette, always the last layer), `KineticText` (per-word masked reveal), `PhoneFrame`, `LightLeakOverlay`, `pushBlur` transition.
- `src/templates/<Template>/`: parameterised multi-scene templates with a zod schema. Scenes are `Interactive.create({layout: 'absolute-fill'})` and registered as connected compositions.
- `src/apps/<app>/<app>.compositions.tsx`: each app's compositions (default export). `Root.tsx` discovers these files automatically.
- `public/apps/<app>/`: per-app assets (screenshots, screen recordings, logos, music). Reference with `staticFile("apps/<app>/…")`.

## Privacy: apps are private by default

This repo is public. `.gitignore` excludes everything in `src/apps/` and `public/apps/` except `demo/`, so client brands, footage and rendered videos (`out/`) never get committed.
- Never put client names, brand details, footage or data in tracked files (templates, components, lib, scripts, this file, README). Keep them in `src/apps/<app>/`, `public/apps/<app>/` or `CLAUDE.local.md` (gitignored).
- Before committing, run `git add -n .` and check that no app other than `demo` appears.

## Adding a new app

1. Copy `src/apps/demo/` to `src/apps/<app>/`, rename the file to `<app>.compositions.tsx`, and set your brand (name, url, colours, logo path).
2. Drop assets in `public/apps/<app>/`.
3. `npm run dev` to preview and tweak.

## Quality rules (the AE look)

- Every move eased; stagger related elements (2–4 frames at 60fps).
- Entrances combine translate + opacity + blur. Avoid opacity-only fades.
- Depth: slow camera push on scenes, soft shadows and glow behind hero objects, slight 2D rotate/scale on devices.
- **Hold text-heavy layers still** (phone screens, cards, UI): no slow continuous `rotate`/`scale` drift on them. Tiny per-frame rotation or rescaling of fine text makes it shimmer and crawl. Animate them in and out, then hold; put ambient motion on backgrounds instead.
- **No CSS 3D** (`perspective`, `rotateX/Y`, `rotate3d`, `translateZ/3d`): Chrome on this Mac intermittently clips 3D-transformed layers, which flickers in renders. For real 3D use `@remotion/three`.
- Finish pass on every final comp: `<FilmFinish>` last.
- Size everything off `u = Math.min(width, height) / 1080` so 16:9, 9:16 and 1:1 all work from one scene.
- 60fps by default. Drive animation only with `useCurrentFrame()`; CSS transitions and Tailwind `animate-*` do not render.
- **Animate only `translate` / `scale` / `rotate`, `opacity`, `filter` and `clip-path`.** Never animate layout props (`left`, `top`, `width`, `height`, margins, padding, `fontSize`, `letterSpacing`…): Chrome snaps them to whole pixels and slow moves visibly jitter (measured here: `left` jittered ~9× more than `translate`). Position with fixed `left/top: 0` and move with `translate`; grow things with `clip-path: inset(...)` or `scale`. `npm run lint` runs `scripts/check-motion.mjs`, which fails on animated layout props and CSS 3D.

## Social reels (use these first, they save most of the work)

`src/templates/Social/`, examples in `src/apps/demo/`. A new reel is one `<Composition>` with props in the app's compositions file; do not hand-write a new reel file.
- `StatCards`: layout `stack | grid | spotlight`; per stat `emoji`, `visual` (`none | emoji | ring | crowd | trend | image`), value strings count up ("46,100", "$37.50", "25%") or wipe on (words).
- `BarChart`: rows with `emoji`, `value`, optional `top` (lighter extension), prefix/suffix.
- `Quote`: photo + headline with a marker-highlighted phrase. Paraphrases stay headlines with a source line, never in quotation marks.
- Shared shell: `brand` (name, url, ink, sub, bg, logo path), optional hook (`emoji` for flags/icons, or `image` for a photo hook), the brand's logo bug on screen the whole reel, end card, source line.
- Vary reels on purpose (layout, `brand.bg`, hook emoji vs photo) so they don't all look alike. Images go in `public/apps/<app>/` or use an https URL.

## Rendering

- `remotion.config.ts` sets `chromeMode: chrome-for-testing`. The default headless shell hangs on this Mac (macOS 27) at "Waiting for root component to load". Do not remove it.
- **Final deliverables: `npm run render:final -- <CompId> out/x.mp4`** (`scripts/render-clean.py`). Run `npm run lint` first. Chrome for Testing on this Mac randomly returns corrupted frames (the top band tiled down the image), independent of concurrency and WebGL. The script renders an image sequence, detects bad captures (tiled frames, and one-frame blips that differ from both neighbours), re-renders only those frames as stills, then encodes H.264 + AAC. Plain `remotion render` output can flicker.
- `npm run still -- <CompId> out/f.jpg --frame=120`: quick frame check.
- `npm run render -- <CompId> out/x.mp4`: shareable H.264 (CRF 18).
- `npm run render:hq`: master H.264 (CRF 12, slow). Large files because grain is expensive to encode.
- `npm run render:4k`: same at 2× scale.
- `npm run render:prores`: ProRes HQ for Premiere/AE/FCP.
- `npm run render:alpha`: ProRes 4444 with alpha, for overlays and lower thirds (comp must have no background).
- Only render when explicitly asked. Otherwise preview in Studio.

## Studio preview notes

WebGL `@remotion/effects` work in any Chrome. `HtmlInCanvas`-based features (`HtmlInCanvasMotionBlur`, shader transitions like `zoomBlur`, `crossZoom`, `blurSlide`) need `chrome://flags/#canvas-draw-element` (Chrome 149+) to preview. Renders don't need the flag.
