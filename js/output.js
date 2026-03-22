// ==================== OUTPUT RENDERER ====================
class OutputRenderer {
  constructor(container) {
    this.container = container;
  }

  clear() {
    this.container.innerHTML = `
      <div class="output-empty">
        <div class="crab"><img src="assets/crabcode_logo.png" alt="CrabCode" style="width:48px;height:48px;"></div>
        <div>Pressione <strong>▶ Rodar</strong> ou <strong>Ctrl+Enter</strong></div>
        <div>para executar seu código CrabCode</div>
      </div>`;
  }

  render(outputItems) {
    this.container.innerHTML = '';
    if (!outputItems || outputItems.length === 0) {
      this.container.innerHTML = `
        <div class="output-empty">
          <div class="crab"><img src="assets/crabcode_logo.png" alt="CrabCode" style="width:48px;height:48px;"></div>
          <div>Nenhum resultado produzido</div>
          <div>Use <code>execute</code> ou <code>apresente</code></div>
        </div>`;
      return;
    }

    for (const item of outputItems) {
      const el = this.renderItem(item);
      if (el) this.container.appendChild(el);
    }

    this.container.scrollTop = this.container.scrollHeight;
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
    
    if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        const labelSpan = document.createElement('span');
        labelSpan.className = 'label';
        labelSpan.textContent = key + ': ';
        div.appendChild(labelSpan);
        div.appendChild(document.createTextNode(this.formatValue(val) + '  '));
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
    const table = document.createElement('table');
    table.className = 'output-item output-dados';

    if (Array.isArray(value)) {
      // Array of objects or array of values
      if (value.length > 0 && typeof value[0] === 'object') {
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
            td.textContent = this.formatValue(row[k]);
            tr.appendChild(td);
          }
          tbody.appendChild(tr);
        }
        table.appendChild(tbody);
      } else {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = 'Índice';
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
          td1.textContent = idx;
          row.appendChild(td1);
          const td2 = document.createElement('td');
          td2.textContent = this.formatValue(v);
          row.appendChild(td2);
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
      }
    } else {
      // Single value
      const tbody = document.createElement('tbody');
      const row = document.createElement('tr');
      const td = document.createElement('td');
      td.textContent = this.formatValue(value);
      row.appendChild(td);
      tbody.appendChild(row);
      table.appendChild(tbody);
    }

    return table;
  }

  renderTabela(item) {
    const xObj = item.value;
    const yObj = item.yValue;
    const xName = item.xName || 'x';
    const yName = item.yName || null;
    const singleMode = !yObj || typeof yObj !== 'object';

    if (typeof xObj !== 'object' || xObj === null) {
      return this.renderExecute(`[tabela] '${xName}' não é um objeto`);
    }

    const keys = Object.keys(xObj);
    const wrap = document.createElement('div');
    wrap.className = 'output-item';

    const table = document.createElement('table');
    table.className = 'output-tabela';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = singleMode ? ['', xName] : ['', xName, yName || 'y'];
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
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
    const xObj = item.value;
    const yObj = item.yValue;
    const xName = item.xName || 'x';
    const yName = item.yName || null;
    const singleMode = !yObj || typeof yObj !== 'object';

    if (typeof xObj !== 'object' || xObj === null) {
      return this.renderExecute(`[grafico] '${xName}' não é um objeto`);
    }

    const keys = Object.keys(xObj);
    const xVals = keys.map(k => Number(xObj[k]) || 0);
    const yVals = singleMode ? null : keys.map(k => Number(yObj[k]) || 0);

    const wrap = document.createElement('div');
    wrap.className = 'output-item output-grafico-wrap';

    const canvas = document.createElement('canvas');
    const W = 480, H = 240;
    canvas.width = W;
    canvas.height = H;
    wrap.appendChild(canvas);

    // Legend
    const legend = document.createElement('div');
    legend.className = 'output-grafico-legend';

    // Colors — use CSS vars resolved at runtime
    const style = getComputedStyle(document.body);
    const colorX = style.getPropertyValue('--color-azul').trim() || '#89b4fa';
    const colorY = style.getPropertyValue('--color-roxo').trim() || '#cba6f7';
    const colorGrid = style.getPropertyValue('--border').trim() || '#313244';
    const colorText = style.getPropertyValue('--text-muted').trim() || '#6c7086';
    const colorLabel = style.getPropertyValue('--text-secondary').trim() || '#a6adc8';

    const PAD = { top: 20, right: 20, bottom: 48, left: 48 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const allVals = [...xVals, ...(yVals || [])];
    const minVal = Math.min(0, ...allVals);
    const maxVal = Math.max(...allVals) || 1;
    const range = maxVal - minVal || 1;

    const toY = v => PAD.top + chartH - ((v - minVal) / range) * chartH;
    const toX = i => PAD.left + (i / (keys.length - 1 || 1)) * chartW;

    // Draw on next tick so canvas is in DOM and sized
    requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      const ticks = 4;
      ctx.strokeStyle = colorGrid;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 3]);
      for (let t = 0; t <= ticks; t++) {
        const v = minVal + (range / ticks) * t;
        const y = toY(v);
        ctx.beginPath();
        ctx.moveTo(PAD.left, y);
        ctx.lineTo(PAD.left + chartW, y);
        ctx.stroke();
        ctx.fillStyle = colorText;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Number(v.toFixed(2)), PAD.left - 6, y + 4);
      }
      ctx.setLineDash([]);

      // X axis labels
      ctx.fillStyle = colorLabel;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      keys.forEach((k, i) => {
        ctx.fillText(k, toX(i), H - PAD.bottom + 16);
      });

      // Draw line for a dataset
      const drawLine = (vals, color) => {
        if (!vals || vals.length === 0) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        vals.forEach((v, i) => {
          const x = toX(i), y = toY(v);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        // Dots
        vals.forEach((v, i) => {
          const x = toX(i), y = toY(v);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = style.getPropertyValue('--bg-card').trim() || '#232336';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      };

      drawLine(xVals, colorX);
      if (yVals) drawLine(yVals, colorY);
    });

    // Legend entries
    [[xName, colorX], ...(yVals && yName ? [[yName, colorY]] : [])].forEach(([name, color]) => {
      const s = document.createElement('span');
      s.innerHTML = `<span class="dot" style="background:${color}"></span>${name}`;
      legend.appendChild(s);
    });
    wrap.appendChild(legend);
    return wrap;
  }

  renderEstatisticas(item) {
    const obj = item.value;
    const xName = item.xName || 'obj';

    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return this.renderExecute(`[estatisticas] '${xName}' não é um objeto`);
    }

    // Extract numeric values only, silently ignoring non-numeric
    const nums = Object.values(obj).map(v => Number(v)).filter(v => !isNaN(v) && isFinite(v));

    if (nums.length === 0) {
      return this.renderExecute(`[estatisticas] '${xName}' não possui valores numéricos`);
    }

    // Média
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;

    // Mediana
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

    // Moda — retorna todos os valores com maior frequência, separados por vírgula
    const freq = {};
    for (const n of nums) freq[n] = (freq[n] || 0) + 1;
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq)
      .filter(([, f]) => f === maxFreq)
      .map(([v]) => Number(v));
    const modeStr = modes.map(v => Number(v.toFixed(4))).join(', ');

    // Desvio padrão amostral (N-1)
    const stddev = nums.length > 1
      ? Math.sqrt(nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (nums.length - 1))
      : 0;

    const fmt = v => {
      const n = Number(v.toFixed(4));
      return Number.isInteger(n) ? n : n;
    };

    const frag = document.createDocumentFragment();
    const rows = [
      ['Média', fmt(mean)],
      ['Mediana', fmt(median)],
      ['Moda', modeStr],
      ['Desvio Padrão', fmt(stddev)],
    ];

    for (const [label, val] of rows) {
      const div = document.createElement('div');
      div.className = 'output-item output-apresentacao';
      div.innerHTML = `<span class="apresentacao-label">${label}</span><span class="apresentacao-arrow">→</span><span class="apresentacao-value">${val}</span>`;
      frag.appendChild(div);
    }
    return frag;
  }

  renderCientifica(item) {
    const num = Number(item.value);
    if (isNaN(num) || !isFinite(num)) {
      return this.renderExecute(`[cientifica] valor não é numérico`);
    }

    // Decompõe em mantissa × 10^expoente com 2 casas decimais na mantissa
    const exp = num === 0 ? 0 : Math.floor(Math.log10(Math.abs(num)));
    const mantissa = num / Math.pow(10, exp);

    // Formata mantissa com até 2 casas, remove zeros desnecessários
    const mantissaStr = parseFloat(mantissa.toFixed(2)).toLocaleString('pt-BR');
    const expStr = exp >= 0 ? String(exp) : `<sup style="font-size:0.7em">-</sup>${Math.abs(exp)}`;

    // Converte expoente para superscript unicode
    const toSup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'[c] ?? c).join('');
    const expDisplay = exp < 0 ? `⁻${toSup(Math.abs(exp))}` : toSup(exp);

    const div = document.createElement('div');
    div.className = 'output-item output-dados';
    div.innerHTML = `<span style="font-family:var(--font-mono);font-size:1.1em;letter-spacing:0.03em">${mantissaStr} × 10${expDisplay}</span>`;
    return div;
  }

  renderError(message) {
    const div = document.createElement('div');
    div.className = 'output-item output-error';
    div.textContent = '❌ Erro: ' + message;
    this.container.appendChild(div);
  }

  formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }
}


export { OutputRenderer };
