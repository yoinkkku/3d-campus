import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Sky, Stars, SoftShadows, AccumulativeShadows, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, SMAA, BrightnessContrast, HueSaturation, Vignette } from "@react-three/postprocessing";
import type { TimeOfDay, QualityLevel } from "./types";

interface EnvironmentProps {
  timeOfDay: TimeOfDay;
  quality: QualityLevel;
}

const TIME_CONFIG = {
  day: {
    sunPos: [40, 60, 30] as [number, number, number],
    sunIntensity: 2.2,
    sunColor: "#fff4e0",
    ambientIntensity: 0.6,
    ambientColor: "#ffffff",
    hemiIntensity: 0.5,
    skySunPos: [40, 60, 30] as [number, number, number],
    turbidity: 8,
    rayleigh: 1.2,
    fogColor: "#c8dae8",
    fogNear: 60,
    fogFar: 180,
    exposure: 1.1,
    bloom: 0.4,
    saturation: 0,
    contrast: 0,
    vignette: 0.3,
  },
  golden: {
    sunPos: [25, 15, 20] as [number, number, number],
    sunIntensity: 2.0,
    sunColor: "#ffa860",
    ambientIntensity: 0.35,
    ambientColor: "#ffcc88",
    hemiIntensity: 0.4,
    skySunPos: [25, 8, 20] as [number, number, number],
    turbidity: 12,
    rayleigh: 3,
    fogColor: "#e8b888",
    fogNear: 40,
    fogFar: 150,
    exposure: 1.2,
    bloom: 0.7,
    saturation: 0.1,
    contrast: 0.05,
    vignette: 0.4,
  },
  night: {
    sunPos: [-30, 40, -20] as [number, number, number],
    sunIntensity: 0.25,
    sunColor: "#9ab4e8",
    ambientIntensity: 0.12,
    ambientColor: "#3a4a6a",
    hemiIntensity: 0.15,
    skySunPos: [-30, 40, -20] as [number, number, number],
    turbidity: 0.5,
    rayleigh: 0.5,
    fogColor: "#0a0e1a",
    fogNear: 35,
    fogFar: 100,
    exposure: 0.9,
    bloom: 1.2,
    saturation: -0.1,
    contrast: 0.1,
    vignette: 0.5,
  },
};

export function Environment({ timeOfDay, quality }: EnvironmentProps) {
  const cfg = TIME_CONFIG[timeOfDay];
  const { scene, gl } = useThree();

  // fog + exposure
  useEffect(() => {
    scene.fog = new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar);
    gl.toneMappingExposure = cfg.exposure;
  }, [scene, gl, cfg.fogColor, cfg.fogNear, cfg.fogFar, cfg.exposure]);

  const sunPos = useMemo(() => new THREE.Vector3(...cfg.sunPos), [cfg.sunPos]);

  const enableSoftShadows = quality === "high";
  const enablePostFX = quality !== "low";
  const shadowMapSize = quality === "high" ? 2048 : quality === "medium" ? 1024 : 512;

  return (
    <>
      {/* Sky */}
      {timeOfDay === "night" ? (
        <Stars radius={200} depth={80} count={quality === "high" ? 3000 : 1000} factor={4} fade speed={0.5} />
      ) : (
        <Sky
          distance={450000}
          sunPosition={cfg.skySunPos}
          turbidity={cfg.turbidity}
          rayleigh={cfg.rayleigh}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}

      {/* Background color (for night) */}
      {timeOfDay === "night" && <color attach="background" args={["#0a0e1a"]} />}

      {/* Lights */}
      <ambientLight intensity={cfg.ambientIntensity} color={cfg.ambientColor} />
      <hemisphereLight args={[cfg.ambientColor, "#4a6b3a", cfg.hemiIntensity]} />

      {/* Main directional light (sun/moon) */}
      <directionalLight
        position={cfg.sunPos}
        intensity={cfg.sunIntensity}
        color={cfg.sunColor}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />

      {/* Sun disc */}
      {timeOfDay !== "night" && (
        <mesh position={sunPos.clone().normalize().multiplyScalar(150)}>
          <sphereGeometry args={[3, 16, 16]} />
          <meshBasicMaterial color={timeOfDay === "golden" ? "#ffb060" : "#fff8d0"} />
        </mesh>
      )}

      {/* Moon disc */}
      {timeOfDay === "night" && (
        <mesh position={sunPos.clone().normalize().multiplyScalar(150)}>
          <sphereGeometry args={[2.5, 16, 16]} />
          <meshBasicMaterial color="#e8e8f0" />
        </mesh>
      )}

      {/* Soft shadows (high quality only) */}
      {enableSoftShadows && <SoftShadows size={20} samples={16} focus={0.8} />}

      {/* Contact shadows for extra grounding */}
      {quality !== "low" && (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.3}
          scale={140}
          blur={2}
          far={25}
          resolution={quality === "high" ? 1024 : 512}
        />
      )}

      {/* Post-processing */}
      {enablePostFX && (
        <EffectComposer multisampling={quality === "high" ? 4 : 0} disableNormalPass>
          <Bloom
            intensity={cfg.bloom}
            luminanceThreshold={timeOfDay === "night" ? 0.15 : 0.6}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
          <HueSaturation saturation={cfg.saturation} />
          <BrightnessContrast brightness={0} contrast={cfg.contrast} />
          <Vignette eskil={false} offset={0.2} darkness={cfg.vignette} />
          {quality === "high" && <SMAA />}
        </EffectComposer>
      )}
    </>
  );
}

/* ---- Interior environment ---- */
export function InteriorEnvironment({ isNight, quality }: { isNight: boolean; quality: QualityLevel }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog(isNight ? "#0a0e1a" : "#1a1f2a", 20, 60);
  }, [scene, isNight]);

  return (
    <>
      <color attach="background" args={[isNight ? "#0a0e1a" : "#1a2030"]} />
      <ambientLight intensity={isNight ? 0.25 : 0.45} color="#fff4e0" />
      {quality !== "low" && (
        <EffectComposer multisampling={quality === "high" ? 4 : 0} disableNormalPass>
          <Bloom intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.35} />
        </EffectComposer>
      )}
    </>
  );
}
