import { AbsoluteFill, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "../../components/KineticText";
import { ease } from "../../lib/easing";
import { newsreaderUpright, sans } from "../../lib/fonts";
import { mix, tint } from "./brand";
import type { BarChartProps } from "./schema";
import { clamp, Emoji, Shell, shellFrames, SourceLine } from "./Shell";

const X = 70;
const W = 940;
const TOP = 470;
const BOTTOM = 1680;
const BAR_H = 30;
const HOLD = 6;

export const barBodyFrames = (n: number, fps = 60) => Math.round((0.5 + n * 0.32 + 1.5 + HOLD) * fps);
export const barChartFrames = (p: BarChartProps) => shellFrames(barBodyFrames(p.rows.length), Boolean(p.hook));

/** A round step that gives 3–4 gridlines. */
const niceStep = (max: number) => {
  const raw = max / 3.5;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
};

const short = (v: number) => (v >= 1e6 ? `${+(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${+(v / 1e3).toFixed(1)}k` : `${v}`);

const ChartInner: React.FC<BarChartProps> = ({ title, subtitle, legend, rows, prefix, suffix, topNote, source, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const light = mix(brand.bg, brand.ink, 0.24);
  const track = mix(brand.bg, brand.ink, 0.07);
  const peak = Math.max(...rows.map((r) => r.top ?? r.value));
  const step = niceStep(peak);
  const max = peak * 1.04;
  const rowH = Math.min(200, (BOTTOM - TOP) / rows.length);
  const hasTop = rows.some((r) => r.top !== undefined);
  const fmt = (v: number) => `${prefix}${(v >= 1000 ? Math.round(v / 10) * 10 : Math.round(v)).toLocaleString("en-US")}${suffix}`;
  const gridIn = interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], { easing: ease.out, ...clamp });
  const gridBottom = TOP + rows.length * rowH - 4;

  return (
    <AbsoluteFill style={{ color: brand.ink, fontFamily: sans }}>
      <div style={{ position: "absolute", left: X, right: X, top: 200 }}>
        <KineticText text={title} delay={2} stagger={3} style={{ justifyContent: "flex-start", fontFamily: newsreaderUpright, fontWeight: 500, fontSize: 84, lineHeight: 1.05 }} />
        <div style={{ display: "flex", gap: 40, marginTop: 22, fontSize: 30, color: brand.sub, opacity: gridIn, translate: `0 ${(1 - gridIn) * 12}px` }}>
          {subtitle ? <div>{subtitle}</div> : null}
          {legend && hasTop
            ? legend.map((l, k) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 18, borderRadius: 9, backgroundColor: k === 0 ? brand.ink : light }} />
                  {l}
                </div>
              ))
            : null}
        </div>
      </div>

      {Array.from({ length: Math.floor(max / step) }, (_, k) => (k + 1) * step).map((v) => (
        <div key={v} style={{ position: "absolute", left: X + (v / max) * W, top: TOP + 60, opacity: gridIn }}>
          <div style={{ width: 0, height: gridBottom - TOP - 60, borderLeft: `2px dashed ${tint(brand.ink, 0.16)}` }} />
          <div style={{ fontSize: 26, color: brand.sub, translate: "-50% 8px", fontVariantNumeric: "tabular-nums" }}>
            {prefix}
            {short(v)}
            {suffix}
          </div>
        </div>
      ))}

      {rows.map((r, i) => {
        const start = 0.5 * fps + i * 0.32 * fps;
        const enter = interpolate(frame, [start, start + 0.6 * fps], [0, 1], { easing: ease.out, ...clamp });
        const grow = interpolate(frame, [start + 6, start + 6 + 0.9 * fps], [0, 1], { easing: ease.inOut, ...clamp });
        const reach = interpolate(frame, [start + 0.8 * fps, start + 1.5 * fps], [0, 1], { easing: ease.inOut, ...clamp });
        const topIn = interpolate(frame, [start + 1.1 * fps, start + 1.5 * fps], [0, 1], { easing: ease.out, ...clamp });
        const pop = interpolate(frame, [start, start + 0.6 * fps], [0, 1], { easing: ease.overshoot, ...clamp });
        const top = r.top ?? r.value;
        return (
          <div key={r.name} style={{ position: "absolute", left: X, top: TOP + i * rowH, width: W, height: rowH }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: enter, translate: `0 ${(1 - enter) * 24}px`, filter: `blur(${(1 - enter) * 8}px)` }}>
              <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 14 }}>
                {r.emoji ? <Emoji e={r.emoji} size={40} style={{ scale: String(Math.max(0.001, pop)) }} /> : null}
                {r.name}
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{fmt(r.value * grow)}</div>
            </div>
            <div style={{ position: "relative", height: BAR_H, marginTop: 16, opacity: enter }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: BAR_H / 2, backgroundColor: track }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: BAR_H / 2, backgroundColor: light, clipPath: `inset(0 ${(1 - (r.value + (top - r.value) * reach) / max) * 100}% 0 0 round ${BAR_H / 2}px)` }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: BAR_H / 2, backgroundColor: brand.ink, clipPath: `inset(0 ${(1 - (r.value / max) * grow) * 100}% 0 0 round ${BAR_H / 2}px)` }} />
            </div>
            {r.top !== undefined ? (
              <div style={{ marginTop: 14, fontSize: 28, color: brand.sub, fontVariantNumeric: "tabular-nums", opacity: topIn, translate: `0 ${(1 - topIn) * 10}px` }}>
                {topNote.split("{top}")[0]}
                <span style={{ color: brand.ink, fontWeight: 600 }}>{fmt(r.top)}</span>
                {topNote.split("{top}")[1] ?? ""}
              </div>
            ) : null}
          </div>
        );
      })}

      <SourceLine text={source} at={0.5 + rows.length * 0.32 + 1} />
    </AbsoluteFill>
  );
};

export const BarChartBody = Interactive.create({ Component: ChartInner, layout: "absolute-fill" });

export const BarChart: React.FC<BarChartProps> = (props) => (
  <Shell brand={props.brand} hook={props.hook} endLine={props.endLine} body={barBodyFrames(props.rows.length)}>
    <BarChartBody {...props} />
  </Shell>
);
