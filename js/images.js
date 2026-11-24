// ============================================================
// CrabCode — Pixel Art Studio (Vanilla JS + HTML5 Canvas)
// Persists sprites in localStorage ('crabcode_images') & window.__ccImages
// Features: Brush, Eraser, Flood Fill, Eyedropper, Horizontal Mirror,
// Undo/Redo stack, Curated Palette, Live Preview, PNG Export, Copy Snippet
// ============================================================

import { escapeHtml } from './utils.js';
import { showToast, showConfirm, copyText } from './ui.js';

const IMAGES_KEY = 'crabcode_images';

const PRESET_PALETTE = [
  '#0f172a', '#ffffff', '#ef4444', '#f97316',
  '#facc15', '#22c55e', '#14b8a6', '#38bdf8',
  '#3b82f6', '#8b5cf6', '#ec4899', '#a855f7',
  '#94a3b8', '#475569', '#fbbf24', '#fb7185',
];

function loadImages() {
  try { return JSON.parse(localStorage.getItem(IMAGES_KEY) || '{}'); } catch { return {}; }
}

function saveImages(images) {
  localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  window.__ccImages = images;
}

class PixelArtEditor {
  constructor(canvas, opts = {}) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._size = opts.size || 16;
    this._tool = 'pincel';
    this._color = opts.color || '#f97316';
    this._mirror = false;
    this._showGrid = true;
    this._painting = false;
    this._onChange = opts.onChange || null;
    this._onColorPick = opts.onColorPick || null;
    this._pixels = this._makePixels();
    this._history = [];
    this._redoStack = [];
    this._strokeSnapshot = null;
    this._abort = new AbortController();
    this._cellSize = this._canvas.width / this._size;
    this._bindEvents();
    this.redraw();
  }

  destroy() {
    this._abort.abort();
  }

  setTool(t) { this._tool = t; }
  setColor(c) { this._color = c; }
  setMirror(flag) { this._mirror = Boolean(flag); }
  setShowGrid(flag) { this._showGrid = Boolean(flag); this.redraw(); }

  setSize(s) {
    this._pushHistory();
    this._size = s;
    this._pixels = this._makePixels();
    this._cellSize = this._canvas.width / this._size;
    this.redraw();
    this._emitChange();
  }

  clear() {
    this._pushHistory();
    this._pixels = this._makePixels();
    this.redraw();
    this._emitChange();
  }

  load(pixels, size) {
    this._size = size;
    this._cellSize = this._canvas.width / this._size;
    this._pixels = pixels.map(px => Array.isArray(px) ? px.slice() : [0, 0, 0, 0]);
    this._history = [];
    this._redoStack = [];
    this.redraw();
    this._emitChange();
  }

  getData() {
    return { pixels: this._pixels.map(px => px.slice()), size: this._size };
  }

  undo() {
    if (this._history.length === 0) return false;
    this._redoStack.push({ size: this._size, pixels: this._clonePixels() });
    const prev = this._history.pop();
    this._size = prev.size;
    this._cellSize = this._canvas.width / this._size;
    this._pixels = prev.pixels;
    this.redraw();
    this._emitChange();
    return true;
  }

  redo() {
    if (this._redoStack.length === 0) return false;
    this._history.push({ size: this._size, pixels: this._clonePixels() });
    const next = this._redoStack.pop();
    this._size = next.size;
    this._cellSize = this._canvas.width / this._size;
    this._pixels = next.pixels;
    this.redraw();
    this._emitChange();
    return true;
  }

  canUndo() { return this._history.length > 0; }
  canRedo() { return this._redoStack.length > 0; }

  toDataURL(scale = 8) {
    const out = document.createElement('canvas');
    out.width = this._size * scale;
    out.height = this._size * scale;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = false;
    const src = document.createElement('canvas');
    src.width = this._size;
    src.height = this._size;
    const sctx = src.getContext('2d');
    const id = sctx.createImageData(this._size, this._size);
    for (let i = 0; i < this._pixels.length; i++) {
      const px = this._pixels[i];
      id.data[i * 4]     = px[0];
      id.data[i * 4 + 1] = px[1];
      id.data[i * 4 + 2] = px[2];
      id.data[i * 4 + 3] = px[3];
    }
    sctx.putImageData(id, 0, 0);
    octx.drawImage(src, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  }

  _clonePixels() {
    return this._pixels.map(px => px.slice());
  }

  _pushHistory(snapshot = null) {
    this._history.push(snapshot || { size: this._size, pixels: this._clonePixels() });
    if (this._history.length > 40) this._history.shift();
    this._redoStack = [];
  }

  _emitChange() {
    if (typeof this._onChange === 'function') this._onChange(this.getData());
  }

  _makePixels() {
    return Array.from({ length: this._size * this._size }, () => [0, 0, 0, 0]);
  }

  _idx(col, row) { return row * this._size + col; }

  _hexToRgba(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  }

  _rgbaToHex(px) {
    return '#' + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  _paintSingle(col, row, rgba) {
    if (col < 0 || row < 0 || col >= this._size || row >= this._size) return;
    this._pixels[this._idx(col, row)] = rgba.slice();
    this._drawCell(col, row);
    if (this._mirror) {
      const mCol = this._size - 1 - col;
      this._pixels[this._idx(mCol, row)] = rgba.slice();
      this._drawCell(mCol, row);
    }
  }

  _applyTool(col, row) {
    if (col < 0 || row < 0 || col >= this._size || row >= this._size) return;
    const idx = this._idx(col, row);

    if (this._tool === 'contagotas') {
      const px = this._pixels[idx];
      if (px[3] > 0) {
        const hex = this._rgbaToHex(px);
        this._color = hex;
        if (this._onColorPick) this._onColorPick(hex);
      }
      return;
    }

    if (this._tool === 'pincel') {
      this._paintSingle(col, row, this._hexToRgba(this._color));
      this._emitChange();
    } else if (this._tool === 'borracha') {
      this._paintSingle(col, row, [0, 0, 0, 0]);
      this._emitChange();
    } else if (this._tool === 'balde') {
      const target = this._pixels[idx].slice();
      const fill = this._hexToRgba(this._color);
      if (this._colorsEqual(target, fill)) return;
      this._floodFill(col, row, target, fill);
      this.redraw();
      this._emitChange();
    }
  }

  _floodFill(col, row, target, fill) {
    const stack = [[col, row]];
    const visited = new Uint8Array(this._size * this._size);
    while (stack.length) {
      const [c, r] = stack.pop();
      if (c < 0 || r < 0 || c >= this._size || r >= this._size) continue;
      const i = this._idx(c, r);
      if (visited[i]) continue;
      if (!this._colorsEqual(this._pixels[i], target)) continue;
      visited[i] = 1;
      this._pixels[i] = fill.slice();
      stack.push([c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]);
    }
  }

  _colorsEqual(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }

  _drawCell(col, row) {
    const cs = this._cellSize;
    const px = this._pixels[this._idx(col, row)];
    const x = Math.floor(col * cs);
    const y = Math.floor(row * cs);
    const w = Math.ceil((col + 1) * cs) - x;
    const h = Math.ceil((row + 1) * cs) - y;

    if (px[3] === 0) {
      this._ctx.fillStyle = (col + row) % 2 === 0 ? '#2b3040' : '#232736';
    } else {
      this._ctx.fillStyle = `rgba(${px[0]},${px[1]},${px[2]},${px[3] / 255})`;
    }
    this._ctx.fillRect(x, y, w, h);

    if (this._showGrid) {
      this._ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      this._ctx.lineWidth = 0.5;
      this._ctx.strokeRect(x + 0.25, y + 0.25, w - 0.5, h - 0.5);
    }
  }

  redraw() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    for (let r = 0; r < this._size; r++) {
      for (let c = 0; c < this._size; c++) {
        this._drawCell(c, r);
      }
    }
    if (this._mirror) {
      const mid = this._canvas.width / 2;
      this._ctx.strokeStyle = 'rgba(249,115,22,0.55)';
      this._ctx.lineWidth = 1.5;
      this._ctx.setLineDash([4, 4]);
      this._ctx.beginPath();
      this._ctx.moveTo(mid, 0);
      this._ctx.lineTo(mid, this._canvas.height);
      this._ctx.stroke();
      this._ctx.setLineDash([]);
    }
  }

  _posFromEvent(e) {
    const rect = this._canvas.getBoundingClientRect();
    const scaleX = this._canvas.width / rect.width;
    const scaleY = this._canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return [Math.floor(x / this._cellSize), Math.floor(y / this._cellSize)];
  }

  _bindEvents() {
    const sig = { signal: this._abort.signal };

    const startStroke = (pt) => {
      if (this._tool !== 'contagotas') {
        this._strokeSnapshot = { size: this._size, pixels: this._clonePixels() };
      }
      this._painting = true;
      this._applyTool(pt[0], pt[1]);
    };

    const endStroke = () => {
      if (this._painting && this._strokeSnapshot) {
        this._pushHistory(this._strokeSnapshot);
        this._strokeSnapshot = null;
        this._emitChange();
      }
      this._painting = false;
    };

    this._canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      startStroke(this._posFromEvent(e));
    }, sig);

    this._canvas.addEventListener('mousemove', (e) => {
      if (!this._painting || this._tool === 'balde' || this._tool === 'contagotas') return;
      const [c, r] = this._posFromEvent(e);
      this._applyTool(c, r);
    }, sig);

    window.addEventListener('mouseup', endStroke, sig);

    this._canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startStroke(this._posFromEvent(e.touches[0]));
    }, { passive: false, signal: this._abort.signal });

    this._canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this._painting || this._tool === 'balde' || this._tool === 'contagotas') return;
      const [c, r] = this._posFromEvent(e.touches[0]);
      this._applyTool(c, r);
    }, { passive: false, signal: this._abort.signal });

    this._canvas.addEventListener('touchend', endStroke, sig);
  }
}

// ==================== Images Tab UI ====================
let _editor = null;
let _editingKey = null;

function _updateLivePreview(data) {
  const preview = document.getElementById('pixel-live-preview');
  if (!preview || !data) return;
  preview.width = data.size;
  preview.height = data.size;
  _drawPreview(preview, data);

  const undoBtn = document.getElementById('img-undo-btn');
  const redoBtn = document.getElementById('img-redo-btn');
  if (undoBtn && _editor) undoBtn.disabled = !_editor.canUndo();
  if (redoBtn && _editor) redoBtn.disabled = !_editor.canRedo();
}

function initImagesTab() {
  const panel = document.getElementById('imagens-panel');
  if (!panel) return;

  document.getElementById('btn-new-image')?.addEventListener('click', () => openImageModal());
  document.getElementById('close-image-modal')?.addEventListener('click', closeImageModal);
  document.getElementById('save-image-btn')?.addEventListener('click', saveImageFromModal);
  document.getElementById('img-clear-btn')?.addEventListener('click', () => _editor?.clear());
  document.getElementById('img-undo-btn')?.addEventListener('click', () => _editor?.undo());
  document.getElementById('img-redo-btn')?.addEventListener('click', () => _editor?.redo());

  document.getElementById('img-mirror-btn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    btn.classList.toggle('active');
    const on = btn.classList.contains('active');
    _editor?.setMirror(on);
    _editor?.redraw();
  });

  document.getElementById('img-export-png-btn')?.addEventListener('click', () => {
    if (!_editor) return;
    const key = document.getElementById('img-modal-key')?.value?.trim() || 'sprite';
    const link = document.createElement('a');
    link.download = `${key}.png`;
    link.href = _editor.toDataURL(16);
    link.click();
    showToast(`Sprite "${key}.png" exportado!`, 'success');
  });

  document.querySelectorAll('.img-tool').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.img-tool').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _editor?.setTool(btn.dataset.tool);
    });
  });

  const colorPicker = document.getElementById('img-color-picker');
  colorPicker?.addEventListener('input', (e) => {
    _editor?.setColor(e.target.value);
  });

  // Render curated palette swatches
  const paletteEl = document.getElementById('pixel-palette');
  if (paletteEl) {
    paletteEl.innerHTML = '';
    for (const hex of PRESET_PALETTE) {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'palette-swatch';
      sw.style.background = hex;
      sw.title = hex;
      sw.addEventListener('click', () => {
        if (colorPicker) colorPicker.value = hex;
        _editor?.setColor(hex);
      });
      paletteEl.appendChild(sw);
    }
  }

  document.getElementById('img-grid-size')?.addEventListener('change', (e) => {
    _editor?.setSize(parseInt(e.target.value, 10));
  });

  // Keyboard Undo/Redo inside image modal
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('image-modal');
    if (!modal || modal.style.display === 'none' || !_editor) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) _editor.redo();
      else _editor.undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      _editor.redo();
    }
  });

  // Close modal on overlay click
  document.getElementById('image-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeImageModal();
  });

  renderImagesList();
}

function openImageModal(existingKey = null) {
  const modal = document.getElementById('image-modal');
  if (!modal) return;

  if (_editor) {
    _editor.destroy();
    _editor = null;
  }

  _editingKey = existingKey;
  const keyInput = document.getElementById('img-modal-key');
  const titleEl = document.getElementById('image-modal-title');
  if (existingKey) {
    keyInput.value = existingKey;
    keyInput.readOnly = true;
    if (titleEl) titleEl.textContent = `Editar Sprite — ${existingKey}`;
  } else {
    keyInput.value = '';
    keyInput.readOnly = false;
    if (titleEl) titleEl.textContent = 'Novo Sprite de Pixel Art';
  }

  // Reset tool buttons to pincel & mirror off
  document.querySelectorAll('.img-tool').forEach(b => b.classList.toggle('active', b.dataset.tool === 'pincel'));
  document.getElementById('img-mirror-btn')?.classList.remove('active');

  modal.style.display = 'flex';
  const canvas = document.getElementById('pixel-canvas');
  const sizeSelect = document.getElementById('img-grid-size');
  const colorPicker = document.getElementById('img-color-picker');
  const size = parseInt(sizeSelect?.value || '16', 10);

  _editor = new PixelArtEditor(canvas, {
    size,
    color: colorPicker?.value || '#f97316',
    onChange: (data) => _updateLivePreview(data),
    onColorPick: (hex) => {
      if (colorPicker) colorPicker.value = hex;
      // Switch back to pincel for immediate painting
      document.querySelectorAll('.img-tool').forEach(b => b.classList.toggle('active', b.dataset.tool === 'pincel'));
      _editor?.setTool('pincel');
      showToast(`Cor capturada: ${hex}`, 'info', 1600);
    },
  });

  if (existingKey) {
    const images = loadImages();
    const img = images[existingKey];
    if (img) {
      if (sizeSelect) sizeSelect.value = String(img.size);
      _editor.load(img.pixels, img.size);
    }
  } else {
    _updateLivePreview(_editor.getData());
  }
}

function closeImageModal() {
  const modal = document.getElementById('image-modal');
  if (modal) modal.style.display = 'none';
  if (_editor) {
    _editor.destroy();
    _editor = null;
  }
  _editingKey = null;
}

function saveImageFromModal() {
  const keyInput = document.getElementById('img-modal-key');
  const key = keyInput?.value?.trim();
  if (!key || !/^[a-zA-Z_][a-zA-Z0-9_]{0,39}$/.test(key)) {
    showToast('Chave inválida. Comece com letra/_ e use apenas letras, números e _.', 'error');
    keyInput?.focus();
    return;
  }
  if (!_editor) return;

  const data = _editor.getData();
  const images = loadImages();
  images[key] = { pixels: data.pixels, size: data.size };

  saveImages(images);
  closeImageModal();
  renderImagesList();
  showToast(`Sprite "${key}" salvo! Use: defina meu_sprite como sprite "${key}"`, 'success');
}

function renderImagesList() {
  const list = document.getElementById('imagens-list');
  if (!list) return;
  const images = loadImages();
  const keys = Object.keys(images);

  if (keys.length === 0) {
    list.innerHTML = `<div class="empty-state-card">
      <div class="empty-state-title">Nenhum sprite criado ainda</div>
      <div class="empty-state-sub">Crie sprites de pixel art (8×8, 16×16 ou 32×32) e renderize no modo Interface com <code>sprite "chave"</code>.</div>
    </div>`;
    return;
  }

  list.innerHTML = '';
  for (const key of keys) {
    const img = images[key];
    const card = document.createElement('div');
    card.className = 'img-card';

    const previewWrap = document.createElement('div');
    previewWrap.className = 'img-card-preview';
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = img.size;
    previewCanvas.height = img.size;
    _drawPreview(previewCanvas, img);
    previewWrap.appendChild(previewCanvas);

    const info = document.createElement('div');
    info.className = 'img-card-info';
    info.innerHTML = `<strong>${escapeHtml(key)}</strong><span>${img.size}×${img.size} px · sprite "${escapeHtml(key)}"</span>`;

    const actions = document.createElement('div');
    actions.className = 'img-card-actions';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn btn-sm';
    copyBtn.textContent = 'Copiar uso';
    copyBtn.addEventListener('click', async () => {
      const snippet = `defina ${key} como sprite "${key}"\napresente ${key} em sprite ajuste centro m`;
      await copyText(snippet);
      showToast(`Código do sprite "${key}" copiado!`, 'success');
    });

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-sm';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => openImageModal(key));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn btn-sm btn-danger-ghost';
    delBtn.textContent = 'Excluir';
    delBtn.addEventListener('click', async () => {
      const ok = await showConfirm({
        title: 'Excluir sprite',
        message: `Deseja apagar permanentemente o sprite "${key}"?`,
        confirmText: 'Excluir',
        danger: true,
      });
      if (!ok) return;
      const imgs = loadImages();
      delete imgs[key];
      saveImages(imgs);
      renderImagesList();
      showToast(`Sprite "${key}" removido.`, 'info');
    });

    actions.appendChild(copyBtn);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    card.appendChild(previewWrap);
    card.appendChild(info);
    card.appendChild(actions);
    list.appendChild(card);
  }
}

function _drawPreview(canvas, img) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, img.size, img.size);
  const id = ctx.createImageData(img.size, img.size);
  const pixels = img.pixels || [];
  for (let i = 0; i < pixels.length; i++) {
    const px = pixels[i];
    if (!Array.isArray(px)) continue;
    id.data[i * 4]     = px[0];
    id.data[i * 4 + 1] = px[1];
    id.data[i * 4 + 2] = px[2];
    id.data[i * 4 + 3] = px[3];
  }
  ctx.putImageData(id, 0, 0);
}

export { initImagesTab, loadImages, saveImages, PixelArtEditor };
