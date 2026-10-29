import { lightLeak } from "@remotion/effects/light-leak";
import type { CSSProperties } from "react";
import { Interactive, interpolate, Solid, useCurrentFrame, useVideoConfig } from "remotion";

type LightLeakOverlayProps = {
  readonly seed?: number;
  readonly hueShift?: number;
  readonly style?: CSSProperties;
};

/** Use inside <TransitionSeries.Overlay> to flash a light leak over a cut. */
const LightLeakOverlayInner: React.FC<LightLeakOverlayProps> = ({ seed = 0, hueShift = 0, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, height, width } = useVideoConfig();

  return (
    <Solid
      width={width}
      height={height}
      style={{ mixBlendMode: "screen", ...style }}
      effects={[
        lightLeak({
          seed,
          hueShift,
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }),
      ]}
    />
  );
};

export const LightLeakOverlay = Interactive.create({
  Component: LightLeakOverlayInner,
  layout: "none",
});
