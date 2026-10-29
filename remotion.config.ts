/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setRspack(true);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.overrideBundlerConfig(enableTailwind);

// Mastering quality: lossless-ish frames, BT.709 tagging so colors match AE/Premiere.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(100);
Config.setColorSpace("bt709");

// @remotion/effects (light leaks, glow, grain, LUTs) and 3D need WebGL during renders.
Config.setChromiumOpenGlRenderer("angle");

// The default chrome-headless-shell never fires requestAnimationFrame on macOS 27,
// so every render hangs at "Waiting for root component to load". Full Chrome for Testing works.
Config.setChromeMode("chrome-for-testing");
