import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Backdrop } from "../../components/Backdrop";
import { FilmFinish } from "../../components/FilmFinish";
import { LightLeakOverlay } from "../../components/LightLeakOverlay";
import { pushBlur } from "../../components/pushBlur";
import { ease } from "../../lib/easing";
import { EndCardScene } from "./EndCardScene";
import { HookScene } from "./HookScene";
import type { AppPromoProps } from "./schema";
import { ShowcaseScene } from "./ShowcaseScene";

/** Total length in seconds: 2.5 + 5 + 3 scenes, minus the 0.6s transition overlap. */
export const APP_PROMO_SECONDS = 2.5 + 5 + 3 - 0.6;

export const AppPromo: React.FC<AppPromoProps> = (props) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: props.base }}>
      <Backdrop name="Backdrop" base={props.base} colors={[props.accent, props.accent2, props.accent]} />

      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence name="Hook" durationInFrames={2.5 * fps}>
          <HookScene appName={props.appName} headline={props.headline} accent={props.accent} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={1 * fps}>
          <LightLeakOverlay name="Light leak" seed={3} hueShift={230} style={{ opacity: 0.65 }} />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="Showcase" durationInFrames={5 * fps}>
          <ShowcaseScene
            appName={props.appName}
            base={props.base}
            accent={props.accent}
            accent2={props.accent2}
            features={props.features}
            screenshot={props.screenshot}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushBlur({ blur: 24 })}
          timing={linearTiming({ durationInFrames: 0.6 * fps, easing: ease.inOut })}
        />
        <TransitionSeries.Sequence name="End card" durationInFrames={3 * fps}>
          <EndCardScene appName={props.appName} cta={props.cta} accent={props.accent} accent2={props.accent2} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <FilmFinish name="Finish (grain + vignette)" grain={0.18} vignette={0.45} />
    </AbsoluteFill>
  );
};
