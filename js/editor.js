import { Lexer, Parser, Transpiler, Runtime, CrabLibRegistry } from './language.js';
import { getCsvDatasets, saveCode } from './storage.js';
import { OutputRenderer } from './output.js';
import { escapeHtml } from './utils.js';

// ==================== ERROR MANAGER ====================
class ErrorManager {
  constructor(listEl, countEl) {
    this.listEl = listEl;
    this.countEl = countEl;
    this.errors = [];
  }

  setErrors(errors) {
    this.errors = errors || [];
    this.render();
  }

  render() {
    this.listEl.innerHTML = '';
    this.countEl.textContent = String(this.errors.length);

    if (this.errors.length === 0) {
      this.countEl.classList.add('zero');
      this.countEl.classList.remove('nonzero');
    } else {
      this.countEl.classList.remove('zero');
      this.countEl.classList.add('nonzero');
    }

    for (const err of this.errors) {
      const item = document.createElement('div');
      item.className = 'error-item';
      item.innerHTML = `
        <span class="error-icon">!</span>
        <span class="error-line-num">Linha ${err.line}</span>
        <span class="error-msg">${escapeHtml(err.message)}</span>
      `;
      item.onclick = () => goToLine(err.line);
      this.listEl.appendChild(item);
    }
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
      const escaped = escapeHtml(t.value);
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
        case 'amarelo':
          html += `<span style="color:var(--color-amarelo);font-weight:600">${escaped}</span>`;
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
        case 'bracket':
        case 'virgula':
        case 'ponto':
        case 'dois_pontos':
          html += `<span style="color:var(--text-muted)">${escaped}</span>`;
          break;
        case 'string':
          html += `<span style="color:var(--color-string-hint)">${escapeHtml(t.quote || '"')}${escaped}${escapeHtml(t.quote || '"')}</span>`;
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
    this.overlayEl.innerHTML = html + '\n';
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

const highlighter = new SyntaxHighlighter(highlightOverlay);
const outputRenderer = new OutputRenderer(outputBody);
const errorManager = new ErrorManager(errorList, errorCount);
const runtime = new Runtime();

let saveTimeout = null;
let highlightTimeout = null;

// ==================== CURSOR & STATUS ====================
function updateCursorInfo() {
  const el = document.getElementById('editor-cursor-info');
  if (!el || !codeEditor) return;
  const pos = codeEditor.selectionStart || 0;
  const text = codeEditor.value || '';
  const before = text.slice(0, pos);
  const linesBefore = before.split('\n');
  const ln = linesBefore.length;
  const col = linesBefore[linesBefore.length - 1].length + 1;
  const totalLines = text.split('\n').length;
  el.textContent = `Ln ${ln}, Col ${col} · ${totalLines} ${totalLines === 1 ? 'linha' : 'linhas'}`;
}

// ==================== UPDATE EDITOR ====================
function updateEditor() {
  updateLineNumbers();
  updateCursorInfo();
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

    highlighter.highlight(tokens);

    const parser = new Parser(
      tokens,
      new Set(lexer.declaredVars),
      new Set(lexer.declaredArrays),
      new Set(lexer.declaredObjects),
      { registry: CrabLibRegistry, csvDatasets }
    );
    const { errors: parseErrors } = parser.parse();
    errorManager.setErrors([...lexErrors, ...parseErrors]);
  }, 80);
}

function scheduleSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveCode, 450);
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
  const lineHeight = parseFloat(getComputedStyle(codeEditor).lineHeight) || 22;
  codeEditor.scrollTop = Math.max(0, (lineNum - 3) * lineHeight);
  syncScroll();
  updateCursorInfo();
}

// ==================== TOGGLE ERROR PANEL ====================
function toggleErrorPanel() {
  errorPanel.classList.toggle('collapsed');
  const arrow = document.getElementById('error-toggle-arrow');
  if (arrow) arrow.textContent = errorPanel.classList.contains('collapsed') ? '▶' : '▼';
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

  KEYWORD_DATA: [
    { label: 'defina',      desc: 'Declara variável, lista, objeto ou função' },
    { label: 'como',        desc: 'Atribui valor a uma declaração' },
    { label: 'altere',      desc: 'Altera o valor de uma variável existente' },
    { label: 'para',        desc: 'Define o novo valor na alteração' },
    { label: 'execute',     desc: 'Avalia expressão e envia ao output' },
    { label: 'apresente',   desc: 'Renderiza valor em formato visual' },
    { label: 'importe',     desc: 'Importa biblioteca oficial, personalizada ou CSV' },
    { label: 'se',          desc: 'Condicional — executa se verdadeiro' },
    { label: 'senao',       desc: 'Alternativa do condicional' },
    { label: 'repita',      desc: 'Repete N vezes' },
    { label: 'vezes',       desc: 'Fecha o comando repita N vezes' },
    { label: 'relatando',   desc: 'Mostra cada passo da iteração' },
    { label: 'enquanto',    desc: 'Repete enquanto condição for verdadeira' },
    { label: 'funcao',      desc: 'Declara uma função ou elemento interativo' },
    { label: 'objeto',      desc: 'Declara um objeto chave: valor' },
    { label: 'loop',        desc: 'Laço controlado: execute loop(inicio, cond, passo)' },
    { label: 'com',         desc: 'Usado em com N amostras ou sprite ... com cor' },
    { label: 'amostras',    desc: 'Coleta N execuções em uma lista' },
    { label: 'rodar',       desc: 'Executa um comando dentro de uma expressão' },
    { label: 'em',          desc: 'Define formato visual em apresente' },
    { label: 'e',           desc: 'Operador lógico E (ou intervalo em aleatorio entre)' },
    { label: 'ou',          desc: 'Operador lógico OU' },
    { label: 'nao',         desc: 'Negação lógica NÃO' },
    { label: 'verdadeiro',  desc: 'Valor booleano verdadeiro' },
    { label: 'falso',       desc: 'Valor booleano falso' },
    { label: 'ajuste',      desc: 'Posiciona/dimensiona elemento de interface' },
    { label: 'grid',        desc: 'Posição absoluta em grid (col lin larg alt)' },
    { label: 'cor de fundo', desc: 'Define cor RGB de fundo na interface' },
    { label: 'cor de texto', desc: 'Define cor RGB de texto na interface' },
    { label: 'sprite',      desc: 'Forma gráfica (reto, curvo ou pixel art)' },
    { label: 'reto',        desc: 'Sprite poligonal com pontos (x, y)' },
    { label: 'curvo',       desc: 'Sprite circular com raio' },
    { label: 'botao',       desc: 'Botão clicável na interface' },
    { label: 'toggle',      desc: 'Interruptor liga/desliga' },
    { label: 'slider',      desc: 'Controle deslizante numérico' },
    { label: 'seletor',     desc: 'Menu suspenso de opções' },
    { label: 'digite',      desc: 'Campo de texto livre' },
    { label: 'pergunte',    desc: 'Card de pergunta com botão OK' },
    { label: 'tecla',       desc: 'Tecla pressionada (tecla.valor / tecla.atual)' },
    { label: 'salve',       desc: 'Salva variável local ou na nuvem' },
    { label: 'carregue',    desc: 'Carrega variável local ou da nuvem' },
    { label: 'local',       desc: 'Armazenamento local (localStorage)' },
    { label: 'nuvem',       desc: 'Armazenamento remoto via API' },
    { label: 'usando',      desc: 'Define a chave de acesso para nuvem' },
  ],

  BUILTIN_FNS: [
    { label: 'potencia de',     desc: 'potencia de BASE, EXPOENTE' },
    { label: 'raiz de',         desc: 'raiz de X (raiz quadrada)' },
    { label: 'aleatorio entre', desc: 'aleatorio entre MIN e MAX' },
    { label: 'juros compostos', desc: 'juros compostos(taxa, periodos, capital)' },
    { label: 'tamanho de',      desc: 'Retorna quantidade de itens de uma lista/objeto' },
    { label: 'tendencia de',    desc: 'Regressão linear de um objeto numérico' },
    { label: 'percentil de',    desc: 'percentil de DADOS, PERCENTIL (ex: 50)' },
    { label: 'compactar',       desc: 'Soma todos os valores numéricos de uma lista/objeto' },
    { label: 'objeto de',       desc: 'objeto de CHAVES: VALORES (combina 2 listas)' },
  ],

  FORMAT_DATA: [
    { label: 'texto',         desc: 'Parágrafo de texto simples' },
    { label: 'destaque',      desc: 'Bloco em destaque visual' },
    { label: 'dados',         desc: 'Tabela estruturada de lista/matriz/objeto' },
    { label: 'tabela',        desc: 'Tabela comparativa de 1 ou 2 objetos' },
    { label: 'grafico',       desc: 'Gráfico de linhas de 1 ou 2 séries' },
    { label: 'estatisticas',  desc: 'Painel de média, mediana, desvio, mín/máx' },
    { label: 'cientifica',    desc: 'Notação científica formatada (× 10ⁿ)' },
    { label: 'apresentação',  desc: 'Cartão de apresentação visual' },
    { label: 'sprite',        desc: 'Renderiza sprite (modo interface)' },
    { label: 'botao',         desc: 'Renderiza botão (modo interface)' },
    { label: 'toggle',        desc: 'Renderiza interruptor (modo interface)' },
    { label: 'slider',        desc: 'Renderiza controle deslizante (modo interface)' },
    { label: 'seletor',       desc: 'Renderiza menu suspenso (modo interface)' },
    { label: 'digite',        desc: 'Renderiza campo de texto (modo interface)' },
    { label: 'pergunte',      desc: 'Renderiza card de pergunta (modo interface)' },
  ],

  SNIPPETS: [
    { label: 'defina como',            insert: 'defina x como 10',                                            desc: 'Declarar variável' },
    { label: 'defina como funcao',     insert: 'defina dobrar como funcao(x) execute x * 2',                  desc: 'Declarar função de 1 linha' },
    { label: 'defina como objeto',     insert: 'defina vendas como objeto jan: 120, fev: 150, mar: 210',      desc: 'Declarar objeto literal' },
    { label: 'defina como compactar',  insert: 'defina total como compactar dados',                           desc: 'Somar valores de lista/objeto' },
    { label: 'execute se senao',       insert: 'execute "Maior" se x > 10 senao "Menor ou igual"',            desc: 'Condicional inline' },
    { label: 'execute repita',         insert: 'execute aleatorio entre 1 e 6 repita 5 vezes',                desc: 'Repetição N vezes' },
    { label: 'execute loop',           insert: 'execute loop(1, i <= 5, i + 1) execute i * i',                desc: 'Laço controlado com i' },
    { label: 'altere relatando',       insert: 'altere x para x + 1 relatando enquanto x < 5',                desc: 'Iteração relatando valores' },
    { label: 'apresente em grafico',   insert: 'apresente vendas em grafico',                                 desc: 'Exibir gráfico de linhas' },
    { label: 'apresente em tabela',    insert: 'apresente vendas em tabela',                                  desc: 'Exibir tabela' },
    { label: 'apresente em estatisticas', insert: 'apresente vendas em estatisticas',                         desc: 'Painel estatístico' },
    { label: 'interface starter',      insert: 'importe interface\n\nexecute cor de fundo 15 23 42\nexecute cor de texto 226 232 240\n\ndefina n como 0\ndefina btn como funcao botao("Somar +1") altere n para n + 1\napresente "Contador Interativo" em destaque ajuste centro g\napresente btn em botao ajuste centro m\napresente "Valor atual: " + n em texto ajuste centro m', desc: 'Modelo de interface interativa' },
    { label: 'jogo starter',           insert: 'importe interface\n\nexecute cor de fundo 11 16 32\nexecute cor de texto 226 232 240\n\ndefina nave como sprite reto(50,0, 100,100, 50,78, 0,100) com cor 56 189 248\napresente "Pressione qualquer tecla" em texto ajuste centro m\napresente nave em sprite ajuste centro m\napresente "Última tecla: " + tecla.valor em destaque ajuste centro m', desc: 'Modelo de sprite + teclado' },
  ],

  init() {
    this.popup = document.getElementById('autocomplete-popup');
    if (!this.popup || !codeEditor) return;

    codeEditor.addEventListener('keydown', (e) => {
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

    codeEditor.addEventListener('input', () => {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        const pos = codeEditor.selectionStart;
        const text = codeEditor.value;
        let start = pos;
        while (start > 0 && /[a-zA-ZÀ-ÿ0-9_]/.test(text[start - 1])) start--;
        const wordLen = pos - start;
        if (wordLen >= 2) {
          this.trigger(false);
        } else if (this.active) {
          this.trigger(false);
        }
      }, 80);
    });

    document.addEventListener('click', (e) => {
      if (this.popup && !this.popup.contains(e.target) && e.target !== codeEditor) {
        this.hide();
      }
    });

    codeEditor.addEventListener('scroll', () => this.hide());
  },

  measureCharWidth() {
    if (this._charWidth) return this._charWidth;
    const style = getComputedStyle(codeEditor);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = style.fontSize + ' ' + style.fontFamily;
    this._charWidth = ctx.measureText('M').width || 8.4;
    return this._charWidth;
  },

  getLineContext() {
    const pos = codeEditor.selectionStart;
    const text = codeEditor.value;
    const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
    const lineToCursor = text.substring(lineStart, pos).trimStart().toLowerCase();

    if (/^importe\s+\S*$/.test(lineToCursor)) return 'import';
    if (/\bem\s+\S*$/.test(lineToCursor)) return 'format';
    return 'general';
  },

  trigger(forced) {
    const pos = codeEditor.selectionStart;
    const text = codeEditor.value;

    let start = pos;
    while (start > 0 && /[a-zA-ZÀ-ÿ0-9_]/.test(text[start - 1])) start--;
    const word = text.substring(start, pos).toLowerCase();
    this.currentWord = word;
    this.wordStart = start;

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

  matchScore(candidate, query) {
    if (!query) return 1;
    const c = candidate.toLowerCase();
    const q = query.toLowerCase();
    if (c.startsWith(q)) return 3;
    if (c.includes(q)) return 2;
    let qi = 0;
    for (let ci = 0; ci < c.length && qi < q.length; ci++) {
      if (c[ci] === q[qi]) qi++;
    }
    return qi === q.length ? 1 : 0;
  },

  buildSuggestions(prefix, multiWord, multiStart, context, forced) {
    const suggestions = [];
    const seen = new Set();

    const addItem = (label, type, desc, score, insertText) => {
      if (seen.has(label)) return;
      seen.add(label);
      suggestions.push({ label, type, desc: desc || '', score, insert: insertText || null });
    };

    if (context === 'format') {
      for (const f of this.FORMAT_DATA) {
        const s = this.matchScore(f.label, prefix);
        if (s > 0 || forced) addItem(f.label, 'fmt', f.desc, s || 1);
      }
      this.items = suggestions.sort((a, b) => b.score - a.score).slice(0, 30);
      return;
    }

    if (context === 'import') {
      const allLibs = CrabLibRegistry.getAll();
      for (const [key, lib] of Object.entries(allLibs)) {
        const s = this.matchScore(key, prefix);
        if (s > 0 || forced) addItem(key, 'lib', lib.title || key, s || 1);
      }
      try {
        for (const ds of getCsvDatasets()) {
          const s = this.matchScore(ds.key, prefix);
          if (s > 0 || forced) addItem(ds.key, 'arr', `Dataset CSV · ${ds.columns?.length || 0} colunas`, s || 1);
        }
      } catch { /* ignore */ }
      this.items = suggestions.sort((a, b) => b.score - a.score).slice(0, 40);
      return;
    }

    if (multiWord) {
      for (const bi of this.BUILTIN_FNS) {
        const s = this.matchScore(bi.label, multiWord);
        if (s > 0 && !seen.has(bi.label)) {
          seen.add(bi.label);
          suggestions.push({ label: bi.label, type: 'fn', desc: bi.desc, score: s + 5, insert: null, wordStart: multiStart });
        }
      }
    }

    for (const bi of this.BUILTIN_FNS) {
      if (seen.has(bi.label)) continue;
      const s = this.matchScore(bi.label, prefix);
      if (s > 0 || (forced && prefix.length === 0)) addItem(bi.label, 'fn', bi.desc, s || 1);
    }

    for (const kd of this.KEYWORD_DATA) {
      const s = this.matchScore(kd.label, prefix);
      if (s > 0 || (forced && prefix.length === 0)) addItem(kd.label, 'kw', kd.desc, s || 1);
    }

    for (const sn of this.SNIPPETS) {
      const s = this.matchScore(sn.label, prefix);
      if (s > 0 && !seen.has(sn.label)) {
        seen.add(sn.label);
        suggestions.push({ label: sn.label, type: 'snip', desc: sn.desc, score: s, insert: sn.insert });
      }
    }

    try {
      const source = codeEditor.value;
      const csvDatasets = getCsvDatasets();
      const lexer = new Lexer(source, { registry: CrabLibRegistry, csvDatasets });
      lexer.tokenize();

      for (const v of lexer.declaredVars) {
        const s = this.matchScore(v, prefix);
        if (s > 0 || (forced && prefix.length === 0)) {
          if (lexer.declaredArrays.has(v)) addItem(v, 'arr', 'Lista declarada', s || 1);
          else if (lexer.declaredObjects.has(v)) addItem(v, 'obj', 'Objeto declarado', s || 1);
          else addItem(v, 'var', 'Variável declarada', s || 1);
        }
      }

      const funcPattern = /defina\s+([a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*)\s+como\s+funcao\s*\(([^)]*)\)/g;
      let m;
      while ((m = funcPattern.exec(source)) !== null) {
        const s = this.matchScore(m[1], prefix);
        if (s > 0 || (forced && prefix.length === 0)) {
          addItem(m[1], 'fn', m[2].trim() ? `funcao(${m[2].trim()})` : 'Função declarada', s || 1);
        }
      }

      const importPattern = /^\s*importe\s+([a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*)/gm;
      while ((m = importPattern.exec(source)) !== null) {
        const key = m[1];
        const fns = CrabLibRegistry.getResolvedFunctions(key);
        if (fns.length > 0) {
          for (const fObj of fns) {
            const s = this.matchScore(fObj.name, prefix);
            if (s > 0 || (forced && prefix.length === 0)) {
              const desc = fObj.desc || `${fObj.name}(${fObj.params || ''})`;
              addItem(fObj.name, 'fn', desc, s || 1);
            }
          }
        } else {
          const exps = CrabLibRegistry.getResolvedExports(key);
          for (const exp of exps) {
            const s = this.matchScore(exp, prefix);
            if (s > 0 || (forced && prefix.length === 0)) addItem(exp, 'fn', `Exportada de ${key}`, s || 1);
          }
        }

        const ds = csvDatasets.find(d => d.key === key);
        if (ds && ds.columns) {
          for (const col of ds.columns) {
            const s = this.matchScore(col.name, prefix);
            if (s > 0 || (forced && prefix.length === 0)) {
              addItem(col.name, 'arr', `${col.type === 'number' ? 'Numérico' : 'Texto'} · ${col.values.length} linhas · ${key}`, s || 1);
            }
          }
        }
      }
    } catch { /* ignore lexer errors during autocomplete */ }

    for (const f of this.FORMAT_DATA) {
      const s = this.matchScore(f.label, prefix);
      if (s > 0) addItem(f.label, 'fmt', f.desc, s);
    }

    suggestions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.label.length - b.label.length;
    });

    this.items = suggestions.slice(0, 30);
  },

  render() {
    this.popup.innerHTML = '';
    const badgeLabels = { kw: 'KW', var: 'VAR', arr: 'LIST', obj: 'OBJ', fn: 'FN', fmt: 'FMT', lib: 'LIB', snip: '✦' };

    this.items.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item' + (i === this.selectedIndex ? ' selected' : '');

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

      const descHtml = item.desc ? `<span class="ac-desc">${escapeHtml(item.desc)}</span>` : '';
      div.innerHTML = `<span class="ac-badge ${item.type}">${badgeLabels[item.type] || ''}</span><span class="ac-info"><span class="ac-label">${labelHtml}</span>${descHtml}</span>`;

      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.selectedIndex = i;
        this.accept();
      });
      this.popup.appendChild(div);
    });

    const footer = document.createElement('div');
    footer.className = 'autocomplete-footer';
    footer.textContent = '↑↓ navegar · Tab/Enter aceitar · Esc fechar';
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

    const popupHeight = Math.min(280, this.items.length * 40 + 28);
    if (top + popupHeight > window.innerHeight) {
      top = top - popupHeight - lineHeight - 8;
    }
    if (left + 280 > window.innerWidth) {
      left = window.innerWidth - 290;
    }

    this.popup.style.top = Math.max(8, top) + 'px';
    this.popup.style.left = Math.max(8, left) + 'px';
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
    const insertText = item.insert || item.label;
    const ws = item.wordStart != null ? item.wordStart : this.wordStart;

    codeEditor.value = text.substring(0, ws) + insertText + text.substring(pos);
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

// ==================== COLOR PICKER HINT ====================
(function initColorPicker() {
  const COLOR_PATTERN = /(?:cor de fundo|cor de texto|com cor)\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})/i;
  let pickerEl = null;

  function ensurePicker() {
    if (pickerEl) return pickerEl;
    pickerEl = document.createElement('div');
    pickerEl.id = 'color-hint';
    pickerEl.className = 'color-hint-popover';
    pickerEl.title = 'Clique para escolher cor RGB';

    const swatch = document.createElement('div');
    swatch.id = 'color-hint-swatch';
    swatch.className = 'color-hint-swatch';

    const inp = document.createElement('input');
    inp.type = 'color';
    inp.id = 'color-hint-input';
    inp.className = 'color-hint-input';

    const label = document.createElement('span');
    label.id = 'color-hint-label';
    label.textContent = 'cor';

    pickerEl.appendChild(swatch);
    pickerEl.appendChild(inp);
    pickerEl.appendChild(label);
    document.body.appendChild(pickerEl);

    inp.addEventListener('input', () => {
      const hex = inp.value;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      swatch.style.background = hex;
      label.textContent = `rgb(${r}, ${g}, ${b})`;
      replaceColorInEditor(r, g, b);
    });

    return pickerEl;
  }

  function replaceColorInEditor(r, g, b) {
    const src = codeEditor.value;
    const pos = codeEditor.selectionStart;
    const lineStart = src.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = src.indexOf('\n', pos);
    const line = src.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const newLine = line.replace(COLOR_PATTERN, (m) =>
      m.replace(/\d{1,3}\s+\d{1,3}\s+\d{1,3}/, `${r} ${g} ${b}`)
    );
    if (newLine === line) return;
    codeEditor.value = src.slice(0, lineStart) + newLine + (lineEnd === -1 ? '' : src.slice(lineEnd));
    updateEditor();
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(n => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0')).join('');
  }

  function showPickerNearCursor() {
    if (!codeEditor) return;
    const src = codeEditor.value;
    const pos = codeEditor.selectionStart;
    const lineStart = src.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = src.indexOf('\n', pos);
    const line = lineEnd === -1 ? src.slice(lineStart) : src.slice(lineStart, lineEnd);

    const m = COLOR_PATTERN.exec(line);
    const picker = ensurePicker();
    if (!m) { picker.style.display = 'none'; return; }

    const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
    const hex = rgbToHex(r, g, b);
    document.getElementById('color-hint-swatch').style.background = hex;
    document.getElementById('color-hint-input').value = hex;
    document.getElementById('color-hint-label').textContent = `rgb(${r}, ${g}, ${b})`;

    const rect = codeEditor.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(codeEditor).lineHeight) || 22;
    const lineNum = (src.slice(0, pos).match(/\n/g) || []).length;
    const top = rect.top + (lineNum - (codeEditor.scrollTop / lineHeight) + 1) * lineHeight;
    picker.style.display = 'flex';
    picker.style.left = Math.max(12, rect.right - 176) + 'px';
    picker.style.top = Math.max(60, Math.min(top, window.innerHeight - 60)) + 'px';
  }

  const bind = () => {
    if (!codeEditor) return;
    codeEditor.addEventListener('keyup', () => { updateCursorInfo(); showPickerNearCursor(); });
    codeEditor.addEventListener('click', () => { updateCursorInfo(); showPickerNearCursor(); });
    codeEditor.addEventListener('blur', () => {
      setTimeout(() => {
        if (pickerEl && !pickerEl.contains(document.activeElement)) {
          pickerEl.style.display = 'none';
        }
      }, 220);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();

export {
  codeEditor, outputRenderer, errorManager, runtime, highlighter,
  updateEditor, updateLineNumbers, updateCursorInfo, scheduleHighlight,
  syncScroll, goToLine, toggleErrorPanel, AutoComplete
};
