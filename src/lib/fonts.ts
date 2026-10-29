import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";

export const sans = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
}).fontFamily;

export const serif = loadInstrumentSerif("italic", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;

export const newsreader = loadNewsreader("italic", {
  weights: ["500"],
  subsets: ["latin"],
}).fontFamily;

/** Upright Newsreader 500, for display headlines. */
export const newsreaderUpright = loadNewsreader("normal", {
  weights: ["500"],
  subsets: ["latin"],
}).fontFamily;
