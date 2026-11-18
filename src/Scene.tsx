import { ThreeCanvas } from "@remotion/three";
import { MeshDistortMaterial } from "@react-three/drei";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// All animation MUST be driven by useCurrentFrame() (not useFrame/clock),
// so every frame renders deterministically.
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12 } });
  const rotY = frame * 0.02;
  const rotX = interpolate(frame, [0, 300], [0, Math.PI]);

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 6], fov: 45 }}>
      <color attach="background" args={["#0b0f1a"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <mesh scale={pop * 1.05} rotation={[rotX, rotY, 0]}>
        <torusKnotGeometry args={[1, 0.32, 256, 48]} />
        <MeshDistortMaterial color="#6c8cff" roughness={0.2} metalness={0.6} distort={0.25} speed={0} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 3.2, Math.sin(frame / 20 + side) * 0.5, -1]}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={side > 0 ? "#ff7ab6" : "#5ef2c2"} flatShading />
        </mesh>
      ))}
      <pointLight position={[-4, -2, 3]} intensity={30} color="#ff7ab6" />
    </ThreeCanvas>
  );
};
