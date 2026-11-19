import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, Hammer, HAMMER_DURATION } from "./hammer/Hammer";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Main"
      component={Main}
      durationInFrames={300} // 10s @ 30fps
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition id="DmsHammer" component={Hammer} durationInFrames={HAMMER_DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
