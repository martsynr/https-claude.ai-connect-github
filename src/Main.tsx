import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";
import { Captions, demoCaptions } from "./Captions";
import { Scene } from "./Scene";

// Drop an audio file at public/music.mp3 and set this to true.
const HAS_AUDIO = false;

export const Main: React.FC = () => (
  <AbsoluteFill>
    <Scene />
    <Captions captions={demoCaptions} />
    {HAS_AUDIO && <Audio src={staticFile("music.mp3")} volume={0.8} />}
  </AbsoluteFill>
);
