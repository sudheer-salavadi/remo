import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease } from "../../lib/easing";
import { sans } from "../../lib/fonts";
import type { Brand } from "./schema";

type AppScreenProps = Brand & {
  readonly screenshot?: string;
  /** Screen height in px, used to scale the mock UI. */
  readonly size: number;
};

/** Shows the real screenshot if provided, otherwise a branded placeholder UI that scrolls. */
export const AppScreen: React.FC<AppScreenProps> = ({ screenshot, size, appName, accent, accent2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = size / 100;

  const scroll = interpolate(frame, [1.6 * fps, 3.4 * fps], [0, -22 * u], {
    easing: ease.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (screenshot) {
    return (
      <Img
        src={staticFile(screenshot)}
        style={{ width: "100%", translate: `0 ${scroll}px`, display: "block" }}
      />
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#0b0b0f", fontFamily: sans, color: "white" }}>
      <div style={{ padding: `${8 * u}px ${5 * u}px`, translate: `0 ${scroll}px` }}>
        <div style={{ fontSize: 4.2 * u, fontWeight: 700, marginBottom: 3 * u }}>{appName}</div>
        <div
          style={{
            height: 26 * u,
            borderRadius: 3.5 * u,
            background: `linear-gradient(135deg, ${accent}, ${accent2})`,
            marginBottom: 3 * u,
            padding: 3 * u,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div style={{ width: "55%", height: 2 * u, borderRadius: u, backgroundColor: "rgba(255,255,255,0.85)" }} />
          <div style={{ width: "35%", height: 1.6 * u, borderRadius: u, backgroundColor: "rgba(255,255,255,0.5)", marginTop: 1.2 * u }} />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2.5 * u,
              padding: `${2.2 * u}px 0`,
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ width: 7 * u, height: 7 * u, borderRadius: 2 * u, backgroundColor: i % 2 ? accent2 : accent, opacity: 0.85 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: `${70 - i * 6}%`, height: 1.6 * u, borderRadius: u, backgroundColor: "rgba(255,255,255,0.8)" }} />
              <div style={{ width: `${45 + i * 4}%`, height: 1.3 * u, borderRadius: u, backgroundColor: "rgba(255,255,255,0.3)", marginTop: u }} />
            </div>
          </div>
        ))}
      </div>
      {/* Status bar stays put while content scrolls underneath. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 7 * u,
          background: "linear-gradient(#0b0b0f 70%, transparent)",
        }}
      />
    </div>
  );
};
