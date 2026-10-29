import { zColor } from "@remotion/zod-types";
import { createContext, useContext } from "react";
import { z } from "zod";

/** Everything brand-specific in a Social reel. Pass one per app; vary `bg` between reels for variety. */
export const brandSchema = z.object({
  name: z.string(),
  /** Shown on the end card, e.g. "example.com". */
  url: z.string(),
  /** Text colour. Must be a 6-digit hex. */
  ink: zColor(),
  /** Secondary text colour. */
  sub: zColor(),
  /** Page background. Must be a 6-digit hex. */
  bg: zColor(),
  /** Single-path SVG logo (fill = ink). Leave out to show the name only. */
  logoPath: z.string().optional(),
  logoViewBox: z.string().default("0 0 100 100"),
});

export type Brand = z.infer<typeof brandSchema>;

const BrandContext = createContext<Brand>({ name: "Brand", url: "example.com", ink: "#1f1f1d", sub: "#5c5c5a", bg: "#eceae4", logoViewBox: "0 0 100 100" });

export const BrandProvider = BrandContext.Provider;
export const useBrand = () => useContext(BrandContext);

const rgb = (hex: string) => [0, 1, 2].map((i) => parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16));

/** Ink at alpha `a` (translucent). */
export const tint = (ink: string, a: number) => `rgba(${rgb(ink).join(",")},${a})`;

/** Ink mixed into the page at `a` (opaque), so layers behind never show through. */
export const mix = (page: string, ink: string, a: number) => {
  const p = rgb(page);
  const k = rgb(ink);
  return `rgb(${p.map((v, i) => Math.round(v * (1 - a) + k[i] * a)).join(",")})`;
};

/** The brand's logo mark at a given height. */
export const Logo: React.FC<{ readonly height: number; readonly style?: React.CSSProperties }> = ({ height, style }) => {
  const b = useBrand();
  if (!b.logoPath) return null;
  const [, , w, h] = b.logoViewBox.split(/\s+/).map(Number);
  return (
    <svg viewBox={b.logoViewBox} height={height} width={(height * w) / h} style={style}>
      <path d={b.logoPath} fill={b.ink} fillRule="evenodd" />
    </svg>
  );
};
