import { escapeHtml, highlightLine, highlightCodeStatic } from './utils.js';

// ==================== DEFAULT CODE ====================
const DEFAULT_CODE = `importe biblioteca_geral
apresente 'Bem-vindo ao...' em texto
apresente "CrabCode IDE" em destaque
apresente "Versão 1.0.0" em dados
apresente "Vamos ver um pouquinho do que podemos fazer:" em texto
apresente "Podemos ver o fatorial de 5: " + rodar(execute fatorial(5)) em apresentação
apresente "Podemos rodar a área de um círculo de um raio de 3 cm: " + rodar(execute area_circulo(3)) + "cm²" em apresentação
apresente "Podemos ver quantos °F são 25°C: " + rodar(execute celsius_para_fahrenheit(25)) + "°F" em apresentação
apresente "Ou até mesmo ver quantos ml é uma colher de sopa: " + rodar(execute colher_sopa_para_ml(1)) + "ml" em apresentação
apresente "...E infinitamente mais! " em apresentação
apresente "E, por sinal, esse dashboard foi criado usando CrabCode! " em texto
apresente "Tudo isso em poucas linhas de código e sem dificuldade" em destaque
apresente "Você pode começar agora! Vá no TUTORIAL e comece a programar!" em texto`;

// ==================== LOAD SAVED CODE ====================
function loadCode() {
  const codeEditor = document.getElementById('code-editor');
  const saved = localStorage.getItem('crabcode-source');
  codeEditor.value = (saved !== null && saved !== '') ? saved : DEFAULT_CODE;
}

// ==================== SAVE CODE ====================
function saveCode() {
  const codeEditor = document.getElementById('code-editor');
  const savedIndicator = document.getElementById('saved-indicator');
  localStorage.setItem('crabcode-source', codeEditor.value);
  if (savedIndicator) {
    savedIndicator.classList.add('show');
    setTimeout(() => savedIndicator.classList.remove('show'), 1500);
  }
}


// ==================== CSV / DADOS SYSTEM ====================

const CSV_STORAGE_KEY = 'crabcode_csv_datasets';

function getCsvDatasets() {
  try { return JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
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
    // Generate pronounceable 4-letter key: CVCV pattern
    key = consonants[Math.floor(Math.random()*consonants.length)]
        + vowels[Math.floor(Math.random()*vowels.length)]
        + consonants[Math.floor(Math.random()*consonants.length)]
        + vowels[Math.floor(Math.random()*vowels.length)];
    attempts++;
  } while (existing.has(key) && attempts < 100);
  return key;
}

function parseCSV(raw) {
  // Split into lines, ignore completely empty trailing lines
  const lines = raw.split(/\r?\n/);
  while (lines.length && lines[lines.length-1].trim() === '') lines.pop();
  if (lines.length === 0) return { columns: [], error: 'CSV vazio.' };

  // Parse a single CSV line respecting quoted fields
  function parseLine(line) {
    const fields = [];
    let cur = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue; }
      cur += ch;
    }
    fields.push(cur);
    return fields.map(f => f.trim());
  }

  const headers = parseLine(lines[0]);
  if (headers.length === 0) return { columns: [], error: 'Sem colunas.' };

  // Collect values per column
  const raw_cols = headers.map(() => []);
  for (let r = 1; r < lines.length; r++) {
    // Blank line mid-data → null for all columns (not skipped)
    if (lines[r].trim() === '') {
      headers.forEach((_, ci) => raw_cols[ci].push(''));
      continue;
    }
    const fields = parseLine(lines[r]);
    headers.forEach((_, ci) => {
      raw_cols[ci].push(fields[ci] !== undefined ? fields[ci] : '');
    });
  }

  // Build column objects with type inference
  const columns = headers.map((name, ci) => {
    const rawVals = raw_cols[ci];
    // Infer: if ALL non-empty values are numeric → number array
    const allNumeric = rawVals.every(v => v === '' || (!isNaN(parseFloat(v)) && isFinite(v)));
    const values = rawVals.map(v => {
      if (v === '') return null;
      return allNumeric ? parseFloat(v) : v;
    });
    return { name: name.replace(/\s+/g,'_'), original: name, type: allNumeric ? 'number' : 'string', values };
  });

  const dataRows = lines.slice(1).filter(l => l.trim() !== '').length;
  return { columns, rows: dataRows };
}

function csvColumnsToJs(dataset) {
  // Generates JS variable declarations for each column array
  return dataset.columns.map(col => {
    const vals = col.values.map(v => v === null ? 'null' : (col.type === 'number' ? v : `"${String(v).replace(/"/g,'\\"')}"`));
    return `var ${col.name} = [${vals.join(', ')}];`;
  }).join('\n');
}

function openCsvModal(existingKey) {
  const modal = document.getElementById('csv-modal');
  const keyInput = document.getElementById('csv-modal-key');
  const titleInput = document.getElementById('csv-modal-title');
  const contentInput = document.getElementById('csv-modal-content');
  const preview = document.getElementById('csv-modal-preview');

  if (existingKey) {
    const ds = getCsvDatasets().find(d => d.key === existingKey);
    if (ds) {
      keyInput.value = ds.key;
      titleInput.value = ds.title || '';
      contentInput.value = ds.raw;
      keyInput.dataset.editing = existingKey;
    }
  } else {
    keyInput.value = generateCsvKey();
    titleInput.value = '';
    contentInput.value = '';
    delete keyInput.dataset.editing;
  }
  preview.textContent = '';
  modal.style.display = 'flex';

  // Live preview on typing
  contentInput.oninput = () => updateCsvPreview();
  if (existingKey) updateCsvPreview();
}

function updateCsvPreview() {
  const raw = document.getElementById('csv-modal-content').value.trim();
  const preview = document.getElementById('csv-modal-preview');
  if (!raw) { preview.textContent = ''; return; }
  const result = parseCSV(raw);
  if (result.error) { preview.textContent = '⚠ ' + result.error; return; }
  const summary = result.columns.map(c =>
    `${c.name} [${c.type === 'number' ? '🔢' : '🔤'}] × ${c.values.length}`
  ).join('  ·  ');
  preview.textContent = `✓ ${result.columns.length} coluna(s), ${result.rows} linha(s) de dados:  ${summary}`;
  preview.style.color = 'var(--color-verde)';
}

function suggestCsvKey() {
  document.getElementById('csv-modal-key').value = generateCsvKey();
}

function closeCsvModal() {
  document.getElementById('csv-modal').style.display = 'none';
}

function saveCsvFromModal() {
  const key = document.getElementById('csv-modal-key').value.trim().replace(/\s+/g,'_');
  const title = document.getElementById('csv-modal-title').value.trim();
  const raw = document.getElementById('csv-modal-content').value.trim();
  const editingKey = document.getElementById('csv-modal-key').dataset.editing;

  if (!key) { alert('Defina uma key para o dataset.'); return; }
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) { alert('Key inválida. Use apenas letras, números e _'); return; }
  if (!raw) { alert('Cole um CSV antes de salvar.'); return; }

  const parsed = parseCSV(raw);
  if (parsed.error) { alert('Erro no CSV: ' + parsed.error); return; }

  let datasets = getCsvDatasets();
  // Remove existing if editing or same key
  datasets = datasets.filter(d => d.key !== (editingKey || key));

  datasets.push({ key, title, raw, columns: parsed.columns, rows: parsed.rows, createdAt: Date.now() });
  saveCsvDatasets(datasets);
  closeCsvModal();
  renderCsvList();
}

function deleteCsvDataset(key) {
  if (!confirm(`Remover dataset "${key}"?`)) return;
  const datasets = getCsvDatasets().filter(d => d.key !== key);
  saveCsvDatasets(datasets);
  renderCsvList();
}

function copyCsvImport(key, btn) {
  navigator.clipboard.writeText(`importe ${key}`).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado';
    setTimeout(() => btn.textContent = orig, 1400);
  });
}

function renderCsvList() {
  const container = document.getElementById('dados-list');
  const datasets = getCsvDatasets();

  if (datasets.length === 0) {
    container.innerHTML = `<div class="csv-empty">
      <div style="font-size:32px;margin-bottom:12px">📊</div>
      <div>Nenhum dataset ainda.</div>
      <div style="margin-top:6px;font-size:13px">Clique em <strong>＋ Novo CSV</strong> para importar dados.</div>
    </div>`;
    return;
  }

  container.innerHTML = datasets.map(ds => {
    const colBadges = ds.columns.map(c =>
      `<span title="${c.type === 'number' ? 'numérico' : 'texto'}">${c.original} ${c.type === 'number' ? '🔢' : '🔤'}</span>`
    ).join('');
    return `<div class="csv-card">
      <div class="csv-card-header">
        <span class="csv-card-key">${ds.key}</span>
        <span class="csv-card-title">${ds.title || '—'}</span>
        <span style="font-size:11px;color:var(--text-muted)">${ds.columns.length} col · ${ds.rows} linha(s)</span>
      </div>
      <div class="csv-card-cols">${colBadges}</div>
      <div class="csv-card-actions">
        <button class="btn" style="font-size:12px;padding:4px 10px" onclick="copyCsvImport('${ds.key}', this)">📋 importe ${ds.key}</button>
        <button class="btn" style="font-size:12px;padding:4px 10px" onclick="openCsvModal('${ds.key}')">✏️ Editar</button>
        <button class="btn" style="font-size:12px;padding:4px 10px;color:var(--color-vermelho)" onclick="deleteCsvDataset('${ds.key}')">🗑 Remover</button>
      </div>
    </div>`;
  }).join('');
}

// Inject CSV datasets into runtime as JS before user code runs
function getCsvInjectionCode() {
  const source = document.getElementById('code-editor')?.value || '';
  const importPattern = /importe\s+(\w+)/g;
  const datasets = getCsvDatasets();
  const datasetMap = Object.fromEntries(datasets.map(d => [d.key, d]));
  let injection = '';
  let m;
  while ((m = importPattern.exec(source)) !== null) {
    const key = m[1];
    if (datasetMap[key]) {
      injection += `// Dataset: ${key}\n` + csvColumnsToJs(datasetMap[key]) + '\n';
    }
  }
  return injection;
}


// ==================== SCRIPTS ENGINE ====================
const SCRIPTS_KEY = 'crabcode_scripts';

function loadScripts() {
  try { return JSON.parse(localStorage.getItem(SCRIPTS_KEY) || '[]'); }
  catch { return []; }
}

function saveScripts(scripts) {
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
}

function openScriptModal() {
  document.getElementById('modal-title').value = '';
  document.getElementById('modal-desc').value = '';
  document.getElementById('modal-code').value = '';
  document.getElementById('script-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('modal-title').focus(), 50);
}

function closeScriptModal() {
  document.getElementById('script-modal').style.display = 'none';
}

function saveScript() {
  const title = document.getElementById('modal-title').value.trim();
  const desc  = document.getElementById('modal-desc').value.trim();
  const code  = document.getElementById('modal-code').value;

  if (!title) {
    document.getElementById('modal-title').focus();
    document.getElementById('modal-title').style.borderColor = 'var(--color-vermelho)';
    setTimeout(() => document.getElementById('modal-title').style.borderColor = '', 1500);
    return;
  }
  if (!code.trim()) {
    document.getElementById('modal-code').focus();
    document.getElementById('modal-code').style.borderColor = 'var(--color-vermelho)';
    setTimeout(() => document.getElementById('modal-code').style.borderColor = '', 1500);
    return;
  }

  const scripts = loadScripts();
  scripts.push({ id: Date.now(), title, desc, code, createdAt: new Date().toISOString() });
  saveScripts(scripts);
  closeScriptModal();
  renderScripts();
}

function deleteScript(id) {
  const scripts = loadScripts().filter(s => s.id !== id);
  saveScripts(scripts);
  renderScripts();
}

function confirmDeleteScript(btn) {
  const id = Number(btn.dataset.id);
  deleteScript(id);
}

function copyScriptCode(id, btn) {
  const scripts = loadScripts();
  const s = scripts.find(s => s.id === id);
  if (!s) return;
  const done = () => {
    btn.textContent = 'Copiado!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiar código'; btn.classList.remove('copied'); }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(s.code).then(done).catch(() => fallbackCopy(s.code, done));
  } else {
    fallbackCopy(s.code, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); done(); } catch(e) {}
  document.body.removeChild(ta);
}

function formatScriptDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
       + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function renderScripts() {
  const query = (document.getElementById('scripts-search')?.value || '').toLowerCase();
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
      ? `<div style="color:var(--text-muted);font-size:13px;text-align:center;margin-top:40px">Nenhum script encontrado para "<strong>${escapeHtml(query)}</strong>"</div>`
      : '';
    return;
  }

  list.innerHTML = '';
  for (const s of filtered) {
    const card = document.createElement('div');
    card.className = 'script-card';

    const codeLines = s.code.split('\n').map(line => {
      return `<div class="hl-line">${highlightLine(line) || '&nbsp;'}</div>`;
    }).join('');

    card.innerHTML = `
      <div class="script-card-header">
        <div class="script-card-meta">
          <p class="script-card-title">${escapeHtml(s.title)}</p>
          ${s.desc ? `<p class="script-card-desc">${escapeHtml(s.desc)}</p>` : ''}
        </div>
        <span class="script-card-date">${formatScriptDate(s.createdAt)}</span>
      </div>
      <div class="script-card-actions">
        <button class="script-btn" onclick="copyScriptCode(${s.id}, this)">Copiar código</button>
        <button class="script-btn" onclick="loadIntoEditor(${s.id})">Abrir no editor</button>
        <button class="script-btn delete" data-id="${s.id}" onclick="confirmDeleteScript(this)">Excluir</button>
      </div>
      <div class="script-code-block">${codeLines}</div>
    `;
    list.appendChild(card);
  }
}


export { loadCode, saveCode, DEFAULT_CODE, getCsvDatasets, saveCsvDatasets, getCsvInjectionCode, openCsvModal, closeCsvModal, saveCsvFromModal, renderCsvList, suggestCsvKey, copyCsvImport, loadScripts, saveScripts, openScriptModal, closeScriptModal, saveScript, deleteScript, copyScriptCode, confirmDeleteScript, formatScriptDate, renderScripts };
