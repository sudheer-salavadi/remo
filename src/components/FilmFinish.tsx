import { AbsoluteFill, Interactive, useCurrentFrame } from "remotion";

type FilmFinishProps = {
  readonly grain: number;
  readonly vignette: number;
};

/**
 * The "finishing pass" AE artists put on an adjustment layer:
 * animated film grain and a soft vignette. Place it as the LAST child of a composition.
 *
 * Grain is SVG feTurbulence re-seeded each frame, overlay-blended. It used to be a WebGL
 * noise() effect on a <Solid>, but on this Mac's Chrome-for-Testing + ANGLE that produced
 * occasional corrupted (tiled) frames in renders, so the finish stays GPU-free.
 */
const FilmFinishInner: React.FC<FilmFinishProps> = ({ grain, vignette }) => {
  const frame = useCurrentFrame();
  const id = `grain-${frame}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", mixBlendMode: "overlay", opacity: grain }}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const FilmFinish = Interactive.create({
  Component: FilmFinishInner,
  layout: "absolute-fill",
});
