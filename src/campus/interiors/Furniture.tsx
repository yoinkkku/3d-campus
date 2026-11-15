import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Shared interior shell: floor, walls, ceiling, and warm lighting.
 */
export function RoomShell({
  width,
  depth,
  height,
  floorColor = "#8a7a68",
  wallColor = "#e8e0d5",
  ceilingColor = "#f5f0e8",
  isNight = false,
}: {
  width: number;
  depth: number;
  height: number;
  floorColor?: string;
  wallColor?: string;
  ceilingColor?: string;
  isNight?: boolean;
}) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.6} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.3]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* Front wall (open — lower height for camera view) */}
      <mesh position={[0, height / 4, depth / 2]} receiveShadow>
        <boxGeometry args={[width, height / 2, 0.3]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* Right wall */}
      <mesh position={[width / 2, height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[width, depth, 0.2]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Warm ambient + key lights */}
      <ambientLight intensity={isNight ? 0.3 : 0.7} color="#fff4e0" />
      <pointLight position={[0, height - 1, 0]} intensity={isNight ? 1.5 : 0.8} color="#ffe9b0" distance={width * 1.5} castShadow />
      <pointLight position={[-width / 3, height - 1, depth / 3]} intensity={0.6} color="#ffd8a0" distance={width} />
      <pointLight position={[width / 3, height - 1, -depth / 3]} intensity={0.6} color="#ffd8a0" distance={width} />
      <directionalLight position={[5, height - 2, 10]} intensity={isNight ? 0.2 : 0.5} color="#fff0d8" />
    </group>
  );
}

/** A bookshelf segment. */
export function Bookshelf({
  position,
  rotation = 0,
  height = 4,
  width = 2.5,
}: {
  position: [number, number, number];
  rotation?: number;
  height?: number;
  width?: number;
}) {
  const bookColors = ["#8b3a3a", "#3a5a8b", "#3a8b5a", "#8b693a", "#6a3a8b", "#8b3a6a", "#3a8b8b"];
  const shelves = Math.floor(height / 0.7);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* frame */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.6]} />
        <meshStandardMaterial color="#5a3d28" roughness={0.8} />
      </mesh>
      {/* shelf backs cut out with books */}
      {Array.from({ length: shelves }).map((_, s) => {
        const y = 0.4 + s * 0.7;
        const booksPerShelf = Math.floor(width / 0.22);
        return (
          <group key={s} position={[0, y, 0.05]}>
            {Array.from({ length: booksPerShelf }).map((_, i) => {
              const x = -width / 2 + 0.15 + i * 0.22;
              const bh = 0.45 + ((i * 7 + s * 3) % 5) * 0.04;
              return (
                <mesh key={i} position={[x, bh / 2, 0]} castShadow>
                  <boxGeometry args={[0.18, bh, 0.4]} />
                  <meshStandardMaterial color={bookColors[(i + s) % bookColors.length]} roughness={0.7} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

/** A simple chair. */
export function Chair({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.45, 0.05, 0.45]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[0.45, 0.6, 0.05]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.7} />
      </mesh>
      {[
        [-0.18, 0.22], [0.18, 0.22], [-0.18, -0.22], [0.18, -0.22],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
          <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** A table. */
export function Table({ position, size = [1.4, 0.75, 0.8] }: { position: [number, number, number]; size?: [number, number, number] }) {
  const [w, h, d] = size;
  return (
    <group position={position}>
      <mesh position={[0, h, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial color="#6b4a32" roughness={0.6} />
      </mesh>
      {[
        [-w / 2 + 0.1, -d / 2 + 0.1], [w / 2 - 0.1, -d / 2 + 0.1],
        [-w / 2 + 0.1, d / 2 - 0.1], [w / 2 - 0.1, d / 2 - 0.1],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow>
          <boxGeometry args={[0.08, h, 0.08]} />
          <meshStandardMaterial color="#4a3322" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** A ceiling pendant lamp. */
export function PendantLamp({ position, isNight }: { position: [number, number, number]; isNight?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.8, 4]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh ref={ref} position={[0, -0.15, 0]}>
        <coneGeometry args={[0.3, 0.4, 16, 1, true]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#fff3d0" emissive="#ffd27a" emissiveIntensity={isNight ? 2 : 1.2} />
      </mesh>
      <pointLight position={[0, -0.3, 0]} intensity={isNight ? 1.2 : 0.6} color="#ffd8a0" distance={8} />
    </group>
  );
}

/** Wall art / painting. */
export function Painting({ position, rotation = 0, color = "#4a6fa5" }: { position: [number, number, number]; rotation?: number; color?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh>
        <boxGeometry args={[1.6, 1.1, 0.08]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.4, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}
