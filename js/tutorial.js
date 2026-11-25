// ==================== TUTORIAL INTERATIVO (96 LIÇÕES ATÔMICAS) ====================
import { TUTORIAL_UNITS } from './tutorial_data.js';
import { escapeHtml } from './utils.js';
import { showToast, copyText } from './ui.js';

const PROGRESS_STORAGE_KEY = 'crabcode_tutorial_done';

export { TUTORIAL_UNITS };

// ==================== SYNTAX HIGHLIGHTING FOR CODE BLOCKS ====================
function highlightBlock(code) {
  return escapeHtml(code)
    .replace(/(#[^\n]*)/g, '<span class="tut-comment">$1</span>')
    .replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="tut-string">$1</span>')
    .replace(/\b(importe|defina|altere|execute|apresente|salve|carregue)\b/g, '<span class="tut-kw">$1</span>')
    .replace(/\b(como|para|em|se|senao|repita|vezes|enquanto|relatando|local|ajuste|grid|com|cor|de|fundo|texto|entre|amostras)\b/g, '<span class="tut-mod">$1</span>')
    .replace(/\b(funcao|objeto|sprite|botao|toggle|slider|seletor|digite|pergunte|loop|compactar|tendencia|percentil|tamanho|potencia|raiz|aleatorio|juros|compostos|rodar)\b/g, '<span class="tut-fn">$1</span>')
    .replace(/\b(verdadeiro|falso|nao|e|ou)\b/g, '<span class="tut-bool">$1</span>');
}

// ==================== PROGRESS PERSISTENCE ====================
function loadCompletedSet() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter(n => typeof n === 'number') : []);
  } catch {
    return new Set();
  }
}

function saveCompletedSet(set) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // Ignore storage quota issues for progress markers
  }
}

// ==================== COPY HELPER ====================
export function copyCode(btn, code) {
  copyText(code).then(() => {
    if (btn) {
      const prev = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = prev; }, 1400);
    }
    showToast('Código copiado!', 'success', 1400);
  });
}

// ==================== RENDER TUTORIAL PANEL ====================
let _activeUnitId = 'u1';
let _searchQuery = '';

export function loadTutorial() {
  const panel = document.getElementById('tutorial-panel');
  if (!panel) return;

  const doneSet = loadCompletedSet();
  const totalLessons = TUTORIAL_UNITS.reduce((acc, u) => acc + u.lessons.length, 0);
  const doneCount = doneSet.size;
  const pct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  const q = _searchQuery.trim().toLowerCase();

  // Filter lessons across all units when searching, or show active unit
  let visibleUnits = TUTORIAL_UNITS;
  if (q) {
    visibleUnits = TUTORIAL_UNITS.map(u => ({
      ...u,
      lessons: u.lessons.filter(l =>
        `${l.num} ${l.title} ${l.concept} ${l.explanation} ${l.code} ${l.exercise?.question || ''}`
          .toLowerCase()
          .includes(q)
      ),
    })).filter(u => u.lessons.length > 0);
  } else {
    visibleUnits = TUTORIAL_UNITS.filter(u => u.id === _activeUnitId);
    if (visibleUnits.length === 0) visibleUnits = [TUTORIAL_UNITS[0]];
  }

  const sidebarItems = TUTORIAL_UNITS.map(u => {
    const uDone = u.lessons.filter(l => doneSet.has(l.num)).length;
    const isActive = !q && u.id === _activeUnitId;
    return `
      <button type="button" class="tut-nav-item ${isActive ? 'active' : ''}" data-unit-id="${u.id}">
        <span class="tut-nav-num">U${u.unitNum}</span>
        <span class="tut-nav-meta">
          <span class="tut-nav-title">${escapeHtml(u.title)}</span>
          <span class="tut-nav-sub">Lições ${u.lessons[0].num}–${u.lessons[u.lessons.length - 1].num} · ${uDone}/${u.lessons.length}</span>
        </span>
      </button>
    `;
  }).join('');

  const unitsHtml = visibleUnits.length === 0
    ? `<div class="empty-state">Nenhuma lição encontrada para "<strong>${escapeHtml(_searchQuery)}</strong>". Tente outro termo (ex: <code>defina</code>, <code>loop</code>, <code>slider</code>).</div>`
    : visibleUnits.map(u => {
        const uIdx = TUTORIAL_UNITS.findIndex(x => x.id === u.id);
        const prevUnit = uIdx > 0 ? TUTORIAL_UNITS[uIdx - 1] : null;
        const nextUnit = uIdx >= 0 && uIdx < TUTORIAL_UNITS.length - 1 ? TUTORIAL_UNITS[uIdx + 1] : null;

        const lessonsHtml = u.lessons.map(l => {
          const isDone = doneSet.has(l.num);
          return `
            <article class="tut-lesson-card ${isDone ? 'is-done' : ''}" id="lesson-${l.num}">
              <div class="tut-lesson-head">
                <div class="tut-lesson-head-left">
                  <span class="tut-lesson-num">Lição ${l.num} / ${totalLessons}</span>
                  <h3 class="tut-lesson-title">${escapeHtml(l.title)}</h3>
                </div>
                <button type="button" class="btn btn-sm tut-done-btn ${isDone ? 'is-checked' : ''}" data-toggle-done="${l.num}">
                  ${isDone ? '✓ Concluída' : 'Marcar concluída'}
                </button>
              </div>
              <div class="tut-concept-line"><strong>Conceito único:</strong> ${escapeHtml(l.concept)}</div>
              <p class="tut-explanation">${l.explanation}</p>

              <div class="tut-code-card">
                <div class="tut-code-bar">
                  <span class="tut-code-label">Exemplo prático</span>
                  <div class="tut-code-actions">
                    <button type="button" class="btn btn-sm tut-copy-demo" data-lesson="${l.num}">Copiar</button>
                    <button type="button" class="btn btn-sm btn-run tut-try-demo" data-lesson="${l.num}">▶ Testar no Editor</button>
                  </div>
                </div>
                <pre class="tut-code-pre"><code>${highlightBlock(l.code)}</code></pre>
              </div>

              ${l.tip ? `<div class="tut-tip"><strong>Dica:</strong> ${escapeHtml(l.tip)}</div>` : ''}

              <div class="tut-exercise">
                <div class="tut-exercise-head">
                  <span class="tut-exercise-tag">Prática da Lição ${l.num}</span>
                </div>
                <p class="tut-exercise-q">${escapeHtml(l.exercise.question)}</p>
                <div class="tut-exercise-controls">
                  ${l.exercise.hint ? `<button type="button" class="btn btn-sm tut-hint-toggle" aria-expanded="false" data-hint-target="hint-${l.num}">Ver dica</button>` : ''}
                  <button type="button" class="btn btn-sm tut-sol-toggle" aria-expanded="false" data-sol-target="sol-${l.num}">Ver solução</button>
                </div>
                ${l.exercise.hint ? `<div id="hint-${l.num}" class="tut-hint-box" hidden><strong>Dica:</strong> ${escapeHtml(l.exercise.hint)}</div>` : ''}
                <div id="sol-${l.num}" class="tut-sol-box" hidden>
                  <div class="tut-code-bar">
                    <span class="tut-code-label">Solução sugerida</span>
                    <div class="tut-code-actions">
                      <button type="button" class="btn btn-sm tut-copy-sol" data-lesson="${l.num}">Copiar solução</button>
                      <button type="button" class="btn btn-sm btn-run tut-try-sol" data-lesson="${l.num}">▶ Testar solução no Editor</button>
                    </div>
                  </div>
                  <pre class="tut-code-pre"><code>${highlightBlock(l.exercise.solution)}</code></pre>
                </div>
              </div>
            </article>
          `;
        }).join('');

        const footerNav = !q ? `
          <div class="tut-unit-footer">
            ${prevUnit ? `<button type="button" class="btn tut-unit-jump" data-unit-id="${prevUnit.id}">← Unidade ${prevUnit.unitNum}: ${escapeHtml(prevUnit.title)}</button>` : '<span></span>'}
            ${nextUnit ? `<button type="button" class="btn btn-run tut-unit-jump" data-unit-id="${nextUnit.id}">Próxima: Unidade ${nextUnit.unitNum} — ${escapeHtml(nextUnit.title)} →</button>` : '<span class="tut-complete-note">Você chegou à lição 96 — parabéns!</span>'}
          </div>
        ` : '';

        return `
          <section class="tut-unit-section">
            <header class="tut-unit-header">
              <span class="tut-unit-badge">${escapeHtml(u.badge)}</span>
              <h2>${escapeHtml(u.title)}</h2>
              <p>${escapeHtml(u.summary)}</p>
            </header>
            <div class="tut-lessons-stack">${lessonsHtml}</div>
            ${footerNav}
          </section>
        `;
      }).join('');

  panel.innerHTML = `
    <div class="tut-layout">
      <aside class="tut-sidebar" aria-label="Unidades do tutorial">
        <div class="tut-sidebar-top">
          <div class="tut-progress-head">
            <strong>Curso CrabCode</strong>
            <span class="tut-progress-count">${doneCount}/${totalLessons} (${pct}%)</span>
          </div>
          <div class="tut-progress-track" aria-hidden="true">
            <div class="tut-progress-fill" style="width:${pct}%"></div>
          </div>
          <input id="tutorial-search" type="search" class="toolbar-search tut-search-input" placeholder="Buscar entre 96 lições..." value="${escapeHtml(_searchQuery)}" autocomplete="off" />
        </div>
        <nav class="tut-nav-list">${sidebarItems}</nav>
      </aside>
      <div class="tut-main">
        ${unitsHtml}
      </div>
    </div>
  `;

  // Lookup map by lesson number for crisp event wiring
  const lessonByNum = new Map();
  for (const u of TUTORIAL_UNITS) {
    for (const l of u.lessons) lessonByNum.set(l.num, l);
  }

  // Search input (preserve focus & cursor)
  const searchInput = panel.querySelector('#tutorial-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      _searchQuery = e.target.value;
      const pos = e.target.selectionStart;
      loadTutorial();
      const nextInput = document.getElementById('tutorial-search');
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(pos, pos);
      }
    });
  }

  // Unit navigation (sidebar & footer)
  panel.querySelectorAll('[data-unit-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeUnitId = btn.dataset.unitId;
      _searchQuery = '';
      loadTutorial();
      panel.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Toggle completed state
  panel.querySelectorAll('[data-toggle-done]').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = Number(btn.dataset.toggleDone);
      const set = loadCompletedSet();
      if (set.has(num)) set.delete(num);
      else set.add(num);
      saveCompletedSet(set);
      loadTutorial();
    });
  });

  // Toggle hint
  panel.querySelectorAll('.tut-hint-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const box = panel.querySelector(`#${btn.dataset.hintTarget}`);
      if (!box) return;
      const open = box.hidden;
      box.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Ocultar dica' : 'Ver dica';
    });
  });

  // Toggle hidden solution
  panel.querySelectorAll('.tut-sol-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const box = panel.querySelector(`#${btn.dataset.solTarget}`);
      if (!box) return;
      const open = box.hidden;
      box.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Ocultar solução' : 'Ver solução';
    });
  });

  // Copy & Try Demo
  panel.querySelectorAll('.tut-copy-demo').forEach(btn => {
    btn.addEventListener('click', () => {
      const l = lessonByNum.get(Number(btn.dataset.lesson));
      if (l) copyCode(btn, l.code);
    });
  });
  panel.querySelectorAll('.tut-try-demo').forEach(btn => {
    btn.addEventListener('click', () => {
      const l = lessonByNum.get(Number(btn.dataset.lesson));
      if (l && typeof window.tryInEditor === 'function') window.tryInEditor(l.code, true);
    });
  });

  // Copy & Try Solution
  panel.querySelectorAll('.tut-copy-sol').forEach(btn => {
    btn.addEventListener('click', () => {
      const l = lessonByNum.get(Number(btn.dataset.lesson));
      if (l) copyCode(btn, l.exercise.solution);
    });
  });
  panel.querySelectorAll('.tut-try-sol').forEach(btn => {
    btn.addEventListener('click', () => {
      const l = lessonByNum.get(Number(btn.dataset.lesson));
      if (l && typeof window.tryInEditor === 'function') window.tryInEditor(l.exercise.solution, true);
    });
  });
}

// ==================== TEST HARNESS EXPORTS ====================
export function getAllTutorialCodeBlocks() {
  const out = [];
  for (const unit of TUTORIAL_UNITS) {
    for (const lesson of unit.lessons) {
      out.push({
        unit: unit.title,
        num: lesson.num,
        title: lesson.title,
        code: lesson.code,
      });
    }
  }
  return out;
}

export function getAllTutorialSolutionBlocks() {
  const out = [];
  for (const unit of TUTORIAL_UNITS) {
    for (const lesson of unit.lessons) {
      out.push({
        unit: unit.title,
        num: lesson.num,
        title: lesson.title,
        question: lesson.exercise?.question || '',
        code: lesson.exercise?.solution || '',
      });
    }
  }
  return out;
}
