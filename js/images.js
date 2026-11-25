// ==================== PIXEL ART & MULTI-FRAME ASSET STUDIO ====================
// Pure Vanilla ES6 + HTML5 Canvas 2D — supports 8x8..64x64 grids, 9 drawing tools,
// brush sizes, X/Y/XY symmetry, 4 palettes, transforms, auto-outline,
// multi-frame animation timeline with Onion Skinning & FPS playback,
// PNG import, Sprite-Sheet PNG export, and 12 curated editable pixel-art presets.

import { showToast, showConfirm, copyText } from './ui.js';
import { escapeHtml } from './utils.js';
import { safeSetItem } from './storage.js';
import {
  PIXEL_PALETTES, PIXEL_PRESETS,
  createEmptyFrame, cloneFrame, hexToRgba, rgbaToHex,
  bresenhamLine, rectPixels, circlePixels, floodFill, replaceColor,
  shiftFrame, flipFrameH, flipFrameV, rotateFrame90, autoOutline, resizeFramePreserve,
} from './pixel_presets.js';

const IMAGES_KEY = 'crabcode_images';

export function loadImages() {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveImages(images) {
  const res = safeSetItem(IMAGES_KEY, JSON.stringify(images));
  if (res.ok) {
    window.__ccImages = images;
    window.dispatchEvent(new CustomEvent('crab-highlight-refresh'));
  }
  return res;
}

function getSpriteFrames(img) {
  if (!img) return [];
  if (Array.isArray(img.frames) && img.frames.length > 0) return img.frames;
  if (Array.isArray(img.pixels)) return [img.pixels];
  return [];
}

function renderPixelsToCanvas(canvas, pixels, size) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  for (let i = 0; i < pixels.length; i++) {
    const px = pixels[i];
    if (Array.isArray(px)) {
      imageData.data[i * 4]     = px[0];
      imageData.data[i * 4 + 1] = px[1];
      imageData.data[i * 4 + 2] = px[2];
      imageData.data[i * 4 + 3] = px[3];
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// ==================== STUDIO STATE ====================
const state = {
  editingKey: null,
  size: 16,
  fps: 6,
  frames: [createEmptyFrame(16)],
  currentFrame: 0,
  tool: 'brush',       // brush | eraser | line | rect | rectfill | circle | bucket | replace | eyedropper
  brushSize: 1,        // 1 | 2 | 3
  mirror: 'off',       // off | x | y | xy
  color: '#f97316',
  alpha: 255,
  paletteKey: 'pico8',
  recentColors: ['#f97316', '#38bdf8', '#4ade80', '#facc15', '#f43f5e', '#ffffff'],
  showGrid: true,
  onionSkin: false,
  isDrawing: false,
  dragStart: null,
  previewPoints: null,
  history: [],
  redoStack: [],
  playing: false,
  playTimer: null,
  playFrameIdx: 0,
  galleryTimers: [],
};

function currentPixels() {
  return state.frames[state.currentFrame];
}

function setCurrentPixels(px) {
  state.frames[state.currentFrame] = px;
}

function pushUndoSnapshot() {
  state.history.push({
    size: state.size,
    currentFrame: state.currentFrame,
    frames: state.frames.map(cloneFrame),
  });
  if (state.history.length > 40) state.history.shift();
  state.redoStack = [];
}

function undo() {
  if (state.history.length === 0) return;
  state.redoStack.push({
    size: state.size,
    currentFrame: state.currentFrame,
    frames: state.frames.map(cloneFrame),
  });
  const snap = state.history.pop();
  state.size = snap.size;
  state.frames = snap.frames;
  state.currentFrame = Math.min(snap.currentFrame, state.frames.length - 1);
  syncSizeControl();
  redrawAll();
}

function redo() {
  if (state.redoStack.length === 0) return;
  state.history.push({
    size: state.size,
    currentFrame: state.currentFrame,
    frames: state.frames.map(cloneFrame),
  });
  const snap = state.redoStack.pop();
  state.size = snap.size;
  state.frames = snap.frames;
  state.currentFrame = Math.min(snap.currentFrame, state.frames.length - 1);
  syncSizeControl();
  redrawAll();
}

function addRecentColor(hex) {
  const norm = hex.toLowerCase();
  state.recentColors = [norm, ...state.recentColors.filter(c => c !== norm)].slice(0, 8);
  renderRecentColors();
}

// ==================== CANVAS DRAWING ====================
function getSymmetricPoints(x, y) {
  const s = state.size;
  const pts = [[x, y]];
  if (state.mirror === 'x' || state.mirror === 'xy') pts.push([s - 1 - x, y]);
  if (state.mirror === 'y' || state.mirror === 'xy') pts.push([x, s - 1 - y]);
  if (state.mirror === 'xy') pts.push([s - 1 - x, s - 1 - y]);
  return pts;
}

function paintBrushAt(pixels, cx, cy, rgba) {
  const s = state.size;
  const r = state.brushSize - 1;
  const start = -Math.floor(r / 2);
  const end = Math.ceil(r / 2);
  for (const [sx, sy] of getSymmetricPoints(cx, cy)) {
    for (let dy = start; dy <= end; dy++) {
      for (let dx = start; dx <= end; dx++) {
        const nx = sx + dx;
        const ny = sy + dy;
        if (nx >= 0 && nx < s && ny >= 0 && ny < s) {
          pixels[ny * s + nx] = [...rgba];
        }
      }
    }
  }
}

function paintPointsList(pixels, pts, rgba) {
  const s = state.size;
  for (const [x, y] of pts) {
    for (const [sx, sy] of getSymmetricPoints(x, y)) {
      if (sx >= 0 && sx < s && sy >= 0 && sy < s) {
        pixels[sy * s + sx] = [...rgba];
      }
    }
  }
}

function getCanvasCoord(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = Math.floor(((clientX - rect.left) / rect.width) * state.size);
  const y = Math.floor(((clientY - rect.top) / rect.height) * state.size);
  return [
    Math.max(0, Math.min(state.size - 1, x)),
    Math.max(0, Math.min(state.size - 1, y)),
  ];
}

function drawEditorCanvas() {
  const canvas = document.getElementById('pixel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const s = state.size;
  const cell = W / s;

  ctx.clearRect(0, 0, W, H);

  // Checkerboard transparency backdrop
  const light = '#262b38';
  const dark = '#1d222e';
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? light : dark;
      ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }

  // Onion skinning (previous frame ghost at 28% opacity)
  if (state.onionSkin && state.frames.length > 1) {
    const prevIdx = (state.currentFrame - 1 + state.frames.length) % state.frames.length;
    const prevPx = state.frames[prevIdx];
    ctx.save();
    ctx.globalAlpha = 0.28;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const px = prevPx[y * s + x];
        if (px && px[3] > 0) {
          ctx.fillStyle = `rgba(${px[0]},${px[1]},${px[2]},${px[3] / 255})`;
          ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
    ctx.restore();
  }

  // Current frame pixels
  const pxArr = currentPixels();
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const px = pxArr[y * s + x];
      if (px && px[3] > 0) {
        ctx.fillStyle = `rgba(${px[0]},${px[1]},${px[2]},${px[3] / 255})`;
        ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
      }
    }
  }

  // Live shape preview overlay (line / rect / circle)
  if (state.previewPoints && state.previewPoints.length > 0) {
    const rgba = hexToRgba(state.color, Math.max(120, state.alpha));
    ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},0.75)`;
    for (const [x, y] of state.previewPoints) {
      for (const [sx, sy] of getSymmetricPoints(x, y)) {
        if (sx >= 0 && sx < s && sy >= 0 && sy < s) {
          ctx.fillRect(sx * cell, sy * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  }

  // Grid lines
  if (state.showGrid && cell >= 5) {
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < s; i++) {
      const p = Math.round(i * cell) + 0.5;
      ctx.moveTo(p, 0); ctx.lineTo(p, H);
      ctx.moveTo(0, p); ctx.lineTo(W, p);
    }
    ctx.stroke();
  }

  // Symmetry guide lines
  if (state.mirror !== 'off') {
    ctx.save();
    ctx.strokeStyle = 'rgba(249,115,22,0.55)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    if (state.mirror === 'x' || state.mirror === 'xy') {
      ctx.beginPath();
      ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
      ctx.stroke();
    }
    if (state.mirror === 'y' || state.mirror === 'xy') {
      ctx.beginPath();
      ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawPreviewCanvas(frameIdx = state.currentFrame) {
  const preview = document.getElementById('pixel-preview-canvas');
  if (!preview) return;
  const px = state.frames[frameIdx] || currentPixels();
  renderPixelsToCanvas(preview, px, state.size);
}

function renderTimeline() {
  const list = document.getElementById('pixel-frames-list');
  const counter = document.getElementById('pixel-frame-counter');
  if (counter) counter.textContent = `Quadro ${state.currentFrame + 1} / ${state.frames.length}`;
  if (!list) return;

  list.innerHTML = '';
  state.frames.forEach((framePx, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pixel-frame-thumb' + (idx === state.currentFrame ? ' active' : '');
    btn.title = `Quadro ${idx + 1}`;

    const mini = document.createElement('canvas');
    mini.className = 'pixel-frame-mini';
    renderPixelsToCanvas(mini, framePx, state.size);

    const lbl = document.createElement('span');
    lbl.className = 'pixel-frame-num';
    lbl.textContent = `#${idx + 1}`;

    btn.appendChild(mini);
    btn.appendChild(lbl);
    btn.addEventListener('click', () => {
      state.currentFrame = idx;
      redrawAll();
    });
    list.appendChild(btn);
  });
}

function renderPalette() {
  const wrap = document.getElementById('pixel-palette');
  if (!wrap) return;
  const pal = PIXEL_PALETTES[state.paletteKey] || PIXEL_PALETTES.pico8;
  wrap.innerHTML = '';
  for (const hex of pal.colors) {
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'palette-swatch' + (state.color.toLowerCase() === hex.toLowerCase() ? ' active' : '');
    sw.style.background = hex;
    sw.title = hex;
    sw.addEventListener('click', () => {
      selectColor(hex);
    });
    wrap.appendChild(sw);
  }
}

function renderRecentColors() {
  const wrap = document.getElementById('pixel-recent-colors');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (const hex of state.recentColors) {
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'palette-swatch swatch-sm' + (state.color.toLowerCase() === hex.toLowerCase() ? ' active' : '');
    sw.style.background = hex;
    sw.title = `Cor recente ${hex}`;
    sw.addEventListener('click', () => selectColor(hex));
    wrap.appendChild(sw);
  }
}

function selectColor(hex) {
  state.color = hex;
  const picker = document.getElementById('pixel-color-picker');
  if (picker) picker.value = hex;
  if (state.tool === 'eraser' || state.tool === 'eyedropper') {
    setTool('brush');
  }
  renderPalette();
  renderRecentColors();
}

function setTool(toolName) {
  state.tool = toolName;
  document.querySelectorAll('[data-pixel-tool]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.pixelTool === toolName);
  });
}

function syncSizeControl() {
  const sizeSel = document.getElementById('pixel-grid-size');
  if (sizeSel) sizeSel.value = String(state.size);
}

function redrawAll() {
  drawEditorCanvas();
  drawPreviewCanvas();
  renderTimeline();
}

// ==================== ANIMATION PLAYBACK ====================
function stopPlayback() {
  state.playing = false;
  if (state.playTimer) {
    clearInterval(state.playTimer);
    state.playTimer = null;
  }
  const btn = document.getElementById('pixel-play-btn');
  if (btn) btn.textContent = '▶ Reproduzir';
}

function togglePlayback() {
  if (state.playing) {
    stopPlayback();
    drawPreviewCanvas(state.currentFrame);
    return;
  }
  if (state.frames.length < 2) {
    showToast('Adicione pelo menos 2 quadros na linha do tempo para animar.', 'info', 2200);
    return;
  }
  state.playing = true;
  state.playFrameIdx = state.currentFrame;
  const btn = document.getElementById('pixel-play-btn');
  if (btn) btn.textContent = '⏸ Pausar';
  state.playTimer = setInterval(() => {
    state.playFrameIdx = (state.playFrameIdx + 1) % state.frames.length;
    drawPreviewCanvas(state.playFrameIdx);
  }, Math.round(1000 / Math.max(1, state.fps)));
}

// ==================== EXPORT / IMPORT ASSETS ====================
function exportSpriteSheetPNG(imgObj, name) {
  const frames = getSpriteFrames(imgObj);
  if (frames.length === 0) return;
  const size = imgObj.size || 16;
  const scale = Math.max(4, Math.floor(256 / size));
  const canvas = document.createElement('canvas');
  canvas.width = size * scale * frames.length;
  canvas.height = size * scale;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  frames.forEach((f, idx) => {
    const tmp = document.createElement('canvas');
    renderPixelsToCanvas(tmp, f, size);
    ctx.drawImage(tmp, idx * size * scale, 0, size * scale, size * scale);
  });

  const link = document.createElement('a');
  link.download = frames.length > 1 ? `${name}-spritesheet-${frames.length}f.png` : `${name}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast(frames.length > 1 ? `Sprite-sheet (${frames.length} quadros) baixado!` : `PNG "${name}.png" baixado!`, 'success');
}

function exportCurrentAssetJSON() {
  const key = (document.getElementById('image-key-input')?.value || 'sprite').trim() || 'sprite';
  const payload = {
    key,
    size: state.size,
    fps: state.fps,
    frames: state.frames,
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.download = `${key}.crabart.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  showToast(`Asset JSON "${key}.crabart.json" exportado!`, 'success');
}

function importPngToCurrentFrame(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      pushUndoSnapshot();
      const s = state.size;
      const tmp = document.createElement('canvas');
      tmp.width = s;
      tmp.height = s;
      const ctx = tmp.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, s, s);
      // Fit image centered preserving aspect ratio
      const ratio = Math.min(s / img.width, s / img.height);
      const dw = Math.max(1, Math.round(img.width * ratio));
      const dh = Math.max(1, Math.round(img.height * ratio));
      const dx = Math.floor((s - dw) / 2);
      const dy = Math.floor((s - dh) / 2);
      ctx.drawImage(img, dx, dy, dw, dh);
      const data = ctx.getImageData(0, 0, s, s).data;
      const pixels = [];
      for (let i = 0; i < s * s; i++) {
        pixels.push([data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]]);
      }
      setCurrentPixels(pixels);
      redrawAll();
      showToast(`Imagem "${file.name}" convertida para ${s}×${s}!`, 'success');
    };
    img.onerror = () => showToast('Não foi possível decodificar a imagem.', 'error');
    img.src = String(reader.result || '');
  };
  reader.readAsDataURL(file);
}

// ==================== MODAL OPEN / CLOSE / SAVE ====================
export function openImageModal(existingKey = null, presetObj = null) {
  stopPlayback();
  const modal = document.getElementById('image-modal');
  const keyInput = document.getElementById('image-key-input');
  const heading = document.getElementById('image-modal-heading');
  const fpsInput = document.getElementById('pixel-fps-input');
  const fpsVal = document.getElementById('pixel-fps-val');

  state.history = [];
  state.redoStack = [];
  state.currentFrame = 0;
  state.previewPoints = null;

  if (presetObj) {
    state.editingKey = null;
    state.size = presetObj.size || 16;
    state.fps = presetObj.fps || 6;
    state.frames = presetObj.frames.map(cloneFrame);
    if (keyInput) keyInput.value = presetObj.key;
    if (heading) heading.textContent = `Estúdio Pixel Art — Modelo: ${presetObj.name}`;
  } else if (existingKey) {
    const imgs = loadImages();
    const img = imgs[existingKey];
    if (img) {
      state.editingKey = existingKey;
      state.size = img.size || 16;
      state.fps = img.fps || 6;
      const loadedFrames = getSpriteFrames(img);
      state.frames = loadedFrames.length > 0 ? loadedFrames.map(cloneFrame) : [createEmptyFrame(state.size)];
      if (keyInput) keyInput.value = existingKey;
      if (heading) heading.textContent = `Editar Sprite — ${existingKey}`;
    }
  } else {
    state.editingKey = null;
    state.size = 16;
    state.fps = 6;
    state.frames = [createEmptyFrame(16)];
    if (keyInput) keyInput.value = '';
    if (heading) heading.textContent = 'Novo Sprite / Animação Pixel Art';
  }

  syncSizeControl();
  if (fpsInput) fpsInput.value = String(state.fps);
  if (fpsVal) fpsVal.textContent = String(state.fps);
  const brushSel = document.getElementById('pixel-brush-size');
  if (brushSel) brushSel.value = String(state.brushSize);
  const mirrorSel = document.getElementById('pixel-mirror-mode');
  if (mirrorSel) mirrorSel.value = state.mirror;
  const gridToggle = document.getElementById('pixel-grid-toggle');
  if (gridToggle) gridToggle.checked = !!state.showGrid;
  const onionToggle = document.getElementById('pixel-onion-toggle');
  if (onionToggle) onionToggle.checked = !!state.onionSkin;
  const paletteSel = document.getElementById('pixel-palette-select');
  if (paletteSel) paletteSel.value = state.paletteKey;
  const colorPicker = document.getElementById('pixel-color-picker');
  if (colorPicker) colorPicker.value = state.color;
  const alphaSlider = document.getElementById('pixel-alpha-slider');
  const alphaVal = document.getElementById('pixel-alpha-val');
  const alphaPct = Math.round((state.alpha / 255) * 100);
  if (alphaSlider) alphaSlider.value = String(alphaPct);
  if (alphaVal) alphaVal.textContent = `${alphaPct}%`;
  setTool('brush');
  renderPalette();
  renderRecentColors();
  redrawAll();

  if (modal) modal.style.display = 'flex';
  if (!existingKey && !presetObj && keyInput) setTimeout(() => keyInput.focus(), 40);
}

export function closeImageModal() {
  stopPlayback();
  const modal = document.getElementById('image-modal');
  if (modal) modal.style.display = 'none';
}

function saveCurrentSprite() {
  const keyInput = document.getElementById('image-key-input');
  const key = (keyInput?.value || '').trim().replace(/\s+/g, '_');
  if (!key) {
    showToast('Defina uma chave para o sprite (ex: nave, heroi, moeda).', 'error');
    keyInput?.focus();
    return;
  }
  if (!/^[a-zA-Z0-9_\-]+$/.test(key)) {
    showToast('Chave inválida. Use apenas letras, números, _ ou -.', 'error');
    keyInput?.focus();
    return;
  }

  const images = loadImages();
  if (state.editingKey && state.editingKey !== key) {
    delete images[state.editingKey];
  }
  images[key] = {
    size: state.size,
    fps: state.fps,
    frames: state.frames.map(cloneFrame),
    pixels: cloneFrame(state.frames[0]), // Backward compatibility
    updatedAt: new Date().toISOString(),
  };

  const res = saveImages(images);
  if (!res.ok) return;

  closeImageModal();
  renderImagesList();
  showToast(`Sprite "${key}" (${state.size}×${state.size}, ${state.frames.length} quadro${state.frames.length > 1 ? 's' : ''}) salvo!`, 'success');
}

// ==================== GALLERY & PRESETS BOARD ====================
function clearGalleryTimers() {
  for (const id of state.galleryTimers) clearInterval(id);
  state.galleryTimers = [];
}

function testSpriteInEditor(key) {
  const snippet = [
    `importe interface`,
    `execute cor de fundo 15 23 42`,
    `execute cor de texto 241 245 249`,
    `defina arte como sprite "${key}"`,
    `apresente "Sprite: ${key}" em destaque ajuste centro g`,
    `apresente arte em sprite ajuste centro g`,
  ].join('\n');
  if (typeof window.tryInEditor === 'function') {
    window.tryInEditor(snippet, true);
  }
}

function renderPresetsBoard() {
  const container = document.getElementById('pixel-presets-board');
  if (!container) return;
  container.innerHTML = '';

  for (const preset of PIXEL_PRESETS) {
    const card = document.createElement('div');
    card.className = 'preset-sprite-card';

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'preset-sprite-thumb';
    const canvas = document.createElement('canvas');
    renderPixelsToCanvas(canvas, preset.frames[0], preset.size);
    thumbWrap.appendChild(canvas);

    if (preset.frames.length > 1) {
      let fi = 0;
      const tid = setInterval(() => {
        fi = (fi + 1) % preset.frames.length;
        renderPixelsToCanvas(canvas, preset.frames[fi], preset.size);
      }, Math.round(1000 / (preset.fps || 4)));
      state.galleryTimers.push(tid);
    }

    const meta = document.createElement('div');
    meta.className = 'preset-sprite-meta';
    meta.innerHTML = `
      <div class="preset-sprite-name">${escapeHtml(preset.name)}</div>
      <div class="preset-sprite-sub">${escapeHtml(preset.category)} · ${preset.size}×${preset.size}${preset.frames.length > 1 ? ` · ${preset.frames.length} quadros` : ''}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'preset-sprite-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-sm btn-accent-soft';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => openImageModal(null, preset));

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-sm';
    saveBtn.textContent = 'Salvar';
    saveBtn.addEventListener('click', () => {
      const images = loadImages();
      images[preset.key] = {
        size: preset.size,
        fps: preset.fps,
        frames: preset.frames.map(cloneFrame),
        pixels: cloneFrame(preset.frames[0]),
        updatedAt: new Date().toISOString(),
      };
      if (saveImages(images).ok) {
        renderImagesList();
        showToast(`Preset "${preset.name}" salvo como "${preset.key}"!`, 'success', 2000);
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(saveBtn);

    card.appendChild(thumbWrap);
    card.appendChild(meta);
    card.appendChild(actions);
    container.appendChild(card);
  }
}

export function renderImagesList() {
  clearGalleryTimers();
  renderPresetsBoard();

  const container = document.getElementById('images-list');
  if (!container) return;
  const images = loadImages();
  const keys = Object.keys(images);

  if (keys.length === 0) {
    container.innerHTML = `<div class="empty-state-card">
      <div class="empty-state-title">Nenhum sprite salvo na sua biblioteca</div>
      <div class="empty-state-sub">Clique em <strong>＋ Novo Sprite</strong> para abrir o estúdio multi-quadros ou clique em <strong>Salvar</strong> em qualquer arte do Quadro de Pixel-Arts acima!</div>
    </div>`;
    return;
  }

  container.innerHTML = '';
  for (const key of keys) {
    const img = images[key];
    const frames = getSpriteFrames(img);
    const size = img.size || 16;

    const card = document.createElement('div');
    card.className = 'image-card';

    const previewWrap = document.createElement('div');
    previewWrap.className = 'image-card-preview';
    const canvas = document.createElement('canvas');
    if (frames.length > 0) renderPixelsToCanvas(canvas, frames[0], size);
    previewWrap.appendChild(canvas);

    if (frames.length > 1) {
      let fi = 0;
      const tid = setInterval(() => {
        fi = (fi + 1) % frames.length;
        renderPixelsToCanvas(canvas, frames[fi], size);
      }, Math.round(1000 / Math.max(1, img.fps || 6)));
      state.galleryTimers.push(tid);
    }

    const info = document.createElement('div');
    info.className = 'image-card-info';
    info.innerHTML = `
      <div class="image-card-key">${escapeHtml(key)}</div>
      <div class="image-card-meta">${size}×${size} · ${frames.length} quadro${frames.length > 1 ? 's' : ''}${frames.length > 1 ? ` · ${img.fps || 6} FPS` : ''}</div>
      <code class="image-card-usage">defina ${escapeHtml(key)} como sprite "${escapeHtml(key)}"</code>
    `;

    const actions = document.createElement('div');
    actions.className = 'image-card-actions';
    actions.innerHTML = `
      <button type="button" class="btn btn-sm btn-accent-soft" data-act="test">▶ Testar</button>
      <button type="button" class="btn btn-sm" data-act="edit">Editar</button>
      <button type="button" class="btn btn-sm" data-act="copy">Copiar código</button>
      <button type="button" class="btn btn-sm" data-act="png">PNG</button>
      <button type="button" class="btn btn-sm btn-danger-ghost" data-act="delete">Excluir</button>
    `;

    actions.querySelector('[data-act="test"]').addEventListener('click', () => testSpriteInEditor(key));
    actions.querySelector('[data-act="edit"]').addEventListener('click', () => openImageModal(key));
    actions.querySelector('[data-act="copy"]').addEventListener('click', async () => {
      await copyText(`defina ${key} como sprite "${key}"\napresente ${key} em sprite ajuste centro m`);
      showToast(`Código do sprite "${key}" copiado!`, 'success', 1600);
    });
    actions.querySelector('[data-act="png"]').addEventListener('click', () => exportSpriteSheetPNG(img, key));
    actions.querySelector('[data-act="delete"]').addEventListener('click', async () => {
      const ok = await showConfirm({
        title: 'Excluir sprite',
        message: `Deseja excluir permanentemente o sprite "${key}"?`,
        confirmText: 'Excluir',
        danger: true,
      });
      if (!ok) return;
      const cur = loadImages();
      delete cur[key];
      saveImages(cur);
      renderImagesList();
      showToast(`Sprite "${key}" excluído.`, 'info');
    });

    card.appendChild(previewWrap);
    card.appendChild(info);
    card.appendChild(actions);
    container.appendChild(card);
  }
}

// ==================== INIT STUDIO EVENTS ====================
export function initImagesTab() {
  window.__ccImages = loadImages();
  renderImagesList();

  document.getElementById('btn-new-image')?.addEventListener('click', () => openImageModal());
  document.getElementById('close-image-modal')?.addEventListener('click', closeImageModal);
  document.getElementById('save-image-btn')?.addEventListener('click', saveCurrentSprite);

  document.getElementById('image-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeImageModal();
  });

  // Drawing tools
  document.querySelectorAll('[data-pixel-tool]').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.dataset.pixelTool));
  });

  // Brush size
  document.getElementById('pixel-brush-size')?.addEventListener('change', (e) => {
    state.brushSize = Number(e.target.value) || 1;
  });

  // Mirror mode
  document.getElementById('pixel-mirror-mode')?.addEventListener('change', (e) => {
    state.mirror = e.target.value || 'off';
    drawEditorCanvas();
  });

  // Grid size (preserves art centered!)
  document.getElementById('pixel-grid-size')?.addEventListener('change', (e) => {
    const newSize = Number(e.target.value) || 16;
    if (newSize === state.size) return;
    pushUndoSnapshot();
    const oldSize = state.size;
    state.frames = state.frames.map(f => resizeFramePreserve(f, oldSize, newSize));
    state.size = newSize;
    redrawAll();
  });

  // Palette switcher
  document.getElementById('pixel-palette-select')?.addEventListener('change', (e) => {
    state.paletteKey = e.target.value || 'pico8';
    renderPalette();
  });

  // Color picker & Alpha
  document.getElementById('pixel-color-picker')?.addEventListener('input', (e) => {
    state.color = e.target.value;
    addRecentColor(state.color);
    renderPalette();
  });

  document.getElementById('pixel-alpha-slider')?.addEventListener('input', (e) => {
    const pct = Number(e.target.value) || 100;
    state.alpha = Math.round((pct / 100) * 255);
    const lbl = document.getElementById('pixel-alpha-val');
    if (lbl) lbl.textContent = `${pct}%`;
  });

  // Grid toggle & Onion Skinning
  document.getElementById('pixel-grid-toggle')?.addEventListener('change', (e) => {
    state.showGrid = !!e.target.checked;
    drawEditorCanvas();
  });

  document.getElementById('pixel-onion-toggle')?.addEventListener('change', (e) => {
    state.onionSkin = !!e.target.checked;
    drawEditorCanvas();
  });

  // Transforms
  document.getElementById('pixel-undo-btn')?.addEventListener('click', undo);
  document.getElementById('pixel-redo-btn')?.addEventListener('click', redo);
  document.getElementById('pixel-flip-h')?.addEventListener('click', () => {
    pushUndoSnapshot();
    setCurrentPixels(flipFrameH(currentPixels(), state.size));
    redrawAll();
  });
  document.getElementById('pixel-flip-v')?.addEventListener('click', () => {
    pushUndoSnapshot();
    setCurrentPixels(flipFrameV(currentPixels(), state.size));
    redrawAll();
  });
  document.getElementById('pixel-rot-cw')?.addEventListener('click', () => {
    pushUndoSnapshot();
    setCurrentPixels(rotateFrame90(currentPixels(), state.size, true));
    redrawAll();
  });
  document.getElementById('pixel-rot-ccw')?.addEventListener('click', () => {
    pushUndoSnapshot();
    setCurrentPixels(rotateFrame90(currentPixels(), state.size, false));
    redrawAll();
  });
  document.getElementById('pixel-outline-btn')?.addEventListener('click', () => {
    pushUndoSnapshot();
    setCurrentPixels(autoOutline(currentPixels(), state.size, hexToRgba(state.color, 255)));
    redrawAll();
  });
  document.getElementById('pixel-clear-btn')?.addEventListener('click', () => {
    pushUndoSnapshot();
    setCurrentPixels(createEmptyFrame(state.size));
    redrawAll();
  });
  document.getElementById('pixel-shift-up')?.addEventListener('click', () => { pushUndoSnapshot(); setCurrentPixels(shiftFrame(currentPixels(), state.size, 0, -1)); redrawAll(); });
  document.getElementById('pixel-shift-down')?.addEventListener('click', () => { pushUndoSnapshot(); setCurrentPixels(shiftFrame(currentPixels(), state.size, 0, 1)); redrawAll(); });
  document.getElementById('pixel-shift-left')?.addEventListener('click', () => { pushUndoSnapshot(); setCurrentPixels(shiftFrame(currentPixels(), state.size, -1, 0)); redrawAll(); });
  document.getElementById('pixel-shift-right')?.addEventListener('click', () => { pushUndoSnapshot(); setCurrentPixels(shiftFrame(currentPixels(), state.size, 1, 0)); redrawAll(); });

  // Multi-frame timeline controls
  document.getElementById('pixel-add-frame')?.addEventListener('click', () => {
    if (state.frames.length >= 24) { showToast('Máximo de 24 quadros por animação.', 'info'); return; }
    pushUndoSnapshot();
    state.frames.splice(state.currentFrame + 1, 0, createEmptyFrame(state.size));
    state.currentFrame++;
    redrawAll();
  });

  document.getElementById('pixel-dup-frame')?.addEventListener('click', () => {
    if (state.frames.length >= 24) { showToast('Máximo de 24 quadros por animação.', 'info'); return; }
    pushUndoSnapshot();
    state.frames.splice(state.currentFrame + 1, 0, cloneFrame(currentPixels()));
    state.currentFrame++;
    redrawAll();
  });

  document.getElementById('pixel-del-frame')?.addEventListener('click', () => {
    if (state.frames.length <= 1) {
      pushUndoSnapshot();
      setCurrentPixels(createEmptyFrame(state.size));
      redrawAll();
      return;
    }
    pushUndoSnapshot();
    state.frames.splice(state.currentFrame, 1);
    state.currentFrame = Math.max(0, state.currentFrame - 1);
    redrawAll();
  });

  document.getElementById('pixel-play-btn')?.addEventListener('click', togglePlayback);
  document.getElementById('pixel-fps-input')?.addEventListener('input', (e) => {
    state.fps = Math.max(1, Math.min(24, Number(e.target.value) || 6));
    const lbl = document.getElementById('pixel-fps-val');
    if (lbl) lbl.textContent = String(state.fps);
    if (state.playing) {
      stopPlayback();
      togglePlayback();
    }
  });

  // Export / Import buttons inside modal
  document.getElementById('pixel-export-png-btn')?.addEventListener('click', () => {
    const key = (document.getElementById('image-key-input')?.value || 'sprite').trim() || 'sprite';
    exportSpriteSheetPNG({ size: state.size, frames: state.frames }, key);
  });
  document.getElementById('pixel-export-json-btn')?.addEventListener('click', exportCurrentAssetJSON);

  const pngInput = document.getElementById('pixel-import-png-input');
  document.getElementById('pixel-import-png-btn')?.addEventListener('click', () => pngInput?.click());
  pngInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) importPngToCurrentFrame(file);
    e.target.value = '';
  });

  // Canvas pointer drawing
  const canvas = document.getElementById('pixel-canvas');
  if (canvas) {
    const coordsEl = document.getElementById('pixel-coords-readout');

    const computeShape = (x0, y0, x1, y1) => {
      if (state.tool === 'line') return bresenhamLine(x0, y0, x1, y1);
      if (state.tool === 'rect') return rectPixels(x0, y0, x1, y1, false);
      if (state.tool === 'rectfill') return rectPixels(x0, y0, x1, y1, true);
      if (state.tool === 'circle') return circlePixels(x0, y0, x1, y1, false);
      return [[x1, y1]];
    };

    const startDraw = (e) => {
      e.preventDefault();
      const [x, y] = getCanvasCoord(canvas, e);
      if (coordsEl) coordsEl.textContent = `(${x}, ${y}) · ${state.size}×${state.size}`;

      const pxArr = currentPixels();
      if (state.tool === 'eyedropper') {
        const picked = pxArr[y * state.size + x];
        if (picked && picked[3] > 0) {
          selectColor(rgbaToHex(picked));
          addRecentColor(rgbaToHex(picked));
        }
        return;
      }

      pushUndoSnapshot();
      const rgba = state.tool === 'eraser' ? [0, 0, 0, 0] : hexToRgba(state.color, state.alpha);

      if (state.tool === 'bucket') {
        setCurrentPixels(floodFill(pxArr, state.size, x, y, rgba));
        addRecentColor(state.color);
        redrawAll();
        return;
      }

      if (state.tool === 'replace') {
        const oldRgba = pxArr[y * state.size + x];
        setCurrentPixels(replaceColor(pxArr, oldRgba, rgba));
        addRecentColor(state.color);
        redrawAll();
        return;
      }

      state.isDrawing = true;
      state.dragStart = [x, y];

      if (state.tool === 'brush' || state.tool === 'eraser') {
        paintBrushAt(pxArr, x, y, rgba);
        if (state.tool === 'brush') addRecentColor(state.color);
        redrawAll();
      } else {
        state.previewPoints = computeShape(x, y, x, y);
        drawEditorCanvas();
      }
    };

    const moveDraw = (e) => {
      const [x, y] = getCanvasCoord(canvas, e);
      if (coordsEl) coordsEl.textContent = `(${x}, ${y}) · ${state.size}×${state.size}`;
      if (!state.isDrawing) return;
      e.preventDefault();

      if (state.tool === 'brush' || state.tool === 'eraser') {
        const rgba = state.tool === 'eraser' ? [0, 0, 0, 0] : hexToRgba(state.color, state.alpha);
        const [lx, ly] = state.dragStart || [x, y];
        const seg = bresenhamLine(lx, ly, x, y);
        for (const [px, py] of seg) paintBrushAt(currentPixels(), px, py, rgba);
        state.dragStart = [x, y];
        drawEditorCanvas();
        drawPreviewCanvas();
      } else if (state.dragStart) {
        state.previewPoints = computeShape(state.dragStart[0], state.dragStart[1], x, y);
        drawEditorCanvas();
      }
    };

    const endDraw = () => {
      if (!state.isDrawing) return;
      state.isDrawing = false;
      if (state.previewPoints && state.previewPoints.length > 0) {
        const rgba = hexToRgba(state.color, state.alpha);
        paintPointsList(currentPixels(), state.previewPoints, rgba);
        addRecentColor(state.color);
      }
      state.previewPoints = null;
      state.dragStart = null;
      redrawAll();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', moveDraw, { passive: false });
    window.addEventListener('touchend', endDraw);
  }

  // Pixel Art Studio keyboard shortcuts (only active while #image-modal is open & not typing in an input)
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('image-modal');
    if (!modal || modal.style.display === 'none') return;
    if (document.querySelector('.cc-confirm-overlay')) return;
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && k === 'y') {
      e.preventDefault();
      redo();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (k === 'b') { e.preventDefault(); setTool('brush'); }
    else if (k === 'e') { e.preventDefault(); setTool('eraser'); }
    else if (k === 'g') { e.preventDefault(); setTool('bucket'); }
    else if (k === 'i') { e.preventDefault(); setTool('eyedropper'); }
    else if (k === 'l') { e.preventDefault(); setTool('line'); }
  });
}
