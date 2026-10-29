#!/usr/bin/env python3
"""
Render a composition with corrupted frames detected and re-rendered.

Chrome for Testing on this Mac (macOS 27) occasionally returns a garbled screenshot during
`remotion render`: the top of the frame repeated as tiles. It is random, independent of
concurrency and of WebGL. This script works around it:

  1. bundle once
  2. render the video as a JPEG image sequence
  3. flag frames whose content repeats down the image (the tiling signature, also in bursts)
     and one-frame blips that differ from both neighbours while the neighbours agree
  4. re-render only the flagged frames with `remotion still`, re-check, retry
  5. render the audio track and encode H.264 + AAC with ffmpeg

Usage: python3 scripts/render-clean.py <CompositionId> <out.mp4> [--crf 18] [--fps 60]
"""

import argparse
import glob
import os
import shutil
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TILE_SCORE = 0.5  # corrupted frames score < 0.4, normal frames >= 0.97


def run(cmd):
    print("→", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, cwd=ROOT)


def tile_score(path):
    """
    How well the frame's edge map matches itself shifted down by 15–120 px (of 240).
    A corrupted frame is the top band tiled down the image, so it matches itself almost
    exactly (score near 0); real frames don't (score around 1 or more).
    """
    a = np.asarray(Image.open(path).convert("L").resize((135, 240)), dtype=np.float32)
    e = np.abs(np.diff(a, axis=1))[:-1]
    energy = e.mean() + 1e-3
    best = min(np.mean(np.abs(e[k:] - e[:-k])) for k in range(15, 120))
    return best / energy


BLIP = 1.0  # mean abs luma difference on a 135x240 thumbnail


def thumb(path):
    return np.asarray(Image.open(path).convert("L").resize((135, 240)), dtype=np.float32)


def find_bad(frames, indices=None):
    """
    Two signatures of a bad capture:
      - tiling: the top band repeated down the frame (tile_score)
      - blip: a frame that differs from BOTH neighbours while the neighbours match each other,
        e.g. a layer clipped or missing for one frame. Real motion changes neighbours too.
    """
    n = len(frames)
    check = sorted(set(indices)) if indices is not None else range(n)
    cache = {}

    def t(i):
        if i not in cache:
            cache[i] = thumb(frames[i])
        return cache[i]

    def d(a, b):
        return float(np.mean(np.abs(t(a) - t(b))))

    bad = []
    for i in check:
        if tile_score(frames[i]) < TILE_SCORE:
            bad.append(i)
            continue
        if 0 < i < n - 1:
            before, after = d(i, i - 1), d(i, i + 1)
            if before > BLIP and after > BLIP and d(i - 1, i + 1) < 0.5 * min(before, after):
                bad.append(i)
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("comp")
    ap.add_argument("out")
    ap.add_argument("--crf", default="18")
    ap.add_argument("--fps", default="60")
    args = ap.parse_args()

    work = os.path.join(ROOT, "out", f".clean-{args.comp}")
    shutil.rmtree(work, ignore_errors=True)
    os.makedirs(work)
    bundle = os.path.join(work, "bundle")
    seq = os.path.join(work, "frames")
    audio = os.path.join(work, "audio.wav")

    run(["npx", "remotion", "bundle", "--out-dir", bundle, "--log=error"])
    run(["npx", "remotion", "render", bundle, args.comp, seq, "--sequence", "--image-format=jpeg", "--jpeg-quality=100", "--log=error"])
    frames = sorted(glob.glob(os.path.join(seq, "*.jpeg")))
    if not frames:
        sys.exit("No frames rendered")
    pad = len(os.path.splitext(os.path.basename(frames[0]))[0].split("-")[-1])
    prefix = os.path.basename(frames[0]).rsplit("-", 1)[0]

    bad = find_bad(frames)
    print(f"Flagged {len(bad)} frame(s): {bad}", flush=True)
    for attempt in range(3):
        if not bad:
            break
        for i in bad:
            run(["npx", "remotion", "still", bundle, args.comp, frames[i], f"--frame={i}", "--image-format=jpeg", "--jpeg-quality=100", "--log=error"])
        bad = find_bad(frames, [j for i in bad for j in (i - 1, i, i + 1) if 0 <= j < len(frames)])
        print(f"After pass {attempt + 1}: {len(bad)} still flagged {bad}", flush=True)
    if bad:
        # A frame that still trips a detector after being re-rendered on its own is almost always a false
        # positive (e.g. a near-blank or heavily blurred frame); the still is the authoritative capture.
        print(f"Note: {len(bad)} frame(s) still flagged after re-render as stills, kept as rendered (likely false positives): {bad}", flush=True)

    run(["npx", "remotion", "render", bundle, args.comp, audio, "--codec=wav", "--log=error"])

    pattern = os.path.join(seq, f"{prefix}-%0{pad}d.jpeg")
    run([
        "ffmpeg", "-v", "error", "-y",
        "-framerate", args.fps, "-i", pattern,
        "-i", audio,
        "-c:v", "libx264", "-crf", args.crf, "-preset", "slow", "-pix_fmt", "yuv420p",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
        "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart",
        os.path.join(ROOT, args.out) if not os.path.isabs(args.out) else args.out,
    ])
    shutil.rmtree(work, ignore_errors=True)
    print("Done:", args.out)


if __name__ == "__main__":
    main()
