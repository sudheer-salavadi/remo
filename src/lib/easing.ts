import { Easing } from "remotion";

/**
 * After Effects-equivalent easing curves.
 * Use inline inside interpolate() so Studio can still edit the keyframes:
 *   interpolate(frame, [0, 20], [0, 1], { easing: ease.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" })
 */
export const ease = {
  /** AE "Easy Ease" (F9): 33.33% influence on both sides. */
  easy: Easing.bezier(0.333, 0, 0.667, 1),
  /** Strong ease-out (expo-like). The default for entrances. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Accelerating exit. The default for exits. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Snappy in-out for moves between two resting states. */
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  /** Slight overshoot, like a pop with no wobble. */
  overshoot: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** Critically damped spring: physical but no bounce. */
  spring: Easing.spring({ damping: 200 }),
  /** Soft bouncy spring for playful UI elements. */
  bouncy: Easing.spring({ damping: 12, stiffness: 120 }),
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
