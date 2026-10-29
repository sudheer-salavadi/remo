import { z } from "zod";
import { brandSchema } from "./brand";

/**
 * Social reels: one shell (hook, logo bug, end card, finish) and three bodies.
 * Every text, number, emoji and image is a prop, so a new reel is a defaultProps block in Root.tsx.
 * `image` fields take a path in public/ ("apps/<app>/x.png") or a full https URL.
 */

export const hookSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  /** Second line, set in italic. */
  italic: z.string().optional(),
  sub: z.string().optional(),
  /** Big emoji above the title, e.g. "🇨🇦" or "🔧". Several are fine: "🇨🇦 🔥". */
  emoji: z.string().optional(),
  /** Full-bleed photo behind the hook (text turns white over a shade). */
  image: z.string().optional(),
});

export const shellSchema = z.object({
  brand: brandSchema,
  /** Leave out for reels that open on their own hero (the quote template). */
  hook: hookSchema.optional(),
  endLine: z.string(),
  source: z.string(),
});

// ───────── Stat cards ─────────

export const statSchema = z.object({
  label: z.string(),
  /** "46,100", "$37.50", "25%", or plain words ("Shortage risk"). Numbers count up; words wipe on. */
  value: z.string(),
  note: z.string().optional(),
  emoji: z.string().optional(),
  /** Right-hand graphic. "emoji" shows the stat's emoji large; "ring" fills to `ratio` (or the % value). */
  visual: z.enum(["none", "emoji", "ring", "crowd", "trend", "image"]).default("none"),
  ratio: z.number().min(0).max(1).optional(),
  image: z.string().optional(),
});

export const statCardsSchema = shellSchema.extend({
  title: z.string(),
  subtitle: z.string().optional(),
  /** stack: full-width cards. grid: two columns. spotlight: one stat per beat, full screen. */
  layout: z.enum(["stack", "grid", "spotlight"]),
  stats: z.array(statSchema).min(1).max(6),
});

// ───────── Bar chart ─────────

export const barChartSchema = shellSchema.extend({
  title: z.string(),
  subtitle: z.string().optional(),
  legend: z.tuple([z.string(), z.string()]).optional(),
  prefix: z.string().default(""),
  suffix: z.string().default(""),
  rows: z
    .array(
      z.object({
        name: z.string(),
        emoji: z.string().optional(),
        value: z.number(),
        /** Optional upper value drawn as a lighter extension (e.g. top 10%). */
        top: z.number().optional(),
      }),
    )
    .min(2)
    .max(8),
  /** Template for the line under each bar; {top} is replaced. */
  topNote: z.string().default("Top 10% earn above {top}"),
});

// ───────── Quote ─────────

export const quoteSchema = shellSchema.extend({
  image: z.string(),
  /** Focal point of the photo, CSS object-position. */
  focus: z.string().default("50% 20%"),
  chip: z.string(),
  lead: z.string(),
  highlight: z.string(),
  rest: z.string(),
});

export type Hook = z.infer<typeof hookSchema>;
export type Stat = z.infer<typeof statSchema>;
export type StatCardsProps = z.infer<typeof statCardsSchema>;
export type BarChartProps = z.infer<typeof barChartSchema>;
export type QuoteProps = z.infer<typeof quoteSchema>;
