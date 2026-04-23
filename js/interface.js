// ==================== INTERFACE RENDERER ====================
// Renders interface-mode output items into the interface-canvas element.
// Each run produces a fresh set of positioned elements.

class InterfaceRenderer {
  constructor(container) {
    this._container = container;
    this._itemCount = 0;
  }

  // Clear and render all items from a run
  render(outputItems, bgColor = null) {
    this._container.innerHTML = '';
    this._itemCount = 0;

    if (bgColor) {
      this._container.style.background = bgColor;
    } else {
      this._container.style.background = '';
    }

    for (const item of outputItems) {
      this._renderItem(item);
    }

    this._setupKeyboard();
  }

  _setupKeyboard() {
    // Remove any previous listener (stored on container)
    if (this._keydownHandler) {
      window.removeEventListener('keydown', this._keydownHandler);
      window.removeEventListener('keyup', this._keyupHandler);
    }
    this._keydownHandler = (e) => {
      if (!window.__ccTecla) window.__ccTecla = { valor: '', atual: '' };
      window.__ccTecla.valor = e.key;
      window.__ccTecla.atual = e.key;
      this._triggerRerun('keydown', { key: e.key });
    };
    this._keyupHandler = (e) => {
      if (!window.__ccTecla) window.__ccTecla = { valor: '', atual: '' };
      window.__ccTecla.atual = '';
    };
    window.addEventListener('keydown', this._keydownHandler);
    window.addEventListener('keyup', this._keyupHandler);
  }

  teardown() {
    if (this._keydownHandler) {
      window.removeEventListener('keydown', this._keydownHandler);
      window.removeEventListener('keyup', this._keyupHandler);
      this._keydownHandler = null;
      this._keyupHandler = null;
    }
  }

  _renderItem(item) {
    if (!item || typeof item !== 'object') return;

    switch (item.type) {
      case 'corDeFundo':
        this._container.style.background = `rgb(${item.r},${item.g},${item.b})`;
        break;
      case 'texto':
        this._renderBlock(item, 'iface-texto');
        break;
      case 'destaque':
        this._renderBlock(item, 'iface-destaque');
        break;
      case 'execute':
        this._renderBlock(item, 'iface-execute');
        break;
      case 'apresentação':
      case 'apresentacao':
        this._renderBlock(item, 'iface-apresentacao');
        break;
      case 'sprite':
        this._renderSprite(item);
        break;
      case 'botao':
        this._renderInteractive(item, 'botao');
        break;
      case 'toggle':
        this._renderInteractive(item, 'toggle');
        break;
      case 'slider':
        this._renderInteractive(item, 'slider');
        break;
      case 'seletor':
        this._renderInteractive(item, 'seletor');
        break;
      case 'digite':
        this._renderInteractive(item, 'digite');
        break;
      case 'pergunte':
        this._renderInteractive(item, 'pergunte');
        break;
      default:
        this._renderBlock(item, 'iface-item');
        break;
    }
  }

  _renderBlock(item, cssClass) {
    const el = document.createElement('div');
    el.className = `iface-block ${cssClass}`;

    // Apply position/size from yellow modifiers (Phase 5)
    if (item.yellow) {
      this._applyYellow(el, item.yellow);
    } else {
      // Default: stack vertically like STEM mode
      el.style.position = 'relative';
      el.style.width = '100%';
      el.style.marginBottom = '4px';
    }

    // Render value using innerHTML (Phase 11: HTML strings supported in interface mode)
    const val = item.value;
    let htmlStr;
    if (Array.isArray(val)) {
      htmlStr = val.join(', ');
    } else if (val === null || val === undefined) {
      htmlStr = '';
    } else if (typeof val === 'object') {
      htmlStr = JSON.stringify(val);
    } else {
      htmlStr = String(val);
    }
    // Sanitize: allow simple formatting tags only
    el.innerHTML = this._sanitizeHTML(htmlStr);

    // Apply text color from yellow modifiers
    if (item.yellow && item.yellow.corTexto) {
      const ct = item.yellow.corTexto;
      el.style.color = `rgb(${ct.r},${ct.g},${ct.b})`;
    }

    this._container.appendChild(el);
    this._itemCount++;
  }

  // Apply ajuste/grid positioning from yellow modifiers
  _applyYellow(el, yellow) {
    el.style.position = 'absolute';
    el.style.boxSizing = 'border-box';

    if (yellow.grid) {
      // grid: x, y, w, h (percent of container)
      const { x, y, w, h } = yellow.grid;
      el.style.left   = `${x - w / 2}%`;
      el.style.top    = `${y - h / 2}%`;
      el.style.width  = `${w}%`;
      el.style.height = `${h}%`;
    } else if (yellow.ajuste) {
      const { pos, tam } = yellow.ajuste;
      const sizes = { ppp: 5, pp: 10, p: 25, m: 40, g: 60, gg: 80, ggg: 100 };
      const sz = sizes[tam] ?? 40;

      el.style.width  = `${sz}%`;
      el.style.height = 'auto';
      el.style.minHeight = '5%';

      // Horizontal positions
      const posMap = {
        esquerda:       `left: 0%; transform: none;`,
        centroesquerda: `left: 25%; transform: translateX(-50%);`,
        centro:         `left: 50%; transform: translateX(-50%);`,
        centrodireita:  `left: 75%; transform: translateX(-50%);`,
        direita:        `right: 0%; transform: none;`,
      };
      const posStyle = posMap[pos] || posMap.centro;
      posStyle.split(';').forEach(rule => {
        const [prop, val] = rule.split(':');
        if (prop && val) el.style[prop.trim()] = val.trim();
      });
    } else {
      // No positioning info — fall back to stacked
      el.style.position = 'relative';
      el.style.width = '100%';
    }
  }

  // Return full HTML snapshot for export
  getHTMLSnapshot() {
    return this._container.outerHTML;
  }

  // ==================== Sprite rendering ====================
  _renderSprite(item) {
    const spriteKey = item.spriteKey;
    const sprites = window.__ccSprites || {};
    const def = sprites[spriteKey];
    if (!def) return;

    const yellow = item.yellow || {};
    const { x, y, w, h } = yellow.grid
      ? yellow.grid
      : { x: 50, y: 50, w: 20, h: 20 };
    const color = yellow.corTexto
      ? `rgb(${yellow.corTexto.r},${yellow.corTexto.g},${yellow.corTexto.b})`
      : 'var(--color-amarelo)';

    const el = document.createElement('div');
    el.style.cssText = `position:absolute;left:${x - w / 2}%;top:${y - h / 2}%;width:${w}%;height:${h}%;overflow:hidden;`;

    if (def.kind === 'reto') {
      el.innerHTML = this._buildPolygonSVG(def.points, color);
    } else if (def.kind === 'curvo') {
      el.innerHTML = this._buildCircleSVG(color);
    } else if (def.kind === 'image') {
      el.innerHTML = this._buildImageSVG(def.imageKey);
    }

    this._container.appendChild(el);
    this._itemCount++;
  }

  _buildPolygonSVG(points, color) {
    // Normalize points to 0–100 bounding box
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scaled = points.map(p => [
      ((p[0] - minX) / rangeX * 100).toFixed(2),
      ((p[1] - minY) / rangeY * 100).toFixed(2),
    ]);
    const ptStr = scaled.map(p => p.join(',')).join(' ');
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><polygon points="${ptStr}" fill="${color}" /></svg>`;
  }

  _buildCircleSVG(color) {
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="${color}" /></svg>`;
  }

  _buildImageSVG(imageKey) {
    // Phase 14: render pixel art canvas from localStorage
    try {
      const stored = localStorage.getItem('crabcode_images');
      if (!stored) return '';
      const images = JSON.parse(stored);
      const img = images[imageKey];
      if (!img) return '';
      // pixels is array of [r,g,b,a] entries; size is cells per side
      const size = img.size || 16;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      canvas.style.cssText = 'width:100%;height:100%;image-rendering:pixelated;';
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(size, size);
      const pixels = img.pixels || img.data || [];
      for (let i = 0; i < pixels.length; i++) {
        const px = pixels[i];
        if (Array.isArray(px)) {
          imageData.data[i * 4]     = px[0];
          imageData.data[i * 4 + 1] = px[1];
          imageData.data[i * 4 + 2] = px[2];
          imageData.data[i * 4 + 3] = px[3];
        } else {
          imageData.data[i] = px;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      return canvas.outerHTML;
    } catch (e) {
      return '';
    }
  }

  // ==================== Interactive elements ====================
  _renderInteractive(item, kind) {
    const elemKey = item.elemKey;
    const elements = window.__ccElements || {};
    const def = elements[elemKey] || { kind, label: elemKey, extra: [] };
    const yellow = item.yellow || {};

    const wrapper = document.createElement('div');
    wrapper.className = 'iface-block iface-interactive';
    this._applyYellow(wrapper, yellow);

    let el;
    if (kind === 'botao') {
      el = document.createElement('button');
      el.textContent = def.label || elemKey;
      el.className = 'iface-btn';
      el.addEventListener('click', () => this._triggerRerun('click', { key: elemKey }));
    } else if (kind === 'toggle') {
      el = document.createElement('label');
      el.className = 'iface-toggle-label';
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = def.valor === true || def.valor === 'true';
      chk.addEventListener('change', () => {
        if (window.__ccElements && window.__ccElements[elemKey]) {
          window.__ccElements[elemKey].valor = chk.checked;
        }
        this._triggerRerun('change', { key: elemKey });
      });
      el.appendChild(chk);
      el.append(document.createTextNode(' ' + (def.label || elemKey)));
    } else if (kind === 'slider') {
      el = document.createElement('div');
      el.className = 'iface-slider-wrapper';
      const lbl = document.createElement('span');
      lbl.textContent = (def.label || elemKey) + ': ';
      const inp = document.createElement('input');
      inp.type = 'range';
      inp.min = def.extra[0] ?? 0;
      inp.max = def.extra[1] ?? 100;
      inp.value = def.valor ?? inp.min;
      const val = document.createElement('span');
      val.textContent = inp.value;
      inp.addEventListener('input', () => {
        val.textContent = inp.value;
        if (window.__ccElements && window.__ccElements[elemKey]) {
          window.__ccElements[elemKey].valor = Number(inp.value);
        }
        this._triggerRerun('input', { key: elemKey });
      });
      el.appendChild(lbl); el.appendChild(inp); el.appendChild(val);
    } else if (kind === 'seletor') {
      el = document.createElement('select');
      el.className = 'iface-select';
      for (const opt of (def.extra || [])) {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt;
        if (String(def.valor) === String(opt)) o.selected = true;
        el.appendChild(o);
      }
      el.addEventListener('change', () => {
        if (window.__ccElements && window.__ccElements[elemKey]) {
          window.__ccElements[elemKey].valor = el.value;
        }
        this._triggerRerun('change', { key: elemKey });
      });
    } else if (kind === 'digite') {
      el = document.createElement('input');
      el.type = 'text';
      el.className = 'iface-input';
      el.placeholder = def.label || elemKey;
      el.value = String(def.valor || '');
      el.addEventListener('input', () => {
        if (window.__ccElements && window.__ccElements[elemKey]) {
          window.__ccElements[elemKey].valor = el.value;
        }
        this._triggerRerun('input', { key: elemKey });
      });
    } else if (kind === 'pergunte') {
      el = document.createElement('div');
      el.className = 'iface-pergunte';
      const q = document.createElement('div');
      q.className = 'iface-pergunte-q';
      q.textContent = def.label || elemKey;
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'iface-input';
      inp.value = String(def.valor || '');
      const btn = document.createElement('button');
      btn.textContent = 'OK';
      btn.className = 'iface-btn';
      btn.addEventListener('click', () => {
        if (window.__ccElements && window.__ccElements[elemKey]) {
          window.__ccElements[elemKey].valor = inp.value;
        }
        this._triggerRerun('submit', { key: elemKey });
      });
      el.appendChild(q); el.appendChild(inp); el.appendChild(btn);
    }

    if (el) wrapper.appendChild(el);
    this._container.appendChild(wrapper);
    this._itemCount++;
  }

  _triggerRerun(eventType, data) {
    // Signal main.js to re-run the program
    window.dispatchEvent(new CustomEvent('crab-rerun', { detail: { eventType, data } }));
  }

  // Sanitize HTML: strip all tags except safe formatting ones
  _sanitizeHTML(str) {
    const ALLOWED = /^(b|i|u|s|em|strong|span|br|small|sub|sup|mark)$/i;
    const div = document.createElement('div');
    div.textContent = str; // escape everything first
    // Then selectively re-allow safe tags by re-parsing
    const raw = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Allow <b>, <i>, <u>, <s>, <em>, <strong>, <br>, <small>, <sub>, <sup>, <mark>
    return raw.replace(/&lt;(\/?)(b|i|u|s|em|strong|span|br|small|sub|sup|mark)(\s[^&]*?)?&gt;/gi,
      (_, slash, tag) => `<${slash}${tag}>`);
  }

  // Show the interface canvas, hide normal output children
  static show(outputBody) {
    let canvas = document.getElementById('interface-canvas');
    if (!canvas) return null;
    canvas.style.display = 'block';
    // Hide placeholder / STEM items
    for (const child of outputBody.children) {
      if (child.id !== 'interface-canvas') {
        child.style.display = 'none';
      }
    }
    return canvas;
  }

  // Hide the interface canvas, restore normal output children
  static hide(outputBody) {
    let canvas = document.getElementById('interface-canvas');
    if (canvas) canvas.style.display = 'none';
    for (const child of outputBody.children) {
      if (child.id !== 'interface-canvas') {
        child.style.display = '';
      }
    }
  }
}

export { InterfaceRenderer };
