import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill } from "remotion";

type PushBlurProps = {
  /** Max blur in px at the midpoint. */
  readonly blur: number;
};

/**
 * Exiting scene pushes toward camera and blurs out; entering scene settles in from slightly behind.
 * Pure CSS, so it previews in any browser (unlike the WebGL HtmlInCanvas presentations).
 */
const PushBlurPresentation: React.FC<TransitionPresentationComponentProps<PushBlurProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: { blur },
}) => {
  const exiting = presentationDirection === "exiting";
  return (
    <AbsoluteFill
      style={{
        opacity: exiting ? 1 - p : p,
        scale: exiting ? 1 + p * 0.12 : 0.92 + p * 0.08,
        filter: `blur(${(exiting ? p : 1 - p) * blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const pushBlur = (props: Partial<PushBlurProps> = {}): TransitionPresentation<PushBlurProps> => ({
  component: PushBlurPresentation,
  props: { blur: props.blur ?? 24 },
});
