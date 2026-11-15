import { RoomShell, Table, Chair, PendantLamp, Painting } from "./Furniture";

export function CafeteriaInterior({ isNight }: { isNight: boolean }) {
  const W = 18, D = 14, H = 6;

  return (
    <group>
      <RoomShell width={W} depth={D} height={H} floorColor="#c89a6a" wallColor="#f0e8d8" ceilingColor="#f8f4ec" isNight={isNight} />

      {/* Dining tables with chairs */}
      {[
        [-5, -2], [0, -2], [5, -2],
        [-5, 2], [0, 2], [5, 2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Table position={[0, 0, 0]} size={[2, 0.75, 1]} />
          <Chair position={[-0.6, 0, 0.7]} rotation={Math.PI} />
          <Chair position={[0.6, 0, 0.7]} rotation={Math.PI} />
          <Chair position={[-0.6, 0, -0.7]} rotation={0} />
          <Chair position={[0.6, 0, -0.7]} rotation={0} />
          {/* center piece — a small vase */}
          <mesh position={[0, 0.82, 0]}>
            <cylinderGeometry args={[0.08, 0.06, 0.15, 12]} />
            <meshStandardMaterial color="#c8a0a0" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#e86a6a" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Food counter / serving station at back */}
      <mesh position={[0, 0.6, -D / 2 + 1.5]} castShadow receiveShadow>
        <boxGeometry args={[W - 2, 1.2, 1.5]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.22, -D / 2 + 1.5]}>
        <boxGeometry args={[W - 2.1, 0.06, 1.6]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.3} />
      </mesh>

      {/* Steam trays on counter */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[-5 + i * 3.3, 1.35, -D / 2 + 1.5]}>
          <boxGeometry args={[1.5, 0.25, 0.8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.4} />
        </mesh>
      ))}

      {/* Coffee bar on the left */}
      <mesh position={[-W / 2 + 2, 0.6, -D / 2 + 4]} castShadow>
        <boxGeometry args={[3, 1.2, 1.5]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.5} />
      </mesh>
      <mesh position={[-W / 2 + 2, 1.22, -D / 2 + 4]}>
        <boxGeometry args={[3.1, 0.06, 1.6]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.4} />
      </mesh>
      {/* Espresso machine */}
      <mesh position={[-W / 2 + 2, 1.55, -D / 2 + 4]} castShadow>
        <boxGeometry args={[1, 0.6, 0.7]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-W / 2 + 1.5, 1.45, -D / 2 + 4]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
      </mesh>

      {/* Pendant lamps over tables */}
      <PendantLamp position={[-5, H - 0.6, -2]} isNight={isNight} />
      <PendantLamp position={[0, H - 0.6, -2]} isNight={isNight} />
      <PendantLamp position={[5, H - 0.6, -2]} isNight={isNight} />
      <PendantLamp position={[-5, H - 0.6, 2]} isNight={isNight} />
      <PendantLamp position={[0, H - 0.6, 2]} isNight={isNight} />
      <PendantLamp position={[5, H - 0.6, 2]} isNight={isNight} />

      {/* Plants in corners */}
      {[
        [-W / 2 + 1, -D / 2 + 1], [W / 2 - 1, -D / 2 + 1],
        [-W / 2 + 1, D / 2 - 1], [W / 2 - 1, D / 2 - 1],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 0.6, 12]} />
            <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <icosahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color="#3d6b3d" roughness={0.85} flatShading />
          </mesh>
        </group>
      ))}

      {/* Paintings */}
      <Painting position={[-W / 2 + 0.2, 3, 0]} rotation={Math.PI / 2} color="#c97b4a" />
      <Painting position={[W / 2 - 0.2, 3, 0]} rotation={-Math.PI / 2} color="#e0a074" />

      {/* Menu board */}
      <mesh position={[0, 2.5, -D / 2 + 0.2]}>
        <boxGeometry args={[4, 1.8, 0.1]} />
        <meshStandardMaterial color="#2a2a2a" emissive="#1a2a1a" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
