import { AbsoluteFill, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "../../components/KineticText";
import { ease } from "../../lib/easing";
import { sans } from "../../lib/fonts";

type EndCardSceneProps = {
  readonly appName: string;
  readonly cta: string;
  readonly accent: string;
  readonly accent2: string;
};

const EndCardSceneInner: React.FC<EndCardSceneProps> = ({ appName, cta, accent, accent2 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const icon = 240 * u;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: sans, color: "white" }}>
      <div
        style={{
          position: "relative",
          width: icon,
          height: icon,
          borderRadius: icon * 0.225,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${accent}, ${accent2})`,
          boxShadow: `0 ${30 * u}px ${80 * u}px ${accent}55`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: icon * 0.5,
          fontWeight: 800,
          scale: interpolate(frame, [0, 0.7 * fps], [0, 1], {
            easing: ease.overshoot,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
          rotate: interpolate(frame, [0, 0.7 * fps], ["-14deg", "0deg"], {
            easing: ease.out,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {appName.charAt(0)}
        {/* Specular sweep */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
            translate: `${interpolate(frame, [0.6 * fps, 1.4 * fps], [-120, 120], { easing: ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" })}% 0`,
          }}
        />
      </div>

      <KineticText
        text={appName}
        delay={0.35 * fps}
        style={{ fontSize: 96 * u, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 48 * u }}
      />

      <div
        style={{
          marginTop: 36 * u,
          padding: `${22 * u}px ${48 * u}px`,
          borderRadius: 999,
          fontSize: 34 * u,
          fontWeight: 600,
          backgroundColor: "white",
          color: "#0a0a0a",
          opacity: interpolate(frame, [0.75 * fps, 1.2 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: `0 ${interpolate(frame, [0.75 * fps, 1.4 * fps], [40 * u, 0], { easing: ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px`,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};

export const EndCardScene = Interactive.create({
  Component: EndCardSceneInner,
  layout: "absolute-fill",
});
