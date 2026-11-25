import { CrabLibRegistry } from './language.js';
import { escapeHtml, highlightLine } from './utils.js';
import { showToast, showConfirm, copyText } from './ui.js';

// ==================== SAFE LOCALSTORAGE HELPER ====================
function safeSetItem(key, value) {
  try {
    if (typeof localStorage === 'undefined') return { ok: true };
    localStorage.setItem(key, value);
    return { ok: true };
  } catch (err) {
    const isQuota = err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014);
    const msg = isQuota
      ? 'Espaço de armazenamento local do navegador esgotado. Remova datasets, sprites ou scripts antigos.'
      : 'Não foi possível salvar no armazenamento local do navegador.';
    try { showToast(msg, 'error', 4200); } catch { /* ignore in Node */ }
    return { ok: false, error: msg };
  }
}

// ==================== DEFAULT CODE ====================
const DEFAULT_CODE = `importe biblioteca_geral
apresente "CrabCode IDE" em destaque
apresente "Ambiente interativo em português para STEM, dados e interfaces." em texto

defina vendas como objeto jan: 1240, fev: 1580, mar: 1490, abr: 1890, mai: 2150, jun: 2420
apresente vendas em grafico
apresente vendas em estatisticas

apresente "Fatorial de 5: " + rodar(execute fatorial(5)) em apresentação
apresente "Área de círculo (r = 3 cm): " + rodar(execute area_circulo(3)) + " cm²" em apresentação
apresente "25°C em Fahrenheit: " + rodar(execute celsius_para_fahrenheit(25)) + " °F" em apresentação
apresente "Abra o Tutorial (96 lições) ou Modelos (Ctrl+K) para explorar todas as 100 bibliotecas!" em texto`;

// ==================== RESERVED IDENTIFIERS (JS + CRABCODE) ====================
const RESERVED_IDENTIFIERS = new Set([
  // JavaScript reserved words & globals
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete',
  'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if',
  'import', 'in', 'instanceof', 'let', 'new', 'null', 'of', 'return', 'static', 'super',
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while',
  'with', 'yield', 'async', 'await', 'eval', 'arguments', 'window', 'document', 'globalThis',
  'Object', 'Array', 'Math', 'Number', 'String', 'Boolean', 'Date', 'JSON', 'Promise',
  // CrabCode keywords & built-in modes
  'defina', 'como', 'altere', 'para', 'execute', 'apresente', 'importe', 'se', 'senao',
  'repita', 'vezes', 'relatando', 'enquanto', 'funcao', 'objeto', 'loop', 'com', 'amostras',
  'rodar', 'em', 'e', 'ou', 'nao', 'verdadeiro', 'falso', 'salve', 'carregue', 'local',
  'nuvem', 'usando', 'interface', 'tecla', 'sprite', 'reto', 'curvo', 'botao', 'toggle',
  'slider', 'seletor', 'digite', 'pergunte', 'ajuste', 'grid', 'compactar',
  'texto', 'destaque', 'dados', 'tabela', 'grafico', 'estatisticas', 'cientifica',
]);

function isReservedDatasetKey(key) {
  if (!key) return true;
  const lower = String(key).toLowerCase();
  if (RESERVED_IDENTIFIERS.has(key) || RESERVED_IDENTIFIERS.has(lower)) return true;
  if (CrabLibRegistry && typeof CrabLibRegistry.get === 'function' && CrabLibRegistry.get(key)) return true;
  return false;
}

// ==================== ACTIVE SCRIPT TRACKING ====================
const ACTIVE_SCRIPT_KEY = 'crabcode_active_script_id';
let _activeScriptId = null;

function _loadActiveScriptId() {
  if (_activeScriptId !== null) return _activeScriptId;
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(ACTIVE_SCRIPT_KEY);
      if (saved) _activeScriptId = saved;
    }
  } catch { /* ignore */ }
  return _activeScriptId;
}

function setActiveScriptId(id) {
  _activeScriptId = id ? String(id) : null;
  try {
    if (typeof localStorage !== 'undefined') {
      if (_activeScriptId) localStorage.setItem(ACTIVE_SCRIPT_KEY, _activeScriptId);
      else localStorage.removeItem(ACTIVE_SCRIPT_KEY);
    }
  } catch { /* ignore */ }
  updateActiveScriptBadge();
}

function getActiveScriptId() {
  return _loadActiveScriptId();
}

function getActiveScript() {
  const id = _loadActiveScriptId();
  if (!id) return null;
  return loadScripts().find(s => String(s.id) === String(id)) || null;
}

function clearActiveScript() {
  setActiveScriptId(null);
}

function updateActiveScriptBadge() {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('active-script-indicator');
  if (!el) return;
  const script = getActiveScript();
  const codeEditor = document.getElementById('code-editor');
  if (!script) {
    el.textContent = 'Rascunho local';
    el.className = 'active-script-pill is-draft';
    el.title = 'Salvo automaticamente no navegador. Use Ctrl+S ou "Salvar script" para adicionar à sua coleção.';
    return;
  }
  const dirty = codeEditor ? codeEditor.value !== script.code : false;
  el.textContent = dirty ? `● ${script.title} (não salvo)` : `✓ ${script.title}`;
  el.className = `active-script-pill ${dirty ? 'is-dirty' : 'is-synced'}`;
  el.title = dirty
    ? `Alterações pendentes em "${script.title}". Pressione Ctrl+S para atualizar o script salvo.`
    : `Sincronizado com o script "${script.title}".`;
}

// ==================== LOAD / SAVE CODE ====================
function loadCode() {
  const codeEditor = document.getElementById('code-editor');
  if (!codeEditor) return;
  const saved = localStorage.getItem('crabcode-source');
  codeEditor.value = (saved !== null && saved !== '') ? saved : DEFAULT_CODE;
  updateActiveScriptBadge();
}

let _savedTimer = null;
function saveCode({ syncActiveScript = false } = {}) {
  const codeEditor = document.getElementById('code-editor');
  if (!codeEditor) return { ok: false };
  const savedIndicator = document.getElementById('saved-indicator');
  const res = safeSetItem('crabcode-source', codeEditor.value);

  let updatedScriptTitle = null;
  if (syncActiveScript) {
    const active = getActiveScript();
    if (active) {
      const scripts = loadScripts();
      const idx = scripts.findIndex(s => String(s.id) === String(active.id));
      if (idx !== -1) {
        scripts[idx] = {
          ...scripts[idx],
          code: codeEditor.value,
          updatedAt: new Date().toISOString(),
        };
        if (saveScripts(scripts).ok) {
          updatedScriptTitle = scripts[idx].title;
        }
      }
    }
  }

  updateActiveScriptBadge();

  if (res.ok && savedIndicator) {
    savedIndicator.textContent = updatedScriptTitle ? `Salvo: ${updatedScriptTitle}` : 'Salvo ✓';
    savedIndicator.classList.add('show');
    clearTimeout(_savedTimer);
    _savedTimer = setTimeout(() => savedIndicator.classList.remove('show'), 1800);
  }
  return { ok: res.ok, updatedScriptTitle };
}

// ==================== CSV / DADOS SYSTEM (BLINDADO) ====================
const CSV_STORAGE_KEY = 'crabcode_csv_datasets';
const CSV_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const CSV_MAX_ROWS = 10000;

function getCsvDatasets() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const rawJson = localStorage.getItem(CSV_STORAGE_KEY);
    if (!rawJson) return [];
    const data = JSON.parse(rawJson);
    if (!Array.isArray(data)) return [];

    // Schema sanitization & automatic recovery from raw CSV if columns got corrupted
    let repaired = false;
    const clean = [];
    for (const item of data) {
      if (!item || typeof item !== 'object' || typeof item.key !== 'string') continue;
      if (!Array.isArray(item.columns) || item.columns.length === 0) {
        if (typeof item.raw === 'string' && item.raw.trim()) {
          const recovered = parseCSV(item.raw, item.options || {});
          if (!recovered.error) {
            clean.push({
              ...item,
              columns: recovered.columns,
              rows: recovered.rows,
              delimiter: recovered.delimiter,
              audit: recovered.audit,
            });
            repaired = true;
            continue;
          }
        }
        continue;
      }
      clean.push(item);
    }
    if (repaired) saveCsvDatasets(clean);
    return clean;
  } catch {
    return [];
  }
}

function saveCsvDatasets(datasets) {
  return safeSetItem(CSV_STORAGE_KEY, JSON.stringify(datasets));
}

function generateCsvKey() {
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const existing = new Set(getCsvDatasets().map(d => d.key));
  let key, attempts = 0;
  do {
    key = 'dados_'
        + consonants[Math.floor(Math.random() * consonants.length)]
        + vowels[Math.floor(Math.random() * vowels.length)]
        + consonants[Math.floor(Math.random() * consonants.length)]
        + vowels[Math.floor(Math.random() * vowels.length)];
    attempts++;
  } while ((existing.has(key) || isReservedDatasetKey(key)) && attempts < 100);
  return key;
}

function sanitizeColName(rawName, index, usedNames) {
  let clean = String(rawName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!clean) clean = `col_${index + 1}`;
  if (/^[0-9]/.test(clean)) clean = `col_${clean}`;
  if (RESERVED_IDENTIFIERS.has(clean) || RESERVED_IDENTIFIERS.has(clean.toLowerCase())) {
    clean = `col_${clean}`;
  }

  let candidate = clean;
  let suffix = 2;
  while (usedNames.has(candidate) || RESERVED_IDENTIFIERS.has(candidate)) {
    candidate = `${clean}_${suffix++}`;
  }
  usedNames.add(candidate);
  return candidate;
}

function detectDelimiter(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0).slice(0, 5);
  const candidates = [',', ';', '\t', '|'];
  const scores = { ',': 0, ';': 0, '\t': 0, '|': 0 };

  for (const sample of lines) {
    let inQuote = false;
    for (let i = 0; i < sample.length; i++) {
      const ch = sample[i];
      if (ch === '"') {
        if (inQuote && sample[i + 1] === '"') { i++; continue; }
        inQuote = !inQuote;
      } else if (!inQuote && scores[ch] !== undefined) {
        scores[ch]++;
      }
    }
  }

  let best = ',';
  let bestScore = scores[','];
  for (const d of candidates) {
    if (scores[d] > bestScore) {
      best = d;
      bestScore = scores[d];
    }
  }
  return best;
}

function parseSmartNumber(rawVal, delimiter, decimalMode = 'auto') {
  if (rawVal === null || rawVal === undefined) return null;
  let v = String(rawVal).trim();
  if (v === '') return null;

  // Strip common currency prefixes (R$, US$, $, €, £) and whitespace
  v = v.replace(/^(R\$|US\$|\$|€|£)\s*/i, '').trim();
  // Handle percentage suffix
  const isPct = v.endsWith('%');
  if (isPct) v = v.slice(0, -1).trim();

  // Explicit Brazilian decimal mode: 1.250,50 or 12,5
  if (decimalMode === 'br') {
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(v)) {
      return Number(v.replace(/\./g, '').replace(',', '.'));
    }
    if (/^-?\d+(,\d+)?$/.test(v)) {
      return Number(v.replace(',', '.'));
    }
    return NaN;
  }

  // Explicit English/US decimal mode: 1,250.50 or 12.5
  if (decimalMode === 'en') {
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(v)) {
      return Number(v.replace(/,/g, ''));
    }
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v)) {
      return Number(v);
    }
    return NaN;
  }

  // AUTO mode:
  // 1. Standard number or scientific notation (e.g., -12.5, 3.14e-2, 42)
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v)) {
    return Number(v);
  }
  // 2. PT-BR thousands + decimal comma: 1.250,50 or 12.345.678,90
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(v)) {
    return Number(v.replace(/\./g, '').replace(',', '.'));
  }
  // 3. US thousands + decimal dot: 1,250.50
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(v)) {
    return Number(v.replace(/,/g, ''));
  }
  // 4. PT-BR simple decimal comma (e.g., 45,5 or -0,75) when delimiter is not ',' OR quoted/currency/pct
  if (/^-?\d+,\d+$/.test(v)) {
    return Number(v.replace(',', '.'));
  }

  return NaN;
}

function parseCSV(raw, options = {}) {
  if (typeof raw !== 'string') return { columns: [], rows: 0, error: 'CSV inválido.' };
  if (raw.length > CSV_MAX_BYTES) {
    return { columns: [], rows: 0, error: `Arquivo excede o limite de ${(CSV_MAX_BYTES / (1024 * 1024)).toFixed(0)} MB para armazenamento local.` };
  }

  const cleaned = raw.replace(/^\uFEFF/, '');
  if (!cleaned.trim()) return { columns: [], rows: 0, error: 'CSV vazio.' };

  const delimiter = options.delimiter && options.delimiter !== 'auto'
    ? (options.delimiter === '\\t' ? '\t' : options.delimiter)
    : detectDelimiter(cleaned);
  const hasHeader = options.hasHeader !== false;
  const decimalMode = options.decimalMode || 'auto';
  const maxRows = options.maxRows || CSV_MAX_ROWS;

  // Full RFC-4180 state-machine parser (handles escaped "", quoted delimiters, quoted newlines)
  const records = [];
  let row = [];
  let field = '';
  let inQuote = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inQuote) {
      if (ch === '"') {
        if (cleaned[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"' && field.trim() === '') {
        inQuote = true;
        field = '';
      } else if (ch === delimiter) {
        row.push(field.trim());
        field = '';
      } else if (ch === '\r') {
        if (cleaned[i + 1] === '\n') i++;
        row.push(field.trim());
        records.push(row);
        row = [];
        field = '';
      } else if (ch === '\n') {
        row.push(field.trim());
        records.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    records.push(row);
  }

  // Strip trailing completely empty rows
  while (records.length > 0 && records[records.length - 1].every(c => c === '')) {
    records.pop();
  }
  if (records.length === 0) return { columns: [], rows: 0, error: 'CSV vazio.' };

  const rawHeaders = hasHeader
    ? records[0]
    : records[0].map((_, idx) => `col_${idx + 1}`);

  if (rawHeaders.length === 0 || rawHeaders.every(h => h === '')) {
    return { columns: [], rows: 0, error: 'Cabeçalho sem colunas.' };
  }

  const usedNames = new Set();
  const renamedHeaders = [];
  const headers = rawHeaders.map((h, i) => {
    const original = h || `col_${i + 1}`;
    const name = sanitizeColName(original, i, usedNames);
    if (name !== original) {
      renamedHeaders.push({ from: original, to: name });
    }
    return { original, name };
  });

  const dataStart = hasHeader ? 1 : 0;
  const totalSourceRows = Math.max(0, records.length - dataStart);
  const truncatedRows = Math.max(0, totalSourceRows - maxRows);
  const limitEnd = Math.min(records.length, dataStart + maxRows);

  const rawCols = headers.map(() => []);
  let nonEmptyDataRows = 0;
  let raggedRows = 0;
  let emptyCells = 0;

  for (let r = dataStart; r < limitEnd; r++) {
    const rec = records[r];
    if (rec.every(c => c === '')) continue;
    nonEmptyDataRows++;
    if (rec.length !== headers.length) raggedRows++;
    headers.forEach((_, ci) => {
      const cell = rec[ci] !== undefined ? rec[ci] : '';
      if (cell === '') emptyCells++;
      rawCols[ci].push(cell);
    });
  }

  const columns = headers.map((h, ci) => {
    const vals = rawCols[ci];
    const hasAnyValue = vals.some(v => v !== '');
    const allNumeric = hasAnyValue && vals.every(v => {
      if (v === '') return true;
      const n = parseSmartNumber(v, delimiter, decimalMode);
      return n !== null && !Number.isNaN(n) && Number.isFinite(n);
    });

    const values = vals.map(v => {
      if (v === '') return null;
      return allNumeric ? parseSmartNumber(v, delimiter, decimalMode) : v;
    });

    return {
      name: h.name,
      original: h.original,
      type: allNumeric ? 'number' : 'string',
      values,
    };
  });

  return {
    columns,
    rows: nonEmptyDataRows,
    delimiter,
    hasHeader,
    decimalMode,
    audit: {
      renamedHeaders,
      emptyCells,
      raggedRows,
      truncatedRows,
      totalSourceRows,
    },
  };
}

function csvColumnsToJs(dataset) {
  return dataset.columns.map(col => {
    const safeName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.name) && !RESERVED_IDENTIFIERS.has(col.name)
      ? col.name
      : `col_${col.name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    const vals = col.values.map(v => {
      if (v === null || v === undefined) return 'null';
      return col.type === 'number' && Number.isFinite(Number(v)) ? String(Number(v)) : JSON.stringify(String(v));
    });
    return `var ${safeName} = [${vals.join(', ')}];`;
  }).join('\n');
}

function _getCsvModalOptions() {
  const delim = document.getElementById('csv-opt-delim')?.value || 'auto';
  const decimalMode = document.getElementById('csv-opt-decimal')?.value || 'auto';
  const hasHeader = document.getElementById('csv-opt-header')?.checked !== false;
  return { delimiter: delim, decimalMode, hasHeader };
}

function openCsvModal(existingKey) {
  const modal = document.getElementById('csv-modal');
  const keyInput = document.getElementById('csv-modal-key');
  const titleInput = document.getElementById('csv-modal-title');
  const contentInput = document.getElementById('csv-modal-content');
  const preview = document.getElementById('csv-modal-preview');
  const auditEl = document.getElementById('csv-modal-audit');
  const tablePreview = document.getElementById('csv-modal-table-preview');
  const heading = document.getElementById('csv-modal-heading');
  const optDelim = document.getElementById('csv-opt-delim');
  const optDec = document.getElementById('csv-opt-decimal');
  const optHeader = document.getElementById('csv-opt-header');

  if (existingKey) {
    const ds = getCsvDatasets().find(d => d.key === existingKey);
    if (ds) {
      keyInput.value = ds.key;
      titleInput.value = ds.title || '';
      contentInput.value = ds.raw || '';
      keyInput.dataset.editing = existingKey;
      if (heading) heading.textContent = `Editar Dataset — ${ds.key}`;
      if (optDelim) optDelim.value = ds.options?.delimiter || 'auto';
      if (optDec) optDec.value = ds.options?.decimalMode || 'auto';
      if (optHeader) optHeader.checked = ds.options?.hasHeader !== false;
    }
  } else {
    keyInput.value = generateCsvKey();
    titleInput.value = '';
    contentInput.value = '';
    delete keyInput.dataset.editing;
    if (heading) heading.textContent = 'Importar Dataset CSV';
    if (optDelim) optDelim.value = 'auto';
    if (optDec) optDec.value = 'auto';
    if (optHeader) optHeader.checked = true;
  }

  if (preview) preview.textContent = '';
  if (auditEl) { auditEl.innerHTML = ''; auditEl.className = 'csv-modal-audit'; auditEl.style.display = 'none'; }
  if (tablePreview) tablePreview.innerHTML = '';
  modal.style.display = 'flex';

  contentInput.oninput = () => updateCsvPreview();
  if (optDelim) optDelim.onchange = () => updateCsvPreview();
  if (optDec) optDec.onchange = () => updateCsvPreview();
  if (optHeader) optHeader.onchange = () => updateCsvPreview();

  if (existingKey) updateCsvPreview();
  setTimeout(() => titleInput?.focus(), 40);
}

function updateCsvPreview() {
  const raw = document.getElementById('csv-modal-content')?.value || '';
  const preview = document.getElementById('csv-modal-preview');
  const auditEl = document.getElementById('csv-modal-audit');
  const tablePreview = document.getElementById('csv-modal-table-preview');
  if (!raw.trim()) {
    if (preview) preview.textContent = '';
    if (auditEl) { auditEl.innerHTML = ''; auditEl.className = 'csv-modal-audit'; auditEl.style.display = 'none'; }
    if (tablePreview) tablePreview.innerHTML = '';
    return;
  }

  const result = parseCSV(raw, _getCsvModalOptions());
  if (result.error) {
    if (preview) {
      preview.textContent = '⚠ ' + result.error;
      preview.style.color = 'var(--color-vermelho)';
    }
    if (auditEl) { auditEl.innerHTML = ''; auditEl.className = 'csv-modal-audit'; auditEl.style.display = 'none'; }
    if (tablePreview) tablePreview.innerHTML = '';
    return;
  }

  const delimNames = { ';': 'ponto-e-vírgula (;)', '\t': 'tabulação', '|': 'pipe (|)', ',': 'vírgula (,)' };
  const delimName = delimNames[result.delimiter] || result.delimiter;
  const summary = result.columns.map(c =>
    `${c.name} (${c.type === 'number' ? 'num' : 'texto'})`
  ).join(' · ');

  if (preview) {
    preview.textContent = `✓ ${result.columns.length} coluna(s) · ${result.rows} linha(s) · separador: ${delimName} — ${summary}`;
    preview.style.color = 'var(--color-verde)';
  }

  if (auditEl && result.audit) {
    const notes = [];
    if (result.audit.renamedHeaders.length > 0) {
      const list = result.audit.renamedHeaders.slice(0, 4).map(r => `${r.from} → ${r.to}`).join(', ');
      notes.push(`Colunas sanitizadas: ${list}${result.audit.renamedHeaders.length > 4 ? '…' : ''}`);
    }
    if (result.audit.raggedRows > 0) {
      notes.push(`${result.audit.raggedRows} linha(s) com colunas incompletas normalizadas com null`);
    }
    if (result.audit.emptyCells > 0) {
      notes.push(`${result.audit.emptyCells} célula(s) vazia(s) convertidas para null`);
    }
    if (result.audit.truncatedRows > 0) {
      notes.push(`Dataset truncado em ${CSV_MAX_ROWS.toLocaleString('pt-BR')} linhas (${result.audit.truncatedRows} ignoradas)`);
    }
    if (notes.length > 0) {
      auditEl.className = 'csv-modal-audit csv-audit-warn';
      auditEl.style.display = 'block';
      auditEl.innerHTML = `<strong>Auditoria de qualidade:</strong> ${notes.map(n => escapeHtml(n)).join(' · ')}`;
    } else {
      auditEl.className = 'csv-modal-audit';
      auditEl.innerHTML = '';
      auditEl.style.display = 'none';
    }
  }

  if (tablePreview && result.columns.length > 0) {
    const maxPreviewRows = Math.min(6, result.columns[0].values.length);
    const thead = `<thead><tr>${result.columns.map(c =>
      `<th>${escapeHtml(c.name)} <span class="csv-col-type">${c.type === 'number' ? '#' : 'Aa'}</span></th>`
    ).join('')}</tr></thead>`;
    let tbodyRows = '';
    for (let r = 0; r < maxPreviewRows; r++) {
      tbodyRows += `<tr>${result.columns.map(c => {
        const val = c.values[r];
        return `<td>${val === null || val === undefined ? '<span class="muted">null</span>' : escapeHtml(String(val))}</td>`;
      }).join('')}</tr>`;
    }
    const moreNote = result.rows > maxPreviewRows
      ? `<div class="csv-preview-more">Exibindo ${maxPreviewRows} de ${result.rows} linhas</div>`
      : '';
    tablePreview.innerHTML = `<div class="csv-preview-scroll"><table class="csv-preview-table">${thead}<tbody>${tbodyRows}</tbody></table></div>${moreNote}`;
  }
}

function loadCsvFile(file) {
  if (!file) return;
  if (file.size > CSV_MAX_BYTES) {
    showToast(`Arquivo muito grande (${(file.size / (1024 * 1024)).toFixed(1)} MB). Limite: 2 MB.`, 'error', 4000);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const contentInput = document.getElementById('csv-modal-content');
    const titleInput = document.getElementById('csv-modal-title');
    const keyInput = document.getElementById('csv-modal-key');
    if (contentInput) contentInput.value = String(reader.result || '');
    const baseName = file.name.replace(/\.[^.]+$/, '');
    if (titleInput && !titleInput.value.trim()) titleInput.value = baseName;
    if (keyInput && !keyInput.dataset.editing) {
      let cleanKey = sanitizeColName(baseName, 0, new Set()).toLowerCase().slice(0, 24);
      if (!cleanKey || isReservedDatasetKey(cleanKey)) cleanKey = `dados_${cleanKey || 'csv'}`;
      keyInput.value = cleanKey;
    }
    updateCsvPreview();
    showToast(`Arquivo "${file.name}" carregado!`, 'success');
  };
  reader.onerror = () => showToast('Não foi possível ler o arquivo CSV.', 'error');
  reader.readAsText(file, 'UTF-8');
}

function suggestCsvKey() {
  const input = document.getElementById('csv-modal-key');
  if (input) input.value = generateCsvKey();
}

function closeCsvModal() {
  const modal = document.getElementById('csv-modal');
  if (modal) modal.style.display = 'none';
}

function saveCsvFromModal() {
  const keyInput = document.getElementById('csv-modal-key');
  const key = (keyInput?.value || '').trim().replace(/\s+/g, '_');
  const title = (document.getElementById('csv-modal-title')?.value || '').trim();
  const raw = (document.getElementById('csv-modal-content')?.value || '').trim();
  const editingKey = keyInput?.dataset.editing;
  const options = _getCsvModalOptions();

  if (!key) { showToast('Defina uma chave para o dataset.', 'error'); keyInput?.focus(); return; }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
    showToast('Chave inválida. Comece com letra/_ e use apenas letras, números e _.', 'error');
    keyInput?.focus();
    return;
  }
  if (isReservedDatasetKey(key)) {
    showToast(`A chave "${key}" conflita com uma palavra reservada ou biblioteca oficial. Escolha outro nome (ex: dados_${key}).`, 'error', 4200);
    keyInput?.focus();
    return;
  }
  if (!raw) { showToast('Cole ou carregue um CSV antes de salvar.', 'error'); return; }

  const parsed = parseCSV(raw, options);
  if (parsed.error) { showToast('Erro no CSV: ' + parsed.error, 'error'); return; }

  let datasets = getCsvDatasets();
  datasets = datasets.filter(d => d.key !== key && (!editingKey || d.key !== editingKey));
  datasets.unshift({
    key,
    title: title || key,
    raw,
    options,
    columns: parsed.columns,
    rows: parsed.rows,
    delimiter: parsed.delimiter,
    audit: parsed.audit,
    updatedAt: new Date().toISOString(),
    createdAt: Date.now(),
  });
  const saved = saveCsvDatasets(datasets);
  if (!saved.ok) return;

  closeCsvModal();
  renderCsvList();
  window.dispatchEvent(new CustomEvent('crab-highlight-refresh'));
  showToast(`Dataset "${key}" salvo com ${parsed.columns.length} colunas e ${parsed.rows} linhas!`, 'success');
}

function exportCsvFile(key) {
  const ds = getCsvDatasets().find(d => d.key === key);
  if (!ds) return;
  const delim = ds.delimiter || ',';
  const escapeCell = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return (s.includes(delim) || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  let csvText = ds.raw;
  if (!csvText && Array.isArray(ds.columns) && ds.columns.length > 0) {
    const headerLine = ds.columns.map(c => escapeCell(c.name)).join(delim);
    const rowCount = ds.columns[0].values.length;
    const bodyLines = [];
    for (let r = 0; r < rowCount; r++) {
      bodyLines.push(ds.columns.map(c => escapeCell(c.values[r])).join(delim));
    }
    csvText = [headerLine, ...bodyLines].join('\n');
  }
  const blob = new Blob([csvText || ''], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.download = `${ds.key}.csv`;
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  showToast(`Dataset exportado como "${ds.key}.csv"!`, 'success');
}

async function deleteCsvDataset(key) {
  const ok = await showConfirm({
    title: 'Remover dataset CSV',
    message: `Deseja remover permanentemente o dataset "${key}"?`,
    confirmText: 'Remover',
    danger: true,
  });
  if (!ok) return;
  const datasets = getCsvDatasets().filter(d => d.key !== key);
  saveCsvDatasets(datasets);
  renderCsvList();
  window.dispatchEvent(new CustomEvent('crab-highlight-refresh'));
  showToast(`Dataset "${key}" removido.`, 'info');
}

async function copyCsvImport(key, btn) {
  await copyText(`importe ${key}`);
  showToast(`"importe ${key}" copiado!`, 'success', 1600);
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado';
    setTimeout(() => { btn.textContent = orig; }, 1400);
  }
}

function testCsvInEditor(key) {
  const ds = getCsvDatasets().find(d => d.key === key);
  if (!ds) return;
  const numCols = ds.columns.filter(c => c.type === 'number');
  const firstCol = numCols[0] || ds.columns[0];
  const lines = [
    `importe ${ds.key}`,
    `apresente "Dataset: ${ds.title || ds.key}" em destaque`,
  ];
  if (firstCol) {
    lines.push(`apresente ${firstCol.name} em dados`);
    if (firstCol.type === 'number') {
      lines.push(`apresente ${firstCol.name} em estatisticas`);
      lines.push(`apresente ${firstCol.name} em grafico`);
    }
  }
  if (typeof window.tryInEditor === 'function') {
    window.tryInEditor(lines.join('\n'), true);
  }
}

function renderCsvList() {
  const container = document.getElementById('dados-list');
  if (!container) return;
  const datasets = getCsvDatasets();

  if (datasets.length === 0) {
    container.innerHTML = `<div class="empty-state-card">
      <div class="empty-state-title">Nenhum dataset CSV importado</div>
      <div class="empty-state-sub">Envie um arquivo <code>.csv</code> (separado por <code>,</code>, <code>;</code>, <code>|</code> ou tabulação, inclusive números PT-BR como <code>R$ 1.250,50</code>) ou cole os dados em <strong>＋ Novo CSV</strong>. Cada coluna vira uma lista pronta para análise estatística e gráficos.</div>
    </div>`;
    return;
  }

  container.innerHTML = '';
  for (const ds of datasets) {
    const card = document.createElement('div');
    card.className = 'csv-card';

    const colMeta = ds.columns.map(c =>
      `<span class="csv-col-item" title="${escapeHtml(c.original)} (${c.type === 'number' ? 'numérico' : 'texto'})">${escapeHtml(c.name)} <small>${c.type === 'number' ? '#' : 'Aa'}</small></span>`
    ).join('');

    const auditSummary = ds.audit && (ds.audit.emptyCells > 0 || ds.audit.raggedRows > 0 || ds.audit.renamedHeaders?.length > 0)
      ? `<div class="csv-card-audit">Blindagem ativa: ${ds.audit.renamedHeaders?.length || 0} cabeçalho(s) sanitizado(s) · ${ds.audit.emptyCells || 0} célula(s) vazia(s) · ${ds.audit.raggedRows || 0} linha(s) ajustada(s)</div>`
      : '';

    card.innerHTML = `
      <div class="csv-card-header">
        <span class="csv-card-key">importe ${escapeHtml(ds.key)}</span>
        <span class="csv-card-title">${escapeHtml(ds.title || 'Sem título')}</span>
        <span class="csv-card-stats">${ds.columns.length} col · ${ds.rows} linha(s)</span>
      </div>
      <div class="csv-card-cols">${colMeta}</div>
      ${auditSummary}
      <div class="csv-card-actions">
        <button type="button" class="btn btn-sm btn-accent-soft" data-action="test">▶ Testar no Editor</button>
        <button type="button" class="btn btn-sm" data-action="copy">Copiar importe</button>
        <button type="button" class="btn btn-sm" data-action="export">Baixar .csv</button>
        <button type="button" class="btn btn-sm" data-action="edit">Editar</button>
        <button type="button" class="btn btn-sm btn-danger-ghost" data-action="delete">Remover</button>
      </div>
    `;

    card.querySelector('[data-action="test"]').addEventListener('click', () => testCsvInEditor(ds.key));
    card.querySelector('[data-action="copy"]').addEventListener('click', (e) => copyCsvImport(ds.key, e.currentTarget));
    card.querySelector('[data-action="export"]').addEventListener('click', () => exportCsvFile(ds.key));
    card.querySelector('[data-action="edit"]').addEventListener('click', () => openCsvModal(ds.key));
    card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteCsvDataset(ds.key));
    container.appendChild(card);
  }
}

// Inject CSV datasets into runtime as JS before user code runs
function getCsvInjectionCode(sourceOverride = null) {
  const source = sourceOverride !== null
    ? sourceOverride
    : (document.getElementById('code-editor')?.value || '');
  const stripped = source.replace(/#.*$/gm, '');
  const importPattern = /\bimporte\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const datasets = getCsvDatasets();
  const datasetMap = Object.fromEntries(datasets.map(d => [d.key, d]));
  const injected = new Set();
  let injection = '';
  let m;
  while ((m = importPattern.exec(stripped)) !== null) {
    const key = m[1];
    if (datasetMap[key] && !injected.has(key)) {
      injected.add(key);
      injection += `// Dataset CSV: ${key}\n` + csvColumnsToJs(datasetMap[key]) + '\n';
    }
  }
  return injection;
}

// ==================== SCRIPTS ENGINE (CONSISTENT & SYNCED) ====================
const SCRIPTS_KEY = 'crabcode_scripts';
let _editingScriptId = null;

function generateScriptId() {
  return `sc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadScripts() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const data = JSON.parse(localStorage.getItem(SCRIPTS_KEY) || '[]');
    if (!Array.isArray(data)) return [];
    const seenIds = new Set();
    return data
      .filter(s => s && typeof s === 'object' && typeof s.title === 'string')
      .map(s => {
        let id = s.id != null ? String(s.id) : generateScriptId();
        while (seenIds.has(id)) id = generateScriptId();
        seenIds.add(id);
        return {
          id,
          title: s.title.trim() || 'Sem título',
          desc: typeof s.desc === 'string' ? s.desc : '',
          code: typeof s.code === 'string' ? s.code : '',
          createdAt: s.createdAt || new Date().toISOString(),
          updatedAt: s.updatedAt || s.createdAt || new Date().toISOString(),
        };
      });
  } catch {
    return [];
  }
}

function saveScripts(scripts) {
  return safeSetItem(SCRIPTS_KEY, JSON.stringify(scripts));
}

function openScriptModal(editId = null, prefillCode = null) {
  const modal = document.getElementById('script-modal');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const codeEl = document.getElementById('modal-code');
  const heading = document.getElementById('script-modal-heading');

  _editingScriptId = null;

  if (editId !== null && editId !== undefined) {
    const existing = loadScripts().find(s => String(s.id) === String(editId));
    if (existing) {
      _editingScriptId = existing.id;
      titleEl.value = existing.title || '';
      descEl.value = existing.desc || '';
      codeEl.value = prefillCode !== null ? prefillCode : (existing.code || '');
      if (heading) heading.textContent = 'Editar Script';
    }
  } else {
    titleEl.value = '';
    descEl.value = '';
    codeEl.value = prefillCode !== null ? prefillCode : '';
    if (heading) heading.textContent = prefillCode !== null ? 'Salvar Código do Editor' : 'Novo Script';
  }

  modal.style.display = 'flex';
  setTimeout(() => titleEl?.focus(), 40);
}

function openSaveCurrentScriptModal() {
  const currentCode = document.getElementById('code-editor')?.value || '';
  const active = getActiveScript();
  if (active) {
    openScriptModal(active.id, currentCode);
  } else {
    openScriptModal(null, currentCode);
  }
}

function closeScriptModal() {
  const modal = document.getElementById('script-modal');
  if (modal) modal.style.display = 'none';
  _editingScriptId = null;
}

function saveScript() {
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const codeEl = document.getElementById('modal-code');

  const title = titleEl.value.trim();
  const desc = descEl.value.trim();
  const code = codeEl.value;

  if (!title) {
    titleEl.focus();
    showToast('Dê um título ao script antes de salvar.', 'error');
    return;
  }
  if (!code.trim()) {
    codeEl.focus();
    showToast('O código do script não pode ficar vazio.', 'error');
    return;
  }

  const scripts = loadScripts();
  const now = new Date().toISOString();
  let savedId;

  if (_editingScriptId !== null) {
    const idx = scripts.findIndex(s => String(s.id) === String(_editingScriptId));
    if (idx !== -1) {
      scripts[idx] = { ...scripts[idx], title, desc, code, updatedAt: now };
      savedId = scripts[idx].id;
    } else {
      savedId = generateScriptId();
      scripts.unshift({ id: savedId, title, desc, code, createdAt: now, updatedAt: now });
    }
    showToast(`Script "${title}" atualizado!`, 'success');
  } else {
    savedId = generateScriptId();
    scripts.unshift({ id: savedId, title, desc, code, createdAt: now, updatedAt: now });
    showToast(`Script "${title}" salvo na biblioteca!`, 'success');
  }

  if (!saveScripts(scripts).ok) return;

  // If this script is currently active in the editor (or was saved from the editor), sync state!
  const codeEditor = document.getElementById('code-editor');
  if (codeEditor && (String(getActiveScriptId()) === String(savedId) || codeEditor.value === code)) {
    codeEditor.value = code;
    safeSetItem('crabcode-source', code);
    setActiveScriptId(savedId);
    window.dispatchEvent(new CustomEvent('crab-highlight-refresh'));
  }

  closeScriptModal();
  renderScripts();
}

function duplicateScript(id) {
  const scripts = loadScripts();
  const orig = scripts.find(s => String(s.id) === String(id));
  if (!orig) return;
  const now = new Date().toISOString();
  const copy = {
    id: generateScriptId(),
    title: `${orig.title} (cópia)`,
    desc: orig.desc,
    code: orig.code,
    createdAt: now,
    updatedAt: now,
  };
  scripts.unshift(copy);
  if (!saveScripts(scripts).ok) return;
  renderScripts();
  showToast(`Script duplicado como "${copy.title}"!`, 'success', 1800);
}

function deleteScript(id) {
  const scripts = loadScripts().filter(s => String(s.id) !== String(id));
  saveScripts(scripts);
  if (String(getActiveScriptId()) === String(id)) {
    clearActiveScript();
  }
  renderScripts();
}

async function confirmDeleteScript(btnOrId) {
  const id = (typeof btnOrId === 'string' || typeof btnOrId === 'number')
    ? String(btnOrId)
    : String(btnOrId?.dataset?.id || '');
  const target = loadScripts().find(s => String(s.id) === id);
  const ok = await showConfirm({
    title: 'Excluir script',
    message: `Deseja excluir permanentemente o script "${target?.title || ''}"?`,
    confirmText: 'Excluir',
    danger: true,
  });
  if (!ok) return;
  deleteScript(id);
  showToast('Script excluído.', 'info');
}

async function copyScriptCode(id, btn) {
  const s = loadScripts().find(x => String(x.id) === String(id));
  if (!s) return;
  await copyText(s.code);
  showToast(`Código de "${s.title}" copiado!`, 'success', 1600);
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado';
    setTimeout(() => { btn.textContent = orig; }, 1400);
  }
}

function exportScriptFile(id) {
  const s = loadScripts().find(x => String(x.id) === String(id));
  if (!s) return;
  const slug = s.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'script';
  const blob = new Blob([s.code], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.download = `${slug}.crab`;
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  showToast(`Exportado como "${slug}.crab"`, 'success');
}

function exportAllScriptsBackup() {
  const scripts = loadScripts();
  if (scripts.length === 0) {
    showToast('Não há scripts salvos para fazer backup.', 'info');
    return;
  }
  const payload = { version: 1, exportedAt: new Date().toISOString(), scripts };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.download = `crabcode-scripts-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  showToast(`Backup de ${scripts.length} script(s) exportado!`, 'success');
}

function importScriptFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || '');
    const scripts = loadScripts();
    const now = new Date().toISOString();

    // Support JSON backup collections as well as single .crab/.txt files
    if (file.name.toLowerCase().endsWith('.json')) {
      try {
        const parsed = JSON.parse(text);
        const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.scripts) ? parsed.scripts : null);
        if (list) {
          let added = 0;
          for (const item of list) {
            if (item && typeof item.code === 'string') {
              scripts.unshift({
                id: generateScriptId(),
                title: String(item.title || 'Script importado').trim(),
                desc: String(item.desc || `Importado de ${file.name}`),
                code: item.code,
                createdAt: item.createdAt || now,
                updatedAt: now,
              });
              added++;
            }
          }
          if (added > 0 && saveScripts(scripts).ok) {
            renderScripts();
            showToast(`${added} script(s) importado(s) do backup!`, 'success');
            return;
          }
        }
      } catch {
        showToast('Arquivo JSON inválido.', 'error');
        return;
      }
    }

    const title = file.name.replace(/\.[^.]+$/, '');
    scripts.unshift({
      id: generateScriptId(),
      title,
      desc: `Importado de ${file.name}`,
      code: text,
      createdAt: now,
      updatedAt: now,
    });
    if (saveScripts(scripts).ok) {
      renderScripts();
      showToast(`Script "${title}" importado!`, 'success');
    }
  };
  reader.onerror = () => showToast('Não foi possível ler o arquivo.', 'error');
  reader.readAsText(file, 'UTF-8');
}

function formatScriptDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
       + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function renderScripts() {
  const query = (document.getElementById('scripts-search')?.value || '').toLowerCase().trim();
  const sortBy = document.getElementById('scripts-sort')?.value || 'recent';
  const activeId = getActiveScriptId();
  const scripts = loadScripts();
  const list = document.getElementById('scripts-list');
  if (!list) return;

  let filtered = scripts.filter(s => {
    if (!query) return true;
    return s.title.toLowerCase().includes(query)
        || (s.desc || '').toLowerCase().includes(query)
        || s.code.toLowerCase().includes(query);
  });

  if (sortBy === 'alpha') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  } else {
    filtered = [...filtered].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }

  if (filtered.length === 0) {
    list.innerHTML = query
      ? `<div class="empty-state-card"><div class="empty-state-title">Nenhum script encontrado</div><div class="empty-state-sub">Nenhum resultado para "<strong>${escapeHtml(query)}</strong>".</div></div>`
      : `<div class="empty-state-card"><div class="empty-state-title">Sua coleção de scripts está vazia</div><div class="empty-state-sub">Clique em <strong>Salvar código atual</strong> ou <strong>＋ Novo Script</strong> para guardar programas reutilizáveis, ou importe arquivos <code>.crab</code> / backup <code>.json</code>.</div></div>`;
    return;
  }

  list.innerHTML = '';
  for (const s of filtered) {
    const isActive = activeId && String(activeId) === String(s.id);
    const card = document.createElement('div');
    card.className = 'script-card' + (isActive ? ' is-active-script' : '');

    const codeLines = s.code.split('\n').slice(0, 12).map(line =>
      `<div class="hl-line">${highlightLine(line) || '&nbsp;'}</div>`
    ).join('');
    const totalLines = s.code.split('\n').length;
    const truncated = totalLines > 12
      ? `<div class="script-more-lines">+ ${totalLines - 12} linha(s)…</div>`
      : '';

    card.innerHTML = `
      <div class="script-card-header">
        <div class="script-card-meta">
          <p class="script-card-title">${escapeHtml(s.title)}${isActive ? ' <span class="script-active-tag">Aberto no Editor</span>' : ''}</p>
          ${s.desc ? `<p class="script-card-desc">${escapeHtml(s.desc)}</p>` : ''}
        </div>
        <span class="script-card-date">${totalLines} ln · ${formatScriptDate(s.updatedAt || s.createdAt)}</span>
      </div>
      <div class="script-card-actions">
        <button type="button" class="btn btn-sm btn-accent-soft" data-action="run">▶ Abrir e Rodar</button>
        <button type="button" class="btn btn-sm" data-action="open">Abrir no editor</button>
        <button type="button" class="btn btn-sm" data-action="edit">Editar</button>
        <button type="button" class="btn btn-sm" data-action="duplicate">Duplicar</button>
        <button type="button" class="btn btn-sm" data-action="copy">Copiar</button>
        <button type="button" class="btn btn-sm" data-action="export">Baixar .crab</button>
        <button type="button" class="btn btn-sm btn-danger-ghost" data-action="delete">Excluir</button>
      </div>
      <div class="script-code-block">${codeLines}${truncated}</div>
    `;

    card.querySelector('[data-action="run"]').addEventListener('click', () => {
      setActiveScriptId(s.id);
      if (typeof window.tryInEditor === 'function') window.tryInEditor(s.code, true, { keepActiveScript: true });
    });
    card.querySelector('[data-action="open"]').addEventListener('click', () => {
      if (typeof window.loadIntoEditor === 'function') window.loadIntoEditor(s.id);
    });
    card.querySelector('[data-action="edit"]').addEventListener('click', () => openScriptModal(s.id));
    card.querySelector('[data-action="duplicate"]').addEventListener('click', () => duplicateScript(s.id));
    card.querySelector('[data-action="copy"]').addEventListener('click', (e) => copyScriptCode(s.id, e.currentTarget));
    card.querySelector('[data-action="export"]').addEventListener('click', () => exportScriptFile(s.id));
    card.querySelector('[data-action="delete"]').addEventListener('click', () => confirmDeleteScript(s.id));
    list.appendChild(card);
  }
}

export {
  safeSetItem, RESERVED_IDENTIFIERS, isReservedDatasetKey,
  loadCode, saveCode, DEFAULT_CODE,
  setActiveScriptId, getActiveScriptId, getActiveScript, clearActiveScript, updateActiveScriptBadge,
  parseCSV, parseSmartNumber, sanitizeColName, csvColumnsToJs,
  getCsvDatasets, saveCsvDatasets, getCsvInjectionCode,
  openCsvModal, closeCsvModal, saveCsvFromModal, renderCsvList,
  suggestCsvKey, copyCsvImport, deleteCsvDataset, loadCsvFile, testCsvInEditor, exportCsvFile,
  loadScripts, saveScripts, openScriptModal, openSaveCurrentScriptModal,
  closeScriptModal, saveScript, duplicateScript, deleteScript, copyScriptCode,
  confirmDeleteScript, formatScriptDate, renderScripts,
  exportScriptFile, exportAllScriptsBackup, importScriptFile,
};
