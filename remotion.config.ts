import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// "angle" is required for WebGL (Three.js) to render in headless Chrome.
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(1); // WebGL is GPU/memory heavy; raise if your machine handles it
