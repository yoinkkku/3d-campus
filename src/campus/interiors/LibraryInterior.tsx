import { RoomShell, Bookshelf, Table, Chair, PendantLamp, Painting } from "./Furniture";

export function LibraryInterior({ isNight }: { isNight: boolean }) {
  const W = 16, D = 12, H = 6;

  return (
    <group>
      <RoomShell width={W} depth={D} height={H} floorColor="#6b4a32" wallColor="#e8dcc8" isNight={isNight} />

      {/* Central reading area */}
      <Table position={[0, 0, 0]} size={[3, 0.75, 1.6]} />
      {[
        [-1, 0, 1.2, 0], [1, 0, 1.2, 0], [-1, 0, -1.2, Math.PI], [1, 0, -1.2, Math.PI],
      ].map(([x, y, z, r], i) => (
        <Chair key={i} position={[x as number, y as number, z as number]} rotation={r as number} />
      ))}

      {/* Green reading lamps on the central table */}
      <mesh position={[-0.8, 0.78, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-0.8, 0.95, 0]}>
        <coneGeometry args={[0.15, 0.2, 12, 1, true]} />
        <meshStandardMaterial color="#2a6a4a" emissive="#1a4a3a" emissiveIntensity={0.3} side={2} />
      </mesh>
      <pointLight position={[-0.8, 0.9, 0]} intensity={0.4} color="#c8f0c0" distance={3} />

      {/* Bookshelves along the back wall */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Bookshelf key={i} position={[-W / 2 + 1.8 + i * 3, 0, -D / 2 + 0.6]} height={4.5} width={2.6} />
      ))}
      {/* Bookshelves along left wall */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Bookshelf key={`l${i}`} position={[-W / 2 + 0.6, 0, -3 + i * 3]} rotation={Math.PI / 2} height={4.5} width={2.6} />
      ))}

      {/* Pendant lamps */}
      <PendantLamp position={[0, H - 0.6, 0]} isNight={isNight} />
      <PendantLamp position={[-4, H - 0.6, 2]} isNight={isNight} />
      <PendantLamp position={[4, H - 0.6, 2]} isNight={isNight} />

      {/* Paintings on right wall */}
      <Painting position={[W / 2 - 0.2, 3, -2]} rotation={-Math.PI / 2} color="#8b5a3a" />
      <Painting position={[W / 2 - 0.2, 3, 2]} rotation={-Math.PI / 2} color="#4a6fa5" />

      {/* Globe on a stand */}
      <group position={[5.5, 0, 4]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.4, 24, 24]} />
          <meshStandardMaterial color="#3a7a5a" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.1, 16]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.6} />
        </mesh>
      </group>

      {/* Study carrels (desks) along the right side */}
      {Array.from({ length: 3 }).map((_, i) => (
        <group key={`c${i}`} position={[4, 0, -4 + i * 3]}>
          <Table position={[0, 0, 0]} size={[1, 0.72, 0.6]} />
          <Chair position={[0, 0, 0.6]} rotation={Math.PI} />
        </group>
      ))}

      {/* Archway detail at the top of shelves */}
      <mesh position={[0, H - 0.3, -D / 2 + 0.6]}>
        <boxGeometry args={[W - 1, 0.4, 0.5]} />
        <meshStandardMaterial color="#4a3322" roughness={0.7} />
      </mesh>
    </group>
  );
}
