import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { BuildingInfo } from "./types";
import {
  useBuildingMaterials, WindowGrid, EntranceDoor, EntranceSteps,
  Cornice, BuildingSign, OutlineBox, FloatingLabel,
} from "./BuildingComponents";

interface BuildingProps {
  building: BuildingInfo;
  selected: boolean;
  hovered: boolean;
  dimmed: boolean;
  isNight: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function Building({
  building, selected, hovered, dimmed, isNight, onSelect, onHover,
}: BuildingProps) {
  const mat = useBuildingMaterials(building.style);
  const { position, footprint, height, floors, rotation, accentColor, name, code } = building;
  const [w, d] = footprint;
  const groupRef = useRef<THREE.Group>(null);

  // Window lit pattern — deterministic per building
  const litPattern = useMemo(() => {
    const arr: boolean[] = [];
    for (let i = 0; i < 200; i++) {
      arr.push((i * 37 + building.id.charCodeAt(0) * 13 + building.id.charCodeAt(1) * 7) % 100 < 50);
    }
    return arr;
  }, [building.id]);

  const opacity = dimmed ? 0.35 : 1;
  const wallMat = mat.wall.clone();
  wallMat.transparent = true;
  wallMat.opacity = opacity;

  // gentle sway for hovered building (very subtle scale up)
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered && !selected ? 1.015 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, 1, targetScale), 0.1);
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
      onClick={(e) => { e.stopPropagation(); onSelect(building.id); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(building.id); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = "auto"; }}
    >
      {/* Main body walls */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow material={wallMat}>
        <boxGeometry args={[w, height, d]} />
      </mesh>

      {/* Roof slab */}
      <mesh position={[0, height + 0.2, 0]} castShadow>
        <boxGeometry args={[w + 0.6, 0.5, d + 0.6]} />
        <primitive object={mat.roof} attach="material" />
      </mesh>

      {/* Cornice / roof edge */}
      <Cornice width={w} depth={d} y={height - 0.1} material={mat.trim} overhang={0.5} />

      {/* Ground-floor base / plinth */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.3, 0.6, d + 0.3]} />
        <meshStandardMaterial color="#666666" roughness={0.8} />
      </mesh>

      {/* Windows on all 4 facades */}
      <WindowGrid wallWidth={w} wallHeight={height} floors={floors} glass={mat.glass}
        frameColor="#2a2a2a" zOffset={d / 2 + 0.06} isNight={isNight} litPattern={litPattern} />
      <WindowGrid wallWidth={w} wallHeight={height} floors={floors} glass={mat.glass}
        frameColor="#2a2a2a" zOffset={-d / 2 - 0.06} rotationY={Math.PI} isNight={isNight} litPattern={litPattern} />
      <WindowGrid wallWidth={d} wallHeight={height} floors={floors} glass={mat.glass}
        frameColor="#2a2a2a" zOffset={w / 2 + 0.06} rotationY={Math.PI / 2} isNight={isNight} litPattern={litPattern} />
      <WindowGrid wallWidth={d} wallHeight={height} floors={floors} glass={mat.glass}
        frameColor="#2a2a2a" zOffset={-w / 2 - 0.06} rotationY={-Math.PI / 2} isNight={isNight} litPattern={litPattern} />

      {/* Entrance door + steps on front face */}
      <EntranceDoor position={[0, 0.6, d / 2 + 0.1]} />
      <EntranceSteps position={[0, 0, d / 2 + 1.2]} width={Math.min(6, w * 0.4)} />

      {/* Style-specific features */}
      <StyleFeatures building={building} mat={mat} isNight={isNight} />

      {/* Signage */}
      <BuildingSign text={code} position={[0, 2.5, d / 2 + 0.15]} color={accentColor} />

      {/* Outline when hovered/selected */}
      {(hovered || selected) && (
        <OutlineBox width={w + 0.5} height={height + 1} depth={d + 0.5} color={accentColor} opacity={selected ? 0.7 : 0.4} />
      )}

      {/* Floating label when hovered */}
      {hovered && !selected && (
        <FloatingLabel text={name} position={[0, height + 2.5, 0]} accent={accentColor} />
      )}

      {/* Selection ground glow ring */}
      {selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) / 2 + 1, Math.max(w, d) / 2 + 1.5, 64]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ---- Style-specific architectural features ---- */
function StyleFeatures({
  building, mat, isNight,
}: {
  building: BuildingInfo; mat: ReturnType<typeof useBuildingMaterials>; isNight: boolean;
}) {
  const { style, footprint, height } = building;
  const [w, d] = footprint;

  switch (style) {
    case "stone-classical":
      return (
        <group>
          {/* Portico columns */}
          {Array.from({ length: 6 }).map((_, i) => (
            <group key={i}>
              <mesh position={[-w / 2 + 2 + i * ((w - 4) / 5), height / 2, d / 2 + 1.5]} castShadow>
                <cylinderGeometry args={[0.4, 0.45, height, 20]} />
                <meshStandardMaterial color="#e8e0d0" roughness={0.5} />
              </mesh>
              {/* capital */}
              <mesh position={[-w / 2 + 2 + i * ((w - 4) / 5), height - 0.3, d / 2 + 1.5]}>
                <boxGeometry args={[1, 0.6, 1]} />
                <meshStandardMaterial color="#e8e0d0" roughness={0.5} />
              </mesh>
              {/* base */}
              <mesh position={[-w / 2 + 2 + i * ((w - 4) / 5), 0.6, d / 2 + 1.5]}>
                <boxGeometry args={[0.9, 0.4, 0.9]} />
                <meshStandardMaterial color="#d0c8b8" roughness={0.5} />
              </mesh>
            </group>
          ))}
          {/* Pediment (triangular gable) */}
          <mesh position={[0, height + 1, d / 2 + 1.5]} castShadow>
            <cylinderGeometry args={[0.8, 0.8, w, 3, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#e8e0d0" roughness={0.5} />
          </mesh>
          {/* Dome */}
          <mesh position={[0, height + 2, 0]} castShadow>
            <sphereGeometry args={[w / 3.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#7a8a7a" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, height + 2 + w / 3.5, 0]}>
            <coneGeometry args={[0.15, 1.5, 8]} />
            <meshStandardMaterial color="#c8b070" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      );

    case "modern-glass":
      return (
        <group>
          {/* Curtain wall — full glass front on ground floor */}
          <mesh position={[0, 3, d / 2 + 0.08]}>
            <boxGeometry args={[w - 1, 5, 0.06]} />
            <primitive object={mat.glass} attach="material" />
          </mesh>
          {/* Horizontal floor band trims */}
          {Array.from({ length: building.floors }).map((_, f) => (
            <mesh key={f} position={[0, 2 + f * (height / building.floors), 0]} castShadow>
              <boxGeometry args={[w + 0.3, 0.25, d + 0.3]} />
              <primitive object={mat.trim} attach="material" />
            </mesh>
          ))}
          {/* Cantilevered top canopy */}
          <mesh position={[0, height + 0.8, d / 2 + 1.5]} castShadow>
            <boxGeometry args={[w + 2, 0.3, 3]} />
            <primitive object={mat.trim} attach="material" />
          </mesh>
          {/* Vertical fins */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[-w / 2 + 3 + i * ((w - 6) / 4), height / 2, d / 2 + 0.3]} castShadow>
              <boxGeometry args={[0.2, height - 1, 0.4]} />
              <primitive object={mat.trim} attach="material" />
            </mesh>
          ))}
        </group>
      );

    case "concrete-brutalist":
      return (
        <group>
          {/* Deep recessed window slots already handled by window grid. Add expressed beams */}
          {Array.from({ length: building.floors + 1 }).map((_, f) => (
            <mesh key={f} position={[0, f * (height / building.floors), 0]} castShadow>
              <boxGeometry args={[w + 0.6, 0.5, d + 0.6]} />
              <primitive object={mat.wall} attach="material" />
            </mesh>
          ))}
          {/* Heavy entrance canopy */}
          <mesh position={[0, 3.5, d / 2 + 1]} castShadow>
            <boxGeometry args={[5, 0.4, 2]} />
            <primitive object={mat.wall} attach="material" />
          </mesh>
          {/* Stair tower bump */}
          <mesh position={[w / 2 - 2, height / 2 + 1, d / 2 + 1]} castShadow>
            <boxGeometry args={[3, height + 2, 2]} />
            <primitive object={mat.wall} attach="material" />
          </mesh>
        </group>
      );

    case "brick-collegiate":
      return (
        <group>
          {/* Stone trim band between floors */}
          {Array.from({ length: building.floors }).map((_, f) => (
            <mesh key={f} position={[0, 1.2 + f * (height / building.floors), 0]} castShadow>
              <boxGeometry args={[w + 0.15, 0.2, d + 0.15]} />
              <primitive object={mat.trim} attach="material" />
            </mesh>
          ))}
          {/* Gabled roof ends */}
          <mesh position={[0, height + 1.2, d / 2 - 0.5]} castShadow rotation={[0, 0, 0]}>
            <cylinderGeometry args={[d / 2, d / 2, w, 3, 1, false, 0, Math.PI]} />
            <primitive object={mat.roof} attach="material" />
          </mesh>
          {/* Corner quoins (stone) */}
          {[
            [-w / 2, d / 2], [w / 2, d / 2], [-w / 2, -d / 2], [w / 2, -d / 2],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, height / 2, z]} castShadow>
              <boxGeometry args={[1, height, 1]} />
              <primitive object={mat.trim} attach="material" />
            </mesh>
          ))}
          {/* Chimneys */}
          {[-w / 4, w / 4].map((x, i) => (
            <mesh key={i} position={[x, height + 2, -d / 4]} castShadow>
              <boxGeometry args={[1.2, 2, 1.2]} />
              <primitive object={mat.trim} attach="material" />
            </mesh>
          ))}
        </group>
      );

    case "timber-pavilion":
      return (
        <group>
          {/* Sawtooth north-light roof */}
          {Array.from({ length: 5 }).map((_, i) => {
            const x = -w / 2 + 2 + i * ((w - 4) / 4);
            return (
              <group key={i} position={[x, height, 0]}>
                <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.4]} castShadow>
                  <boxGeometry args={[3, 0.15, d]} />
                  <primitive object={mat.roof} attach="material" />
                </mesh>
                <mesh position={[0.6, 1, 0]} castShadow>
                  <boxGeometry args={[0.15, 2, d]} />
                  <primitive object={mat.trim} attach="material" />
                </mesh>
              </group>
            );
          })}
          {/* Timber batten screens at corners */}
          {[
            [-w / 2 - 0.2, d / 2], [w / 2 + 0.2, d / 2],
          ].map(([x, z], i) => (
            <group key={i} position={[x, height / 2, z]}>
              {Array.from({ length: 5 }).map((_, b) => (
                <mesh key={b} position={[-1 + b * 0.2, 0, 0]}>
                  <boxGeometry args={[0.06, height - 1, 0.06]} />
                  <primitive object={mat.trim} attach="material" />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      );

    case "metal-clad":
      return (
        <group>
          {/* Barrel vault roof */}
          <mesh position={[0, height + 1, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[d / 2 + 0.5, d / 2 + 0.5, w, 24, 1, true, 0, Math.PI]} />
            <primitive object={mat.roof} attach="material" />
          </mesh>
          {/* Cladding ribs (vertical) */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[-w / 2 + 1 + i * ((w - 2) / 7), height / 2, d / 2 + 0.08]}>
              <boxGeometry args={[0.08, height - 0.5, 0.1]} />
              <primitive object={mat.trim} attach="material" />
            </mesh>
          ))}
        </group>
      );

    default:
      // mixed-contemporary
      return (
        <group>
          {/* Timber batten accent on one facade */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[-w / 2 - 0.15, height / 2, -d / 2 + 2 + i * ((d - 4) / 5)]} castShadow>
              <boxGeometry args={[0.1, height - 1, 0.1]} />
              <primitive object={mat.trim} attach="material" />
            </mesh>
          ))}
          {/* Cantilevered balcony */}
          <mesh position={[w / 2 + 1, height * 0.6, 0]} castShadow>
            <boxGeometry args={[2, 0.3, d - 2]} />
            <primitive object={mat.trim} attach="material" />
          </mesh>
          <mesh position={[w / 2 + 1, height * 0.6 - 0.8, 0]}>
            <boxGeometry args={[2, 1.2, 0.1]} />
            <meshStandardMaterial color="#a8c8d8" transparent opacity={0.35} roughness={0.05} />
          </mesh>
          {/* Flat roof parapet */}
          <mesh position={[0, height + 0.3, 0]}>
            <boxGeometry args={[w + 0.8, 0.6, d + 0.8]} />
            <primitive object={mat.wall} attach="material" />
          </mesh>
        </group>
      );
  }
}
