import { CrabLibRegistry } from './language.js';
import { escapeHtml, highlightLine } from './utils.js';
import { scheduleHighlight } from './editor.js';

// ==================== LIBS UI ====================
function renderLibs() {
  const query = (document.getElementById('libs-search')?.value || '').toLowerCase();
  const all = CrabLibRegistry.getAll();
  const list = document.getElementById('libs-list');
  if (!list) return;

  const entries = Object.values(all).filter(lib => {
    if (!query) return true;
    return lib.title.toLowerCase().includes(query)
        || lib.key.toLowerCase().includes(query)
        || lib.description.toLowerCase().includes(query)
        || (lib.functions || []).some(f => f.name.toLowerCase().includes(query) || f.desc.toLowerCase().includes(query));
  });

  // Sort by selo priority: estrelada > honrosa > recomendada > meta > sem selo
  const seloPriority = { estrelada: 0, honrosa: 1, recomendada: 2, meta: 3 };
  entries.sort((a, b) => {
    const pa = a.selo ? (seloPriority[a.selo] ?? 4) : 4;
    const pb = b.selo ? (seloPriority[b.selo] ?? 4) : 4;
    return pa - pb;
  });

  const seloLabels = {
    estrelada:   '⭐ Estrelada',
    honrosa:     '🏅 Menção Honrosa',
    recomendada: '👍 Recomendada',
    meta:        '🎙️ Meta',
  };

  if (entries.length === 0) {
    list.innerHTML = query
      ? `<div style="color:var(--text-muted);font-size:13px;text-align:center;margin-top:40px">Nenhuma biblioteca encontrada para "<strong>${escapeHtml(query)}</strong>"</div>`
      : '<div style="color:var(--text-muted);font-size:13px;text-align:center;margin-top:40px">Nenhuma biblioteca disponível.</div>';
    return;
  }

  list.innerHTML = '';
  for (const lib of entries) {
    const isCustom = !CrabLibRegistry.official[lib.key];
    const seloClass = lib.selo ? ` selo-${lib.selo}` : '';
    const card = document.createElement('div');
    card.className = 'lib-card' + (isCustom ? ' custom' : '') + seloClass;
    if (lib.selo) card.dataset.selo = lib.selo;

    const seloHtml = lib.selo ? `<span class="lib-selo ${lib.selo}">${seloLabels[lib.selo]}</span>` : '';

    const funcsHtml = (lib.functions || []).map(f =>
      `<span class="lib-func" title="${escapeHtml(f.desc)}">${escapeHtml(f.name)}(${escapeHtml(f.params)})</span>`
    ).join('');

    const exampleLines = (lib.example || '').split('\n');
    const exampleHtml = exampleLines.map(line =>
      `<div class="hl-line">${highlightLine(line) || '&nbsp;'}</div>`
    ).join('');

    card.innerHTML = `
      <div class="lib-card-header">
        <div class="lib-card-meta">
          <p class="lib-card-title">${escapeHtml(lib.title)}${seloHtml ? ' ' + seloHtml : ''}</p>
          <p class="lib-card-desc">${escapeHtml(lib.description)}</p>
        </div>
        <span class="lib-badge">importe ${escapeHtml(lib.key)}</span>
      </div>
      ${funcsHtml ? `<div class="lib-func-list">${funcsHtml}</div>` : ''}
      ${lib.dependencies ? `<div class="lib-func-list"><span class="lib-func" style="color:var(--color-laranja)">Inclui: ${lib.dependencies.join(', ')}</span></div>` : ''}
      ${lib.example ? `
        <div class="lib-card-example">
          <div class="example-label">Exemplo</div>
          <pre>${exampleHtml}</pre>
        </div>
      ` : ''}
      <div class="lib-card-actions">
        <button class="script-btn" onclick="copyLibImport('${lib.key}', this)">Copiar importe</button>
        ${lib.example ? `<button class="script-btn" onclick="copyLibExample('${lib.key}', this)">Copiar exemplo</button>` : ''}
        ${isCustom ? `<button class="script-btn delete" onclick="deleteCustomLibUI('${lib.key}')">Excluir</button>` : ''}
      </div>
    `;
    list.appendChild(card);
  }
}

function scrollToMeta() {
  const first = document.querySelector('#libs-list [data-selo="meta"]');
  if (!first) return;
  first.scrollIntoView({ behavior: 'smooth', block: 'start' });
  first.style.outline = '2px solid #94a3b8';
  first.style.outlineOffset = '3px';
  setTimeout(() => { first.style.outline = ''; first.style.outlineOffset = ''; }, 1800);
}

function copyLibImport(key, btn) {
  navigator.clipboard.writeText('importe ' + key).then(() => {
    btn.textContent = 'Copiado!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiar importe'; btn.classList.remove('copied'); }, 1500);
  });
}

function copyLibExample(key, btn) {
  const lib = CrabLibRegistry.get(key);
  if (!lib || !lib.example) return;
  navigator.clipboard.writeText(lib.example).then(() => {
    btn.textContent = 'Copiado!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiar exemplo'; btn.classList.remove('copied'); }, 1500);
  });
}

function openLibModal() {
  document.getElementById('lib-modal-key').value = '';
  document.getElementById('lib-modal-title').value = '';
  document.getElementById('lib-modal-desc').value = '';
  document.getElementById('lib-modal-code').value = '';
  document.getElementById('lib-modal').style.display = 'flex';
}

function closeLibModal() {
  document.getElementById('lib-modal').style.display = 'none';
}

function saveLibFromModal() {
  const key = document.getElementById('lib-modal-key').value.trim().replace(/\s+/g, '_').toLowerCase();
  const title = document.getElementById('lib-modal-title').value.trim();
  const desc = document.getElementById('lib-modal-desc').value.trim();
  const code = document.getElementById('lib-modal-code').value;

  if (!key) return alert('Preencha a chave de importação.');
  if (!title) return alert('Preencha o título.');
  if (!code.trim()) return alert('Escreva o código CrabCode da biblioteca.');
  if (CrabLibRegistry.official[key]) return alert(`"${key}" é o nome de uma biblioteca oficial. Escolha outro nome.`);
  if (!/^[a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*$/.test(key)) return alert('A chave deve conter apenas letras, números e _');

  const result = CrabLibRegistry.compileCustomLib(code);
  if (result.error) return alert('Erro ao compilar a biblioteca:\n' + result.error);

  const lib = {
    key,
    title,
    description: desc || 'Biblioteca personalizada',
    exports: result.exports,
    functions: result.exports.map(name => ({ name, params: '...', desc: 'Definido pelo usuário' })),
    jsCode: result.jsCode,
    example: 'importe ' + key,
  };

  CrabLibRegistry.saveCustomLib(lib);
  closeLibModal();
  renderLibs();
  scheduleHighlight();
}

function deleteCustomLibUI(key) {
  if (!confirm(`Excluir a biblioteca "${key}"?`)) return;
  CrabLibRegistry.deleteCustomLib(key);
  renderLibs();
}

export { renderLibs, scrollToMeta, copyLibImport, copyLibExample, openLibModal, closeLibModal, saveLibFromModal, deleteCustomLibUI };

