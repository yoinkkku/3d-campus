import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { grassTexture, pavingTexture, asphaltTexture } from "./Materials";

/* ---- Tree with wind sway ---- */
type TreeSpecies = "oak" | "pine" | "maple" | "birch";

const TREE_CONFIG: Record<TreeSpecies, {
  trunk: string; foliage: string; foliage2: string; height: number; spread: number; shape: "round" | "conical";
}> = {
  oak: { trunk: "#5a3d28", foliage: "#3d6b3d", foliage2: "#457745", height: 7, spread: 4, shape: "round" },
  pine: { trunk: "#4a3525", foliage: "#2d5a3d", foliage2: "#356b45", height: 9, spread: 3, shape: "conical" },
  maple: { trunk: "#5a4030", foliage: "#8b5a2a", foliage2: "#a06a35", height: 6, spread: 3.5, shape: "round" },
  birch: { trunk: "#e8e0d8", foliage: "#5a8b3d", foliage2: "#6b9b4a", height: 8, spread: 2.5, shape: "round" },
};

function Tree({ position, species, seed }: { position: [number, number, number]; species: TreeSpecies; seed: number }) {
  const cfg = TREE_CONFIG[species];
  const foliageRef = useRef<THREE.Group>(null);
  const swayPhase = useMemo(() => seed * 0.3, [seed]);

  useFrame((state) => {
    if (foliageRef.current) {
      const t = state.clock.elapsedTime;
      foliageRef.current.rotation.z = Math.sin(t * 0.8 + swayPhase) * 0.03;
      foliageRef.current.rotation.x = Math.cos(t * 0.6 + swayPhase) * 0.02;
      foliageRef.current.position.x = Math.sin(t * 0.5 + swayPhase) * 0.08;
    }
  });

  const trunkH = cfg.height * 0.35;

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, trunkH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.4, trunkH, 8]} />
        <meshStandardMaterial color={cfg.trunk} roughness={0.9} />
      </mesh>
      {species === "birch" && (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh key={i} position={[0, trunkH * (0.2 + i * 0.2), 0.21]}>
              <boxGeometry args={[0.5, 0.06, 0.01]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
            </mesh>
          ))}
        </>
      )}
      {/* Foliage */}
      <group ref={foliageRef} position={[0, trunkH + cfg.spread * 0.6, 0]}>
        {cfg.shape === "conical" ? (
          <>
            <mesh position={[0, 0, 0]} castShadow>
              <coneGeometry args={[cfg.spread, cfg.height * 0.65, 12]} />
              <meshStandardMaterial color={cfg.foliage} roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0, cfg.spread, 0]} castShadow>
              <coneGeometry args={[cfg.spread * 0.7, cfg.height * 0.5, 12]} />
              <meshStandardMaterial color={cfg.foliage2} roughness={0.85} flatShading />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[0, 0, 0]} castShadow>
              <icosahedronGeometry args={[cfg.spread, 1]} />
              <meshStandardMaterial color={cfg.foliage} roughness={0.85} flatShading />
            </mesh>
            <mesh position={[cfg.spread * 0.5, cfg.spread * 0.4, cfg.spread * 0.3]} castShadow>
              <icosahedronGeometry args={[cfg.spread * 0.65, 1]} />
              <meshStandardMaterial color={cfg.foliage2} roughness={0.85} flatShading />
            </mesh>
            <mesh position={[-cfg.spread * 0.4, cfg.spread * 0.5, -cfg.spread * 0.3]} castShadow>
              <icosahedronGeometry args={[cfg.spread * 0.55, 1]} />
              <meshStandardMaterial color={cfg.foliage} roughness={0.85} flatShading />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

/* ---- Flower bed ---- */
function FlowerBed({ position, size = [4, 2] }: { position: [number, number, number]; size?: [number, number] }) {
  const flowers = useMemo(() => {
    const arr: { pos: [number, number, number]; color: string }[] = [];
    const colors = ["#e85a5a", "#e8c85a", "#c85ae8", "#5ac8e8", "#e88a5a"];
    const count = Math.floor(size[0] * size[1] * 1.5);
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * size[0],
          0.15,
          (Math.random() - 0.5) * size[1],
        ],
        color: colors[i % colors.length],
      });
    }
    return arr;
  }, [size]);

  return (
    <group position={position}>
      {/* soil / mulch */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[size[0] + 0.3, 0.1, size[1] + 0.3]} />
        <meshStandardMaterial color="#3a2818" roughness={1} />
      </mesh>
      {/* edging */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[size[0] + 0.4, 0.24, 0.1]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.1, 0.24, size[1] + 0.4]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.7} />
      </mesh>
      {flowers.map((f, i) => (
        <group key={i} position={f.pos}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 4]} />
            <meshStandardMaterial color="#3d6b3d" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color={f.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---- Lamp post ---- */
function LampPost({ position, isNight }: { position: [number, number, number]; isNight: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 5, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* arm */}
      <mesh position={[0.5, 4.8, 0]} castShadow>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* lamp head */}
      <mesh position={[1, 4.7, 0]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial
          color="#fff3d0"
          emissive="#ffd27a"
          emissiveIntensity={isNight ? 2.5 : 0.5}
          roughness={0.3}
        />
      </mesh>
      {/* base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.3, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} />
      </mesh>
      {isNight && (
        <pointLight position={[1, 4.5, 0]} intensity={1.2} distance={15} color="#ffd8a0" castShadow={false} />
      )}
    </group>
  );
}

/* ---- Bench ---- */
function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* seat */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.8, 0.08, 0.5]} />
        <meshStandardMaterial color="#6b4a32" roughness={0.7} />
      </mesh>
      {/* backrest */}
      <mesh position={[0, 0.8, -0.22]} castShadow>
        <boxGeometry args={[1.8, 0.5, 0.06]} />
        <meshStandardMaterial color="#6b4a32" roughness={0.7} />
      </mesh>
      {/* legs */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 0.25, 0]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.45]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ---- Parked car ---- */
function Car({ position, rotation = 0, color = "#4a6fa5" }: { position: [number, number, number]; rotation?: number; color?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[4, 0.8, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} clearcoat={1} />
      </mesh>
      {/* cabin */}
      <mesh position={[-0.2, 1.1, 0]} castShadow>
        <boxGeometry args={[2.2, 0.7, 1.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* windows */}
      <mesh position={[-0.2, 1.15, 0]}>
        <boxGeometry args={[2, 0.55, 1.62]} />
        <meshStandardMaterial color="#1a2030" roughness={0.05} metalness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* wheels */}
      {[
        [-1.3, 0.9], [1.3, 0.9], [-1.3, -0.9], [1.3, -0.9],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
      {/* headlights */}
      <mesh position={[2, 0.55, 0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#fff8e0" emissive="#fff8e0" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[2, 0.55, -0.6]}>
        <boxGeometry args={[0.1, 0.2, 0.3]} />
        <meshStandardMaterial color="#fff8e0" emissive="#fff8e0" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ---- Bike rack ---- */
function BikeRack({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.7, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.35, 0.04, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ---- Walking figure ---- */
function Figure({ path, speed = 1, offset = 0 }: { path: THREE.Vector3[]; speed?: number; offset?: number }) {
  const ref = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const totalLen = useMemo(() => {
    let len = 0;
    for (let i = 0; i < path.length - 1; i++) len += path[i].distanceTo(path[i + 1]);
    return len;
  }, [path]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * speed + offset) % totalLen;
    let acc = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const seg = path[i].distanceTo(path[i + 1]);
      if (acc + seg >= t) {
        const local = (t - acc) / seg;
        const pos = path[i].clone().lerp(path[i + 1], local);
        ref.current.position.set(pos.x, 0, pos.z);
        const dir = path[i + 1].clone().sub(path[i]);
        ref.current.rotation.y = Math.atan2(dir.x, dir.z);
        break;
      }
      acc += seg;
    }
    // leg swing
    const swing = Math.sin(state.clock.elapsedTime * 6 + offset) * 0.3;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
  });

  return (
    <group ref={ref}>
      {/* body */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 4, 8]} />
        <meshStandardMaterial color="#4a6fa5" roughness={0.7} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#e0c0a0" roughness={0.6} />
      </mesh>
      {/* legs */}
      <mesh ref={legL} position={[-0.1, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.7} />
      </mesh>
      <mesh ref={legR} position={[0.1, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ---- Animated fountain ---- */
function Fountain({ position }: { position: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);
  const jetRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      const t = state.clock.elapsedTime;
      mat.opacity = 0.7 + Math.sin(t * 2) * 0.08;
    }
    if (jetRef.current) {
      const t = state.clock.elapsedTime;
      jetRef.current.children.forEach((c, i) => {
        const phase = i * 0.5;
        c.scale.y = 0.8 + Math.sin(t * 3 + phase) * 0.2;
        c.position.y = 2 + Math.sin(t * 4 + phase) * 0.3;
      });
    }
  });

  return (
    <group position={position}>
      {/* pool basin */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4, 4.5, 0.5, 32]} />
        <meshStandardMaterial color="#9a9a9a" roughness={0.5} />
      </mesh>
      {/* water surface */}
      <mesh ref={waterRef} position={[0, 0.38, 0]}>
        <cylinderGeometry args={[3.8, 3.8, 0.1, 32]} />
        <meshStandardMaterial
          color="#3a8ac8" transparent opacity={0.75} roughness={0.05} metalness={0.3}
          emissive="#2a6a98" emissiveIntensity={0.1}
        />
      </mesh>
      {/* central column */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 2, 12]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* top bowl */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1, 0.4, 16]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* water jets */}
      <group ref={jetRef}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.8, 2, Math.sin(a) * 0.8]}>
              <cylinderGeometry args={[0.06, 0.1, 1.5, 8]} />
              <meshStandardMaterial color="#a0d8f0" transparent opacity={0.6} roughness={0.05} />
            </mesh>
          );
        })}
      </group>
      {/* point light at night is handled by environment */}
    </group>
  );
}

/* ---- Ground / landscaping ---- */
interface LandscapingProps {
  isNight: boolean;
  onGroundClick: (point: THREE.Vector3) => void;
}

export function Landscaping({ isNight, onGroundClick }: LandscapingProps) {
  const grass = useMemo(() => grassTexture(8), []);
  const paving = useMemo(() => pavingTexture(6), []);
  const asphalt = useMemo(() => asphaltTexture(4), []);

  const trees = useMemo(() => {
    const species: TreeSpecies[] = ["oak", "pine", "maple", "birch"];
    const arr: { pos: [number, number, number]; species: TreeSpecies; seed: number }[] = [];
    // deterministic random
    const rng = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
    for (let i = 0; i < 80; i++) {
      const x = (rng(i * 3 + 1) - 0.5) * 120;
      const z = (rng(i * 3 + 2) - 0.5) * 120;
      // keep clear of building zones (rough)
      const nearBuilding = [
        [-15, -15, 15, 15], [0, -32, 20, 18], [-34, -18, 22, 22], [32, -20, 24, 22],
        [34, 10, 24, 24], [-36, 10, 24, 24], [-20, 16, 22, 22], [16, 18, 24, 22],
        [-2, 38, 34, 24], [28, 32, 24, 24], [-50, 32, 22, 22], [-52, -2, 22, 24],
        [48, -8, 22, 24], [-2, -2, 18, 12], // central quad
      ].some(([cx, cz, sw, sd]) => Math.abs(x - cx) < sw / 2 && Math.abs(z - cz) < sd / 2);
      if (!nearBuilding && Math.abs(x) < 60 && Math.abs(z) < 60) {
        arr.push({ pos: [x, 0, z], species: species[Math.floor(rng(i * 5) * 4)], seed: i });
      }
    }
    return arr;
  }, []);

  const lampPositions = useMemo<[number, number, number][]>(() => {
    const arr: [number, number, number][] = [];
    // along main paths
    const paths = [
      { x1: 0, z1: -10, x2: 0, z2: -20 }, { x1: 0, z1: -5, x2: -28, z2: -10 },
      { x1: 0, z1: -5, x2: 30, z2: -12 }, { x1: 0, z1: 10, x2: -16, z2: 18 },
      { x1: 0, z1: 10, x2: 16, z2: 20 }, { x1: 0, z1: 10, x2: 0, z2: 38 },
      { x1: 0, z1: 10, x2: 28, z2: 36 }, { x1: 0, z1: -5, x2: 46, z2: -2 },
    ];
    paths.forEach((p) => {
      const len = Math.hypot(p.x2 - p.x1, p.z2 - p.z1);
      const n = Math.floor(len / 8);
      for (let i = 1; i <= n; i++) {
        const t = i / (n + 1);
        arr.push([
          p.x1 + (p.x2 - p.x1) * t + 2,
          0,
          p.z1 + (p.z2 - p.z1) * t + 2,
        ]);
      }
    });
    return arr;
  }, []);

  const figures = useMemo(() => {
    const paths = [
      [
        new THREE.Vector3(-40, 0, -10), new THREE.Vector3(-15, 0, -5),
        new THREE.Vector3(0, 0, 5), new THREE.Vector3(15, 0, 15),
      ],
      [
        new THREE.Vector3(30, 0, -20), new THREE.Vector3(10, 0, -10),
        new THREE.Vector3(0, 0, 5), new THREE.Vector3(-20, 0, 20),
      ],
      [
        new THREE.Vector3(0, 0, 30), new THREE.Vector3(0, 0, 10),
        new THREE.Vector3(10, 0, 0), new THREE.Vector3(20, 0, 15),
      ],
      [
        new THREE.Vector3(-30, 0, 30), new THREE.Vector3(-10, 0, 20),
        new THREE.Vector3(0, 0, 5), new THREE.Vector3(20, 0, -10),
      ],
    ];
    return paths.map((p, i) => ({ path: p, speed: 2 + i * 0.5, offset: i * 8 }));
  }, []);

  const cars = useMemo(() => {
    const colors = ["#4a6fa5", "#c84a4a", "#4a8b5a", "#e8e8e8", "#2a2a2a", "#c8a050"];
    return [
      { pos: [-12, 0, 44], rot: 0, color: colors[0] },
      { pos: [-8, 0, 44], rot: 0, color: colors[1] },
      { pos: [-4, 0, 44], rot: 0, color: colors[2] },
      { pos: [12, 0, 44], rot: Math.PI, color: colors[3] },
      { pos: [8, 0, 44], rot: Math.PI, color: colors[4] },
    ] as { pos: [number, number, number]; rot: number; color: string }[];
  }, []);

  return (
    <group>
      {/* Main ground (lawn) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow
        onClick={(e) => { e.stopPropagation(); onGroundClick(e.point); }}
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={grass.map} roughnessMap={grass.roughnessMap} roughness={grass.roughness} />
      </mesh>

      {/* Central quad plaza (paved circle) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]} receiveShadow>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial map={paving.map} normalMap={paving.normalMap} roughness={paving.roughness} />
      </mesh>

      {/* Paths from quad to each building */}
      <PathMesh from={[0, 2]} to={[0, -22]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[-28, -10]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[30, -14]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[34, 16]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[-30, 16]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[-16, 20]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[16, 22]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[0, 42]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[28, 38]} material={paving} width={5} />
      <PathMesh from={[0, 2]} to={[46, -2]} material={paving} width={5} />

      {/* Road ring around campus */}
      <RingRoad material={asphalt} />

      {/* Fountain at center of quad */}
      <Fountain position={[0, 0, 2]} />

      {/* Trees */}
      {trees.map((t, i) => (
        <Tree key={i} position={t.pos} species={t.species} seed={t.seed} />
      ))}

      {/* Lamp posts */}
      {lampPositions.map((p, i) => (
        <LampPost key={i} position={p} isNight={isNight} />
      ))}

      {/* Benches around the quad */}
      {[
        [-6, 0, 8, 0], [6, 0, 8, Math.PI], [-8, 0, -4, 0.3], [8, 0, -4, -0.3,
      ].map(([x, y, z, r], i) => (
        <Bench key={i} position={[x as number, y as number, z as number]} rotation={r as number} />
      ))}

      {/* Flower beds */}
      <FlowerBed position={[-10, 0, 6]} size={[5, 2]} />
      <FlowerBed position={[10, 0, 6]} size={[5, 2]} />
      <FlowerBed position={[-12, 0, -8]} size={[3, 3]} />
      <FlowerBed position={[12, 0, -8]} size={[3, 3]} />

      {/* Parked cars along road */}
      {cars.map((c, i) => (
        <Car key={i} position={c.pos} rotation={c.rot} color={c.color} />
      ))}

      {/* Bike racks */}
      <BikeRack position={[-5, 0, 36]} rotation={0} />
      <BikeRack position={[5, 0, 36]} rotation={0} />

      {/* Walking figures */}
      {figures.map((f, i) => (
        <Figure key={i} path={f.path} speed={f.speed} offset={f.offset} />
      ))}
    </group>
  );
}

function PathMesh({
  from, to, material, width = 5,
}: {
  from: [number, number]; to: [number, number]; material: { map: THREE.Texture; normalMap?: THREE.Texture; roughness: number }; width?: number;
}) {
  const { length, angle, cx, cz } = useMemo(() => {
    const [x1, z1] = from;
    const [x2, z2] = to;
    return {
      length: Math.hypot(x2 - x1, z2 - z1),
      angle: Math.atan2(z2 - z1, x2 - x1),
      cx: (x1 + x2) / 2,
      cz: (z1 + z2) / 2,
    };
  }, [from, to]);

  return (
    <mesh position={[cx, 0.03, cz]} rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial map={material.map} normalMap={material.normalMap} roughness={material.roughness} />
    </mesh>
  );
}

function RingRoad({ material }: { material: { map: THREE.Texture; roughness: number } }) {
  const ring = useMemo(() => {
    const shape = new THREE.Shape();
    const inner = 55;
    const outer = 62;
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const x = Math.cos(a) * outer;
      const z = Math.sin(a) * outer;
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    const hole = new THREE.Path();
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const x = Math.cos(a) * inner;
      const z = Math.sin(a) * inner;
      if (i === 0) hole.moveTo(x, z);
      else hole.lineTo(x, z);
    }
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow geometry={ring}>
      <meshStandardMaterial map={material.map} roughness={material.roughness} side={THREE.DoubleSide} />
    </mesh>
  );
}
