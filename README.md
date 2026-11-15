# Mercer University — Interactive 3D Campus

An interactive, browser-based 3D model of a university campus. Orbit, zoom, and
pan across the grounds, click any building to fly to it, and step inside four
fully modeled interiors — a library, a tiered lecture hall, a science lab, and a
cafeteria — each with detailed furniture, warm lighting, and its own atmosphere.

Built with **React**, **Three.js**, and **@react-three/fiber**.

---

## Features

### Exploration
- **Free orbit camera** — drag to rotate, scroll/pinch to zoom, two-finger drag
  (or right-drag) to pan. Smooth, inertial controls powered by `OrbitControls`.
- **Click-to-select buildings** — clicking a building highlights it, lifts its
  windows to a warm glow, shows a selection ring, and flies the camera to an
  ideal viewing angle.
- **Enter buildings** — four buildings have explorable interiors. Click
  *Enter Building* in the info panel to transition inside, where you can orbit
  and zoom freely around the furnished room.
- **Camera fly-to** — every selection triggers a smooth eased camera flight
  (≈1.6 s) to the target, with seamless handoff back to user controls.

### Interiors
| Building | Highlights |
|---|---|
| **Hamilton Library** | Floor-to-ceiling bookshelves with individually colored books, a central reading table with green reading lamps, study carrels, a globe, and pendant lighting. |
| **Kepler Lecture Hall** | 5-tier raked seating for 40, presenter podium, demo bench with beakers, a backlit projection screen, acoustic wall slats, and a red aisle runner. |
| **Curie Science Laboratories** | Central lab island with stools, three glass-fronted fume hoods, microscopes and Erlenmeyer flasks, a computer bay, skylight strips, and a periodic-table poster. |
| **The Commons Cafeteria** | Six 4-seat dining tables, a serving counter with steam trays, an espresso bar, corner plants, pendant lamps, and a backlit menu board. |

### UI & UX
- **Info panel** — a glassmorphic panel slides in when a building is selected,
  showing its name, description, and quick facts, with Enter / Exit controls.
- **Mini-map** — a live top-down canvas map in the bottom-left shows every
  building, paths, the plaza, the camera's real-time position, and clickable
  buildings for quick navigation.
- **Day / Night toggle** — switch between a bright daytime sky with a sun disc
  and long shadows, and a starry night with a moon, dimmed ambient light, and
  glowing street lamps. Interiors' lamp emissive intensities also respond.
- **Quick-select sidebar** (desktop) — a vertical list of all buildings for
  fast jumping.
- **Responsive** — the layout, touch handling, and control hints adapt to
  mobile and desktop. The canvas uses `touch-none` for clean pinch-zoom.

### Rendering
- ACES filmic tone mapping for cinematic color.
- Soft contact shadows under the campus.
- Real-time shadow casting from the sun/moon directional light.
- Distance fog that matches the time of day.
- 600 procedural stars at night.

---

## Tech Stack

| Library | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [Three.js](https://threejs.org) | WebGL 3D engine |
| [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | React renderer for Three.js |
| [@react-three/drei](https://github.com/pmndrs/drei) | Helpers (OrbitControls, ContactShadows) |
| [Vite](https://vitejs.dev) | Dev server & bundler |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [lucide-react](https://lucide.dev) | Icons |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

The dev server starts on http://localhost:5173.

### Build for Production

```bash
npm run build      # type-checks and bundles to dist/
npm run preview    # serves the production build locally
```

### Type Checking

```bash
npm run typecheck
```

---

## Controls

| Action | Desktop | Mobile |
|---|---|---|
| Orbit / rotate | Left-drag | One-finger drag |
| Zoom | Scroll | Pinch |
| Pan | Right-drag or two-finger drag | Two-finger drag |
| Select building | Click | Tap |
| Enter / exit interior | Info panel button | Info panel button |
| Reset to overview | *Overview* button (top bar) | *Overview* button (top bar) |
| Toggle day / night | *Sun/Moon* button (top bar) | *Sun/Moon* button (top bar) |

---

## Project Structure

```
src/
├── App.tsx                      # Root: state, camera transitions, layout
├── index.css                    # Tailwind + keyframe animations
├── campus/
│   ├── types.ts                 # Shared TypeScript types
│   ├── buildings.ts             # Building definitions (position, size, info)
│   ├── buildings-camera.ts      # (inline in App) camera target helpers
│   ├── CampusScene.tsx          # Ground, paths, plaza, trees, lamps, buildings
│   ├── Environment.tsx          # Sky, fog, sun/moon, stars, lights
│   ├── CameraRig.tsx            # Eased fly-to camera animation
│   ├── MiniMap.tsx              # Canvas top-down map
│   └── UI.tsx                   # InfoPanel, TopBar, BottomHint
│   └── interiors/
│       ├── index.tsx            # Interior router
│       ├── Furniture.tsx        # Reusable room shell, shelves, chairs, lamps
│       ├── LibraryInterior.tsx
│       ├── LectureHallInterior.tsx
│       ├── ScienceLabInterior.tsx
│       └── CafeteriaInterior.tsx
```

---

## How It Works

### Camera transitions
`CameraRig` watches a `CameraTarget` (position + look-at). When it changes, it
captures the current camera pose, disables `OrbitControls`, and animates the
camera along an eased path over ~1.6 seconds, syncing the controls' target each
frame so the handoff back to user input is seamless.

### Building selection
Clicking a building mesh calls `onSelect(id)`, which sets the selected building
and triggers a fly-to. The selected building's material switches to its accent
color with an emissive glow, windows brighten, and a ground ring appears.

### Interior mode
When the user clicks *Enter Building*, `mode` switches to `"interior"`. The
campus scene is unmounted and the interior component is mounted at the
building's world position. A dedicated interior camera target is set, and
`OrbitControls` is reconfigured with tighter pan/polar limits for room-scale
viewing.

### Mini-map
A 2D canvas drawn each frame from the building data, with the live camera
position projected onto the map. Clicking a building on the map selects it in 3D.

---

## License

This is a demonstration project. Free to use for learning and portfolios.
