import { useEffect, useRef } from "react";
import { BUILDINGS } from "./buildings";
import type { BuildingInfo } from "./types";

interface MiniMapProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  cameraPos: { x: number; z: number };
  isNight: boolean;
}

const MAP_SIZE = 160;

export function MiniMap({ selectedId, onSelect, cameraPos, isNight }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const scale = size / MAP_SIZE;

    // Background
    ctx.fillStyle = isNight ? "#1a2030" : "#3a5a2a";
    ctx.fillRect(0, 0, size, size);

    // Central plaza
    const cx = size / 2;
    const cz = size / 2;
    ctx.fillStyle = isNight ? "#3a4050" : "#7a7068";
    ctx.beginPath();
    ctx.arc(cx + 0 * scale, cz + 6 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Paths
    ctx.strokeStyle = isNight ? "#2a3040" : "#6b6258";
    ctx.lineWidth = 3.5 * scale;
    const center = { x: 0, z: 6 };
    BUILDINGS.forEach((b) => {
      ctx.beginPath();
      ctx.moveTo(cx + center.x * scale, cz + center.z * scale);
      ctx.lineTo(cx + b.position[0] * scale, cz + b.position[2] * scale);
      ctx.stroke();
    });

    // Buildings
    BUILDINGS.forEach((b: BuildingInfo) => {
      const x = cx + b.position[0] * scale;
      const z = cz + b.position[2] * scale;
      const w = b.size[0] * scale;
      const h = b.size[2] * scale;
      ctx.fillStyle = selectedId === b.id ? b.accent : b.color;
      ctx.fillRect(x - w / 2, z - h / 2, w, h);
      if (selectedId === b.id) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - w / 2, z - h / 2, w, h);
      }
      // label dot for enterable buildings
      if (b.hasInterior) {
        ctx.fillStyle = "#ffd27a";
        ctx.beginPath();
        ctx.arc(x, z, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Camera position indicator
    ctx.fillStyle = "#ff4a4a";
    ctx.beginPath();
    ctx.arc(cx + cameraPos.x * scale, cz + cameraPos.z * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [selectedId, cameraPos, isNight]);

  return (
    <div className="pointer-events-auto rounded-xl overflow-hidden border border-white/15 shadow-2xl backdrop-blur-md bg-black/30">
      <canvas
        ref={canvasRef}
        width={150}
        height={150}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const pz = e.clientY - rect.top;
          const scale = 150 / MAP_SIZE;
          const worldX = (px - 75) / scale;
          const worldZ = (pz - 75) / scale;
          // find nearest building
          let nearest: BuildingInfo | null = null;
          let minD = Infinity;
          for (const b of BUILDINGS) {
            const d = Math.hypot(b.position[0] - worldX, b.position[2] - worldZ);
            if (d < minD) {
              minD = d;
              nearest = b;
            }
          }
          if (nearest && minD < 15) onSelect(nearest.id);
        }}
        className="block cursor-pointer"
        style={{ width: 150, height: 150 }}
      />
      <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-white/60 text-center">
        Campus Map
      </div>
    </div>
  );
}
