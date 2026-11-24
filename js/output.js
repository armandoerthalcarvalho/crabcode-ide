// ==================== OUTPUT RENDERER ====================
// Renders STEM output inside a dedicated #stem-output child so #interface-canvas is never destroyed.

class OutputRenderer {
  constructor(container) {
    this.outerContainer = container;
    this.container = this._ensureStemContainer();
  }

  _ensureStemContainer() {
    let stem = this.outerContainer.querySelector('#stem-output');
    if (!stem) {
      stem = document.createElement('div');
      stem.id = 'stem-output';
      stem.className = 'stem-output';
      this.outerContainer.appendChild(stem);
    }
    return stem;
  }

  clear() {
    this.container = this._ensureStemContainer();
    this.container.innerHTML = `
      <div class="output-empty">
        <div class="crab"><img src="assets/crabcode_logo.png" alt="CrabCode" class="output-empty-logo"></div>
        <div class="output-empty-title">Pronto para executar</div>
        <div class="output-empty-sub">Pressione <strong>▶ Rodar</strong> ou <kbd>Ctrl</kbd>+<kbd>Enter</kbd> para ver o resultado</div>
      </div>`;
  }

  render(outputItems, meta = {}) {
    this.container = this._ensureStemContainer();
    this.container.innerHTML = '';

    if (!outputItems || outputItems.length === 0) {
      this.container.innerHTML = `
        <div class="output-empty">
          <div class="crab"><img src="assets/crabcode_logo.png" alt="CrabCode" class="output-empty-logo"></div>
          <div class="output-empty-title">Nenhum resultado produzido</div>
          <div class="output-empty-sub">Use <code>execute</code> ou <code>apresente</code> para exibir valores aqui</div>
        </div>`;
      return;
    }

    for (const item of outputItems) {
      const el = this.renderItem(item);
      if (el) this.container.appendChild(el);
    }

    if (meta && typeof meta.elapsedMs === 'number') {
      const footer = document.createElement('div');
      footer.className = 'output-run-meta';
      footer.textContent = `${outputItems.length} ${outputItems.length === 1 ? 'saída' : 'saídas'} · ${meta.elapsedMs.toFixed(1)} ms`;
      this.container.appendChild(footer);
    }

    this.outerContainer.scrollTop = this.outerContainer.scrollHeight;
  }

  getPlainText() {
    this.container = this._ensureStemContainer();
    return this.container.innerText.trim();
  }

  renderItem(item) {
    if (item === null || item === undefined) return null;

    const type = item.type || 'execute';
    const value = item.value;

    switch (type) {
      case 'execute': return this.renderExecute(value);
      case 'texto': return this.renderTexto(value);
      case 'destaque': return this.renderDestaque(value);
      case 'apresentação':
      case 'apresentacao': return this.renderApresentacao(value);
      case 'dados': return this.renderDados(value);
      case 'tabela': return this.renderTabela(item);
      case 'grafico': return this.renderGrafico(item);
      case 'estatisticas': return this.renderEstatisticas(item);
      case 'cientifica': return this.renderCientifica(item);
      default: return this.renderExecute(value);
    }
  }

  renderExecute(value) {
    const div = document.createElement('div');
    div.className = 'output-item output-execute';
    div.textContent = this.formatValue(value);
    return div;
  }

  renderTexto(value) {
    const p = document.createElement('p');
    p.className = 'output-item output-texto';
    p.textContent = this.formatValue(value);
    return p;
  }

  renderDestaque(value) {
    const div = document.createElement('div');
    div.className = 'output-item output-destaque';
    div.textContent = this.formatValue(value);
    return div;
  }

  renderApresentacao(value) {
    const div = document.createElement('div');
    div.className = 'output-item output-apresentacao';

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const entries = Object.entries(value);
      for (const [key, val] of entries) {
        const pair = document.createElement('span');
        pair.className = 'apresentacao-pair';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'label';
        labelSpan.textContent = key + ': ';
        const valSpan = document.createElement('span');
        valSpan.className = 'val';
        valSpan.textContent = this.formatValue(val);
        pair.appendChild(labelSpan);
        pair.appendChild(valSpan);
        div.appendChild(pair);
      }
    } else {
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = '→ ';
      div.appendChild(label);
      div.appendChild(document.createTextNode(this.formatValue(value)));
    }
    return div;
  }

  renderDados(value) {
    const wrap = document.createElement('div');
    wrap.className = 'output-item output-table-wrap';
    const table = document.createElement('table');
    table.className = 'output-dados';

    if (Array.isArray(value)) {
      // 2D matrix (array of arrays)
      if (value.length > 0 && Array.isArray(value[0])) {
        const tbody = document.createElement('tbody');
        for (const row of value) {
          const tr = document.createElement('tr');
          const cells = Array.isArray(row) ? row : [row];
          for (const cell of cells) {
            const td = document.createElement('td');
            td.textContent = this.formatValue(cell);
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        }
        table.appendChild(tbody);
      } else if (value.length > 0 && value[0] !== null && typeof value[0] === 'object') {
        const keys = Object.keys(value[0]);
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        for (const k of keys) {
          const th = document.createElement('th');
          th.textContent = k;
          headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        for (const row of value) {
          const tr = document.createElement('tr');
          for (const k of keys) {
            const td = document.createElement('td');
            td.textContent = row && typeof row === 'object' ? this.formatValue(row[k]) : '—';
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        }
        table.appendChild(tbody);
      } else {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = '#';
        tr.appendChild(th);
        const th2 = document.createElement('th');
        th2.textContent = 'Valor';
        tr.appendChild(th2);
        thead.appendChild(tr);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        value.forEach((v, idx) => {
          const row = document.createElement('tr');
          const td1 = document.createElement('td');
          td1.textContent = String(idx + 1);
          row.appendChild(td1);
          const td2 = document.createElement('td');
          td2.textContent = this.formatValue(v);
          row.appendChild(td2);
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
      }
    } else if (value !== null && typeof value === 'object') {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      ['Chave', 'Valor'].forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      for (const [k, v] of Object.entries(value)) {
        const row = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = k;
        const td2 = document.createElement('td');
        td2.textContent = this.formatValue(v);
        row.appendChild(td1);
        row.appendChild(td2);
        tbody.appendChild(row);
      }
      table.appendChild(tbody);
    } else {
      const tbody = document.createElement('tbody');
      const row = document.createElement('tr');
      const td = document.createElement('td');
      td.textContent = this.formatValue(value);
      row.appendChild(td);
      tbody.appendChild(row);
      table.appendChild(tbody);
    }

    wrap.appendChild(table);
    return wrap;
  }

  renderTabela(item) {
    const xRaw = item.value;
    const yRaw = item.yValue;
    const xName = item.xName || 'x';
    const yName = item.yName || null;

    if (typeof xRaw !== 'object' || xRaw === null) {
      return this.renderExecute(`[tabela] '${xName}' não é um objeto ou lista`);
    }

    const xObj = Array.isArray(xRaw)
      ? Object.fromEntries(xRaw.map((v, i) => [String(i + 1), v]))
      : xRaw;
    const yObj = Array.isArray(yRaw)
      ? Object.fromEntries(yRaw.map((v, i) => [String(i + 1), v]))
      : yRaw;
    const singleMode = !yObj || typeof yObj !== 'object';

    const keys = Object.keys(xObj);
    const wrap = document.createElement('div');
    wrap.className = 'output-item output-table-wrap';

    const table = document.createElement('table');
    table.className = 'output-tabela';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = singleMode ? ['Item', xName] : ['Item', xName, yName || 'y'];
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const key of keys) {
      const tr = document.createElement('tr');
      const cells = singleMode
        ? [key, this.formatValue(xObj[key])]
        : [key, this.formatValue(xObj[key]), this.formatValue(yObj[key] ?? '—')];
      cells.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  renderGrafico(item) {
    const xRaw = item.value;
    const yRaw = item.yValue;
    const xName = item.xName || 'x';
    const yName = item.yName || null;

    if (typeof xRaw !== 'object' || xRaw === null) {
      return this.renderExecute(`[grafico] '${xName}' não é um objeto ou lista`);
    }

    const xObj = Array.isArray(xRaw)
      ? Object.fromEntries(xRaw.map((v, i) => [String(i + 1), v]))
      : xRaw;
    const yObj = Array.isArray(yRaw)
      ? Object.fromEntries(yRaw.map((v, i) => [String(i + 1), v]))
      : yRaw;
    const singleMode = !yObj || typeof yObj !== 'object';

    const keys = Object.keys(xObj);
    if (keys.length === 0) {
      return this.renderExecute(`[grafico] '${xName}' está vazio`);
    }

    const xVals = keys.map(k => Number(xObj[k]) || 0);
    const yVals = singleMode ? null : keys.map(k => Number(yObj[k]) || 0);

    const wrap = document.createElement('div');
    wrap.className = 'output-item output-grafico-wrap';

    const canvas = document.createElement('canvas');
    const W = 520, H = 250;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = '100%';
    canvas.style.maxWidth = W + 'px';
    canvas.style.height = 'auto';
    wrap.appendChild(canvas);

    const style = getComputedStyle(document.body);
    const colorX = style.getPropertyValue('--color-azul').trim() || '#60a5fa';
    const colorY = style.getPropertyValue('--color-roxo').trim() || '#c084fc';
    const colorGrid = style.getPropertyValue('--border').trim() || '#2a2e3f';
    const colorText = style.getPropertyValue('--text-muted').trim() || '#7c8299';
    const colorLabel = style.getPropertyValue('--text-secondary').trim() || '#a6adc8';
    const bgCard = style.getPropertyValue('--bg-card').trim() || '#181b26';

    const PAD = { top: 20, right: 24, bottom: 44, left: 54 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const allVals = [...xVals, ...(yVals || [])];
    const minVal = Math.min(0, ...allVals);
    const maxVal = Math.max(...allVals);
    const span = (maxVal - minVal) || 1;
    const paddedMax = maxVal + span * 0.08;
    const range = (paddedMax - minVal) || 1;

    const toY = v => PAD.top + chartH - ((v - minVal) / range) * chartH;
    const toX = i => keys.length === 1
      ? PAD.left + chartW / 2
      : PAD.left + (i / (keys.length - 1)) * chartW;

    requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Horizontal gridlines
      const ticks = 4;
      ctx.strokeStyle = colorGrid;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      for (let t = 0; t <= ticks; t++) {
        const v = minVal + (range / ticks) * t;
        const y = toY(v);
        ctx.beginPath();
        ctx.moveTo(PAD.left, y);
        ctx.lineTo(PAD.left + chartW, y);
        ctx.stroke();

        ctx.fillStyle = colorText;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(String(Number(v.toFixed(2))), PAD.left - 8, y + 4);
      }
      ctx.setLineDash([]);

      // X-axis labels (thin if too many labels)
      const step = Math.max(1, Math.ceil(keys.length / 8));
      ctx.fillStyle = colorLabel;
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      keys.forEach((k, i) => {
        if (i % step === 0 || i === keys.length - 1) {
          const lbl = k.length > 10 ? k.slice(0, 9) + '…' : k;
          ctx.fillText(lbl, toX(i), H - PAD.bottom + 18);
        }
      });

      const drawSeries = (vals, color, fillArea) => {
        if (!vals || vals.length === 0) return;

        if (fillArea && vals.length > 1) {
          const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
          grad.addColorStop(0, color + '33');
          grad.addColorStop(1, color + '00');
          ctx.beginPath();
          vals.forEach((v, i) => {
            const x = toX(i), y = toY(v);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.lineTo(toX(vals.length - 1), PAD.top + chartH);
          ctx.lineTo(toX(0), PAD.top + chartH);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        vals.forEach((v, i) => {
          const x = toX(i), y = toY(v);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();

        vals.forEach((v, i) => {
          const x = toX(i), y = toY(v);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = bgCard;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      };

      drawSeries(xVals, colorX, true);
      if (yVals) drawSeries(yVals, colorY, false);
    });

    // Safe XSS-free legend
    const legend = document.createElement('div');
    legend.className = 'output-grafico-legend';
    [[xName, colorX], ...(yVals && yName ? [[yName, colorY]] : [])].forEach(([name, color]) => {
      const s = document.createElement('span');
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = color;
      s.appendChild(dot);
      s.appendChild(document.createTextNode(String(name)));
      legend.appendChild(s);
    });
    wrap.appendChild(legend);
    return wrap;
  }

  renderEstatisticas(item) {
    const raw = item.value;
    const xName = item.xName || 'dados';

    if (!raw || typeof raw !== 'object') {
      return this.renderExecute(`[estatisticas] '${xName}' não é um objeto ou lista`);
    }

    const vals = Array.isArray(raw) ? raw : Object.values(raw);
    const nums = vals.map(v => Number(v)).filter(v => !isNaN(v) && isFinite(v));

    if (nums.length === 0) {
      return this.renderExecute(`[estatisticas] '${xName}' não possui valores numéricos`);
    }

    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

    const freq = {};
    for (const n of nums) freq[n] = (freq[n] || 0) + 1;
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq)
      .filter(([, f]) => f === maxFreq)
      .map(([v]) => Number(v));
    const modeStr = modes.length === nums.length && nums.length > 1
      ? 'Amodal'
      : modes.map(v => Number(v.toFixed(4))).join(', ');

    const stddev = nums.length > 1
      ? Math.sqrt(nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (nums.length - 1))
      : 0;

    const fmt = v => Number(v.toFixed(4));

    const grid = document.createElement('div');
    grid.className = 'output-item output-stats-grid';

    const rows = [
      ['Média', fmt(mean)],
      ['Mediana', fmt(median)],
      ['Desvio Padrão', fmt(stddev)],
      ['Moda', modeStr],
      ['Mínimo', fmt(sorted[0])],
      ['Máximo', fmt(sorted[sorted.length - 1])],
      ['Soma', fmt(sum)],
      ['Amostras (N)', nums.length],
    ];

    for (const [label, val] of rows) {
      const card = document.createElement('div');
      card.className = 'stat-cell';
      const lbl = document.createElement('span');
      lbl.className = 'apresentacao-label';
      lbl.textContent = label;
      const valEl = document.createElement('span');
      valEl.className = 'apresentacao-value';
      valEl.textContent = String(val);
      card.appendChild(lbl);
      card.appendChild(valEl);
      grid.appendChild(card);
    }
    return grid;
  }

  renderCientifica(item) {
    const num = Number(item.value);
    if (isNaN(num) || !isFinite(num)) {
      return this.renderExecute(`[cientifica] valor não é numérico`);
    }

    const exp = num === 0 ? 0 : Math.floor(Math.log10(Math.abs(num)));
    const mantissa = num === 0 ? 0 : num / Math.pow(10, exp);
    const mantissaStr = parseFloat(mantissa.toFixed(2)).toLocaleString('pt-BR');

    const toSup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] ?? c).join('');
    const expDisplay = exp < 0 ? `⁻${toSup(Math.abs(exp))}` : toSup(exp);

    const div = document.createElement('div');
    div.className = 'output-item output-cientifica';
    div.textContent = `${mantissaStr} × 10${expDisplay}`;
    return div;
  }

  renderError(message) {
    this.container = this._ensureStemContainer();
    const div = document.createElement('div');
    div.className = 'output-item output-error';
    div.textContent = 'Erro de execução: ' + message;
    this.container.appendChild(div);
  }

  formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'verdadeiro' : 'falso';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }
}

export { OutputRenderer };
