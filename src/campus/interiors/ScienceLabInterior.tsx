import { RoomShell, Table, Chair, PendantLamp, Painting } from "./Furniture";

export function ScienceLabInterior({ isNight }: { isNight: boolean }) {
  const W = 16, D = 14, H = 5.5;

  return (
    <group>
      <RoomShell width={W} depth={D} height={H} floorColor="#5a5a5a" wallColor="#e0e8e8" ceilingColor="#f0f4f4" isNight={isNight} />

      {/* Central island lab bench */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.9, 1.8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Lab bench top — white stone */}
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[5.1, 0.06, 1.9]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} />
      </mesh>

      {/* Fume hoods against back wall */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={i} position={[-4 + i * 4, 0, -D / 2 + 1]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[2.8, 2.4, 1]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* glass front */}
          <mesh position={[0, 1.2, 0.55]}>
            <boxGeometry args={[2.6, 2.2, 0.05]} />
            <meshStandardMaterial color="#a8d8e8" transparent opacity={0.35} roughness={0.05} metalness={0.1} />
          </mesh>
          {/* internal light */}
          <pointLight position={[0, 1.5, 0.3]} intensity={0.4} color="#c8e8f0" distance={3} />
        </group>
      ))}

      {/* Lab stools around island */}
      {[
        [-1.8, 0.8], [0, 0.8], [1.8, 0.8],
        [-1.8, -0.8], [0, -0.8], [1.8, -0.8],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.05, 16]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <torusGeometry args={[0.18, 0.02, 8, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Microscope & beakers on island */}
      <group position={[-1.5, 0.95, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.15]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#c8d8e8" metalness={0.8} roughness={0.1} />
        </mesh>
      </group>

      {/* Erlenmeyer flasks */}
      {[
        { x: 0.5, c: "#5ac8a0" }, { x: 1, c: "#e0a060" }, { x: 1.5, c: "#a060e0" },
      ].map((f, i) => (
        <mesh key={i} position={[f.x, 1.02, 0]}>
          <coneGeometry args={[0.18, 0.35, 16, 1, true]} />
          <meshStandardMaterial color={f.c} transparent opacity={0.55} roughness={0.1} />
        </mesh>
      ))}

      {/* Side desks with computers */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={i} position={[W / 2 - 1.5, 0, -D / 2 + 4 + i * 3]}>
          <Table position={[0, 0, 0]} size={[1.4, 0.72, 0.7]} />
          {/* Monitor */}
          <mesh position={[0, 1.1, -0.2]} castShadow>
            <boxGeometry args={[0.7, 0.45, 0.05]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 1.1, -0.17]}>
            <planeGeometry args={[0.6, 0.38]} />
          <meshStandardMaterial color="#3a5a8b" emissive="#2a4a7b" emissiveIntensity={0.5} />
          </mesh>
          <Chair position={[0, 0, 0.5]} rotation={Math.PI} />
        </group>
      ))}

      {/* Pendant lamps */}
      <PendantLamp position={[0, H - 0.5, 0]} isNight={isNight} />
      <PendantLamp position={[-4, H - 0.5, 0]} isNight={isNight} />
      <PendantLamp position={[4, H - 0.5, 0]} isNight={isNight} />

      {/* Periodic table poster */}
      <Painting position={[-W / 2 + 0.2, 3, 0]} rotation={Math.PI / 2} color="#3a8b5a" />

      {/* Safety shower sign */}
      <mesh position={[W / 2 - 0.2, 3, -D / 2 + 1]}>
        <boxGeometry args={[0.6, 0.8, 0.08]} />
        <meshStandardMaterial color="#2a6a2a" emissive="#1a4a1a" emissiveIntensity={0.3} />
      </mesh>

      {/* Glass atrium ceiling accent (skylight strips) */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[-4 + i * 2.6, H - 0.05, 0]}>
          <boxGeometry args={[1.8, 0.05, D - 1]} />
          <meshStandardMaterial color="#a8d8f0" transparent opacity={0.3} emissive="#88c8e0" emissiveIntensity={isNight ? 0.1 : 0.6} />
        </mesh>
      ))}
    </group>
  );
}
