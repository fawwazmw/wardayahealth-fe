import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { cn } from "@/lib/utils";

interface Props {
  sizeMm: number;
  type: string;
  lobe: string;
  riskColor: string;
}

type ViewPreset = "front" | "right" | "left";

type LobeDefinition = {
  key: string;
  label: string;
  side: "left" | "right";
  position: [number, number, number];
  scale: [number, number, number];
  marker: [number, number, number];
};

const LOBES: LobeDefinition[] = [
  {
    key: "right-upper-lobe",
    label: "Right Upper Lobe",
    side: "right",
    position: [1.08, 1.05, 0],
    scale: [0.94, 1.1, 0.78],
    marker: [1.15, 1.15, 0.38],
  },
  {
    key: "right-middle-lobe",
    label: "Right Middle Lobe",
    side: "right",
    position: [1.05, 0.2, 0],
    scale: [0.82, 0.7, 0.72],
    marker: [1.2, 0.15, 0.42],
  },
  {
    key: "right-lower-lobe",
    label: "Right Lower Lobe",
    side: "right",
    position: [1.08, -0.9, 0],
    scale: [1.02, 1.08, 0.84],
    marker: [1.12, -0.85, 0.34],
  },
  {
    key: "left-upper-lobe",
    label: "Left Upper Lobe",
    side: "left",
    position: [-1.08, 0.95, 0],
    scale: [0.96, 1.08, 0.78],
    marker: [-1.12, 1.08, 0.4],
  },
  {
    key: "left-lower-lobe",
    label: "Left Lower Lobe",
    side: "left",
    position: [-1.04, -0.82, 0],
    scale: [1.02, 1.14, 0.84],
    marker: [-1.08, -0.86, 0.34],
  },
];

const FALLBACK_MARKER: [number, number, number] = [0, 0.15, 0.48];

const VIEW_PRESETS: Record<ViewPreset, { label: string; camera: [number, number, number]; sceneRotationY: number }> = {
  front: { label: "Front", camera: [0, 0.15, 6.2], sceneRotationY: -0.18 },
  right: { label: "Right", camera: [5.8, 0.2, 3.8], sceneRotationY: -0.62 },
  left: { label: "Left", camera: [-5.8, 0.2, 3.8], sceneRotationY: 0.26 },
};

const getLobeDefinition = (lobe: string) => {
  const normalized = lobe.trim().toLowerCase();

  if (normalized.includes("right") && normalized.includes("upper")) {
    return LOBES.find((item) => item.key === "right-upper-lobe")!;
  }
  if (normalized.includes("right") && normalized.includes("middle")) {
    return LOBES.find((item) => item.key === "right-middle-lobe")!;
  }
  if (normalized.includes("right") && normalized.includes("lower")) {
    return LOBES.find((item) => item.key === "right-lower-lobe")!;
  }
  if (normalized.includes("left") && normalized.includes("upper")) {
    return LOBES.find((item) => item.key === "left-upper-lobe")!;
  }
  if (normalized.includes("left") && normalized.includes("lower")) {
    return LOBES.find((item) => item.key === "left-lower-lobe")!;
  }

  return null;
};

const Trachea: React.FC = () => (
  <group position={[0, 1.95, 0]}>
    <mesh>
      <cylinderGeometry args={[0.12, 0.14, 1.15, 28]} />
      <meshStandardMaterial color="#9ac7c0" transparent opacity={0.16} roughness={0.5} />
    </mesh>
    <mesh position={[-0.34, -0.7, 0]} rotation={[0, 0, 0.42]}>
      <cylinderGeometry args={[0.08, 0.12, 0.72, 24]} />
      <meshStandardMaterial color="#9ac7c0" transparent opacity={0.12} roughness={0.5} />
    </mesh>
    <mesh position={[0.34, -0.7, 0]} rotation={[0, 0, -0.42]}>
      <cylinderGeometry args={[0.08, 0.12, 0.72, 24]} />
      <meshStandardMaterial color="#9ac7c0" transparent opacity={0.12} roughness={0.5} />
    </mesh>
  </group>
);

const LungsModel: React.FC<{ activeLobeKey?: string }> = ({ activeLobeKey }) => {
  return (
    <group position={[0, 0.2, 0]}>
      <Trachea />
      {LOBES.map((lobe) => {
        const isActive = lobe.key === activeLobeKey;
        const baseColor = lobe.side === "right" ? "#6ea7b0" : "#739bb4";

        return (
          <group key={lobe.key} position={lobe.position} scale={lobe.scale}>
            <mesh>
              <sphereGeometry args={[1, 36, 36]} />
              <meshPhysicalMaterial
                color={isActive ? "#9ce8d8" : baseColor}
                transparent
                opacity={isActive ? 0.34 : 0.14}
                roughness={0.2}
                metalness={0.02}
                clearcoat={0.8}
                clearcoatRoughness={0.15}
              />
            </mesh>
            <mesh scale={[1.02, 1.02, 1.02]}>
              <sphereGeometry args={[1, 28, 28]} />
              <meshBasicMaterial
                color={isActive ? "#4fd1ba" : "#8cb8c0"}
                transparent
                opacity={isActive ? 0.18 : 0.06}
                wireframe
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const NoduleMarker: React.FC<{
  position: [number, number, number];
  sizeMm: number;
  riskColor: string;
}> = ({ position, sizeMm, riskColor }) => {
  const markerGroup = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (markerGroup.current) {
      markerGroup.current.rotation.y += delta * 0.35;
    }

    if (ringRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.08;
      ringRef.current.scale.setScalar(pulse);
    }
  });

  const markerScale = Math.max(0.16, Math.min(0.44, sizeMm / 38));

  return (
    <group ref={markerGroup} position={position}>
      <mesh scale={[markerScale, markerScale, markerScale]}>
        <sphereGeometry args={[1, 28, 28]} />
        <meshStandardMaterial
          color={riskColor}
          emissive={riskColor}
          emissiveIntensity={0.4}
          roughness={0.35}
          metalness={0.08}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[markerScale * 1.9, markerScale * 0.14, 16, 64]} />
        <meshBasicMaterial color={riskColor} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export const NoduleViewer3D: React.FC<Props> = ({ sizeMm, type, lobe, riskColor }) => {
  const [viewPreset, setViewPreset] = useState<ViewPreset>("front");
  const activeLobe = useMemo(() => getLobeDefinition(lobe), [lobe]);
  const markerPosition = activeLobe?.marker ?? FALLBACK_MARKER;
  const normalizedType = type?.trim() || "Solid";
  const viewConfig = VIEW_PRESETS[viewPreset];

  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-[hsl(var(--border))] bg-[linear-gradient(180deg,rgba(7,23,20,0.96)_0%,rgba(11,31,27,0.98)_100%)]">
      <div className="h-[320px] bg-[radial-gradient(circle_at_top,rgba(79,209,186,0.12),transparent_36%),linear-gradient(180deg,rgba(4,14,12,0.1),rgba(4,14,12,0.24))]">
          <div className="pointer-events-none absolute z-10 flex w-full items-start justify-between px-4 py-4">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[rgba(7,23,20,0.74)] px-2 py-2 backdrop-blur">
              {(Object.entries(VIEW_PRESETS) as Array<[ViewPreset, (typeof VIEW_PRESETS)[ViewPreset]]>).map(
                ([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setViewPreset(key)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors",
                      viewPreset === key
                        ? "bg-[hsl(var(--primary))] text-white"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[rgba(255,255,255,0.06)]"
                    )}
                  >
                    {preset.label}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              <div
                className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ backgroundColor: `${riskColor}22`, color: riskColor }}
              >
                {normalizedType}
              </div>
              <div className="rounded-full border border-[hsl(var(--border))] bg-[rgba(7,23,20,0.72)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] backdrop-blur">
                {activeLobe?.side ? `${activeLobe.side} lung` : "Approximate view"}
              </div>
            </div>
          </div>

          <Canvas camera={{ position: viewConfig.camera, fov: 32 }}>
            <ambientLight intensity={0.75} />
            <directionalLight position={[4, 6, 5]} intensity={1.25} color="#dffaf5" />
            <pointLight position={[-5, -2, 3]} intensity={0.45} color="#8fdcc9" />
            <spotLight position={[0, 6, 2]} intensity={0.65} angle={0.42} penumbra={0.5} color="#f2d08c" />

            <group rotation={[0.08, viewConfig.sceneRotationY, 0]}>
              <LungsModel activeLobeKey={activeLobe?.key} />
              <NoduleMarker position={markerPosition} sizeMm={sizeMm} riskColor={riskColor} />
              <Text position={[-2.45, 2.35, 0]} fontSize={0.15} color="#b7cbc7" anchorX="center">
                L
              </Text>
              <Text position={[2.45, 2.35, 0]} fontSize={0.15} color="#b7cbc7" anchorX="center">
                R
              </Text>
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}>
              <circleGeometry args={[3.1, 48]} />
              <meshBasicMaterial color="#3cc6ae" transparent opacity={0.04} />
            </mesh>

            <OrbitControls
              enableZoom
              enablePan={false}
              minDistance={4.8}
              maxDistance={8}
              maxPolarAngle={Math.PI * 0.72}
              minPolarAngle={Math.PI * 0.28}
            />
          </Canvas>
      </div>
    </div>
  );
};
