import { AbsoluteFill, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PhoneFrame } from "../../components/PhoneFrame";
import { ease } from "../../lib/easing";
import { sans } from "../../lib/fonts";
import { AppScreen } from "./AppScreen";
import type { AppPromoProps } from "./schema";

type ShowcaseSceneProps = Pick<AppPromoProps, "appName" | "base" | "accent" | "accent2" | "features" | "screenshot">;

const ShowcaseSceneInner: React.FC<ShowcaseSceneProps> = ({ features, ...brand }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const landscape = width > height;
  const phoneHeight = (landscape ? 860 : 1000) * u;

  const enter = interpolate(frame, [0, 1.1 * fps], [0, 1], {
    easing: ease.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        flexDirection: landscape ? "row" : "column",
        justifyContent: "center",
        alignItems: "center",
        gap: (landscape ? 160 : 70) * u,
        fontFamily: sans,
        color: "white",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background: `radial-gradient(circle, ${brand.accent}66 0%, transparent 60%)`,
            filter: "blur(60px)",
            opacity: enter,
          }}
        />
        <PhoneFrame
          height={phoneHeight}
          style={{
            // 2D only: CSS 3D transforms intermittently mis-render in this machine's Chrome. Use @remotion/three for real 3D.
            translate: `0 ${(1 - enter) * 70}%`,
            // Hold still once landed: slow continuous rotate/scale makes the screen's text shimmer.
            rotate: `${(1 - enter) * -8}deg`,
            scale: String(0.92 + 0.08 * enter),
            opacity: interpolate(enter, [0, 0.3], [0, 1]),
          }}
        >
          <AppScreen {...brand} size={phoneHeight} />
        </PhoneFrame>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 34 * u, width: (landscape ? 640 : 860) * u }}>
        {features.map((f, i) => {
          const start = 0.55 * fps + i * 0.22 * fps;
          const p = interpolate(frame, [start, start + 0.8 * fps], [0, 1], {
            easing: ease.out,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 26 * u,
                alignItems: "flex-start",
                opacity: p,
                translate: `${(1 - p) * 80 * u}px 0`,
                filter: `blur(${(1 - p) * 10}px)`,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 18 * u,
                  height: 18 * u,
                  marginTop: 14 * u,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${brand.accent}, ${brand.accent2})`,
                  boxShadow: `0 0 ${24 * u}px ${brand.accent}`,
                }}
              />
              <div>
                <div style={{ fontSize: 46 * u, fontWeight: 700, letterSpacing: "-0.02em" }}>{f.title}</div>
                <div style={{ fontSize: 30 * u, opacity: 0.65, marginTop: 6 * u, lineHeight: 1.35 }}>{f.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ShowcaseScene = Interactive.create({
  Component: ShowcaseSceneInner,
  layout: "absolute-fill",
});
