import { Audio } from "@remotion/media";
import { whoosh } from "@remotion/sfx";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Img, Interactive, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FilmFinish } from "../../components/FilmFinish";
import { KineticText } from "../../components/KineticText";
import { pushBlur } from "../../components/pushBlur";
import { ease } from "../../lib/easing";
import { newsreaderUpright, sans } from "../../lib/fonts";
import { type Brand, BrandProvider, Logo, useBrand } from "./brand";
import type { Hook } from "./schema";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const HOOK_FRAMES = 165;
export const END_FRAMES = 200;
const CUT = 15;

/** Public path or URL. */
export const src = (s: string) => (/^https?:\/\//.test(s) ? s : staticFile(s));

/** Colour emoji, rendered with the system emoji font so flags show as flags. */
export const Emoji: React.FC<{ readonly e: string; readonly size: number; readonly style?: React.CSSProperties }> = ({ e, size, style }) => (
  <span style={{ fontFamily: '"Apple Color Emoji", "Noto Color Emoji", sans-serif', fontSize: size, lineHeight: 1, display: "inline-block", ...style }}>{e}</span>
);

/** Shared entrance: rise + de-blur + fade. */
export const useRise = (start: number, dur = 0.6) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [start, start + dur * fps], [0, 1], { easing: ease.out, ...clamp });
  return { p, style: { opacity: p, translate: `0 ${(1 - p) * 24}px`, filter: `blur(${(1 - p) * 8}px)` } as React.CSSProperties };
};

// ───────── Logo bug: on screen for the whole reel ─────────

const LogoBug: React.FC = () => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [0.1 * fps, 0.7 * fps], [0, 1], { easing: ease.out, ...clamp });
  return (
    <div
      style={{
        position: "absolute",
        left: 58,
        top: 84,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 22px 10px 14px",
        borderRadius: 99,
        // A light pill, so the bug reads on paper backgrounds and on photos alike.
        backgroundColor: "rgba(255,255,255,0.72)",
        fontFamily: sans,
        fontSize: 36,
        fontWeight: 800,
        letterSpacing: "-0.04em",
        color: brand.ink,
        opacity: p,
        translate: `0 ${(1 - p) * -14}px`,
      }}
    >
      <Logo height={45} />
      {brand.name}
    </div>
  );
};

// ───────── Hook: plain, emoji, or photo ─────────

const HookInner: React.FC<{ readonly hook: Hook }> = ({ hook }) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const photo = Boolean(hook.image);
  const ink = photo ? "white" : brand.ink;
  const sub = photo ? "rgba(255,255,255,0.8)" : brand.sub;
  const fade = (a: number) => ({
    opacity: interpolate(frame, [a * fps, (a + 0.4) * fps], [0, 1], clamp),
    translate: `0 ${interpolate(frame, [a * fps, (a + 0.5) * fps], [16, 0], { easing: ease.out, ...clamp })}px`,
  });
  const pop = interpolate(frame, [0.05 * fps, 0.75 * fps], [0, 1], { easing: ease.overshoot, ...clamp });
  const reveal = interpolate(frame, [0, 0.8 * fps], [0, 1], { easing: ease.out, ...clamp });

  return (
    <AbsoluteFill style={{ justifyContent: photo ? "flex-end" : "center", alignItems: "center", textAlign: "center", color: ink, fontFamily: sans, paddingBottom: photo ? 260 : 0 }}>
      {hook.image ? (
        <>
          <Img
            src={src(hook.image)}
            style={{
              position: "absolute",
              inset: 0,
              width: 1080,
              height: 1920,
              objectFit: "cover",
              scale: String(interpolate(frame, [0, durationInFrames], [1.08, 1.0], { easing: ease.easy }) + 0.04 * (1 - reveal)),
              filter: `blur(${(1 - reveal) * 16}px)`,
              opacity: reveal,
            }}
          />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,14,0.15) 0%, rgba(8,10,14,0) 30%, rgba(8,10,14,0.55) 58%, rgba(8,10,14,0.9) 100%)" }} />
        </>
      ) : null}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {hook.emoji ? (
          <Emoji e={hook.emoji} size={150} style={{ marginBottom: 36, scale: String(Math.max(0.001, pop)), rotate: `${(1 - Math.min(1, pop)) * -14}deg` }} />
        ) : null}
        {hook.eyebrow ? <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.14em", color: sub, marginBottom: 30, ...fade(0.1) }}>{hook.eyebrow}</div> : null}
        <KineticText text={hook.title} delay={0.2 * fps} stagger={4} style={{ fontFamily: newsreaderUpright, fontWeight: 500, fontSize: 96, lineHeight: 1.06, padding: "0 50px" }} />
        {hook.italic ? (
          <KineticText text={hook.italic} delay={0.5 * fps} stagger={4} style={{ fontFamily: newsreaderUpright, fontWeight: 500, fontStyle: "italic", fontSize: 96, lineHeight: 1.12, padding: "0 50px" }} />
        ) : null}
        {hook.sub ? <div style={{ fontSize: 34, color: sub, marginTop: 34, padding: "0 110px", lineHeight: 1.35, ...fade(1.1) }}>{hook.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

export const SocialHook = Interactive.create({ Component: HookInner, layout: "absolute-fill" });

// ───────── End card ─────────

const EndInner: React.FC<{ readonly line: string }> = ({ line }) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = interpolate(frame, [0, 0.7 * fps], [0, 1], { easing: ease.overshoot, ...clamp });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", fontFamily: sans, color: brand.ink }}>
      <KineticText text={line} delay={0.1 * fps} stagger={3} style={{ fontFamily: newsreaderUpright, fontWeight: 500, fontSize: 80, lineHeight: 1.08, padding: "0 90px", marginBottom: 70 }} />
      <Logo height={178} style={{ scale: String(Math.max(0.001, logo)), rotate: `${(1 - Math.min(1, logo)) * -10}deg` }} />
      <KineticText text={brand.name} delay={0.4 * fps} style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 26 }} />
      <div
        style={{
          marginTop: 40,
          padding: "22px 46px",
          borderRadius: 999,
          backgroundColor: brand.ink,
          color: "white",
          fontSize: 38,
          fontWeight: 600,
          opacity: interpolate(frame, [0.9 * fps, 1.3 * fps], [0, 1], clamp),
          translate: `0 ${interpolate(frame, [0.9 * fps, 1.5 * fps], [30, 0], { easing: ease.out, ...clamp })}px`,
        }}
      >
        {brand.url}
      </div>
    </AbsoluteFill>
  );
};

export const SocialEnd = Interactive.create({ Component: EndInner, layout: "absolute-fill" });

// ───────── Source line ─────────

export const SourceLine: React.FC<{ readonly text: string; readonly at: number; readonly color?: string }> = ({ text, at, color }) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [at * fps, (at + 0.6) * fps], [0, 1], { easing: ease.out, ...clamp });
  return <div style={{ position: "absolute", left: 70, right: 70, top: 1790, fontFamily: sans, fontSize: 26, color: color ?? brand.sub, opacity: p }}>Source: {text}</div>;
};

// ───────── Shell ─────────

/** Total length for a body of `body` frames. */
export const shellFrames = (body: number, hasHook: boolean) => (hasHook ? HOOK_FRAMES - CUT : 0) + body + END_FRAMES - CUT;

export const Shell: React.FC<{ readonly brand: Brand; readonly hook?: Hook; readonly endLine: string; readonly body: number; readonly children: React.ReactNode }> = ({
  brand,
  hook,
  endLine,
  body,
  children,
}) => {
  const { fps } = useVideoConfig();
  const cut = linearTiming({ durationInFrames: CUT, easing: ease.inOut });
  const bodyStart = hook ? HOOK_FRAMES - CUT : 0;
  return (
    <BrandProvider value={brand}>
    <AbsoluteFill style={{ backgroundColor: brand.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.6) 0%, transparent 60%)" }} />
      <TransitionSeries name="Scenes">
        {hook ? (
          <TransitionSeries.Sequence name="Hook" durationInFrames={HOOK_FRAMES}>
            <SocialHook hook={hook} />
          </TransitionSeries.Sequence>
        ) : null}
        {hook ? <TransitionSeries.Transition presentation={pushBlur({ blur: 24 })} timing={cut} /> : null}
        <TransitionSeries.Sequence name="Body" durationInFrames={body}>
          {children}
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushBlur({ blur: 24 })} timing={cut} />
        <TransitionSeries.Sequence name="End card" durationInFrames={END_FRAMES}>
          <AbsoluteFill style={{ backgroundColor: brand.bg }}>
            <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.6) 0%, transparent 60%)" }} />
            <SocialEnd line={endLine} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <LogoBug />

      {hook ? (
        <Sequence from={bodyStart - 10} durationInFrames={fps} name="SFX whoosh in" layout="none">
          <Audio src={whoosh} volume={0.45} />
        </Sequence>
      ) : null}
      <Sequence from={bodyStart + body - CUT - 10} durationInFrames={fps} name="SFX whoosh out" layout="none">
        <Audio src={whoosh} volume={0.45} />
      </Sequence>

      <FilmFinish name="Finish" grain={0.07} vignette={0.12} />
    </AbsoluteFill>
    </BrandProvider>
  );
};
