#!/usr/bin/env node
/**
 * Fails when a layout CSS property is animated.
 *
 * Chrome snaps layout (left/top/width/height/margins/…) to whole pixels, so animating them makes
 * slow motion step and jitter in renders. Measured on this project: animating `left` jittered ~9×
 * more than `translate`. Animate translate / scale / rotate, opacity, filter or clip-path instead.
 *
 * Also fails on CSS 3D transforms (perspective, rotateX/Y, rotate3d, translateZ/3d): Chrome for
 * Testing on this Mac intermittently clips 3D-transformed layers, which shows as flicker.
 *
 * Heuristic: a layout property whose value, on the same line, uses interpolate(), spring(),
 * noise*(), the current frame, or a variable whose name says it moves. Silence a deliberate,
 * non-animated case with `// motion-ok` on that line.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const LAYOUT =
  /\b(left|top|right|bottom|width|height|minWidth|minHeight|maxWidth|maxHeight|margin\w*|padding\w*|inset|gap|fontSize|lineHeight|letterSpacing|borderWidth)\s*:\s*/g;
const ANIMATED = /\binterpolate\(|\bspring\(|\bnoise[234]D\(|\bframe\b|\bprogress\b|\bdrag\b|\benter\b|\bpull\b|\bsent\b/;

/** The property's value expression: up to the first top-level "," or "}", string literals blanked. */
const valueExpr = (rest) => {
  let depth = 0;
  let out = "";
  let quote = null;
  for (const ch of rest) {
    if (quote) {
      if (ch === quote) quote = null;
      // keep template-literal ${...} contents visible
      out += quote === "`" ? ch : " ";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += " ";
      continue;
    }
    if (ch === "`") quote = "`";
    if ("([{".includes(ch)) depth++;
    if (")]".includes(ch)) depth--;
    if (ch === "}") {
      if (depth === 0) break;
      depth--;
    }
    if (ch === "," && depth === 0) break;
    out += ch;
  }
  return out;
};

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name)) files.push(p);
  }
};
walk(join(ROOT, "src"));

const problems = [];
for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (line.includes("motion-ok")) return;
      if (/\bperspective\s*:|rotate[XY]\(|rotate3d\(|translateZ\(|translate3d\(/.test(line)) {
        problems.push(`${relative(ROOT, file)}:${i + 1}  CSS 3D transform (flickers in renders; use @remotion/three): ${line.trim()}`);
      }
      for (const m of line.matchAll(LAYOUT)) {
        if (ANIMATED.test(valueExpr(line.slice(m.index + m[0].length)))) {
          problems.push(`${relative(ROOT, file)}:${i + 1}  animated "${m[1]}": ${line.trim()}`);
        }
      }
    });
}

if (problems.length) {
  console.error("Motion problems that jitter or flicker in renders. Use 2D translate/scale/rotate, opacity, filter or clip-path:\n");
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check-motion: ${files.length} files OK`);
