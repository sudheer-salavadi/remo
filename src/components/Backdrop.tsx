import { noise2D } from "@remotion/noise";
import { AbsoluteFill, Interactive, useCurrentFrame, useVideoConfig } from "remotion";

type BackdropProps = {
  readonly base: string;
  readonly colors: readonly string[];
};

/** Slow-drifting gradient mesh, driven by noise so it never loops visibly. */
const BackdropInner: React.FC<BackdropProps> = ({ base, colors }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const size = Math.max(width, height) * 0.9;

  return (
    <AbsoluteFill style={{ backgroundColor: base, overflow: "hidden" }}>
      {colors.map((color, i) => {
        const t = frame / 240;
        const x = (0.5 + noise2D(`x${i}`, t, i) * 0.45) * width;
        const y = (0.5 + noise2D(`y${i}`, i, t) * 0.45) * height;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              // Move with translate, not left/top: layout positions snap to whole pixels and jitter.
              translate: `${x - size / 2}px ${y - size / 2}px`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
              opacity: 0.55,
              filter: "blur(40px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Backdrop = Interactive.create({
  Component: BackdropInner,
  layout: "absolute-fill",
});
