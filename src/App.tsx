import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { CampusScene } from "./campus/CampusScene";
import { Environment } from "./campus/Environment";
import { CameraRig } from "./campus/CameraRig";
import { Interior } from "./campus/interiors";
import { MiniMap } from "./campus/MiniMap";
import { InfoPanel, TopBar, BottomHint } from "./campus/UI";
import { BUILDINGS, getBuildingById } from "./campus/buildings";
import type { CameraTarget, Mode } from "./campus/types";

const OVERVIEW_TARGET: CameraTarget = {
  position: [0, 45, 55],
  lookAt: [0, 0, 0],
};

function interiorCameraTarget(buildingId: string): CameraTarget {
  const b = getBuildingById(buildingId);
  if (!b) return OVERVIEW_TARGET;
  // position camera inside, slightly above, looking toward back of room
  return {
    position: [b.position[0], b.position[1] + 4, b.position[2] + 8],
    lookAt: [b.position[0], b.position[1] + 2, b.position[2] - 4],
  };
}

function buildingCameraTarget(buildingId: string): CameraTarget {
  const b = getBuildingById(buildingId);
  if (!b) return OVERVIEW_TARGET;
  const [bx, , bz] = b.position;
  const dist = Math.max(b.size[0], b.size[2]) + 10;
  return {
    position: [bx + dist * 0.6, b.size[1] + 12, bz + dist * 0.8],
    lookAt: [bx, b.size[1] / 2, bz],
  };
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [mode, setMode] = useState<Mode>("overview");
  const [cameraTarget, setCameraTarget] = useState<CameraTarget>(OVERVIEW_TARGET);
  const [cameraPos, setCameraPos] = useState({ x: 0, z: 55 });

  const controlsRef = useRef<{ target: THREE.Vector3; enabled: boolean; update: () => void } | null>(null);

  const selectedBuilding = selectedId ? getBuildingById(selectedId) ?? null : null;

  // Track camera position for minimap (polled via rAF outside Canvas)
  const cameraTracker = useRef<THREE.Camera | null>(null);

  const handleSelect = useCallback((id: string) => {
    const b = getBuildingById(id);
    if (!b) return;
    setSelectedId(id);
    if (mode === "interior") {
      // already inside — just update selection
      return;
    }
    setCameraTarget(buildingCameraTarget(id));
  }, [mode]);

  const handleClear = useCallback(() => {
    if (mode === "interior") return; // don't deselect while inside
    setSelectedId(null);
  }, [mode]);

  const handleEnter = useCallback(() => {
    if (!selectedId) return;
    setMode("interior");
    setCameraTarget(interiorCameraTarget(selectedId));
  }, [selectedId]);

  const handleExit = useCallback(() => {
    setMode("overview");
    if (selectedId) {
      setCameraTarget(buildingCameraTarget(selectedId));
    } else {
      setCameraTarget(OVERVIEW_TARGET);
    }
  }, [selectedId]);

  const handleReset = useCallback(() => {
    setMode("overview");
    setSelectedId(null);
    setCameraTarget(OVERVIEW_TARGET);
  }, []);

  const handleToggleDayNight = useCallback(() => setIsNight((n) => !n), []);

  // poll camera position for minimap
  useEffect(() => {
    let raf: number;
    const tick = () => {
      if (cameraTracker.current) {
        setCameraPos({
          x: cameraTracker.current.position.x,
          z: cameraTracker.current.position.z,
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const interiorId = useMemo(() => {
    if (mode !== "interior" || !selectedBuilding?.hasInterior) return null;
    return selectedBuilding.interiorId ?? null;
  }, [mode, selectedBuilding]);

  const interiorPos = useMemo<[number, number, number]>(() => {
    if (!selectedBuilding) return [0, 0, 0];
    return [selectedBuilding.position[0], 0, selectedBuilding.position[2]];
  }, [selectedBuilding]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 45, 55], fov: 50, near: 0.1, far: 500 }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        onCreated={({ camera }) => {
          cameraTracker.current = camera;
        }}
        className="touch-none"
      >
        <Suspense fallback={null}>
          {mode === "overview" ? (
            <>
              <Environment isNight={isNight} />
              <CampusScene
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelect={handleSelect}
                onHover={setHoveredId}
                onClear={handleClear}
              />
              <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.35}
                scale={100}
                blur={1.5}
                far={20}
              />
              <OrbitControls
                ref={controlsRef as never}
                makeDefault
                enablePan
                panSpeed={0.8}
                minDistance={8}
                maxDistance={90}
                maxPolarAngle={Math.PI / 2.1}
                target={[0, 0, 0]}
              />
            </>
          ) : (
            <>
              {/* Interior mode — own environment */}
              <color attach="background" args={[isNight ? "#0a0e1a" : "#1a2030"]} />
              <ambientLight intensity={isNight ? 0.2 : 0.4} />
              {interiorId && (
                <group position={interiorPos}>
                  <Interior id={interiorId} isNight={isNight} />
                </group>
              )}
              <OrbitControls
                makeDefault
                enablePan={false}
                minDistance={3}
                maxDistance={20}
                maxPolarAngle={Math.PI / 1.8}
                minPolarAngle={Math.PI / 4}
                target={
                  selectedBuilding
                    ? [selectedBuilding.position[0], 2, selectedBuilding.position[2]]
                    : [0, 2, 0]
                }
              />
            </>
          )}
          <CameraRig target={cameraTarget} />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      <TopBar
        isNight={isNight}
        onToggleDayNight={handleToggleDayNight}
        onResetView={handleReset}
      />

      {selectedBuilding && (
        <InfoPanel
          building={selectedBuilding}
          mode={mode}
          onClose={() => setSelectedId(null)}
          onEnter={handleEnter}
          onExit={handleExit}
        />
      )}

      {/* Mini-map — hidden in interior mode */}
      {mode === "overview" && (
        <div className="absolute bottom-4 left-4 z-10 sm:bottom-6 sm:left-6">
          <MiniMap
            selectedId={selectedId}
            onSelect={handleSelect}
            cameraPos={cameraPos}
            isNight={isNight}
          />
        </div>
      )}

      {/* Building quick-select bar (mobile-friendly horizontal scroll) */}
      {mode === "overview" && (
        <div className="pointer-events-none absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10 hidden md:block">
          <BuildingQuickSelect selectedId={selectedId} onSelect={handleSelect} />
        </div>
      )}

      <BottomHint mode={mode} />
    </div>
  );
}

function BuildingQuickSelect({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="pointer-events-auto flex flex-col gap-1.5 rounded-2xl p-2 bg-black/30 backdrop-blur-md border border-white/15 shadow-xl max-h-[260px] overflow-y-auto">
      {BUILDINGS.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-left transition-all whitespace-nowrap ${
            selectedId === b.id
              ? "bg-white/20 text-white"
              : "text-white/60 hover:bg-white/10 hover:text-white/90"
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: b.accent }}
          />
          {b.shortName}
          {b.hasInterior && (
            <span className="ml-auto text-[9px] uppercase tracking-wider text-amber-300/70">Tour</span>
          )}
        </button>
      ))}
    </div>
  );
}
