import { AbsoluteFill, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "../../components/KineticText";
import { ease } from "../../lib/easing";
import { sans } from "../../lib/fonts";

type HookSceneProps = {
  readonly appName: string;
  readonly headline: string;
  readonly accent: string;
};

const HookSceneInner: React.FC<HookSceneProps> = ({ appName, headline, accent }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width, height) / 1080;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: sans,
        color: "white",
        padding: 120 * u,
        // Slow "camera push" across the whole scene.
        scale: interpolate(frame, [0, durationInFrames], [1, 1.06], { easing: ease.easy }),
      }}
    >
      <div
        style={{
          fontSize: 30 * u,
          fontWeight: 600,
          textTransform: "uppercase",
          color: accent,
          marginBottom: 36 * u,
          letterSpacing: "0.32em",
          translate: `0 ${interpolate(frame, [0, 1.2 * fps], [24 * u, 0], { easing: ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
          filter: `blur(${interpolate(frame, [0, 0.8 * fps], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        {appName}
      </div>
      <KineticText
        text={headline}
        delay={0.25 * fps}
        stagger={0.06 * fps}
        style={{
          fontSize: (width > height ? 118 : 104) * u,
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
          textAlign: "center",
          maxWidth: width > height ? 1500 * u : 900 * u,
        }}
      />
    </AbsoluteFill>
  );
};

export const HookScene = Interactive.create({
  Component: HookSceneInner,
  layout: "absolute-fill",
});
