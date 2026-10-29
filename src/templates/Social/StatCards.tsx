import { AbsoluteFill, Img, Interactive, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "../../components/KineticText";
import { ease } from "../../lib/easing";
import { newsreaderUpright, sans } from "../../lib/fonts";
import { tint, useBrand } from "./brand";
import type { Stat, StatCardsProps } from "./schema";
import { clamp, Emoji, Shell, shellFrames, SourceLine, src } from "./Shell";

const X = 70;
const W = 940;
const TOP = 540;
const BOTTOM = 1700;
const SPOT = 170; // frames per stat in spotlight
const HOLD = 7; // seconds the finished board stays up

/** Body length for a given layout and stat count. */
export const statBodyFrames = (layout: StatCardsProps["layout"], n: number, fps = 60) =>
  layout === "spotlight" ? n * SPOT + 3 * fps : Math.round((0.5 + n + HOLD) * fps);

export const statCardsFrames = (p: StatCardsProps) => shellFrames(statBodyFrames(p.layout, p.stats.length), Boolean(p.hook));

// ───────── Value: numbers count up, words wipe on ─────────

const parse = (v: string) => {
  const m = v.match(/^([^\d]*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const raw = m[2];
  return { prefix: m[1], n: Number(raw.replace(/,/g, "")), dec: raw.includes(".") ? raw.split(".")[1].length : 0, comma: raw.includes(","), suffix: m[3] };
};

const Value: React.FC<{ readonly v: string; readonly p: number; readonly size: number }> = ({ v, p, size }) => {
  const num = parse(v);
  if (!num) {
    return (
      <span style={{ fontFamily: newsreaderUpright, fontWeight: 500, fontSize: size * 0.86, letterSpacing: "-0.01em", display: "inline-block", clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
        {v}
      </span>
    );
  }
  const x = num.n * p;
  const step = num.dec ? 1 : num.n >= 10000 ? 100 : 1;
  const shown = num.dec ? x.toFixed(num.dec) : (Math.round(x / step) * step).toLocaleString("en-US", { useGrouping: num.comma });
  return (
    <span>
      {num.prefix}
      {shown}
      {num.suffix}
    </span>
  );
};

// ───────── Visuals ─────────

const ratioOf = (s: Stat) => {
  if (s.ratio !== undefined) return s.ratio;
  const n = parse(s.value);
  return n && s.value.trim().endsWith("%") ? n.n / 100 : 0.5;
};

const Ring: React.FC<{ readonly p: number; readonly ratio: number; readonly size: number }> = ({ p, ratio, size }) => {
  const brand = useBrand();
  const r = 78;
  const c = 2 * Math.PI * r;
  const oneIn = ratio > 0 && Math.abs(1 / ratio - Math.round(1 / ratio)) < 0.02 ? `1 in ${Math.round(1 / ratio)}` : null;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx={100} cy={100} r={r} fill="none" stroke={tint(brand.ink, 0.1)} strokeWidth={26} />
      <circle cx={100} cy={100} r={r} fill="none" stroke={brand.ink} strokeWidth={26} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - ratio * p)} transform="rotate(-90 100 100)" />
      {oneIn ? (
        <text x={100} y={112} textAnchor="middle" fontFamily={sans} fontSize={34} fontWeight={700} fill={brand.ink} opacity={p}>
          {oneIn}
        </text>
      ) : null}
    </svg>
  );
};

const Crowd: React.FC<{ readonly p: number; readonly size: number; readonly ink: string }> = ({ p, size, ink }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 210 150">
    {Array.from({ length: 12 }, (_, k) => (
      <g key={k} transform={`translate(${(k % 4) * 54 + 18} ${Math.floor(k / 4) * 50 + 4})`} opacity={interpolate(p, [k / 16, k / 16 + 0.2], [0, 1], clamp)}>
        <circle cx={9} cy={9} r={8} fill={ink} />
        <path d="M-4 40 Q-4 20 9 20 Q22 20 22 40 Z" fill={ink} />
      </g>
    ))}
  </svg>
);

const Trend: React.FC<{ readonly p: number; readonly size: number; readonly ink: string }> = ({ p, size, ink }) => (
  <svg width={size} height={size * 0.85} viewBox="0 0 200 170">
    <path d="M14 150 L186 150" stroke={tint(ink, 0.1)} strokeWidth={6} strokeLinecap="round" />
    <path d="M20 132 L76 100 L112 116 L176 36" fill="none" stroke={ink} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={260} strokeDashoffset={260 * (1 - p)} />
    <path d="M140 34 L180 32 L176 72" fill="none" stroke={ink} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={interpolate(p, [0.85, 1], [0, 1], clamp)} />
  </svg>
);

const Visual: React.FC<{ readonly s: Stat; readonly p: number; readonly size: number }> = ({ s, p, size }) => {
  const brand = useBrand();
  const pop = interpolate(p, [0, 0.6], [0, 1], { easing: ease.overshoot, ...clamp });
  switch (s.visual) {
    case "ring":
      return <Ring p={p} ratio={ratioOf(s)} size={size} />;
    case "crowd":
      return <Crowd p={p} size={size} ink={brand.ink} />;
    case "trend":
      return <Trend p={p} size={size} ink={brand.ink} />;
    case "emoji":
      return s.emoji ? <Emoji e={s.emoji} size={size * 0.62} style={{ scale: String(Math.max(0.001, pop)), rotate: `${(1 - Math.min(1, pop)) * -12}deg` }} /> : null;
    case "image":
      return s.image ? (
        <Img src={src(s.image)} style={{ width: size, height: size, objectFit: "cover", borderRadius: 28, opacity: Math.min(1, p * 2), scale: String(0.9 + 0.1 * Math.min(1, pop)) }} />
      ) : null;
    default:
      return null;
  }
};

// ───────── Card (stack and grid) ─────────

const Card: React.FC<{ readonly s: Stat; readonly i: number; readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly compact: boolean }> = ({ s, i, x, y, w, h, compact }) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = 0.5 * fps + i * fps;
  const enter = interpolate(frame, [start, start + 0.7 * fps], [0, 1], { easing: ease.out, ...clamp });
  const count = interpolate(frame, [start + 6, start + 6 + 1.1 * fps], [0, 1], { easing: ease.inOut, ...clamp });
  const noteIn = interpolate(frame, [start + 0.7 * fps, start + 1.1 * fps], [0, 1], { easing: ease.out, ...clamp });
  const valueSize = compact ? 84 : Math.min(108, h * 0.4);
  const visualSize = compact ? 160 : Math.min(200, h - 60);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: "border-box",
        padding: compact ? "34px 36px" : "30px 46px",
        borderRadius: 36,
        backgroundColor: "rgba(255,255,255,0.62)",
        boxShadow: `0 20px 50px ${tint(brand.ink, 0.08)}`,
        fontFamily: sans,
        color: brand.ink,
        display: "flex",
        flexDirection: "column",
        justifyContent: compact ? "flex-end" : "center",
        opacity: enter,
        translate: `0 ${(1 - enter) * 40}px`,
        filter: `blur(${(1 - enter) * 10}px)`,
      }}
    >
      {compact && s.visual !== "none" ? (
        <div style={{ position: "absolute", left: 36, top: 30 }}>
          <Visual s={s} p={count} size={visualSize} />
        </div>
      ) : null}
      <div style={{ fontSize: compact ? 28 : 30, fontWeight: 600, color: brand.sub, display: "flex", alignItems: "center", gap: 10 }}>
        {s.emoji && s.visual !== "emoji" ? <Emoji e={s.emoji} size={compact ? 30 : 34} /> : null}
        {s.label}
      </div>
      <div style={{ fontSize: valueSize, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, marginTop: 6, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        <Value v={s.value} p={count} size={valueSize} />
      </div>
      {s.note ? <div style={{ fontSize: compact ? 25 : 28, color: brand.sub, marginTop: 4, lineHeight: 1.3, opacity: noteIn, translate: `0 ${(1 - noteIn) * 8}px` }}>{s.note}</div> : null}
      {!compact && s.visual !== "none" ? (
        <div style={{ position: "absolute", right: 46, top: "50%", translate: "0 -50%" }}>
          <Visual s={s} p={count} size={visualSize} />
        </div>
      ) : null}
    </div>
  );
};

const Heading: React.FC<{ readonly title: string; readonly subtitle?: string }> = ({ title, subtitle }) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: X, right: X, top: 220, fontFamily: sans, color: brand.ink }}>
      <KineticText text={title} delay={2} stagger={3} style={{ justifyContent: "flex-start", fontFamily: newsreaderUpright, fontWeight: 500, fontSize: 76, lineHeight: 1.05 }} />
      {subtitle ? <div style={{ fontSize: 30, color: brand.sub, marginTop: 14, opacity: interpolate(frame, [0.3 * fps, 0.7 * fps], [0, 1], clamp) }}>{subtitle}</div> : null}
    </div>
  );
};

// ───────── Spotlight: one stat per beat ─────────

const Spot: React.FC<{ readonly s: Stat }> = ({ s }) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = interpolate(frame, [0, 0.6 * fps], [0, 1], { easing: ease.out, ...clamp });
  const exit = interpolate(frame, [SPOT - 14, SPOT], [0, 1], { easing: ease.in, ...clamp });
  const count = interpolate(frame, [6, 6 + 1.1 * fps], [0, 1], { easing: ease.inOut, ...clamp });
  const noteIn = interpolate(frame, [0.6 * fps, 1.0 * fps], [0, 1], { easing: ease.out, ...clamp });
  const big = s.visual === "none" && s.emoji ? { ...s, visual: "emoji" as const } : s;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: sans,
        color: brand.ink,
        opacity: enter * (1 - exit),
        translate: `0 ${(1 - enter) * 50 - exit * 50}px`,
        filter: `blur(${(1 - enter) * 10 + exit * 10}px)`,
      }}
    >
      {big.visual !== "none" ? (
        <div style={{ marginBottom: 40 }}>
          <Visual s={big} p={count} size={260} />
        </div>
      ) : null}
      <div style={{ fontSize: 40, fontWeight: 600, color: brand.sub }}>{s.label}</div>
      <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        <Value v={s.value} p={count} size={190} />
      </div>
      {s.note ? <div style={{ fontSize: 36, color: brand.sub, marginTop: 10, padding: "0 100px", opacity: noteIn }}>{s.note}</div> : null}
    </AbsoluteFill>
  );
};

const Dots: React.FC<{ readonly n: number }> = ({ n }) => {
  const brand = useBrand();
  const frame = useCurrentFrame();
  const at = Math.min(n - 1, Math.floor(frame / SPOT));
  return (
    <div style={{ position: "absolute", top: 1660, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12 }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ height: 10, width: 56, borderRadius: 99, background: i <= at ? brand.ink : tint(brand.ink, 0.15) }} />
      ))}
    </div>
  );
};

// ───────── Body ─────────

const StatsInner: React.FC<StatCardsProps> = ({ title, subtitle, layout, stats, source }) => {
  const { fps } = useVideoConfig();
  const n = stats.length;

  if (layout === "spotlight") {
    return (
      <AbsoluteFill>
        <Heading title={title} subtitle={subtitle} />
        {stats.map((s, i) => (
          <Sequence key={s.label} from={i * SPOT} durationInFrames={i === n - 1 ? SPOT + 3 * fps : SPOT} name={`Stat: ${s.label}`} layout="none">
            <Spot s={s} />
          </Sequence>
        ))}
        <Dots n={n} />
        <SourceLine text={source} at={0.6} />
      </AbsoluteFill>
    );
  }

  const gap = 24;
  let cards: React.ReactNode[];
  if (layout === "grid") {
    const rows = Math.ceil(n / 2);
    const h = Math.min(480, (BOTTOM - TOP - (rows - 1) * gap) / rows);
    const w = (W - gap) / 2;
    cards = stats.map((s, i) => {
      // An odd last card spans the full row.
      const full = n % 2 === 1 && i === n - 1;
      return <Card key={s.label} s={s} i={i} x={X + (full ? 0 : (i % 2) * (w + gap))} y={TOP + Math.floor(i / 2) * (h + gap)} w={full ? W : w} h={h} compact={!full} />;
    });
  } else {
    const h = Math.min(290, (BOTTOM - TOP - (n - 1) * gap) / n);
    cards = stats.map((s, i) => <Card key={s.label} s={s} i={i} x={X} y={TOP + i * (h + gap)} w={W} h={h} compact={false} />);
  }

  return (
    <AbsoluteFill>
      <Heading title={title} subtitle={subtitle} />
      {cards}
      <SourceLine text={source} at={0.5 + n} />
    </AbsoluteFill>
  );
};

export const StatCardsBody = Interactive.create({ Component: StatsInner, layout: "absolute-fill" });

export const StatCards: React.FC<StatCardsProps> = (props) => (
  <Shell brand={props.brand} hook={props.hook} endLine={props.endLine} body={statBodyFrames(props.layout, props.stats.length)}>
    <StatCardsBody {...props} />
  </Shell>
);
