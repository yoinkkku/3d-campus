import { RoomShell, Chair, PendantLamp, Painting } from "./Furniture";

export function LectureHallInterior({ isNight }: { isNight: boolean }) {
  const W = 16, D = 16, H = 7;

  // Tiered rows — each row is higher and further back
  const rows = 5;
  const seatsPerRow = 8;

  return (
    <group>
      <RoomShell width={W} depth={D} height={H} floorColor="#3a3a3a" wallColor="#d8d0c5" ceilingColor="#e8e0d5" isNight={isNight} />

      {/* Presenter stage / podium */}
      <mesh position={[0, 0.05, -D / 2 + 2]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.1, 3]} />
        <meshStandardMaterial color="#4a3322" roughness={0.6} />
      </mesh>
      {/* Podium */}
      <mesh position={[0, 0.6, -D / 2 + 1.5]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.25, -D / 2 + 1.55]}>
        <boxGeometry args={[0.9, 0.08, 0.6]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.5} />
      </mesh>

      {/* Demo bench */}
      <mesh position={[-2, 0.5, -D / 2 + 2.5]} castShadow>
        <boxGeometry args={[2, 1, 0.6]} />
        <meshStandardMaterial color="#8a8a8a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Beakers on demo bench */}
      <mesh position={[-2.4, 1.15, -D / 2 + 2.5]}>
        <cylinderGeometry args={[0.12, 0.1, 0.3, 12]} />
        <meshStandardMaterial color="#a0d8e0" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      <mesh position={[-1.7, 1.2, -D / 2 + 2.5]}>
        <cylinderGeometry args={[0.15, 0.12, 0.4, 12]} />
        <meshStandardMaterial color="#e0a0c0" transparent opacity={0.6} roughness={0.1} />
      </mesh>

      {/* Dual projection screen */}
      <mesh position={[0, 4.5, -D / 2 + 0.2]}>
        <boxGeometry args={[5, 2.5, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" emissive="#1a2030" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 4.5, -D / 2 + 1]} intensity={0.4} color="#a0b0d0" distance={6} />

      {/* Tiered seating */}
      {Array.from({ length: rows }).map((_, r) => {
        const z = -D / 2 + 5 + r * 2.2;
        const y = r * 0.45;
        return (
          <group key={r} position={[0, y, z]}>
            {/* platform */}
            <mesh position={[0, -0.05, 0]} receiveShadow castShadow>
              <boxGeometry args={[W - 1, 0.1, 1.8]} />
              <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
            </mesh>
            {/* seats */}
            {Array.from({ length: seatsPerRow }).map((_, c) => {
              const x = -W / 2 + 1.5 + c * (W - 3) / (seatsPerRow - 1);
              return <Chair key={c} position={[x, 0, 0.4]} />;
            })}
          </group>
        );
      })}

      {/* Aisle carpet runner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]}>
        <planeGeometry args={[1.2, D - 4]} />
        <meshStandardMaterial color="#6a3a3a" roughness={0.9} />
      </mesh>

      {/* Pendant lamps */}
      <PendantLamp position={[0, H - 0.6, -2]} isNight={isNight} />
      <PendantLamp position={[-4, H - 0.6, 2]} isNight={isNight} />
      <PendantLamp position={[4, H - 0.6, 2]} isNight={isNight} />

      {/* Paintings */}
      <Painting position={[-W / 2 + 0.2, 3.5, 0]} rotation={Math.PI / 2} color="#5a7a8c" />
      <Painting position={[W / 2 - 0.2, 3.5, 0]} rotation={-Math.PI / 2} color="#8b5a3a" />

      {/* Wall acoustic panels (decorative slats) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-W / 2 + 0.25, 3, -D / 2 + 3 + i * 2]}>
          <boxGeometry args={[0.06, 3, 1.4]} />
          <meshStandardMaterial color="#c8b8a0" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
