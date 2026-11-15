import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CameraTarget, CameraMode } from "./types";

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---- Fly-to camera rig ---- */
export function CameraRig({ target }: { target: CameraTarget }) {
  const { camera, controls } = useThree();
  const animating = useRef(false);
  const t = useRef(0);
  const start = useRef(new THREE.Vector3());
  const startLook = useRef(new THREE.Vector3());
  const endLook = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());

  const targetKey = `${target.position.join(",")}|${target.lookAt.join(",")}`;

  useEffect(() => {
    start.current.copy(camera.position);
    const ctrl = controls as unknown as { target?: THREE.Vector3; enabled?: boolean } | null;
    if (ctrl?.target) {
      startLook.current.copy(ctrl.target);
    } else {
      const dir = camera.getWorldDirection(new THREE.Vector3());
      startLook.current.copy(camera.position).add(dir.multiplyScalar(20));
    }
    endPos.current.set(...target.position);
    endLook.current.set(...target.lookAt);
    t.current = 0;
    animating.current = true;
    if (ctrl && "enabled" in ctrl) ctrl.enabled = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey]);

  useFrame((_, delta) => {
    if (!animating.current) return;
    t.current += delta / 1.8;
    const k = Math.min(t.current, 1);
    const e = easeInOutCubic(k);

    // curved path — arc slightly upward
    const mid = new THREE.Vector3().addVectors(start.current, endPos.current).multiplyScalar(0.5);
    mid.y += 5;
    const p0 = new THREE.Vector3().lerpVectors(start.current, mid, e);
    const p1 = new THREE.Vector3().lerpVectors(mid, endPos.current, e);
    camera.position.lerpVectors(p0, p1, e);

    const look = new THREE.Vector3().lerpVectors(startLook.current, endLook.current, e);
    camera.lookAt(look);

    const ctrl = controls as unknown as { target?: THREE.Vector3; update?: () => void; enabled?: boolean } | null;
    if (ctrl?.target) {
      ctrl.target.copy(look);
      ctrl.update?.();
    }

    if (k >= 1) {
      animating.current = false;
      if (ctrl && "enabled" in ctrl) ctrl.enabled = true;
    }
  });

  return null;
}

/* ---- Walk mode controller (WASD + mouse look) ---- */
interface WalkControllerProps {
  enabled: boolean;
  keys: React.MutableRefObject<Record<string, boolean>>;
  joystick: React.MutableRefObject<{ x: number; y: number }>;
}

export function WalkController({ enabled, keys, joystick }: WalkControllerProps) {
  const { camera, gl } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const isPointerLocked = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (isPointerLocked.current) {
        document.exitPointerLock?.();
        isPointerLocked.current = false;
      }
      return;
    }
    const canvas = gl.domElement;

    const onClick = () => {
      if (!isPointerLocked.current) {
        canvas.requestPointerLock?.();
      }
    };

    const onLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * 0.002;
      euler.current.x -= e.movementY * 0.002;
      euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    canvas.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      if (isPointerLocked.current) document.exitPointerLock?.();
    };
  }, [enabled, camera, gl]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const speed = 8 * delta;
    const dir = new THREE.Vector3();
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const k = keys.current;
    if (k["w"] || k["arrowup"]) dir.add(forward);
    if (k["s"] || k["arrowdown"]) dir.sub(forward);
    if (k["a"] || k["arrowleft"]) dir.sub(right);
    if (k["d"] || k["arrowright"]) dir.add(right);

    // joystick (mobile)
    if (joystick.current.y < -0.1) dir.add(forward);
    if (joystick.current.y > 0.1) dir.sub(forward);
    if (joystick.current.x < -0.1) dir.sub(right);
    if (joystick.current.x > 0.1) dir.add(right);

    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(speed);
      velocity.current.lerp(dir, 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.1);
    }

    camera.position.add(velocity.current);
    camera.position.y = 2.2; // eye height

    // disable orbit controls during walk
    const ctrl = useThree.getState().controls as unknown as { enabled?: boolean } | null;
    if (ctrl && "enabled" in ctrl) ctrl.enabled = false;
  });

  return null;
}

/* ---- Drone mode controller ---- */
interface DroneControllerProps {
  enabled: boolean;
  keys: React.MutableRefObject<Record<string, boolean>>;
  joystick: React.MutableRefObject<{ x: number; y: number }>;
}

export function DroneController({ enabled, keys, joystick }: DroneControllerProps) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!enabled) return;
    const speed = 20 * delta;
    const dir = new THREE.Vector3();
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const k = keys.current;
    if (k["w"] || k["arrowup"]) dir.add(forward);
    if (k["s"] || k["arrowdown"]) dir.sub(forward);
    if (k["a"] || k["arrowleft"]) dir.sub(right);
    if (k["d"] || k["arrowright"]) dir.add(right);
    if (k[" "]) dir.y += 1;
    if (k["shift"]) dir.y -= 1;

    if (joystick.current.y < -0.1) dir.add(forward);
    if (joystick.current.y > 0.1) dir.sub(forward);
    if (joystick.current.x < -0.1) dir.sub(right);
    if (joystick.current.x > 0.1) dir.add(right);

    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(speed);
      velocity.current.lerp(dir, 0.1);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.05);
    }

    camera.position.add(velocity.current);
    camera.position.y = Math.max(3, Math.min(80, camera.position.y));

    const ctrl = useThree.getState().controls as unknown as { enabled?: boolean } | null;
    if (ctrl && "enabled" in ctrl) ctrl.enabled = false;
  });

  return null;
}

/* ---- Intro cinematic fly-over ---- */
export function IntroCinematic({ active }: { active: boolean }) {
  const { camera } = useThree();
  const t = useRef(0);

  useEffect(() => {
    if (!active) t.current = 0;
  }, [active]);

  useFrame((_, delta) => {
    if (!active) return;
    t.current += delta * 0.08;
    const t = Math.min(t.current, 1);
    // circular fly-over
    const angle = t * Math.PI * 2;
    const radius = 70 - t * 10;
    const y = 50 - t * 15;
    camera.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius,
    );
    camera.lookAt(0, 5, 5);
  });

  return null;
}

/* ---- Camera mode config for OrbitControls ---- */
export function useControlProps(mode: CameraMode) {
  if (mode === "walk" || mode === "drone") return null;
  return {
    makeDefault: true,
    enablePan: true,
    panSpeed: 0.8,
    minDistance: 8,
    maxDistance: 100,
    maxPolarAngle: Math.PI / 2.05,
    target: [0, 5, 0] as [number, number, number],
  };
}
