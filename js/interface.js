// ==================== INTERFACE RENDERER ====================
// Renders interface-mode output items into #interface-canvas cleanly.
// Fixes: pixel art dataURL rendering, non-overlapping ajuste flow, corDeTexto,
// sprite com cor + ajuste, keyboard isolation from editor/inputs, and button event dispatch.

class InterfaceRenderer {
  constructor(container) {
    this._container = container;
    this._itemCount = 0;
  }

  render(outputItems, bgColor = null) {
    this._container.innerHTML = '';
    this._itemCount = 0;

    this._container.style.background = bgColor || '';
    this._container.style.color = '';

    // Apply global text color if execute cor de texto was emitted
    const textColItem = [...outputItems].reverse().find(o => o && o.type === 'corDeTexto');
    if (textColItem) {
      this._container.style.color = `rgb(${textColItem.r},${textColItem.g},${textColItem.b})`;
    }

    // Flow wrapper for non-grid items so `ajuste` elements never stack on top of each other
    this._flowWrap = document.createElement('div');
    this._flowWrap.className = 'iface-flow';
    this._container.appendChild(this._flowWrap);

    for (const item of outputItems) {
      this._renderItem(item);
    }

    this._setupKeyboard();
  }

  _setupKeyboard() {
    if (this._keydownHandler) {
      window.removeEventListener('keydown', this._keydownHandler);
      window.removeEventListener('keyup', this._keyupHandler);
    }
    this._keydownHandler = (e) => {
      // Never hijack typing inside editor, inputs, textareas, or selects
      const active = document.activeElement;
      if (active && (
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'INPUT' ||
        active.tagName === 'SELECT' ||
        active.isContentEditable
      )) {
        return;
      }
      if (!window.__ccTecla) window.__ccTecla = { valor: '', atual: '' };
      window.__ccTecla.valor = e.key;
      window.__ccTecla.atual = e.key;
      this._triggerRerun('keydown', { key: e.key });
    };
    this._keyupHandler = () => {
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
      case 'corDeTexto':
        this._container.style.color = `rgb(${item.r},${item.g},${item.b})`;
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
      case 'toggle':
      case 'slider':
      case 'seletor':
      case 'digite':
      case 'pergunte':
        this._renderInteractive(item, item.type);
        break;
      default:
        this._renderBlock(item, 'iface-item');
        break;
    }
  }

  _mountElement(el, yellow) {
    if (yellow && yellow.grid) {
      this._applyGrid(el, yellow.grid);
      this._container.appendChild(el);
    } else {
      if (yellow && yellow.ajuste) {
        this._applyAjuste(el, yellow.ajuste);
      } else {
        el.style.position = 'relative';
        el.style.width = '100%';
      }
      this._flowWrap.appendChild(el);
    }
    this._itemCount++;
  }

  _renderBlock(item, cssClass) {
    const el = document.createElement('div');
    el.className = `iface-block ${cssClass}`;

    const val = item.value;
    let htmlStr;
    if (Array.isArray(val)) {
      htmlStr = val.join(', ');
    } else if (val === null || val === undefined) {
      htmlStr = '';
    } else if (typeof val === 'boolean') {
      htmlStr = val ? 'verdadeiro' : 'falso';
    } else if (typeof val === 'object') {
      htmlStr = JSON.stringify(val);
    } else {
      htmlStr = String(val);
    }
    el.innerHTML = this._sanitizeHTML(htmlStr);

    if (item.yellow && item.yellow.corTexto) {
      const ct = item.yellow.corTexto;
      el.style.color = `rgb(${ct.r},${ct.g},${ct.b})`;
    }

    this._mountElement(el, item.yellow);
  }

  // Grid supports both 12-column grid (when x,y,w,h <= 12) and percentage coordinates (0-100)
  _applyGrid(el, grid) {
    el.style.position = 'absolute';
    el.style.boxSizing = 'border-box';
    const { x, y, w, h } = grid;
    const is12Col = x >= 1 && x <= 12 && y >= 1 && y <= 12 && w >= 1 && w <= 12 && h >= 1 && h <= 12;
    if (is12Col) {
      el.style.left   = `${((x - 1) / 12) * 100}%`;
      el.style.top    = `${((y - 1) / 12) * 100}%`;
      el.style.width  = `${(w / 12) * 100}%`;
      el.style.height = `${(h / 12) * 100}%`;
    } else {
      el.style.left   = `${Math.max(0, x - w / 2)}%`;
      el.style.top    = `${Math.max(0, y - h / 2)}%`;
      el.style.width  = `${w}%`;
      el.style.height = `${h}%`;
    }
  }

  // Flow-based horizontal alignment + width so multiple ajuste elements never collide
  _applyAjuste(el, ajuste) {
    const { pos, tam } = ajuste;
    const sizes = { ppp: 12, pp: 20, p: 32, m: 48, g: 68, gg: 84, ggg: 100 };
    const sz = sizes[tam] ?? 48;

    el.style.position = 'relative';
    el.style.boxSizing = 'border-box';
    el.style.width = `${sz}%`;
    el.style.maxWidth = '100%';

    switch (pos) {
      case 'esquerda':
        el.style.marginLeft = '0';
        el.style.marginRight = 'auto';
        el.style.textAlign = 'left';
        break;
      case 'centroesquerda':
        el.style.marginLeft = '12%';
        el.style.marginRight = 'auto';
        el.style.textAlign = 'left';
        break;
      case 'centrodireita':
        el.style.marginLeft = 'auto';
        el.style.marginRight = '12%';
        el.style.textAlign = 'right';
        break;
      case 'direita':
        el.style.marginLeft = 'auto';
        el.style.marginRight = '0';
        el.style.textAlign = 'right';
        break;
      case 'centro':
      default:
        el.style.marginLeft = 'auto';
        el.style.marginRight = 'auto';
        el.style.textAlign = 'center';
        break;
    }
  }

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
    const color = yellow.corTexto
      ? `rgb(${yellow.corTexto.r},${yellow.corTexto.g},${yellow.corTexto.b})`
      : def.color
        ? `rgb(${def.color.r},${def.color.g},${def.color.b})`
        : 'var(--color-amarelo)';

    const el = document.createElement('div');
    el.className = 'iface-sprite';

    if (yellow.grid) {
      this._applyGrid(el, yellow.grid);
      this._container.appendChild(el);
    } else if (yellow.ajuste) {
      const tamPx = { ppp: 40, pp: 64, p: 96, m: 128, g: 168, gg: 210, ggg: 260 };
      const px = tamPx[yellow.ajuste.tam] ?? 128;
      this._applyAjuste(el, yellow.ajuste);
      el.style.width = `${px}px`;
      el.style.height = `${px}px`;
      this._flowWrap.appendChild(el);
    } else {
      el.style.position = 'relative';
      el.style.width = '120px';
      el.style.height = '120px';
      el.style.margin = '8px auto';
      this._flowWrap.appendChild(el);
    }

    if (def.kind === 'reto') {
      el.innerHTML = this._buildPolygonSVG(def.points, color);
    } else if (def.kind === 'curvo') {
      el.innerHTML = this._buildCircleSVG(color);
    } else if (def.kind === 'image') {
      el.innerHTML = this._buildImageHTML(def.imageKey);
    }

    this._itemCount++;
  }

  _buildPolygonSVG(points, color) {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scaled = points.map(p => [
      ((p[0] - minX) / rangeX * 92 + 4).toFixed(2),
      ((p[1] - minY) / rangeY * 92 + 4).toFixed(2),
    ]);
    const ptStr = scaled.map(p => p.join(',')).join(' ');
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><polygon points="${ptStr}" fill="${color}" /></svg>`;
  }

  _buildCircleSVG(color) {
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="46" fill="${color}" /></svg>`;
  }

  _buildImageHTML(imageKey) {
    try {
      let img = window.__ccImages && window.__ccImages[imageKey];
      if (!img) {
        const stored = localStorage.getItem('crabcode_images');
        if (stored) {
          const images = JSON.parse(stored);
          img = images[imageKey];
        }
      }
      if (!img) {
        return `<div class="iface-sprite-missing">Sprite "${String(imageKey).replace(/[<>&"]/g, '')}" não encontrado</div>`;
      }
      const size = img.size || 16;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
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
      const dataUrl = canvas.toDataURL('image/png');
      return `<img src="${dataUrl}" alt="${String(imageKey).replace(/[<>&"]/g, '')}" style="width:100%;height:100%;image-rendering:pixelated;object-fit:contain;display:block;" />`;
    } catch {
      return '';
    }
  }

  // ==================== Interactive elements ====================
  _renderInteractive(item, kind) {
    const elemKey = item.elemKey;
    const elements = window.__ccElements || {};
    const def = elements[elemKey] || { kind, label: elemKey, extra: [] };
    const yellow = item.yellow || null;

    const wrapper = document.createElement('div');
    wrapper.className = 'iface-block iface-interactive';

    let el;
    if (kind === 'botao') {
      el = document.createElement('button');
      el.type = 'button';
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
      const txt = document.createElement('span');
      txt.textContent = def.label || elemKey;
      el.appendChild(txt);
    } else if (kind === 'slider') {
      el = document.createElement('div');
      el.className = 'iface-slider-wrapper';
      const lbl = document.createElement('span');
      lbl.className = 'iface-slider-label';
      lbl.textContent = (def.label || elemKey) + ': ';
      const inp = document.createElement('input');
      inp.type = 'range';
      inp.min = def.extra[0] ?? 0;
      inp.max = def.extra[1] ?? 100;
      inp.value = def.valor !== undefined && def.valor !== '' ? def.valor : inp.min;
      const val = document.createElement('span');
      val.className = 'iface-slider-val';
      val.textContent = String(inp.value);
      inp.addEventListener('input', () => {
        val.textContent = inp.value;
        if (window.__ccElements && window.__ccElements[elemKey]) {
          window.__ccElements[elemKey].valor = Number(inp.value);
        }
        this._triggerRerun('input', { key: elemKey });
      });
      el.appendChild(lbl);
      el.appendChild(inp);
      el.appendChild(val);
    } else if (kind === 'seletor') {
      el = document.createElement('div');
      el.className = 'iface-select-wrap';
      if (def.label) {
        const lbl = document.createElement('span');
        lbl.className = 'iface-select-label';
        lbl.textContent = def.label;
        el.appendChild(lbl);
      }
      const sel = document.createElement('select');
      sel.className = 'iface-select';
      for (const opt of (def.extra || [])) {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        if (String(def.valor) === String(opt)) o.selected = true;
        sel.appendChild(o);
      }
      sel.addEventListener('change', () => {
        if (window.__ccElements && window.__ccElements[elemKey]) {
          window.__ccElements[elemKey].valor = sel.value;
        }
        this._triggerRerun('change', { key: elemKey });
      });
      el.appendChild(sel);
    } else if (kind === 'digite') {
      el = document.createElement('input');
      el.type = 'text';
      el.className = 'iface-input';
      el.placeholder = def.label || elemKey;
      el.value = String(def.valor || '');
      el.addEventListener('change', () => {
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
      const row = document.createElement('div');
      row.className = 'iface-pergunte-row';
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'iface-input';
      inp.value = String(def.valor || '');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'OK';
      btn.className = 'iface-btn';
      const submit = () => {
        if (window.__ccElements && window.__ccElements[elemKey]) {
          window.__ccElements[elemKey].valor = inp.value;
        }
        this._triggerRerun('submit', { key: elemKey });
      };
      btn.addEventListener('click', submit);
      inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') submit(); });
      row.appendChild(inp);
      row.appendChild(btn);
      el.appendChild(q);
      el.appendChild(row);
    }

    if (el) wrapper.appendChild(el);
    this._mountElement(wrapper, yellow);
  }

  _triggerRerun(eventType, data) {
    window.__ccLastEvent = { eventType, key: data?.key || null };
    window.dispatchEvent(new CustomEvent('crab-rerun', { detail: { eventType, data } }));
  }

  _sanitizeHTML(str) {
    const raw = String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return raw.replace(
      /&lt;(\/?)(b|i|u|s|em|strong|span|br|small|sub|sup|mark)(\s[^&]*?)?&gt;/gi,
      (_, slash, tag) => `<${slash}${tag}>`
    );
  }

  static show(outputBody) {
    let canvas = outputBody.querySelector('#interface-canvas');
    if (!canvas) {
      canvas = document.createElement('div');
      canvas.id = 'interface-canvas';
      outputBody.prepend(canvas);
    }
    canvas.style.display = 'block';
    for (const child of outputBody.children) {
      if (child.id !== 'interface-canvas') {
        child.style.display = 'none';
      }
    }
    return canvas;
  }

  static hide(outputBody) {
    const canvas = outputBody.querySelector('#interface-canvas');
    if (canvas) canvas.style.display = 'none';
    for (const child of outputBody.children) {
      if (child.id !== 'interface-canvas') {
        child.style.display = '';
      }
    }
  }
}

export { InterfaceRenderer };
