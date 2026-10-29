import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export const brandSchema = z.object({
  appName: z.string(),
  base: zColor(),
  accent: zColor(),
  accent2: zColor(),
});

export const appPromoSchema = brandSchema.extend({
  headline: z.string(),
  features: z.array(z.object({ title: z.string(), body: z.string() })).max(4),
  cta: z.string(),
  /** Optional path in public/, e.g. "apps/my-app/screen.png". Falls back to a mock UI. */
  screenshot: z.string().optional(),
});

export type Brand = z.infer<typeof brandSchema>;
export type AppPromoProps = z.infer<typeof appPromoSchema>;
