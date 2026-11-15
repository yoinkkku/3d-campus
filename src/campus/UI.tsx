import {
  BookOpen, Presentation, FlaskConical, Utensils, Landmark, Dumbbell,
  Sun, Moon, X, ArrowLeft, DoorOpen, Compass, type LucideIcon,
} from "lucide-react";
import type { BuildingInfo } from "./types";
import type { Mode } from "./types";

const ICONS: Record<string, LucideIcon> = {
  BookOpen, Presentation, FlaskConical, Utensils, Landmark, Dumbbell,
};

interface InfoPanelProps {
  building: BuildingInfo | null;
  mode: Mode;
  onClose: () => void;
  onEnter: () => void;
  onExit: () => void;
}

export function InfoPanel({ building, mode, onClose, onEnter, onExit }: InfoPanelProps) {
  if (!building) return null;
  const Icon = ICONS[building.icon] ?? Landmark;

  return (
    <div className="pointer-events-auto absolute right-4 top-20 sm:right-6 sm:top-24 w-[min(92vw,340px)] animate-[slideIn_0.3s_ease-out]">
      <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl backdrop-blur-xl bg-white/10">
        {/* Header band */}
        <div
          className="relative h-20 flex items-end px-5 pb-3"
          style={{ background: `linear-gradient(135deg, ${building.color}, ${building.accent})` }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg leading-tight drop-shadow">{building.name}</h2>
              <p className="text-white/80 text-xs uppercase tracking-wider">{building.shortName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-white/85 text-sm leading-relaxed">{building.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {building.facts.map((f) => (
              <div
                key={f}
                className="rounded-lg bg-white/10 px-3 py-2 text-white/80 text-xs border border-white/10"
              >
                {f}
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            {mode === "overview" ? (
              building.hasInterior ? (
                <button
                  onClick={onEnter}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-sm text-white bg-white/20 hover:bg-white/30 border border-white/20 transition-all"
                >
                  <DoorOpen className="w-4 h-4" />
                  Enter Building
                </button>
              ) : (
                <div className="flex-1 text-center rounded-xl px-4 py-2.5 text-sm text-white/50 bg-white/5 border border-white/10">
                  Interior tour not available
                </div>
              )
            ) : (
              <button
                onClick={onExit}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-sm text-white bg-white/20 hover:bg-white/30 border border-white/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit to Campus
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TopBarProps {
  isNight: boolean;
  onToggleDayNight: () => void;
  onResetView: () => void;
}

export function TopBar({ isNight, onToggleDayNight, onResetView }: TopBarProps) {
  return (
    <div className="pointer-events-none absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-2 bg-black/30 backdrop-blur-md border border-white/15 shadow-xl">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
          <Landmark className="w-4 h-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-white font-semibold text-sm">Mercer University</div>
          <div className="text-white/50 text-[10px] uppercase tracking-wider">Interactive 3D Campus</div>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={onResetView}
          className="flex items-center gap-2 rounded-xl px-3 py-2 bg-black/30 backdrop-blur-md border border-white/15 shadow-xl text-white/80 hover:bg-black/50 transition-all text-sm"
          aria-label="Reset view"
        >
          <Compass className="w-4 h-4" />
          <span className="hidden sm:inline">Overview</span>
        </button>
        <button
          onClick={onToggleDayNight}
          className="flex items-center gap-2 rounded-xl px-3 py-2 bg-black/30 backdrop-blur-md border border-white/15 shadow-xl text-white/80 hover:bg-black/50 transition-all text-sm"
          aria-label="Toggle day/night"
        >
          {isNight ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-200" />}
          <span className="hidden sm:inline">{isNight ? "Day" : "Night"}</span>
        </button>
      </div>
    </div>
  );
}

export function BottomHint({ mode }: { mode: Mode }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="rounded-full px-4 py-1.5 bg-black/30 backdrop-blur-md border border-white/15 text-white/60 text-xs text-center shadow-xl">
        {mode === "overview"
          ? "Drag to orbit · Scroll / pinch to zoom · Click a building to select"
          : "Drag to look around · Scroll / pinch to zoom inside"}
      </div>
    </div>
  );
}
