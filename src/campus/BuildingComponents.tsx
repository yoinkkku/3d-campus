import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { BuildingStyle } from "./types";
import {
  brickTextures, concreteTextures, stoneTextures, timberTextures,
  metalTextures, glassMaterial,
} from "./Materials";

export interface MaterialSet {
  wall: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
}

const cache = new Map<BuildingStyle, MaterialSet>();

export function useBuildingMaterials(style: BuildingStyle): MaterialSet {
  return useMemo(() => getMaterials(style), [style]);
}

export function getMaterials(style: BuildingStyle): MaterialSet {
  const existing = cache.get(style);
  if (existing) return existing;

  let mat: MaterialSet;
  switch (style) {
    case "brick-collegiate": {
      const t = brickTextures(3);
      mat = {
        wall: new THREE.MeshStandardMaterial({
          map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap,
          roughness: t.roughness ?? 0.85,
        }),
        trim: new THREE.MeshStandardMaterial({ color: "#d8cfc0", roughness: 0.7 }),
        roof: new THREE.MeshStandardMaterial({ color: "#3a3a3a", roughness: 0.85 }),
        glass: glassMaterial("#a8c8d8", 0.4),
      };
      break;
    }
    case "modern-glass": {
      const t = concreteTextures(2);
      mat = {
        wall: new THREE.MeshStandardMaterial({
          map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap,
          roughness: t.roughness ?? 0.7,
        }),
        trim: new THREE.MeshStandardMaterial({ color: "#4a4a4a", roughness: 0.4, metalness: 0.6 }),
        roof: new THREE.MeshStandardMaterial({ color: "#2a2a2a", roughness: 0.5, metalness: 0.4 }),
        glass: glassMaterial("#9ec8e0", 0.35),
      };
      break;
    }
    case "concrete-brutalist": {
      const t = concreteTextures(3);
      mat = {
        wall: new THREE.MeshStandardMaterial({
          map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap,
          roughness: t.roughness ?? 0.75,
        }),
        trim: new THREE.MeshStandardMaterial({ color: "#7a7a7a", roughness: 0.7 }),
        roof: new THREE.MeshStandardMaterial({ color: "#6a6a6a", roughness: 0.8 }),
        glass: glassMaterial("#6890a8", 0.5),
      };
      break;
    }
    case "stone-classical": {
      const t = stoneTextures(3);
      mat = {
        wall: new THREE.MeshStandardMaterial({
          map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap,
          roughness: t.roughness ?? 0.8,
        }),
        trim: new THREE.MeshStandardMaterial({ color: "#e0d8cc", roughness: 0.6 }),
        roof: new THREE.MeshStandardMaterial({ color: "#5a6a5a", roughness: 0.6, metalness: 0.3 }),
        glass: glassMaterial("#a0b8c8", 0.42),
      };
      break;
    }
    case "timber-pavilion": {
      const t = timberTextures(3);
      mat = {
        wall: new THREE.MeshStandardMaterial({
          map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap,
          roughness: t.roughness ?? 0.65,
        }),
        trim: new THREE.MeshStandardMaterial({ color: "#3a3a3a", roughness: 0.5, metalness: 0.3 }),
        roof: new THREE.MeshStandardMaterial({ color: "#4a4a4a", roughness: 0.7 }),
        glass: glassMaterial("#c8d8c0", 0.35),
      };
      break;
    }
    case "metal-clad": {
      const t = metalTextures(3);
      mat = {
        wall: new THREE.MeshStandardMaterial({
          map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap,
          roughness: t.roughness ?? 0.35, metalness: t.metalness ?? 0.6,
        }),
        trim: new THREE.MeshStandardMaterial({ color: "#5a5a5a", roughness: 0.3, metalness: 0.7 }),
        roof: new THREE.MeshStandardMaterial({ color: "#4a4a4a", roughness: 0.3, metalness: 0.6 }),
        glass: glassMaterial("#a0c0d0", 0.35),
      };
      break;
    }
    default: {
      // mixed-contemporary
      const t = concreteTextures(2);
      const tm = timberTextures(2);
      mat = {
        wall: new THREE.MeshStandardMaterial({
          map: t.map, normalMap: t.normalMap, roughnessMap: t.roughnessMap,
          roughness: 0.7,
        }),
        trim: new THREE.MeshStandardMaterial({
          map: tm.map, normalMap: tm.normalMap, roughnessMap: tm.roughnessMap,
          roughness: 0.65,
        }),
        roof: new THREE.MeshStandardMaterial({ color: "#3a3a3a", roughness: 0.6 }),
        glass: glassMaterial("#b8d0d8", 0.35),
      };
      break;
    }
  }
  cache.set(style, mat);
  return mat;
}

/* ---- Window with frame and depth ---- */
interface WindowProps {
  position: [number, number, number];
  rotation?: number;
  width?: number;
  height?: number;
  glass: THREE.MeshPhysicalMaterial;
  frameColor?: string;
  lit?: boolean;
  isNight?: boolean;
}

export function WindowPane({
  position, rotation = 0, width = 2, height = 2.4, glass, frameColor = "#2a2a2a", lit, isNight,
}: WindowProps) {
  const litColor = useMemo(() => new THREE.Color("#ffd89a"), []);
  const darkGlass = glass;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* frame surround */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width + 0.15, height + 0.15, 0.12]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[width - 0.1, height - 0.1, 0.04]} />
        {lit && isNight ? (
          <meshStandardMaterial
            color={litColor}
            emissive={litColor}
            emissiveIntensity={0.8}
            roughness={0.1}
            transparent
            opacity={0.8}
          />
        ) : (
          <primitiveMaterial object={darkGlass} attach="material" />
        )}
      </mesh>
      {/* mullions (cross) */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.04, height - 0.1, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[width - 0.1, 0.04, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* sill */}
      <mesh position={[0, -height / 2 - 0.08, 0.1]}>
        <boxGeometry args={[width + 0.3, 0.12, 0.25]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ---- Window grid generator for a wall face ---- */
interface WindowGridProps {
  wallWidth: number;
  wallHeight: number;
  floors: number;
  glass: THREE.MeshPhysicalMaterial;
  frameColor: string;
  zOffset: number;
  rotationY?: number;
  isNight: boolean;
  litPattern?: boolean[];
}

export function WindowGrid({
  wallWidth, wallHeight, floors, glass, frameColor, zOffset, rotationY = 0, isNight, litPattern,
}: WindowGridProps) {
  const windows = useMemo(() => {
    const cols = Math.max(2, Math.floor(wallWidth / 3.2));
    const items: { pos: [number, number, number]; w: number; h: number; lit: boolean }[] = [];
    const wW = Math.min(2.2, (wallWidth - 1.5) / cols);
    const wH = Math.min(2.4, (wallHeight - 1) / floors);
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        const x = -wallWidth / 2 + (wallWidth / (cols + 1)) * (c + 1);
        const y = 1.8 + f * (wallHeight / floors);
        const idx = f * cols + c;
        const lit = litPattern ? litPattern[idx] ?? false : (idx * 37 + 11) % 100 < 55;
        items.push({ pos: [x, y, zOffset], w: wW, h: wH, lit });
      }
    }
    return items;
  }, [wallWidth, wallHeight, floors, zOffset, litPattern]);

  return (
    <group rotation={[0, rotationY, 0]}>
      {windows.map((win, i) => (
        <WindowPane
          key={i}
          position={win.pos}
          width={win.w}
          height={win.h}
          glass={glass}
          frameColor={frameColor}
          lit={win.lit}
          isNight={isNight}
        />
      ))}
    </group>
  );
}

/* ---- Entrance door ---- */
export function EntranceDoor({
  position, rotation = 0, width = 3, height = 3.5, color = "#2a1a10",
}: {
  position: [number, number, number]; rotation?: number; width?: number; height?: number; color?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* frame */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.3, height + 0.2, 0.2]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* door panels */}
      <mesh position={[-width / 4, height / 2, 0.1]}>
        <boxGeometry args={[width / 2 - 0.05, height - 0.15, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[width / 4, height / 2, 0.1]}>
        <boxGeometry args={[width / 2 - 0.05, height - 0.15, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* glass above door (transom) */}
      <mesh position={[0, height + 0.4, 0.08]}>
        <boxGeometry args={[width - 0.2, 0.8, 0.04]} />
        <meshStandardMaterial color="#a8c8d8" transparent opacity={0.4} roughness={0.05} />
      </mesh>
      {/* handles */}
      <mesh position={[-0.15, height / 2, 0.16]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#c8b070" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0.15, height / 2, 0.16]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#c8b070" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

/* ---- Steps / staircase entrance ---- */
export function EntranceSteps({
  position, rotation = 0, width = 6, steps = 3,
}: {
  position: [number, number, number]; rotation?: number; width?: number; steps?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: steps }).map((_, i) => (
        <mesh key={i} position={[0, 0.15 + i * 0.2, 0.3 + i * 0.35]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.2, 0.5]} />
          <meshStandardMaterial color="#b0b0b0" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ---- Roof edge / cornice ---- */
export function Cornice({
  width, depth, y, material, overhang = 0.4,
}: {
  width: number; depth: number; y: number; material: THREE.Material; overhang?: number;
}) {
  return (
    <mesh position={[0, y, 0]} castShadow>
      <boxGeometry args={[width + overhang, 0.4, depth + overhang]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ---- Building label / signage ---- */
export function BuildingSign({
  text, position, rotation = 0, color = "#ffffff",
}: {
  text: string; position: [number, number, number]; rotation?: number; color?: string;
}) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgba(20,20,25,0.85)";
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = color;
    ctx.font = "bold 52px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 64);
    return c;
  }, [text, color]);

  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.needsUpdate = true;
    return t;
  }, [canvas]);

  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <planeGeometry args={[4, 1]} />
      <meshBasicMaterial map={tex} transparent />
    </mesh>
  );
}

/* ---- Outlined building wrapper (hover/select highlight) ---- */
export function OutlineBox({
  width, height, depth, color, opacity = 0.4,
}: {
  width: number; height: number; depth: number; color: string; opacity?: number;
}) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(width, height, depth)), [width, height, depth]);
  return (
    <lineSegments>
      <primitive object={edges} />
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={2} />
    </lineSegments>
  );
}

/* ---- Floating label above building (hover) ---- */
export function FloatingLabel({
  text, position, accent,
}: {
  text: string; position: [number, number, number]; accent: string;
}) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 400;
    c.height = 80;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgba(15,18,25,0.85)";
    ctx.roundRect(8, 8, 384, 64, 12);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.roundRect(10, 10, 380, 60, 10);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 200, 40);
    return c;
  }, [text, accent]);

  const tex = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);
  const ref = useRef<THREE.Sprite>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  return (
    <sprite ref={ref} position={position} scale={[5, 1, 1]}>
      <spriteMaterial map={tex} transparent depthTest={false} />
    </sprite>
  );
}
