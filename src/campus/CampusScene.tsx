import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { BuildingInfo } from "./types";
import { BUILDINGS } from "./buildings";

interface BuildingProps {
  building: BuildingInfo;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

function Building({ building, selected, hovered, onSelect, onHover }: BuildingProps) {
  const { id, color, accent, position, size, rotation } = building;
  const [w, h, d] = size;

  const isHighlight = selected || hovered;

  return (
    <group position={position} rotation={[0, rotation, 0]} onClick={(e) => { e.stopPropagation(); onSelect(id); }}>
      {/* main body */}
      <mesh
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(id); }}
        onPointerOut={() => onHover(null)}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={isHighlight ? accent : color}
          emissive={selected ? accent : "#000000"}
          emissiveIntensity={selected ? 0.25 : 0}
          roughness={0.75}
          metalness={0.1}
        />
      </mesh>

      {/* roof — a subtle flat slab */}
      <mesh position={[0, h + 0.4, 0]} castShadow>
        <boxGeometry args={[w + 1, 0.8, d + 1]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>

      {/* windows — a grid of emissive panels on each side */}
      <Windows width={w} height={h} depth={d} lit={selected || hovered} />

      {/* entrance door */}
      <mesh position={[0, 1.4, d / 2 + 0.05]}>
        <boxGeometry args={[2, 2.8, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* selection ring */}
      {selected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) / 2 + 0.8, Math.max(w, d) / 2 + 1.1, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Windows({ width, height, depth, lit }: { width: number; height: number; depth: number; lit: boolean }) {
  const cols = Math.max(3, Math.floor(width / 2.5));
  const rows = Math.max(2, Math.floor(height / 2.8));
  const panes = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const make = (faceW: number, faceD: number, dz: number, rotY: number) => {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = -faceW / 2 + (faceW / (cols + 1)) * (c + 1);
          const y = 1.8 + r * 2.6;
          arr.push({ pos: [x, y, dz], rot: [0, rotY, 0] });
        }
      }
    };
    make(width, depth, depth / 2 + 0.06, 0);
    make(width, depth, -depth / 2 - 0.06, Math.PI);
    make(depth, width, width / 2 + 0.06, -Math.PI / 2);
    make(depth, width, -width / 2 - 0.06, Math.PI / 2);
    return arr;
  }, [width, depth, rows, cols]);

  return (
    <group>
      {panes.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot}>
          <planeGeometry args={[1.4, 1.8]} />
          <meshStandardMaterial
            color={lit ? "#ffe9a8" : "#2a3340"}
            emissive={lit ? "#ffd27a" : "#0a1018"}
            emissiveIntensity={lit ? 0.7 : 0.25}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

function AdminDome({ building, selected, hovered, onSelect, onHover }: BuildingProps) {
  const { color, accent, position, size, rotation, id } = building;
  const [w, h, d] = size;
  const isHighlight = selected || hovered;
  return (
    <group position={position} rotation={[0, rotation, 0]} onClick={(e) => { e.stopPropagation(); onSelect(id); }}>
      <mesh
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(id); }}
        onPointerOut={() => onHover(null)}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={isHighlight ? accent : color}
          emissive={selected ? accent : "#000000"}
          emissiveIntensity={selected ? 0.2 : 0}
          roughness={0.8}
        />
      </mesh>
      {/* dome */}
      <mesh position={[0, h + 1.2, 0]} castShadow>
        <sphereGeometry args={[w / 2.6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#6a7a6a" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* columns */}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={i} position={[Math.cos(a) * (w / 2 + 0.6), 2.5, Math.sin(a) * (d / 2 + 0.6)]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 5, 12]} />
            <meshStandardMaterial color="#e8e0d0" roughness={0.7} />
          </mesh>
        );
      })}
      <Windows width={w} height={h} depth={d} lit={selected || hovered} />
      {selected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[w / 2 + 0.8, w / 2 + 1.1, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function SportsHall({ building, selected, hovered, onSelect, onHover }: BuildingProps) {
  const { color, accent, position, size, rotation, id } = building;
  const [w, h, d] = size;
  const isHighlight = selected || hovered;
  return (
    <group position={position} rotation={[0, rotation, 0]} onClick={(e) => { e.stopPropagation(); onSelect(id); }}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); onHover(id); }}
        onPointerOut={() => onHover(null)}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={isHighlight ? accent : color}
          emissive={selected ? accent : "#000000"}
          emissiveIntensity={selected ? 0.2 : 0}
          roughness={0.7}
        />
      </mesh>
      {/* curved roof */}
      <mesh position={[0, h + 1, 0]} castShadow rotation={[0, 0, 0]}>
        <cylinderGeometry args={[d / 2, d / 2, w, 24, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#2a4a3a" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Windows width={w} height={h} depth={d} lit={selected || hovered} />
      {selected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) / 2 + 0.8, Math.max(w, d) / 2 + 1.1, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 2, 8]} />
        <meshStandardMaterial color="#5a3d28" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#3d6b3d" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.6, 3.2, 0.4]} castShadow>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#457745" roughness={0.85} flatShading />
      </mesh>
    </group>
  );
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color="#fff3d0" emissive="#ffd27a" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 4, 0]} intensity={0.5} distance={12} color="#ffd27a" castShadow={false} />
    </group>
  );
}

function Fountain() {
  return (
    <group position={[0, 0, 12]}>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3.3, 0.4, 32]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 0.1, 32]} />
        <meshStandardMaterial color="#3a7a9a" transparent opacity={0.8} roughness={0.1} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 2, 12]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#9acce0" transparent opacity={0.7} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Path({ from, to }: { from: [number, number]; to: [number, number] }) {
  const mid = useMemo(() => {
    const [x1, z1] = from;
    const [x2, z2] = to;
    const length = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(z2 - z1, x2 - x1);
    return { length, angle, cx: (x1 + x2) / 2, cz: (z1 + z2) / 2 };
  }, [from, to]);

  return (
    <mesh position={[mid.cx, 0.02, mid.cz]} rotation={[-Math.PI / 2, 0, -mid.angle + Math.PI / 2]} receiveShadow>
      <planeGeometry args={[3.5, mid.length]} />
      <meshStandardMaterial color="#6b6258" roughness={0.95} />
    </mesh>
  );
}

interface CampusSceneProps {
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onClear: () => void;
}

export function CampusScene({ selectedId, hoveredId, onSelect, onHover, onClear }: CampusSceneProps) {
  const [w, h, d] = [0, 0, 0];
  void w; void h; void d;

  const trees = useMemo(() => {
    const pts: [number, number, number][] = [];
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 60; i++) {
      const x = (rng(i * 2 + 1) - 0.5) * 70;
      const z = (rng(i * 2 + 2) - 0.5) * 70;
      // keep clear of buildings (rough check)
      const tooClose = BUILDINGS.some(
        (b) => Math.abs(x - b.position[0]) < b.size[0] / 2 + 2 && Math.abs(z - b.position[2]) < b.size[2] / 2 + 2,
      );
      if (!tooClose) pts.push([x, 0, z]);
    }
    return pts;
  }, []);

  const lamps = useMemo<[number, number, number][]>(
    () => [
      [-8, 0, 6], [8, 0, 6], [-8, 0, 22], [8, 0, 22], [0, 0, -16], [0, 0, 24],
    ],
    [],
  );

  return (
    <group onClick={onClear}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#4a6b3a" roughness={1} />
      </mesh>

      {/* Central plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 6]} receiveShadow>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color="#7a7068" roughness={0.9} />
      </mesh>

      {/* Paths connecting buildings to center */}
      <Path from={[0, 6]} to={[-18, -10]} />
      <Path from={[0, 6]} to={[16, -14]} />
      <Path from={[0, 6]} to={[20, 14]} />
      <Path from={[0, 6]} to={[-16, 16]} />
      <Path from={[0, 6]} to={[0, -2]} />
      <Path from={[0, 6]} to={[0, 30]} />

      <Fountain />

      {/* Buildings */}
      {BUILDINGS.map((b) => {
        const props: BuildingProps = {
          building: b,
          selected: selectedId === b.id,
          hovered: hoveredId === b.id,
          onSelect,
          onHover,
        };
        if (b.id === "admin") return <AdminDome key={b.id} {...props} />;
        if (b.id === "sports") return <SportsHall key={b.id} {...props} />;
        return <Building key={b.id} {...props} />;
      })}

      {/* Trees */}
      {trees.map((p, i) => (
        <Tree key={i} position={p} />
      ))}

      {/* Lamps */}
      {lamps.map((p, i) => (
        <Lamp key={i} position={p} />
      ))}
    </group>
  );
}
