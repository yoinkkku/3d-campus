export type TimeOfDay = "day" | "golden" | "night";

export type CameraMode = "orbit" | "walk" | "drone";

export type QualityLevel = "low" | "medium" | "high";

export type BuildingStyle =
  | "brick-collegiate"
  | "modern-glass"
  | "concrete-brutalist"
  | "stone-classical"
  | "timber-pavilion"
  | "metal-clad"
  | "mixed-contemporary";

export interface Department {
  name: string;
  head: string;
}

export interface FloorInfo {
  label: string;
  level: number;
}

export interface HotspotInfo {
  id: string;
  label: string;
  description: string;
  position: [number, number, number];
}

export interface BuildingInfo {
  id: string;
  name: string;
  shortName: string;
  code: string;
  purpose: string;
  style: BuildingStyle;
  description: string;
  departments: Department[];
  hours: { days: string; time: string }[];
  facts: string[];
  position: [number, number, number];
  footprint: [number, number]; // width, depth
  height: number;
  floors: number;
  rotation: number;
  hasInterior: boolean;
  interiorId?: string;
  interiorFloors?: FloorInfo[];
  hotspots?: HotspotInfo[];
  icon: string;
  accentColor: string;
}

export interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface IntroState {
  active: boolean;
  progress: number;
}
