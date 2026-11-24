import { escapeHtml, highlightLine } from './utils.js';
import { showToast, showConfirm, copyText } from './ui.js';

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
apresente "Abra o Tutorial ou Modelos (Ctrl+K) para explorar todas as 100 bibliotecas!" em texto`;

// ==================== LOAD / SAVE CODE ====================
function loadCode() {
  const codeEditor = document.getElementById('code-editor');
  if (!codeEditor) return;
  const saved = localStorage.getItem('crabcode-source');
  codeEditor.value = (saved !== null && saved !== '') ? saved : DEFAULT_CODE;
}

let _savedTimer = null;
function saveCode() {
  const codeEditor = document.getElementById('code-editor');
  if (!codeEditor) return;
  const savedIndicator = document.getElementById('saved-indicator');
  localStorage.setItem('crabcode-source', codeEditor.value);
  if (savedIndicator) {
    savedIndicator.classList.add('show');
    clearTimeout(_savedTimer);
    _savedTimer = setTimeout(() => savedIndicator.classList.remove('show'), 1600);
  }
}

// ==================== CSV / DADOS SYSTEM ====================
const CSV_STORAGE_KEY = 'crabcode_csv_datasets';

function getCsvDatasets() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const data = JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCsvDatasets(datasets) {
  localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(datasets));
}

function generateCsvKey() {
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const existing = new Set(getCsvDatasets().map(d => d.key));
  let key, attempts = 0;
  do {
    key = consonants[Math.floor(Math.random() * consonants.length)]
        + vowels[Math.floor(Math.random() * vowels.length)]
        + consonants[Math.floor(Math.random() * consonants.length)]
        + vowels[Math.floor(Math.random() * vowels.length)];
    attempts++;
  } while (existing.has(key) && attempts < 100);
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

  let candidate = clean;
  let suffix = 2;
  while (usedNames.has(candidate)) {
    candidate = `${clean}_${suffix++}`;
  }
  usedNames.add(candidate);
  return candidate;
}

function detectDelimiter(text) {
  const firstLineEnd = text.search(/\r?\n/);
  const sample = firstLineEnd === -1 ? text : text.slice(0, firstLineEnd);
  let inQuote = false;
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (let i = 0; i < sample.length; i++) {
    const ch = sample[i];
    if (ch === '"') {
      if (inQuote && sample[i + 1] === '"') { i++; continue; }
      inQuote = !inQuote;
    } else if (!inQuote && counts[ch] !== undefined) {
      counts[ch]++;
    }
  }
  if (counts[';'] > counts[','] && counts[';'] >= counts['\t']) return ';';
  if (counts['\t'] > counts[','] && counts['\t'] > counts[';']) return '\t';
  return ',';
}

function parseCSV(raw) {
  if (typeof raw !== 'string') return { columns: [], rows: 0, error: 'CSV inválido.' };
  const cleaned = raw.replace(/^\uFEFF/, '');
  if (!cleaned.trim()) return { columns: [], rows: 0, error: 'CSV vazio.' };

  const delimiter = detectDelimiter(cleaned);

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

  const rawHeaders = records[0];
  if (rawHeaders.length === 0 || rawHeaders.every(h => h === '')) {
    return { columns: [], rows: 0, error: 'Cabeçalho sem colunas.' };
  }

  const usedNames = new Set();
  const headers = rawHeaders.map((h, i) => ({
    original: h || `col_${i + 1}`,
    name: sanitizeColName(h, i, usedNames),
  }));

  const rawCols = headers.map(() => []);
  let nonEmptyDataRows = 0;

  for (let r = 1; r < records.length; r++) {
    const rec = records[r];
    const isRowEmpty = rec.every(c => c === '');
    if (!isRowEmpty) nonEmptyDataRows++;
    headers.forEach((_, ci) => {
      rawCols[ci].push(rec[ci] !== undefined ? rec[ci] : '');
    });
  }

  const parseNumeric = (v) => {
    if (v === '') return null;
    // Standard number (dot decimal or scientific notation)
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(v)) return Number(v);
    // PT-BR decimal comma (only when delimiter is not ',')
    if (delimiter !== ',' && /^-?\d+,\d+$/.test(v)) return Number(v.replace(',', '.'));
    return NaN;
  };

  const columns = headers.map((h, ci) => {
    const vals = rawCols[ci];
    const hasAnyValue = vals.some(v => v !== '');
    const allNumeric = hasAnyValue && vals.every(v => {
      if (v === '') return true;
      const n = parseNumeric(v);
      return !isNaN(n) && isFinite(n);
    });

    const values = vals.map(v => {
      if (v === '') return null;
      return allNumeric ? parseNumeric(v) : v;
    });

    return {
      name: h.name,
      original: h.original,
      type: allNumeric ? 'number' : 'string',
      values,
    };
  });

  return { columns, rows: nonEmptyDataRows, delimiter };
}

function csvColumnsToJs(dataset) {
  return dataset.columns.map(col => {
    const vals = col.values.map(v => {
      if (v === null || v === undefined) return 'null';
      return col.type === 'number' ? String(v) : JSON.stringify(String(v));
    });
    return `var ${col.name} = [${vals.join(', ')}];`;
  }).join('\n');
}

function openCsvModal(existingKey) {
  const modal = document.getElementById('csv-modal');
  const keyInput = document.getElementById('csv-modal-key');
  const titleInput = document.getElementById('csv-modal-title');
  const contentInput = document.getElementById('csv-modal-content');
  const preview = document.getElementById('csv-modal-preview');
  const tablePreview = document.getElementById('csv-modal-table-preview');
  const heading = document.getElementById('csv-modal-heading');

  if (existingKey) {
    const ds = getCsvDatasets().find(d => d.key === existingKey);
    if (ds) {
      keyInput.value = ds.key;
      titleInput.value = ds.title || '';
      contentInput.value = ds.raw;
      keyInput.dataset.editing = existingKey;
      if (heading) heading.textContent = `Editar Dataset — ${ds.key}`;
    }
  } else {
    keyInput.value = generateCsvKey();
    titleInput.value = '';
    contentInput.value = '';
    delete keyInput.dataset.editing;
    if (heading) heading.textContent = 'Importar Dataset CSV';
  }

  if (preview) preview.textContent = '';
  if (tablePreview) tablePreview.innerHTML = '';
  modal.style.display = 'flex';

  contentInput.oninput = () => updateCsvPreview();
  if (existingKey) updateCsvPreview();
  setTimeout(() => titleInput?.focus(), 40);
}

function updateCsvPreview() {
  const raw = document.getElementById('csv-modal-content')?.value || '';
  const preview = document.getElementById('csv-modal-preview');
  const tablePreview = document.getElementById('csv-modal-table-preview');
  if (!raw.trim()) {
    if (preview) preview.textContent = '';
    if (tablePreview) tablePreview.innerHTML = '';
    return;
  }

  const result = parseCSV(raw);
  if (result.error) {
    if (preview) {
      preview.textContent = '⚠ ' + result.error;
      preview.style.color = 'var(--color-vermelho)';
    }
    if (tablePreview) tablePreview.innerHTML = '';
    return;
  }

  const delimName = result.delimiter === ';' ? 'ponto-e-vírgula (;)' : result.delimiter === '\t' ? 'tabulação' : 'vírgula (,)';
  const summary = result.columns.map(c =>
    `${c.name} (${c.type === 'number' ? 'num' : 'texto'})`
  ).join(' · ');

  if (preview) {
    preview.textContent = `✓ ${result.columns.length} coluna(s) · ${result.rows} linha(s) · separador: ${delimName} — ${summary}`;
    preview.style.color = 'var(--color-verde)';
  }

  if (tablePreview && result.columns.length > 0) {
    const maxPreviewRows = Math.min(5, result.columns[0].values.length);
    const thead = `<thead><tr>${result.columns.map(c =>
      `<th>${escapeHtml(c.name)} <span class="csv-col-type">${c.type === 'number' ? '#' : 'Aa'}</span></th>`
    ).join('')}</tr></thead>`;
    let tbodyRows = '';
    for (let r = 0; r < maxPreviewRows; r++) {
      tbodyRows += `<tr>${result.columns.map(c => {
        const val = c.values[r];
        return `<td>${val === null || val === undefined ? '<span class="muted">—</span>' : escapeHtml(String(val))}</td>`;
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
  const reader = new FileReader();
  reader.onload = () => {
    const contentInput = document.getElementById('csv-modal-content');
    const titleInput = document.getElementById('csv-modal-title');
    const keyInput = document.getElementById('csv-modal-key');
    if (contentInput) contentInput.value = String(reader.result || '');
    const baseName = file.name.replace(/\.[^.]+$/, '');
    if (titleInput && !titleInput.value.trim()) titleInput.value = baseName;
    if (keyInput && !keyInput.dataset.editing) {
      const cleanKey = sanitizeColName(baseName, 0, new Set()).toLowerCase().slice(0, 20);
      if (cleanKey) keyInput.value = cleanKey;
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

  if (!key) { showToast('Defina uma chave para o dataset.', 'error'); keyInput?.focus(); return; }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
    showToast('Chave inválida. Comece com letra/_ e use apenas letras, números e _.', 'error');
    keyInput?.focus();
    return;
  }
  if (!raw) { showToast('Cole ou carregue um CSV antes de salvar.', 'error'); return; }

  const parsed = parseCSV(raw);
  if (parsed.error) { showToast('Erro no CSV: ' + parsed.error, 'error'); return; }

  let datasets = getCsvDatasets();
  // Remove both old key (if renamed) and any colliding new key
  datasets = datasets.filter(d => d.key !== key && (!editingKey || d.key !== editingKey));
  datasets.unshift({
    key,
    title: title || key,
    raw,
    columns: parsed.columns,
    rows: parsed.rows,
    delimiter: parsed.delimiter,
    createdAt: Date.now(),
  });
  saveCsvDatasets(datasets);
  closeCsvModal();
  renderCsvList();
  window.dispatchEvent(new CustomEvent('crab-highlight-refresh'));
  showToast(`Dataset "${key}" salvo com ${parsed.columns.length} colunas e ${parsed.rows} linhas!`, 'success');
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
      <div class="empty-state-sub">Envie um arquivo <code>.csv</code> (separado por <code>,</code> ou <code>;</code>) ou cole os dados em <strong>＋ Novo CSV</strong>. Cada coluna vira uma lista pronta para análise estatística e gráficos.</div>
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

    card.innerHTML = `
      <div class="csv-card-header">
        <span class="csv-card-key">importe ${escapeHtml(ds.key)}</span>
        <span class="csv-card-title">${escapeHtml(ds.title || 'Sem título')}</span>
        <span class="csv-card-stats">${ds.columns.length} col · ${ds.rows} linha(s)</span>
      </div>
      <div class="csv-card-cols">${colMeta}</div>
      <div class="csv-card-actions">
        <button type="button" class="btn btn-sm btn-accent-soft" data-action="test">▶ Testar no Editor</button>
        <button type="button" class="btn btn-sm" data-action="copy">Copiar importe</button>
        <button type="button" class="btn btn-sm" data-action="edit">Editar</button>
        <button type="button" class="btn btn-sm btn-danger-ghost" data-action="delete">Remover</button>
      </div>
    `;

    card.querySelector('[data-action="test"]').addEventListener('click', () => testCsvInEditor(ds.key));
    card.querySelector('[data-action="copy"]').addEventListener('click', (e) => copyCsvImport(ds.key, e.currentTarget));
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
  // Strip single-line # comments so commented imports are ignored
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

// ==================== SCRIPTS ENGINE ====================
const SCRIPTS_KEY = 'crabcode_scripts';
let _editingScriptId = null;

function loadScripts() {
  try {
    const data = JSON.parse(localStorage.getItem(SCRIPTS_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveScripts(scripts) {
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
}

function openScriptModal(editId = null, prefillCode = null) {
  const modal = document.getElementById('script-modal');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const codeEl = document.getElementById('modal-code');
  const heading = document.getElementById('script-modal-heading');

  _editingScriptId = null;

  if (editId !== null && typeof editId === 'number') {
    const existing = loadScripts().find(s => s.id === editId);
    if (existing) {
      _editingScriptId = existing.id;
      titleEl.value = existing.title || '';
      descEl.value = existing.desc || '';
      codeEl.value = existing.code || '';
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
  openScriptModal(null, currentCode);
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
  if (_editingScriptId !== null) {
    const idx = scripts.findIndex(s => s.id === _editingScriptId);
    if (idx !== -1) {
      scripts[idx] = { ...scripts[idx], title, desc, code, updatedAt: new Date().toISOString() };
    }
    showToast(`Script "${title}" atualizado!`, 'success');
  } else {
    scripts.unshift({
      id: Date.now(),
      title,
      desc,
      code,
      createdAt: new Date().toISOString(),
    });
    showToast(`Script "${title}" salvo na biblioteca!`, 'success');
  }

  saveScripts(scripts);
  closeScriptModal();
  renderScripts();
}

function deleteScript(id) {
  const scripts = loadScripts().filter(s => s.id !== id);
  saveScripts(scripts);
  renderScripts();
}

async function confirmDeleteScript(btnOrId) {
  const id = typeof btnOrId === 'number' ? btnOrId : Number(btnOrId?.dataset?.id);
  const target = loadScripts().find(s => s.id === id);
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
  const s = loadScripts().find(x => x.id === id);
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
  const s = loadScripts().find(x => x.id === id);
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

function importScriptFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const code = String(reader.result || '');
    const title = file.name.replace(/\.[^.]+$/, '');
    const scripts = loadScripts();
    scripts.unshift({
      id: Date.now(),
      title,
      desc: `Importado de ${file.name}`,
      code,
      createdAt: new Date().toISOString(),
    });
    saveScripts(scripts);
    renderScripts();
    showToast(`Script "${title}" importado!`, 'success');
  };
  reader.onerror = () => showToast('Não foi possível ler o arquivo.', 'error');
  reader.readAsText(file, 'UTF-8');
}

function formatScriptDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
       + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function renderScripts() {
  const query = (document.getElementById('scripts-search')?.value || '').toLowerCase().trim();
  const scripts = loadScripts();
  const list = document.getElementById('scripts-list');
  if (!list) return;

  const filtered = scripts.filter(s => {
    if (!query) return true;
    return s.title.toLowerCase().includes(query)
        || (s.desc || '').toLowerCase().includes(query)
        || s.code.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    list.innerHTML = query
      ? `<div class="empty-state-card"><div class="empty-state-title">Nenhum script encontrado</div><div class="empty-state-sub">Nenhum resultado para "<strong>${escapeHtml(query)}</strong>".</div></div>`
      : `<div class="empty-state-card"><div class="empty-state-title">Sua coleção de scripts está vazia</div><div class="empty-state-sub">Clique em <strong>Salvar código atual</strong> ou <strong>＋ Novo Script</strong> para guardar programas reutilizáveis ou importar arquivos <code>.crab</code>.</div></div>`;
    return;
  }

  list.innerHTML = '';
  for (const s of filtered) {
    const card = document.createElement('div');
    card.className = 'script-card';

    const codeLines = s.code.split('\n').slice(0, 14).map(line =>
      `<div class="hl-line">${highlightLine(line) || '&nbsp;'}</div>`
    ).join('');
    const truncated = s.code.split('\n').length > 14
      ? `<div class="script-more-lines">+ ${s.code.split('\n').length - 14} linha(s)…</div>`
      : '';

    card.innerHTML = `
      <div class="script-card-header">
        <div class="script-card-meta">
          <p class="script-card-title">${escapeHtml(s.title)}</p>
          ${s.desc ? `<p class="script-card-desc">${escapeHtml(s.desc)}</p>` : ''}
        </div>
        <span class="script-card-date">${formatScriptDate(s.updatedAt || s.createdAt)}</span>
      </div>
      <div class="script-card-actions">
        <button type="button" class="btn btn-sm btn-accent-soft" data-action="run">▶ Abrir e Rodar</button>
        <button type="button" class="btn btn-sm" data-action="open">Abrir no editor</button>
        <button type="button" class="btn btn-sm" data-action="edit">Editar</button>
        <button type="button" class="btn btn-sm" data-action="copy">Copiar</button>
        <button type="button" class="btn btn-sm" data-action="export">Baixar .crab</button>
        <button type="button" class="btn btn-sm btn-danger-ghost" data-action="delete">Excluir</button>
      </div>
      <div class="script-code-block">${codeLines}${truncated}</div>
    `;

    card.querySelector('[data-action="run"]').addEventListener('click', () => {
      if (typeof window.tryInEditor === 'function') window.tryInEditor(s.code, true);
    });
    card.querySelector('[data-action="open"]').addEventListener('click', () => {
      if (typeof window.loadIntoEditor === 'function') window.loadIntoEditor(s.id);
    });
    card.querySelector('[data-action="edit"]').addEventListener('click', () => openScriptModal(s.id));
    card.querySelector('[data-action="copy"]').addEventListener('click', (e) => copyScriptCode(s.id, e.currentTarget));
    card.querySelector('[data-action="export"]').addEventListener('click', () => exportScriptFile(s.id));
    card.querySelector('[data-action="delete"]').addEventListener('click', () => confirmDeleteScript(s.id));
    list.appendChild(card);
  }
}

export {
  loadCode, saveCode, DEFAULT_CODE,
  parseCSV, sanitizeColName, csvColumnsToJs,
  getCsvDatasets, saveCsvDatasets, getCsvInjectionCode,
  openCsvModal, closeCsvModal, saveCsvFromModal, renderCsvList,
  suggestCsvKey, copyCsvImport, deleteCsvDataset, loadCsvFile, testCsvInEditor,
  loadScripts, saveScripts, openScriptModal, openSaveCurrentScriptModal,
  closeScriptModal, saveScript, deleteScript, copyScriptCode,
  confirmDeleteScript, formatScriptDate, renderScripts,
  exportScriptFile, importScriptFile,
};
