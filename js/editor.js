import { Lexer, Parser, Transpiler, Runtime, CrabLibRegistry } from './language.js';
import { getCsvDatasets, saveCode } from './storage.js';
import { OutputRenderer } from './output.js';
import { escapeHtml, highlightLine } from './utils.js';

// ==================== ERROR MANAGER ====================
class ErrorManager {
  constructor(listEl, countEl) {
    this.listEl = listEl;
    this.countEl = countEl;
    this.errors = [];
  }

  setErrors(errors) {
    this.errors = errors;
    this.render();
  }

  render() {
    this.listEl.innerHTML = '';
    this.countEl.textContent = this.errors.length;

    if (this.errors.length === 0) {
      this.countEl.classList.add('zero');
      this.countEl.classList.remove('nonzero');
    } else {
      this.countEl.classList.remove('zero');
    }

    for (const err of this.errors) {
      const item = document.createElement('div');
      item.className = 'error-item';
      item.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span class="error-line-num">Linha ${err.line}</span>
        <span class="error-msg">${this.escapeHtml(err.message)}</span>
      `;
      item.onclick = () => {
        goToLine(err.line);
      };
      this.listEl.appendChild(item);
    }
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

// ==================== SYNTAX HIGHLIGHTER ====================
class SyntaxHighlighter {
  constructor(overlayEl) {
    this.overlayEl = overlayEl;
  }

  highlight(tokens) {
    let html = '';
    for (const t of tokens) {
      const escaped = this.escapeHtml(t.value);
      switch (t.module) {
        case 'laranja':
          html += `<span style="color:var(--color-laranja);font-weight:600">${escaped}</span>`;
          break;
        case 'roxo':
          html += `<span style="color:var(--color-roxo)">${escaped}</span>`;
          break;
        case 'azul':
          html += `<span style="color:var(--color-azul)">${escaped}</span>`;
          break;
        case 'branco':
          html += `<span style="color:var(--color-branco)">${escaped}</span>`;
          break;
        case 'vermelho':
          html += `<span style="color:var(--color-vermelho);font-weight:600">${escaped}</span>`;
          break;
        case 'numero':
          html += `<span style="color:var(--color-numero)">${escaped}</span>`;
          break;
        case 'operador':
          html += `<span style="color:var(--color-operador)">${escaped}</span>`;
          break;
        case 'erro':
          html += `<span class="token-erro" style="color:var(--color-vermelho)">${escaped}</span>`;
          break;
        case 'paren':
        case 'virgula':
        case 'ponto':
        case 'dois_pontos':
          html += `<span style="color:var(--text-muted)">${escaped}</span>`;
          break;
        case 'string':
          html += `<span style="color:var(--color-string-hint)">${t.quote || '"'}${escaped}${t.quote || '"'}</span>`;
          break;
        case 'comentario':
          html += `<span style="color:var(--text-muted);font-style:italic">${escaped}</span>`;
          break;
        case 'newline':
          html += '\n';
          break;
        case 'ws':
          html += escaped;
          break;
        default:
          html += escaped;
      }
    }
    this.overlayEl.innerHTML = html;
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}


// ==================== APP INITIALIZATION ====================
const codeEditor = document.getElementById('code-editor');
const highlightOverlay = document.getElementById('highlight-overlay');
const lineNumbers = document.getElementById('line-numbers');
const outputBody = document.getElementById('output-body');
const errorList = document.getElementById('error-list');
const errorCount = document.getElementById('error-count');
const errorPanel = document.getElementById('error-panel');
const savedIndicator = document.getElementById('saved-indicator');

const highlighter = new SyntaxHighlighter(highlightOverlay);
const outputRenderer = new OutputRenderer(outputBody);
const errorManager = new ErrorManager(errorList, errorCount);
const runtime = new Runtime();

let saveTimeout = null;
let highlightTimeout = null;

// ==================== UPDATE EDITOR ====================
function updateEditor() {
  updateLineNumbers();
  scheduleHighlight();
  scheduleSave();
}

function updateLineNumbers() {
  const lines = codeEditor.value.split('\n');
  lineNumbers.innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
}

function scheduleHighlight() {
  clearTimeout(highlightTimeout);
  highlightTimeout = setTimeout(() => {
    const source = codeEditor.value;
    const csvDatasets = getCsvDatasets();
    const lexer = new Lexer(source, { registry: CrabLibRegistry, csvDatasets });
    const { tokens, errors: lexErrors } = lexer.tokenize();

    // Highlight
    highlighter.highlight(tokens);

    // Parse for errors (pass declaredVars from lexer for accurate context)
    const parser = new Parser(tokens, new Set(lexer.declaredVars), new Set(lexer.declaredArrays), new Set(lexer.declaredObjects), { registry: CrabLibRegistry, csvDatasets });
    const { ast, errors: parseErrors } = parser.parse();

    // Combine errors
    const allErrors = [...lexErrors, ...parseErrors];
    errorManager.setErrors(allErrors);
  }, 100);
}

function scheduleSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCode, 500);
}

// ==================== SYNC SCROLL ====================
function syncScroll() {
  highlightOverlay.scrollTop = codeEditor.scrollTop;
  highlightOverlay.scrollLeft = codeEditor.scrollLeft;
  lineNumbers.scrollTop = codeEditor.scrollTop;
}


// ==================== GO TO LINE ====================
function goToLine(lineNum) {
  const lines = codeEditor.value.split('\n');
  let pos = 0;
  for (let i = 0; i < lineNum - 1 && i < lines.length; i++) {
    pos += lines[i].length + 1;
  }
  codeEditor.focus();
  codeEditor.setSelectionRange(pos, pos + (lines[lineNum - 1]?.length || 0));
  // Scroll the editor to the target line
  const lineHeight = parseFloat(getComputedStyle(codeEditor).lineHeight) || 22;
  codeEditor.scrollTop = (lineNum - 3) * lineHeight;
  syncScroll();
}

// ==================== TOGGLE ERROR PANEL ====================
function toggleErrorPanel() {
  errorPanel.classList.toggle('collapsed');
  const arrow = document.getElementById('error-toggle-arrow');
  arrow.textContent = errorPanel.classList.contains('collapsed') ? '▶' : '▼';
}


// ==================== AUTOCOMPLETE ENGINE ====================
const AutoComplete = {
  popup: null,
  items: [],
  selectedIndex: -1,
  active: false,
  currentWord: '',
  wordStart: -1,
  _charWidth: null,
  _debounceTimer: null,

  // ── Full keyword catalog with descriptions ──
  KEYWORD_DATA: [
    { label: 'defina',      desc: 'Declara variável, array, objeto ou função' },
    { label: 'como',        desc: 'Atribui valor a uma declaração' },
    { label: 'altere',      desc: 'Altera o valor de uma variável' },
    { label: 'para',        desc: 'Define o novo valor na alteração' },
    { label: 'execute',     desc: 'Avalia expressão e envia ao output' },
    { label: 'apresente',   desc: 'Renderiza valor em formato visual' },
    { label: 'importe',     desc: 'Importa uma biblioteca' },
    { label: 'se',          desc: 'Condicional — executa se verdadeiro' },
    { label: 'senao',       desc: 'Alternativa do condicional' },
    { label: 'repita',      desc: 'Repete N vezes' },
    { label: 'vezes',       desc: 'Parte do repita N vezes' },
    { label: 'relatando',   desc: 'Mostra cada passo da iteração' },
    { label: 'enquanto',    desc: 'Repete enquanto condição verdadeira' },
    { label: 'funcao',      desc: 'Declara uma função' },
    { label: 'objeto',      desc: 'Tipo objeto literal' },
    { label: 'loop',        desc: 'Loop manual com execute loop(...)' },
    { label: 'com',         desc: 'Usado com amostragem (com N amostras)' },
    { label: 'amostras',    desc: 'Quantidade de amostras para simulação' },
    { label: 'rodar',       desc: 'Executa função ou expressão' },
    { label: 'em',          desc: 'Define formato de apresentação' },
    { label: 'e',           desc: 'Operador lógico E' },
    { label: 'ou',          desc: 'Operador lógico OU' },
    { label: 'nao',         desc: 'Operador lógico NÃO' },
    { label: 'verdadeiro',  desc: 'Valor booleano verdadeiro' },
    { label: 'falso',       desc: 'Valor booleano falso' },
    // Interface module keywords
    { label: 'ajuste',      desc: 'Posiciona/dimensiona elemento de interface' },
    { label: 'grid',        desc: 'Posicionamento em grid (col, lin, largura, altura)' },
    { label: 'sprite',      desc: 'Forma gráfica (reto, curvo, ou imagem)' },
    { label: 'reto',        desc: 'Sprite poligonal com pontos (x,y)' },
    { label: 'curvo',       desc: 'Sprite circular com raio' },
    { label: 'botao',       desc: 'Botão clicável de interface' },
    { label: 'toggle',      desc: 'Chave liga/desliga (checkbox)' },
    { label: 'slider',      desc: 'Controle deslizante (range)' },
    { label: 'seletor',     desc: 'Menu suspenso com opções' },
    { label: 'digite',      desc: 'Campo de texto livre' },
    { label: 'pergunte',    desc: 'Card com pergunta e campo de resposta' },
    { label: 'tecla',       desc: 'Variável de tecla pressionada (interface)' },
    { label: 'salve',       desc: 'Salva variável localmente ou na nuvem' },
    { label: 'carregue',    desc: 'Carrega variável local ou da nuvem' },
    { label: 'local',       desc: 'Modificador: salvar/carregar no armazenamento local' },
    { label: 'nuvem',       desc: 'Modificador: salvar/carregar na nuvem' },
    { label: 'usando',      desc: 'Define chave de acesso para nuvem' },
  ],

  // ── Built-in math/utility functions ──
  BUILTIN_FNS: [
    { label: 'potencia de',       desc: 'Potência: potencia de BASE, EXPOENTE' },
    { label: 'raiz de',           desc: 'Raiz quadrada de um número' },
    { label: 'aleatorio entre',   desc: 'Número aleatório entre MIN e MAX' },
    { label: 'juros compostos',   desc: 'juros compostos CAPITAL, TAXA, PERÍODO' },
    { label: 'tamanho de',        desc: 'Retorna tamanho de um array' },
    { label: 'tendencia de',      desc: 'Calcula tendência (regressão linear)' },
    { label: 'percentil de',      desc: 'Calcula percentil de dados' },
    { label: 'compactar',         desc: 'Compacta dados em representação resumida' },
    { label: 'objeto de',         desc: 'Cria objeto a partir de expressão' },
  ],

  // ── Presentation formats ──
  FORMAT_DATA: [
    { label: 'texto',         desc: 'Renderiza como texto simples' },
    { label: 'destaque',      desc: 'Texto com destaque visual' },
    { label: 'dados',         desc: 'Mostra array formatado como dados' },
    { label: 'tabela',        desc: 'Gera tabela HTML dos dados' },
    { label: 'grafico',       desc: 'Gera gráfico (Chart.js) dos dados' },
    { label: 'estatisticas',  desc: 'Exibe estatísticas descritivas' },
    { label: 'cientifica',    desc: 'Notação científica do número' },
    { label: 'apresentação',  desc: 'Formato de apresentação visual' },
    { label: 'apresentacao',  desc: 'Formato de apresentação (sem acento)' },
    // Interface formats
    { label: 'sprite',        desc: 'Renderiza sprite gráfico de interface' },
    { label: 'botao',         desc: 'Botão clicável' },
    { label: 'toggle',        desc: 'Chave liga/desliga' },
    { label: 'slider',        desc: 'Controle deslizante' },
    { label: 'seletor',       desc: 'Menu suspenso' },
    { label: 'digite',        desc: 'Campo de texto livre' },
    { label: 'pergunte',      desc: 'Card de pergunta com resposta' },
  ],

  // ── Snippet templates (inserted as-is) ──
  SNIPPETS: [
    { label: 'defina como',             insert: 'defina nome como valor',                     desc: 'Template: declarar variável' },
    { label: 'defina como funcao',      insert: 'defina nome como funcao(params)\n  execute resultado\nfim', desc: 'Template: declarar função' },
    { label: 'defina como compactar',   insert: 'defina nome como compactar dados',           desc: 'Template: compactar dados' },
    { label: 'execute se',              insert: 'execute expressao se condicao',               desc: 'Template: execução condicional' },
    { label: 'execute se senao',        insert: 'execute expr1 se condicao senao expr2',       desc: 'Template: condicional com alternativa' },
    { label: 'execute repita',          insert: 'execute expressao repita 10 vezes',           desc: 'Template: repetição N vezes' },
    { label: 'altere para',             insert: 'altere nome para valor',                      desc: 'Template: alterar variável' },
    { label: 'altere relatando',        insert: 'altere nome para expr relatando',             desc: 'Template: alterar com log de passos' },
    { label: 'altere enquanto',         insert: 'altere nome para expr enquanto cond',         desc: 'Template: alterar enquanto condição' },
    { label: 'apresente em texto',      insert: 'apresente expressao em texto',                desc: 'Template: apresentar como texto' },
    { label: 'apresente em grafico',    insert: 'apresente dados em grafico',                  desc: 'Template: apresentar como gráfico' },
    { label: 'apresente em tabela',     insert: 'apresente dados em tabela',                   desc: 'Template: apresentar como tabela' },
    { label: 'apresente em destaque',   insert: 'apresente expressao em destaque',             desc: 'Template: apresentar com destaque' },
    { label: 'apresente em estatisticas', insert: 'apresente dados em estatisticas',           desc: 'Template: exibir estatísticas' },
    { label: 'execute loop',            insert: 'execute loop(i, 1, 10)\n  execute i\nfim',    desc: 'Template: loop com contador' },
    { label: 'importe biblioteca',      insert: 'importe nome_biblioteca',                    desc: 'Template: importar biblioteca' },
    // New interface + game starters
    { label: 'interface starter',       insert: 'importe interface\n\nexecute cor de fundo 20 20 40\n\ndefina titulo como "Minha Interface"\napresente titulo em destaque ajuste centro m\n\ndefina btn como funcao botao("Clique aqui") execute "Olá!"\napresente btn em botao', desc: 'Template: interface visual básica' },
    { label: 'jogo starter',            insert: 'importe interface\n\nexecute cor de fundo 10 10 30\n\ndefina jogador como sprite reto(0 0, 100 0, 100 100, 0 100) com cor 100 200 100\napresente jogador em sprite ajuste centroesquerda m\n\nse tecla.atual == "ArrowRight"\n  apresente "→" em texto\nsenao\n  apresente " " em texto', desc: 'Template: jogo simples com sprite e tecla' },
  ],

  init() {
    this.popup = document.getElementById('autocomplete-popup');

    // ── Keydown on editor: navigation + trigger ──
    codeEditor.addEventListener('keydown', (e) => {
      // Ctrl+Space = force trigger
      if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        this.trigger(true);
        return;
      }
      if (!this.active) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.moveSelection(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.moveSelection(-1);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (this.items.length > 0 && this.selectedIndex >= 0) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.accept();
        } else {
          this.hide();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      }
    });

    // ── Input: auto-trigger as user types ──
    codeEditor.addEventListener('input', () => {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        const pos = codeEditor.selectionStart;
        const text = codeEditor.value;
        // Find current word length
        let start = pos;
        while (start > 0 && /[a-zA-ZÀ-ÿ0-9_]/.test(text[start - 1])) start--;
        const wordLen = pos - start;
        if (wordLen >= 2) {
          this.trigger(false);
        } else if (this.active) {
          // Re-trigger if already open (to filter/update)
          this.trigger(false);
        }
      }, 80);
    });

    // Hide on click outside
    document.addEventListener('click', (e) => {
      if (!this.popup.contains(e.target) && e.target !== codeEditor) {
        this.hide();
      }
    });

    // Hide on scroll
    codeEditor.addEventListener('scroll', () => { this.hide(); });
  },

  // Measure actual monospace character width using canvas
  measureCharWidth() {
    if (this._charWidth) return this._charWidth;
    const style = getComputedStyle(codeEditor);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = style.fontSize + ' ' + style.fontFamily;
    this._charWidth = ctx.measureText('M').width;
    return this._charWidth;
  },

  // ── Get context: what's the command at the start of the current line? ──
  getLineContext() {
    const pos = codeEditor.selectionStart;
    const text = codeEditor.value;
    // Get current line up to cursor
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
    const lineToCursor = text.substring(lineStart, pos).trimStart().toLowerCase();

    // Detect if right after "em " → suggest formats
    if (/\bem\s+\S*$/.test(lineToCursor)) return 'format';
    // Detect if right after "importe " → suggest library names
    if (/^importe\s+\S*$/.test(lineToCursor)) return 'import';
    // Detect if line starts with apresente ... em → suggest formats
    if (/^apresente\s+.+\s+em\s+\S*$/.test(lineToCursor)) return 'format';

    return 'general';
  },

  trigger(forced) {
    const pos = codeEditor.selectionStart;
    const text = codeEditor.value;

    // ── Find current word (supports multi-word scanning for builtins) ──
    let start = pos;
    while (start > 0 && /[a-zA-ZÀ-ÿ0-9_]/.test(text[start - 1])) {
      start--;
    }
    let word = text.substring(start, pos).toLowerCase();
    this.currentWord = word;
    this.wordStart = start;

    // For multi-word builtins, also try scanning further back across one space
    let multiWord = '';
    let multiStart = start;
    if (start > 0 && text[start - 1] === ' ') {
      let s2 = start - 1;
      while (s2 > 0 && /[a-zA-ZÀ-ÿ0-9_]/.test(text[s2 - 1])) s2--;
      const prevWord = text.substring(s2, start - 1).toLowerCase();
      if (prevWord) {
        multiWord = prevWord + ' ' + word;
        multiStart = s2;
      }
    }

    const context = this.getLineContext();

    if (word.length === 0 && !forced) {
      this.hide();
      return;
    }

    this.buildSuggestions(word, multiWord, multiStart, context, forced);

    if (this.items.length === 0) {
      this.hide();
      return;
    }

    this.selectedIndex = 0;
    this.render();
    this.position(start);
    this.popup.classList.add('visible');
    this.active = true;
  },

  // ── Fuzzy matching: prefix match or contains match ──
  matchScore(candidate, query) {
    if (!query) return 1; // Show all when empty query
    const c = candidate.toLowerCase();
    const q = query.toLowerCase();
    if (c.startsWith(q)) return 3;   // Prefix match = best
    if (c.includes(q)) return 2;     // Contains = good
    // Simple fuzzy: all query chars appear in order
    let qi = 0;
    for (let ci = 0; ci < c.length && qi < q.length; ci++) {
      if (c[ci] === q[qi]) qi++;
    }
    if (qi === q.length) return 1;    // Fuzzy = ok
    return 0;                          // No match
  },

  buildSuggestions(prefix, multiWord, multiStart, context, forced) {
    const suggestions = [];
    const seen = new Set();

    const addItem = (label, type, desc, score, insertText) => {
      if (seen.has(label)) return;
      seen.add(label);
      suggestions.push({ label, type, desc: desc || '', score, insert: insertText || null });
    };

    // ── Context: format suggestions after "em" ──
    if (context === 'format') {
      for (const f of this.FORMAT_DATA) {
        const s = this.matchScore(f.label, prefix);
        if (s > 0 || forced) addItem(f.label, 'fmt', f.desc, s || 1);
      }
      this.items = suggestions.sort((a, b) => b.score - a.score).slice(0, 30);
      return;
    }

    // ── Context: library name suggestions after "importe" ──
    if (context === 'import') {
      if (CrabLibRegistry && CrabLibRegistry.official) {
        for (const key of Object.keys(CrabLibRegistry.official)) {
          const s = this.matchScore(key, prefix);
          if (s > 0 || forced) {
            const lib = CrabLibRegistry.official[key];
            addItem(key, 'lib', lib.title || key, s || 1);
          }
        }
      }
      // Also check custom libs
      try {
        const custom = JSON.parse(localStorage.getItem('crabcode_custom_libs') || '[]');
        for (const lib of custom) {
          const s = this.matchScore(lib.key, prefix);
          if (s > 0 || forced) addItem(lib.key, 'lib', lib.title || lib.key, s || 1);
        }
      } catch(e) {}
      // CSV datasets
      try {
        for (const ds of getCsvDatasets()) {
          const s = this.matchScore(ds.key, prefix);
          if (s > 0 || forced) addItem(ds.key, 'arr', `📊 ${ds.title || 'Dataset CSV'} · ${ds.columns?.length || 0} colunas`, s || 1);
        }
      } catch(e) {}
      this.items = suggestions.sort((a, b) => b.score - a.score).slice(0, 40);
      return;
    }

    // ── General context ──

    // Multi-word builtins first (check if multi-word prefix matches)
    if (multiWord) {
      for (const bi of this.BUILTIN_FNS) {
        const s = this.matchScore(bi.label, multiWord);
        if (s > 0) {
          if (!seen.has(bi.label)) {
            seen.add(bi.label);
            suggestions.push({ label: bi.label, type: 'fn', desc: bi.desc, score: s + 5, insert: null, wordStart: multiStart });
          }
        }
      }
    }

    // Single-word builtins
    for (const bi of this.BUILTIN_FNS) {
      if (seen.has(bi.label)) continue;
      const s = this.matchScore(bi.label, prefix);
      if (s > 0 || (forced && prefix.length === 0)) addItem(bi.label, 'fn', bi.desc, s || 1);
    }

    // Keywords
    for (const kd of this.KEYWORD_DATA) {
      const s = this.matchScore(kd.label, prefix);
      if (s > 0 || (forced && prefix.length === 0)) addItem(kd.label, 'kw', kd.desc, s || 1);
    }

    // Snippets
    for (const sn of this.SNIPPETS) {
      const s = this.matchScore(sn.label, prefix);
      if (s > 0) {
        if (!seen.has(sn.label)) {
          seen.add(sn.label);
          suggestions.push({ label: sn.label, type: 'snip', desc: sn.desc, score: s, insert: sn.insert });
        }
      }
    }

    // ── Dynamic: lexer-declared symbols ──
    try {
      const source = codeEditor.value;
      const lexer = new Lexer(source, { registry: CrabLibRegistry, csvDatasets: getCsvDatasets() });
      lexer.tokenize();

      for (const v of lexer.declaredVars) {
        const s = this.matchScore(v, prefix);
        if (s > 0 || (forced && prefix.length === 0)) {
          if (lexer.declaredArrays.has(v)) {
            addItem(v, 'arr', 'Array declarado', s || 1);
          } else if (lexer.declaredObjects.has(v)) {
            addItem(v, 'obj', 'Objeto declarado', s || 1);
          } else {
            addItem(v, 'var', 'Variável declarada', s || 1);
          }
        }
      }

      // Declared functions
      const funcPattern = /defina\s+(\w+)\s+como\s+funcao\s*\(([^)]*)\)/g;
      let m;
      while ((m = funcPattern.exec(source)) !== null) {
        const fn = m[1];
        const params = m[2].trim();
        const s = this.matchScore(fn, prefix);
        if (s > 0 || (forced && prefix.length === 0)) {
          addItem(fn, 'fn', params ? `funcao(${params})` : 'Função declarada', s || 1);
        }
      }

      // Imported library exports
      const importPattern = /importe\s+(\w+)/g;
      while ((m = importPattern.exec(source)) !== null) {
        const key = m[1];
        const lib = CrabLibRegistry.get(key);
        if (lib) {
          // Show function exports with descriptions if available
          if (lib.functions && lib.functions.length > 0) {
            for (const fObj of lib.functions) {
              const s = this.matchScore(fObj.name, prefix);
              if (s > 0 || (forced && prefix.length === 0)) {
                const desc = fObj.desc || (fObj.params ? `${fObj.name}(${fObj.params})` : `Exportada de ${key}`);
                addItem(fObj.name, 'fn', desc, s || 1);
              }
            }
          } else if (lib.exports) {
            for (const exp of lib.exports) {
              const s = this.matchScore(exp, prefix);
              if (s > 0 || (forced && prefix.length === 0)) {
                addItem(exp, 'fn', `Exportada de ${key}`, s || 1);
              }
            }
          }
        }
        // CSV dataset columns
        try {
          const datasets = getCsvDatasets();
          const ds = datasets.find(d => d.key === key);
          if (ds && ds.columns) {
            for (const col of ds.columns) {
              const s = this.matchScore(col.name, prefix);
              if (s > 0 || (forced && prefix.length === 0)) {
                const typeLabel = col.type === 'number' ? '🔢 numérico' : '🔤 texto';
                addItem(col.name, 'arr', `${typeLabel} · ${col.values.length} valores · dataset ${key}`, s || 1);
              }
            }
          }
        } catch(e) {}
      }
    } catch(e) { /* ignore lexer errors during autocomplete */ }

    // Formats (low priority in general context)
    for (const f of this.FORMAT_DATA) {
      const s = this.matchScore(f.label, prefix);
      if (s > 0) addItem(f.label, 'fmt', f.desc, s);
    }

    // Sort by score descending, then by label length ascending (shorter = more relevant)
    suggestions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.label.length - b.label.length;
    });

    this.items = suggestions.slice(0, 30);
  },

  render() {
    this.popup.innerHTML = '';
    const badgeLabels = { kw: 'KW', var: 'VAR', arr: 'ARR', obj: 'OBJ', fn: 'FN', fmt: 'FMT', lib: 'LIB', snip: '✦' };

    this.items.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item' + (i === this.selectedIndex ? ' selected' : '');

      // Highlight matching portion of label
      let labelHtml = escapeHtml(item.label);
      if (this.currentWord && this.currentWord.length > 0) {
        const idx = item.label.toLowerCase().indexOf(this.currentWord.toLowerCase());
        if (idx >= 0) {
          const before = escapeHtml(item.label.substring(0, idx));
          const match = escapeHtml(item.label.substring(idx, idx + this.currentWord.length));
          const after = escapeHtml(item.label.substring(idx + this.currentWord.length));
          labelHtml = `${before}<span class="ac-match">${match}</span>${after}`;
        }
      }

      let descHtml = item.desc ? `<span class="ac-desc">${escapeHtml(item.desc)}</span>` : '';
      div.innerHTML = `<span class="ac-badge ${item.type}">${badgeLabels[item.type] || ''}</span><span class="ac-info"><span class="ac-label">${labelHtml}</span>${descHtml}</span>`;

      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.selectedIndex = i;
        this.accept();
      });
      this.popup.appendChild(div);
    });

    // Footer hint
    const footer = document.createElement('div');
    footer.className = 'autocomplete-footer';
    footer.textContent = '↑↓ navegar  Tab/Enter aceitar  Esc fechar';
    this.popup.appendChild(footer);
  },

  position(wordStart) {
    const text = codeEditor.value.substring(0, wordStart);
    const lines = text.split('\n');
    const lineNum = lines.length;
    const colNum = lines[lines.length - 1].length;

    const style = getComputedStyle(codeEditor);
    const lineHeight = parseFloat(style.lineHeight) || 22;
    const charWidth = this.measureCharWidth();
    const editorRect = codeEditor.getBoundingClientRect();

    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;

    let top = editorRect.top + paddingTop + (lineNum * lineHeight) - codeEditor.scrollTop + 4;
    let left = editorRect.left + paddingLeft + (colNum * charWidth) - codeEditor.scrollLeft;

    // Clamp to viewport
    const popupHeight = Math.min(260, this.items.length * 38 + 24);
    if (top + popupHeight > window.innerHeight) {
      top = top - popupHeight - lineHeight - 8;
    }
    if (left + 220 > window.innerWidth) {
      left = window.innerWidth - 230;
    }

    this.popup.style.top = Math.max(0, top) + 'px';
    this.popup.style.left = Math.max(0, left) + 'px';
  },

  moveSelection(delta) {
    this.selectedIndex = Math.max(0, Math.min(this.items.length - 1, this.selectedIndex + delta));
    this.render();
    const selected = this.popup.querySelector('.selected');
    if (selected) selected.scrollIntoView({ block: 'nearest' });
  },

  accept() {
    if (this.selectedIndex < 0 || this.selectedIndex >= this.items.length) {
      this.hide();
      return;
    }
    const item = this.items[this.selectedIndex];
    const pos = codeEditor.selectionStart;
    const text = codeEditor.value;

    // For snippets, replace the whole current word/prefix with the snippet insert text
    const insertText = item.insert || item.label;

    // Multi-word items may have an adjusted wordStart
    const ws = item.wordStart != null ? item.wordStart : this.wordStart;

    const before = text.substring(0, ws);
    const after = text.substring(pos);
    codeEditor.value = before + insertText + after;
    const newPos = ws + insertText.length;
    codeEditor.selectionStart = codeEditor.selectionEnd = newPos;
    this.hide();
    updateEditor();
    codeEditor.focus();
  },

  hide() {
    if (!this.popup) return;
    this.popup.classList.remove('visible');
    this.active = false;
    this.items = [];
    this.selectedIndex = -1;
  }
};


export { codeEditor, outputRenderer, errorManager, runtime, highlighter, updateEditor, updateLineNumbers, scheduleHighlight, syncScroll, goToLine, toggleErrorPanel, AutoComplete };

// ==================== COLOR PICKER HINT ====================
// Shows a floating color swatch when cursor is on a color-bearing line.
(function initColorPicker() {
  const COLOR_PATTERN = /(?:cor de fundo|cor de texto)\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})/i;

  let pickerEl = null;

  function ensurePicker() {
    if (pickerEl) return pickerEl;
    pickerEl = document.createElement('div');
    pickerEl.id = 'color-hint';
    pickerEl.style.cssText = [
      'position:fixed',
      'display:none',
      'z-index:9999',
      'background:var(--bg-secondary)',
      'border:1px solid var(--border)',
      'border-radius:6px',
      'padding:6px 10px',
      'box-shadow:0 4px 12px rgba(0,0,0,0.25)',
      'display:none',
      'align-items:center',
      'gap:8px',
      'font-size:12px',
      'color:var(--text-secondary)',
      'cursor:pointer',
    ].join(';');
    pickerEl.title = 'Clique para escolher cor';

    const swatch = document.createElement('div');
    swatch.id = 'color-hint-swatch';
    swatch.style.cssText = 'width:20px;height:20px;border-radius:50%;border:1px solid rgba(0,0,0,0.2);flex-shrink:0;';

    const inp = document.createElement('input');
    inp.type = 'color';
    inp.id = 'color-hint-input';
    inp.style.cssText = 'width:20px;height:20px;border:none;padding:0;background:none;cursor:pointer;opacity:0;position:absolute;left:6px;';

    const label = document.createElement('span');
    label.id = 'color-hint-label';
    label.textContent = 'cor';

    pickerEl.appendChild(swatch);
    pickerEl.appendChild(inp);
    pickerEl.appendChild(label);
    document.body.appendChild(pickerEl);

    inp.addEventListener('input', () => {
      const hex = inp.value;
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      swatch.style.background = hex;
      // Replace the RGB numbers in the current line
      _replaceColorInEditor(r, g, b);
    });

    return pickerEl;
  }

  function _replaceColorInEditor(r, g, b) {
    const src = codeEditor.value;
    const pos = codeEditor.selectionStart;
    const lineStart = src.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd   = src.indexOf('\n', pos);
    const line = src.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const newLine = line.replace(COLOR_PATTERN, (m, _r, _g, _b, offset, str) => {
      return m.replace(/\d{1,3}\s+\d{1,3}\s+\d{1,3}/, `${r} ${g} ${b}`);
    });
    if (newLine === line) return;
    const before = src.slice(0, lineStart);
    const after   = lineEnd === -1 ? '' : src.slice(lineEnd);
    codeEditor.value = before + newLine + after;
    updateEditor();
  }

  function _getCurrentLineText() {
    const src = codeEditor.value;
    const pos = codeEditor.selectionStart;
    const lineStart = src.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd   = src.indexOf('\n', pos);
    return lineEnd === -1 ? src.slice(lineStart) : src.slice(lineStart, lineEnd);
  }

  function _rgbToHex(r, g, b) {
    return '#' + [r,g,b].map(n => Math.min(255, Math.max(0, n)).toString(16).padStart(2,'0')).join('');
  }

  function _showPickerNearCursor() {
    const line = _getCurrentLineText();
    const m = COLOR_PATTERN.exec(line);
    const picker = ensurePicker();
    if (!m) { picker.style.display = 'none'; return; }

    const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
    const hex = _rgbToHex(r, g, b);
    document.getElementById('color-hint-swatch').style.background = hex;
    document.getElementById('color-hint-input').value = hex;
    document.getElementById('color-hint-label').textContent = `rgb(${r}, ${g}, ${b})`;

    // Position near caret
    const rect = codeEditor.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(codeEditor).lineHeight) || 22;
    const src = codeEditor.value;
    const pos = codeEditor.selectionStart;
    const lineNum = (src.slice(0, pos).match(/\n/g) || []).length;
    const top = rect.top + (lineNum - (codeEditor.scrollTop / lineHeight) + 1) * lineHeight;
    picker.style.display = 'flex';
    picker.style.left = (rect.right - 180) + 'px';
    picker.style.top  = Math.min(top, window.innerHeight - 60) + 'px';
  }

  // Attach events after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    codeEditor.addEventListener('keyup', _showPickerNearCursor);
    codeEditor.addEventListener('click', _showPickerNearCursor);
    codeEditor.addEventListener('blur', () => {
      setTimeout(() => { if (pickerEl) pickerEl.style.display = 'none'; }, 200);
    });
  });
})();
