// ==================== PURE PIXEL ART MATH & PRESETS ====================
// Zero DOM dependencies — 100% pure ES6 functions for drawing, transforms,
// palettes, and 12 hand-crafted pixel-art presets (static & multi-frame).

export const PIXEL_PALETTES = {
  pico8: {
    name: 'Pico-8 Clássico',
    colors: [
      '#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8',
      '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa',
    ],
  },
  neon: {
    name: 'Obsidian Neon',
    colors: [
      '#0b0e14', '#1e293b', '#334155', '#64748b', '#cbd5e1', '#f8fafc', '#f97316', '#fb923c',
      '#ef4444', '#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#38bdf8', '#2dd4bf', '#4ade80',
    ],
  },
  pastel: {
    name: 'Pastel Retrô',
    colors: [
      '#2d2a32', '#5b5368', '#a39ba8', '#f4f1de', '#f2cc8f', '#e07a5f', '#f4978e', '#fbc4ab',
      '#cdb4db', '#ffc8dd', '#bde0fe', '#a2d2ff', '#95d5b2', '#74c69d', '#ffd166', '#ffffff',
    ],
  },
  terra: {
    name: 'Aventura & Terra',
    colors: [
      '#141013', '#3b2820', '#6e4736', '#a86b4c', '#e0a97a', '#f7e3be', '#224c38', '#3c8051',
      '#78b85a', '#c9e07e', '#1f4e78', '#3a86b8', '#7ac7e8', '#b83232', '#e86a33', '#f5c242',
    ],
  },
};

export function createEmptyFrame(size) {
  return Array.from({ length: size * size }, () => [0, 0, 0, 0]);
}

export function cloneFrame(pixels) {
  return pixels.map(p => [p[0], p[1], p[2], p[3]]);
}

export function hexToRgba(hex, alpha = 255) {
  const clean = String(hex || '#000000').replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const a = Math.max(0, Math.min(255, Math.round(alpha)));
  return [r, g, b, a];
}

export function rgbaToHex(rgba) {
  if (!rgba) return '#000000';
  return '#' + [rgba[0], rgba[1], rgba[2]]
    .map(n => Math.max(0, Math.min(255, Number(n) || 0)).toString(16).padStart(2, '0'))
    .join('');
}

export function rgbaEqual(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

export function bresenhamLine(x0, y0, x1, y1) {
  const pts = [];
  let cx = x0, cy = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    pts.push([cx, cy]);
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
  return pts;
}

export function rectPixels(x0, y0, x1, y1, filled = false) {
  const minX = Math.min(x0, x1), maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1), maxY = Math.max(y0, y1);
  const pts = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (filled || x === minX || x === maxX || y === minY || y === maxY) {
        pts.push([x, y]);
      }
    }
  }
  return pts;
}

export function circlePixels(cx, cy, x1, y1, filled = false) {
  const r = Math.round(Math.hypot(x1 - cx, y1 - cy));
  const pts = [];
  if (r <= 0) return [[cx, cy]];
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dist = Math.hypot(x - cx, y - cy);
      if (filled) {
        if (dist <= r + 0.35) pts.push([x, y]);
      } else {
        if (Math.abs(dist - r) <= 0.55) pts.push([x, y]);
      }
    }
  }
  return pts;
}

export function floodFill(pixels, size, sx, sy, newRgba) {
  if (sx < 0 || sx >= size || sy < 0 || sy >= size) return pixels;
  const out = cloneFrame(pixels);
  const target = out[sy * size + sx];
  if (rgbaEqual(target, newRgba)) return out;
  const stack = [[sx, sy]];
  const visited = new Uint8Array(size * size);
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const idx = y * size + x;
    if (visited[idx]) continue;
    if (!rgbaEqual(out[idx], target)) continue;
    visited[idx] = 1;
    out[idx] = [...newRgba];
    if (x > 0) stack.push([x - 1, y]);
    if (x < size - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < size - 1) stack.push([x, y + 1]);
  }
  return out;
}

export function replaceColor(pixels, oldRgba, newRgba) {
  return pixels.map(p => (rgbaEqual(p, oldRgba) ? [...newRgba] : [...p]));
}

export function shiftFrame(pixels, size, dx, dy) {
  const out = createEmptyFrame(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x + dx + size) % size;
      const ny = (y + dy + size) % size;
      out[ny * size + nx] = [...pixels[y * size + x]];
    }
  }
  return out;
}

export function flipFrameH(pixels, size) {
  const out = createEmptyFrame(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      out[y * size + (size - 1 - x)] = [...pixels[y * size + x]];
    }
  }
  return out;
}

export function flipFrameV(pixels, size) {
  const out = createEmptyFrame(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      out[(size - 1 - y) * size + x] = [...pixels[y * size + x]];
    }
  }
  return out;
}

export function rotateFrame90(pixels, size, clockwise = true) {
  const out = createEmptyFrame(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = clockwise ? (size - 1 - y) : y;
      const ny = clockwise ? x : (size - 1 - x);
      out[ny * size + nx] = [...pixels[y * size + x]];
    }
  }
  return out;
}

export function autoOutline(pixels, size, outlineRgba = [15, 23, 42, 255]) {
  const out = cloneFrame(pixels);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (pixels[y * size + x][3] > 0) continue;
      const touchesOpaque = dirs.some(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        return nx >= 0 && nx < size && ny >= 0 && ny < size && pixels[ny * size + nx][3] > 0;
      });
      if (touchesOpaque) out[y * size + x] = [...outlineRgba];
    }
  }
  return out;
}

export function resizeFramePreserve(pixels, oldSize, newSize) {
  if (oldSize === newSize) return cloneFrame(pixels);
  const out = createEmptyFrame(newSize);
  const offset = Math.floor((newSize - oldSize) / 2);
  for (let y = 0; y < oldSize; y++) {
    for (let x = 0; x < oldSize; x++) {
      const nx = x + offset;
      const ny = y + offset;
      if (nx >= 0 && nx < newSize && ny >= 0 && ny < newSize) {
        out[ny * newSize + nx] = [...pixels[y * oldSize + x]];
      }
    }
  }
  return out;
}

// Helper to compile compact 16×16 ASCII sprite maps into RGBA pixel arrays
function parseAsciiSprite(rows, palette) {
  const size = rows.length;
  const pixels = createEmptyFrame(size);
  for (let y = 0; y < size; y++) {
    const line = rows[y];
    for (let x = 0; x < size; x++) {
      const ch = line[x];
      const hex = palette[ch];
      if (hex) pixels[y * size + x] = hexToRgba(hex, 255);
    }
  }
  return pixels;
}

// ==================== 12 HAND-CRAFTED EDITABLE PIXEL-ART PRESETS ====================
export const PIXEL_PRESETS = [
  {
    key: 'caranguejo',
    name: 'Caranguejo CrabCode',
    category: 'Mascote',
    size: 16,
    fps: 4,
    frames: [
      parseAsciiSprite([
        '................',
        '..OO........OO..',
        '.OYYO......OYYO.',
        '.OYY........YYO.',
        '..OO..OOOO..OO..',
        '...OOOOOOOOOO...',
        '..OOOWKOOOWKOO..',
        '..OOOWWOOOWWOO..',
        '..OOOOOOOOOOOO..',
        '...OORRRRRROO...',
        '..O.OOOOOOOO.O..',
        '.O..O.OOOO.O..O.',
        '.O..O......O..O.',
        '....O......O....',
        '................',
        '................',
      ], { O: '#ea580c', R: '#c2410c', Y: '#fb923c', W: '#f8fafc', K: '#0f172a' }),
      parseAsciiSprite([
        '..OO........OO..',
        '.OYYO......OYYO.',
        '.OYY........YYO.',
        '..OO........OO..',
        '...O..OOOO..O...',
        '...OOOOOOOOOO...',
        '..OOOWKOOOWKOO..',
        '..OOOWWOOOWWOO..',
        '..OOOOOOOOOOOO..',
        '...OORRRRRROO...',
        '..O.OOOOOOOO.O..',
        '.O...O.OO.O...O.',
        '.....O....O.....',
        '....O......O....',
        '................',
        '................',
      ], { O: '#ea580c', R: '#c2410c', Y: '#fb923c', W: '#f8fafc', K: '#0f172a' }),
    ],
  },
  {
    key: 'nave',
    name: 'Nave Espacial',
    category: 'Jogos',
    size: 16,
    fps: 6,
    frames: [
      parseAsciiSprite([
        '.......WW.......',
        '......WWWW......',
        '......WCCW......',
        '.....WWCCWW.....',
        '.....WWWWWW.....',
        '....WWBBBBWW....',
        '...WWBBBBBBWW...',
        '..WWBWWWWWWBWW..',
        '.WWBBWWWWWWBBWW.',
        '.WWBWWWWWWWWBWW.',
        '.WW..WWWWWW..WW.',
        '.....WW..WW.....',
        '.....OO..OO.....',
        '.....YY..YY.....',
        '......Y..Y......',
        '................',
      ], { W: '#e2e8f0', B: '#3b82f6', C: '#38bdf8', O: '#f97316', Y: '#facc15' }),
      parseAsciiSprite([
        '.......WW.......',
        '......WWWW......',
        '......WCCW......',
        '.....WWCCWW.....',
        '.....WWWWWW.....',
        '....WWBBBBWW....',
        '...WWBBBBBBWW...',
        '..WWBWWWWWWBWW..',
        '.WWBBWWWWWWBBWW.',
        '.WWBWWWWWWWWBWW.',
        '.WW..WWWWWW..WW.',
        '.....WW..WW.....',
        '.....YY..YY.....',
        '.....OO..OO.....',
        '.....OO..OO.....',
        '......Y..Y......',
      ], { W: '#e2e8f0', B: '#3b82f6', C: '#38bdf8', O: '#f97316', Y: '#facc15' }),
    ],
  },
  {
    key: 'coracao',
    name: 'Coração Pixel',
    category: 'Ícones',
    size: 16,
    fps: 4,
    frames: [
      parseAsciiSprite([
        '................',
        '................',
        '...RRR....RRR...',
        '..RPPPR..RRRRR..',
        '.RPPPRRRRRRRRRR.',
        '.RPPRRRRRRRRRRR.',
        '.RRRRRRRRRRRRRR.',
        '.RRRRRRRRRRRRRR.',
        '..RRRRRRRRRRRR..',
        '...RRRRRRRRRR...',
        '....RRRRRRRR....',
        '.....RRRRRR.....',
        '......RRRR......',
        '.......RR.......',
        '................',
        '................',
      ], { R: '#e11d48', P: '#fda4af' }),
      parseAsciiSprite([
        '................',
        '..RRRR....RRRR..',
        '.RRPPPR..RRRRRR.',
        'RRPPPRRRRRRRRRRR',
        'RRPPRRRRRRRRRRRR',
        'RRRRRRRRRRRRRRRR',
        'RRRRRRRRRRRRRRRR',
        '.RRRRRRRRRRRRRR.',
        '..RRRRRRRRRRRR..',
        '...RRRRRRRRRR...',
        '....RRRRRRRR....',
        '.....RRRRRR.....',
        '......RRRR......',
        '.......RR.......',
        '................',
        '................',
      ], { R: '#f43f5e', P: '#fecdd3' }),
    ],
  },
  {
    key: 'estrela',
    name: 'Estrela Dourada',
    category: 'Ícones',
    size: 16,
    fps: 4,
    frames: [
      parseAsciiSprite([
        '.......YY.......',
        '.......YY.......',
        '......YYYY......',
        '......YWWY......',
        '.....YYYYYY.....',
        '.YYYYYYYYYYYYYY.',
        '..YYYYWWWWYYYY..',
        '...YYYYYYYYYY...',
        '....YYYYYYYY....',
        '....YYYYYYYY....',
        '...YYYYOYYYYY...',
        '...YYY..OYYYY...',
        '..YYY....OYYY...',
        '..YY......OYY...',
        '................',
        '................',
      ], { Y: '#facc15', O: '#ca8a04', W: '#fef9c3' }),
    ],
  },
  {
    key: 'moeda',
    name: 'Moeda Girando',
    category: 'Jogos',
    size: 16,
    fps: 6,
    frames: [
      parseAsciiSprite([
        '................',
        '.....OOOOOO.....',
        '...OOYYYYYYOO...',
        '..OYYWWYYYYYYO..',
        '..OYWYYOOYYYYO..',
        '.OYYWYOYYOYYYYO.',
        '.OYYYYOYYOYYYYO.',
        '.OYYYYOYYOYYYYO.',
        '.OYYYYOYYOYYYYO.',
        '.OYYYYOYYOYYYYO.',
        '..OYYYYOOYYYYO..',
        '..OYYYYYYYYYYO..',
        '...OOYYYYYYOO...',
        '.....OOOOOO.....',
        '................',
        '................',
      ], { O: '#b45309', Y: '#facc15', W: '#fef08a' }),
      parseAsciiSprite([
        '................',
        '......OOOO......',
        '.....OYYYYO.....',
        '.....OWYYYO.....',
        '.....OWYYYO.....',
        '.....OYYOYO.....',
        '.....OYYOYO.....',
        '.....OYYOYO.....',
        '.....OYYOYO.....',
        '.....OYYOYO.....',
        '.....OYYYYO.....',
        '.....OYYYYO.....',
        '.....OYYYYO.....',
        '......OOOO......',
        '................',
        '................',
      ], { O: '#b45309', Y: '#facc15', W: '#fef08a' }),
    ],
  },
  {
    key: 'espada',
    name: 'Espada de Aço',
    category: 'RPG',
    size: 16,
    fps: 4,
    frames: [
      parseAsciiSprite([
        '.............SS.',
        '............SWS.',
        '...........SWSS.',
        '..........SWSS..',
        '.........SWSS...',
        '........SWSS....',
        '.......SWSS.....',
        '......SWSS......',
        '...G.SWSS.......',
        '....GGSS........',
        '....GGG.........',
        '...B.GGG........',
        '..BB..G.........',
        '.BBB............',
        '.GG.............',
        '................',
      ], { S: '#94a3b8', W: '#f8fafc', G: '#eab308', B: '#78350f' }),
    ],
  },
  {
    key: 'arvore',
    name: 'Árvore Clássica',
    category: 'Cenário',
    size: 16,
    fps: 4,
    frames: [
      parseAsciiSprite([
        '......GGGG......',
        '....GLLLLGGG....',
        '...GLLLLGGGGG...',
        '..GLLLGGGGGGGG..',
        '..GGGGGGGGGGGG..',
        '.GGGLLLGGGGGGGG.',
        '.GGGGGGGGGGGGGG.',
        '.GGGGGGDDDGGGGG.',
        '..GGGGDDDDDGGG..',
        '...GGGDDDDGGG...',
        '......BBBB......',
        '......BKKB......',
        '......BBBB......',
        '.....BBBBBB.....',
        '....GGGBBGGG....',
        '................',
      ], { G: '#16a34a', L: '#4ade80', D: '#166534', B: '#854d0e', K: '#713f12' }),
    ],
  },
  {
    key: 'robo',
    name: 'Robô Amigável',
    category: 'Personagem',
    size: 16,
    fps: 3,
    frames: [
      parseAsciiSprite([
        '.......RR.......',
        '.......SS.......',
        '....SSSSSSSS....',
        '...SSDDDDDDSS...',
        '...SDCCDDCCDS...',
        '...SDCCDDCCDS...',
        '...SDDDDDDDDS...',
        '...SDDCCCCDDS...',
        '....SSSSSSSS....',
        '......SSSS......',
        '..SS.SSSSSS.SS..',
        '..SS.SSCCSS.SS..',
        '.....SSSSSS.....',
        '.....SS..SS.....',
        '....SSS..SSS....',
        '................',
      ], { S: '#94a3b8', D: '#1e293b', C: '#38bdf8', R: '#f97316' }),
      parseAsciiSprite([
        '.......YY.......',
        '.......SS.......',
        '....SSSSSSSS....',
        '...SSDDDDDDSS...',
        '...SDDDDDDDDS...',
        '...SDCCDDCCDS...',
        '...SDDDDDDDDS...',
        '...SDDCCCCDDS...',
        '....SSSSSSSS....',
        '......SSSS......',
        '..SS.SSSSSS.SS..',
        '..SS.SSCCSS.SS..',
        '.....SSSSSS.....',
        '.....SS..SS.....',
        '....SSS..SSS....',
        '................',
      ], { S: '#94a3b8', D: '#1e293b', C: '#38bdf8', Y: '#facc15' }),
    ],
  },
  {
    key: 'fantasma',
    name: 'Fantasma Arcade',
    category: 'Jogos',
    size: 16,
    fps: 5,
    frames: [
      parseAsciiSprite([
        '................',
        '.....PPPPPP.....',
        '...PPPPPPPPPP...',
        '..PPPPPPPPPPPP..',
        '..PPWWPPPPWWPP..',
        '.PPWBBWPPWBBWPP.',
        '.PPWBBWPPWBBWPP.',
        '.PPPWWPPPPWWPPP.',
        '.PPPPPPPPPPPPPP.',
        '.PPPPPPPPPPPPPP.',
        '.PPPPPPPPPPPPPP.',
        '.PPPPPPPPPPPPPP.',
        '.PP..PP..PP..PP.',
        '.P...P....P...P.',
        '................',
        '................',
      ], { P: '#a855f7', W: '#ffffff', B: '#1d4ed8' }),
      parseAsciiSprite([
        '.....PPPPPP.....',
        '...PPPPPPPPPP...',
        '..PPPPPPPPPPPP..',
        '..PPWWPPPPWWPP..',
        '.PPWBBWPPWBBWPP.',
        '.PPWBBWPPWBBWPP.',
        '.PPPWWPPPPWWPPP.',
        '.PPPPPPPPPPPPPP.',
        '.PPPPPPPPPPPPPP.',
        '.PPPPPPPPPPPPPP.',
        '.PPPPPPPPPPPPPP.',
        '.P..PPP..PPP..P.',
        '....PP....PP....',
        '................',
        '................',
        '................',
      ], { P: '#c084fc', W: '#ffffff', B: '#1d4ed8' }),
    ],
  },
  {
    key: 'foguete',
    name: 'Foguete Orbital',
    category: 'Ciência',
    size: 16,
    fps: 6,
    frames: [
      parseAsciiSprite([
        '.......RR.......',
        '......RRRR......',
        '.....RRRRRR.....',
        '.....WWWWWW.....',
        '....WWWCCWWW....',
        '....WWCCCCWW....',
        '....WWWCCWWW....',
        '....WWWWWWWW....',
        '...RWWWWWWWWR...',
        '..RRWWWWWWWWRR..',
        '..RR.WWWWWW.RR..',
        '..R..DDDDDD..R..',
        '......OOOO......',
        '......OYYO......',
        '.......YY.......',
        '................',
      ], { R: '#ef4444', W: '#f1f5f9', C: '#38bdf8', D: '#475569', O: '#f97316', Y: '#facc15' }),
      parseAsciiSprite([
        '.......RR.......',
        '......RRRR......',
        '.....RRRRRR.....',
        '.....WWWWWW.....',
        '....WWWCCWWW....',
        '....WWCCCCWW....',
        '....WWWCCWWW....',
        '....WWWWWWWW....',
        '...RWWWWWWWWR...',
        '..RRWWWWWWWWRR..',
        '..RR.WWWWWW.RR..',
        '..R..DDDDDD..R..',
        '.....OYYYYO.....',
        '......OOOO......',
        '......OYYO......',
        '.......OO.......',
      ], { R: '#ef4444', W: '#f1f5f9', C: '#38bdf8', D: '#475569', O: '#f97316', Y: '#facc15' }),
    ],
  },
  {
    key: 'pocao',
    name: 'Poção Mágica',
    category: 'RPG',
    size: 16,
    fps: 4,
    frames: [
      parseAsciiSprite([
        '......BBBB......',
        '......BBBB......',
        '.....GGGGGG.....',
        '......GGGG......',
        '......G..G......',
        '.....GG..GG.....',
        '....G..GG..G....',
        '...G.CCCCCC.G...',
        '..G.CCWCCCCC.G..',
        '..G.CWCCCCCC.G..',
        '..G.CCCCCCCC.G..',
        '..G.CCDDDDCC.G..',
        '...G.DDDDDD.G...',
        '....GGGGGGGG....',
        '................',
        '................',
      ], { B: '#a16207', G: '#cbd5e1', C: '#2dd4bf', D: '#0d9488', W: '#f0fdfa' }),
    ],
  },
  {
    key: 'trofeu',
    name: 'Troféu Campeão',
    category: 'Ícones',
    size: 16,
    fps: 4,
    frames: [
      parseAsciiSprite([
        '................',
        '...YYYYYYYYYY...',
        '.OOYWWYYYYYYYO..',
        'O..YWWYYYYYYY..O',
        'O..YYYYYYYYYY..O',
        '.OOYYYYYYYYYYOO.',
        '...YYYYYYYYYY...',
        '....YYYYYYYY....',
        '.....YYYYYY.....',
        '......YYYY......',
        '.......YY.......',
        '......YYYY......',
        '....OOOOOOOO....',
        '...OYYYYYYYYO...',
        '...OOOOOOOOOO...',
        '................',
      ], { Y: '#facc15', O: '#b45309', W: '#fef9c3' }),
    ],
  },
];
