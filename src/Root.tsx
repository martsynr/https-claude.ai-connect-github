import { Composition } from "remotion";
import { Main } from "./Main";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Main"
    component={Main}
    durationInFrames={300} // 10s @ 30fps
    fps={30}
    width={1920}
    height={1080}
  />
);
