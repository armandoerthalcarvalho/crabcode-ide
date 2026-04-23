// ============================================================
// CrabCode — Image / Pixel Art Editor
// Phase 13: Provides pixel art creation and management
// Images are persisted in localStorage under 'crabcode_images'
// as JSON: { [key]: { pixels: [r,g,b,a, ...], size: number, title: string } }
// ============================================================

const IMAGES_KEY = 'crabcode_images';

// ==================== Storage helpers ====================
function loadImages() {
  try { return JSON.parse(localStorage.getItem(IMAGES_KEY) || '{}'); } catch { return {}; }
}

function saveImages(images) {
  localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
}

// ==================== PixelArtEditor ====================
class PixelArtEditor {
  constructor(canvas, opts = {}) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._size = opts.size || 16;   // grid dimension (cells per side)
    this._tool = 'pincel';
    this._color = '#ff6b6b';
    this._painting = false;
    this._pixels = this._makePixels();
    this._cellSize = Math.floor(canvas.width / this._size);
    this._bindEvents();
    this.redraw();
  }

  // ==================== Public API ====================
  setTool(t) { this._tool = t; }
  setColor(c) { this._color = c; }

  setSize(s) {
    this._size = s;
    this._pixels = this._makePixels();
    this._cellSize = Math.floor(this._canvas.width / this._size);
    this.redraw();
  }

  clear() {
    this._pixels = this._makePixels();
    this.redraw();
  }

  load(pixels, size) {
    this._size = size;
    this._cellSize = Math.floor(this._canvas.width / this._size);
    this._pixels = pixels.slice();
    this.redraw();
  }

  getData() {
    return { pixels: this._pixels.slice(), size: this._size };
  }

  // ==================== Internals ====================
  _makePixels() {
    // Each pixel is [r, g, b, a] — default transparent
    return Array.from({ length: this._size * this._size }, () => [0, 0, 0, 0]);
  }

  _idx(col, row) { return row * this._size + col; }

  _hexToRgba(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  }

  _applyTool(col, row) {
    if (col < 0 || row < 0 || col >= this._size || row >= this._size) return;
    const idx = this._idx(col, row);
    if (this._tool === 'pincel') {
      this._pixels[idx] = this._hexToRgba(this._color);
      this._drawCell(col, row);
    } else if (this._tool === 'borracha') {
      this._pixels[idx] = [0, 0, 0, 0];
      this._drawCell(col, row);
    } else if (this._tool === 'balde') {
      const target = this._pixels[idx].slice();
      const fill = this._hexToRgba(this._color);
      if (this._colorsEqual(target, fill)) return;
      this._floodFill(col, row, target, fill);
      this.redraw();
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

  _colorsEqual(a, b) { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]; }

  _drawCell(col, row) {
    const cs = this._cellSize;
    const px = this._pixels[this._idx(col, row)];
    if (px[3] === 0) {
      // Transparent: draw checkerboard
      this._ctx.fillStyle = (col + row) % 2 === 0 ? '#e0e0e0' : '#c0c0c0';
    } else {
      this._ctx.fillStyle = `rgba(${px[0]},${px[1]},${px[2]},${px[3] / 255})`;
    }
    this._ctx.fillRect(col * cs, row * cs, cs, cs);
  }

  redraw() {
    const cs = this._cellSize;
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    for (let r = 0; r < this._size; r++) {
      for (let c = 0; c < this._size; c++) {
        this._drawCell(c, r);
      }
    }
    // Grid lines
    this._ctx.strokeStyle = 'rgba(100,100,100,0.15)';
    this._ctx.lineWidth = 0.5;
    for (let i = 0; i <= this._size; i++) {
      this._ctx.beginPath();
      this._ctx.moveTo(i * cs, 0);
      this._ctx.lineTo(i * cs, this._size * cs);
      this._ctx.stroke();
      this._ctx.beginPath();
      this._ctx.moveTo(0, i * cs);
      this._ctx.lineTo(this._size * cs, i * cs);
      this._ctx.stroke();
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
    this._canvas.addEventListener('mousedown', (e) => {
      this._painting = true;
      this._applyTool(...this._posFromEvent(e));
    });
    this._canvas.addEventListener('mousemove', (e) => {
      if (!this._painting) return;
      this._applyTool(...this._posFromEvent(e));
    });
    this._canvas.addEventListener('mouseup', () => { this._painting = false; });
    this._canvas.addEventListener('mouseleave', () => { this._painting = false; });

    // Touch support
    this._canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._painting = true;
      this._applyTool(...this._posFromEvent(e.touches[0]));
    }, { passive: false });
    this._canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this._painting) return;
      this._applyTool(...this._posFromEvent(e.touches[0]));
    }, { passive: false });
    this._canvas.addEventListener('touchend', () => { this._painting = false; });
  }
}

// ==================== Images Tab UI ====================
function initImagesTab() {
  const panel = document.getElementById('imagens-panel');
  if (!panel) return;

  document.getElementById('btn-new-image')?.addEventListener('click', () => openImageModal());
  document.getElementById('close-image-modal')?.addEventListener('click', closeImageModal);
  document.getElementById('save-image-btn')?.addEventListener('click', saveImageFromModal);
  document.getElementById('img-clear-btn')?.addEventListener('click', () => _editor?.clear());

  document.querySelectorAll('.img-tool').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.img-tool').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _editor?.setTool(btn.dataset.tool);
    });
  });

  document.getElementById('img-color-picker')?.addEventListener('input', (e) => {
    _editor?.setColor(e.target.value);
  });

  document.getElementById('img-grid-size')?.addEventListener('change', (e) => {
    _editor?.setSize(parseInt(e.target.value));
  });

  renderImagesList();
}

let _editor = null;
let _editingKey = null;

function openImageModal(existingKey = null) {
  const modal = document.getElementById('image-modal');
  if (!modal) return;

  _editingKey = existingKey;
  const keyInput = document.getElementById('img-modal-key');
  if (existingKey) {
    keyInput.value = existingKey;
    keyInput.readOnly = true;
  } else {
    keyInput.value = '';
    keyInput.readOnly = false;
  }

  modal.style.display = 'flex';
  const canvas = document.getElementById('pixel-canvas');
  const sizeSelect = document.getElementById('img-grid-size');
  const size = parseInt(sizeSelect?.value || '16');
  _editor = new PixelArtEditor(canvas, { size });

  if (existingKey) {
    const images = loadImages();
    const img = images[existingKey];
    if (img) {
      sizeSelect.value = String(img.size);
      _editor.load(img.pixels, img.size);
    }
  }
}

function closeImageModal() {
  const modal = document.getElementById('image-modal');
  if (modal) modal.style.display = 'none';
  _editor = null;
  _editingKey = null;
}

function saveImageFromModal() {
  const key = document.getElementById('img-modal-key')?.value?.trim();
  if (!key || !/^[a-zA-Z0-9_]{1,40}$/.test(key)) {
    alert('Key inválida. Use letras, números e underscore, sem espaços.');
    return;
  }
  if (!_editor) return;

  const data = _editor.getData();
  const images = loadImages();
  images[key] = { pixels: data.pixels, size: data.size };

  // Also expose on window for the sandbox (Phase 14 integration)
  if (!window.__ccImages) window.__ccImages = {};
  window.__ccImages[key] = images[key];

  saveImages(images);
  closeImageModal();
  renderImagesList();
}

function renderImagesList() {
  const list = document.getElementById('imagens-list');
  if (!list) return;
  const images = loadImages();
  const keys = Object.keys(images);

  if (keys.length === 0) {
    list.innerHTML = '<div style="padding:24px;color:var(--text-muted);font-size:13px;text-align:center;">Nenhuma imagem criada. Clique em <strong>+ Nova Imagem</strong> para começar.</div>';
    return;
  }

  list.innerHTML = '';
  for (const key of keys) {
    const img = images[key];
    const card = document.createElement('div');
    card.className = 'img-card';

    // Mini preview
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = img.size;
    previewCanvas.height = img.size;
    previewCanvas.style.cssText = 'image-rendering:pixelated;width:48px;height:48px;border:1px solid var(--border);flex-shrink:0;';
    _drawPreview(previewCanvas, img);

    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;';
    info.innerHTML = `<strong style="font-size:13px;color:var(--text-primary);">${key}</strong><br><span style="font-size:11px;color:var(--text-muted);">${img.size}×${img.size} px</span>`;

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:6px;flex-shrink:0;';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn';
    editBtn.textContent = '✏️ Editar';
    editBtn.style.fontSize = '12px';
    editBtn.addEventListener('click', () => openImageModal(key));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn';
    delBtn.textContent = '🗑';
    delBtn.style.fontSize = '12px';
    delBtn.addEventListener('click', () => {
      if (!confirm(`Apagar imagem "${key}"?`)) return;
      const imgs = loadImages();
      delete imgs[key];
      saveImages(imgs);
      renderImagesList();
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    card.appendChild(previewCanvas);
    card.appendChild(info);
    card.appendChild(actions);
    list.appendChild(card);
  }
}

function _drawPreview(canvas, img) {
  const ctx = canvas.getContext('2d');
  const id = ctx.createImageData(img.size, img.size);
  for (let i = 0; i < img.pixels.length; i++) {
    const px = img.pixels[i];
    id.data[i * 4]     = px[0];
    id.data[i * 4 + 1] = px[1];
    id.data[i * 4 + 2] = px[2];
    id.data[i * 4 + 3] = px[3];
  }
  ctx.putImageData(id, 0, 0);
}

export { initImagesTab, loadImages, saveImages, PixelArtEditor };
