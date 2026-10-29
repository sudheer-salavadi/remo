import { AbsoluteFill, Img, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "../../components/KineticText";
import { ease } from "../../lib/easing";
import { newsreaderUpright, sans } from "../../lib/fonts";
import type { QuoteProps } from "./schema";
import { clamp, Shell, shellFrames, SourceLine, src } from "./Shell";

/**
 * News-headline over a photo. Paraphrases go here as headlines with a source line,
 * never in quotation marks as the person's own words.
 */
const BODY = 560;
export const quoteFrames = (p: QuoteProps) => shellFrames(BODY, Boolean(p.hook));

const PHRASE: React.CSSProperties = {
  justifyContent: "flex-start",
  fontFamily: newsreaderUpright,
  fontSize: 84,
  fontWeight: 500,
  lineHeight: 1.12,
  color: "white",
  whiteSpace: "nowrap",
};

const QuoteInner: React.FC<QuoteProps> = ({ image, focus, chip, lead, highlight, rest, source, brand }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const reveal = interpolate(frame, [0, 0.8 * fps], [0, 1], { easing: ease.out, ...clamp });
  // The photo layer carries no text, so a slow continuous push is fine here.
  const push = interpolate(frame, [0, durationInFrames], [1.0, 1.07], { easing: ease.easy });
  const shade = interpolate(frame, [0.4 * fps, 1.2 * fps], [0, 1], { easing: ease.out, ...clamp });
  const leadWords = lead.split(" ").length;
  const hiAt = 0.9 * fps + leadWords * 3 + 18;
  const restAt = hiAt + highlight.split(" ").length * 4 + 18;
  const mark = interpolate(frame, [restAt + 0.6 * fps, restAt + 1.2 * fps], [0, 1], { easing: ease.inOut, ...clamp });
  const chipIn = interpolate(frame, [0.35 * fps, 0.9 * fps], [0, 1], { easing: ease.out, ...clamp });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0d10", overflow: "hidden" }}>
      <Img
        src={src(image)}
        style={{
          position: "absolute",
          width: 1080,
          height: 1920,
          objectFit: "cover",
          objectPosition: focus,
          scale: String(push * (1.08 - 0.08 * reveal)),
          transformOrigin: "50% 30%",
          filter: `blur(${(1 - reveal) * 18}px)`,
          opacity: reveal,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,14,0) 38%, rgba(8,10,14,0.55) 58%, rgba(8,10,14,0.88) 100%)", opacity: shade }} />

      <div
        style={{
          position: "absolute",
          left: 70,
          top: 230,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 22px",
          borderRadius: 99,
          backgroundColor: "rgba(10,12,16,0.55)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "white",
          fontFamily: sans,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "0.08em",
          opacity: chipIn,
          translate: `0 ${(1 - chipIn) * 16}px`,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: "#ef4444" }} />
        {chip}
      </div>

      <div style={{ position: "absolute", left: 70, right: 70, top: 1010, color: "white" }}>
        <KineticText text={lead} delay={0.9 * fps} stagger={3} style={{ justifyContent: "flex-start", fontFamily: sans, fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.82)", lineHeight: 1.3 }} />
        <div style={{ position: "relative", display: "inline-block", marginTop: 18 }}>
          <div style={{ position: "absolute", inset: "8px -14px 2px -14px", borderRadius: 10, backgroundColor: "#f5f5f0", clipPath: `inset(0 ${(1 - mark) * 100}% 0 0 round 10px)` }} />
          <KineticText text={highlight} delay={hiAt} stagger={4} style={PHRASE} />
          {/* Ink copy clipped by the same wipe, so the colour flips exactly at the marker's edge */}
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - mark) * 100}% 0 0)` }}>
            <KineticText text={highlight} delay={hiAt} stagger={4} style={{ ...PHRASE, color: brand.ink }} />
          </div>
        </div>
        <KineticText text={rest} delay={restAt} stagger={3} style={{ justifyContent: "flex-start", fontFamily: newsreaderUpright, fontSize: 72, fontWeight: 500, lineHeight: 1.12, marginTop: 8 }} />
      </div>

      <SourceLine text={source} at={(restAt + 1.4 * fps) / fps} color="rgba(255,255,255,0.7)" />
    </AbsoluteFill>
  );
};

export const QuoteBody = Interactive.create({ Component: QuoteInner, layout: "absolute-fill" });

export const Quote: React.FC<QuoteProps> = (props) => (
  <Shell brand={props.brand} hook={props.hook} endLine={props.endLine} body={BODY}>
    <QuoteBody {...props} />
  </Shell>
);
