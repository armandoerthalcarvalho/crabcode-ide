import { CrabLibRegistry } from './language.js';
import { LIB_CATEGORY_LIST } from './extra_libs.js';
import { escapeHtml, highlightLine } from './utils.js';
import { scheduleHighlight } from './editor.js';
import { showToast, showConfirm, copyText } from './ui.js';

// ==================== LIBS FILTER STATE ====================
let _activeCategory = 'Todas';
let _activeSelo = 'todos';
let _editingLibKey = null;

const SELO_PRIORITY = { estrelada: 0, honrosa: 1, recomendada: 2, meta: 3 };
const SELO_LABELS = {
  estrelada:   '★ Estrelada',
  honrosa:     '◆ Honrosa',
  recomendada: '✓ Recomendada',
  meta:        '◈ Meta-Lib',
};

function renderLibsFilters() {
  const catBar = document.getElementById('libs-category-bar');
  const seloBar = document.getElementById('libs-selo-bar');
  const all = Object.values(CrabLibRegistry.getAll());

  if (catBar) {
    const categories = ['Todas', ...LIB_CATEGORY_LIST];
    catBar.innerHTML = '';
    for (const cat of categories) {
      const count = cat === 'Todas'
        ? all.length
        : all.filter(l => (l.category || 'Personalizadas') === cat).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-tab' + (_activeCategory === cat ? ' active' : '');
      btn.textContent = `${cat} (${count})`;
      btn.addEventListener('click', () => {
        _activeCategory = cat;
        renderLibs();
      });
      catBar.appendChild(btn);
    }
  }

  if (seloBar) {
    const selos = [
      { id: 'todos', label: 'Todos os níveis' },
      { id: 'estrelada', label: '★ Estreladas' },
      { id: 'honrosa', label: '◆ Honrosas' },
      { id: 'recomendada', label: '✓ Recomendadas' },
      { id: 'meta', label: '◈ Meta-Libs' },
      { id: 'custom', label: 'Minhas Libs' },
    ];
    seloBar.innerHTML = '';
    for (const s of selos) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-tab filter-tab-subtle' + (_activeSelo === s.id ? ' active' : '');
      btn.textContent = s.label;
      btn.addEventListener('click', () => {
        _activeSelo = s.id;
        renderLibs();
      });
      seloBar.appendChild(btn);
    }
  }
}

function renderLibs() {
  renderLibsFilters();

  const query = (document.getElementById('libs-search')?.value || '').toLowerCase().trim();
  const all = CrabLibRegistry.getAll();
  const allValues = Object.values(all);
  const list = document.getElementById('libs-list');
  const summaryEl = document.getElementById('libs-count-summary');
  if (!list) return;

  const entries = allValues.filter(lib => {
    const isCustom = !CrabLibRegistry.official[lib.key];

    if (_activeCategory !== 'Todas' && (lib.category || 'Personalizadas') !== _activeCategory) {
      return false;
    }
    if (_activeSelo === 'custom' && !isCustom) return false;
    if (_activeSelo !== 'todos' && _activeSelo !== 'custom' && lib.selo !== _activeSelo) {
      return false;
    }

    if (!query) return true;
    return (lib.title || '').toLowerCase().includes(query)
        || (lib.key || '').toLowerCase().includes(query)
        || (lib.description || '').toLowerCase().includes(query)
        || (lib.category || '').toLowerCase().includes(query)
        || (lib.functions || []).some(f =>
          f.name.toLowerCase().includes(query) || (f.desc || '').toLowerCase().includes(query)
        );
  });

  // Sort by merit rank first, then alphabetically by key
  entries.sort((a, b) => {
    const pa = a.selo ? (SELO_PRIORITY[a.selo] ?? 4) : 4;
    const pb = b.selo ? (SELO_PRIORITY[b.selo] ?? 4) : 4;
    if (pa !== pb) return pa - pb;
    return a.key.localeCompare(b.key, 'pt-BR');
  });

  if (summaryEl) {
    summaryEl.textContent = `Mostrando ${entries.length} de ${allValues.length} bibliotecas`;
  }

  if (entries.length === 0) {
    list.innerHTML = `<div class="empty-state-card">
      <div class="empty-state-title">Nenhuma biblioteca encontrada</div>
      <div class="empty-state-sub">${query ? `Sem resultados para "<strong>${escapeHtml(query)}</strong>" com os filtros atuais.` : 'Altere o filtro de categoria ou nível para ver mais bibliotecas.'}</div>
    </div>`;
    return;
  }

  list.innerHTML = '';
  for (const lib of entries) {
    const isCustom = !CrabLibRegistry.official[lib.key];
    const seloClass = lib.selo ? ` selo-${lib.selo}` : '';
    const card = document.createElement('div');
    card.className = 'lib-card' + (isCustom ? ' custom' : '') + seloClass;
    if (lib.selo) card.dataset.selo = lib.selo;

    const seloHtml = lib.selo
      ? `<span class="lib-selo ${lib.selo}">${SELO_LABELS[lib.selo] || lib.selo}</span>`
      : (isCustom ? `<span class="lib-selo custom">Personalizada</span>` : '');

    const catText = lib.category ? `<span class="lib-cat-meta">${escapeHtml(lib.category)}</span>` : '';

    const funcsHtml = (lib.functions || []).map(f =>
      `<span class="lib-func" title="${escapeHtml(f.desc || '')}">${escapeHtml(f.name)}(${escapeHtml(f.params || '')})</span>`
    ).join('');

    const exampleLines = (lib.example || '').split('\n');
    const exampleHtml = exampleLines.map(line =>
      `<div class="hl-line">${highlightLine(line) || '&nbsp;'}</div>`
    ).join('');

    card.innerHTML = `
      <div class="lib-card-header">
        <div class="lib-card-toprow">
          <p class="lib-card-title">${escapeHtml(lib.title)}</p>
          ${seloHtml}
        </div>
        <code class="lib-badge">importe ${escapeHtml(lib.key)}</code>
      </div>
      <p class="lib-card-desc">${escapeHtml(lib.description)}</p>
      <div class="lib-card-submeta">
        ${catText}
        ${(lib.functions && lib.functions.length) ? `<span>${lib.functions.length} funções</span>` : ''}
        ${lib.dependencies ? `<span>Agrupa ${lib.dependencies.length} bibliotecas</span>` : ''}
      </div>
      ${funcsHtml ? `<div class="lib-func-list">${funcsHtml}</div>` : ''}
      ${lib.dependencies ? `<div class="lib-deps-line">Inclui: <code>${escapeHtml(lib.dependencies.join(', '))}</code></div>` : ''}
      ${lib.example ? `
        <div class="lib-card-example">
          <div class="example-label">Exemplo executável</div>
          <pre>${exampleHtml}</pre>
        </div>
      ` : ''}
      <div class="lib-card-actions">
        ${lib.example ? `<button type="button" class="btn btn-sm btn-accent-soft" data-action="try">▶ Testar no Editor</button>` : ''}
        <button type="button" class="btn btn-sm" data-action="copy-import">Copiar importe</button>
        ${lib.example ? `<button type="button" class="btn btn-sm" data-action="copy-example">Copiar exemplo</button>` : ''}
        ${isCustom ? `<button type="button" class="btn btn-sm" data-action="edit">Editar</button>` : ''}
        ${isCustom ? `<button type="button" class="btn btn-sm btn-danger-ghost" data-action="delete">Excluir</button>` : ''}
      </div>
    `;

    card.querySelector('[data-action="try"]')?.addEventListener('click', () => {
      if (typeof window.tryInEditor === 'function') window.tryInEditor(lib.example, true);
    });
    card.querySelector('[data-action="copy-import"]')?.addEventListener('click', (e) => {
      copyLibImport(lib.key, e.currentTarget);
    });
    card.querySelector('[data-action="copy-example"]')?.addEventListener('click', (e) => {
      copyLibExample(lib.key, e.currentTarget);
    });
    card.querySelector('[data-action="edit"]')?.addEventListener('click', () => openLibModal(lib.key));
    card.querySelector('[data-action="delete"]')?.addEventListener('click', () => deleteCustomLibUI(lib.key));

    list.appendChild(card);
  }
}

function scrollToMeta() {
  _activeCategory = 'Todas';
  _activeSelo = 'meta';
  renderLibs();
  const list = document.getElementById('libs-list');
  if (list) list.scrollTop = 0;
}

async function copyLibImport(key, btn) {
  await copyText('importe ' + key);
  showToast(`"importe ${key}" copiado!`, 'success', 1600);
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado';
    setTimeout(() => { btn.textContent = orig; }, 1400);
  }
}

async function copyLibExample(key, btn) {
  const lib = CrabLibRegistry.get(key);
  if (!lib || !lib.example) return;
  await copyText(lib.example);
  showToast(`Exemplo de "${key}" copiado!`, 'success', 1600);
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Copiado';
    setTimeout(() => { btn.textContent = orig; }, 1400);
  }
}

function openLibModal(existingKey = null) {
  const modal = document.getElementById('lib-modal');
  const keyEl = document.getElementById('lib-modal-key');
  const titleEl = document.getElementById('lib-modal-title');
  const descEl = document.getElementById('lib-modal-desc');
  const codeEl = document.getElementById('lib-modal-code');
  const heading = document.getElementById('lib-modal-heading');

  _editingLibKey = null;
  if (existingKey && typeof existingKey === 'string') {
    const custom = CrabLibRegistry.getCustomLibs()[existingKey];
    if (custom) {
      _editingLibKey = existingKey;
      keyEl.value = custom.key;
      keyEl.readOnly = true;
      titleEl.value = custom.title || '';
      descEl.value = custom.description || '';
      codeEl.value = custom.sourceCode || '';
      if (heading) heading.textContent = `Editar Biblioteca — ${custom.key}`;
    }
  } else {
    keyEl.value = '';
    keyEl.readOnly = false;
    titleEl.value = '';
    descEl.value = '';
    codeEl.value = '';
    if (heading) heading.textContent = 'Nova Biblioteca Personalizada';
  }

  modal.style.display = 'flex';
  setTimeout(() => (existingKey ? titleEl : keyEl)?.focus(), 40);
}

function closeLibModal() {
  const modal = document.getElementById('lib-modal');
  if (modal) modal.style.display = 'none';
  _editingLibKey = null;
}

function saveLibFromModal() {
  const keyEl = document.getElementById('lib-modal-key');
  const key = keyEl.value.trim().replace(/\s+/g, '_').toLowerCase();
  const title = document.getElementById('lib-modal-title').value.trim();
  const desc = document.getElementById('lib-modal-desc').value.trim();
  const code = document.getElementById('lib-modal-code').value;

  if (!key) { showToast('Preencha a chave de importação.', 'error'); keyEl.focus(); return; }
  if (!title) { showToast('Preencha o título da biblioteca.', 'error'); return; }
  if (!code.trim()) { showToast('Escreva o código CrabCode da biblioteca.', 'error'); return; }
  if (CrabLibRegistry.official[key]) {
    showToast(`"${key}" já é uma biblioteca oficial. Escolha outro nome.`, 'error');
    return;
  }
  if (!/^[a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*$/.test(key)) {
    showToast('A chave deve começar com letra/_ e conter apenas letras, números e _.', 'error');
    return;
  }

  const result = CrabLibRegistry.compileCustomLib(code);
  if (result.error) {
    showToast('Erro ao compilar biblioteca: ' + result.error, 'error', 4500);
    return;
  }

  const firstFn = result.exports[0];
  const lib = {
    key,
    title,
    description: desc || 'Biblioteca personalizada',
    category: 'Personalizadas',
    exports: result.exports,
    functions: result.exports.map(name => ({ name, params: '...', desc: 'Função personalizada' })),
    jsCode: result.jsCode,
    sourceCode: code,
    example: firstFn ? `importe ${key}\napresente "${title} carregada!" em texto` : `importe ${key}`,
  };

  CrabLibRegistry.saveCustomLib(lib);
  closeLibModal();
  renderLibs();
  scheduleHighlight();
  showToast(`Biblioteca "${key}" salva com ${result.exports.length} símbolo(s)!`, 'success');
}

async function deleteCustomLibUI(key) {
  const ok = await showConfirm({
    title: 'Excluir biblioteca personalizada',
    message: `Deseja excluir a biblioteca "${key}"?`,
    confirmText: 'Excluir',
    danger: true,
  });
  if (!ok) return;
  CrabLibRegistry.deleteCustomLib(key);
  renderLibs();
  scheduleHighlight();
  showToast(`Biblioteca "${key}" excluída.`, 'info');
}

export {
  renderLibs, scrollToMeta, copyLibImport, copyLibExample,
  openLibModal, closeLibModal, saveLibFromModal, deleteCustomLibUI,
};
