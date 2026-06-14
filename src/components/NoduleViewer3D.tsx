import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import type { Mesh } from "three";

interface Props {
  sizeMm: number;
  type: string;
  lobe: string;
  riskColor: string;
}

const NoduleMesh: React.FC<{ sizeMm: number; riskColor: string }> = ({ sizeMm, riskColor }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const scale = Math.max(0.5, Math.min(2.5, sizeMm / 12));

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={riskColor}
        roughness={0.6}
        metalness={0.1}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
};

export const NoduleViewer3D: React.FC<Props> = ({ sizeMm, type, lobe, riskColor }) => {
  return (
    <div className="w-full h-[280px] rounded-lg overflow-hidden bg-[#1a1d23]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} />
        <NoduleMesh sizeMm={sizeMm} riskColor={riskColor} />
        <Text
          position={[0, -2.2, 0]}
          fontSize={0.2}
          color="#9ca3af"
          anchorX="center"
        >
          {`${type} · ${lobe}`}
        </Text>
        <Text
          position={[0, -2.6, 0]}
          fontSize={0.18}
          color="#6b7280"
          anchorX="center"
        >
          {`${sizeMm} mm diameter`}
        </Text>
        <OrbitControls enableZoom enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
};
