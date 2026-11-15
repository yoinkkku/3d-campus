import * as THREE from "three";

/**
 * Procedural PBR textures generated on canvas.
 * Each function returns { map, normalMap, roughnessMap, aoMap }.
 * Since we can't load external image files, we paint convincing
 * surface details onto canvas and convert to THREE textures.
 */

function makeCanvas(size = 512): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  return [c, ctx];
}

function toTexture(canvas: HTMLCanvasElement, repeat = 1): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function noiseFill(ctx: CanvasRenderingContext2D, size: number, base: string, variation: number) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * variation;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

/* ---- Brick ---- */
export function brickTextures(repeat = 2) {
  const size = 512;
  // Color map
  const [colorC, colorCtx] = makeCanvas(size);
  noiseFill(colorCtx, size, "#8b4a3a", 25);
  const brickW = 96;
  const brickH = 36;
  const mortar = 4;
  for (let y = 0; y < size; y += brickH + mortar) {
    const offset = (Math.floor(y / (brickH + mortar)) % 2) * (brickW / 2);
    for (let x = -brickW; x < size; x += brickW + mortar) {
      const bx = x + offset;
      const r = 120 + Math.floor(Math.random() * 40);
      const g = 60 + Math.floor(Math.random() * 25);
      const b = 45 + Math.floor(Math.random() * 20);
      colorCtx.fillStyle = `rgb(${r},${g},${b})`;
      colorCtx.fillRect(bx, y, brickW, brickH);
      // subtle brick texture noise
      colorCtx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
      colorCtx.fillRect(bx, y, brickW, brickH);
    }
  }
  // mortar lines
  colorCtx.strokeStyle = "#d8cfc0";
  colorCtx.lineWidth = mortar;
  for (let y = 0; y < size; y += brickH + mortar) {
    colorCtx.beginPath();
    colorCtx.moveTo(0, y);
    colorCtx.lineTo(size, y);
    colorCtx.stroke();
    const offset = (Math.floor(y / (brickH + mortar)) % 2) * (brickW / 2);
    for (let x = -brickW; x < size; x += brickW + mortar) {
      const bx = x + offset;
      colorCtx.beginPath();
      colorCtx.moveTo(bx + brickW, y);
      colorCtx.lineTo(bx + brickW, y + brickH);
      colorCtx.stroke();
    }
  }

  // Normal map (brick relief)
  const [normalC, normalCtx] = makeCanvas(size);
  normalCtx.fillStyle = "#8080ff";
  normalCtx.fillRect(0, 0, size, size);
  normalCtx.strokeStyle = "#4040c0";
  normalCtx.lineWidth = mortar * 2;
  for (let y = 0; y < size; y += brickH + mortar) {
    normalCtx.beginPath();
    normalCtx.moveTo(0, y);
    normalCtx.lineTo(size, y);
    normalCtx.stroke();
    const offset = (Math.floor(y / (brickH + mortar)) % 2) * (brickW / 2);
    for (let x = -brickW; x < size; x += brickW + mortar) {
      const bx = x + offset;
      normalCtx.beginPath();
      normalCtx.moveTo(bx + brickW, y);
      normalCtx.lineTo(bx + brickW, y + brickH);
      normalCtx.stroke();
    }
  }

  // Roughness map
  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#888888", 30);
  // mortar is rougher
  roughCtx.strokeStyle = "#bbbbbb";
  roughCtx.lineWidth = mortar;
  for (let y = 0; y < size; y += brickH + mortar) {
    roughCtx.beginPath();
    roughCtx.moveTo(0, y);
    roughCtx.lineTo(size, y);
    roughCtx.stroke();
  }

  return {
    map: toTexture(colorC, repeat),
    normalMap: toTexture(normalC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 0.85,
  };
}

/* ---- Concrete ---- */
export function concreteTextures(repeat = 2) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  noiseFill(colorCtx, size, "#a8a8a8", 18);
  // formwork lines
  colorCtx.strokeStyle = "rgba(120,120,120,0.5)";
  colorCtx.lineWidth = 2;
  for (let y = 0; y < size; y += 64) {
    colorCtx.beginPath();
    colorCtx.moveTo(0, y);
    colorCtx.lineTo(size, y);
    colorCtx.stroke();
  }
  // tie holes
  colorCtx.fillStyle = "rgba(80,80,80,0.4)";
  for (let y = 32; y < size; y += 64) {
    for (let x = 32; x < size; x += 64) {
      colorCtx.beginPath();
      colorCtx.arc(x, y, 2.5, 0, Math.PI * 2);
      colorCtx.fill();
    }
  }

  const [normalC, normalCtx] = makeCanvas(size);
  noiseFill(normalCtx, size, "#8080ff", 5);

  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#909090", 20);

  return {
    map: toTexture(colorC, repeat),
    normalMap: toTexture(normalC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 0.7,
  };
}

/* ---- Stone (ashlar) ---- */
export function stoneTextures(repeat = 2) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  noiseFill(colorCtx, size, "#c8bca8", 15);
  // ashlar blocks — irregular sizes
  const blocks = [80, 120, 90, 110, 100, 85, 130];
  let y = 0;
  let row = 0;
  while (y < size) {
    const bh = 50 + Math.random() * 15;
    let x = 0;
    let bi = (row * 3) % blocks.length;
    while (x < size) {
      const bw = blocks[bi % blocks.length];
      const r = 190 + Math.floor(Math.random() * 20);
      const g = 180 + Math.floor(Math.random() * 18);
      const b = 160 + Math.floor(Math.random() * 18);
      colorCtx.fillStyle = `rgb(${r},${g},${b})`;
      colorCtx.fillRect(x, y, bw - 2, bh - 2);
      colorCtx.fillStyle = "rgba(0,0,0,0.06)";
      colorCtx.fillRect(x, y, bw - 2, bh - 2);
      x += bw;
      bi++;
    }
    // mortar
    colorCtx.strokeStyle = "#e0d8cc";
    colorCtx.lineWidth = 2;
    colorCtx.beginPath();
    colorCtx.moveTo(0, y);
    colorCtx.lineTo(size, y);
    colorCtx.stroke();
    y += bh;
    row++;
  }

  const [normalC, normalCtx] = makeCanvas(size);
  normalCtx.fillStyle = "#8080ff";
  normalCtx.fillRect(0, 0, size, size);
  normalCtx.strokeStyle = "#6060d0";
  normalCtx.lineWidth = 3;
  y = 0;
  row = 0;
  while (y < size) {
    const bh = 50 + ((row * 7) % 15);
    let x = 0;
    let bi = (row * 3) % blocks.length;
    normalCtx.beginPath();
    normalCtx.moveTo(0, y);
    normalCtx.lineTo(size, y);
    normalCtx.stroke();
    while (x < size) {
      const bw = blocks[bi % blocks.length];
      normalCtx.beginPath();
      normalCtx.moveTo(x, y);
      normalCtx.lineTo(x, y + bh);
      normalCtx.stroke();
      x += bw;
      bi++;
    }
    y += bh;
    row++;
  }

  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#989080", 15);

  return {
    map: toTexture(colorC, repeat),
    normalMap: toTexture(normalC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 0.8,
  };
}

/* ---- Timber cladding ---- */
export function timberTextures(repeat = 2) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  noiseFill(colorCtx, size, "#9c6b3f", 12);
  // vertical boards
  const boardW = 48;
  for (let x = 0; x < size; x += boardW) {
    const r = 140 + Math.floor(Math.random() * 30);
    const g = 95 + Math.floor(Math.random() * 22);
    const b = 55 + Math.floor(Math.random() * 18);
    colorCtx.fillStyle = `rgb(${r},${g},${b})`;
    colorCtx.fillRect(x, 0, boardW - 2, size);
    // wood grain lines
    colorCtx.strokeStyle = "rgba(60,40,20,0.15)";
    colorCtx.lineWidth = 1;
    for (let g = 0; g < 8; g++) {
      const gx = x + Math.random() * boardW;
      colorCtx.beginPath();
      colorCtx.moveTo(gx, 0);
      colorCtx.bezierCurveTo(gx + 3, size / 3, gx - 3, (size * 2) / 3, gx, size);
      colorCtx.stroke();
    }
    // shadow gap
    colorCtx.fillStyle = "rgba(0,0,0,0.25)";
    colorCtx.fillRect(x + boardW - 2, 0, 2, size);
  }

  const [normalC, normalCtx] = makeCanvas(size);
  normalCtx.fillStyle = "#8080ff";
  normalCtx.fillRect(0, 0, size, size);
  normalCtx.strokeStyle = "#5050b0";
  normalCtx.lineWidth = 2;
  for (let x = 0; x < size; x += boardW) {
    normalCtx.beginPath();
    normalCtx.moveTo(x + boardW - 1, 0);
    normalCtx.lineTo(x + boardW - 1, size);
    normalCtx.stroke();
  }

  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#a08060", 18);

  return {
    map: toTexture(colorC, repeat),
    normalMap: toTexture(normalC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 0.65,
  };
}

/* ---- Metal cladding ---- */
export function metalTextures(repeat = 2) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  noiseFill(colorCtx, size, "#b8bcc4", 8);
  // standing seams
  const seamW = 32;
  for (let x = 0; x < size; x += seamW) {
    colorCtx.fillStyle = "rgba(0,0,0,0.12)";
    colorCtx.fillRect(x, 0, 1, size);
    colorCtx.fillStyle = "rgba(255,255,255,0.08)";
    colorCtx.fillRect(x + 1, 0, 2, size);
  }

  const [normalC, normalCtx] = makeCanvas(size);
  normalCtx.fillStyle = "#8080ff";
  normalCtx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += seamW) {
    normalCtx.strokeStyle = "#6060d0";
    normalCtx.lineWidth = 1;
    normalCtx.beginPath();
    normalCtx.moveTo(x, 0);
    normalCtx.lineTo(x, size);
    normalCtx.stroke();
  }

  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#606060", 8);

  return {
    map: toTexture(colorC, repeat),
    normalMap: toTexture(normalC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 0.35,
    metalness: 0.6,
  };
}

/* ---- Glass (curtain wall) ---- */
export function glassMaterial(tint: string = "#a8c8d8", opacity = 0.45): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.3,
    transparent: true,
    opacity,
    reflectivity: 0.6,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    ior: 1.45,
    envMapIntensity: 1.5,
  });
}

/* ---- Asphalt (roads) ---- */
export function asphaltTexture(repeat = 3) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  noiseFill(colorCtx, size, "#3a3a3a", 12);
  // road markings
  colorCtx.fillStyle = "#f0e0a0";
  colorCtx.fillRect(size / 2 - 4, 20, 8, 60);
  colorCtx.fillRect(size / 2 - 4, 120, 8, 60);
  colorCtx.fillRect(size / 2 - 4, 220, 8, 60);
  colorCtx.fillRect(size / 2 - 4, 320, 8, 60);
  colorCtx.fillRect(size / 2 - 4, 420, 8, 60);

  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#909090", 15);

  return {
    map: toTexture(colorC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 0.9,
  };
}

/* ---- Paving (paths) ---- */
export function pavingTexture(repeat = 4) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  noiseFill(colorCtx, size, "#b0a898", 10);
  // paving slab grid
  const slab = 64;
  colorCtx.strokeStyle = "rgba(80,75,65,0.4)";
  colorCtx.lineWidth = 2;
  for (let x = 0; x <= size; x += slab) {
    colorCtx.beginPath();
    colorCtx.moveTo(x, 0);
    colorCtx.lineTo(x, size);
    colorCtx.stroke();
  }
  for (let y = 0; y <= size; y += slab) {
    colorCtx.beginPath();
    colorCtx.moveTo(0, y);
    colorCtx.lineTo(size, y);
    colorCtx.stroke();
  }
  // per-slab variation
  for (let x = 0; x < size; x += slab) {
    for (let y = 0; y < size; y += slab) {
      colorCtx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
      colorCtx.fillRect(x, y, slab, slab);
    }
  }

  const [normalC, normalCtx] = makeCanvas(size);
  normalCtx.fillStyle = "#8080ff";
  normalCtx.fillRect(0, 0, size, size);
  normalCtx.strokeStyle = "#6060d0";
  normalCtx.lineWidth = 2;
  for (let x = 0; x <= size; x += slab) {
    normalCtx.beginPath();
    normalCtx.moveTo(x, 0);
    normalCtx.lineTo(x, size);
    normalCtx.stroke();
  }
  for (let y = 0; y <= size; y += slab) {
    normalCtx.beginPath();
    normalCtx.moveTo(0, y);
    normalCtx.lineTo(size, y);
    normalCtx.stroke();
  }

  return {
    map: toTexture(colorC, repeat),
    normalMap: toTexture(normalC, repeat),
    roughness: 0.8,
  };
}

/* ---- Grass / lawn ---- */
export function grassTexture(repeat = 6) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  noiseFill(colorCtx, size, "#4a6b3a", 20);
  // add darker green patches
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 10 + Math.random() * 30;
    colorCtx.fillStyle = `rgba(40,80,30,${Math.random() * 0.3})`;
    colorCtx.beginPath();
    colorCtx.arc(x, y, r, 0, Math.PI * 2);
    colorCtx.fill();
  }

  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#909090", 15);

  return {
    map: toTexture(colorC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 1,
  };
}

/* ---- Marble floor (for interiors) ---- */
export function marbleTextures(repeat = 2) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  colorCtx.fillStyle = "#e8e4e0";
  colorCtx.fillRect(0, 0, size, size);
  // veins
  colorCtx.strokeStyle = "rgba(160,155,145,0.3)";
  colorCtx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    colorCtx.beginPath();
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    colorCtx.moveTo(x1, y1);
    colorCtx.bezierCurveTo(
      x1 + (Math.random() - 0.5) * 200,
      y1 + (Math.random() - 0.5) * 200,
      x1 + (Math.random() - 0.5) * 300,
      y1 + (Math.random() - 0.5) * 300,
      x1 + (Math.random() - 0.5) * 400,
      y1 + (Math.random() - 0.5) * 400,
    );
    colorCtx.stroke();
  }
  noiseFill(colorCtx, size, "#e8e4e0", 5);

  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#404040", 5);

  return {
    map: toTexture(colorC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 0.15,
    metalness: 0.0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  };
}

/* ---- Wood floor (for interiors) ---- */
export function woodFloorTextures(repeat = 3) {
  const size = 512;
  const [colorC, colorCtx] = makeCanvas(size);
  // planks
  const plankH = 64;
  for (let y = 0; y < size; y += plankH) {
    const r = 110 + Math.floor(Math.random() * 30);
    const g = 75 + Math.floor(Math.random() * 20);
    const b = 45 + Math.floor(Math.random() * 15);
    colorCtx.fillStyle = `rgb(${r},${g},${b})`;
    colorCtx.fillRect(0, y, size, plankH - 2);
    // grain
    colorCtx.strokeStyle = "rgba(50,35,20,0.12)";
    colorCtx.lineWidth = 1;
    for (let g = 0; g < 6; g++) {
      const gy = y + Math.random() * plankH;
      colorCtx.beginPath();
      colorCtx.moveTo(0, gy);
      colorCtx.bezierCurveTo(size / 3, gy + 4, (size * 2) / 3, gy - 4, size, gy);
      colorCtx.stroke();
    }
    colorCtx.fillStyle = "rgba(0,0,0,0.2)";
    colorCtx.fillRect(0, y + plankH - 2, size, 2);
  }

  const [normalC, normalCtx] = makeCanvas(size);
  normalCtx.fillStyle = "#8080ff";
  normalCtx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += plankH) {
    normalCtx.strokeStyle = "#5050b0";
    normalCtx.lineWidth = 2;
    normalCtx.beginPath();
    normalCtx.moveTo(0, y + plankH - 1);
    normalCtx.lineTo(size, y + plankH - 1);
    normalCtx.stroke();
  }

  const [roughC, roughCtx] = makeCanvas(size);
  noiseFill(roughCtx, size, "#806040", 12);

  return {
    map: toTexture(colorC, repeat),
    normalMap: toTexture(normalC, repeat),
    roughnessMap: toTexture(roughC, repeat),
    roughness: 0.45,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
  };
}

/* ---- Interior wall (painted plaster) ---- */
export function wallTexture(color = "#e8e0d5") {
  const size = 256;
  const [c, ctx] = makeCanvas(size);
  noiseFill(ctx, size, color, 6);
  return { map: toTexture(c, 1), roughness: 0.9 };
}

/* ---- Concrete floor (interior) ---- */
export function concreteFloorTexture(repeat = 3) {
  const size = 512;
  const [c, ctx] = makeCanvas(size);
  noiseFill(ctx, size, "#b0b0b0", 12);
  // expansion joints
  ctx.strokeStyle = "rgba(80,80,80,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();
  return {
    map: toTexture(c, repeat),
    roughness: 0.4,
    clearcoat: 0.6,
    clearcoatRoughness: 0.15,
  };
}
