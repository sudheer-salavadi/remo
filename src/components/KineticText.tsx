import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease } from "../lib/easing";

type KineticTextProps = {
  readonly text: string;
  readonly delay?: number;
  /** Frames between each word starting. */
  readonly stagger?: number;
  readonly style?: React.CSSProperties;
};

/**
 * Per-word rise + de-blur + fade, the standard premium title reveal.
 * Each word is masked by its own line box so it slides up "from behind" the baseline.
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delay = 0,
  stagger = 3,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.25em", ...style }}>
      {words.map((word, i) => {
        const start = delay + i * stagger;
        const p = interpolate(frame, [start, start + 0.7 * fps], [0, 1], {
          easing: ease.out,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.12em" }}>
            <span
              style={{
                display: "inline-block",
                translate: `0 ${(1 - p) * 100}%`,
                opacity: p,
                filter: `blur(${(1 - p) * 12}px)`,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};
