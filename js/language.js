// js/language.js
// CrabCode language engine: TokenDef, Lexer, Parser, Transpiler, Runtime, CrabLibRegistry
// ==================== CONSTANTS ====================
const CRABCODE_CLOUD_URL = 'https://crabcode-api.onrender.com';

// ==================== TOKEN DEFINITIONS ====================
const TokenDef = {
  // Module colors
  LARANJA: 'laranja',
  ROXO: 'roxo',
  AZUL: 'azul',
  BRANCO: 'branco',
  VERMELHO: 'vermelho',
  NUMERO: 'numero',
  OPERADOR: 'operador',
  ERRO: 'erro',
  PAREN: 'paren',
  VIRGULA: 'virgula',
  NEWLINE: 'newline',
  WHITESPACE: 'ws',

  // Token types
  types: {
    // Laranja (Primary)
    DEFINA: { word: 'defina', module: 'laranja' },
    ALTERE: { word: 'altere', module: 'laranja' },
    EXECUTE: { word: 'execute', module: 'laranja' },
    APRESENTE: { word: 'apresente', module: 'laranja' },
    IMPORTE: { word: 'importe', module: 'laranja' },

    // Roxo (Secondary)
    COMO: { word: 'como', module: 'roxo' },
    PARA: { word: 'para', module: 'roxo' },
    EM: { word: 'em', module: 'roxo' },
    SE: { word: 'se', module: 'roxo' },
    REPITA: { word: 'repita', module: 'roxo' },
    LOOP: { word: 'loop', module: 'roxo' },
    COM: { word: 'com', module: 'roxo' },
    PERCENTIL_DE: { word: 'percentil de', module: 'roxo' },
    TAMANHO_DE: { word: 'tamanho de', module: 'roxo' },
    POTENCIA_DE: { word: 'potencia de', module: 'roxo' },
    RAIZ_DE: { word: 'raiz de', module: 'roxo' },
    ALEATORIO_ENTRE: { word: 'aleatorio entre', module: 'roxo' },
    JUROS_COMPOSTOS: { word: 'juros compostos', module: 'roxo' },

    // Azul (Tertiary)
    FUNCAO: { word: 'funcao', module: 'azul' },
    OBJETO_DE: { word: 'objeto de', module: 'azul' },
    TENDENCIA_DE: { word: 'tendencia de', module: 'azul' },
    OBJETO: { word: 'objeto', module: 'azul' },
    TEXTO: { word: 'texto', module: 'azul' },
    DESTAQUE: { word: 'destaque', module: 'azul' },
    APRESENTACAO: { word: 'apresentação', module: 'azul' },
    APRESENTACAO_ALT: { word: 'apresentacao', module: 'azul' },
    DADOS: { word: 'dados', module: 'azul' },
    TABELA: { word: 'tabela', module: 'azul' },
    GRAFICO: { word: 'grafico', module: 'azul' },
    ESTATISTICAS: { word: 'estatisticas', module: 'azul' },
    CIENTIFICA: { word: 'cientifica', module: 'azul' },
    AMOSTRAS: { word: 'amostras', module: 'azul' },
    COMPACTAR: { word: 'compactar', module: 'azul' },
    RELATANDO: { word: 'relatando', module: 'azul' },
    ENQUANTO: { word: 'enquanto', module: 'azul' },
    VEZES: { word: 'vezes', module: 'azul' },
    E_CONJ: { word: 'e', module: 'azul' },
    SENAO: { word: 'senao', module: 'azul' },

    // Vermelho (Special)
    RODAR: { word: 'rodar', module: 'vermelho' },

    // Laranja additions — salve/carregue
    SALVE:    { word: 'salve',    module: 'laranja' },
    CARREGUE: { word: 'carregue', module: 'laranja' },

    // Roxo additions — local/nuvem/usando (context-sensitive)
    LOCAL:  { word: 'local',  module: 'roxo' },
    NUVEM:  { word: 'nuvem',  module: 'roxo' },
    USANDO: { word: 'usando', module: 'roxo' },

    // Amarelo additions — interface layout (context-sensitive: only in interface mode)
    AJUSTE:       { word: 'ajuste',       module: 'amarelo' },
    GRID:         { word: 'grid',         module: 'amarelo' },
    COR_AMARELO:  { word: 'cor',          module: 'amarelo' },
    COR_DE_TEXTO: { word: 'cor de texto', module: 'amarelo' },
    COR_DE_FUNDO: { word: 'cor de fundo', module: 'amarelo' },

    // Azul additions — sprites (context-sensitive: only in interface mode)
    SPRITE: { word: 'sprite', module: 'azul' },
    RETO:   { word: 'reto',   module: 'azul' },
    CURVO:  { word: 'curvo',  module: 'azul' },

    // Azul additions — interactive elements (context-sensitive: only in interface mode)
    BOTAO:   { word: 'botao',   module: 'azul' },
    TOGGLE:  { word: 'toggle',  module: 'azul' },
    SLIDER:  { word: 'slider',  module: 'azul' },
    SELETOR: { word: 'seletor', module: 'azul' },
    DIGITE:  { word: 'digite',  module: 'azul' },
    PERGUNTE: { word: 'pergunte', module: 'azul' },
  },

  // Characters that are always errors
  illegalChars: new Set([';', '{', '}', '[', ']', '@', '&', '~', '`', '\\', '|', '?', '^', '%', '$']),

  // Operators
  operators: new Set(['+', '-', '*', '/', '>', '<', '=', '!']),
  multiCharOps: ['!=', '>=', '<='],
};

// ==================== LEXER ====================
class Lexer {
  constructor(source, { registry = null, csvDatasets = [] } = {}) {
    this.source = source;
    this.tokens = [];
    this.errors = [];
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.declaredVars = new Set();
    this.declaredArrays = new Set();
    this.declaredObjects = new Set();
    this._registry = registry;
    this._csvDatasets = csvDatasets;
  }

  peek(offset = 0) {
    return this.source[this.pos + offset];
  }

  advance(n = 1) {
    for (let i = 0; i < n; i++) {
      if (this.source[this.pos] === '\n') {
        this.line++;
        this.col = 1;
      } else {
        this.col++;
      }
      this.pos++;
    }
  }

  remaining() {
    return this.source.substring(this.pos);
  }

  matchWord(word) {
    const rem = this.source.substring(this.pos, this.pos + word.length + 1);
    if (rem.toLowerCase().startsWith(word)) {
      const after = this.source[this.pos + word.length];
      if (!after || /[\s(),\n]/.test(after)) {
        return true;
      }
    }
    return false;
  }

  tokenize() {
    // First pass: collect all declared variable/function/array names for accurate colorization
    const preSource = this.source;
    const defineRe = /^\s*defina\s+([a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*)\s+como\s+(.*)/gim;
    let m;
    while ((m = defineRe.exec(preSource)) !== null) {
      const name = m[1];
      const rest = m[2].trim();
      this.declaredVars.add(name);
      // Detect object first (takes priority over array detection)
      if (rest.match(/^objeto de\b/i)) {
        this.declaredObjects.add(name);
      } else if (rest.match(/^tendencia de\b/i)) {
        this.declaredObjects.add(name);
      } else if (rest.match(/^objeto\b/i)) {
        this.declaredObjects.add(name);
      } else if (!rest.match(/^funcao\b/i)) {
        // Detect array: not funcao/objeto, has comma at root level outside parens/strings
        let depth = 0;
        let hasRootComma = false;
        let inStr = false, strChar = '';
        for (let ci = 0; ci < rest.length; ci++) {
          const c = rest[ci];
          if (inStr) { if (c === strChar) inStr = false; continue; }
          if (c === '"' || c === "'") { inStr = true; strChar = c; continue; }
          if (c === '(') depth++;
          else if (c === ')') depth--;
          else if (c === ',' && depth === 0) { hasRootComma = true; break; }
          else if (c === '#') break;
        }
        if (hasRootComma) this.declaredArrays.add(name);
      }
    }

    // Pre-pass: register exports from imported libraries and CSV datasets (lazy-loading awareness)
    const importeRe = /^\s*importe\s+([a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*)/gim;
    let im;
    const _csvDatasets = this._csvDatasets;
    const _csvMap = Object.fromEntries(_csvDatasets.map(d => [d.key, d]));
    while ((im = importeRe.exec(preSource)) !== null) {
      const libName = im[1];
      const lib = this._registry ? this._registry.get(libName) : null;
      if (lib) {
        if (lib.dependencies) {
          for (const depName of lib.dependencies) {
            const depLib = this._registry ? this._registry.get(depName) : null;
            if (depLib && depLib.exports) {
              for (const expName of depLib.exports) this.declaredVars.add(expName);
            }
          }
        }
        if (lib.exports) {
          for (const expName of lib.exports) this.declaredVars.add(expName);
        }
      } else if (_csvMap[libName]) {
        const ds = _csvMap[libName];
        for (const col of ds.columns) {
          this.declaredVars.add(col.name);
          this.declaredArrays.add(col.name);
        }
      }
    }

    // Detect interface mode: importe interface
    this._interfaceMode = /^\s*importe\s+interface\s*(?:#.*)?$/im.test(preSource);
    if (this._interfaceMode) {
      // Inject system vars so validation passes
      this.declaredVars.add('tecla');
    }

    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];

      // Newline
      if (ch === '\n') {
        this.tokens.push({ type: 'NEWLINE', value: '\n', module: 'newline', line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // String literal entre aspas simples ou duplas
      if (ch === '"' || ch === "'") {
        const quote = ch;
        const startLine = this.line;
        const startCol = this.col;
        this.advance(); // consome a aspa de abertura
        let content = '';
        let closed = false;
        while (this.pos < this.source.length) {
          const c = this.source[this.pos];
          if (c === '\n') break; // string não pode cruzar linha
          if (c === quote) {
            this.advance(); // consome a aspa de fechamento
            closed = true;
            break;
          }
          content += c;
          this.advance();
        }
        if (!closed) {
          this.errors.push({
            message: `String não fechada: faltou ${quote === '"' ? 'aspas duplas' : 'aspas simples'} de fechamento`,
            line: startLine, col: startCol, length: 1
          });
          this.tokens.push({ type: 'ILLEGAL', value: quote + content, module: 'erro', line: startLine, col: startCol });
        } else {
          this.tokens.push({ type: 'STRING', value: content, quote, module: 'string', line: startLine, col: startCol });
        }
        continue;
      }

      // Comment: # até o fim da linha
      if (ch === '#') {
        let start = this.pos;
        let startCol = this.col;
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
          this.advance();
        }
        this.tokens.push({ type: 'COMMENT', value: this.source.substring(start, this.pos), module: 'comentario', line: this.line, col: startCol });
        continue;
      }

      // Whitespace
      if (/[ \t\r]/.test(ch)) {
        let start = this.pos;
        let startCol = this.col;
        while (this.pos < this.source.length && /[ \t\r]/.test(this.source[this.pos]) && this.source[this.pos] !== '\n') {
          this.advance();
        }
        this.tokens.push({ type: 'WS', value: this.source.substring(start, this.pos), module: 'ws', line: this.line, col: startCol });
        continue;
      }

      // Illegal characters
      if (TokenDef.illegalChars.has(ch)) {
        this.errors.push({
          message: `Caractere '${ch}' não é reconhecido pelo CrabCode`,
          line: this.line, col: this.col, length: 1
        });
        this.tokens.push({ type: 'ILLEGAL', value: ch, module: 'erro', line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Parentheses
      if (ch === '(' || ch === ')') {
        this.tokens.push({ type: 'PAREN', value: ch, module: 'paren', line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Comma
      if (ch === ',') {
        this.tokens.push({ type: 'VIRGULA', value: ',', module: 'virgula', line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Dois-pontos (separador de par chave:valor em objetos)
      if (ch === ':') {
        this.tokens.push({ type: 'DOIS_PONTOS', value: ':', module: 'dois_pontos', line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Multi-char operators: !=, >=, <=
      if (this.pos + 1 < this.source.length) {
        const two = this.source.substring(this.pos, this.pos + 2);
        if (TokenDef.multiCharOps.includes(two)) {
          this.tokens.push({ type: 'OPERATOR', value: two, module: 'operador', line: this.line, col: this.col });
          this.advance(2);
          continue;
        }
      }

      // Single-char operators
      if (TokenDef.operators.has(ch)) {
        this.tokens.push({ type: 'OPERATOR', value: ch, module: 'operador', line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Numbers  
      if (/[0-9]/.test(ch) || (ch === '.' && this.pos + 1 < this.source.length && /[0-9]/.test(this.source[this.pos + 1]))) {
        let start = this.pos;
        let startCol = this.col;
        let hasDot = false;
        while (this.pos < this.source.length && (/[0-9]/.test(this.source[this.pos]) || (this.source[this.pos] === '.' && !hasDot))) {
          if (this.source[this.pos] === '.') hasDot = true;
          this.advance();
        }
        this.tokens.push({ type: 'NUMBER', value: this.source.substring(start, this.pos), module: 'numero', line: this.line, col: startCol });
        continue;
      }

      // Words (keywords or identifiers)
      if (/[a-zA-ZÀ-ÿ_]/.test(ch)) {
        let startCol = this.col;
        let startLine = this.line;

        // Try multi-word keywords first
        const multiWordKeys = [
          { key: 'POTENCIA_DE', word: 'potencia de' },
          { key: 'RAIZ_DE', word: 'raiz de' },
          { key: 'ALEATORIO_ENTRE', word: 'aleatorio entre' },
          { key: 'OBJETO_DE', word: 'objeto de' },
          { key: 'TENDENCIA_DE', word: 'tendencia de' },
          { key: 'JUROS_COMPOSTOS', word: 'juros compostos' },
          { key: 'PERCENTIL_DE', word: 'percentil de' },
          { key: 'TAMANHO_DE', word: 'tamanho de' },
          { key: 'COR_DE_TEXTO', word: 'cor de texto' },
          { key: 'COR_DE_FUNDO', word: 'cor de fundo' },
        ];

        let matched = false;
        for (const mk of multiWordKeys) {
          if (this.matchWord(mk.word)) {
            // OBJETO_DE and TENDENCIA_DE are context-sensitive: only when DEFINA+COMO are on this line
            if (mk.key === 'OBJETO_DE' || mk.key === 'TENDENCIA_DE') {
              let hasDefina = false, hasComo = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'DEFINA') hasDefina = true;
                if (this.tokens[i].type === 'COMO') hasComo = true;
              }
              if (!hasDefina || !hasComo) continue;
            }
            // Amarelo multi-word tokens — only in interface mode
            if (mk.key === 'COR_DE_TEXTO' || mk.key === 'COR_DE_FUNDO') {
              if (!this._interfaceMode) continue;
            }
            const val = this.source.substring(this.pos, this.pos + mk.word.length);
            this.tokens.push({
              type: mk.key,
              value: val,
              module: TokenDef.types[mk.key].module,
              line: startLine,
              col: startCol
            });
            this.advance(mk.word.length);
            matched = true;
            break;
          }
        }
        if (matched) continue;

        // Single word
        let start = this.pos;
        while (this.pos < this.source.length && /[a-zA-ZÀ-ÿ0-9_]/.test(this.source[this.pos])) {
          this.advance();
        }
        const word = this.source.substring(start, this.pos);
        const wordLower = word.toLowerCase();

        // Check keywords
        let found = false;
        for (const [key, def] of Object.entries(TokenDef.types)) {
          if (def.word === wordLower) {
            // Special case: 'rodar' needs '(' check for RODAR module
            if (key === 'RODAR') {
              // Check if followed by '('
              let lookAhead = this.pos;
              while (lookAhead < this.source.length && /[ \t]/.test(this.source[lookAhead])) lookAhead++;
              if (this.source[lookAhead] === '(') {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              // Not followed by ( => treat as identifier
              continue;
            }
            // 'com' is special — only roxo in context of 'execute'
            if (key === 'COM') {
              let hasExecute = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'EXECUTE') { hasExecute = true; break; }
              }
              if (hasExecute) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'amostras' is special — only azul in context of 'com'
            if (key === 'AMOSTRAS') {
              let hasCom = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'COM') { hasCom = true; break; }
              }
              if (hasCom) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'compactar' is special — only azul in context of defina+como
            if (key === 'COMPACTAR') {
              let hasDefina = false, hasComo = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'COMO') hasComo = true;
                if (this.tokens[i].type === 'DEFINA') { hasDefina = true; break; }
              }
              if (hasDefina && hasComo) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'loop' is special — only roxo in context of 'execute'
            if (key === 'LOOP') {
              // loop must be followed by '(' and have EXECUTE earlier on this line
              let lookAhead = this.pos;
              while (lookAhead < this.source.length && /[ \t]/.test(this.source[lookAhead])) lookAhead++;
              if (this.source[lookAhead] !== '(') continue; // not followed by ( => identifier
              let hasExecute = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'EXECUTE') { hasExecute = true; break; }
              }
              if (hasExecute) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'e' is special — only azul in context of 'aleatorio entre X e Y'
            if (key === 'E_CONJ') {
              // Check context: is there an 'ALEATORIO_ENTRE' earlier on this line?
              let hasAleatorio = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'ALEATORIO_ENTRE') { hasAleatorio = true; break; }
              }
              if (hasAleatorio) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              // Not in aleatorio context => identifier
              continue;
            }
            // 'para' is special — only roxo in context of 'altere VAR para EXPR'
            if (key === 'PARA') {
              let hasAltere = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'ALTERE') { hasAltere = true; break; }
              }
              if (hasAltere) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'relatando' is special — only azul in context of 'altere'
            if (key === 'RELATANDO') {
              let hasAltere = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'ALTERE') { hasAltere = true; break; }
              }
              if (hasAltere) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'enquanto' is special — only azul when 'altere' is on same line
            if (key === 'ENQUANTO') {
              let hasAltere = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'ALTERE') { hasAltere = true; break; }
              }
              if (hasAltere) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'local' is special — only roxo when SALVE or CARREGUE is on same line
            if (key === 'LOCAL') {
              let hasSalveCarregue = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'SALVE' || this.tokens[i].type === 'CARREGUE') { hasSalveCarregue = true; break; }
              }
              if (hasSalveCarregue) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'nuvem' is special — only roxo when SALVE or CARREGUE is on same line
            if (key === 'NUVEM') {
              let hasSalveCarregue = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'SALVE' || this.tokens[i].type === 'CARREGUE') { hasSalveCarregue = true; break; }
              }
              if (hasSalveCarregue) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // 'usando' is special — only roxo when NUVEM is on same line
            if (key === 'USANDO') {
              let hasNuvem = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'NUVEM') { hasNuvem = true; break; }
              }
              if (hasNuvem) {
                this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
                found = true;
                break;
              }
              continue;
            }
            // Amarelo tokens — only active in interface mode
            if (key === 'AJUSTE' || key === 'GRID' || key === 'COR_AMARELO' || key === 'COR_DE_FUNDO') {
              if (!this._interfaceMode) continue;
            }
            // COR_DE_TEXTO — only after APRESENTE on same line, in interface mode
            if (key === 'COR_DE_TEXTO') {
              if (!this._interfaceMode) continue;
              let hasApresente = false;
              for (let i = this.tokens.length - 1; i >= 0; i--) {
                if (this.tokens[i].type === 'NEWLINE') break;
                if (this.tokens[i].type === 'APRESENTE') { hasApresente = true; break; }
              }
              if (!hasApresente) continue;
            }
            // Sprite tokens — only active in interface mode
            if (key === 'SPRITE' || key === 'RETO' || key === 'CURVO') {
              if (!this._interfaceMode) continue;
            }
            // Interactive element tokens — only active in interface mode
            if (key === 'BOTAO' || key === 'TOGGLE' || key === 'SLIDER' || key === 'SELETOR' || key === 'DIGITE' || key === 'PERGUNTE') {
              if (!this._interfaceMode) continue;
            }
            this.tokens.push({ type: key, value: word, module: def.module, line: startLine, col: startCol });
            found = true;
            break;
          }
        }

        if (!found) {
          // Check if this identifier follows 'importe' — color library name as laranja
          let idModule = 'branco';
          for (let bk = this.tokens.length - 1; bk >= 0; bk--) {
            if (this.tokens[bk].type === 'WS') continue;
            if (this.tokens[bk].type === 'IMPORTE') idModule = 'laranja';
            break;
          }
          this.tokens.push({ type: 'IDENTIFIER', value: word, module: idModule, line: startLine, col: startCol });
        }
        continue;
      }

      // Ponto — acesso de propriedade de objeto (ex: joao.idade)
      // Nota: ponto como decimal (0.5) já foi capturado acima no bloco de Numbers
      if (ch === '.') {
        this.tokens.push({ type: 'PONTO', value: '.', module: 'ponto', line: this.line, col: this.col });
        this.advance();
        continue;
      }

      // Unknown character
      this.errors.push({
        message: `Caractere '${ch}' não é reconhecido pelo CrabCode`,
        line: this.line, col: this.col, length: 1
      });
      this.tokens.push({ type: 'ILLEGAL', value: ch, module: 'erro', line: this.line, col: this.col });
      this.advance();
    }

    return { tokens: this.tokens, errors: this.errors };
  }
}

// ==================== PARSER ====================
class Parser {
  constructor(tokens, declaredVars, declaredArrays, declaredObjects, { registry = null, csvDatasets = [] } = {}) {
    this.tokens = tokens.filter(t => t.type !== 'WS' && t.type !== 'COMMENT'); // remove whitespace and comment tokens for parsing
    this.allTokens = tokens; // keep all for highlighting
    this.pos = 0;
    this.errors = [];
    this.ast = [];
    this.declaredVars = declaredVars || new Set();
    this.declaredArrays = declaredArrays || new Set();
    this.declaredObjects = declaredObjects || new Set();
    this._registry = registry;
    this._csvDatasets = csvDatasets;
  }

  peek() { return this.tokens[this.pos]; }
  advance() { return this.tokens[this.pos++]; }
  
  isAtEnd() { return this.pos >= this.tokens.length; }

  expect(type) {
    const t = this.peek();
    if (!t || t.type !== type) return null;
    return this.advance();
  }

  // Split tokens into lines
  getLines() {
    const lines = [[]];
    for (const t of this.tokens) {
      if (t.type === 'NEWLINE') {
        lines.push([]);
      } else {
        lines[lines.length - 1].push(t);
      }
    }
    return lines.filter(l => l.length > 0);
  }

  // ---- VALIDATION HELPERS ----

  // Validates a token sequence that represents an expression
  // Reports: unbalanced parens, unknown function calls, empty expressions, operator misuse
  validateExpr(tokens, context) {
    if (!tokens || tokens.length === 0) return;

    // 1. Balanced parentheses
    let depth = 0;
    let lastOpenTok = null;
    for (const t of tokens) {
      if (t.type === 'PAREN' && t.value === '(') { depth++; lastOpenTok = t; }
      else if (t.type === 'PAREN' && t.value === ')') {
        depth--;
        if (depth < 0) {
          this.errors.push({ message: `Parêntese ')' sem abertura correspondente`, line: t.line, col: t.col, length: 1 });
          depth = 0;
        }
      }
    }
    if (depth > 0 && lastOpenTok) {
      this.errors.push({ message: `Parêntese '(' não foi fechado`, line: lastOpenTok.line, col: lastOpenTok.col, length: 1 });
    }

    // 2. Operator at start or end (not counting unary minus edge case)
    const meaningful = tokens.filter(t => t.type !== 'PAREN' && t.type !== 'VIRGULA');
    if (meaningful.length > 0) {
      const first = meaningful[0];
      const last = meaningful[meaningful.length - 1];
      if (first.type === 'OPERATOR' && first.value !== '-') {
        this.errors.push({ message: `Expressão começa com operador '${first.value}' inválido`, line: first.line, col: first.col, length: first.value.length });
      }
      if (last.type === 'OPERATOR') {
        this.errors.push({ message: `Expressão termina com operador '${last.value}' sem segundo operando`, line: last.line, col: last.col, length: last.value.length });
      }
    }

    // 3. Two consecutive operators
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i].type === 'OPERATOR' && tokens[i + 1].type === 'OPERATOR') {
        this.errors.push({ message: `Dois operadores consecutivos: '${tokens[i].value}' e '${tokens[i+1].value}'`, line: tokens[i].line, col: tokens[i].col, length: tokens[i].value.length });
      }
    }

    // 4. Function/array calls: identifier followed by '(' — check the name is declared
    for (let i = 0; i < tokens.length - 1; i++) {
      const t = tokens[i];
      const next = tokens[i + 1];
      if (t.type === 'IDENTIFIER' && next && next.type === 'PAREN' && next.value === '(') {
        if (!this.declaredVars.has(t.value) && t.value !== 'rodar') {
          this.errors.push({ message: `'${t.value}' não foi declarado como função ou array`, line: t.line, col: t.col, length: t.value.length });
        }
      }
    }

    // 5. Object property access: IDENTIFIER PONTO — check object is declared
    for (let i = 0; i < tokens.length - 1; i++) {
      const t = tokens[i];
      const next = tokens[i + 1];
      if (t.type === 'IDENTIFIER' && next && next.type === 'PONTO') {
        if (!this.declaredVars.has(t.value)) {
          this.errors.push({ message: `'${t.value}' não foi declarado`, line: t.line, col: t.col, length: t.value.length });
        }
      }
    }
  }

  // Validates that a condition has a comparison operator
  validateCond(tokens, context) {
    if (!tokens || tokens.length === 0) return;
    const hasComparison = tokens.some(t => t.type === 'OPERATOR' && ['>', '<', '=', '!=', '>=', '<='].includes(t.value));
    if (!hasComparison) {
      const first = tokens[0];
      this.errors.push({ message: `Condição após '${context}' não tem operador de comparação (use >, <, =, !=, >=, <=)`, line: first.line, col: first.col, length: first.value.length });
    }
    this.validateExpr(tokens, context);
  }

  // Check a repetition count — must be a single number or declared variable
  validateRepeatCount(timesTokens, repitaToken) {
    if (!timesTokens || timesTokens.length === 0) {
      this.errors.push({ message: `Esperado número após 'repita'`, line: repitaToken.line, col: repitaToken.col, length: repitaToken.value.length });
      return;
    }
    if (timesTokens.length === 1) {
      const t = timesTokens[0];
      if (t.type === 'NUMBER') {
        const n = parseFloat(t.value);
        if (n < 0) this.errors.push({ message: `Número de repetições não pode ser negativo`, line: t.line, col: t.col, length: t.value.length });
        if (!Number.isInteger(n)) this.errors.push({ message: `Número de repetições deve ser inteiro, não '${t.value}'`, line: t.line, col: t.col, length: t.value.length });
      } else if (t.type === 'IDENTIFIER') {
        if (!this.declaredVars.has(t.value)) {
          this.errors.push({ message: `'${t.value}' não foi declarado — use um número ou variável declarada`, line: t.line, col: t.col, length: t.value.length });
        }
      } else {
        this.errors.push({ message: `Valor inválido para número de repetições: '${t.value}'`, line: t.line, col: t.col, length: t.value.length });
      }
    }
  }

  parse() {
    const lines = this.getLines();
    
    for (const lineTokens of lines) {
      if (lineTokens.length === 0) continue;
      this.parseLineTokens(lineTokens);
    }

    return { ast: this.ast, errors: this.errors };
  }

  parseLineTokens(tokens) {
    if (tokens.length === 0) return;

    const first = tokens[0];

    // Check for illegal tokens
    for (const t of tokens) {
      if (t.type === 'ILLEGAL') {
        // Error already added by lexer
      }
    }

    // Count laranja commands (except inside funcao bodies)
    let laranjaCount = 0;
    let inFuncao = false;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === 'FUNCAO') inFuncao = true;
      if (['DEFINA', 'EXECUTE', 'APRESENTE'].includes(t.type)) {
        if (!inFuncao || laranjaCount === 0) {
          laranjaCount++;
        }
      }
    }

    // First token must be a primary command (LARANJA)
    if (first.type === 'DEFINA') {
      this.parseDefina(tokens);
    } else if (first.type === 'ALTERE') {
      this.parseAltere(tokens);
    } else if (first.type === 'EXECUTE') {
      this.parseExecute(tokens);
    } else if (first.type === 'APRESENTE') {
      this.parseApresente(tokens);
    } else if (first.type === 'IMPORTE') {
      this.parseImporte(tokens);
    } else if (first.type === 'SALVE') {
      this.parseSalve(tokens);
    } else if (first.type === 'CARREGUE') {
      this.parseCarregue(tokens);
    } else if (['COMO', 'PARA', 'EM', 'SE', 'REPITA', 'LOOP', 'COM', 'POTENCIA_DE', 'RAIZ_DE', 'ALEATORIO_ENTRE', 'JUROS_COMPOSTOS', 'PERCENTIL_DE', 'TAMANHO_DE', 'LOCAL', 'NUVEM', 'USANDO'].includes(first.type)) {
      this.errors.push({
        message: `'${first.value}' é um comando secundário e não pode iniciar uma linha. Use 'defina', 'altere', 'execute', 'apresente' ou 'importe' primeiro.`,
        line: first.line, col: first.col, length: first.value.length
      });
    } else if (['FUNCAO', 'OBJETO', 'OBJETO_DE', 'TENDENCIA_DE', 'TEXTO', 'DESTAQUE', 'APRESENTACAO', 'APRESENTACAO_ALT', 'DADOS', 'TABELA', 'GRAFICO', 'ESTATISTICAS', 'CIENTIFICA', 'AMOSTRAS', 'COMPACTAR', 'RELATANDO', 'ENQUANTO', 'VEZES', 'E_CONJ', 'SENAO'].includes(first.type)) {
      this.errors.push({
        message: `'${first.value}' é um comando terciário e não pode iniciar uma linha.`,
        line: first.line, col: first.col, length: first.value.length
      });
    } else {
      this.errors.push({
        message: `Linha deve começar com 'defina', 'altere', 'execute', 'apresente' ou 'importe'. Encontrado: '${first.value}'`,
        line: first.line, col: first.col, length: first.value.length
      });
    }
  }

  parseAltere(tokens) {
    // Forms:
    // altere VAR para EXPR
    // altere VAR para EXPR relatando
    // altere VAR para EXPR relatando(N)
    // altere VAR para EXPR relatando enquanto COND
    if (tokens.length < 2) {
      this.errors.push({ message: `'altere' precisa de um nome. Ex: altere x para x + 1`, line: tokens[0].line, col: tokens[0].col, length: tokens[0].value.length });
      return;
    }

    const nameToken = tokens[1];
    if (nameToken.type !== 'IDENTIFIER') {
      this.errors.push({ message: `Esperado nome de variável após 'altere', mas encontrou '${nameToken.value}'`, line: nameToken.line, col: nameToken.col, length: nameToken.value.length });
      return;
    }

    if (!this.declaredVars.has(nameToken.value)) {
      this.errors.push({ message: `'${nameToken.value}' não foi declarado. Use 'defina' primeiro antes de 'altere' (ou verifique o nome do parâmetro)`, line: nameToken.line, col: nameToken.col, length: nameToken.value.length });
      // Don't return — still emit node so function bodies with params work
    }

    if (tokens.length < 3 || tokens[2].type !== 'PARA') {
      this.errors.push({ message: `Esperado 'para' após 'altere ${nameToken.value}'. Ex: altere ${nameToken.value} para VALOR`, line: nameToken.line, col: nameToken.col, length: nameToken.value.length });
      return;
    }

    // Find RELATANDO and ENQUANTO at root depth (outside parens)
    let relatandoIdx = -1, enquantoIdx = -1;
    let depth = 0;
    for (let i = 3; i < tokens.length; i++) {
      if (tokens[i].type === 'PAREN' && tokens[i].value === '(') depth++;
      else if (tokens[i].type === 'PAREN' && tokens[i].value === ')') depth--;
      else if (tokens[i].type === 'RELATANDO' && depth === 0) relatandoIdx = i;
      else if (tokens[i].type === 'ENQUANTO' && depth === 0) enquantoIdx = i;
    }

    let valueTokens, relatandoN = null, enquantoTokens = null;

    // Determine value tokens — everything before the first modifier (relatando or enquanto)
    const firstModifier = [relatandoIdx, enquantoIdx].filter(i => i !== -1).reduce((a, b) => Math.min(a, b), tokens.length);
    valueTokens = tokens.slice(3, firstModifier);

    // Parse relatando modifier
    const hasRelatando = relatandoIdx !== -1;
    if (hasRelatando) {
      const afterRelatando = tokens.slice(relatandoIdx + 1);
      // Check for relatando(N) — next token is '('
      if (afterRelatando.length > 0 && afterRelatando[0].type === 'PAREN' && afterRelatando[0].value === '(') {
        // Collect N inside parens
        let j = 1, nTokens = [], d = 1;
        while (j < afterRelatando.length && d > 0) {
          if (afterRelatando[j].type === 'PAREN' && afterRelatando[j].value === '(') d++;
          else if (afterRelatando[j].type === 'PAREN' && afterRelatando[j].value === ')') { d--; if (d === 0) break; }
          nTokens.push(afterRelatando[j]);
          j++;
        }
        relatandoN = nTokens;
        if (relatandoN.length === 0) {
          this.errors.push({ message: `'relatando()' precisa de um número. Ex: relatando(5)`, line: tokens[relatandoIdx].line, col: tokens[relatandoIdx].col, length: tokens[relatandoIdx].value.length });
        }
        // relatando(N) + enquanto is invalid
        if (enquantoIdx !== -1) {
          this.errors.push({ message: `'relatando(N) enquanto' não é permitido — use 'relatando enquanto' (sem parênteses) ou só 'relatando(N)'`, line: tokens[enquantoIdx].line, col: tokens[enquantoIdx].col, length: tokens[enquantoIdx].value.length });
          enquantoIdx = -1; // ignore the enquanto
        }
      }
      // else bare 'relatando' — no N, enquanto still possible
    }

    // Parse enquanto modifier (independent of relatando)
    if (enquantoIdx !== -1) {
      enquantoTokens = tokens.slice(enquantoIdx + 1);
      // If relatando(N) was parsed, enquantoTokens might include garbage — already nulled above
      if (enquantoTokens.length === 0) {
        this.errors.push({ message: `'enquanto' precisa de uma condição. Ex: enquanto valor < 10`, line: tokens[enquantoIdx].line, col: tokens[enquantoIdx].col, length: tokens[enquantoIdx].value.length });
      } else {
        this.validateCond(enquantoTokens, 'enquanto');
      }
    }

    if (valueTokens.length === 0) {
      this.errors.push({ message: `Esperado valor após 'para'. Ex: altere ${nameToken.value} para 0`, line: tokens[2].line, col: tokens[2].col, length: tokens[2].value.length });
      return;
    }

    this.validateExpr(valueTokens, 'altere');

    this.ast.push({
      type: 'AlterVar',
      name: nameToken.value,
      valueTokens,
      relatandoN,       // token array for N, or null
      enquantoTokens,   // token array for condition, or null
      relatar: relatandoIdx !== -1,
      line: tokens[0].line
    });
  }

  parseDefina(tokens) {
    // defina NAME como VALUE
    // defina NAME como funcao(params) BODY...
    if (tokens.length < 2) {
      this.errors.push({
        message: `'defina' precisa de um nome. Ex: defina x como 10`,
        line: tokens[0].line, col: tokens[0].col, length: tokens[0].value.length
      });
      return;
    }

    const nameToken = tokens[1];
    if (nameToken.type !== 'IDENTIFIER') {
      this.errors.push({
        message: `Esperado um nome após 'defina', mas encontrou '${nameToken.value}'`,
        line: nameToken.line, col: nameToken.col, length: nameToken.value.length
      });
      return;
    }

    if (tokens.length < 3) {
      this.errors.push({
        message: `Esperado 'como' após 'defina ${nameToken.value}'`,
        line: nameToken.line, col: nameToken.col + nameToken.value.length, length: 1
      });
      return;
    }

    const comoToken = tokens[2];
    if (comoToken.type !== 'COMO') {
      this.errors.push({
        message: `Esperado 'como' após o nome, mas encontrou '${comoToken.value}'`,
        line: comoToken.line, col: comoToken.col, length: comoToken.value.length
      });
      return;
    }

    if (tokens.length < 4) {
      this.errors.push({
        message: `Esperado um valor após 'como'`,
        line: comoToken.line, col: comoToken.col + comoToken.value.length, length: 1
      });
      return;
    }

    // Check if it's a function definition
    if (tokens[3].type === 'FUNCAO') {
      this.parseDefinaFuncao(tokens, nameToken);
    } else if (tokens[3].type === 'COMPACTAR') {
      // defina NAME como compactar ARRAY/OBJ
      const srcTokens = tokens.slice(4);
      if (srcTokens.length === 0) {
        this.errors.push({ message: `'compactar' requer um array ou objeto: defina total como compactar meuArray`, line: tokens[3].line, col: tokens[3].col, length: tokens[3].value.length });
        return;
      }
      this.ast.push({
        type: 'DefineCompactar',
        name: nameToken.value,
        srcTokens,
        line: tokens[0].line
      });
    } else if (tokens[3].type === 'TENDENCIA_DE') {
      // defina NAME como tendencia de OBJ
      const srcTokens = tokens.slice(4);
      const srcIdent = srcTokens.find(t => t.type === 'IDENTIFIER');
      if (!srcIdent) {
        this.errors.push({ message: `'tendencia de' requer o nome de um objeto: defina t como tendencia de meuObjeto`, line: tokens[3].line, col: tokens[3].col, length: tokens[3].value.length });
        return;
      }
      if (!this.declaredObjects.has(srcIdent.value)) {
        this.errors.push({ message: `'${srcIdent.value}' não é um objeto declarado`, line: srcIdent.line, col: srcIdent.col, length: srcIdent.value.length });
      }
      this.ast.push({
        type: 'DefineTendencia',
        name: nameToken.value,
        srcName: srcIdent.value,
        line: tokens[0].line
      });
    } else if (tokens[3].type === 'OBJETO_DE') {
      // defina NAME como objeto de ARRAY_KEYS: ARRAY_VALUES
      const afterTokens = tokens.slice(4);
      // Find DOIS_PONTOS at root level
      const colonIdx = afterTokens.findIndex(t => t.type === 'DOIS_PONTOS');
      if (colonIdx === -1) {
        this.errors.push({ message: `'objeto de' requer sintaxe: objeto de array_labels: array_valores`, line: tokens[3].line, col: tokens[3].col, length: tokens[3].value.length });
        return;
      }
      const keyArrayTokens = afterTokens.slice(0, colonIdx);
      const valArrayTokens = afterTokens.slice(colonIdx + 1);
      const keyArrayName = keyArrayTokens.filter(t => t.type === 'IDENTIFIER').map(t => t.value).join('').trim();
      const valArrayName = valArrayTokens.filter(t => t.type === 'IDENTIFIER').map(t => t.value).join('').trim();
      if (!keyArrayName) {
        this.errors.push({ message: `'objeto de' requer nome de array para labels antes de ':'`, line: tokens[3].line, col: tokens[3].col, length: tokens[3].value.length });
        return;
      }
      if (!valArrayName) {
        this.errors.push({ message: `'objeto de' requer nome de array para valores após ':'`, line: tokens[3].line, col: tokens[3].col, length: tokens[3].value.length });
        return;
      }
      if (!this.declaredArrays.has(keyArrayName)) {
        this.errors.push({ message: `'${keyArrayName}' não é um array declarado`, line: keyArrayTokens[0].line, col: keyArrayTokens[0].col, length: keyArrayName.length });
      }
      if (!this.declaredArrays.has(valArrayName)) {
        this.errors.push({ message: `'${valArrayName}' não é um array declarado`, line: valArrayTokens[0]?.line ?? tokens[3].line, col: valArrayTokens[0]?.col ?? tokens[3].col, length: valArrayName.length });
      }
      this.ast.push({
        type: 'DefineObjectFrom',
        name: nameToken.value,
        keyArrayName,
        valArrayName,
        line: tokens[0].line
      });
    } else if (tokens[3].type === 'OBJETO') {
      const valueTokens = tokens.slice(4);
      if (valueTokens.length === 0) {
        this.errors.push({ message: `Objeto vazio: adicione pelo menos um par chave: valor`, line: tokens[3].line, col: tokens[3].col, length: tokens[3].value.length });
      } else {
        // Split by root comma and validate each pair has a colon
        let cur = [], d = 0;
        const pairs = [];
        for (const t of valueTokens) {
          if (t.type === 'PAREN' && t.value === '(') { d++; cur.push(t); }
          else if (t.type === 'PAREN' && t.value === ')') { d--; cur.push(t); }
          else if (t.type === 'VIRGULA' && d === 0) { pairs.push(cur); cur = []; }
          else cur.push(t);
        }
        if (cur.length) pairs.push(cur);
        for (const pair of pairs) {
          const hasColon = pair.some(t => t.type === 'DOIS_PONTOS');
          if (!hasColon && pair.length > 0) {
            this.errors.push({ message: `Par de objeto sem ':'. Use: chave: valor`, line: pair[0].line, col: pair[0].col, length: pair[0].value.length });
          }
          // Validate value side
          const colonIdx = pair.findIndex(t => t.type === 'DOIS_PONTOS');
          if (colonIdx !== -1) this.validateExpr(pair.slice(colonIdx + 1), 'objeto valor');
        }
      }
      this.ast.push({
        type: 'DefineObject',
        name: nameToken.value,
        valueTokens,
        line: tokens[0].line
      });
    } else if (tokens[3].type === 'SPRITE' && this._interfaceMode) {
      // defina X como sprite reto(x1,y1, x2,y2, ...) — polygon
      // defina X como sprite curvo(r)              — circle
      // defina X como sprite KEY                   — pixel art image ref
      const spriteKindToken = tokens[4];
      if (!spriteKindToken) {
        this.errors.push({ message: `'sprite' precisa de 'reto(...)' ou 'curvo(r)' ou o nome de uma imagem`, line: tokens[3].line, col: tokens[3].col, length: tokens[3].value.length });
        return;
      }
      if (spriteKindToken.type === 'RETO') {
        // Collect numbers inside parens
        const parenOpen = tokens[5];
        if (!parenOpen || parenOpen.type !== 'PAREN' || parenOpen.value !== '(') {
          this.errors.push({ message: `'sprite reto' precisa de pontos entre parênteses. Ex: sprite reto(0,0, 10,0, 5,10)`, line: spriteKindToken.line, col: spriteKindToken.col, length: spriteKindToken.value.length });
          return;
        }
        const nums = [];
        for (let i = 6; i < tokens.length; i++) {
          if (tokens[i].type === 'NUMBER') nums.push(Number(tokens[i].value));
          if (tokens[i].type === 'PAREN' && tokens[i].value === ')') break;
        }
        if (nums.length < 6 || nums.length % 2 !== 0) {
          this.errors.push({ message: `'sprite reto' precisa de pelo menos 3 pontos (6 números). Ex: sprite reto(0,0, 10,0, 5,10)`, line: spriteKindToken.line, col: spriteKindToken.col, length: spriteKindToken.value.length });
          return;
        }
        const points = [];
        for (let i = 0; i < nums.length; i += 2) points.push([nums[i], nums[i + 1]]);
        this.ast.push({ type: 'DefineSpriteReto', name: nameToken.value, points, line: tokens[0].line });
      } else if (spriteKindToken.type === 'CURVO') {
        const parenOpen = tokens[5];
        if (!parenOpen || parenOpen.type !== 'PAREN' || parenOpen.value !== '(') {
          this.errors.push({ message: `'sprite curvo' precisa de um raio. Ex: sprite curvo(5)`, line: spriteKindToken.line, col: spriteKindToken.col, length: spriteKindToken.value.length });
          return;
        }
        const rToken = tokens[6];
        const radius = rToken && rToken.type === 'NUMBER' ? Number(rToken.value) : 5;
        this.ast.push({ type: 'DefineSpriteCircle', name: nameToken.value, radius, line: tokens[0].line });
      } else if (spriteKindToken.type === 'IDENTIFIER') {
        // Image reference (Phase 14)
        this.ast.push({ type: 'DefineSpriteImage', name: nameToken.value, imageKey: spriteKindToken.value, line: tokens[0].line });
      } else {
        this.errors.push({ message: `'sprite' espera 'reto', 'curvo' ou o nome de uma imagem`, line: spriteKindToken.line, col: spriteKindToken.col, length: spriteKindToken.value.length });
      }
    } else {
      const valueTokens = tokens.slice(3);
      // Check if it's an array: has comma at root level (outside parens)
      let depth = 0;
      let hasRootComma = false;
      for (const t of valueTokens) {
        if (t.type === 'PAREN' && t.value === '(') depth++;
        else if (t.type === 'PAREN' && t.value === ')') depth--;
        else if (t.type === 'VIRGULA' && depth === 0) { hasRootComma = true; break; }
      }
      if (hasRootComma) {
        this.ast.push({
          type: 'DefineArray',
          name: nameToken.value,
          valueTokens,
          line: tokens[0].line
        });
        // Validate each item
        let cur = [], d2 = 0;
        for (const t of valueTokens) {
          if (t.type === 'PAREN' && t.value === '(') { d2++; cur.push(t); }
          else if (t.type === 'PAREN' && t.value === ')') { d2--; cur.push(t); }
          else if (t.type === 'VIRGULA' && d2 === 0) { this.validateExpr(cur, 'array item'); cur = []; }
          else cur.push(t);
        }
        if (cur.length) this.validateExpr(cur, 'array item');
      } else {
        this.ast.push({
          type: 'DefineVar',
          name: nameToken.value,
          valueTokens,
          line: tokens[0].line
        });
        this.validateExpr(valueTokens, 'defina');
      }
    }
  }

  _parseDefinaInteractive(tokens, nameToken, kindToken) {
    // Extract first string arg if present: funcao botao("texto")
    const kind = kindToken.type.toLowerCase(); // botao, toggle, slider, seletor, digite, pergunte
    let labelText = '';
    let extraArgs = [];
    let effectTokens = [];

    // Find opening paren after kind token
    const kindIdx = tokens.indexOf(kindToken);
    let parenIdx = kindIdx + 1;
    if (parenIdx < tokens.length && tokens[parenIdx].type === 'PAREN' && tokens[parenIdx].value === '(') {
      // Collect contents up to closing paren
      let depth = 1;
      let inside = [];
      let j = parenIdx + 1;
      while (j < tokens.length && depth > 0) {
        if (tokens[j].type === 'PAREN' && tokens[j].value === '(') { depth++; inside.push(tokens[j]); }
        else if (tokens[j].type === 'PAREN' && tokens[j].value === ')') {
          depth--;
          if (depth === 0) { j++; break; }
          inside.push(tokens[j]);
        } else {
          inside.push(tokens[j]);
        }
        j++;
      }
      // First STRING token is the label
      const strToken = inside.find(t => t.type === 'STRING');
      if (strToken) labelText = strToken.value;
      // NUMBERs after first comma = extra args (slider: min, max; seletor: options as strings)
      const extraTokens = inside.filter(t => t.type === 'NUMBER' || t.type === 'STRING');
      extraArgs = extraTokens.slice(1).map(t => t.value); // skip first (label)
      // Everything after closing paren = effect body
      effectTokens = tokens.slice(j);
    } else {
      // No parens — effect is everything after kind
      effectTokens = tokens.slice(kindIdx + 1);
    }

    this.ast.push({
      type: 'DefineInteractive',
      name: nameToken.value,
      kind,
      label: labelText,
      extraArgs,
      effectTokens,
      line: tokens[0].line
    });
  }

  parseDefinaFuncao(tokens, nameToken) {
    // defina NAME como funcao(params) BODY
    // also: defina NAME como funcao BODY  (no-param shorthand)
    // interface mode: defina NAME como funcao botao("txt") EFFECT...
    //                 defina NAME como funcao toggle("txt")
    //                 defina NAME como funcao slider("txt") min, max
    //                 defina NAME como funcao seletor("txt") op1, op2...
    //                 defina NAME como funcao digite
    //                 defina NAME como funcao pergunte("q")
    let i = 3; // at 'funcao'
    const funcToken = tokens[i]; i++;

    // Interface mode: check for interactive element keyword after FUNCAO
    if (this._interfaceMode && i <= tokens.length) {
      const elemToken = tokens[i - 1 + 1] || tokens[i]; // token after funcao
      const elemT = tokens[i];
      if (elemT && ['BOTAO', 'TOGGLE', 'SLIDER', 'SELETOR', 'DIGITE', 'PERGUNTE'].includes(elemT.type)) {
        this._parseDefinaInteractive(tokens, nameToken, elemT);
        return;
      }
    }

    // Parse parameters (optional parens)
    let params = [];
    if (i < tokens.length && tokens[i].type === 'PAREN' && tokens[i].value === '(') {
      i++; // skip (
      while (i < tokens.length && !(tokens[i].type === 'PAREN' && tokens[i].value === ')')) {
        if (tokens[i].type === 'IDENTIFIER') {
          params.push(tokens[i].value);
        } else if (tokens[i].type === 'VIRGULA') {
          // skip
        } else {
          this.errors.push({
            message: `Parâmetro inválido em função: '${tokens[i].value}'`,
            line: tokens[i].line, col: tokens[i].col, length: tokens[i].value.length
          });
        }
        i++;
      }
      if (i < tokens.length && tokens[i].value === ')') {
        i++; // skip )
      } else {
        this.errors.push({
          message: `Parêntese ')' esperado na declaração de função`,
          line: funcToken.line, col: funcToken.col, length: funcToken.value.length
        });
      }
    }
    // If no '(' found, params stays [] and body starts from current i

    // Remaining tokens are the function body (can contain multiple statements)
    const bodyTokens = tokens.slice(i);

    this.ast.push({
      type: 'DefineFunc',
      name: nameToken.value,
      params: params,
      bodyTokens: bodyTokens,
      line: tokens[0].line
    });
  }

  parseExecute(tokens) {
    // Various forms:
    // execute EXPR
    // execute EXPR se COND
    // execute EXPR se COND senao EXPR2
    // execute EXPR repita N vezes
    // execute potencia de X, Y
    // execute raiz de X
    // execute aleatorio entre X e Y
    // execute aleatorio entre X e Y repita N vezes
    // execute cor de fundo R G B (interface mode only)
    
    if (tokens.length < 2) {
      this.errors.push({
        message: `'execute' precisa de uma expressão. Ex: execute x + y`,
        line: tokens[0].line, col: tokens[0].col, length: tokens[0].value.length
      });
      return;
    }

    // Interface mode: execute cor de fundo R G B
    if (this._interfaceMode && tokens[1] && tokens[1].type === 'COR_DE_FUNDO') {
      const nums = tokens.slice(2).filter(t => t.type === 'NUMBER').map(t => Number(t.value));
      this.ast.push({
        type: 'ExecuteCorDeFundo',
        r: nums[0] ?? 0,
        g: nums[1] ?? 0,
        b: nums[2] ?? 0,
        line: tokens[0].line
      });
      return;
    }

    // Check for 'com N amostras' FIRST — before any other branch that would return early
    // execute EXPR com N amostras
    let comIdx = -1;
    for (let j = 1; j < tokens.length; j++) {
      if (tokens[j].type === 'COM') {
        const hasAmostras = tokens.slice(j + 1).some(t => t.type === 'AMOSTRAS');
        if (hasAmostras) { comIdx = j; break; }
      }
    }
    if (comIdx !== -1) {
      this.parseExecuteAmostras(tokens, comIdx);
      return;
    }

    // Find 'repita' first (can appear after any form)
    let repitaIdx = -1;
    for (let j = 1; j < tokens.length; j++) {
      if (tokens[j].type === 'REPITA') { repitaIdx = j; break; }
    }

    // Determine the "core" tokens (before repita if present)
    const coreTokens = repitaIdx !== -1 ? tokens.slice(0, repitaIdx) : tokens;
    const coreSecond = coreTokens[1];

    // Check for math operations on core tokens
    if (coreSecond && coreSecond.type === 'POTENCIA_DE') {
      if (repitaIdx !== -1) {
        this.parseExecuteWithRepeat(tokens, repitaIdx, 'potencia');
      } else {
        this.parseExecutePotencia(coreTokens);
      }
      return;
    }
    if (coreSecond && coreSecond.type === 'RAIZ_DE') {
      if (repitaIdx !== -1) {
        this.parseExecuteWithRepeat(tokens, repitaIdx, 'raiz');
      } else {
        this.parseExecuteRaiz(coreTokens);
      }
      return;
    }
    if (coreSecond && coreSecond.type === 'ALEATORIO_ENTRE') {
      if (repitaIdx !== -1) {
        this.parseExecuteWithRepeat(tokens, repitaIdx, 'aleatorio');
      } else {
        this.parseExecuteAleatorio(coreTokens);
      }
      return;
    }
    if (coreSecond && coreSecond.type === 'JUROS_COMPOSTOS') {
      this.parseExecuteJurosCompostos(coreTokens);
      return;
    }
    if (coreSecond && coreSecond.type === 'PERCENTIL_DE') {
      this.parseExecutePercentilDe(coreTokens);
      return;
    }
    if (coreSecond && coreSecond.type === 'TAMANHO_DE') {
      this.parseExecuteTamanhoDe(coreTokens);
      return;
    }
    if (coreSecond && coreSecond.type === 'LOOP') {
      this.parseExecuteLoop(tokens);
      return;
    }

    // Find 'se' to determine conditional form (only in core tokens, start from index 1)
    let seIdx = -1;
    for (let j = 1; j < coreTokens.length; j++) {
      if (coreTokens[j].type === 'SE' && seIdx === -1) seIdx = j;
    }

    if (seIdx !== -1) {
      // Conditional
      const exprTokens = coreTokens.slice(1, seIdx);
      let condTokens, elseTokens = null;

      // Look for 'senao'
      let senaoIdx = -1;
      for (let j = seIdx + 1; j < coreTokens.length; j++) {
        if (coreTokens[j].type === 'SENAO') { senaoIdx = j; break; }
      }

      if (senaoIdx !== -1) {
        condTokens = coreTokens.slice(seIdx + 1, senaoIdx);
        elseTokens = coreTokens.slice(senaoIdx + 1);
      } else {
        condTokens = coreTokens.slice(seIdx + 1);
      }

      if (condTokens.length === 0) {
        this.errors.push({
          message: `Esperado uma condição após 'se'`,
          line: tokens[seIdx].line, col: tokens[seIdx].col, length: 2
        });
      }

      // Validate expressions
      if (exprTokens.length === 0) {
        this.errors.push({ message: `Esperado uma expressão antes de 'se'`, line: tokens[1].line, col: tokens[1].col, length: tokens[1].value.length });
      } else {
        this.validateExpr(exprTokens, 'execute');
      }
      this.validateCond(condTokens, 'se');
      if (elseTokens && elseTokens.length > 0) this.validateExpr(elseTokens, 'senao');

      if (repitaIdx !== -1) {
        // Conditional with repeat
        const afterRepita = tokens.slice(repitaIdx + 1);
        let timesTokens = [];
        let hasVezes = false;
        for (const t of afterRepita) {
          if (t.type === 'VEZES') { hasVezes = true; }
          else { timesTokens.push(t); }
        }
        if (!hasVezes) {
          this.errors.push({
            message: `Esperado 'vezes' após o número de repetições. Ex: repita 5 vezes`,
            line: tokens[repitaIdx].line, col: tokens[repitaIdx].col, length: tokens[repitaIdx].value.length
          });
        }
        this.validateRepeatCount(timesTokens, tokens[repitaIdx]);
        this.ast.push({
          type: 'ExecuteRepeatConditional',
          exprTokens, condTokens, elseTokens, timesTokens,
          line: tokens[0].line
        });
      } else {
        this.ast.push({
          type: 'ExecuteConditional',
          exprTokens, condTokens,
          elseTokens,
          line: tokens[0].line
        });
      }
    } else if (repitaIdx !== -1) {
      // Repeat
      const exprTokens = coreTokens.slice(1);
      const afterRepita = tokens.slice(repitaIdx + 1);
      let timesTokens = [];
      let hasVezes = false;
      for (const t of afterRepita) {
        if (t.type === 'VEZES') { hasVezes = true; }
        else { timesTokens.push(t); }
      }

      if (!hasVezes) {
        this.errors.push({
          message: `Esperado 'vezes' após o número de repetições. Ex: repita 5 vezes`,
          line: tokens[repitaIdx].line, col: tokens[repitaIdx].col, length: tokens[repitaIdx].value.length
        });
      }
      this.validateRepeatCount(timesTokens, tokens[repitaIdx]);
      this.validateExpr(exprTokens, 'execute repita');

      this.ast.push({
        type: 'ExecuteRepeat',
        exprTokens,
        timesTokens,
        line: tokens[0].line
      });
    } else {
      // Simple execute
      const exprTokens = tokens.slice(1);
      this.validateExpr(exprTokens, 'execute');
      this.ast.push({
        type: 'ExecuteSimple',
        exprTokens,
        line: tokens[0].line
      });
    }
  }

  parseExecuteWithRepeat(tokens, repitaIdx, mathOp) {
    // Math operation with repita
    const coreTokens = tokens.slice(0, repitaIdx);
    const afterRepita = tokens.slice(repitaIdx + 1);
    let timesTokens = [];
    let hasVezes = false;
    for (const t of afterRepita) {
      if (t.type === 'VEZES') { hasVezes = true; }
      else { timesTokens.push(t); }
    }
    if (!hasVezes) {
      this.errors.push({
        message: `Esperado 'vezes' após o número de repetições. Ex: repita 5 vezes`,
        line: tokens[repitaIdx].line, col: tokens[repitaIdx].col, length: tokens[repitaIdx].value.length
      });
    }
    // Determine args based on mathOp
    let mathNode;
    if (mathOp === 'potencia') {
      mathNode = { op: 'potencia', argTokens: coreTokens.slice(2), line: tokens[0].line };
    } else if (mathOp === 'raiz') {
      mathNode = { op: 'raiz', argTokens: coreTokens.slice(2), line: tokens[0].line };
    } else {
      // aleatorio
      const argTokens = coreTokens.slice(2);
      const eIdx = argTokens.findIndex(t => t.type === 'E_CONJ');
      mathNode = { op: 'aleatorio', argTokens, eIdx, line: tokens[0].line };
    }
    this.ast.push({
      type: 'ExecuteRepeatMath',
      mathNode,
      timesTokens,
      line: tokens[0].line
    });
  }

  parseExecutePotencia(tokens) {
    // execute potencia de X, Y
    const args = tokens.slice(2);
    this.ast.push({
      type: 'ExecuteMath',
      op: 'potencia',
      argTokens: args,
      line: tokens[0].line
    });
  }

  parseExecuteRaiz(tokens) {
    // execute raiz de X
    const args = tokens.slice(2);
    this.ast.push({
      type: 'ExecuteMath',
      op: 'raiz',
      argTokens: args,
      line: tokens[0].line
    });
  }

  parseExecuteAleatorio(tokens) {
    // execute aleatorio entre X e Y
    const args = tokens.slice(2);
    // Find 'e' token
    let eIdx = -1;
    for (let j = 0; j < args.length; j++) {
      if (args[j].type === 'E_CONJ') { eIdx = j; break; }
    }
    if (eIdx === -1) {
      this.errors.push({
        message: `Esperado 'e' em 'aleatorio entre X e Y'`,
        line: tokens[1].line, col: tokens[1].col, length: tokens[1].value.length
      });
    }
    this.ast.push({
      type: 'ExecuteMath',
      op: 'aleatorio',
      argTokens: args,
      eIdx: eIdx,
      line: tokens[0].line
    });
  }

  parseExecuteJurosCompostos(tokens) {
    // execute juros compostos(taxa, n) or juros compostos(taxa, n, montante)
    // tokens[1] = JUROS_COMPOSTOS, tokens[2] = '(', ...args..., ')'
    const parenOpen = tokens[2];
    if (!parenOpen || parenOpen.type !== 'PAREN' || parenOpen.value !== '(') {
      this.errors.push({
        message: `'juros compostos' requer parênteses: juros compostos(taxa, periodos) ou juros compostos(taxa, periodos, montante)`,
        line: tokens[1].line, col: tokens[1].col, length: tokens[1].value.length
      });
      return;
    }
    // Collect tokens inside parens
    let depth = 1, i = 3;
    const innerTokens = [];
    while (i < tokens.length && depth > 0) {
      if (tokens[i].type === 'PAREN' && tokens[i].value === '(') depth++;
      if (tokens[i].type === 'PAREN' && tokens[i].value === ')') {
        depth--;
        if (depth === 0) break;
      }
      innerTokens.push(tokens[i]);
      i++;
    }
    // Split by root-level commas
    const args = [];
    let cur = [], d = 0;
    for (const t of innerTokens) {
      if (t.type === 'PAREN' && t.value === '(') { d++; cur.push(t); }
      else if (t.type === 'PAREN' && t.value === ')') { d--; cur.push(t); }
      else if (t.type === 'VIRGULA' && d === 0) { args.push(cur); cur = []; }
      else cur.push(t);
    }
    if (cur.length) args.push(cur);

    if (args.length < 2) {
      this.errors.push({
        message: `'juros compostos' requer pelo menos 2 argumentos: taxa e períodos`,
        line: tokens[1].line, col: tokens[1].col, length: tokens[1].value.length
      });
      return;
    }
    if (args.length > 3) {
      this.errors.push({
        message: `'juros compostos' aceita no máximo 3 argumentos: taxa, períodos e montante opcional`,
        line: tokens[1].line, col: tokens[1].col, length: tokens[1].value.length
      });
      return;
    }

    this.ast.push({
      type: 'ExecuteMath',
      op: 'juros_compostos',
      taxaTokens: args[0],
      periodosTokens: args[1],
      montanteTokens: args[2] || null,
      line: tokens[0].line
    });
  }

  parseExecutePercentilDe(tokens) {
    // execute percentil de OBJ/ARRAY, PERCENTIL
    // tokens[0]=EXECUTE, tokens[1]=PERCENTIL_DE, tokens[2..]=rest split by root VIRGULA
    const rest = tokens.slice(2);
    // Split by first root-level VIRGULA
    let commaIdx = -1, depth = 0;
    for (let i = 0; i < rest.length; i++) {
      if (rest[i].type === 'PAREN' && rest[i].value === '(') depth++;
      else if (rest[i].type === 'PAREN' && rest[i].value === ')') depth--;
      else if (rest[i].type === 'VIRGULA' && depth === 0) { commaIdx = i; break; }
    }
    if (commaIdx === -1) {
      this.errors.push({ message: `'percentil de' requer dois argumentos: percentil de DADOS, PERCENTIL (ex: 50 para mediana)`, line: tokens[1].line, col: tokens[1].col, length: tokens[1].value.length });
      return;
    }
    this.ast.push({
      type: 'ExecuteMath',
      op: 'percentil_de',
      dataTokens: rest.slice(0, commaIdx),
      pTokens: rest.slice(commaIdx + 1),
      line: tokens[0].line
    });
  }

  parseExecuteTamanhoDe(tokens) {
    // execute tamanho de ARRAY/OBJ
    const srcTokens = tokens.slice(2);
    if (srcTokens.length === 0) {
      this.errors.push({ message: `'tamanho de' requer um array ou objeto`, line: tokens[1].line, col: tokens[1].col, length: tokens[1].value.length });
      return;
    }
    this.ast.push({
      type: 'ExecuteMath',
      op: 'tamanho_de',
      srcTokens,
      line: tokens[0].line
    });
  }

  parseExecuteLoop(tokens) {
    // execute loop(INIT, COND, INCR) BODY...
    // tokens[0]=EXECUTE, tokens[1]=LOOP, tokens[2]='('
    const loopToken = tokens[1];
    if (!tokens[2] || tokens[2].type !== 'PAREN' || tokens[2].value !== '(') {
      this.errors.push({ message: `'loop' requer parênteses: loop(inicio, condicao, incremento)`, line: loopToken.line, col: loopToken.col, length: loopToken.value.length });
      return;
    }

    // Collect tokens inside the parens, split by root-level commas
    let depth = 1, i = 3;
    const inner = [];
    while (i < tokens.length && depth > 0) {
      if (tokens[i].type === 'PAREN' && tokens[i].value === '(') depth++;
      if (tokens[i].type === 'PAREN' && tokens[i].value === ')') { depth--; if (depth === 0) { i++; break; } }
      inner.push(tokens[i]);
      i++;
    }

    // Split inner by root-level commas → [initTokens, condTokens, incrTokens]
    const args = [];
    let cur = [], d = 0;
    for (const t of inner) {
      if (t.type === 'PAREN' && t.value === '(') { d++; cur.push(t); }
      else if (t.type === 'PAREN' && t.value === ')') { d--; cur.push(t); }
      else if (t.type === 'VIRGULA' && d === 0) { args.push(cur); cur = []; }
      else cur.push(t);
    }
    if (cur.length) args.push(cur);

    if (args.length !== 3) {
      this.errors.push({ message: `'loop' requer exatamente 3 argumentos: loop(inicio, condicao, incremento)`, line: loopToken.line, col: loopToken.col, length: loopToken.value.length });
      return;
    }

    // Body tokens = everything after the closing ')'
    const bodyTokens = tokens.slice(i);

    this.ast.push({
      type: 'ExecuteLoop',
      initTokens: args[0],
      condTokens: args[1],
      incrTokens: args[2],
      bodyTokens,
      line: tokens[0].line
    });
  }

  parseExecuteAmostras(tokens, comIdx) {
    // execute EXPR com N amostras
    const exprTokens = tokens.slice(1, comIdx);
    const afterCom = tokens.slice(comIdx + 1);

    // Find AMOSTRAS token
    const amostrasIdx = afterCom.findIndex(t => t.type === 'AMOSTRAS');
    if (amostrasIdx === -1) {
      this.errors.push({ message: `'com' requer 'amostras' ao final: execute EXPR com N amostras`, line: tokens[comIdx].line, col: tokens[comIdx].col, length: tokens[comIdx].value.length });
      return;
    }

    const nTokens = afterCom.slice(0, amostrasIdx);
    if (nTokens.length === 0) {
      this.errors.push({ message: `Esperado número de amostras entre 'com' e 'amostras'`, line: tokens[comIdx].line, col: tokens[comIdx].col, length: tokens[comIdx].value.length });
      return;
    }

    if (exprTokens.length === 0) {
      this.errors.push({ message: `'execute ... com amostras' requer uma expressão antes de 'com'`, line: tokens[0].line, col: tokens[0].col, length: tokens[0].value.length });
      return;
    }

    this.ast.push({
      type: 'ExecuteAmostras',
      exprTokens,
      nTokens,
      line: tokens[0].line
    });
  }

  parseApresente(tokens) {
    // apresente EXPR em FORMATO
    // apresente EXPR em tabela(Y_EXPR)
    // apresente EXPR em grafico(Y_EXPR)
    if (tokens.length < 2) {
      this.errors.push({
        message: `'apresente' precisa de uma expressão. Ex: apresente x em texto`,
        line: tokens[0].line, col: tokens[0].col, length: tokens[0].value.length
      });
      return;
    }

    // Find 'em' from the end, skipping tokens inside parens
    let emIdx = -1;
    let depth = 0;
    for (let j = tokens.length - 1; j >= 1; j--) {
      if (tokens[j].type === 'PAREN' && tokens[j].value === ')') depth++;
      else if (tokens[j].type === 'PAREN' && tokens[j].value === '(') depth--;
      else if (tokens[j].type === 'EM' && depth === 0) { emIdx = j; break; }
    }

    let format = 'texto';
    let exprTokens;
    let yExprTokens = null;
    let xName = null;
    let yName = null;

    if (emIdx !== -1) {
      exprTokens = tokens.slice(1, emIdx);
      const formatToken = tokens[emIdx + 1];

      if (formatToken && (formatToken.type === 'TABELA' || formatToken.type === 'GRAFICO')) {
        format = formatToken.type === 'TABELA' ? 'tabela' : 'grafico';

        // Extract x name from exprTokens (first IDENTIFIER)
        const xIdent = exprTokens.find(t => t.type === 'IDENTIFIER');
        xName = xIdent ? xIdent.value : 'x';

        // Extract y tokens from inside the parens after tabela/grafico — optional
        let i = emIdx + 2; // points to potential '('
        if (i < tokens.length && tokens[i].type === 'PAREN' && tokens[i].value === '(') {
          i++; // skip '('
          let depth = 1;
          yExprTokens = [];
          while (i < tokens.length && depth > 0) {
            if (tokens[i].type === 'PAREN' && tokens[i].value === '(') depth++;
            if (tokens[i].type === 'PAREN' && tokens[i].value === ')') {
              depth--;
              if (depth === 0) break;
            }
            yExprTokens.push(tokens[i]);
            i++;
          }
          // Extract y name
          const yIdent = yExprTokens.find(t => t.type === 'IDENTIFIER');
          yName = yIdent ? yIdent.value : 'y';
        }
        // If no '(' found — single-object mode, yExprTokens stays null
      } else if (formatToken && formatToken.type === 'ESTATISTICAS') {
        format = 'estatisticas';
        const xIdent = exprTokens.find(t => t.type === 'IDENTIFIER');
        xName = xIdent ? xIdent.value : 'obj';
      } else if (formatToken && formatToken.type === 'CIENTIFICA') {
        format = 'cientifica';
      } else if (formatToken && formatToken.type === 'SPRITE' && this._interfaceMode) {
        format = 'sprite';
      } else if (formatToken && ['BOTAO', 'TOGGLE', 'SLIDER', 'SELETOR', 'DIGITE', 'PERGUNTE'].includes(formatToken.type) && this._interfaceMode) {
        format = formatToken.type.toLowerCase();
      } else if (formatToken) {
        const f = formatToken.value.toLowerCase();
        if (['texto', 'destaque', 'apresentação', 'apresentacao', 'dados'].includes(f)) {
          format = f === 'apresentacao' ? 'apresentação' : f;
        } else {
          this.errors.push({
            message: `Formato desconhecido: '${formatToken.value}'. Use: texto, destaque, apresentação, dados, tabela() ou grafico()`,
            line: formatToken.line, col: formatToken.col, length: formatToken.value.length
          });
        }
      }
    } else {
      exprTokens = tokens.slice(1);
    }

    // Extract yellow (interface) modifiers: ajuste, grid, cor de texto
    let yellow = null;
    if (this._interfaceMode) {
      yellow = this._parseYellowModifiers(tokens);
    }

    this.ast.push({
      type: 'Apresente',
      exprTokens,
      format,
      yExprTokens,
      xName,
      yName,
      yellow,
      line: tokens[0].line
    });

    // Validate expressions
    if (exprTokens && exprTokens.length > 0) this.validateExpr(exprTokens, 'apresente');
    if (yExprTokens && yExprTokens.length > 0) this.validateExpr(yExprTokens, 'tabela/grafico argumento');
  } // end parseApresente

  // Extract yellow interface modifiers from a token line
  // Modifiers: ajuste POS TAM | grid X Y W H | cor de texto R G B
  _parseYellowModifiers(tokens) {
    const yellow = {};
    const ajusteIdx = tokens.findIndex(t => t.type === 'AJUSTE');
    const gridIdx   = tokens.findIndex(t => t.type === 'GRID');
    const corTextoIdx = tokens.findIndex(t => t.type === 'COR_DE_TEXTO');

    if (ajusteIdx !== -1) {
      // ajuste POSICAO TAMANHO — both are IDENTIFIERs
      const posToken = tokens[ajusteIdx + 1];
      const tamToken = tokens[ajusteIdx + 2];
      yellow.ajuste = {
        pos: posToken ? posToken.value.toLowerCase() : 'centro',
        tam: tamToken ? tamToken.value.toLowerCase() : 'm',
      };
    }

    if (gridIdx !== -1) {
      // grid X Y W H — four numbers
      const nums = [];
      for (let i = gridIdx + 1; i < tokens.length && nums.length < 4; i++) {
        if (tokens[i].type === 'NUMBER') nums.push(Number(tokens[i].value));
      }
      yellow.grid = {
        x: nums[0] ?? 50,
        y: nums[1] ?? 50,
        w: nums[2] ?? 40,
        h: nums[3] ?? 10,
      };
    }

    if (corTextoIdx !== -1) {
      const nums = [];
      for (let i = corTextoIdx + 1; i < tokens.length && nums.length < 3; i++) {
        if (tokens[i].type === 'NUMBER') nums.push(Number(tokens[i].value));
      }
      if (nums.length === 3) {
        yellow.corTexto = { r: nums[0], g: nums[1], b: nums[2] };
      }
    }

    return Object.keys(yellow).length > 0 ? yellow : null;
  }

  parseImporte(tokens) {
    if (tokens.length < 2) {
      this.errors.push({
        message: "'importe' precisa do nome de uma biblioteca. Ex: importe formulas_fisica",
        line: tokens[0].line, col: tokens[0].col, length: tokens[0].value.length
      });
      return;
    }
    const nameToken = tokens[1];
    if (nameToken.type !== 'IDENTIFIER') {
      this.errors.push({
        message: `Esperado nome de biblioteca após 'importe', mas encontrou '${nameToken.value}'`,
        line: nameToken.line, col: nameToken.col, length: nameToken.value.length
      });
      return;
    }
    if (this._registry) {
      const lib = this._registry.get(nameToken.value);
      const csvDs = this._csvDatasets || [];
      const isCsvKey = csvDs.some(d => d.key === nameToken.value);
      // 'interface' is a built-in mode — not in registry but always valid
      const isBuiltIn = nameToken.value === 'interface';
      if (!lib && !isCsvKey && !isBuiltIn) {
        this.errors.push({
          message: `Biblioteca ou dataset '${nameToken.value}' não encontrado. Veja as disponíveis na aba Bibliotecas ou Dados`,
          line: nameToken.line, col: nameToken.col, length: nameToken.value.length
        });
      }
    }
    if (tokens.length > 2) {
      const extra = tokens[2];
      this.errors.push({
        message: `Texto inesperado após o nome da biblioteca: '${extra.value}'`,
        line: extra.line, col: extra.col, length: extra.value.length
      });
    }
    this.ast.push({
      type: 'ImportLib',
      libName: nameToken.value,
      line: tokens[0].line
    });
  }

  parseSalve(tokens) {
    // salve local v1, v2, v3
    // salve nuvem v1, v2, v3
    // salve nuvem v1, v2 usando chave
    if (tokens.length < 2) {
      this.errors.push({ message: `'salve' precisa de 'local' ou 'nuvem'. Ex: salve local x`, line: tokens[0].line, col: tokens[0].col, length: tokens[0].value.length });
      return;
    }
    const destToken = tokens[1];
    if (destToken.type !== 'LOCAL' && destToken.type !== 'NUVEM') {
      this.errors.push({ message: `'salve' requer 'local' ou 'nuvem' após o comando. Ex: salve local x`, line: destToken.line, col: destToken.col, length: destToken.value.length });
      return;
    }
    const dest = destToken.type === 'LOCAL' ? 'local' : 'nuvem';

    // Find USANDO token
    const usandoIdx = tokens.findIndex(t => t.type === 'USANDO');
    const varTokens = tokens.slice(2, usandoIdx === -1 ? tokens.length : usandoIdx);
    const varNames = varTokens.filter(t => t.type === 'IDENTIFIER').map(t => t.value);

    if (varNames.length === 0) {
      this.errors.push({ message: `'salve ${dest}' requer pelo menos uma variável. Ex: salve ${dest} x`, line: destToken.line, col: destToken.col, length: destToken.value.length });
      return;
    }

    let usingKey = null;
    if (usandoIdx !== -1 && dest === 'nuvem') {
      const keyToken = tokens[usandoIdx + 1];
      if (keyToken && (keyToken.type === 'IDENTIFIER' || keyToken.type === 'STRING')) {
        usingKey = keyToken.type === 'STRING' ? keyToken.value : keyToken.value;
      }
    }

    this.ast.push({ type: dest === 'local' ? 'SalveLocal' : 'SalveNuvem', vars: varNames, usingKey, line: tokens[0].line });
  }

  parseCarregue(tokens) {
    // carregue local v1, v2, v3
    // carregue nuvem v1, v2
    // carregue nuvem v1 usando chave
    if (tokens.length < 2) {
      this.errors.push({ message: `'carregue' precisa de 'local' ou 'nuvem'. Ex: carregue local x`, line: tokens[0].line, col: tokens[0].col, length: tokens[0].value.length });
      return;
    }
    const destToken = tokens[1];
    if (destToken.type !== 'LOCAL' && destToken.type !== 'NUVEM') {
      this.errors.push({ message: `'carregue' requer 'local' ou 'nuvem' após o comando. Ex: carregue local x`, line: destToken.line, col: destToken.col, length: destToken.value.length });
      return;
    }
    const dest = destToken.type === 'LOCAL' ? 'local' : 'nuvem';

    const usandoIdx = tokens.findIndex(t => t.type === 'USANDO');
    const varTokens = tokens.slice(2, usandoIdx === -1 ? tokens.length : usandoIdx);
    const varNames = varTokens.filter(t => t.type === 'IDENTIFIER').map(t => t.value);

    if (varNames.length === 0) {
      this.errors.push({ message: `'carregue ${dest}' requer pelo menos uma variável. Ex: carregue ${dest} x`, line: destToken.line, col: destToken.col, length: destToken.value.length });
      return;
    }

    // Validate: variables must be declared
    for (const name of varNames) {
      if (!this.declaredVars.has(name)) {
        const t = varTokens.find(tk => tk.value === name);
        this.errors.push({ message: `'carregue' requer que a variável já tenha sido declarada com 'defina': '${name}' não foi declarado`, line: t?.line ?? tokens[0].line, col: t?.col ?? tokens[0].col, length: name.length });
      }
    }

    let usingKey = null;
    if (usandoIdx !== -1 && dest === 'nuvem') {
      const keyToken = tokens[usandoIdx + 1];
      if (keyToken && (keyToken.type === 'IDENTIFIER' || keyToken.type === 'STRING')) {
        usingKey = keyToken.value;
      }
    }

    this.ast.push({ type: dest === 'local' ? 'CarregueLocal' : 'CarregueNuvem', vars: varNames, usingKey, line: tokens[0].line });
  }
} // end Parser

// ==================== TRANSPILER ====================
class Transpiler {
  constructor(ast, declaredVars, declaredArrays, declaredObjects, { registry = null, csvDatasets = [] } = {}) {
    this.ast = ast;
    this.declaredVars = declaredVars || new Set();
    this.declaredArrays = declaredArrays || new Set();
    this.declaredObjects = declaredObjects || new Set();
    this.errors = [];
    this._registry = registry || CrabLibRegistry;
    this._csvDatasets = csvDatasets;
  }

  transpile() {
    let jsLines = [];

    // Detect interface mode in first pre-pass (before emitting output array declaration)
    this._interfaceMode = this.ast.some(n => n.type === 'ImportLib' && n.libName === 'interface');

    if (this._interfaceMode) {
      jsLines.push('const __output = [];');
      jsLines.push('const __iface_output = [];');
    } else {
      jsLines.push('const __output = [];');
    }

    // First pass: gather declared variables, functions, and arrays
    for (const node of this.ast) {
      if (node.type === 'DefineVar' || node.type === 'DefineFunc') {
        this.declaredVars.add(node.name);
      }
      if (node.type === 'DefineArray') {
        this.declaredVars.add(node.name);
        this.declaredArrays.add(node.name);
      }
      if (node.type === 'DefineObject') {
        this.declaredVars.add(node.name);
        this.declaredObjects.add(node.name);
      }
      if (node.type === 'DefineObjectFrom') {
        this.declaredVars.add(node.name);
        this.declaredObjects.add(node.name);
      }
      if (node.type === 'DefineTendencia') {
        this.declaredVars.add(node.name);
        this.declaredObjects.add(node.name);
      }
      if (node.type === 'DefineCompactar') {
        this.declaredVars.add(node.name);
      }
      if (node.type === 'DefineSpriteReto' || node.type === 'DefineSpriteCircle' || node.type === 'DefineSpriteImage') {
        this.declaredVars.add(node.name);
      }
      if (node.type === 'DefineInteractive') {
        this.declaredVars.add(node.name);
      }
      if (node.type === 'ImportLib') {
        const _lib = this._registry ? this._registry.get(node.libName) : null;
        if (_lib) {
          if (_lib.dependencies) {
            for (const _depName of _lib.dependencies) {
              const _depLib = this._registry.get(_depName);
              if (_depLib && _depLib.exports) {
                for (const _expName of _depLib.exports) this.declaredVars.add(_expName);
              }
            }
          }
          if (_lib.exports) {
            for (const _expName of _lib.exports) this.declaredVars.add(_expName);
          }
        } else {
          const _csvDs = this._csvDatasets;
          const _csvMatch = _csvDs.find(d => d.key === node.libName);
          if (_csvMatch) {
            for (const _col of _csvMatch.columns) {
              this.declaredVars.add(_col.name);
              this.declaredArrays.add(_col.name);
            }
          }
        }
      }
    }

    // Second pass: transpile
    for (const node of this.ast) {
      try {
        const js = this.transpileNode(node);
        if (js) jsLines.push(js);
      } catch (e) {
        this.errors.push({
          message: `Erro de transpilação na linha ${node.line}: ${e.message}`,
          line: node.line, col: 1, length: 1
        });
      }
    }

    jsLines.push(this._interfaceMode ? 'return __iface_output;' : 'return __output;');
    return { code: jsLines.join('\n'), errors: this.errors };
  }

  // Returns the JS output-array variable name for use in template literals
  get _out() { return this._interfaceMode ? '__iface_output' : '__output'; }

  transpileNode(node) {
    switch (node.type) {
      case 'DefineVar': return this.transpileDefineVar(node);
      case 'DefineArray': return this.transpileDefineArray(node);
      case 'DefineObject': return this.transpileDefineObject(node);
      case 'DefineObjectFrom': return this.transpileDefineObjectFrom(node);
      case 'DefineTendencia': return this.transpileDefineTendencia(node);
      case 'DefineCompactar': return this.transpileDefineCompactar(node);
      case 'AlterVar': return this.transpileAlterVar(node);
      case 'DefineFunc': return this.transpileDefineFunc(node);
      case 'SalveLocal': return this.transpileSalveLocal(node);
      case 'CarregueLocal': return this.transpileCarregueLocal(node);
      case 'SalveNuvem': return this.transpileSalveNuvem(node);
      case 'CarregueNuvem': return this.transpileCarregueNuvem(node);
      case 'ExecuteSimple': return this.transpileExecuteSimple(node);
      case 'ExecuteConditional': return this.transpileExecuteConditional(node);
      case 'ExecuteRepeat': return this.transpileExecuteRepeat(node);
      case 'ExecuteRepeatMath': return this.transpileExecuteRepeatMath(node);
      case 'ExecuteRepeatConditional': return this.transpileExecuteRepeatConditional(node);
      case 'ExecuteMath': return this.transpileExecuteMath(node);
      case 'ExecuteLoop': return this.transpileExecuteLoop(node);
      case 'ExecuteAmostras': return this.transpileExecuteAmostras(node);
      case 'ExecuteCorDeFundo': return this.transpileExecuteCorDeFundo(node);
      case 'DefineSpriteReto': return this.transpileDefineSpriteReto(node);
      case 'DefineSpriteCircle': return this.transpileDefineSpriteCircle(node);
      case 'DefineSpriteImage': return this.transpileDefineSpriteImage(node);
      case 'DefineInteractive': return this.transpileDefineInteractive(node);
      case 'Apresente': return this.transpileApresente(node);
      case 'ImportLib': return this.transpileImportLib(node);
      default: return '';
    }
  }

  tokensToExpr(tokens) {
    if (!tokens || tokens.length === 0) return '""';

    let parts = [];
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.type === 'NUMBER') {
        parts.push(t.value);
      } else if (t.type === 'STRING') {
        // String literal explícita — o conteúdo já está sem as aspas, só escapar aspas duplas internas
        parts.push('"' + t.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
      } else if (t.type === 'OPERATOR') {
        // Map single = to === for equality comparison
        if (t.value === '=') {
          parts.push('===');
        } else {
          parts.push(t.value);
        }
      } else if (t.type === 'PAREN') {
        parts.push(t.value);
      } else if (t.type === 'VIRGULA') {
        parts.push(',');
      } else if (t.type === 'IDENTIFIER') {
        // Check if it's an array access: name followed by (
        if (
          i + 1 < tokens.length &&
          tokens[i + 1].type === 'PAREN' && tokens[i + 1].value === '(' &&
          this.declaredArrays.has(t.value)
        ) {
          // Collect tokens inside the parens (supporting nested parens for rodar() etc.)
          i += 2; // skip identifier and '('
          let depth = 1;
          let indexTokens = [];
          while (i < tokens.length && depth > 0) {
            if (tokens[i].type === 'PAREN' && tokens[i].value === '(') depth++;
            if (tokens[i].type === 'PAREN' && tokens[i].value === ')') {
              depth--;
              if (depth === 0) break;
            }
            indexTokens.push(tokens[i]);
            i++;
          }
          // indexTokens is the index expression — evaluate it and subtract 1 (1-based)
          const indexExpr = this.tokensToExpr(indexTokens);
          parts.push(`${t.value}[(${indexExpr}) - 1]`);
        // Check if it's a regular function call: name followed by (
        } else if (i + 1 < tokens.length && tokens[i + 1].type === 'PAREN' && tokens[i + 1].value === '(') {
          parts.push(t.value);
        } else if (this.declaredVars.has(t.value)) {
          parts.push(t.value);
        } else {
          // Treat as string literal — collect consecutive UNDECLARED identifiers only
          let strParts = [t.value];
          while (
            i + 1 < tokens.length &&
            tokens[i + 1].type === 'IDENTIFIER' &&
            !this.declaredVars.has(tokens[i + 1].value) &&
            !(i + 2 < tokens.length && tokens[i + 2].type === 'PAREN' && tokens[i + 2].value === '(')
          ) {
            i++;
            strParts.push(tokens[i].value);
          }
          parts.push('"' + strParts.join(' ') + '"');
        }
      } else if (t.type === 'PONTO') {
        // Acesso de propriedade — une sem espaço ao próximo token
        // O join(' ') no final adicionaria espaço, então embutimos o próximo token aqui
        if (i + 1 < tokens.length && (tokens[i + 1].type === 'IDENTIFIER' || tokens[i + 1].type === 'NUMBER')) {
          const prop = tokens[i + 1].value;
          i++;
          // Remove o último item de parts e o reune com .prop
          if (parts.length > 0) {
            const last = parts.pop();
            parts.push(last + '.' + prop);
          } else {
            parts.push('.' + prop);
          }
        } else {
          parts.push('.');
        }
      } else if (t.type === 'DOIS_PONTOS') {
        // Fora de contexto de objeto, ignorar silenciosamente
      } else if (t.type === 'RODAR') {
        // rodar(...) - find matching paren
        let depth = 0;
        let innerTokens = [];
        i++; // skip 'rodar'
        if (i < tokens.length && tokens[i].type === 'PAREN' && tokens[i].value === '(') {
          depth = 1;
          i++;
          while (i < tokens.length && depth > 0) {
            if (tokens[i].type === 'PAREN' && tokens[i].value === '(') depth++;
            if (tokens[i].type === 'PAREN' && tokens[i].value === ')') {
              depth--;
              if (depth === 0) break;
            }
            innerTokens.push(tokens[i]);
            i++;
          }
          // Parse inner tokens as a mini-statement
          const innerCode = this.transpileRodarInner(innerTokens);
          parts.push(innerCode);
        }
      } else if (t.type === 'ILLEGAL') {
        // skip illegal tokens silently in transpiler
      } else {
        parts.push(t.value);
      }
      i++;
    }
    return parts.join(' ');
  }

  transpileRodarInner(tokens) {
    // Parse inner tokens as a statement and return an expression
    if (tokens.length === 0) return '""';

    const first = tokens[0];

    if (first.type === 'EXECUTE') {
      const rest = tokens.slice(1);
      // Delegate to the same unified body-execute logic (returns an expression string)
      return this.transpileRodarExec(rest);
    }
    return `(${this.tokensToExpr(tokens)})`;
  }

  transpileRodarExec(rest) {
    // com N amostras — MUST be checked first before any math keyword branch
    const comIdxR = rest.findIndex(t => t.type === 'COM');
    if (comIdxR !== -1 && rest.slice(comIdxR + 1).some(t => t.type === 'AMOSTRAS')) {
      const exprTokens = rest.slice(0, comIdxR);
      const amostrasIdx = rest.findIndex(t => t.type === 'AMOSTRAS');
      const nTokens = rest.slice(comIdxR + 1, amostrasIdx);
      const expr = this.transpileRodarExec(exprTokens);
      const n = this.tokensToExpr(nTokens);
      return `(function(){ const __s=[]; for(let __i=0;__i<${n};__i++) __s.push(${expr}); return __s; })()`;
    }

    // Math operations
    if (rest[0]?.type === 'POTENCIA_DE') {
      const node = { op: 'potencia', argTokens: rest.slice(1) };
      return this.transpileExecuteMathExpr(node);
    }
    if (rest[0]?.type === 'RAIZ_DE') {
      const node = { op: 'raiz', argTokens: rest.slice(1) };
      return this.transpileExecuteMathExpr(node);
    }
    if (rest[0]?.type === 'ALEATORIO_ENTRE') {
      const repitaIdx = rest.findIndex(t => t.type === 'REPITA');
      // Find SE at root depth (not inside parens) to clamp aleatorio args
      const seIdx = (() => {
        let d = 0;
        for (let j = 1; j < rest.length; j++) {
          if (rest[j].type === 'PAREN' && rest[j].value === '(') d++;
          else if (rest[j].type === 'PAREN' && rest[j].value === ')') d--;
          else if (rest[j].type === 'SE' && d === 0) return j;
        }
        return -1;
      })();
      const coreEnd = repitaIdx !== -1 ? repitaIdx : seIdx !== -1 ? seIdx : rest.length;
      if (repitaIdx !== -1) {
        const coreRest = rest.slice(0, repitaIdx);
        const timesTokens = rest.slice(repitaIdx + 1).filter(t => t.type !== 'VEZES');
        const times = this.tokensToExpr(timesTokens);
        const argTokens = coreRest.slice(1);
        const eIdx = argTokens.findIndex(t => t.type === 'E_CONJ');
        const node = { op: 'aleatorio', argTokens, eIdx };
        const mathExpr = this.transpileExecuteMathExpr(node);
        return `(function(){ const __r=[]; for(let __i=0;__i<${times};__i++) __r.push(${mathExpr}); return __r; })()`;
      }
      const argTokens = rest.slice(1, coreEnd);
      const eIdx = argTokens.findIndex(t => t.type === 'E_CONJ');
      const node = { op: 'aleatorio', argTokens, eIdx };
      const mathExpr = this.transpileExecuteMathExpr(node);
      // If there's a se/senao wrapping, apply it
      if (seIdx !== -1) {
        const afterSe = rest.slice(seIdx + 1);
        const senaoIdx = afterSe.findIndex(t => t.type === 'SENAO');
        const condTokens = senaoIdx !== -1 ? afterSe.slice(0, senaoIdx) : afterSe;
        const elseTokens = senaoIdx !== -1 ? afterSe.slice(senaoIdx + 1) : null;
        const cond = this.tokensToExpr(condTokens);
        const elseExpr = elseTokens && elseTokens.length > 0 ? this.tokensToExpr(elseTokens) : '""';
        return `((${cond}) ? (${mathExpr}) : (${elseExpr}))`;
      }
      return mathExpr;
    }

    if (rest[0]?.type === 'TAMANHO_DE') {
      const node = { op: 'tamanho_de', srcTokens: rest.slice(1) };
      return this.transpileExecuteMathExpr(node);
    }
    if (rest[0]?.type === 'PERCENTIL_DE') {
      const restAfter = rest.slice(1);
      let commaIdx = -1, depth = 0;
      for (let i = 0; i < restAfter.length; i++) {
        if (restAfter[i].type === 'PAREN' && restAfter[i].value === '(') depth++;
        else if (restAfter[i].type === 'PAREN' && restAfter[i].value === ')') depth--;
        else if (restAfter[i].type === 'VIRGULA' && depth === 0) { commaIdx = i; break; }
      }
      if (commaIdx === -1) return '0';
      const node = { op: 'percentil_de', dataTokens: restAfter.slice(0, commaIdx), pTokens: restAfter.slice(commaIdx + 1) };
      return this.transpileExecuteMathExpr(node);
    }
    if (rest[0]?.type === 'JUROS_COMPOSTOS') {
      // Parse args from inside parens
      const parenOpen = rest[1];
      if (!parenOpen || parenOpen.value !== '(') return '0';
      let depth = 1, i = 2;
      const innerTokens = [];
      while (i < rest.length && depth > 0) {
        if (rest[i].type === 'PAREN' && rest[i].value === '(') depth++;
        if (rest[i].type === 'PAREN' && rest[i].value === ')') { depth--; if (depth === 0) break; }
        innerTokens.push(rest[i]);
        i++;
      }
      const args = [];
      let cur = [], d = 0;
      for (const t of innerTokens) {
        if (t.type === 'PAREN' && t.value === '(') { d++; cur.push(t); }
        else if (t.type === 'PAREN' && t.value === ')') { d--; cur.push(t); }
        else if (t.type === 'VIRGULA' && d === 0) { args.push(cur); cur = []; }
        else cur.push(t);
      }
      if (cur.length) args.push(cur);
      const node = {
        op: 'juros_compostos',
        taxaTokens: args[0] || [],
        periodosTokens: args[1] || [],
        montanteTokens: args[2] || null,
      };
      return this.transpileExecuteMathExpr(node);
    }

    // repita
    const repitaIdx = rest.findIndex(t => t.type === 'REPITA');
    if (repitaIdx !== -1) {
      const exprTokens = rest.slice(0, repitaIdx);
      const timesTokens = rest.slice(repitaIdx + 1).filter(t => t.type !== 'VEZES');
      const expr = this.tokensToExpr(exprTokens);
      const times = this.tokensToExpr(timesTokens);
      return `(function(){ const __r=[]; for(let __i=0;__i<${times};__i++) __r.push(${expr}); return __r; })()`;
    }

    // se/senao
    const seIdx = rest.findIndex((t, j) => j >= 0 && t.type === 'SE');
    if (seIdx !== -1) {
      const exprTokens = rest.slice(0, seIdx);
      const afterSe = rest.slice(seIdx + 1);
      const senaoIdx = afterSe.findIndex(t => t.type === 'SENAO');
      const condTokens = senaoIdx !== -1 ? afterSe.slice(0, senaoIdx) : afterSe;
      const elseTokens = senaoIdx !== -1 ? afterSe.slice(senaoIdx + 1) : null;
      const expr = this.tokensToExpr(exprTokens);
      const cond = this.tokensToExpr(condTokens);
      const elseExpr = elseTokens && elseTokens.length > 0 ? this.tokensToExpr(elseTokens) : '""';
      return `((${cond}) ? (${expr}) : (${elseExpr}))`;
    }

    // simple
    return `(${this.tokensToExpr(rest)})`;
  }

  transpileDefineObject(node) {
    // Parse: chave: valor, chave: valor, ...
    // Split by VIRGULA at root level (outside parens)
    const pairs = [];
    let current = [];
    let depth = 0;
    for (const t of node.valueTokens) {
      if (t.type === 'PAREN' && t.value === '(') { depth++; current.push(t); }
      else if (t.type === 'PAREN' && t.value === ')') { depth--; current.push(t); }
      else if (t.type === 'VIRGULA' && depth === 0) {
        if (current.length > 0) pairs.push(current);
        current = [];
      } else {
        current.push(t);
      }
    }
    if (current.length > 0) pairs.push(current);

    const jsProps = pairs.map(pairTokens => {
      // Find DOIS_PONTOS at root level to split key from value
      let colonIdx = -1;
      let d = 0;
      for (let i = 0; i < pairTokens.length; i++) {
        const t = pairTokens[i];
        if (t.type === 'PAREN' && t.value === '(') d++;
        else if (t.type === 'PAREN' && t.value === ')') d--;
        else if (t.type === 'DOIS_PONTOS' && d === 0) { colonIdx = i; break; }
      }
      if (colonIdx === -1) return null;

      const keyTokens = pairTokens.slice(0, colonIdx);
      const valTokens = pairTokens.slice(colonIdx + 1);

      const key = keyTokens.filter(t => t.type === 'IDENTIFIER' || t.type === 'NUMBER' || t.type === 'STRING')
                           .map(t => t.value).join('').trim();
      if (!key) return null;

      const val = this.tokensToExpr(valTokens);
      return `${key}: ${val}`;
    }).filter(Boolean);

    return `let ${node.name} = { ${jsProps.join(', ')} };`;
  }

  transpileDefineObjectFrom(node) {
    // defina NAME como objeto de KEYS_ARRAY: VALUES_ARRAY
    // Zips two arrays into an object — truncates to shorter array length
    const k = node.keyArrayName;
    const v = node.valArrayName;
    return `let ${node.name} = Object.fromEntries(` +
      `${k}.map((key, i) => [key, ${v}[i]]).slice(0, Math.min(${k}.length, ${v}.length))` +
    `);`;
  }

  transpileDefineTendencia(node) {
    // Regressão linear simples (mínimos quadrados) sobre os valores numéricos do objeto fonte
    // X = índices 0..N-1, Y = valores numéricos. Produz objeto com mesmas chaves e valores na reta ajustada.
    const s = node.srcName;
    return `let ${node.name} = (function(){
  const __keys = Object.keys(${s});
  const __vals = Object.values(${s}).map(Number).filter(v => !isNaN(v) && isFinite(v));
  const __n = __vals.length;
  if (__n < 2) return {};
  const __sumX  = __n * (__n - 1) / 2;
  const __sumX2 = __n * (__n - 1) * (2 * __n - 1) / 6;
  const __sumY  = __vals.reduce((a, b) => a + b, 0);
  const __sumXY = __vals.reduce((acc, v, i) => acc + i * v, 0);
  const __denom = __n * __sumX2 - __sumX * __sumX;
  const __slope = __denom === 0 ? 0 : (__n * __sumXY - __sumX * __sumY) / __denom;
  const __intercept = (__sumY - __slope * __sumX) / __n;
  const __result = {};
  __keys.forEach((k, i) => { __result[k] = parseFloat((__intercept + __slope * i).toFixed(4)); });
  return __result;
})();`;
  }

  transpileDefineCompactar(node) {
    const src = this.tokensToExpr(node.srcTokens);
    return `let ${node.name} = (function(){ const __raw = ${src}; const __vals = (Array.isArray(__raw) ? __raw : Object.values(__raw)).map(Number).filter(v => !isNaN(v) && isFinite(v)); return __vals.reduce((a,b)=>a+b,0); })();`;
  }

  transpileAlterVar(node) {
    const val = this.tokensToExpr(node.valueTokens);
    const name = node.name;
    const assign = `${name} = ${val};`;
    // In interface mode, keep __state in sync after every assignment
    const stateSync = this._interfaceMode ? ` __state[${JSON.stringify(name)}] = ${name};` : '';
    const log = `${this._out}.push({ type: "execute", value: ${name} });`;
    const guardedWhile = (cond, body) =>
      `{ let __guard = 0; while (${cond}) { ${body} if (++__guard > 10000) { ${this._out}.push({ type: "execute", value: "⚠️ enquanto: limite de 10.000 iterações atingido" }); break; } } }`;

    const hasEnquanto = !!node.enquantoTokens;
    const hasRelatando = node.relatar;
    const hasN = !!node.relatandoN;

    if (hasEnquanto) {
      const cond = this.tokensToExpr(node.enquantoTokens);
      const body = hasRelatando ? `${assign}${stateSync} ${log}` : `${assign}${stateSync}`;
      return guardedWhile(cond, body);
    }

    if (hasN) {
      const n = this.tokensToExpr(node.relatandoN);
      return `for (let __i = 0; __i < ${n}; __i++) { ${assign}${stateSync} ${log} }`;
    }

    if (hasRelatando) {
      return `${assign}${stateSync} ${log}`;
    }

    // plain altere
    return `${assign}${stateSync}`;
  }

  transpileDefineVar(node) {
    const value = this.tokensToExpr(node.valueTokens);
    if (this._interfaceMode) {
      // In interface mode, persist to __state so re-runs use the last value
      return `if (__state[${JSON.stringify(node.name)}] === undefined) { __state[${JSON.stringify(node.name)}] = (${value}); }\nvar ${node.name} = __state[${JSON.stringify(node.name)}];`;
    }
    return `let ${node.name} = ${value};`;
  }

  transpileDefineArray(node) {
    // Split valueTokens by root-level commas
    const items = [];
    let current = [];
    let depth = 0;
    for (const t of node.valueTokens) {
      if (t.type === 'PAREN' && t.value === '(') { depth++; current.push(t); }
      else if (t.type === 'PAREN' && t.value === ')') { depth--; current.push(t); }
      else if (t.type === 'VIRGULA' && depth === 0) {
        if (current.length > 0) items.push(current);
        current = [];
      } else {
        current.push(t);
      }
    }
    if (current.length > 0) items.push(current);

    const jsItems = items.map(itemTokens => this.tokensToExpr(itemTokens));
    return `let ${node.name} = [${jsItems.join(', ')}];`;
  }

  transpileDefineFunc(node) {
    const params = node.params.join(', ');
    
    // Parse body as sub-statements
    const bodyTokens = node.bodyTokens;
    if (bodyTokens.length === 0) {
      return `function ${node.name}(${params}) { }`;
    }

    // Add params to declaredVars so body expressions resolve them as variables
    const addedParams = [];
    for (const p of node.params) {
      if (!this.declaredVars.has(p)) {
        this.declaredVars.add(p);
        addedParams.push(p);
      }
    }

    // Split body into sub-statements by finding LARANJA tokens at depth 0
    // (must not split on EXECUTE inside rodar(...) parens)
    const subStatements = [];
    let current = [];
    let splitDepth = 0;
    for (const t of bodyTokens) {
      if (t.type === 'PAREN' && t.value === '(') splitDepth++;
      else if (t.type === 'PAREN' && t.value === ')') splitDepth--;

      if (['DEFINA', 'ALTERE', 'EXECUTE', 'APRESENTE'].includes(t.type) && splitDepth === 0 && current.length > 0) {
        subStatements.push(current);
        current = [t];
      } else {
        current.push(t);
      }
    }
    if (current.length > 0) subStatements.push(current);

    let bodyLines = [];
    for (const stmtTokens of subStatements) {
      const first = stmtTokens[0];
      if (first.type === 'EXECUTE') {
        // In a function body, transpile each execute sub-statement fully
        // reuse the same logic as the top-level parser by delegating to transpileFuncBodyExecute
        bodyLines.push(this.transpileFuncBodyExecute(stmtTokens.slice(1)));
      } else if (first.type === 'ALTERE') {
        // altere VAR para EXPR inside a function body
        // tokens: [ALTERE, IDENTIFIER, PARA, ...valueTokens]
        if (stmtTokens.length >= 4 && stmtTokens[2].type === 'PARA') {
          const name = stmtTokens[1].value;
          const val = this.tokensToExpr(stmtTokens.slice(3));
          bodyLines.push(`${name} = ${val};`);
        }
      } else if (first.type === 'DEFINA') {
        // Inner variable
        if (stmtTokens.length >= 4 && stmtTokens[2].type === 'COMO') {
          const name = stmtTokens[1].value;
          const val = this.tokensToExpr(stmtTokens.slice(3));
          bodyLines.push(`let ${name} = ${val};`);
        }
      } else if (first.type === 'APRESENTE') {
        const rest = stmtTokens.slice(1);
        let format = 'texto';
        let exprT = rest;
        // Find 'em'
        for (let j = rest.length - 2; j >= 0; j--) {
          if (rest[j].type === 'EM') {
            exprT = rest.slice(0, j);
            const fmtVal = rest[j + 1]?.value?.toLowerCase();
            if (fmtVal) format = fmtVal === 'apresentacao' ? 'apresentação' : fmtVal;
            break;
          }
        }
        const expr = this.tokensToExpr(exprT);
        bodyLines.push(`${this._out}.push({ type: "${format}", value: ${expr} });`);
      } else {
        const expr = this.tokensToExpr(stmtTokens);
        bodyLines.push(`return ${expr};`);
      }
    }

    // Remove params from declaredVars (they're local to the function)
    for (const p of addedParams) {
      this.declaredVars.delete(p);
    }

    return `function ${node.name}(${params}) { ${bodyLines.join(' ')} }`;
  }

  // Handles all forms of `execute` inside function bodies (returns value or loop)
  transpileFuncBodyExecute(rest) {
    // Math operations
    if (rest[0]?.type === 'POTENCIA_DE') {
      const node = { op: 'potencia', argTokens: rest.slice(1) };
      return `return ${this.transpileExecuteMathExpr(node)};`;
    }
    if (rest[0]?.type === 'RAIZ_DE') {
      const node = { op: 'raiz', argTokens: rest.slice(1) };
      return `return ${this.transpileExecuteMathExpr(node)};`;
    }
    if (rest[0]?.type === 'ALEATORIO_ENTRE') {
      // May also have repita
      const repitaIdx = rest.findIndex(t => t.type === 'REPITA');
      if (repitaIdx !== -1) {
        const coreRest = rest.slice(0, repitaIdx);
        const afterRepita = rest.slice(repitaIdx + 1);
        const timesTokens = afterRepita.filter(t => t.type !== 'VEZES');
        const times = this.tokensToExpr(timesTokens);
        const argTokens = coreRest.slice(1);
        const eIdx = argTokens.findIndex(t => t.type === 'E_CONJ');
        const node = { op: 'aleatorio', argTokens, eIdx };
        const mathExpr = this.transpileExecuteMathExpr(node);
        return `(function(){ const __r=[]; for(let __i=0;__i<${times};__i++) __r.push(${mathExpr}); return __r; })()`;
      }
      const argTokens = rest.slice(1);
      const eIdx = argTokens.findIndex(t => t.type === 'E_CONJ');
      const node = { op: 'aleatorio', argTokens, eIdx };
      return `return ${this.transpileExecuteMathExpr(node)};`;
    }

    // Find repita
    const repitaIdx = rest.findIndex(t => t.type === 'REPITA');
    if (repitaIdx !== -1) {
      const exprTokens = rest.slice(0, repitaIdx);
      const afterRepita = rest.slice(repitaIdx + 1);
      const timesTokens = afterRepita.filter(t => t.type !== 'VEZES');
      const expr = this.tokensToExpr(exprTokens);
      const times = this.tokensToExpr(timesTokens);
      // Return array of repeated results
      return `return (function(){ const __r=[]; for(let __i=0;__i<${times};__i++) __r.push(${expr}); return __r; })();`;
    }

    // Find se/senao
    const seIdx = rest.findIndex(t => t.type === 'SE');
    if (seIdx !== -1) {
      const exprTokens = rest.slice(0, seIdx);
      const afterSe = rest.slice(seIdx + 1);
      const senaoIdx = afterSe.findIndex(t => t.type === 'SENAO');
      const condTokens = senaoIdx !== -1 ? afterSe.slice(0, senaoIdx) : afterSe;
      const elseTokens = senaoIdx !== -1 ? afterSe.slice(senaoIdx + 1) : null;
      const expr = this.tokensToExpr(exprTokens);
      const cond = this.tokensToExpr(condTokens);
      if (elseTokens && elseTokens.length > 0) {
        const elseExpr = this.tokensToExpr(elseTokens);
        return `return (${cond}) ? (${expr}) : (${elseExpr});`;
      }
      return `if (${cond}) { return ${expr}; }`;
    }

    // Simple
    const expr = this.tokensToExpr(rest);
    return `return ${expr};`;
  }

  transpileExecuteSimple(node) {
    const expr = this.tokensToExpr(node.exprTokens);
    return `${this._out}.push({ type: "execute", value: ${expr} });`;
  }

  transpileExecuteConditional(node) {
    const expr = this.tokensToExpr(node.exprTokens);
    const cond = this.tokensToExpr(node.condTokens);
    
    if (node.elseTokens && node.elseTokens.length > 0) {
      const elseExpr = this.tokensToExpr(node.elseTokens);
      return `if (${cond}) { ${this._out}.push({ type: "execute", value: ${expr} }); } else { ${this._out}.push({ type: "execute", value: ${elseExpr} }); }`;
    }
    return `if (${cond}) { ${this._out}.push({ type: "execute", value: ${expr} }); }`;
  }

  transpileExecuteRepeat(node) {
    const expr = this.tokensToExpr(node.exprTokens);
    const times = this.tokensToExpr(node.timesTokens);
    // Use a function to re-evaluate expr each iteration (important for dynamic values like functions)
    return `for (let __i = 0; __i < ${times}; __i++) { ${this._out}.push({ type: "execute", value: (${expr}) }); }`;
  }

  transpileExecuteRepeatMath(node) {
    const times = this.tokensToExpr(node.timesTokens);
    const mathExpr = this.transpileExecuteMathExpr(node.mathNode);
    // Re-evaluate math expression each iteration (critical for aleatorio)
    return `for (let __i = 0; __i < ${times}; __i++) { ${this._out}.push({ type: "execute", value: ${mathExpr} }); }`;
  }

  transpileExecuteRepeatConditional(node) {
    const times = this.tokensToExpr(node.timesTokens);
    const expr = this.tokensToExpr(node.exprTokens);
    const cond = this.tokensToExpr(node.condTokens);
    let body;
    if (node.elseTokens && node.elseTokens.length > 0) {
      const elseExpr = this.tokensToExpr(node.elseTokens);
      body = `if (${cond}) { ${this._out}.push({ type: "execute", value: ${expr} }); } else { ${this._out}.push({ type: "execute", value: ${elseExpr} }); }`;
    } else {
      body = `if (${cond}) { ${this._out}.push({ type: "execute", value: ${expr} }); }`;
    }
    return `for (let __i = 0; __i < ${times}; __i++) { ${body} }`;
  }

  transpileExecuteMathExpr(node) {
    if (node.op === 'potencia') {
      const args = [];
      let current = [];
      for (const t of node.argTokens) {
        if (t.type === 'VIRGULA') {
          args.push(this.tokensToExpr(current));
          current = [];
        } else {
          current.push(t);
        }
      }
      if (current.length > 0) args.push(this.tokensToExpr(current));
      return `Math.pow(${args[0] || 0}, ${args[1] || 0})`;
    }
    if (node.op === 'raiz') {
      const val = this.tokensToExpr(node.argTokens);
      return `Math.sqrt(${val})`;
    }
    if (node.op === 'aleatorio') {
      let minTokens = [], maxTokens = [];
      let inMax = false;
      for (const t of node.argTokens) {
        if (t.type === 'E_CONJ') { inMax = true; continue; }
        if (inMax) maxTokens.push(t);
        else minTokens.push(t);
      }
      const min = this.tokensToExpr(minTokens);
      const max = this.tokensToExpr(maxTokens);
      return `(Math.floor(Math.random() * (${max} - ${min} + 1)) + ${min})`;
    }
    if (node.op === 'juros_compostos') {
      const taxa = this.tokensToExpr(node.taxaTokens);
      const n    = this.tokensToExpr(node.periodosTokens);
      const fator = `Math.pow(1 + (${taxa}), (${n}))`;
      if (node.montanteTokens) {
        const montante = this.tokensToExpr(node.montanteTokens);
        return `((${montante}) * ${fator})`;
      }
      return fator;
    }
    if (node.op === 'tamanho_de') {
      const src = this.tokensToExpr(node.srcTokens);
      return `(Array.isArray(${src}) ? ${src}.length : Object.keys(${src}).length)`;
    }
    if (node.op === 'percentil_de') {
      const data = this.tokensToExpr(node.dataTokens);
      const p    = this.tokensToExpr(node.pTokens);
      // Works on both arrays and objects (extracts numeric values from objects)
      return `(function(){
  const __raw = ${data};
  const __arr = (Array.isArray(__raw) ? __raw : Object.values(__raw))
    .map(Number).filter(v => !isNaN(v) && isFinite(v)).sort((a,b)=>a-b);
  if (__arr.length === 0) return null;
  const __p = ${p};
  const __idx = (__p / 100) * (__arr.length - 1);
  const __lo = Math.floor(__idx), __hi = Math.ceil(__idx);
  return __lo === __hi ? __arr[__lo] : __arr[__lo] + (__arr[__hi] - __arr[__lo]) * (__idx - __lo);
})()`.replace(/\n\s*/g, ' ');
    }
    return '0';
  }

  transpileExecuteAmostras(node) {
    // Use transpileRodarExec to handle ALL expr forms: aleatorio, potencia, juros, se/senao, etc.
    const expr = this.transpileRodarExec(node.exprTokens);
    const n    = this.tokensToExpr(node.nTokens);
    return `${this._out}.push({ type: "execute", value: (function(){ const __s=[]; for(let __i=0;__i<${n};__i++) __s.push(${expr}); return __s; })() });`;
  }

  transpileExecuteLoop(node) {
    // for (let i = INIT; COND; i = INCR) { BODY }
    // 'i' is injected implicitly — cond and incr tokens can reference it directly

    const init = this.tokensToExpr(node.initTokens);

    // Inject 'i' into declaredVars so body and cond/incr resolve it as a variable
    const iWasDeclared = this.declaredVars.has('i');
    this.declaredVars.add('i');

    const cond = this.tokensToExpr(node.condTokens);
    const incr = this.tokensToExpr(node.incrTokens);

    // Transpile body using same sub-statement logic as funcao body
    const bodyLines = this.transpileLoopBody(node.bodyTokens);

    if (!iWasDeclared) this.declaredVars.delete('i');

    return `{ for (let i = ${init}; ${cond}; i = ${incr}) { ${bodyLines} } }`;
  }

  transpileLoopBody(bodyTokens) {
    if (!bodyTokens || bodyTokens.length === 0) return '';

    // Split into sub-statements by LARANJA tokens at depth 0 (same as funcao body)
    const subStatements = [];
    let current = [];
    let depth = 0;
    for (const t of bodyTokens) {
      if (t.type === 'PAREN' && t.value === '(') depth++;
      else if (t.type === 'PAREN' && t.value === ')') depth--;
      if (['DEFINA', 'ALTERE', 'EXECUTE', 'APRESENTE'].includes(t.type) && depth === 0 && current.length > 0) {
        subStatements.push(current);
        current = [t];
      } else {
        current.push(t);
      }
    }
    if (current.length > 0) subStatements.push(current);

    const lines = [];
    for (const stmtTokens of subStatements) {
      const first = stmtTokens[0];
      if (first.type === 'EXECUTE') {
        lines.push(this.transpileFuncBodyExecute(stmtTokens.slice(1)));
      } else if (first.type === 'ALTERE') {
        if (stmtTokens.length >= 4 && stmtTokens[2].type === 'PARA') {
          const name = stmtTokens[1].value;
          const relatandoIdx = stmtTokens.findIndex(t => t.type === 'RELATANDO');
          const enquantoIdx = stmtTokens.findIndex(t => t.type === 'ENQUANTO');
          let valEnd = stmtTokens.length;
          if (relatandoIdx !== -1) valEnd = Math.min(valEnd, relatandoIdx);
          if (enquantoIdx !== -1) valEnd = Math.min(valEnd, enquantoIdx);
          const val = this.tokensToExpr(stmtTokens.slice(3, valEnd));
          let stmt = `${name} = ${val};`;
          if (relatandoIdx !== -1) stmt += ` ${this._out}.push({ type: "execute", value: ${name} });`;
          lines.push(stmt);
        }
      } else if (first.type === 'DEFINA') {
        if (stmtTokens.length >= 4 && stmtTokens[2].type === 'COMO') {
          const name = stmtTokens[1].value;
          const val = this.tokensToExpr(stmtTokens.slice(3));
          this.declaredVars.add(name);
          lines.push(`let ${name} = ${val};`);
        }
      } else if (first.type === 'APRESENTE') {
        const rest = stmtTokens.slice(1);
        let format = 'texto', exprT = rest;
        for (let j = rest.length - 2; j >= 0; j--) {
          if (rest[j].type === 'EM') {
            exprT = rest.slice(0, j);
            const fv = rest[j + 1]?.value?.toLowerCase();
            if (fv) format = fv === 'apresentacao' ? 'apresentação' : fv;
            break;
          }
        }
        lines.push(`${this._out}.push({ type: "${format}", value: ${this.tokensToExpr(exprT)} });`);
      }
    }
    return lines.join(' ');
  }

  transpileExecuteMath(node) {
    const mathExpr = this.transpileExecuteMathExpr(node);
    return `${this._out}.push({ type: "execute", value: ${mathExpr} });`;
  }

  // ==================== interface cor de fundo ====================
  transpileExecuteCorDeFundo(node) {
    return `__iface_output.push({ type: 'corDeFundo', r: ${node.r}, g: ${node.g}, b: ${node.b} });`;
  }

  // ==================== sprites ====================
  transpileDefineSpriteReto(node) {
    // Register the sprite definition in __sprites at runtime
    const points = JSON.stringify(node.points);
    return `if (!window.parent.__ccSprites) window.parent.__ccSprites = {};\nwindow.parent.__ccSprites[${JSON.stringify(node.name)}] = { kind: 'reto', points: ${points} };\nvar ${node.name} = ${JSON.stringify(node.name)};`;
  }

  transpileDefineSpriteCircle(node) {
    return `if (!window.parent.__ccSprites) window.parent.__ccSprites = {};\nwindow.parent.__ccSprites[${JSON.stringify(node.name)}] = { kind: 'curvo', radius: ${node.radius} };\nvar ${node.name} = ${JSON.stringify(node.name)};`;
  }

  transpileDefineSpriteImage(node) {
    return `if (!window.parent.__ccSprites) window.parent.__ccSprites = {};\nwindow.parent.__ccSprites[${JSON.stringify(node.name)}] = { kind: 'image', imageKey: ${JSON.stringify(node.imageKey)} };\nvar ${node.name} = ${JSON.stringify(node.name)};`;
  }

  transpileDefineInteractive(node) {
    // Register in __ccElements on parent window (persistent across re-runs)
    const key = JSON.stringify(node.name);
    const labelStr = JSON.stringify(node.label);
    const extraStr = JSON.stringify(node.extraArgs);
    let effectCode = '';
    if (node.effectTokens && node.effectTokens.length > 0) {
      // Transpile effect tokens as an inline execute
      const effectExpr = this.tokensToExpr(node.effectTokens);
      effectCode = `${this._out}.push({ type: 'execute', value: (${effectExpr}) });`;
    }
    return [
      `if (!window.parent.__ccElements) window.parent.__ccElements = {};`,
      `window.parent.__ccElements[${key}] = { kind: ${JSON.stringify(node.kind)}, label: ${labelStr}, extra: ${extraStr} };`,
      `var ${node.name} = window.parent.__ccElements[${key}];`,
      `if (${node.name}.valor === undefined) ${node.name}.valor = '';`,
    ].join('\n');
  }

  // ==================== salve/carregue local ====================
  transpileSalveLocal(node) {
    const lines = node.vars.map(v =>
      `try { localStorage.setItem('__cc_${v}', JSON.stringify(${v})); } catch(__e) {}`
    );
    return lines.join('\n');
  }

  transpileCarregueLocal(node) {
    const lines = node.vars.map(v =>
      `try { var __s_${v} = localStorage.getItem('__cc_${v}'); if (__s_${v} !== null) ${v} = JSON.parse(__s_${v}); } catch(__e) {}`
    );
    return lines.join('\n');
  }

  // ==================== salve/carregue nuvem ====================
  transpileSalveNuvem(node) {
    const keyExpr = node.usingKey
      ? JSON.stringify(node.usingKey)
      : `__cloudKey`;
    const bodyObj = '{' + node.vars.map(v => `"${v}": ${v}`).join(', ') + '}';
    return `(async function(){
  try {
    const __ck = ${keyExpr};
    await fetch(CRABCODE_CLOUD_URL + '/save/' + __ck, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(${bodyObj})
    });
  } catch(__e) {}
})();`;
  }

  transpileCarregueNuvem(node) {
    const keyExpr = node.usingKey
      ? JSON.stringify(node.usingKey)
      : `__cloudKey`;
    const assignLines = node.vars.map(v =>
      `if (__d["${v}"] !== undefined) ${v} = __d["${v}"];`
    ).join(' ');
    return `await (async function(){
  try {
    const __ck = ${keyExpr};
    const __r = await fetch(CRABCODE_CLOUD_URL + '/load/' + __ck);
    const __d = await __r.json();
    ${assignLines}
  } catch(__e) {}
})();`;
  }

  transpileApresente(node) {
    const expr = this.tokensToExpr(node.exprTokens);
    const format = node.format;
    const out = this._interfaceMode ? '__iface_output' : '__output';
    const yellowPart = node.yellow ? `, yellow: ${JSON.stringify(node.yellow)}` : '';
    if (format === 'sprite' && this._interfaceMode) {
      return `${out}.push({ type: 'sprite', spriteKey: ${expr}${yellowPart} });`;
    }
    if (['botao', 'toggle', 'slider', 'seletor', 'digite', 'pergunte'].includes(format) && this._interfaceMode) {
      return `${out}.push({ type: ${JSON.stringify(format)}, elemKey: ${expr}${yellowPart} });`;
    }
    if (format === 'tabela' || format === 'grafico') {
      const xName = JSON.stringify(node.xName || 'x');
      if (node.yExprTokens) {
        const yExpr = this.tokensToExpr(node.yExprTokens);
        const yName = JSON.stringify(node.yName || 'y');
        return `${out}.push({ type: "${format}", value: ${expr}, yValue: ${yExpr}, xName: ${xName}, yName: ${yName}${yellowPart} });`;
      }
      return `${out}.push({ type: "${format}", value: ${expr}, xName: ${xName}${yellowPart} });`;
    }
    if (format === 'estatisticas') {
      const xName = JSON.stringify(node.xName || 'obj');
      return `${out}.push({ type: "estatisticas", value: ${expr}, xName: ${xName}${yellowPart} });`;
    }
    return `${out}.push({ type: "${format}", value: ${expr}${yellowPart} });`;
  }

  transpileImportLib(node) {
    if (!this._importedLibs) this._importedLibs = new Set();
    const libName = node.libName;
    if (this._importedLibs.has(libName)) return '';
    this._importedLibs.add(libName);

    // Interface mode built-in: inject state persistence prologue
    if (libName === 'interface') {
      return [
        'var __INTERFACE_MODE = true;',
        'if (!window.parent.__ccState) window.parent.__ccState = {};',
        'var __state = window.parent.__ccState;',
        'window.parent.__ccTecla = window.parent.__ccTecla || { valor: \'\', atual: \'\' };',
        'var tecla = window.parent.__ccTecla;'
      ].join('\n');
    }

    const lib = this._registry ? this._registry.get(libName) : null;
    if (!lib) {
      // Check if it's a CSV dataset — code injection is handled by getCsvInjectionCode()
      const _csvDs = this._csvDatasets;
      const _csvMatch = _csvDs.find(d => d.key === libName);
      if (_csvMatch) {
        for (const col of _csvMatch.columns) {
          this.declaredVars.add(col.name);
          this.declaredArrays.add(col.name);
        }
      }
      return '';
    }
    if (lib.dependencies) {
      let code = '';
      for (const depName of lib.dependencies) {
        if (!this._importedLibs.has(depName)) {
          code += this.transpileImportLib({ type: 'ImportLib', libName: depName, line: node.line });
          code += '\n';
        }
      }
      return code;
    }
    if (lib.exports) {
      for (const name of lib.exports) this.declaredVars.add(name);
    }
    return lib.jsCode || '';
  }
}

// ==================== RUNTIME ====================
class Runtime {
  constructor() {
    this._sandboxReady = false;
    this._iframe = null;
    this._pendingResolve = null;
    this._pendingReject = null;
    this._timeout = null;
    this._initSandbox();
  }

  _initSandbox() {
    // Create a hidden sandboxed iframe.
    // allow-same-origin is required for localStorage (salve/carregue local) and
    // fetch (salve/carregue nuvem). Security tradeoff: documented in README.
    this._iframe = document.createElement('iframe');
    this._iframe.sandbox = 'allow-scripts allow-same-origin';
    this._iframe.style.cssText = 'display:none;width:0;height:0;border:none;position:absolute;';
    this._iframe.srcdoc = `<!DOCTYPE html><html><head><script>
      window.addEventListener('message', function(e) {
        try {
          var code = e.data && e.data.code;
          if (typeof code !== 'string') return;
          // Wrap in async function to support await (used by carregue/salve nuvem)
          var asyncFn = new Function('return (async function() {\\n' + code + '\\n})()');
          var result = asyncFn();
          if (result && typeof result.then === 'function') {
            result.then(function(output) {
              parent.postMessage({ id: e.data.id, output: output || [], error: null }, '*');
            }).catch(function(err) {
              parent.postMessage({ id: e.data.id, output: [], error: err.message }, '*');
            });
          } else {
            parent.postMessage({ id: e.data.id, output: result || [], error: null }, '*');
          }
        } catch (err) {
          parent.postMessage({ id: e.data.id, output: [], error: err.message }, '*');
        }
      });
      parent.postMessage({ type: 'sandbox-ready' }, '*');
    <\/script></head><body></body></html>`;

    // Listen for messages from the sandbox
    this._messageHandler = (e) => {
      if (!e.data) return;
      if (e.data.type === 'sandbox-ready') {
        this._sandboxReady = true;
        return;
      }
      if (e.data.id !== undefined && this._pendingResolve) {
        clearTimeout(this._timeout);
        const resolve = this._pendingResolve;
        this._pendingResolve = null;
        this._pendingReject = null;
        resolve({ output: e.data.output || [], error: e.data.error || null });
      }
    };
    window.addEventListener('message', this._messageHandler);
    document.body.appendChild(this._iframe);
  }

  runInSandbox(jsCode, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const id = Date.now() + Math.random();
      this._pendingResolve = resolve;
      this._pendingReject = reject;

      this._timeout = setTimeout(() => {
        // Timeout — destroy and recreate iframe
        this._pendingResolve = null;
        this._pendingReject = null;
        this._resetSandbox();
        resolve({ output: [], error: 'Tempo limite excedido (timeout de ' + (timeoutMs / 1000) + 's). Verifique se há loops infinitos no código.' });
      }, timeoutMs);

      try {
        this._iframe.contentWindow.postMessage({ id: id, code: jsCode }, '*');
      } catch (e) {
        clearTimeout(this._timeout);
        this._pendingResolve = null;
        this._pendingReject = null;
        // Fallback to direct execution
        resolve(this._runDirect(jsCode));
      }
    });
  }

  _resetSandbox() {
    if (this._iframe && this._iframe.parentNode) {
      this._iframe.parentNode.removeChild(this._iframe);
    }
    this._sandboxReady = false;
    this._initSandbox();
  }

  _runDirect(jsCode) {
    // Fallback — direct async execution (used if sandbox unavailable)
    try {
      const fn = new Function('return (async function() {\n' + jsCode + '\n})()');
      const result = fn();
      if (result && typeof result.then === 'function') {
        // Return synchronous empty output — async fallback can't wait
        return { output: [], error: null };
      }
      return { output: result || [], error: null };
    } catch (e) {
      return { output: [], error: e.message };
    }
  }

  // Legacy synchronous API (fallback)
  run(jsCode) {
    return this._runDirect(jsCode);
  }
}

// ==================== CRAB LIBRARY REGISTRY ====================
const CrabLibRegistry = {
  official: {
    // ── interface (EMBUTIDO) ──────────────────────────────────
    interface: {
      key: 'interface',
      title: '🎨 Interface Visual',
      description: 'Módulo embutido especial. Ativa o modo de interface interativa: tela visual, sprites, elementos interativos (botao, toggle, slider, seletor, digite, pergunte), teclado e persistência de estado entre re-execuções.',
      isBuiltin: true,
      selo: 'estrelada',
      exports: [],
      functions: [
        { name: 'execute cor de fundo R G B', params: 'R, G, B', desc: 'Define a cor de fundo da tela (RGB 0–255)' },
        { name: 'execute cor de texto R G B', params: 'R, G, B', desc: 'Define a cor padrão de texto (RGB 0–255)' },
        { name: 'apresente V em ... ajuste POS TAM', params: 'pos, tam', desc: 'Posiciona elemento: esquerda/centro/direita, tamanho ppp…ggg' },
        { name: 'apresente V em ... grid COL LIN W H', params: 'col, lin, w, h', desc: 'Posição absoluta em grid 12×12' },
        { name: 'defina X como sprite reto(pontos) com cor R G B', params: '...', desc: 'Polígono SVG por pontos normalizados 0–100' },
        { name: 'defina X como sprite curvo(raio) com cor R G B', params: 'raio', desc: 'Círculo SVG com raio 1–50' },
        { name: 'defina X como sprite "chave"', params: 'chave', desc: 'Imagem de pixel art criada na aba Imagens' },
        { name: 'defina X como funcao botao("label") execute EXPR', params: '...', desc: 'Botão clicável. .valor = resultado da última execução' },
        { name: 'defina X como funcao toggle("label")', params: 'label', desc: 'Interruptor on/off. .valor = verdadeiro/falso' },
        { name: 'defina X como funcao slider("label", MIN, MAX)', params: 'label, min, max', desc: 'Controle deslizante. .valor = número atual' },
        { name: 'defina X como funcao seletor("label", op1, op2...)', params: '...', desc: 'Lista de opções. .valor = opção selecionada' },
        { name: 'defina X como funcao digite("placeholder")', params: 'placeholder', desc: 'Campo de texto livre. .valor = texto digitado' },
        { name: 'defina X como funcao pergunte("pergunta")', params: 'pergunta', desc: 'Prompt com OK. .valor = resposta confirmada' },
        { name: 'tecla.valor', params: '', desc: 'Última tecla pressionada (persiste entre execuções)' },
        { name: 'tecla.atual', params: '', desc: 'Tecla deste frame. Limpa após cada re-execução' },
        { name: 'salve local X', params: 'X', desc: 'Grava X em localStorage' },
        { name: 'carregue local X', params: 'X', desc: 'Lê X de localStorage' },
        { name: 'salve nuvem X usando "chave"', params: 'X, chave', desc: 'POST valor para a API CrabCode em nuvem' },
        { name: 'carregue nuvem X usando "chave"', params: 'X, chave', desc: 'GET valor da API CrabCode em nuvem' },
      ],
      jsCode: '',
      example: `importe interface\n\nexecute cor de fundo 15 20 40\n\ndefina n como 0\ncarregue local n\n\ndefina btn como funcao botao("+1") execute n + 1\napresente btn em botao ajuste centro m\n\naltere n para btn.valor\nsalve local n\n\napresente "Contagem: " + n em destaque ajuste centro g`,
    },

    // ── formulas_fisica (META) ───────────────────────────────
    formulas_fisica: {
      key: 'formulas_fisica',
      title: '📐 Física Completa',
      description: 'Meta-biblioteca que importa todas as sub-bibliotecas de física: mecânica, termodinâmica, óptica, fluidos, gravitação, eletromagnetismo e física moderna.',
      exports: [],
      functions: [],
      jsCode: '',
      example: `importe formulas_fisica\n\nexecute velocidade(100, 5)\nexecute pressao_fluido(1000, 9.81, 10)\nexecute energia_foton(6e14)\nexecute forca_lorentz(1.6e-19, 1e6, 0.5)`,
      dependencies: ['fisica_mecanica', 'fisica_termodinamica', 'fisica_optica', 'fisica_fluidos', 'fisica_gravitacao', 'fisica_eletromagnetismo', 'fisica_moderna', 'fisica_ondas'],
    },

    // ── fisica_mecanica ──────────────────────────────────────
    fisica_mecanica: {
      key: 'fisica_mecanica',
      selo: 'recomendada',
      title: '⚙️ Mecânica Clássica',
      description: 'Cinemática, dinâmica, trabalho, energia, impulso e momento. Fórmulas fundamentais da mecânica newtoniana.',
      exports: ['velocidade','aceleracao','forca','energia_cinetica','energia_potencial','trabalho','potencia_mecanica','peso','impulso','momento','velocidade_final','alcance_projetil','altura_maxima','tempo_queda'],
      functions: [
        { name: 'velocidade', params: 'd, t', desc: 'v = d / t' },
        { name: 'aceleracao', params: 'dv, t', desc: 'a = Δv / t' },
        { name: 'forca', params: 'm, a', desc: 'F = m × a (2ª Lei de Newton)' },
        { name: 'energia_cinetica', params: 'm, v', desc: 'Ec = ½mv²' },
        { name: 'energia_potencial', params: 'm, h', desc: 'Ep = mgh (g = 9.81)' },
        { name: 'trabalho', params: 'f, d', desc: 'W = F × d' },
        { name: 'potencia_mecanica', params: 'w, t', desc: 'P = W / t' },
        { name: 'peso', params: 'm', desc: 'P = mg (g = 9.81)' },
        { name: 'impulso', params: 'f, t', desc: 'J = F × t' },
        { name: 'momento', params: 'm, v', desc: 'p = m × v' },
        { name: 'velocidade_final', params: 'v0, a, t', desc: 'vf = v0 + a×t' },
        { name: 'alcance_projetil', params: 'v0, angulo', desc: 'R = v0²×sin(2θ)/g (m)' },
        { name: 'altura_maxima', params: 'v0, angulo', desc: 'H = v0²×sin²θ/(2g)' },
        { name: 'tempo_queda', params: 'h', desc: 'Queda livre: t = √(2h/g)' },
      ],
      jsCode: `function velocidade(d, t) { return d / t; }
function aceleracao(dv, t) { return dv / t; }
function forca(m, a) { return m * a; }
function energia_cinetica(m, v) { return 0.5 * m * v * v; }
function energia_potencial(m, h) { return m * 9.81 * h; }
function trabalho(f, d) { return f * d; }
function potencia_mecanica(w, t) { return w / t; }
function peso(m) { return m * 9.81; }
function impulso(f, t) { return f * t; }
function momento(m, v) { return m * v; }
function velocidade_final(v0, a, t) { return v0 + a * t; }
function alcance_projetil(v0, angulo) { var r = angulo * Math.PI / 180; return v0 * v0 * Math.sin(2 * r) / 9.81; }
function altura_maxima(v0, angulo) { var r = angulo * Math.PI / 180; return v0 * v0 * Math.pow(Math.sin(r), 2) / (2 * 9.81); }
function tempo_queda(h) { return Math.sqrt(2 * h / 9.81); }`,
      example: `importe fisica_mecanica\n\nexecute velocidade(100, 5)\nexecute forca(70, 3)\nexecute energia_cinetica(1000, 30)\nexecute alcance_projetil(50, 45)\napresente altura_maxima(50, 45) em destaque`,
    },

    // ── fisica_termodinamica ─────────────────────────────────
    fisica_termodinamica: {
      key: 'fisica_termodinamica',
      title: '🌡️ Termodinâmica',
      description: 'Calor sensível e latente, gases ideais, entropia, eficiência de Carnot, dilatação térmica e condução de calor.',
      exports: ['calor_sensivel','calor_latente','lei_gases_ideais','eficiencia_carnot','entropia','dilatacao_linear','dilatacao_volumetrica','condutividade_termica','capacidade_calorifica','trabalho_gas'],
      functions: [
        { name: 'calor_sensivel', params: 'm, c, dt', desc: 'Q = m × c × ΔT' },
        { name: 'calor_latente', params: 'm, L', desc: 'Q = m × L' },
        { name: 'lei_gases_ideais', params: 'p, v, t', desc: 'PV/T (constante do gás)' },
        { name: 'eficiencia_carnot', params: 'tc, tq', desc: 'η = 1 - Tc/Tq (K)' },
        { name: 'entropia', params: 'q, t', desc: 'ΔS = Q / T' },
        { name: 'dilatacao_linear', params: 'l0, alpha, dt', desc: 'ΔL = L0 × α × ΔT' },
        { name: 'dilatacao_volumetrica', params: 'v0, gamma, dt', desc: 'ΔV = V0 × γ × ΔT' },
        { name: 'condutividade_termica', params: 'k, a, dt, e', desc: 'Q/t = k × A × ΔT / e' },
        { name: 'capacidade_calorifica', params: 'q, dt', desc: 'C = Q / ΔT' },
        { name: 'trabalho_gas', params: 'p, dv', desc: 'W = P × ΔV' },
      ],
      jsCode: `function calor_sensivel(m, c, dt) { return m * c * dt; }
function calor_latente(m, L) { return m * L; }
function lei_gases_ideais(p, v, t) { return p * v / t; }
function eficiencia_carnot(tc, tq) { return 1 - tc / tq; }
function entropia(q, t) { return q / t; }
function dilatacao_linear(l0, alpha, dt) { return l0 * alpha * dt; }
function dilatacao_volumetrica(v0, gamma, dt) { return v0 * gamma * dt; }
function condutividade_termica(k, a, dt, e) { return k * a * dt / e; }
function capacidade_calorifica(q, dt) { return q / dt; }
function trabalho_gas(p, dv) { return p * dv; }`,
      example: `importe fisica_termodinamica\n\nexecute calor_sensivel(2, 4186, 10)\nexecute eficiencia_carnot(300, 600)\nexecute dilatacao_linear(10, 0.000012, 100)\napresente trabalho_gas(101325, 0.01) em destaque`,
    },

    // ── fisica_optica ────────────────────────────────────────
    fisica_optica: {
      key: 'fisica_optica',
      title: '🔭 Óptica',
      description: 'Reflexão, refração, lentes, espelhos, Lei de Snell, vergência e difração.',
      exports: ['lei_snell','ampliacao_lente','vergencia','distancia_focal','angulo_critico','comprimento_onda_luz','frequencia_luz','energia_foton_optica','difracao_grade','indice_refracao'],
      functions: [
        { name: 'lei_snell', params: 'n1, theta1, n2', desc: 'θ2 = arcsin(n1×sin(θ1)/n2)°' },
        { name: 'ampliacao_lente', params: 'di, do', desc: 'M = -di / do' },
        { name: 'vergencia', params: 'f', desc: 'V = 1/f (dioptrias)' },
        { name: 'distancia_focal', params: 'do, di', desc: '1/f = 1/do + 1/di' },
        { name: 'angulo_critico', params: 'n1, n2', desc: 'θc = arcsin(n2/n1)°' },
        { name: 'comprimento_onda_luz', params: 'f', desc: 'λ = c / f (m)' },
        { name: 'frequencia_luz', params: 'lambda', desc: 'f = c / λ (Hz)' },
        { name: 'energia_foton_optica', params: 'f', desc: 'E = h × f (J)' },
        { name: 'difracao_grade', params: 'd, m, lambda', desc: 'θ = arcsin(m×λ/d)°' },
        { name: 'indice_refracao', params: 'v', desc: 'n = c / v' },
      ],
      jsCode: `function lei_snell(n1, theta1, n2) { return Math.asin(n1 * Math.sin(theta1 * Math.PI / 180) / n2) * 180 / Math.PI; }
function ampliacao_lente(di, do_) { return -di / do_; }
function vergencia(f) { return 1 / f; }
function distancia_focal(do_, di) { return 1 / (1 / do_ + 1 / di); }
function angulo_critico(n1, n2) { return Math.asin(n2 / n1) * 180 / Math.PI; }
function comprimento_onda_luz(f) { return 3e8 / f; }
function frequencia_luz(lambda) { return 3e8 / lambda; }
function energia_foton_optica(f) { return 6.626e-34 * f; }
function difracao_grade(d, m, lambda) { return Math.asin(m * lambda / d) * 180 / Math.PI; }
function indice_refracao(v) { return 3e8 / v; }`,
      example: `importe fisica_optica\n\nexecute lei_snell(1, 30, 1.5)\nexecute vergencia(0.25)\nexecute angulo_critico(1.5, 1)\nexecute indice_refracao(2e8)\napresente distancia_focal(30, 60) em destaque`,
    },

    // ── fisica_fluidos ───────────────────────────────────────
    fisica_fluidos: {
      key: 'fisica_fluidos',
      title: '💧 Mecânica dos Fluidos',
      description: 'Pressão hidrostática, empuxo, Bernoulli, vazão, viscosidade, Reynolds e continuidade.',
      exports: ['pressao_fluido','empuxo','bernoulli_velocidade','vazao','numero_reynolds','pressao_absoluta','tensao_superficial','velocidade_terminal','forca_viscosa','continuidade'],
      functions: [
        { name: 'pressao_fluido', params: 'rho, h', desc: 'P = ρ × g × h (Pa)' },
        { name: 'empuxo', params: 'rho, v', desc: 'E = ρ × V × g' },
        { name: 'bernoulli_velocidade', params: 'p1, p2, rho, v1', desc: 'v2 via equação de Bernoulli' },
        { name: 'vazao', params: 'a, v', desc: 'Q = A × v (m³/s)' },
        { name: 'numero_reynolds', params: 'rho, v, d, mi', desc: 'Re = ρvd/μ' },
        { name: 'pressao_absoluta', params: 'p_rel', desc: 'P = Patm + P_relativa' },
        { name: 'tensao_superficial', params: 'f, l', desc: 'γ = F / L (N/m)' },
        { name: 'velocidade_terminal', params: 'm, rho_f, a, cd', desc: 'vt = √(2mg/(ρ×A×Cd))' },
        { name: 'forca_viscosa', params: 'mi, area, dv, dy', desc: 'F = μ × A × (dv/dy)' },
        { name: 'continuidade', params: 'a1, v1, a2', desc: 'v2 = A1×v1/A2' },
      ],
      jsCode: `function pressao_fluido(rho, h) { return rho * 9.81 * h; }
function empuxo(rho, v) { return rho * v * 9.81; }
function bernoulli_velocidade(p1, p2, rho, v1) { return Math.sqrt(v1*v1 + 2*(p1-p2)/rho); }
function vazao(a, v) { return a * v; }
function numero_reynolds(rho, v, d, mi) { return rho * v * d / mi; }
function pressao_absoluta(p_rel) { return 101325 + p_rel; }
function tensao_superficial(f, l) { return f / l; }
function velocidade_terminal(m, rho_f, a, cd) { return Math.sqrt(2 * m * 9.81 / (rho_f * a * cd)); }
function forca_viscosa(mi, area, dv, dy) { return mi * area * dv / dy; }
function continuidade(a1, v1, a2) { return a1 * v1 / a2; }`,
      example: `importe fisica_fluidos\n\nexecute pressao_fluido(1000, 10)\nexecute empuxo(1000, 0.5)\nexecute numero_reynolds(1000, 2, 0.05, 0.001)\nexecute continuidade(0.01, 5, 0.005)\napresente bernoulli_velocidade(200000, 100000, 1.2, 10) em destaque`,
    },

    // ── fisica_gravitacao ────────────────────────────────────
    fisica_gravitacao: {
      key: 'fisica_gravitacao',
      title: '🪐 Gravitação',
      description: 'Lei da gravitação universal, campo gravitacional, energia potencial gravitacional, órbitas, velocidade de escape e raio de Schwarzschild.',
      exports: ['forca_gravitacional','campo_gravitacional','energia_pot_grav','velocidade_escape_grav','periodo_orbital_grav','velocidade_orbital','altitude_orbital','raio_schwarzschild','forca_mare','aceleracao_gravidade_local'],
      functions: [
        { name: 'forca_gravitacional', params: 'm1, m2, r', desc: 'F = G×m1×m2/r²' },
        { name: 'campo_gravitacional', params: 'm, r', desc: 'g = G×M/r²' },
        { name: 'energia_pot_grav', params: 'm1, m2, r', desc: 'U = -G×m1×m2/r' },
        { name: 'velocidade_escape_grav', params: 'm, r', desc: 'v = √(2GM/r)' },
        { name: 'periodo_orbital_grav', params: 'r_ua', desc: 'T em anos (3ª Lei de Kepler)' },
        { name: 'velocidade_orbital', params: 'm, r', desc: 'v = √(GM/r)' },
        { name: 'altitude_orbital', params: 't', desc: 'Raio orbital a partir do período (s)' },
        { name: 'raio_schwarzschild', params: 'm', desc: 'rs = 2GM/c²' },
        { name: 'forca_mare', params: 'm, M, r, dr', desc: 'Força de maré diferencial' },
        { name: 'aceleracao_gravidade_local', params: 'm, r', desc: 'g = GM/r² na superfície' },
      ],
      jsCode: `var _GC = 6.674e-11;
function forca_gravitacional(m1, m2, r) { return _GC * m1 * m2 / (r * r); }
function campo_gravitacional(m, r) { return _GC * m / (r * r); }
function energia_pot_grav(m1, m2, r) { return -_GC * m1 * m2 / r; }
function velocidade_escape_grav(m, r) { return Math.sqrt(2 * _GC * m / r); }
function periodo_orbital_grav(r_ua) { return Math.pow(r_ua, 1.5); }
function velocidade_orbital(m, r) { return Math.sqrt(_GC * m / r); }
function altitude_orbital(t) { return Math.pow(_GC * 5.972e24 * t * t / (4 * Math.PI * Math.PI), 1/3); }
function raio_schwarzschild(m) { return 2 * _GC * m / (9e16); }
function forca_mare(m, M, r, dr) { return 2 * _GC * M * m * dr / (r * r * r); }
function aceleracao_gravidade_local(m, r) { return _GC * m / (r * r); }`,
      example: `importe fisica_gravitacao\n\nexecute forca_gravitacional(5.972e24, 7.342e22, 3.844e8)\nexecute velocidade_escape_grav(5.972e24, 6.371e6)\nexecute velocidade_orbital(5.972e24, 4.2164e7)\nexecute raio_schwarzschild(1.989e30)\napresente campo_gravitacional(5.972e24, 6.371e6) em destaque`,
    },

    // ── fisica_eletromagnetismo ──────────────────────────────
    fisica_eletromagnetismo: {
      key: 'fisica_eletromagnetismo',
      title: '🧲 Eletromagnetismo',
      description: 'Lei de Faraday, força de Lorentz, campo magnético, indução eletromagnética e ondas EM.',
      exports: ['forca_lorentz','campo_magnetico_fio','forca_entre_fios','fluxo_magnetico','fem_induzida','energia_campo_magnetico','campo_solenoide','forca_espira','velocidade_onda_em','impedancia_onda'],
      functions: [
        { name: 'forca_lorentz', params: 'q, v, b', desc: 'F = q × v × B' },
        { name: 'campo_magnetico_fio', params: 'i, r', desc: 'B = μ0×I/(2πr)' },
        { name: 'forca_entre_fios', params: 'i1, i2, d, l', desc: 'F/L entre fios paralelos' },
        { name: 'fluxo_magnetico', params: 'b, a', desc: 'Φ = B × A' },
        { name: 'fem_induzida', params: 'dphi, dt', desc: 'ε = -ΔΦ/Δt (Faraday)' },
        { name: 'energia_campo_magnetico', params: 'b', desc: 'u = B²/(2μ0)' },
        { name: 'campo_solenoide', params: 'n, i', desc: 'B = μ0 × n × I' },
        { name: 'forca_espira', params: 'i, a, b', desc: 'F = I × A × B' },
        { name: 'velocidade_onda_em', params: 'eps, mu', desc: 'v = 1/√(εμ)' },
        { name: 'impedancia_onda', params: 'mu, eps', desc: 'Z = √(μ/ε)' },
      ],
      jsCode: `var _mu0 = 1.2566e-6;
function forca_lorentz(q, v, b) { return q * v * b; }
function campo_magnetico_fio(i, r) { return _mu0 * i / (2 * Math.PI * r); }
function forca_entre_fios(i1, i2, d, l) { return _mu0 * i1 * i2 * l / (2 * Math.PI * d); }
function fluxo_magnetico(b, a) { return b * a; }
function fem_induzida(dphi, dt) { return -dphi / dt; }
function energia_campo_magnetico(b) { return b * b / (2 * _mu0); }
function campo_solenoide(n, i) { return _mu0 * n * i; }
function forca_espira(i, a, b) { return i * a * b; }
function velocidade_onda_em(eps, mu) { return 1 / Math.sqrt(eps * mu); }
function impedancia_onda(mu, eps) { return Math.sqrt(mu / eps); }`,
      example: `importe fisica_eletromagnetismo\n\nexecute forca_lorentz(1.6e-19, 1e6, 0.5)\nexecute campo_magnetico_fio(10, 0.05)\nexecute fluxo_magnetico(0.3, 0.02)\nexecute fem_induzida(0.05, 0.01)\napresente campo_solenoide(1000, 5) em destaque`,
    },

    // ── fisica_moderna ───────────────────────────────────────
    fisica_moderna: {
      key: 'fisica_moderna',
      title: '⚛️ Física Moderna',
      description: 'Relatividade especial, efeito fotoelétrico, radioatividade, dualidade onda-partícula e física quântica básica.',
      exports: ['energia_foton','efeito_fotoeletrico','comprimento_de_broglie','dilatacao_tempo','contracao_comprimento','energia_repouso','meia_vida','atividade_radioativa','energia_ligacao','equivalencia_massa_energia'],
      functions: [
        { name: 'energia_foton', params: 'f', desc: 'E = h × f (J)' },
        { name: 'efeito_fotoeletrico', params: 'f, phi', desc: 'Ec = h×f - φ' },
        { name: 'comprimento_de_broglie', params: 'm, v', desc: 'λ = h/(m×v)' },
        { name: 'dilatacao_tempo', params: 't0, v', desc: 'Δt = t0 / √(1-v²/c²)' },
        { name: 'contracao_comprimento', params: 'l0, v', desc: 'L = L0 × √(1-v²/c²)' },
        { name: 'energia_repouso', params: 'm', desc: 'E = mc²' },
        { name: 'meia_vida', params: 't, t12', desc: 'N/N0 = (1/2)^(t/t½)' },
        { name: 'atividade_radioativa', params: 'n0, t12', desc: 'A = ln(2)/t½ × N0' },
        { name: 'energia_ligacao', params: 'dm', desc: 'E = Δm × c² (J)' },
        { name: 'equivalencia_massa_energia', params: 'e', desc: 'm = E / c²' },
      ],
      jsCode: `var _hP = 6.626e-34; var _cP = 3e8;
function energia_foton(f) { return _hP * f; }
function efeito_fotoeletrico(f, phi) { return _hP * f - phi; }
function comprimento_de_broglie(m, v) { return _hP / (m * v); }
function dilatacao_tempo(t0, v) { return t0 / Math.sqrt(1 - v*v/(_cP*_cP)); }
function contracao_comprimento(l0, v) { return l0 * Math.sqrt(1 - v*v/(_cP*_cP)); }
function energia_repouso(m) { return m * _cP * _cP; }
function meia_vida(t, t12) { return Math.pow(0.5, t / t12); }
function atividade_radioativa(n0, t12) { return (Math.LN2 / t12) * n0; }
function energia_ligacao(dm) { return dm * _cP * _cP; }
function equivalencia_massa_energia(e) { return e / (_cP * _cP); }`,
      example: `importe fisica_moderna\n\nexecute energia_foton(6e14)\nexecute comprimento_de_broglie(9.109e-31, 1e6)\nexecute dilatacao_tempo(1, 2.6e8)\nexecute meia_vida(10, 5)\napresente energia_repouso(1) em destaque`,
    },

    // ── formulas_financas ────────────────────────────────────
    formulas_financas: {
      key: 'formulas_financas',
      selo: 'recomendada',
      title: '💰 Fórmulas Financeiras',
      description: 'ROI, payback, markup, depreciação, margem de lucro, valor presente e futuro, taxa real e ponto de equilíbrio.',
      exports: ['roi','payback','depreciacao_linear','markup','ponto_equilibrio','margem_lucro','lucro_liquido','taxa_real','valor_futuro','valor_presente'],
      functions: [
        { name: 'roi', params: 'ganho, investimento', desc: 'Retorno sobre investimento (%)' },
        { name: 'payback', params: 'investimento, fluxo_mensal', desc: 'Meses para recuperar o investimento' },
        { name: 'depreciacao_linear', params: 'valor, residual, anos', desc: 'Depreciação anual linear' },
        { name: 'markup', params: 'custo, margem', desc: 'Preço com margem (% sobre custo)' },
        { name: 'ponto_equilibrio', params: 'custos_fixos, preco, custo_var', desc: 'Unidades para cobrir custos fixos' },
        { name: 'margem_lucro', params: 'receita, custo', desc: 'Margem de lucro (%)' },
        { name: 'lucro_liquido', params: 'receita, custo', desc: 'Lucro = receita - custo' },
        { name: 'taxa_real', params: 'nominal, inflacao', desc: 'Taxa real descontada da inflação (%)' },
        { name: 'valor_futuro', params: 'vp, taxa, n', desc: 'VF = VP × (1+taxa)^n' },
        { name: 'valor_presente', params: 'vf, taxa, n', desc: 'VP = VF / (1+taxa)^n' },
      ],
      jsCode: `function roi(ganho, investimento) { return ((ganho - investimento) / investimento) * 100; }
function payback(investimento, fluxo_mensal) { return investimento / fluxo_mensal; }
function depreciacao_linear(valor, residual, anos) { return (valor - residual) / anos; }
function markup(custo, margem) { return custo * (1 + margem / 100); }
function ponto_equilibrio(custos_fixos, preco, custo_var) { return custos_fixos / (preco - custo_var); }
function margem_lucro(receita, custo) { return ((receita - custo) / receita) * 100; }
function lucro_liquido(receita, custo) { return receita - custo; }
function taxa_real(nominal, inflacao) { return ((1 + nominal) / (1 + inflacao) - 1) * 100; }
function valor_futuro(vp, taxa, n) { return vp * Math.pow(1 + taxa, n); }
function valor_presente(vf, taxa, n) { return vf / Math.pow(1 + taxa, n); }`,
      example: `importe formulas_financas\n\nexecute roi(15000, 10000)\nexecute payback(50000, 4500)\nexecute markup(80, 40)\napresente margem_lucro(12000, 8000) em apresentação`,
    },

    // ── conversoes ───────────────────────────────────────────
    conversoes: {
      key: 'conversoes',
      selo: 'honrosa',
      title: '🔄 Conversões de Unidades',
      description: 'Temperatura, distância, peso, volume e ângulos. Converta entre sistemas métrico, imperial e escalas de temperatura.',
      exports: ['celsius_para_fahrenheit','fahrenheit_para_celsius','celsius_para_kelvin','kelvin_para_celsius','km_para_milhas','milhas_para_km','kg_para_libras','libras_para_kg','metros_para_pes','pes_para_metros','graus_para_radianos','radianos_para_graus','litros_para_galoes','galoes_para_litros'],
      functions: [
        { name: 'celsius_para_fahrenheit', params: 'c', desc: '°C → °F' },
        { name: 'fahrenheit_para_celsius', params: 'f', desc: '°F → °C' },
        { name: 'celsius_para_kelvin', params: 'c', desc: '°C → K' },
        { name: 'kelvin_para_celsius', params: 'k', desc: 'K → °C' },
        { name: 'km_para_milhas', params: 'km', desc: 'Quilômetros → Milhas' },
        { name: 'milhas_para_km', params: 'mi', desc: 'Milhas → Quilômetros' },
        { name: 'kg_para_libras', params: 'kg', desc: 'Quilogramas → Libras' },
        { name: 'libras_para_kg', params: 'lb', desc: 'Libras → Quilogramas' },
        { name: 'metros_para_pes', params: 'm', desc: 'Metros → Pés' },
        { name: 'pes_para_metros', params: 'ft', desc: 'Pés → Metros' },
        { name: 'graus_para_radianos', params: 'g', desc: 'Graus → Radianos' },
        { name: 'radianos_para_graus', params: 'r', desc: 'Radianos → Graus' },
        { name: 'litros_para_galoes', params: 'l', desc: 'Litros → Galões (US)' },
        { name: 'galoes_para_litros', params: 'g', desc: 'Galões (US) → Litros' },
      ],
      jsCode: `function celsius_para_fahrenheit(c) { return c * 9 / 5 + 32; }
function fahrenheit_para_celsius(f) { return (f - 32) * 5 / 9; }
function celsius_para_kelvin(c) { return c + 273.15; }
function kelvin_para_celsius(k) { return k - 273.15; }
function km_para_milhas(km) { return km * 0.621371; }
function milhas_para_km(mi) { return mi * 1.60934; }
function kg_para_libras(kg) { return kg * 2.20462; }
function libras_para_kg(lb) { return lb * 0.453592; }
function metros_para_pes(m) { return m * 3.28084; }
function pes_para_metros(ft) { return ft * 0.3048; }
function graus_para_radianos(g) { return g * Math.PI / 180; }
function radianos_para_graus(r) { return r * 180 / Math.PI; }
function litros_para_galoes(l) { return l * 0.264172; }
function galoes_para_litros(g) { return g * 3.78541; }`,
      example: `importe conversoes\n\nexecute celsius_para_fahrenheit(37)\nexecute km_para_milhas(42.195)\nexecute kg_para_libras(80)\napresente graus_para_radianos(180) em dados`,
    },

    // ── estatistica_avancada ─────────────────────────────────
    estatistica_avancada: {
      key: 'estatistica_avancada',
      selo: 'recomendada',
      title: '📊 Estatística Avançada',
      description: 'Variância, covariância, correlação, z-score, erro padrão e intervalo de confiança. Complementa o módulo de estatísticas nativo.',
      exports: ['variancia','desvio_padrao_lib','coeficiente_variacao','zscore','intervalo_confianca','erro_padrao','covariancia','correlacao'],
      functions: [
        { name: 'variancia', params: 'arr', desc: 'Variância amostral (N-1)' },
        { name: 'desvio_padrao_lib', params: 'arr', desc: 'Desvio padrão amostral' },
        { name: 'coeficiente_variacao', params: 'arr', desc: 'CV = (desvio / média) × 100%' },
        { name: 'zscore', params: 'valor, media, dp', desc: 'Z-score: (valor - média) / desvio' },
        { name: 'intervalo_confianca', params: 'media, dp, n', desc: 'Margem de erro IC 95% (±)' },
        { name: 'erro_padrao', params: 'dp, n', desc: 'Erro padrão = dp / √n' },
        { name: 'covariancia', params: 'arr1, arr2', desc: 'Covariância amostral entre duas séries' },
        { name: 'correlacao', params: 'arr1, arr2', desc: 'Coeficiente de correlação de Pearson' },
      ],
      jsCode: `function variancia(arr) { var vals = Array.isArray(arr) ? arr : Object.values(arr); var nums = vals.map(Number).filter(function(v){return !isNaN(v);}); var mean = nums.reduce(function(a,b){return a+b;},0) / nums.length; return nums.reduce(function(acc,v){return acc + Math.pow(v - mean, 2);},0) / (nums.length - 1); }
function desvio_padrao_lib(arr) { return Math.sqrt(variancia(arr)); }
function coeficiente_variacao(arr) { var vals = Array.isArray(arr) ? arr : Object.values(arr); var nums = vals.map(Number).filter(function(v){return !isNaN(v);}); var mean = nums.reduce(function(a,b){return a+b;},0) / nums.length; return (Math.sqrt(variancia(arr)) / mean) * 100; }
function zscore(valor, media, dp) { return (valor - media) / dp; }
function intervalo_confianca(media, dp, n) { return 1.96 * dp / Math.sqrt(n); }
function erro_padrao(dp, n) { return dp / Math.sqrt(n); }
function covariancia(arr1, arr2) { var a = (Array.isArray(arr1) ? arr1 : Object.values(arr1)).map(Number); var b = (Array.isArray(arr2) ? arr2 : Object.values(arr2)).map(Number); var n = Math.min(a.length, b.length); var ma = a.reduce(function(s,v){return s+v;},0)/n; var mb = b.reduce(function(s,v){return s+v;},0)/n; var sum = 0; for (var i = 0; i < n; i++) sum += (a[i]-ma)*(b[i]-mb); return sum/(n-1); }
function correlacao(arr1, arr2) { var cov = covariancia(arr1, arr2); return cov / (Math.sqrt(variancia(arr1)) * Math.sqrt(variancia(arr2))); }`,
      example: `importe estatistica_avancada\n\ndefina notas como 7.5, 8.0, 6.5, 9.0, 7.0, 8.5\nexecute variancia(notas)\nexecute desvio_padrao_lib(notas)\nexecute coeficiente_variacao(notas)\nexecute zscore(9.0, 7.75, 0.87)`,
    },

    // ── matematica ───────────────────────────────────────────
    matematica: {
      key: 'matematica',
      selo: 'estrelada',
      title: '🔢 Matemática',
      description: 'Fatorial, fibonacci, combinação, permutação, MDC, MMC, trigonometria, logaritmos, arredondamento e constantes.',
      exports: ['fatorial','fibonacci','combinacao','permutacao','mdc','mmc','seno','cosseno','tangente','logaritmo','logaritmo_natural','absoluto','arredondar','pi_const','euler_const','hipotenusa'],
      functions: [
        { name: 'fatorial', params: 'n', desc: 'n! (fatorial iterativo)' },
        { name: 'fibonacci', params: 'n', desc: 'N-ésimo número de Fibonacci' },
        { name: 'combinacao', params: 'n, k', desc: 'C(n,k) = n! / (k! × (n-k)!)' },
        { name: 'permutacao', params: 'n, k', desc: 'P(n,k) = n! / (n-k)!' },
        { name: 'mdc', params: 'a, b', desc: 'Máximo divisor comum' },
        { name: 'mmc', params: 'a, b', desc: 'Mínimo múltiplo comum' },
        { name: 'seno', params: 'graus', desc: 'Seno (entrada em graus)' },
        { name: 'cosseno', params: 'graus', desc: 'Cosseno (entrada em graus)' },
        { name: 'tangente', params: 'graus', desc: 'Tangente (entrada em graus)' },
        { name: 'logaritmo', params: 'x', desc: 'Logaritmo base 10' },
        { name: 'logaritmo_natural', params: 'x', desc: 'Logaritmo natural (ln)' },
        { name: 'absoluto', params: 'x', desc: 'Valor absoluto' },
        { name: 'arredondar', params: 'x, casas', desc: 'Arredonda para N casas decimais' },
        { name: 'pi_const', params: '', desc: 'Constante π' },
        { name: 'euler_const', params: '', desc: 'Constante e (Euler)' },
        { name: 'hipotenusa', params: 'a, b', desc: '√(a² + b²)' },
      ],
      jsCode: `function fatorial(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
function fibonacci(n) { if (n <= 1) return n; var a = 0, b = 1; for (var i = 2; i <= n; i++) { var t = a + b; a = b; b = t; } return b; }
function combinacao(n, k) { return fatorial(n) / (fatorial(k) * fatorial(n - k)); }
function permutacao(n, k) { return fatorial(n) / fatorial(n - k); }
function mdc(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
function mmc(a, b) { return Math.abs(a * b) / mdc(a, b); }
function seno(graus) { return Math.sin(graus * Math.PI / 180); }
function cosseno(graus) { return Math.cos(graus * Math.PI / 180); }
function tangente(graus) { return Math.tan(graus * Math.PI / 180); }
function logaritmo(x) { return Math.log10(x); }
function logaritmo_natural(x) { return Math.log(x); }
function absoluto(x) { return Math.abs(x); }
function arredondar(x, casas) { var f = Math.pow(10, casas || 0); return Math.round(x * f) / f; }
function pi_const() { return Math.PI; }
function euler_const() { return Math.E; }
function hipotenusa(a, b) { return Math.sqrt(a * a + b * b); }`,
      example: `importe matematica\n\nexecute fatorial(10)\nexecute fibonacci(15)\nexecute combinacao(10, 3)\nexecute seno(30)\nexecute hipotenusa(3, 4)`,
    },

    // ── monte_carlo ──────────────────────────────────────────
    monte_carlo: {
      key: 'monte_carlo',
      title: '🎲 Monte Carlo',
      description: 'Simulações prontas: estimativa de π, lançamento de dados, bootstrap de média, probabilidade de evento e caminhada aleatória.',
      exports: ['simular_pi','simular_dado','bootstrap_media','probabilidade_evento','caminhada_aleatoria'],
      functions: [
        { name: 'simular_pi', params: 'n', desc: 'Estima π com N pontos aleatórios' },
        { name: 'simular_dado', params: 'n, lados', desc: 'Lança dado N vezes, retorna array' },
        { name: 'bootstrap_media', params: 'arr, n', desc: 'N reamostragens da média do array' },
        { name: 'probabilidade_evento', params: 'taxa, tentativas', desc: 'P de pelo menos 1 sucesso' },
        { name: 'caminhada_aleatoria', params: 'passos', desc: 'Random walk de N passos, retorna trajetória' },
      ],
      jsCode: `function simular_pi(n) { var dentro = 0; for (var i = 0; i < n; i++) { var x = Math.random(), y = Math.random(); if (x*x + y*y <= 1) dentro++; } return 4 * dentro / n; }
function simular_dado(n, lados) { var r = []; for (var i = 0; i < n; i++) r.push(Math.floor(Math.random() * (lados || 6)) + 1); return r; }
function bootstrap_media(arr, n) { var vals = Array.isArray(arr) ? arr : Object.values(arr); var nums = vals.map(Number).filter(function(v){return !isNaN(v);}); var medias = []; for (var i = 0; i < n; i++) { var sum = 0; for (var j = 0; j < nums.length; j++) sum += nums[Math.floor(Math.random() * nums.length)]; medias.push(sum / nums.length); } return medias; }
function probabilidade_evento(taxa, tentativas) { return 1 - Math.pow(1 - taxa, tentativas); }
function caminhada_aleatoria(passos) { var pos = 0; var traj = [0]; for (var i = 0; i < passos; i++) { pos += Math.random() < 0.5 ? 1 : -1; traj.push(pos); } return traj; }`,
      example: `importe monte_carlo\n\nexecute simular_pi(10000)\ndefina lancamentos como rodar(execute simular_dado(100, 6))\napresente lancamentos em dados\nexecute probabilidade_evento(0.05, 50)`,
    },

    // ── formulas_quimica (META) ──────────────────────────────
    formulas_quimica: {
      key: 'formulas_quimica',
      title: '⚗️ Química Completa',
      description: 'Meta-biblioteca que importa todas as sub-bibliotecas de química: soluções, gases, termoquímica, química orgânica e nuclear.',
      exports: [],
      functions: [],
      jsCode: '',
      example: `importe formulas_quimica\n\nexecute ph(0.001)\nexecute lei_van_der_waals(1, 0.0224, 0.3640, 0.04267, 273)\nexecute entalpia_reacao(200, 150)\nexecute meia_vida_quimica(20, 5)`,
      dependencies: ['quimica_solucoes', 'quimica_gases', 'quimica_termica', 'quimica_organica', 'quimica_nuclear'],
    },

    // ── quimica_solucoes ─────────────────────────────────────
    quimica_solucoes: {
      key: 'quimica_solucoes',
      selo: 'recomendada',
      title: '🧪 Soluções Químicas',
      description: 'Concentração molar, diluição, pH, pOH, titulação, tampão, solubilidade e propriedades coligativas.',
      exports: ['concentracao_molar','diluicao','ph','poh','ph_tampao','titulacao_volume','solubilidade_temp','pressao_osmotica','elevacao_ebulicao','abaixamento_ponto_fusao'],
      functions: [
        { name: 'concentracao_molar', params: 'n, v', desc: 'M = n / V (mol/L)' },
        { name: 'diluicao', params: 'c1, v1, v2', desc: 'C2 = C1×V1/V2' },
        { name: 'ph', params: 'c_h', desc: 'pH = -log[H⁺]' },
        { name: 'poh', params: 'c_oh', desc: 'pOH = -log[OH⁻]' },
        { name: 'ph_tampao', params: 'pka, ca, cb', desc: 'Henderson-Hasselbalch: pH = pKa + log(Cb/Ca)' },
        { name: 'titulacao_volume', params: 'c1, v1, c2', desc: 'V2 = C1×V1/C2' },
        { name: 'solubilidade_temp', params: 's0, kd, dt', desc: 'Variação de solubilidade com T' },
        { name: 'pressao_osmotica', params: 'c, t', desc: 'π = C × R × T (atm)' },
        { name: 'elevacao_ebulicao', params: 'kb, m', desc: 'ΔTb = Kb × m' },
        { name: 'abaixamento_ponto_fusao', params: 'kf, m', desc: 'ΔTf = Kf × m' },
      ],
      jsCode: `function concentracao_molar(n, v) { return n / v; }
function diluicao(c1, v1, v2) { return c1 * v1 / v2; }
function ph(c_h) { return -Math.log10(c_h); }
function poh(c_oh) { return -Math.log10(c_oh); }
function ph_tampao(pka, ca, cb) { return pka + Math.log10(cb / ca); }
function titulacao_volume(c1, v1, c2) { return c1 * v1 / c2; }
function solubilidade_temp(s0, kd, dt) { return s0 * Math.exp(kd * dt); }
function pressao_osmotica(c, t) { return c * 0.08206 * t; }
function elevacao_ebulicao(kb, m) { return kb * m; }
function abaixamento_ponto_fusao(kf, m) { return kf * m; }`,
      example: `importe quimica_solucoes\n\nexecute ph(0.001)\nexecute ph_tampao(4.75, 0.1, 0.1)\nexecute titulacao_volume(0.1, 25, 0.05)\nexecute pressao_osmotica(0.9, 310)\napresente elevacao_ebulicao(0.512, 1) em destaque`,
    },

    // ── quimica_gases ────────────────────────────────────────
    quimica_gases: {
      key: 'quimica_gases',
      title: '💨 Gases',
      description: 'Lei dos gases ideais, misturas de Dalton, difusão de Graham, Van der Waals e velocidade média das moléculas.',
      exports: ['lei_gases_ideais_q','pressao_parcial','lei_graham','lei_van_der_waals','velocidade_media_molecular','energia_cinetica_media','graus_liberdade','compressibilidade','densidade_gas','fator_z'],
      functions: [
        { name: 'lei_gases_ideais_q', params: 'n, t, v', desc: 'P = nRT/V (atm)' },
        { name: 'pressao_parcial', params: 'x, p_total', desc: 'Pi = Xi × P_total (Dalton)' },
        { name: 'lei_graham', params: 'm1, m2', desc: 'Razão de difusão r1/r2 = √(M2/M1)' },
        { name: 'lei_van_der_waals', params: 'n, v, a, b, t', desc: 'P real (a, b = constantes do gás)' },
        { name: 'velocidade_media_molecular', params: 'm_molar, t', desc: 'v_med = √(8RT/(πM))' },
        { name: 'energia_cinetica_media', params: 't', desc: 'Ec = (3/2)kT' },
        { name: 'graus_liberdade', params: 'atomos', desc: 'f = 3N (mono), 5 (di), 6 (poli)' },
        { name: 'compressibilidade', params: 'p, v, n, t', desc: 'Z = PV/(nRT)' },
        { name: 'densidade_gas', params: 'm_molar, p, t', desc: 'ρ = PM/(RT) g/L' },
        { name: 'fator_z', params: 'p, v_m, t', desc: 'Z = PVm/RT' },
      ],
      jsCode: `function lei_gases_ideais_q(n, t, v) { return n * 0.08206 * t / v; }
function pressao_parcial(x, p_total) { return x * p_total; }
function lei_graham(m1, m2) { return Math.sqrt(m2 / m1); }
function lei_van_der_waals(n, v, a, b, t) { return (n * 0.08206 * t / (v - n * b)) - a * n * n / (v * v); }
function velocidade_media_molecular(m_molar, t) { return Math.sqrt(8 * 8.314 * t / (Math.PI * m_molar / 1000)); }
function energia_cinetica_media(t) { return 1.5 * 1.381e-23 * t; }
function graus_liberdade(atomos) { return atomos === 1 ? 3 : atomos === 2 ? 5 : 6; }
function compressibilidade(p, v, n, t) { return p * v / (n * 0.08206 * t); }
function densidade_gas(m_molar, p, t) { return p * m_molar / (0.08206 * t); }
function fator_z(p, v_m, t) { return p * v_m / (0.08206 * t); }`,
      example: `importe quimica_gases\n\nexecute lei_gases_ideais_q(1, 273, 22.4)\nexecute lei_graham(2, 32)\nexecute lei_van_der_waals(1, 22.4, 0.3640, 0.04267, 273)\nexecute velocidade_media_molecular(2, 300)\napresente densidade_gas(44, 1, 273) em destaque`,
    },

    // ── quimica_termica ──────────────────────────────────────
    quimica_termica: {
      key: 'quimica_termica',
      title: '🔥 Termoquímica',
      description: 'Entalpia de reação, Lei de Hess, energia de Gibbs, entropia, calorimetria e energia de ligação.',
      exports: ['entalpia_reacao','lei_hess','energia_gibbs','variacao_entropia','calor_calorimetro','energia_ativacao','arrhenius','energia_ligacao_media','entalpia_formacao','espontaneidade'],
      functions: [
        { name: 'entalpia_reacao', params: 'h_prod, h_reag', desc: 'ΔH = ΣH(prod) - ΣH(reag)' },
        { name: 'lei_hess', params: 'h1, h2', desc: 'ΔH_total = ΔH1 + ΔH2' },
        { name: 'energia_gibbs', params: 'dh, t, ds', desc: 'ΔG = ΔH - TΔS' },
        { name: 'variacao_entropia', params: 'q, t', desc: 'ΔS = Q_rev / T' },
        { name: 'calor_calorimetro', params: 'c, m, dt', desc: 'Q = c × m × ΔT' },
        { name: 'energia_ativacao', params: 'k1, k2, t1, t2', desc: 'Ea via van\'t Hoff' },
        { name: 'arrhenius', params: 'a, ea, t', desc: 'k = A × e^(-Ea/RT)' },
        { name: 'energia_ligacao_media', params: 'dh_ligacoes', desc: 'ΔH ≈ Σ(ligações quebradas) - Σ(formadas)' },
        { name: 'entalpia_formacao', params: 'dh_elem', desc: 'ΔHf° da substância' },
        { name: 'espontaneidade', params: 'dg', desc: 'Retorna "espontânea", "não-espontânea" ou "equilíbrio"' },
      ],
      jsCode: `function entalpia_reacao(h_prod, h_reag) { return h_prod - h_reag; }
function lei_hess(h1, h2) { return h1 + h2; }
function energia_gibbs(dh, t, ds) { return dh - t * ds; }
function variacao_entropia(q, t) { return q / t; }
function calor_calorimetro(c, m, dt) { return c * m * dt; }
function energia_ativacao(k1, k2, t1, t2) { return -8.314 * Math.log(k2/k1) / (1/t2 - 1/t1); }
function arrhenius(a, ea, t) { return a * Math.exp(-ea / (8.314 * t)); }
function energia_ligacao_media(dh_ligacoes) { return dh_ligacoes; }
function entalpia_formacao(dh_elem) { return dh_elem; }
function espontaneidade(dg) { if (dg < 0) return 'espontânea'; if (dg > 0) return 'não-espontânea'; return 'equilíbrio'; }`,
      example: `importe quimica_termica\n\nexecute entalpia_reacao(-393.5, -285.8)\nexecute energia_gibbs(-285800, 298, -163)\nexecute arrhenius(1e13, 50000, 300)\nexecute calor_calorimetro(4186, 0.1, 5)\napresente espontaneidade(-45000) em destaque`,
    },

    // ── quimica_organica ─────────────────────────────────────
    quimica_organica: {
      key: 'quimica_organica',
      title: '🧫 Química Orgânica',
      description: 'Propriedades de compostos orgânicos: ponto de ebulição estimado, massa molecular, grau de insaturação, polaridade e isômeros.',
      exports: ['grau_insaturacao','massa_molecular_organica','indice_octano','rendimento_reacao','pureza_amostra','fator_conversao_organico','numero_isomeros_alcano','ponto_ebulicao_estimado','solubilidade_organica','densidade_organica'],
      functions: [
        { name: 'grau_insaturacao', params: 'c, h, n, x', desc: 'IHD = (2C+2+N-H-X)/2' },
        { name: 'massa_molecular_organica', params: 'c, h, o, n', desc: 'MM = 12C + H + 16O + 14N' },
        { name: 'indice_octano', params: 'iso, normal', desc: 'IO = iso/(iso+normal) × 100' },
        { name: 'rendimento_reacao', params: 'real, teorico', desc: 'Rendimento = real/teórico × 100%' },
        { name: 'pureza_amostra', params: 'massa_pura, massa_total', desc: 'Pureza = pura/total × 100%' },
        { name: 'fator_conversao_organico', params: 'reagentes, produtos', desc: 'Conversão = produtos/reagentes × 100%' },
        { name: 'numero_isomeros_alcano', params: 'c', desc: 'Estimativa de isômeros para CnH(2n+2)' },
        { name: 'ponto_ebulicao_estimado', params: 'mm', desc: 'Estimativa de PE em °C por MM' },
        { name: 'solubilidade_organica', params: 'polaridade', desc: '1=polar(H2O), 0=apolar(hex) — retorna solvente ideal' },
        { name: 'densidade_organica', params: 'massa, volume', desc: 'd = m / V (g/mL)' },
      ],
      jsCode: `function grau_insaturacao(c, h, n, x) { return (2*c + 2 + (n||0) - (h||0) - (x||0)) / 2; }
function massa_molecular_organica(c, h, o, n) { return 12*(c||0) + 1*(h||0) + 16*(o||0) + 14*(n||0); }
function indice_octano(iso, normal) { return iso / (iso + normal) * 100; }
function rendimento_reacao(real, teorico) { return (real / teorico) * 100; }
function pureza_amostra(massa_pura, massa_total) { return (massa_pura / massa_total) * 100; }
function fator_conversao_organico(reagentes, produtos) { return (produtos / reagentes) * 100; }
function numero_isomeros_alcano(c) { var t=[1,1,1,1,2,3,5,9,18,35,75,159]; return c<=11?t[c-1]:Math.round(Math.exp(0.5*c)); }
function ponto_ebulicao_estimado(mm) { return -182 + 0.8 * mm; }
function solubilidade_organica(polaridade) { return polaridade ? 'água' : 'hexano/éter'; }
function densidade_organica(massa, volume) { return massa / volume; }`,
      example: `importe quimica_organica\n\nexecute grau_insaturacao(6, 6, 0, 0)\nexecute massa_molecular_organica(2, 6, 1, 0)\nexecute rendimento_reacao(18, 20)\nexecute numero_isomeros_alcano(6)\napresente ponto_ebulicao_estimado(78) em destaque`,
    },

    // ── quimica_nuclear ──────────────────────────────────────
    quimica_nuclear: {
      key: 'quimica_nuclear',
      title: '☢️ Química Nuclear',
      description: 'Meia-vida, decaimento radioativo, energia de ligação nuclear, fissão, fusão e dose de radiação.',
      exports: ['meia_vida_quimica','constante_decaimento','atividade_nuclear','energia_ligacao_nuclear','energia_fissao','defeito_massa','dose_equivalente','fator_radiacao','nucleons_restantes','tempo_para_fracionar'],
      functions: [
        { name: 'meia_vida_quimica', params: 't, t12', desc: 'N = N0 × (1/2)^(t/t½)' },
        { name: 'constante_decaimento', params: 't12', desc: 'λ = ln(2) / t½' },
        { name: 'atividade_nuclear', params: 'lambda, n', desc: 'A = λ × N (Bq)' },
        { name: 'energia_ligacao_nuclear', params: 'z, n, massa_atomica', desc: 'Eb via defeito de massa (MeV)' },
        { name: 'energia_fissao', params: 'dm_u', desc: 'E = Δm × 931.5 MeV' },
        { name: 'defeito_massa', params: 'z, n, massa_atomica', desc: 'Δm = Z×mp + N×mn - M' },
        { name: 'dose_equivalente', params: 'dose_gy, wr', desc: 'H = D × wR (Sv)' },
        { name: 'fator_radiacao', params: 'tipo', desc: 'wR: alfa=20, beta=1, gama=1, neutron=10' },
        { name: 'nucleons_restantes', params: 'n0, t, t12', desc: 'N = N0 × e^(-λt)' },
        { name: 'tempo_para_fracionar', params: 'fracao, t12', desc: 't = -t½ × log2(fração)' },
      ],
      jsCode: `function meia_vida_quimica(t, t12) { return Math.pow(0.5, t / t12); }
function constante_decaimento(t12) { return Math.LN2 / t12; }
function atividade_nuclear(lambda, n) { return lambda * n; }
function energia_ligacao_nuclear(z, n, massa_atomica) { var dm = z*1.00728 + n*1.00867 - massa_atomica; return dm * 931.5; }
function energia_fissao(dm_u) { return dm_u * 931.5; }
function defeito_massa(z, n, massa_atomica) { return z*1.00728 + n*1.00867 - massa_atomica; }
function dose_equivalente(dose_gy, wr) { return dose_gy * wr; }
function fator_radiacao(tipo) { var m={'alfa':20,'beta':1,'gama':1,'gamma':1,'neutron':10}; return m[tipo.toLowerCase()]||1; }
function nucleons_restantes(n0, t, t12) { return n0 * Math.exp(-Math.LN2/t12*t); }
function tempo_para_fracionar(fracao, t12) { return -t12 * Math.log2(fracao); }`,
      example: `importe quimica_nuclear\n\nexecute meia_vida_quimica(10, 5)\nexecute constante_decaimento(5730)\nexecute energia_fissao(0.186)\nexecute tempo_para_fracionar(0.125, 5730)\napresente energia_ligacao_nuclear(26, 30, 55.9349) em destaque`,
    },

    // ── formulas_biologia (META) ─────────────────────────────
    formulas_biologia: {
      key: 'formulas_biologia',
      title: '🧬 Biologia Completa',
      description: 'Meta-biblioteca que importa todas as sub-bibliotecas de biologia: genética, ecologia, fisiologia, microbiologia e evolução.',
      exports: [],
      functions: [],
      jsCode: '',
      example: `importe formulas_biologia\n\nexecute imc_bio(78, 1.75)\nexecute hardy_weinberg_p(0.3)\nexecute crescimento_bacteriano(100, 0.693, 5)\nexecute fitness_relativo(0.9, 1.0)`,
      dependencies: ['bio_fisiologia', 'bio_genetica', 'bio_ecologia', 'bio_microbiologia', 'bio_evolucao'],
    },

    // ── bio_fisiologia ───────────────────────────────────────
    bio_fisiologia: {
      key: 'bio_fisiologia',
      selo: 'recomendada',
      title: '🫀 Fisiologia Humana',
      description: 'IMC, taxa metabólica basal, débito cardíaco, VO2 máx, função renal, volume pulmonar e superfície corporal.',
      exports: ['imc_bio','taxa_metabolica_basal','frequencia_cardiaca_max','zona_cardiaca','agua_corporal','superficie_corporal','debito_cardiaco','vo2_max','taxa_filtracao_glomerular','volume_corrente'],
      functions: [
        { name: 'imc_bio', params: 'peso, altura', desc: 'IMC = kg / m²' },
        { name: 'taxa_metabolica_basal', params: 'peso, altura_cm, idade, sexo', desc: 'TMB Mifflin-St Jeor (sexo: 1=M, 0=F)' },
        { name: 'frequencia_cardiaca_max', params: 'idade', desc: 'FC máx = 220 - idade' },
        { name: 'zona_cardiaca', params: 'idade, intensidade', desc: 'FC alvo = FCmáx × intensidade%' },
        { name: 'agua_corporal', params: 'peso', desc: 'Água corporal ≈ 60% do peso (kg)' },
        { name: 'superficie_corporal', params: 'peso, altura_cm', desc: 'Du Bois (m²)' },
        { name: 'debito_cardiaco', params: 'fc, vs', desc: 'DC = FC × volume sistólico (mL/min)' },
        { name: 'vo2_max', params: 'fc_max, fc_rep, peso', desc: 'VO2 máx estimado (mL/kg/min)' },
        { name: 'taxa_filtracao_glomerular', params: 'creatinina, idade, sexo', desc: 'TFG (CKD-EPI simplificado)' },
        { name: 'volume_corrente', params: 'peso', desc: 'VC ≈ 7 mL/kg (L)' },
      ],
      jsCode: `function imc_bio(peso, altura) { return peso / (altura * altura); }
function taxa_metabolica_basal(peso, altura_cm, idade, sexo) { if (sexo===1) return 10*peso+6.25*altura_cm-5*idade+5; return 10*peso+6.25*altura_cm-5*idade-161; }
function frequencia_cardiaca_max(idade) { return 220 - idade; }
function zona_cardiaca(idade, intensidade) { return (220 - idade) * (intensidade / 100); }
function agua_corporal(peso) { return peso * 0.6; }
function superficie_corporal(peso, altura_cm) { return 0.007184 * Math.pow(peso, 0.425) * Math.pow(altura_cm, 0.725); }
function debito_cardiaco(fc, vs) { return fc * vs; }
function vo2_max(fc_max, fc_rep, peso) { return 15 * fc_max / fc_rep; }
function taxa_filtracao_glomerular(creatinina, idade, sexo) { var k=sexo?0.9:0.7; return 141*Math.pow(creatinina/k,-0.411)*Math.pow(0.993,idade)*(sexo?1:1.018); }
function volume_corrente(peso) { return peso * 0.007; }`,
      example: `importe bio_fisiologia\n\nexecute imc_bio(78, 1.75)\nexecute taxa_metabolica_basal(78, 175, 30, 1)\nexecute debito_cardiaco(70, 70)\nexecute vo2_max(190, 60, 75)\napresente superficie_corporal(78, 175) em destaque`,
    },

    // ── bio_genetica ─────────────────────────────────────────
    bio_genetica: {
      key: 'bio_genetica',
      title: '🧬 Genética',
      description: 'Lei de Mendel, equilíbrio de Hardy-Weinberg, frequência alélica, probabilidade de heredograma e variância genética.',
      exports: ['hardy_weinberg_p','hardy_weinberg_q','frequencia_genotipica','probabilidade_fenotipo','heranca_ligada','variancia_genetica','coeficiente_endogamia','num_gametas','proporcao_mendeliana','segregacao_independente'],
      functions: [
        { name: 'hardy_weinberg_p', params: 'q', desc: 'p = 1 - q (frequência alelo dominante)' },
        { name: 'hardy_weinberg_q', params: 'freq_recessivos', desc: 'q = √(freq. homozigotos recessivos)' },
        { name: 'frequencia_genotipica', params: 'p, q', desc: 'Retorna p², 2pq, q² como objeto' },
        { name: 'probabilidade_fenotipo', params: 'dominante, recessivo', desc: 'P(dominante) = dom/(dom+rec)' },
        { name: 'heranca_ligada', params: 'freq_x', desc: 'Freq. em machos = freq. alelo X' },
        { name: 'variancia_genetica', params: 'p', desc: 'Var = 2pq (para alelo bialélico)' },
        { name: 'coeficiente_endogamia', params: 'geracao', desc: 'F ≈ (1/2)^geração para autofecundação' },
        { name: 'num_gametas', params: 'pares_heteroz', desc: '2^n combinações de gametas' },
        { name: 'proporcao_mendeliana', params: 'n_genes', desc: 'Proporção fenotípica 3^n : 1' },
        { name: 'segregacao_independente', params: 'n', desc: 'Número de fenótipos possíveis = 2^n' },
      ],
      jsCode: `function hardy_weinberg_p(q) { return 1 - q; }
function hardy_weinberg_q(freq_recessivos) { return Math.sqrt(freq_recessivos); }
function frequencia_genotipica(p, q) { return {AA: p*p, Aa: 2*p*q, aa: q*q}; }
function probabilidade_fenotipo(dominante, recessivo) { return dominante / (dominante + recessivo); }
function heranca_ligada(freq_x) { return freq_x; }
function variancia_genetica(p) { return 2 * p * (1 - p); }
function coeficiente_endogamia(geracao) { return Math.pow(0.5, geracao); }
function num_gametas(pares_heteroz) { return Math.pow(2, pares_heteroz); }
function proporcao_mendeliana(n_genes) { return Math.pow(3, n_genes); }
function segregacao_independente(n) { return Math.pow(2, n); }`,
      example: `importe bio_genetica\n\nexecute hardy_weinberg_q(0.09)\nexecute variancia_genetica(0.6)\nexecute num_gametas(3)\nexecute proporcao_mendeliana(2)\napresente frequencia_genotipica(0.7, 0.3) em dados`,
    },

    // ── bio_ecologia ─────────────────────────────────────────
    bio_ecologia: {
      key: 'bio_ecologia',
      title: '🌿 Ecologia',
      description: 'Capacidade de suporte, índice de diversidade de Shannon, cadeias tróficas, crescimento populacional e índice de nicho.',
      exports: ['crescimento_logistico','capacidade_suporte','shannon_diversidade','eficiencia_trófica','biomassa_nivel','taxa_extincao','indice_niche','abundancia_relativa','taxa_predacao','mortalidade_populacional'],
      functions: [
        { name: 'crescimento_logistico', params: 'n, r, k', desc: 'dN/dt = rN(1 - N/K)' },
        { name: 'capacidade_suporte', params: 'recursos, consumo_ind', desc: 'K = recursos / consumo por indivíduo' },
        { name: 'shannon_diversidade', params: 'proporcoes', desc: 'H = -Σ(pi × ln(pi))' },
        { name: 'eficiencia_trofica', params: 'energia_nivel', desc: 'Eficiência ≈ 10% por nível' },
        { name: 'biomassa_nivel', params: 'biomassa_base, nivel', desc: 'Biomassa no nível trófico n' },
        { name: 'taxa_extincao', params: 'area', desc: 'Taxa relativa por área (teoria de MacArthur-Wilson)' },
        { name: 'indice_niche', params: 'recursos_usados, total', desc: 'Amplitude de nicho = usados/total' },
        { name: 'abundancia_relativa', params: 'ni, n_total', desc: 'pi = ni / N' },
        { name: 'taxa_predacao', params: 'predadores, presas, eficiencia', desc: 'Presas capturadas por período' },
        { name: 'mortalidade_populacional', params: 'mortos, total', desc: 'q = mortos / total' },
      ],
      jsCode: `function crescimento_logistico(n, r, k) { return r * n * (1 - n / k); }
function capacidade_suporte(recursos, consumo_ind) { return recursos / consumo_ind; }
function shannon_diversidade(proporcoes) { var arr=Array.isArray(proporcoes)?proporcoes:Object.values(proporcoes); return -arr.reduce(function(s,p){return s+(p>0?p*Math.log(p):0);},0); }
function eficiencia_trofica(energia_nivel) { return energia_nivel * 0.1; }
function biomassa_nivel(biomassa_base, nivel) { return biomassa_base * Math.pow(0.1, nivel - 1); }
function taxa_extincao(area) { return Math.pow(area, -0.25); }
function indice_niche(recursos_usados, total) { return recursos_usados / total; }
function abundancia_relativa(ni, n_total) { return ni / n_total; }
function taxa_predacao(predadores, presas, eficiencia) { return predadores * presas * eficiencia; }
function mortalidade_populacional(mortos, total) { return mortos / total; }`,
      example: `importe bio_ecologia\n\nexecute crescimento_logistico(500, 0.3, 1000)\nexecute capacidade_suporte(10000, 10)\nexecute biomassa_nivel(10000, 3)\nexecute mortalidade_populacional(50, 500)\napresente eficiencia_trofica(1000) em destaque`,
    },

    // ── bio_microbiologia ────────────────────────────────────
    bio_microbiologia: {
      key: 'bio_microbiologia',
      title: '🦠 Microbiologia',
      description: 'Crescimento bacteriano, tempo de geração, curva de crescimento, dose infectante e eficácia de desinfecção.',
      exports: ['crescimento_bacteriano','tempo_geracao','populacao_fase_log','taxa_crescimento_especifico','reducao_decimal','dose_infectante_50','eficacia_antimicrobiano','numero_gerações','densidade_optica_estimada','unidades_formadoras_colonia'],
      functions: [
        { name: 'crescimento_bacteriano', params: 'n0, mu, t', desc: 'N = N0 × e^(μt)' },
        { name: 'tempo_geracao', params: 'mu', desc: 'g = ln(2) / μ' },
        { name: 'populacao_fase_log', params: 'n0, g, t', desc: 'N = N0 × 2^(t/g)' },
        { name: 'taxa_crescimento_especifico', params: 'n1, n2, t', desc: 'μ = ln(N2/N1) / Δt' },
        { name: 'reducao_decimal', params: 'n0, n', desc: 'D = log(N0/N)' },
        { name: 'dose_infectante_50', params: 'dose', desc: 'DI50 relativa (referência)' },
        { name: 'eficacia_antimicrobiano', params: 'n0, n_final', desc: 'Redução log = log(N0) - log(Nf)' },
        { name: 'numero_geracoes', params: 't, g', desc: 'n = t / g' },
        { name: 'densidade_optica_estimada', params: 'n', desc: 'DO600 ≈ N / 8×10⁸ (estimativa)' },
        { name: 'unidades_formadoras_colonia', params: 'colonias, diluicao, volume', desc: 'UFC/mL = colônias / (diluição × vol)' },
      ],
      jsCode: `function crescimento_bacteriano(n0, mu, t) { return n0 * Math.exp(mu * t); }
function tempo_geracao(mu) { return Math.LN2 / mu; }
function populacao_fase_log(n0, g, t) { return n0 * Math.pow(2, t / g); }
function taxa_crescimento_especifico(n1, n2, t) { return Math.log(n2 / n1) / t; }
function reducao_decimal(n0, n) { return Math.log10(n0 / n); }
function dose_infectante_50(dose) { return dose; }
function eficacia_antimicrobiano(n0, n_final) { return Math.log10(n0) - Math.log10(n_final); }
function numero_geracoes(t, g) { return t / g; }
function densidade_optica_estimada(n) { return n / 8e8; }
function unidades_formadoras_colonia(colonias, diluicao, volume) { return colonias / (diluicao * volume); }`,
      example: `importe bio_microbiologia\n\nexecute crescimento_bacteriano(100, 0.693, 5)\nexecute tempo_geracao(0.693)\nexecute populacao_fase_log(100, 1, 10)\nexecute eficacia_antimicrobiano(1e6, 10)\napresente unidades_formadoras_colonia(150, 0.001, 0.1) em destaque`,
    },

    // ── bio_evolucao ─────────────────────────────────────────
    bio_evolucao: {
      key: 'bio_evolucao',
      title: '🦕 Evolução',
      description: 'Seleção natural, fitness relativo, deriva genética, especiação e distância filogenética.',
      exports: ['fitness_relativo','selecao_natural','deriva_genetica','tempo_especiacao','distancia_genetica','coeficiente_selecao','taxa_substituicao','frequencia_apos_selecao','heterozigosidade','divergencia_molecular'],
      functions: [
        { name: 'fitness_relativo', params: 'w, w_max', desc: 'fitness = w / w_max' },
        { name: 'selecao_natural', params: 'p, s', desc: 'p\' = p(1-s) / (1-sp) — mudança na freq.' },
        { name: 'deriva_genetica', params: 'p, n', desc: 'Variância = p(1-p)/(2N)' },
        { name: 'tempo_especiacao', params: 'dist, taxa', desc: 'T = distância / taxa de substituição' },
        { name: 'distancia_genetica', params: 'freq1, freq2', desc: 'D = |p1 - p2|' },
        { name: 'coeficiente_selecao', params: 'w1, w2', desc: 's = 1 - w1/w2' },
        { name: 'taxa_substituicao', params: 'mutacoes, tempo', desc: 'k = mutações / tempo (por sítio/ano)' },
        { name: 'frequencia_apos_selecao', params: 'p, s', desc: 'p\' = p(1-s) / (1-ps)' },
        { name: 'heterozigosidade', params: 'p', desc: 'H = 2p(1-p)' },
        { name: 'divergencia_molecular', params: 't, k', desc: 'D = 2kt (distância entre linhagens)' },
      ],
      jsCode: `function fitness_relativo(w, w_max) { return w / w_max; }
function selecao_natural(p, s) { return p * (1 - s) / (1 - s * p); }
function deriva_genetica(p, n) { return p * (1 - p) / (2 * n); }
function tempo_especiacao(dist, taxa) { return dist / taxa; }
function distancia_genetica(freq1, freq2) { return Math.abs(freq1 - freq2); }
function coeficiente_selecao(w1, w2) { return 1 - w1 / w2; }
function taxa_substituicao(mutacoes, tempo) { return mutacoes / tempo; }
function frequencia_apos_selecao(p, s) { return p * (1 - s) / (1 - p * s); }
function heterozigosidade(p) { return 2 * p * (1 - p); }
function divergencia_molecular(t, k) { return 2 * k * t; }`,
      example: `importe bio_evolucao\n\nexecute fitness_relativo(0.9, 1.0)\nexecute selecao_natural(0.6, 0.1)\nexecute heterozigosidade(0.4)\nexecute deriva_genetica(0.5, 50)\napresente divergencia_molecular(5e6, 1e-9) em destaque`,
    },

    // ── geometria ────────────────────────────────────────────
    geometria: {
      key: 'geometria',
      selo: 'recomendada',
      title: '📐 Geometria',
      description: 'Áreas, perímetros, volumes e diagonais. Figuras planas e sólidos geométricos com fórmulas prontas.',
      exports: ['area_circulo','area_retangulo','area_triangulo','perimetro_circulo','perimetro_retangulo','volume_esfera','volume_cilindro','volume_cone','volume_cubo','area_trapezio','diagonal_retangulo','area_losango','area_hexagono','volume_prisma'],
      functions: [
        { name: 'area_circulo', params: 'r', desc: 'Área = π×r²' },
        { name: 'area_retangulo', params: 'l, a', desc: 'Área = largura × altura' },
        { name: 'area_triangulo', params: 'b, h', desc: 'Área = (base × altura) / 2' },
        { name: 'perimetro_circulo', params: 'r', desc: 'Perímetro = 2πr' },
        { name: 'perimetro_retangulo', params: 'l, a', desc: 'Perímetro = 2(l + a)' },
        { name: 'volume_esfera', params: 'r', desc: 'Volume = (4/3)πr³' },
        { name: 'volume_cilindro', params: 'r, h', desc: 'Volume = πr²h' },
        { name: 'volume_cone', params: 'r, h', desc: 'Volume = (1/3)πr²h' },
        { name: 'volume_cubo', params: 'l', desc: 'Volume = l³' },
        { name: 'area_trapezio', params: 'B, b, h', desc: 'Área = ((B+b)×h)/2' },
        { name: 'diagonal_retangulo', params: 'l, a', desc: '√(l² + a²)' },
        { name: 'area_losango', params: 'D, d', desc: 'Área = (D×d)/2' },
        { name: 'area_hexagono', params: 'l', desc: 'Área do hexágono regular' },
        { name: 'volume_prisma', params: 'area_base, h', desc: 'Volume = área_base × h' },
      ],
      jsCode: `function area_circulo(r) { return Math.PI * r * r; }
function area_retangulo(l, a) { return l * a; }
function area_triangulo(b, h) { return (b * h) / 2; }
function perimetro_circulo(r) { return 2 * Math.PI * r; }
function perimetro_retangulo(l, a) { return 2 * (l + a); }
function volume_esfera(r) { return (4 / 3) * Math.PI * r * r * r; }
function volume_cilindro(r, h) { return Math.PI * r * r * h; }
function volume_cone(r, h) { return (1 / 3) * Math.PI * r * r * h; }
function volume_cubo(l) { return l * l * l; }
function area_trapezio(B, b, h) { return ((B + b) * h) / 2; }
function diagonal_retangulo(l, a) { return Math.sqrt(l * l + a * a); }
function area_losango(D, d) { return (D * d) / 2; }
function area_hexagono(l) { return (3 * Math.sqrt(3) / 2) * l * l; }
function volume_prisma(area_base, h) { return area_base * h; }`,
      example: `importe geometria\n\nexecute area_circulo(5)\nexecute volume_esfera(3)\nexecute area_triangulo(10, 6)\nexecute diagonal_retangulo(3, 4)\napresente volume_cilindro(2, 10) em destaque`,
    },

    // ── formulas_eletrica ────────────────────────────────────
    formulas_eletrica: {
      key: 'formulas_eletrica',
      title: '⚡ Eletricidade',
      description: 'Lei de Ohm, potência, resistência, capacitância, indutância, lei de Coulomb e campo elétrico.',
      exports: ['lei_ohm','potencia_eletrica','resistencia_serie','resistencia_paralela','energia_consumida','capacitancia','indutancia','lei_coulomb','campo_eletrico','corrente'],
      functions: [
        { name: 'lei_ohm', params: 'v, r', desc: 'Corrente I = V / R' },
        { name: 'potencia_eletrica', params: 'v, i', desc: 'P = V × I (watts)' },
        { name: 'resistencia_serie', params: 'r1, r2', desc: 'Rt = R1 + R2' },
        { name: 'resistencia_paralela', params: 'r1, r2', desc: 'Rt = (R1×R2)/(R1+R2)' },
        { name: 'energia_consumida', params: 'p, h', desc: 'E = potência × horas (Wh)' },
        { name: 'capacitancia', params: 'q, v', desc: 'C = carga / tensão (Farads)' },
        { name: 'indutancia', params: 'v, di_dt', desc: 'L = V / (dI/dt) (Henrys)' },
        { name: 'lei_coulomb', params: 'q1, q2, d', desc: 'Força eletrostática entre cargas' },
        { name: 'campo_eletrico', params: 'f, q', desc: 'E = F / q (N/C)' },
        { name: 'corrente', params: 'q, t', desc: 'I = carga / tempo (Ampères)' },
      ],
      jsCode: `function lei_ohm(v, r) { return v / r; }
function potencia_eletrica(v, i) { return v * i; }
function resistencia_serie(r1, r2) { return r1 + r2; }
function resistencia_paralela(r1, r2) { return (r1 * r2) / (r1 + r2); }
function energia_consumida(p, h) { return p * h; }
function capacitancia(q, v) { return q / v; }
function indutancia(v, di_dt) { return v / di_dt; }
function lei_coulomb(q1, q2, d) { return 8.9875e9 * q1 * q2 / (d * d); }
function campo_eletrico(f, q) { return f / q; }
function corrente(q, t) { return q / t; }`,
      example: `importe formulas_eletrica\n\nexecute lei_ohm(220, 100)\nexecute potencia_eletrica(220, 10)\nexecute resistencia_paralela(100, 200)\nexecute energia_consumida(1500, 8)\napresente lei_coulomb(0.001, 0.002, 0.5) em destaque`,
    },

    // ── astronomia ───────────────────────────────────────────
    astronomia: {
      key: 'astronomia',
      title: '🌌 Astronomia',
      description: 'Constantes e fórmulas astronômicas: velocidade da luz, unidades astronômicas, período orbital, velocidade de escape e mais.',
      exports: ['velocidade_luz','distancia_ua','anos_luz_para_km','periodo_orbital','velocidade_escape','luminosidade_estrela','magnitude_aparente','lei_hubble','temperatura_estrela','massa_solar'],
      functions: [
        { name: 'velocidade_luz', params: '', desc: 'Velocidade da luz em m/s' },
        { name: 'distancia_ua', params: 'km', desc: 'Converte km para UA' },
        { name: 'anos_luz_para_km', params: 'al', desc: 'Anos-luz → quilômetros' },
        { name: 'periodo_orbital', params: 'a', desc: '3ª Lei de Kepler (anos, a em UA)' },
        { name: 'velocidade_escape', params: 'm, r', desc: 'v = √(2GM/r) em m/s' },
        { name: 'luminosidade_estrela', params: 'r, t', desc: 'L = 4πr²σT⁴ (Stefan-Boltzmann)' },
        { name: 'magnitude_aparente', params: 'm_abs, d_pc', desc: 'm = M + 5×log₁₀(d/10)' },
        { name: 'lei_hubble', params: 'd_mpc', desc: 'v = H₀ × d (km/s, d em Mpc)' },
        { name: 'temperatura_estrela', params: 'lam_nm', desc: 'Lei de Wien: T = b/λ (K)' },
        { name: 'massa_solar', params: '', desc: 'Massa do Sol em kg' },
      ],
      jsCode: `function velocidade_luz() { return 299792458; }
function distancia_ua(km) { return km / 149597870.7; }
function anos_luz_para_km(al) { return al * 9.461e12; }
function periodo_orbital(a) { return Math.pow(a, 1.5); }
function velocidade_escape(m, r) { return Math.sqrt(2 * 6.674e-11 * m / r); }
function luminosidade_estrela(r, t) { return 4 * Math.PI * r * r * 5.670374419e-8 * Math.pow(t, 4); }
function magnitude_aparente(m_abs, d_pc) { return m_abs + 5 * Math.log10(d_pc / 10); }
function lei_hubble(d_mpc) { return 70 * d_mpc; }
function temperatura_estrela(lam_nm) { return 2897771.955 / lam_nm; }
function massa_solar() { return 1.989e30; }`,
      example: `importe astronomia\n\nexecute velocidade_luz()\nexecute anos_luz_para_km(4.24)\nexecute periodo_orbital(1)\nexecute temperatura_estrela(502)\napresente massa_solar() em destaque`,
    },

    // ── nutricao ─────────────────────────────────────────────
    nutricao: {
      key: 'nutricao',
      title: '🥗 Nutrição',
      description: 'Calorias, macronutrientes, hidratação, gasto calórico e índice glicêmico. Fórmulas para planejamento alimentar.',
      exports: ['calorias_refeicao','agua_diaria','proteina_diaria','imc_nutri','gasto_calorico','carboidrato_gramas','gordura_gramas','deficit_calorico','fibra_diaria','indice_glicemico'],
      functions: [
        { name: 'calorias_refeicao', params: 'carb, prot, gord', desc: 'Carb×4 + Prot×4 + Gord×9' },
        { name: 'agua_diaria', params: 'peso', desc: 'Água recomendada (ml) = peso × 35' },
        { name: 'proteina_diaria', params: 'peso, fator', desc: 'Proteína (g) = peso × fator (0.8–2.0)' },
        { name: 'imc_nutri', params: 'peso, altura', desc: 'IMC = peso / altura²' },
        { name: 'gasto_calorico', params: 'tmb, fator', desc: 'TDEE = TMB × fator de atividade' },
        { name: 'carboidrato_gramas', params: 'calorias', desc: 'Gramas de carb (4 kcal/g)' },
        { name: 'gordura_gramas', params: 'calorias', desc: 'Gramas de gordura (9 kcal/g)' },
        { name: 'deficit_calorico', params: 'tdee, meta', desc: 'Déficit = TDEE - meta calórica' },
        { name: 'fibra_diaria', params: 'calorias', desc: 'Fibra recomendada (14g/1000kcal)' },
        { name: 'indice_glicemico', params: 'carga, carb', desc: 'IG = (carga / carb) × 100' },
      ],
      jsCode: `function calorias_refeicao(carb, prot, gord) { return carb * 4 + prot * 4 + gord * 9; }
function agua_diaria(peso) { return peso * 35; }
function proteina_diaria(peso, fator) { return peso * fator; }
function imc_nutri(peso, altura) { return peso / (altura * altura); }
function gasto_calorico(tmb, fator) { return tmb * fator; }
function carboidrato_gramas(calorias) { return calorias / 4; }
function gordura_gramas(calorias) { return calorias / 9; }
function deficit_calorico(tdee, meta) { return tdee - meta; }
function fibra_diaria(calorias) { return (calorias / 1000) * 14; }
function indice_glicemico(carga, carb) { return (carga / carb) * 100; }`,
      example: `importe nutricao\n\nexecute calorias_refeicao(50, 30, 15)\nexecute agua_diaria(75)\nexecute proteina_diaria(80, 1.6)\nexecute imc_nutri(78, 1.75)\napresente gasto_calorico(1800, 1.55) em destaque`,
    },

    // ── texto ────────────────────────────────────────────────
    texto: {
      key: 'texto',
      selo: 'honrosa',
      title: '📝 Manipulação de Texto',
      description: 'Funções para transformar, buscar, contar e formatar strings. Maiúsculas, minúsculas, inversão, truncamento e mais.',
      exports: ['maiusculas','minusculas','capitalizar','inverter_texto','contar_palavras','contar_caracteres','repetir_texto','substituir','contem_texto','truncar'],
      functions: [
        { name: 'maiusculas', params: 's', desc: 'Converte para MAIÚSCULAS' },
        { name: 'minusculas', params: 's', desc: 'Converte para minúsculas' },
        { name: 'capitalizar', params: 's', desc: 'Primeira letra de cada palavra maiúscula' },
        { name: 'inverter_texto', params: 's', desc: 'Inverte a string' },
        { name: 'contar_palavras', params: 's', desc: 'Número de palavras na string' },
        { name: 'contar_caracteres', params: 's', desc: 'Número de caracteres' },
        { name: 'repetir_texto', params: 's, n', desc: 'Repete a string N vezes' },
        { name: 'substituir', params: 's, de, para', desc: 'Substitui todas as ocorrências' },
        { name: 'contem_texto', params: 's, busca', desc: 'Retorna 1 se contém, 0 se não' },
        { name: 'truncar', params: 's, max', desc: 'Trunca em max caracteres + "..."' },
      ],
      jsCode: `function maiusculas(s) { return String(s).toUpperCase(); }
function minusculas(s) { return String(s).toLowerCase(); }
function capitalizar(s) { return String(s).replace(/\\b\\w/g, function(c) { return c.toUpperCase(); }); }
function inverter_texto(s) { return String(s).split('').reverse().join(''); }
function contar_palavras(s) { var t = String(s).trim(); return t.length === 0 ? 0 : t.split(/\\s+/).length; }
function contar_caracteres(s) { return String(s).length; }
function repetir_texto(s, n) { var r = ''; for (var i = 0; i < n; i++) r += String(s); return r; }
function substituir(s, de, para) { return String(s).split(de).join(para); }
function contem_texto(s, busca) { return String(s).indexOf(String(busca)) !== -1 ? 1 : 0; }
function truncar(s, max) { var str = String(s); return str.length > max ? str.substring(0, max) + '...' : str; }`,
      example: `importe texto\n\nexecute maiusculas("olá mundo")\nexecute capitalizar("crab code ide")\nexecute contar_palavras("o rato roeu a roupa")\nexecute inverter_texto("CrabCode")\napresente substituir("banana", "a", "o") em destaque`,
    },

    // ── criptografia ─────────────────────────────────────────
    criptografia: {
      key: 'criptografia',
      title: '🔐 Criptografia Básica',
      description: 'Cifra de César, ROT13, Base64, hash simples, código Morse, gerador de senhas e cifra XOR.',
      exports: ['cifra_cesar','decifra_cesar','rot13','base64_codificar','base64_decodificar','hash_simples','codigo_morse','gerar_senha','xor_cifra','contar_frequencia'],
      functions: [
        { name: 'cifra_cesar', params: 'texto, desl', desc: 'Cifra de César com deslocamento' },
        { name: 'decifra_cesar', params: 'texto, desl', desc: 'Decifra César (deslocamento inverso)' },
        { name: 'rot13', params: 'texto', desc: 'Rotação de 13 posições (ROT13)' },
        { name: 'base64_codificar', params: 'texto', desc: 'Codifica em Base64' },
        { name: 'base64_decodificar', params: 'texto', desc: 'Decodifica de Base64' },
        { name: 'hash_simples', params: 'texto', desc: 'Hash numérico simples (djb2)' },
        { name: 'codigo_morse', params: 'texto', desc: 'Texto → código Morse' },
        { name: 'gerar_senha', params: 'tamanho', desc: 'Gera senha aleatória alfanumérica' },
        { name: 'xor_cifra', params: 'texto, chave', desc: 'Cifra XOR com chave numérica' },
        { name: 'contar_frequencia', params: 'texto', desc: 'Frequência de cada caractere (objeto)' },
      ],
      jsCode: `function cifra_cesar(texto, desl) { return String(texto).replace(/[a-zA-Z]/g, function(c) { var base = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - base + desl % 26 + 26) % 26 + base); }); }
function decifra_cesar(texto, desl) { return cifra_cesar(texto, -desl); }
function rot13(texto) { return cifra_cesar(texto, 13); }
function base64_codificar(texto) { return btoa(unescape(encodeURIComponent(String(texto)))); }
function base64_decodificar(texto) { return decodeURIComponent(escape(atob(String(texto)))); }
function hash_simples(texto) { var h = 5381; var s = String(texto); for (var i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i); return Math.abs(h); }
function codigo_morse(texto) { var m = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'}; return String(texto).toUpperCase().split('').map(function(c){return m[c]||c;}).join(' '); }
function gerar_senha(tamanho) { var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'; var r = ''; for (var i = 0; i < tamanho; i++) r += chars.charAt(Math.floor(Math.random() * chars.length)); return r; }
function xor_cifra(texto, chave) { return String(texto).split('').map(function(c) { return String.fromCharCode(c.charCodeAt(0) ^ chave); }).join(''); }
function contar_frequencia(texto) { var freq = {}; String(texto).split('').forEach(function(c) { freq[c] = (freq[c] || 0) + 1; }); return freq; }`,
      example: `importe criptografia\n\nexecute cifra_cesar("CrabCode", 3)\nexecute rot13("Hello World")\nexecute base64_codificar("CrabCode IDE")\nexecute gerar_senha(16)\napresente codigo_morse("SOS") em destaque`,
    },

    // ── formulas_economia ────────────────────────────────────
    formulas_economia: {
      key: 'formulas_economia',
      title: '📈 Economia',
      description: 'PIB per capita, inflação, elasticidade, taxa de desemprego, balança comercial, câmbio e multiplicador fiscal.',
      exports: ['pib_per_capita','inflacao','elasticidade_preco','taxa_desemprego','balanca_comercial','taxa_cambio','deflacionar','multiplicador_fiscal','velocidade_moeda','poder_compra'],
      functions: [
        { name: 'pib_per_capita', params: 'pib, pop', desc: 'PIB / população' },
        { name: 'inflacao', params: 'atual, anterior', desc: 'Inflação (%) entre dois preços' },
        { name: 'elasticidade_preco', params: 'var_qtd, var_preco', desc: 'Elasticidade-preço da demanda' },
        { name: 'taxa_desemprego', params: 'desemp, pea', desc: 'Taxa de desemprego (%)' },
        { name: 'balanca_comercial', params: 'exp, imp', desc: 'Saldo = exportações - importações' },
        { name: 'taxa_cambio', params: 'local, estrangeira', desc: 'Taxa = moeda local / estrangeira' },
        { name: 'deflacionar', params: 'nominal, indice', desc: 'Valor real = nominal / índice × 100' },
        { name: 'multiplicador_fiscal', params: 'pmc', desc: 'Multiplicador = 1 / (1 - PMC)' },
        { name: 'velocidade_moeda', params: 'pib, m', desc: 'V = PIB / oferta monetária' },
        { name: 'poder_compra', params: 'salario, cesta', desc: 'Unidades de cesta que o salário compra' },
      ],
      jsCode: `function pib_per_capita(pib, pop) { return pib / pop; }
function inflacao(atual, anterior) { return ((atual - anterior) / anterior) * 100; }
function elasticidade_preco(var_qtd, var_preco) { return var_qtd / var_preco; }
function taxa_desemprego(desemp, pea) { return (desemp / pea) * 100; }
function balanca_comercial(exp, imp) { return exp - imp; }
function taxa_cambio(local, estrangeira) { return local / estrangeira; }
function deflacionar(nominal, indice) { return (nominal / indice) * 100; }
function multiplicador_fiscal(pmc) { return 1 / (1 - pmc); }
function velocidade_moeda(pib, m) { return pib / m; }
function poder_compra(salario, cesta) { return salario / cesta; }`,
      example: `importe formulas_economia\n\nexecute pib_per_capita(2000000000000, 215000000)\nexecute inflacao(5.50, 4.80)\nexecute taxa_desemprego(12000000, 100000000)\nexecute multiplicador_fiscal(0.75)\napresente balanca_comercial(280000, 210000) em destaque`,
    },

    // ── investimentos ────────────────────────────────────────
    investimentos: {
      key: 'investimentos',
      title: '💹 Investimentos',
      description: 'Juros compostos, CAGR, rendimento real, regra dos 72, dividend yield, preço teto, aportes e independência financeira.',
      exports: ['juros_compostos','cagr','rendimento_real','regra_72','dividend_yield','preco_teto','rentabilidade','aporte_mensal','independencia_financeira','sharpe_ratio'],
      functions: [
        { name: 'juros_compostos', params: 'capital, taxa, n', desc: 'M = C × (1+i)^n' },
        { name: 'cagr', params: 'vi, vf, anos', desc: 'Taxa de crescimento anual composta (%)' },
        { name: 'rendimento_real', params: 'nominal, inflacao', desc: 'Rendimento descontada inflação (%)' },
        { name: 'regra_72', params: 'taxa', desc: 'Anos para dobrar o capital' },
        { name: 'dividend_yield', params: 'dividendo, preco', desc: 'DY = dividendo / preço × 100 (%)' },
        { name: 'preco_teto', params: 'dividendo, taxa_min', desc: 'Preço máximo para compra' },
        { name: 'rentabilidade', params: 'vf, vi', desc: 'Rentabilidade (%) = (VF-VI)/VI × 100' },
        { name: 'aporte_mensal', params: 'meta, taxa, meses', desc: 'Aporte necessário por mês' },
        { name: 'independencia_financeira', params: 'desp_mensal, taxa', desc: 'Patrimônio necessário (regra dos 4%)' },
        { name: 'sharpe_ratio', params: 'retorno, rf, vol', desc: 'Sharpe = (retorno - rf) / volatilidade' },
      ],
      jsCode: `function juros_compostos(capital, taxa, n) { return capital * Math.pow(1 + taxa, n); }
function cagr(vi, vf, anos) { return (Math.pow(vf / vi, 1 / anos) - 1) * 100; }
function rendimento_real(nominal, inflac) { return ((1 + nominal / 100) / (1 + inflac / 100) - 1) * 100; }
function regra_72(taxa) { return 72 / taxa; }
function dividend_yield(dividendo, preco) { return (dividendo / preco) * 100; }
function preco_teto(dividendo, taxa_min) { return dividendo / (taxa_min / 100); }
function rentabilidade(vf, vi) { return ((vf - vi) / vi) * 100; }
function aporte_mensal(meta, taxa, meses) { if (taxa === 0) return meta / meses; return meta * taxa / (Math.pow(1 + taxa, meses) - 1); }
function independencia_financeira(desp_mensal, taxa) { return (desp_mensal * 12) / (taxa / 100); }
function sharpe_ratio(retorno, rf, vol) { return (retorno - rf) / vol; }`,
      example: `importe investimentos\n\nexecute juros_compostos(10000, 0.01, 120)\nexecute cagr(10000, 25000, 5)\nexecute regra_72(8)\nexecute dividend_yield(2.50, 30)\napresente independencia_financeira(5000, 4) em destaque`,
    },

    // ── musica ───────────────────────────────────────────────
    musica: {
      key: 'musica',
      title: '🎵 Teoria Musical',
      description: 'Frequências de notas, BPM, intervalos, oitavas, comprimento de onda, MIDI e cents. Fundamentos da acústica musical.',
      exports: ['frequencia_nota','bpm_para_ms','ms_para_bpm','intervalo_frequencia','oitava_acima','oitava_abaixo','comprimento_onda','nota_midi','tempo_compasso','cents'],
      functions: [
        { name: 'frequencia_nota', params: 'semitons', desc: 'Frequência a N semitons de Lá4 (440Hz)' },
        { name: 'bpm_para_ms', params: 'bpm', desc: 'Duração de uma batida em ms' },
        { name: 'ms_para_bpm', params: 'ms', desc: 'BPM a partir de ms por batida' },
        { name: 'intervalo_frequencia', params: 'f1, f2', desc: 'Razão entre duas frequências' },
        { name: 'oitava_acima', params: 'freq', desc: 'Frequência uma oitava acima (×2)' },
        { name: 'oitava_abaixo', params: 'freq', desc: 'Frequência uma oitava abaixo (÷2)' },
        { name: 'comprimento_onda', params: 'freq', desc: 'λ = 343 / freq (m, som no ar)' },
        { name: 'nota_midi', params: 'numero', desc: 'Frequência de nota MIDI (0–127)' },
        { name: 'tempo_compasso', params: 'bpm, batidas', desc: 'Duração de um compasso em segundos' },
        { name: 'cents', params: 'f1, f2', desc: 'Diferença em cents entre frequências' },
      ],
      jsCode: `function frequencia_nota(semitons) { return 440 * Math.pow(2, semitons / 12); }
function bpm_para_ms(bpm) { return 60000 / bpm; }
function ms_para_bpm(ms) { return 60000 / ms; }
function intervalo_frequencia(f1, f2) { return f2 / f1; }
function oitava_acima(freq) { return freq * 2; }
function oitava_abaixo(freq) { return freq / 2; }
function comprimento_onda(freq) { return 343 / freq; }
function nota_midi(numero) { return 440 * Math.pow(2, (numero - 69) / 12); }
function tempo_compasso(bpm, batidas) { return (60 / bpm) * batidas; }
function cents(f1, f2) { return 1200 * Math.log2(f2 / f1); }`,
      example: `importe musica\n\nexecute frequencia_nota(0)\nexecute frequencia_nota(3)\nexecute bpm_para_ms(120)\nexecute comprimento_onda(440)\napresente cents(440, 880) em destaque`,
    },

    // ── cores ────────────────────────────────────────────────
    cores: {
      key: 'cores',
      title: '🎨 Cores',
      description: 'Conversões RGB/HEX/HSL, cor complementar, brilho, mistura de cores, escurecer, clarear e contraste.',
      exports: ['rgb_para_hex','hex_para_rgb','complementar_cor','brilho_cor','misturar_cores','escurecer_cor','clarear_cor','contraste_cor','aleatorio_cor','cinza_cor'],
      functions: [
        { name: 'rgb_para_hex', params: 'r, g, b', desc: 'RGB → string HEX (#RRGGBB)' },
        { name: 'hex_para_rgb', params: 'hex', desc: 'HEX → string "r, g, b"' },
        { name: 'complementar_cor', params: 'r, g, b', desc: 'Cor complementar (255-c)' },
        { name: 'brilho_cor', params: 'r, g, b', desc: 'Luminância relativa (0–255)' },
        { name: 'misturar_cores', params: 'r1,g1,b1,r2,g2,b2', desc: 'Média das duas cores RGB' },
        { name: 'escurecer_cor', params: 'r, g, b, fator', desc: 'Escurece por fator (0–1)' },
        { name: 'clarear_cor', params: 'r, g, b, fator', desc: 'Clareia por fator (0–1)' },
        { name: 'contraste_cor', params: 'r1,g1,b1,r2,g2,b2', desc: 'Razão de contraste WCAG' },
        { name: 'aleatorio_cor', params: '', desc: 'Gera cor HEX aleatória' },
        { name: 'cinza_cor', params: 'r, g, b', desc: 'Valor em escala de cinza' },
      ],
      jsCode: `function rgb_para_hex(r, g, b) { return '#' + [r,g,b].map(function(c){ var h = Math.max(0,Math.min(255,Math.round(c))).toString(16); return h.length < 2 ? '0'+h : h; }).join(''); }
function hex_para_rgb(hex) { var h = String(hex).replace('#',''); var n = parseInt(h, 16); return Math.floor(n/65536) + ', ' + (Math.floor(n/256)%256) + ', ' + (n%256); }
function complementar_cor(r, g, b) { return rgb_para_hex(255-r, 255-g, 255-b); }
function brilho_cor(r, g, b) { return 0.299*r + 0.587*g + 0.114*b; }
function misturar_cores(r1, g1, b1, r2, g2, b2) { return rgb_para_hex(Math.round((r1+r2)/2), Math.round((g1+g2)/2), Math.round((b1+b2)/2)); }
function escurecer_cor(r, g, b, fator) { return rgb_para_hex(Math.round(r*(1-fator)), Math.round(g*(1-fator)), Math.round(b*(1-fator))); }
function clarear_cor(r, g, b, fator) { return rgb_para_hex(Math.round(r+(255-r)*fator), Math.round(g+(255-g)*fator), Math.round(b+(255-b)*fator)); }
function contraste_cor(r1,g1,b1,r2,g2,b2) { function lum(r,g,b){var a=[r,g,b].map(function(v){v=v/255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];} var l1=lum(r1,g1,b1); var l2=lum(r2,g2,b2); var lighter=Math.max(l1,l2); var darker=Math.min(l1,l2); return (lighter+0.05)/(darker+0.05); }
function aleatorio_cor() { return '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'); }
function cinza_cor(r, g, b) { return Math.round(0.299*r + 0.587*g + 0.114*b); }`,
      example: `importe cores\n\nexecute rgb_para_hex(255, 128, 0)\nexecute hex_para_rgb("#3498db")\nexecute complementar_cor(255, 0, 0)\nexecute aleatorio_cor()\napresente brilho_cor(100, 150, 200) em destaque`,
    },

    // ── validacao ────────────────────────────────────────────
    validacao: {
      key: 'validacao',
      selo: 'recomendada',
      title: '✅ Validação BR',
      description: 'Validação e formatação de CPF, CNPJ, e-mail, CEP e telefone. Funções úteis para dados brasileiros.',
      exports: ['validar_cpf','validar_cnpj','validar_email','validar_cep','validar_telefone','formatar_cpf','formatar_cnpj','formatar_cep','formatar_telefone','gerar_cpf'],
      functions: [
        { name: 'validar_cpf', params: 'cpf', desc: 'Valida CPF (retorna 1 ou 0)' },
        { name: 'validar_cnpj', params: 'cnpj', desc: 'Valida CNPJ (retorna 1 ou 0)' },
        { name: 'validar_email', params: 'email', desc: 'Valida formato de e-mail' },
        { name: 'validar_cep', params: 'cep', desc: 'Valida CEP (8 dígitos)' },
        { name: 'validar_telefone', params: 'tel', desc: 'Valida telefone BR (10-11 dígitos)' },
        { name: 'formatar_cpf', params: 'cpf', desc: 'Formata: 000.000.000-00' },
        { name: 'formatar_cnpj', params: 'cnpj', desc: 'Formata: 00.000.000/0001-00' },
        { name: 'formatar_cep', params: 'cep', desc: 'Formata: 00000-000' },
        { name: 'formatar_telefone', params: 'tel', desc: 'Formata: (00) 00000-0000' },
        { name: 'gerar_cpf', params: '', desc: 'Gera CPF válido aleatório' },
      ],
      jsCode: `function validar_cpf(cpf) { var s = String(cpf).replace(/\\D/g,''); if (s.length !== 11 || /^(\\d)\\1{10}$/.test(s)) return 0; var sum = 0; for (var i = 0; i < 9; i++) sum += parseInt(s[i]) * (10 - i); var d1 = 11 - (sum % 11); if (d1 >= 10) d1 = 0; if (parseInt(s[9]) !== d1) return 0; sum = 0; for (var i = 0; i < 10; i++) sum += parseInt(s[i]) * (11 - i); var d2 = 11 - (sum % 11); if (d2 >= 10) d2 = 0; return parseInt(s[10]) === d2 ? 1 : 0; }
function validar_cnpj(cnpj) { var s = String(cnpj).replace(/\\D/g,''); if (s.length !== 14 || /^(\\d)\\1{13}$/.test(s)) return 0; var t = s.length - 2; var d = s.substring(t); var d1 = 0; var p = t - 7; for (var i = t; i >= 1; i--) { d1 += parseInt(s.charAt(t - i)) * p--; if (p < 2) p = 9; } d1 = d1 % 11 < 2 ? 0 : 11 - (d1 % 11); if (parseInt(d.charAt(0)) !== d1) return 0; var d2 = 0; t = t + 1; p = t - 7; for (var i = t; i >= 1; i--) { d2 += parseInt(s.charAt(t - i)) * p--; if (p < 2) p = 9; } d2 = d2 % 11 < 2 ? 0 : 11 - (d2 % 11); return parseInt(d.charAt(1)) === d2 ? 1 : 0; }
function validar_email(email) { return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(String(email)) ? 1 : 0; }
function validar_cep(cep) { return /^\\d{8}$/.test(String(cep).replace(/\\D/g,'')) ? 1 : 0; }
function validar_telefone(tel) { var s = String(tel).replace(/\\D/g,''); return s.length >= 10 && s.length <= 11 ? 1 : 0; }
function formatar_cpf(cpf) { var s = String(cpf).replace(/\\D/g,'').padStart(11,'0'); return s.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4'); }
function formatar_cnpj(cnpj) { var s = String(cnpj).replace(/\\D/g,'').padStart(14,'0'); return s.replace(/(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})/, '$1.$2.$3/$4-$5'); }
function formatar_cep(cep) { var s = String(cep).replace(/\\D/g,'').padStart(8,'0'); return s.replace(/(\\d{5})(\\d{3})/, '$1-$2'); }
function formatar_telefone(tel) { var s = String(tel).replace(/\\D/g,''); if (s.length === 11) return s.replace(/(\\d{2})(\\d{5})(\\d{4})/, '($1) $2-$3'); return s.replace(/(\\d{2})(\\d{4})(\\d{4})/, '($1) $2-$3'); }
function gerar_cpf() { var n = []; for (var i = 0; i < 9; i++) n.push(Math.floor(Math.random() * 10)); var s1 = 0; for (var i = 0; i < 9; i++) s1 += n[i] * (10 - i); var d1 = 11 - (s1 % 11); if (d1 >= 10) d1 = 0; n.push(d1); var s2 = 0; for (var i = 0; i < 10; i++) s2 += n[i] * (11 - i); var d2 = 11 - (s2 % 11); if (d2 >= 10) d2 = 0; n.push(d2); return n.join(''); }`,
      example: `importe validacao\n\nexecute validar_cpf("52998224725")\nexecute formatar_cpf("52998224725")\nexecute validar_email("user@email.com")\nexecute gerar_cpf()\napresente formatar_telefone("11987654321") em destaque`,
    },

    // ── algoritmos ───────────────────────────────────────────
    algoritmos: {
      key: 'algoritmos',
      title: '🧮 Algoritmos',
      description: 'Ordenação (bubble, selection, insertion, merge), busca binária, remoção de duplicatas, embaralhar e mais.',
      exports: ['busca_binaria','bubble_sort','selection_sort','insertion_sort','merge_sort','inverter_array','remover_duplicatas','achatar','embaralhar','zip_arrays'],
      functions: [
        { name: 'busca_binaria', params: 'arr, alvo', desc: 'Busca binária (array ordenado), retorna índice' },
        { name: 'bubble_sort', params: 'arr', desc: 'Ordena com Bubble Sort' },
        { name: 'selection_sort', params: 'arr', desc: 'Ordena com Selection Sort' },
        { name: 'insertion_sort', params: 'arr', desc: 'Ordena com Insertion Sort' },
        { name: 'merge_sort', params: 'arr', desc: 'Ordena com Merge Sort' },
        { name: 'inverter_array', params: 'arr', desc: 'Inverte a ordem do array' },
        { name: 'remover_duplicatas', params: 'arr', desc: 'Remove elementos duplicados' },
        { name: 'achatar', params: 'arr', desc: 'Achata array multidimensional' },
        { name: 'embaralhar', params: 'arr', desc: 'Embaralha (Fisher-Yates)' },
        { name: 'zip_arrays', params: 'arr1, arr2', desc: 'Combina dois arrays em pares' },
      ],
      jsCode: `function busca_binaria(arr, alvo) { var a = Array.isArray(arr) ? arr : Object.values(arr); var lo = 0, hi = a.length - 1; while (lo <= hi) { var mid = Math.floor((lo + hi) / 2); if (a[mid] === alvo) return mid + 1; if (a[mid] < alvo) lo = mid + 1; else hi = mid - 1; } return -1; }
function bubble_sort(arr) { var a = (Array.isArray(arr) ? arr : Object.values(arr)).slice(); for (var i = 0; i < a.length; i++) for (var j = 0; j < a.length - i - 1; j++) if (a[j] > a[j+1]) { var t = a[j]; a[j] = a[j+1]; a[j+1] = t; } return a; }
function selection_sort(arr) { var a = (Array.isArray(arr) ? arr : Object.values(arr)).slice(); for (var i = 0; i < a.length; i++) { var min = i; for (var j = i+1; j < a.length; j++) if (a[j] < a[min]) min = j; if (min !== i) { var t = a[i]; a[i] = a[min]; a[min] = t; } } return a; }
function insertion_sort(arr) { var a = (Array.isArray(arr) ? arr : Object.values(arr)).slice(); for (var i = 1; i < a.length; i++) { var key = a[i]; var j = i - 1; while (j >= 0 && a[j] > key) { a[j+1] = a[j]; j--; } a[j+1] = key; } return a; }
function merge_sort(arr) { var a = (Array.isArray(arr) ? arr : Object.values(arr)).slice(); if (a.length <= 1) return a; var mid = Math.floor(a.length / 2); var left = merge_sort(a.slice(0, mid)); var right = merge_sort(a.slice(mid)); var result = []; var i = 0, j = 0; while (i < left.length && j < right.length) { if (left[i] <= right[j]) result.push(left[i++]); else result.push(right[j++]); } return result.concat(left.slice(i)).concat(right.slice(j)); }
function inverter_array(arr) { return (Array.isArray(arr) ? arr : Object.values(arr)).slice().reverse(); }
function remover_duplicatas(arr) { var a = Array.isArray(arr) ? arr : Object.values(arr); var seen = {}; var r = []; for (var i = 0; i < a.length; i++) { var k = String(a[i]); if (!seen[k]) { seen[k] = true; r.push(a[i]); } } return r; }
function achatar(arr) { var a = Array.isArray(arr) ? arr : Object.values(arr); var r = []; for (var i = 0; i < a.length; i++) { if (Array.isArray(a[i])) { var sub = achatar(a[i]); for (var j = 0; j < sub.length; j++) r.push(sub[j]); } else r.push(a[i]); } return r; }
function embaralhar(arr) { var a = (Array.isArray(arr) ? arr : Object.values(arr)).slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function zip_arrays(arr1, arr2) { var a = Array.isArray(arr1) ? arr1 : Object.values(arr1); var b = Array.isArray(arr2) ? arr2 : Object.values(arr2); var r = []; for (var i = 0; i < Math.min(a.length, b.length); i++) r.push([a[i], b[i]]); return r; }`,
      example: `importe algoritmos\n\ndefina nums como 64, 34, 25, 12, 22, 11, 90\nexecute bubble_sort(nums)\nexecute merge_sort(nums)\nexecute inverter_array(nums)\nexecute remover_duplicatas(nums)\napresente embaralhar(nums) em dados`,
    },

    // ── saude ────────────────────────────────────────────────
    saude: {
      key: 'saude',
      title: '🏥 Saúde e Bem-Estar',
      description: 'Hidratação, sono ideal, calorias por atividade, gordura corporal, peso ideal, VO2max e nível de stress.',
      exports: ['hidratacao_diaria','sono_ideal','calorias_caminhada','calorias_corrida','gordura_corporal_est','peso_ideal','necessidade_calorica','batimento_repouso_ideal','vo2max','nivel_stress'],
      functions: [
        { name: 'hidratacao_diaria', params: 'peso, ativ_min', desc: 'Água (ml) = peso×35 + atividade×10' },
        { name: 'sono_ideal', params: 'idade', desc: 'Horas de sono recomendadas por idade' },
        { name: 'calorias_caminhada', params: 'peso, min', desc: 'Calorias queimadas caminhando' },
        { name: 'calorias_corrida', params: 'peso, min, vel', desc: 'Calorias queimadas correndo' },
        { name: 'gordura_corporal_est', params: 'cintura, pescoco, altura', desc: 'Estimativa de gordura corporal (%) masc' },
        { name: 'peso_ideal', params: 'altura, sexo', desc: 'Peso ideal Devine (sexo: 1=M, 0=F)' },
        { name: 'necessidade_calorica', params: 'peso,alt_cm,idade,sexo,ativ', desc: 'TDEE completo (Harris-Benedict)' },
        { name: 'batimento_repouso_ideal', params: 'idade', desc: 'FC de repouso ideal por idade' },
        { name: 'vo2max', params: 'fc_rep', desc: 'VO2max estimado (Uth et al.)' },
        { name: 'nivel_stress', params: 'fc_rep, fc_max', desc: 'Índice de stress cardíaco (%)' },
      ],
      jsCode: `function hidratacao_diaria(peso, ativ_min) { return peso * 35 + (ativ_min || 0) * 10; }
function sono_ideal(idade) { if (idade <= 1) return 14; if (idade <= 3) return 12; if (idade <= 5) return 11; if (idade <= 13) return 10; if (idade <= 17) return 9; if (idade <= 64) return 8; return 7; }
function calorias_caminhada(peso, min) { return 0.035 * peso * min; }
function calorias_corrida(peso, min, vel) { return 0.075 * peso * min * (vel / 8); }
function gordura_corporal_est(cintura, pescoco, altura) { return 495 / (1.0324 - 0.19077 * Math.log10(cintura - pescoco) + 0.15456 * Math.log10(altura)) - 450; }
function peso_ideal(altura, sexo) { var alt_pol = altura * 100 / 2.54; if (sexo === 1) return 50 + 2.3 * (alt_pol - 60); return 45.5 + 2.3 * (alt_pol - 60); }
function necessidade_calorica(peso, alt_cm, idade, sexo, ativ) { var tmb; if (sexo === 1) tmb = 88.362 + 13.397*peso + 4.799*alt_cm - 5.677*idade; else tmb = 447.593 + 9.247*peso + 3.098*alt_cm - 4.330*idade; return tmb * ativ; }
function batimento_repouso_ideal(idade) { if (idade <= 10) return 80; if (idade <= 20) return 72; if (idade <= 35) return 68; if (idade <= 50) return 70; if (idade <= 65) return 72; return 74; }
function vo2max(fc_rep) { return 15.3 * (220 / fc_rep); }
function nivel_stress(fc_rep, fc_max) { return (fc_rep / fc_max) * 100; }`,
      example: `importe saude\n\nexecute hidratacao_diaria(75, 60)\nexecute sono_ideal(25)\nexecute calorias_caminhada(80, 30)\nexecute peso_ideal(1.75, 1)\napresente necessidade_calorica(80, 175, 30, 1, 1.55) em destaque`,
    },

    // ── combustivel ──────────────────────────────────────────
    combustivel: {
      key: 'combustivel',
      title: '⛽ Combustível',
      description: 'Consumo médio, custo de viagem, autonomia, etanol vs gasolina, emissão CO₂, IPVA e economia com elétrico.',
      exports: ['consumo_medio','custo_viagem','autonomia','etanol_ou_gasolina','emissao_co2','tempo_viagem','litros_necessarios','custo_por_km','economia_eletrico','ipva_estimado'],
      functions: [
        { name: 'consumo_medio', params: 'km, litros', desc: 'km/L = distância / litros' },
        { name: 'custo_viagem', params: 'dist, consumo, preco', desc: 'Custo total da viagem (R$)' },
        { name: 'autonomia', params: 'tanque, consumo', desc: 'km com tanque cheio' },
        { name: 'etanol_ou_gasolina', params: 'p_etanol, p_gasolina', desc: 'Retorna "etanol" ou "gasolina"' },
        { name: 'emissao_co2', params: 'litros, tipo', desc: 'kg de CO₂ (tipo: 1=gasolina, 2=diesel)' },
        { name: 'tempo_viagem', params: 'dist, velocidade', desc: 'Tempo em horas' },
        { name: 'litros_necessarios', params: 'dist, consumo', desc: 'Litros para percorrer distância' },
        { name: 'custo_por_km', params: 'preco, consumo', desc: 'R$/km' },
        { name: 'economia_eletrico', params: 'dist,kwh,p_kwh,comb,p_comb', desc: 'Economia (R$) do elétrico vs combustão' },
        { name: 'ipva_estimado', params: 'valor, aliquota', desc: 'IPVA = valor × alíquota%' },
      ],
      jsCode: `function consumo_medio(km, litros) { return km / litros; }
function custo_viagem(dist, consumo, preco) { return (dist / consumo) * preco; }
function autonomia(tanque, consumo) { return tanque * consumo; }
function etanol_ou_gasolina(p_etanol, p_gasolina) { return (p_etanol / p_gasolina) <= 0.7 ? 'etanol' : 'gasolina'; }
function emissao_co2(litros, tipo) { if (tipo === 2) return litros * 2.68; return litros * 2.31; }
function tempo_viagem(dist, velocidade) { return dist / velocidade; }
function litros_necessarios(dist, consumo) { return dist / consumo; }
function custo_por_km(preco, consumo) { return preco / consumo; }
function economia_eletrico(dist, consumo_kwh, p_kwh, consumo_comb, p_comb) { var custo_ele = (dist / consumo_kwh) * p_kwh; var custo_comb_total = (dist / consumo_comb) * p_comb; return custo_comb_total - custo_ele; }
function ipva_estimado(valor, aliquota) { return valor * (aliquota / 100); }`,
      example: `importe combustivel\n\nexecute consumo_medio(500, 40)\nexecute custo_viagem(400, 12, 5.89)\nexecute autonomia(55, 12)\nexecute etanol_ou_gasolina(3.89, 5.89)\napresente economia_eletrico(1000, 6, 0.75, 12, 5.89) em destaque`,
    },

    // ── geografia ────────────────────────────────────────────
    geografia: {
      key: 'geografia',
      title: '🌍 Geografia',
      description: 'Distância Haversine, conversão de coordenadas, raio da Terra, altitude por pressão, fuso horário e velocidade de rotação.',
      exports: ['distancia_haversine','graus_para_dms','dms_para_graus','raio_terra','circunferencia_terra','altitude_pressao','fuso_horario','velocidade_rotacao','coordenadas_para_km','distancia_cidades'],
      functions: [
        { name: 'distancia_haversine', params: 'lat1,lon1,lat2,lon2', desc: 'Distância em km entre dois pontos' },
        { name: 'graus_para_dms', params: 'graus', desc: 'Graus decimais → "G° M\' S\""' },
        { name: 'dms_para_graus', params: 'g, m, s', desc: 'Converte DMS para graus decimais' },
        { name: 'raio_terra', params: '', desc: 'Raio médio da Terra (km)' },
        { name: 'circunferencia_terra', params: '', desc: 'Circunferência equatorial (km)' },
        { name: 'altitude_pressao', params: 'pressao', desc: 'Altitude estimada por pressão (hPa)' },
        { name: 'fuso_horario', params: 'longitude', desc: 'Fuso horário UTC por longitude' },
        { name: 'velocidade_rotacao', params: 'latitude', desc: 'Velocidade de rotação (km/h)' },
        { name: 'coordenadas_para_km', params: 'graus_lat', desc: '1 grau de latitude em km' },
        { name: 'distancia_cidades', params: 'lat1,lon1,lat2,lon2', desc: 'Alias para distancia_haversine' },
      ],
      jsCode: `function distancia_haversine(lat1, lon1, lat2, lon2) { var R = 6371; var dLat = (lat2-lat1)*Math.PI/180; var dLon = (lon2-lon1)*Math.PI/180; var a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2); return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); }
function graus_para_dms(graus) { var g = Math.floor(Math.abs(graus)); var mf = (Math.abs(graus)-g)*60; var m = Math.floor(mf); var s = Math.round((mf-m)*60*100)/100; return g + '° ' + m + "' " + s + '"'; }
function dms_para_graus(g, m, s) { return g + m/60 + s/3600; }
function raio_terra() { return 6371; }
function circunferencia_terra() { return 40075; }
function altitude_pressao(pressao) { return 44330 * (1 - Math.pow(pressao/1013.25, 0.1903)); }
function fuso_horario(longitude) { return Math.round(longitude / 15); }
function velocidade_rotacao(latitude) { return 1674.4 * Math.cos(latitude * Math.PI / 180); }
function coordenadas_para_km(graus_lat) { return graus_lat * 111.32; }
function distancia_cidades(lat1, lon1, lat2, lon2) { return distancia_haversine(lat1, lon1, lat2, lon2); }`,
      example: `importe geografia\n\nexecute distancia_haversine(-23.55, -46.63, -22.91, -43.17)\nexecute graus_para_dms(-23.5505)\nexecute raio_terra()\nexecute fuso_horario(-46.63)\napresente velocidade_rotacao(-23.55) em destaque`,
    },

    // ── logica ───────────────────────────────────────────────
    logica: {
      key: 'logica',
      title: '🔣 Lógica',
      description: 'Operações lógicas (AND, OR, NOT, XOR, NAND, NOR), implicação, bicondicional e conversão binária/decimal.',
      exports: ['e_logico','ou_logico','nao_logico','xor_logico','nand_logico','nor_logico','implicacao','bicondicional','decimal_para_binario','binario_para_decimal'],
      functions: [
        { name: 'e_logico', params: 'a, b', desc: 'AND: 1 se ambos verdadeiros' },
        { name: 'ou_logico', params: 'a, b', desc: 'OR: 1 se pelo menos um verdadeiro' },
        { name: 'nao_logico', params: 'a', desc: 'NOT: inverte o valor' },
        { name: 'xor_logico', params: 'a, b', desc: 'XOR: 1 se exatamente um é verdadeiro' },
        { name: 'nand_logico', params: 'a, b', desc: 'NAND: NOT AND' },
        { name: 'nor_logico', params: 'a, b', desc: 'NOR: NOT OR' },
        { name: 'implicacao', params: 'a, b', desc: 'a → b (0 apenas se a=1 e b=0)' },
        { name: 'bicondicional', params: 'a, b', desc: 'a ↔ b (1 se iguais)' },
        { name: 'decimal_para_binario', params: 'n', desc: 'Decimal → string binária' },
        { name: 'binario_para_decimal', params: 's', desc: 'String binária → decimal' },
      ],
      jsCode: `function e_logico(a, b) { return (a && b) ? 1 : 0; }
function ou_logico(a, b) { return (a || b) ? 1 : 0; }
function nao_logico(a) { return a ? 0 : 1; }
function xor_logico(a, b) { return ((a && !b) || (!a && b)) ? 1 : 0; }
function nand_logico(a, b) { return (a && b) ? 0 : 1; }
function nor_logico(a, b) { return (a || b) ? 0 : 1; }
function implicacao(a, b) { return (!a || b) ? 1 : 0; }
function bicondicional(a, b) { return ((a && b) || (!a && !b)) ? 1 : 0; }
function decimal_para_binario(n) { return (n >>> 0).toString(2); }
function binario_para_decimal(s) { return parseInt(String(s), 2); }`,
      example: `importe logica\n\nexecute e_logico(1, 0)\nexecute ou_logico(1, 0)\nexecute xor_logico(1, 1)\nexecute decimal_para_binario(42)\napresente binario_para_decimal("101010") em destaque`,
    },

    // ── probabilidade ────────────────────────────────────────
    probabilidade: {
      key: 'probabilidade',
      title: '🎯 Probabilidade',
      description: 'Probabilidade condicional, Bayes, distribuição binomial, Poisson, normal (PDF), esperança, entropia e arranjos.',
      exports: ['probabilidade_condicional','bayes','distribuicao_binomial','esperanca','variancia_discreta','arranjo','probabilidade_uniao','poisson','normal_pdf','entropia'],
      functions: [
        { name: 'probabilidade_condicional', params: 'pa_e_b, pb', desc: 'P(A|B) = P(A∩B)/P(B)' },
        { name: 'bayes', params: 'pa, pb_a, pb', desc: 'Teorema de Bayes' },
        { name: 'distribuicao_binomial', params: 'n, k, p', desc: 'P(X=k) na binomial' },
        { name: 'esperanca', params: 'vals, probs', desc: 'E(X) = Σ(xi × pi)' },
        { name: 'variancia_discreta', params: 'vals, probs', desc: 'Var(X) discreta' },
        { name: 'arranjo', params: 'n, k', desc: 'A(n,k) = n!/(n-k)!' },
        { name: 'probabilidade_uniao', params: 'pa, pb, pab', desc: 'P(A∪B) = P(A)+P(B)-P(A∩B)' },
        { name: 'poisson', params: 'k, lambda', desc: 'P(X=k) na Poisson' },
        { name: 'normal_pdf', params: 'x, media, dp', desc: 'PDF da distribuição normal' },
        { name: 'entropia', params: 'probs', desc: 'Entropia de Shannon (bits)' },
      ],
      jsCode: `function probabilidade_condicional(pa_e_b, pb) { return pa_e_b / pb; }
function bayes(pa, pb_a, pb) { return (pb_a * pa) / pb; }
function distribuicao_binomial(n, k, p) { var c = 1; for (var i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c * Math.pow(p, k) * Math.pow(1 - p, n - k); }
function esperanca(vals, probs) { var v = Array.isArray(vals) ? vals : Object.values(vals); var pr = Array.isArray(probs) ? probs : Object.values(probs); var s = 0; for (var i = 0; i < v.length; i++) s += Number(v[i]) * Number(pr[i]); return s; }
function variancia_discreta(vals, probs) { var v = Array.isArray(vals) ? vals : Object.values(vals); var pr = Array.isArray(probs) ? probs : Object.values(probs); var mu = esperanca(vals, probs); var s = 0; for (var i = 0; i < v.length; i++) s += pr[i] * Math.pow(Number(v[i]) - mu, 2); return s; }
function arranjo(n, k) { var r = 1; for (var i = n; i > n - k; i--) r *= i; return r; }
function probabilidade_uniao(pa, pb, pab) { return pa + pb - pab; }
function poisson(k, lambda) { var ek = Math.pow(lambda, k) * Math.exp(-lambda); var kf = 1; for (var i = 2; i <= k; i++) kf *= i; return ek / kf; }
function normal_pdf(x, media, dp) { return (1 / (dp * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - media) / dp, 2)); }
function entropia(probs) { var p = Array.isArray(probs) ? probs : Object.values(probs); var s = 0; for (var i = 0; i < p.length; i++) { var pi = Number(p[i]); if (pi > 0) s -= pi * Math.log2(pi); } return s; }`,
      example: `importe probabilidade\n\nexecute bayes(0.01, 0.95, 0.05)\nexecute distribuicao_binomial(10, 3, 0.5)\nexecute poisson(2, 3)\nexecute normal_pdf(0, 0, 1)\napresente entropia(0.5, 0.5) em destaque`,
    },

    // ── algebra_linear ───────────────────────────────────────
    algebra_linear: {
      key: 'algebra_linear',
      title: '📊 Álgebra Linear',
      description: 'Operações com vetores: soma, subtração, produto escalar, norma, normalização, produto vetorial 2D, ângulo e distância.',
      exports: ['vetor_soma','vetor_subtracao','produto_escalar','norma_vetor','normalizar_vetor','produto_vetorial_2d','angulo_vetores','distancia_pontos','ponto_medio','escalar_vetor'],
      functions: [
        { name: 'vetor_soma', params: 'v1, v2', desc: 'Soma de dois vetores (arrays)' },
        { name: 'vetor_subtracao', params: 'v1, v2', desc: 'Subtração v1 - v2' },
        { name: 'produto_escalar', params: 'v1, v2', desc: 'Produto escalar (dot product)' },
        { name: 'norma_vetor', params: 'v', desc: '||v|| — magnitude do vetor' },
        { name: 'normalizar_vetor', params: 'v', desc: 'Vetor unitário (norma = 1)' },
        { name: 'produto_vetorial_2d', params: 'v1, v2', desc: 'Produto vetorial em 2D (escalar)' },
        { name: 'angulo_vetores', params: 'v1, v2', desc: 'Ângulo em graus entre vetores' },
        { name: 'distancia_pontos', params: 'p1, p2', desc: 'Distância euclidiana entre pontos' },
        { name: 'ponto_medio', params: 'p1, p2', desc: 'Ponto médio entre dois pontos' },
        { name: 'escalar_vetor', params: 'v, k', desc: 'Multiplica vetor por escalar' },
      ],
      jsCode: `function vetor_soma(v1, v2) { var a = Array.isArray(v1)?v1:Object.values(v1); var b = Array.isArray(v2)?v2:Object.values(v2); var r = []; for (var i = 0; i < a.length; i++) r.push(Number(a[i]) + Number(b[i])); return r; }
function vetor_subtracao(v1, v2) { var a = Array.isArray(v1)?v1:Object.values(v1); var b = Array.isArray(v2)?v2:Object.values(v2); var r = []; for (var i = 0; i < a.length; i++) r.push(Number(a[i]) - Number(b[i])); return r; }
function produto_escalar(v1, v2) { var a = Array.isArray(v1)?v1:Object.values(v1); var b = Array.isArray(v2)?v2:Object.values(v2); var s = 0; for (var i = 0; i < a.length; i++) s += Number(a[i]) * Number(b[i]); return s; }
function norma_vetor(v) { var a = Array.isArray(v)?v:Object.values(v); var s = 0; for (var i = 0; i < a.length; i++) s += Number(a[i]) * Number(a[i]); return Math.sqrt(s); }
function normalizar_vetor(v) { var a = Array.isArray(v)?v:Object.values(v); var n = norma_vetor(a); return a.map(function(x){return Number(x)/n;}); }
function produto_vetorial_2d(v1, v2) { var a = Array.isArray(v1)?v1:Object.values(v1); var b = Array.isArray(v2)?v2:Object.values(v2); return Number(a[0])*Number(b[1]) - Number(a[1])*Number(b[0]); }
function angulo_vetores(v1, v2) { var dot = produto_escalar(v1, v2); var n1 = norma_vetor(v1); var n2 = norma_vetor(v2); return Math.acos(dot / (n1 * n2)) * 180 / Math.PI; }
function distancia_pontos(p1, p2) { var a = Array.isArray(p1)?p1:Object.values(p1); var b = Array.isArray(p2)?p2:Object.values(p2); var s = 0; for (var i = 0; i < a.length; i++) s += Math.pow(Number(a[i]) - Number(b[i]), 2); return Math.sqrt(s); }
function ponto_medio(p1, p2) { var a = Array.isArray(p1)?p1:Object.values(p1); var b = Array.isArray(p2)?p2:Object.values(p2); var r = []; for (var i = 0; i < a.length; i++) r.push((Number(a[i]) + Number(b[i])) / 2); return r; }
function escalar_vetor(v, k) { var a = Array.isArray(v)?v:Object.values(v); return a.map(function(x){return Number(x)*k;}); }`,
      example: `importe algebra_linear\n\ndefina v1 como 3, 4\ndefina v2 como 1, 2\nexecute vetor_soma(v1, v2)\nexecute produto_escalar(v1, v2)\nexecute norma_vetor(v1)\napresente angulo_vetores(v1, v2) em destaque`,
    },

    // ── progressoes ──────────────────────────────────────────
    progressoes: {
      key: 'progressoes',
      title: '🔢 Progressões',
      description: 'Progressão aritmética e geométrica: termos, somas, razões, séries harmônicas e geradores de sequências.',
      exports: ['pa_termo','pa_soma','pg_termo','pg_soma','pg_soma_infinita','pa_razao','pg_razao','pa_gerar','pg_gerar','serie_harmonica'],
      functions: [
        { name: 'pa_termo', params: 'a1, r, n', desc: 'N-ésimo termo da PA: a1 + (n-1)×r' },
        { name: 'pa_soma', params: 'a1, r, n', desc: 'Soma dos N primeiros termos da PA' },
        { name: 'pg_termo', params: 'a1, q, n', desc: 'N-ésimo termo da PG: a1 × q^(n-1)' },
        { name: 'pg_soma', params: 'a1, q, n', desc: 'Soma dos N primeiros termos da PG' },
        { name: 'pg_soma_infinita', params: 'a1, q', desc: 'Soma infinita PG (|q|<1): a1/(1-q)' },
        { name: 'pa_razao', params: 'a1, an, n', desc: 'Razão da PA dados primeiro, último e n' },
        { name: 'pg_razao', params: 'a1, an, n', desc: 'Razão da PG dados primeiro, último e n' },
        { name: 'pa_gerar', params: 'a1, r, n', desc: 'Gera array com N termos da PA' },
        { name: 'pg_gerar', params: 'a1, q, n', desc: 'Gera array com N termos da PG' },
        { name: 'serie_harmonica', params: 'n', desc: 'Soma da série harmônica: Σ(1/k)' },
      ],
      jsCode: `function pa_termo(a1, r, n) { return a1 + (n - 1) * r; }
function pa_soma(a1, r, n) { return (n / 2) * (2 * a1 + (n - 1) * r); }
function pg_termo(a1, q, n) { return a1 * Math.pow(q, n - 1); }
function pg_soma(a1, q, n) { if (q === 1) return a1 * n; return a1 * (Math.pow(q, n) - 1) / (q - 1); }
function pg_soma_infinita(a1, q) { return a1 / (1 - q); }
function pa_razao(a1, an, n) { return (an - a1) / (n - 1); }
function pg_razao(a1, an, n) { return Math.pow(an / a1, 1 / (n - 1)); }
function pa_gerar(a1, r, n) { var arr = []; for (var i = 0; i < n; i++) arr.push(a1 + i * r); return arr; }
function pg_gerar(a1, q, n) { var arr = []; for (var i = 0; i < n; i++) arr.push(a1 * Math.pow(q, i)); return arr; }
function serie_harmonica(n) { var s = 0; for (var i = 1; i <= n; i++) s += 1 / i; return s; }`,
      example: `importe progressoes\n\nexecute pa_termo(2, 3, 10)\nexecute pa_soma(1, 2, 100)\nexecute pg_termo(3, 2, 8)\nexecute pg_soma_infinita(10, 0.5)\napresente pa_gerar(1, 5, 8) em dados`,
    },

    // ── numeros ──────────────────────────────────────────────
    numeros: {
      key: 'numeros',
      title: '🔬 Teoria dos Números',
      description: 'Primalidade, divisores, fatoração prima, totiente de Euler, números perfeitos, palíndromos e Armstrong.',
      exports: ['eh_primo','primos_ate','eh_perfeito','divisores','soma_divisores','totiente_euler','eh_palindromo_num','eh_armstrong','fatoracao_prima','proximo_primo'],
      functions: [
        { name: 'eh_primo', params: 'n', desc: 'Retorna 1 se primo, 0 se não' },
        { name: 'primos_ate', params: 'n', desc: 'Array de primos até N' },
        { name: 'eh_perfeito', params: 'n', desc: '1 se número perfeito (soma divisores = n)' },
        { name: 'divisores', params: 'n', desc: 'Array com todos os divisores de N' },
        { name: 'soma_divisores', params: 'n', desc: 'Soma de todos os divisores' },
        { name: 'totiente_euler', params: 'n', desc: 'φ(n) — coprimos menores que n' },
        { name: 'eh_palindromo_num', params: 'n', desc: '1 se N é palíndromo numérico' },
        { name: 'eh_armstrong', params: 'n', desc: '1 se N é número de Armstrong' },
        { name: 'fatoracao_prima', params: 'n', desc: 'Array com fatores primos' },
        { name: 'proximo_primo', params: 'n', desc: 'Menor primo maior que N' },
      ],
      jsCode: `function eh_primo(n) { if (n < 2) return 0; if (n < 4) return 1; if (n % 2 === 0 || n % 3 === 0) return 0; for (var i = 5; i * i <= n; i += 6) if (n % i === 0 || n % (i+2) === 0) return 0; return 1; }
function primos_ate(n) { var r = []; for (var i = 2; i <= n; i++) if (eh_primo(i)) r.push(i); return r; }
function eh_perfeito(n) { if (n < 2) return 0; var s = 1; for (var i = 2; i * i <= n; i++) if (n % i === 0) { s += i; if (i !== n/i) s += n/i; } return s === n ? 1 : 0; }
function divisores(n) { var r = []; for (var i = 1; i <= Math.sqrt(n); i++) if (n % i === 0) { r.push(i); if (i !== n/i) r.push(n/i); } return r.sort(function(a,b){return a-b;}); }
function soma_divisores(n) { var s = 0; for (var i = 1; i <= n; i++) if (n % i === 0) s += i; return s; }
function totiente_euler(n) { var r = n; for (var p = 2; p * p <= n; p++) if (n % p === 0) { while (n % p === 0) n /= p; r -= r / p; } if (n > 1) r -= r / n; return Math.round(r); }
function eh_palindromo_num(n) { var s = String(Math.abs(n)); return s === s.split('').reverse().join('') ? 1 : 0; }
function eh_armstrong(n) { var s = String(Math.abs(n)); var d = s.length; var soma = 0; for (var i = 0; i < d; i++) soma += Math.pow(parseInt(s[i]), d); return soma === Math.abs(n) ? 1 : 0; }
function fatoracao_prima(n) { var r = []; var num = Math.abs(n); for (var d = 2; d * d <= num; d++) while (num % d === 0) { r.push(d); num /= d; } if (num > 1) r.push(num); return r; }
function proximo_primo(n) { var c = n + 1; while (!eh_primo(c)) c++; return c; }`,
      example: `importe numeros\n\nexecute eh_primo(97)\nexecute primos_ate(50)\nexecute divisores(60)\nexecute fatoracao_prima(360)\napresente totiente_euler(12) em destaque`,
    },

    // ── engenharia_civil ─────────────────────────────────────
    engenharia_civil: {
      key: 'engenharia_civil',
      title: '🏗️ Engenharia Civil',
      description: 'Área de laje, volume de concreto, carga de pilar, momento fletor, tensão, deformação, módulo de Young e flecha.',
      exports: ['area_laje','volume_concreto','carga_pilar','momento_fletor','tensao_eng','deformacao_eng','modulo_young','flecha_viga','perimetro_fundacao','aco_minimo'],
      functions: [
        { name: 'area_laje', params: 'c, l', desc: 'Área = comprimento × largura (m²)' },
        { name: 'volume_concreto', params: 'c, l, e', desc: 'Volume = c × l × espessura (m³)' },
        { name: 'carga_pilar', params: 'fck, area', desc: 'Carga = fck × área (kN)' },
        { name: 'momento_fletor', params: 'f, l', desc: 'M = F × L / 4 (viga bi-apoiada)' },
        { name: 'tensao_eng', params: 'f, a', desc: 'σ = Força / Área (MPa)' },
        { name: 'deformacao_eng', params: 'delta_l, l0', desc: 'ε = ΔL / L₀' },
        { name: 'modulo_young', params: 'tensao, deformacao', desc: 'E = σ / ε (GPa)' },
        { name: 'flecha_viga', params: 'f, l, e, i', desc: 'δ = FL³ / (48EI)' },
        { name: 'perimetro_fundacao', params: 'c, l', desc: 'P = 2(c + l) (m)' },
        { name: 'aco_minimo', params: 'b, d, fck, fyk', desc: 'As,min (cm²) — taxa mínima NBR' },
      ],
      jsCode: `function area_laje(c, l) { return c * l; }
function volume_concreto(c, l, e) { return c * l * e; }
function carga_pilar(fck, area) { return fck * area; }
function momento_fletor(f, l) { return (f * l) / 4; }
function tensao_eng(f, a) { return f / a; }
function deformacao_eng(delta_l, l0) { return delta_l / l0; }
function modulo_young(tensao, deformacao) { return tensao / deformacao; }
function flecha_viga(f, l, e, i) { return (f * Math.pow(l, 3)) / (48 * e * i); }
function perimetro_fundacao(c, l) { return 2 * (c + l); }
function aco_minimo(b, d, fck, fyk) { return 0.15 * (fck / fyk) * b * d; }`,
      example: `importe engenharia_civil\n\nexecute area_laje(8, 5)\nexecute volume_concreto(8, 5, 0.12)\nexecute momento_fletor(10000, 6)\nexecute tensao_eng(50000, 0.04)\napresente modulo_young(250, 0.001) em destaque`,
    },

    // ── datas ────────────────────────────────────────────────
    datas: {
      key: 'datas',
      selo: 'recomendada',
      title: '📅 Datas e Tempo',
      description: 'Diferença entre datas, ano bissexto, dia da semana, idade, conversão horas/minutos/segundos e dias no mês.',
      exports: ['dias_entre','eh_bissexto','dias_no_mes','dia_da_semana','idade_anos','semanas_entre','horas_para_minutos','minutos_para_horas','segundos_para_hms','timestamp_dias'],
      functions: [
        { name: 'dias_entre', params: 'd1m,d1d,d1a,d2m,d2d,d2a', desc: 'Dias entre duas datas' },
        { name: 'eh_bissexto', params: 'ano', desc: '1 se bissexto, 0 se não' },
        { name: 'dias_no_mes', params: 'mes, ano', desc: 'Número de dias no mês (1–12)' },
        { name: 'dia_da_semana', params: 'd, m, a', desc: 'Nome do dia (Zeller)' },
        { name: 'idade_anos', params: 'd, m, a', desc: 'Idade em anos completos' },
        { name: 'semanas_entre', params: 'dias', desc: 'Converte dias em semanas' },
        { name: 'horas_para_minutos', params: 'h', desc: 'Horas → minutos' },
        { name: 'minutos_para_horas', params: 'm', desc: 'Minutos → horas (decimal)' },
        { name: 'segundos_para_hms', params: 's', desc: 'Segundos → "HH:MM:SS"' },
        { name: 'timestamp_dias', params: 'ts', desc: 'Timestamp (ms) → dias' },
      ],
      jsCode: `function dias_entre(d1m,d1d,d1a,d2m,d2d,d2a) { var a = new Date(d1a,d1m-1,d1d); var b = new Date(d2a,d2m-1,d2d); return Math.round(Math.abs(b-a)/(1000*60*60*24)); }
function eh_bissexto(ano) { return (ano%4===0&&ano%100!==0)||(ano%400===0)?1:0; }
function dias_no_mes(mes, ano) { return new Date(ano, mes, 0).getDate(); }
function dia_da_semana(d, m, a) { var dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']; return dias[new Date(a,m-1,d).getDay()]; }
function idade_anos(d, m, a) { var hoje = new Date(); var nasc = new Date(a, m-1, d); var idade = hoje.getFullYear()-nasc.getFullYear(); var mDif = hoje.getMonth()-nasc.getMonth(); if (mDif<0||(mDif===0&&hoje.getDate()<nasc.getDate())) idade--; return idade; }
function semanas_entre(dias) { return dias / 7; }
function horas_para_minutos(h) { return h * 60; }
function minutos_para_horas(m) { return m / 60; }
function segundos_para_hms(s) { var h = Math.floor(s/3600); var m = Math.floor((s%3600)/60); var sec = Math.floor(s%60); return (h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec; }
function timestamp_dias(ts) { return ts / (1000*60*60*24); }`,
      example: `importe datas\n\nexecute dias_entre(1,1,2025,12,31,2025)\nexecute eh_bissexto(2024)\nexecute dia_da_semana(25,12,2025)\nexecute idade_anos(15,3,1995)\napresente segundos_para_hms(3661) em destaque`,
    },

    // ── financas_br ──────────────────────────────────────────
    financas_br: {
      key: 'financas_br',
      title: '🇧🇷 Finanças Brasil',
      description: 'INSS, IRRF, salário líquido, FGTS, férias, 13º salário, rescisão e hora extra. Cálculos trabalhistas brasileiros.',
      exports: ['inss','irrf','salario_liquido','fgts','ferias_salario','decimo_terceiro','rescisao','hora_extra','salario_hora','vale_transporte'],
      functions: [
        { name: 'inss', params: 'salario', desc: 'Desconto INSS progressivo (2024)' },
        { name: 'irrf', params: 'salario, dep', desc: 'IRRF após dedução INSS e dependentes' },
        { name: 'salario_liquido', params: 'bruto, dep', desc: 'Salário líquido (bruto - INSS - IRRF)' },
        { name: 'fgts', params: 'salario', desc: 'FGTS mensal = 8% do salário' },
        { name: 'ferias_salario', params: 'salario', desc: 'Férias = salário + 1/3' },
        { name: 'decimo_terceiro', params: 'salario, meses', desc: '13º proporcional a meses trabalhados' },
        { name: 'rescisao', params: 'salario, meses, tipo', desc: 'Rescisão (tipo: 1=sem justa causa, 2=com)' },
        { name: 'hora_extra', params: 'sal_hora, perc', desc: 'Valor hora extra com percentual' },
        { name: 'salario_hora', params: 'salario, horas', desc: 'Salário / horas mensais' },
        { name: 'vale_transporte', params: 'salario', desc: 'Desconto VT = 6% do salário' },
      ],
      jsCode: `function inss(salario) { if (salario <= 1412) return salario * 0.075; if (salario <= 2666.68) return 105.90 + (salario - 1412) * 0.09; if (salario <= 4000.03) return 218.82 + (salario - 2666.68) * 0.12; if (salario <= 7786.02) return 378.82 + (salario - 4000.03) * 0.14; return 908.85; }
function irrf(salario, dep) { var base = salario - inss(salario) - (dep || 0) * 189.59; if (base <= 2259.20) return 0; if (base <= 2826.65) return base * 0.075 - 169.44; if (base <= 3751.05) return base * 0.15 - 381.44; if (base <= 4664.68) return base * 0.225 - 662.77; return base * 0.275 - 896.00; }
function salario_liquido(bruto, dep) { return bruto - inss(bruto) - irrf(bruto, dep || 0); }
function fgts(salario) { return salario * 0.08; }
function ferias_salario(salario) { return salario + salario / 3; }
function decimo_terceiro(salario, meses) { return (salario / 12) * meses; }
function rescisao(salario, meses, tipo) { var saldo = salario; var ferias_prop = (salario / 12) * meses + ((salario / 12) * meses) / 3; var decimo = (salario / 12) * meses; var aviso = tipo === 1 ? salario : 0; var multa_fgts = tipo === 1 ? fgts(salario) * meses * 0.4 : 0; return saldo + ferias_prop + decimo + aviso + multa_fgts; }
function hora_extra(sal_hora, perc) { return sal_hora * (1 + perc / 100); }
function salario_hora(salario, horas) { return salario / (horas || 220); }
function vale_transporte(salario) { return salario * 0.06; }`,
      example: `importe financas_br\n\nexecute inss(5000)\nexecute irrf(5000, 2)\nexecute salario_liquido(5000, 2)\nexecute fgts(5000)\napresente ferias_salario(5000) em destaque`,
    },

    // ── matrizes ─────────────────────────────────────────────
    matrizes: {
      key: 'matrizes',
      title: '🔢 Matrizes',
      description: 'Criação, soma, multiplicação, transposta, determinante (2×2 e 3×3), traço e inversa de matrizes.',
      exports: ['matriz_criar','matriz_identidade','matriz_transposta','matriz_soma','matriz_multiplicar','determinante_2x2','determinante_3x3','matriz_escalar','traco','matriz_inversa_2x2'],
      functions: [
        { name: 'matriz_criar', params: 'lin, col, val', desc: 'Cria matriz lin×col preenchida com val' },
        { name: 'matriz_identidade', params: 'n', desc: 'Matriz identidade n×n' },
        { name: 'matriz_transposta', params: 'm', desc: 'Transposta da matriz' },
        { name: 'matriz_soma', params: 'm1, m2', desc: 'Soma de duas matrizes' },
        { name: 'matriz_multiplicar', params: 'm1, m2', desc: 'Multiplicação de matrizes' },
        { name: 'determinante_2x2', params: 'm', desc: 'Determinante de matriz 2×2' },
        { name: 'determinante_3x3', params: 'm', desc: 'Determinante de matriz 3×3 (Sarrus)' },
        { name: 'matriz_escalar', params: 'm, k', desc: 'Multiplica matriz por escalar' },
        { name: 'traco', params: 'm', desc: 'Traço (soma da diagonal principal)' },
        { name: 'matriz_inversa_2x2', params: 'm', desc: 'Inversa de matriz 2×2' },
      ],
      jsCode: `function matriz_criar(lin, col, val) { var m = []; for (var i = 0; i < lin; i++) { var row = []; for (var j = 0; j < col; j++) row.push(val || 0); m.push(row); } return m; }
function matriz_identidade(n) { var m = matriz_criar(n, n, 0); for (var i = 0; i < n; i++) m[i][i] = 1; return m; }
function matriz_transposta(m) { var r = []; for (var j = 0; j < m[0].length; j++) { var row = []; for (var i = 0; i < m.length; i++) row.push(m[i][j]); r.push(row); } return r; }
function matriz_soma(m1, m2) { var r = []; for (var i = 0; i < m1.length; i++) { var row = []; for (var j = 0; j < m1[0].length; j++) row.push(m1[i][j] + m2[i][j]); r.push(row); } return r; }
function matriz_multiplicar(m1, m2) { var r = []; for (var i = 0; i < m1.length; i++) { var row = []; for (var j = 0; j < m2[0].length; j++) { var s = 0; for (var k = 0; k < m1[0].length; k++) s += m1[i][k] * m2[k][j]; row.push(s); } r.push(row); } return r; }
function determinante_2x2(m) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }
function determinante_3x3(m) { return m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]); }
function matriz_escalar(m, k) { return m.map(function(row){return row.map(function(v){return v*k;});}); }
function traco(m) { var s = 0; for (var i = 0; i < Math.min(m.length, m[0].length); i++) s += m[i][i]; return s; }
function matriz_inversa_2x2(m) { var det = determinante_2x2(m); if (det === 0) return 'Matriz singular'; return [[m[1][1]/det, -m[0][1]/det], [-m[1][0]/det, m[0][0]/det]]; }`,
      example: `importe matrizes\n\nexecute matriz_identidade(3)\nexecute determinante_2x2([[3,8],[4,6]])\nexecute determinante_3x3([[6,1,1],[4,-2,5],[2,8,7]])\nexecute traco([[1,2],[3,4]])\napresente matriz_inversa_2x2([[4,7],[2,6]]) em dados`,
    },

    // ── aleatorio ────────────────────────────────────────────
    aleatorio: {
      key: 'aleatorio',
      selo: 'recomendada',
      title: '🎲 Aleatório',
      description: 'Geração de números aleatórios, escolha de itens, amostragem, sorteio, moeda, dado e UUID simples.',
      exports: ['inteiro_aleatorio','decimal_aleatorio','escolher','amostra','chance','moeda','dado','embaralhar_texto','uuid_simples','lista_aleatoria'],
      functions: [
        { name: 'inteiro_aleatorio', params: 'min, max', desc: 'Inteiro aleatório entre min e max' },
        { name: 'decimal_aleatorio', params: 'min, max', desc: 'Decimal aleatório entre min e max' },
        { name: 'escolher', params: 'arr', desc: 'Escolhe um item aleatório do array' },
        { name: 'amostra', params: 'arr, n', desc: 'N itens aleatórios sem repetição' },
        { name: 'chance', params: 'percentual', desc: 'Retorna 1 com X% de chance, 0 caso contrário' },
        { name: 'moeda', params: '', desc: 'Cara (1) ou Coroa (0)' },
        { name: 'dado', params: 'lados', desc: 'Lança um dado de N lados' },
        { name: 'embaralhar_texto', params: 's', desc: 'Embaralha as letras de um texto' },
        { name: 'uuid_simples', params: '', desc: 'Gera ID único simples (hex)' },
        { name: 'lista_aleatoria', params: 'n, min, max', desc: 'Array de N inteiros aleatórios' },
      ],
      jsCode: `function inteiro_aleatorio(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function decimal_aleatorio(min, max) { return Math.random() * (max - min) + min; }
function escolher(arr) { var a = Array.isArray(arr) ? arr : Object.values(arr); return a[Math.floor(Math.random() * a.length)]; }
function amostra(arr, n) { var a = (Array.isArray(arr) ? arr : Object.values(arr)).slice(); var r = []; for (var i = 0; i < n && a.length > 0; i++) { var idx = Math.floor(Math.random() * a.length); r.push(a.splice(idx, 1)[0]); } return r; }
function chance(percentual) { return Math.random() * 100 < percentual ? 1 : 0; }
function moeda() { return Math.random() < 0.5 ? 1 : 0; }
function dado(lados) { return Math.floor(Math.random() * (lados || 6)) + 1; }
function embaralhar_texto(s) { var a = String(s).split(''); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a.join(''); }
function uuid_simples() { var h = '0123456789abcdef'; var r = ''; for (var i = 0; i < 32; i++) { r += h[Math.floor(Math.random()*16)]; if (i===7||i===11||i===15||i===19) r += '-'; } return r; }
function lista_aleatoria(n, min, max) { var r = []; for (var i = 0; i < n; i++) r.push(inteiro_aleatorio(min, max)); return r; }`,
      example: `importe aleatorio\n\nexecute inteiro_aleatorio(1, 100)\nexecute moeda()\nexecute dado(20)\nexecute uuid_simples()\napresente lista_aleatoria(10, 1, 50) em dados`,
    },

    // ── calculo ──────────────────────────────────────────────
    calculo: {
      key: 'calculo',
      selo: 'recomendada',
      title: '∫ Cálculo Numérico',
      description: 'Derivada, integral (trapézio/Simpson), séries de Taylor, método de Newton e busca de pontos críticos.',
      exports: ['derivada','integral_numerica','ponto_critico','area_curva','serie_taylor_exp','serie_taylor_seno','serie_taylor_cosseno','metodo_newton','trapezio','simpson'],
      functions: [
        { name: 'derivada', params: 'f, x, h', desc: 'Derivada numérica f\'(x) com passo h' },
        { name: 'integral_numerica', params: 'f, a, b, n', desc: 'Integral por trapézio com n subdivisões' },
        { name: 'ponto_critico', params: 'f, a, b, prec', desc: 'Busca ponto onde f\'(x)≈0 no intervalo' },
        { name: 'area_curva', params: 'f, a, b', desc: 'Área sob a curva (Simpson, n=1000)' },
        { name: 'serie_taylor_exp', params: 'x, termos', desc: 'e^x via série de Taylor' },
        { name: 'serie_taylor_seno', params: 'x, termos', desc: 'sen(x) via série de Taylor (rad)' },
        { name: 'serie_taylor_cosseno', params: 'x, termos', desc: 'cos(x) via série de Taylor (rad)' },
        { name: 'metodo_newton', params: 'f, df, x0, iter', desc: 'Raiz por Newton-Raphson' },
        { name: 'trapezio', params: 'f, a, b, n', desc: 'Regra do trapézio' },
        { name: 'simpson', params: 'f, a, b, n', desc: 'Regra de Simpson 1/3' },
      ],
      jsCode: `function derivada(f, x, h) { h = h || 0.0001; return (f(x + h) - f(x - h)) / (2 * h); }
function integral_numerica(f, a, b, n) { return trapezio(f, a, b, n || 1000); }
function ponto_critico(f, a, b, prec) { prec = prec || 0.0001; var step = (b - a) / 10000; for (var x = a; x <= b; x += step) { var d = derivada(f, x, prec); if (Math.abs(d) < prec) return x; } return null; }
function area_curva(f, a, b) { return simpson(f, a, b, 1000); }
function serie_taylor_exp(x, termos) { var s = 0; var t = 1; for (var n = 0; n < termos; n++) { s += t; t *= x / (n + 1); } return s; }
function serie_taylor_seno(x, termos) { var s = 0; for (var n = 0; n < termos; n++) { var exp = 2*n+1; var coef = Math.pow(-1, n); var fat = 1; for (var i = 2; i <= exp; i++) fat *= i; s += coef * Math.pow(x, exp) / fat; } return s; }
function serie_taylor_cosseno(x, termos) { var s = 0; for (var n = 0; n < termos; n++) { var exp = 2*n; var coef = Math.pow(-1, n); var fat = 1; for (var i = 2; i <= exp; i++) fat *= i; s += coef * Math.pow(x, exp) / fat; } return s; }
function metodo_newton(f, df, x0, iter) { var x = x0; for (var i = 0; i < (iter || 100); i++) { var fx = f(x); var dfx = df(x); if (Math.abs(dfx) < 1e-15) break; x = x - fx / dfx; } return x; }
function trapezio(f, a, b, n) { n = n || 1000; var h = (b - a) / n; var s = (f(a) + f(b)) / 2; for (var i = 1; i < n; i++) s += f(a + i * h); return s * h; }
function simpson(f, a, b, n) { n = n || 1000; if (n % 2 !== 0) n++; var h = (b - a) / n; var s = f(a) + f(b); for (var i = 1; i < n; i += 2) s += 4 * f(a + i * h); for (var i = 2; i < n; i += 2) s += 2 * f(a + i * h); return (s * h) / 3; }`,
      example: `importe calculo\n\n# Derivada de x² no ponto x=3\nexecute derivada(funcao(x) retorne x*x fim, 3, 0.001)\n\n# Integral de x² de 0 a 1\nexecute simpson(funcao(x) retorne x*x fim, 0, 1, 100)\n\nexecute serie_taylor_exp(1, 20)\napresente serie_taylor_seno(3.14159/6, 10) em destaque`,
    },

    // ── estatistica_descritiva ───────────────────────────────
    estatistica_descritiva: {
      key: 'estatistica_descritiva',
      title: '📉 Estatísticas Descritivas',
      description: 'Quartis, percentis, IQR, amplitude, moda, mediana, média, detecção de outliers, frequência e resumo de 5 números.',
      exports: ['quartil','percentil','iqr','amplitude','moda_array','mediana_array','media_array','outliers','frequencia_array','resumo_5num'],
      functions: [
        { name: 'quartil', params: 'arr, q', desc: 'Quartil (q=1,2,3)' },
        { name: 'percentil', params: 'arr, p', desc: 'Percentil (0–100)' },
        { name: 'iqr', params: 'arr', desc: 'Intervalo interquartil (Q3 - Q1)' },
        { name: 'amplitude', params: 'arr', desc: 'Amplitude = máx - mín' },
        { name: 'moda_array', params: 'arr', desc: 'Valor mais frequente' },
        { name: 'mediana_array', params: 'arr', desc: 'Mediana do array' },
        { name: 'media_array', params: 'arr', desc: 'Média aritmética' },
        { name: 'outliers', params: 'arr', desc: 'Valores fora de 1.5×IQR' },
        { name: 'frequencia_array', params: 'arr', desc: 'Objeto com frequência de cada valor' },
        { name: 'resumo_5num', params: 'arr', desc: 'Mín, Q1, Mediana, Q3, Máx' },
      ],
      jsCode: `function _sort_nums(arr) { var a = (Array.isArray(arr)?arr:Object.values(arr)).map(Number).filter(function(v){return !isNaN(v);}); return a.sort(function(x,y){return x-y;}); }
function percentil(arr, p) { var s = _sort_nums(arr); var i = (p/100)*(s.length-1); var lo = Math.floor(i); var hi = Math.ceil(i); if (lo===hi) return s[lo]; return s[lo]+(s[hi]-s[lo])*(i-lo); }
function quartil(arr, q) { return percentil(arr, q*25); }
function iqr(arr) { return quartil(arr,3)-quartil(arr,1); }
function amplitude(arr) { var s = _sort_nums(arr); return s[s.length-1]-s[0]; }
function moda_array(arr) { var a = (Array.isArray(arr)?arr:Object.values(arr)); var freq={}; var maxF=0; var moda=a[0]; a.forEach(function(v){freq[v]=(freq[v]||0)+1;if(freq[v]>maxF){maxF=freq[v];moda=v;}}); return moda; }
function mediana_array(arr) { return percentil(arr, 50); }
function media_array(arr) { var a = _sort_nums(arr); return a.reduce(function(s,v){return s+v;},0)/a.length; }
function outliers(arr) { var q1=quartil(arr,1); var q3=quartil(arr,3); var iq=q3-q1; var lo=q1-1.5*iq; var hi=q3+1.5*iq; return _sort_nums(arr).filter(function(v){return v<lo||v>hi;}); }
function frequencia_array(arr) { var a = (Array.isArray(arr)?arr:Object.values(arr)); var f={}; a.forEach(function(v){f[v]=(f[v]||0)+1;}); return f; }
function resumo_5num(arr) { return {min:_sort_nums(arr)[0],Q1:quartil(arr,1),mediana:mediana_array(arr),Q3:quartil(arr,3),max:_sort_nums(arr)[_sort_nums(arr).length-1]}; }`,
      example: `importe estatistica_descritiva\n\ndefina dados como 2, 4, 7, 8, 10, 12, 15, 18, 25, 50\nexecute media_array(dados)\nexecute mediana_array(dados)\nexecute quartil(dados, 1)\nexecute iqr(dados)\napresente outliers(dados) em dados`,
    },

    // ── geometria_analitica ──────────────────────────────────
    geometria_analitica: {
      key: 'geometria_analitica',
      title: '📏 Geometria Analítica',
      description: 'Equação da reta, coeficiente angular, distância ponto-reta, interseção de retas, área por vértices e baricentro.',
      exports: ['equacao_reta','coeficiente_angular','distancia_ponto_reta','retas_paralelas','retas_perpendiculares','intersecao_retas','area_poligono_vertices','equacao_circulo','ponto_na_reta','baricentro'],
      functions: [
        { name: 'equacao_reta', params: 'x1,y1,x2,y2', desc: 'Retorna "y = mx + b"' },
        { name: 'coeficiente_angular', params: 'x1,y1,x2,y2', desc: 'm = (y2-y1)/(x2-x1)' },
        { name: 'distancia_ponto_reta', params: 'px,py,a,b,c', desc: '|ax+by+c|/√(a²+b²)' },
        { name: 'retas_paralelas', params: 'm1, m2', desc: '1 se paralelas (m1 = m2)' },
        { name: 'retas_perpendiculares', params: 'm1, m2', desc: '1 se perpendiculares (m1×m2 = -1)' },
        { name: 'intersecao_retas', params: 'a1,b1,c1,a2,b2,c2', desc: 'Ponto de interseção [x, y]' },
        { name: 'area_poligono_vertices', params: 'xs, ys', desc: 'Área pelo método de Gauss (Shoelace)' },
        { name: 'equacao_circulo', params: 'cx,cy,r,x,y', desc: 'Verifica se ponto está no círculo' },
        { name: 'ponto_na_reta', params: 'x, m, b', desc: 'y = mx + b' },
        { name: 'baricentro', params: 'x1,y1,x2,y2,x3,y3', desc: 'Baricentro do triângulo' },
      ],
      jsCode: `function equacao_reta(x1,y1,x2,y2) { var m = (y2-y1)/(x2-x1); var b = y1-m*x1; return 'y = '+Math.round(m*10000)/10000+'x + '+Math.round(b*10000)/10000; }
function coeficiente_angular(x1,y1,x2,y2) { return (y2-y1)/(x2-x1); }
function distancia_ponto_reta(px,py,a,b,c) { return Math.abs(a*px+b*py+c)/Math.sqrt(a*a+b*b); }
function retas_paralelas(m1,m2) { return Math.abs(m1-m2)<1e-10?1:0; }
function retas_perpendiculares(m1,m2) { return Math.abs(m1*m2+1)<1e-10?1:0; }
function intersecao_retas(a1,b1,c1,a2,b2,c2) { var det=a1*b2-a2*b1; if(Math.abs(det)<1e-10) return 'Retas paralelas'; return [(-c1*b2+c2*b1)/det, (-a1*c2+a2*c1)/det]; }
function area_poligono_vertices(xs,ys) { var x=Array.isArray(xs)?xs:Object.values(xs); var y=Array.isArray(ys)?ys:Object.values(ys); var n=x.length; var s=0; for(var i=0;i<n;i++){var j=(i+1)%n;s+=Number(x[i])*Number(y[j])-Number(x[j])*Number(y[i]);} return Math.abs(s)/2; }
function equacao_circulo(cx,cy,r,x,y) { var d=Math.sqrt((x-cx)*(x-cx)+(y-cy)*(y-cy)); if(Math.abs(d-r)<0.01) return 'Na circunferência'; return d<r?'Dentro':'Fora'; }
function ponto_na_reta(x,m,b) { return m*x+b; }
function baricentro(x1,y1,x2,y2,x3,y3) { return [(x1+x2+x3)/3,(y1+y2+y3)/3]; }`,
      example: `importe geometria_analitica\n\nexecute equacao_reta(0, 1, 2, 5)\nexecute coeficiente_angular(0, 0, 3, 6)\nexecute distancia_ponto_reta(1, 1, 1, -1, 0)\nexecute baricentro(0,0, 4,0, 2,3)\napresente area_poligono_vertices(0,4,4,0, 0,0,3,3) em destaque`,
    },

    // ── unidades_dados ───────────────────────────────────────
    unidades_dados: {
      key: 'unidades_dados',
      title: '💾 Unidades de Dados',
      description: 'Conversões entre bytes, KB, MB, GB, TB. Tempo de download, armazenamento de vídeo/foto e largura de banda.',
      exports: ['bytes_para_kb','bytes_para_mb','bytes_para_gb','gb_para_bytes','tempo_download','velocidade_bps_para_mbps','armazenamento_video','armazenamento_foto','bits_para_bytes','largura_banda'],
      functions: [
        { name: 'bytes_para_kb', params: 'b', desc: 'Bytes → Kilobytes' },
        { name: 'bytes_para_mb', params: 'b', desc: 'Bytes → Megabytes' },
        { name: 'bytes_para_gb', params: 'b', desc: 'Bytes → Gigabytes' },
        { name: 'gb_para_bytes', params: 'gb', desc: 'GB → Bytes' },
        { name: 'tempo_download', params: 'tam_mb, vel_mbps', desc: 'Tempo em segundos' },
        { name: 'velocidade_bps_para_mbps', params: 'bps', desc: 'bps → Mbps' },
        { name: 'armazenamento_video', params: 'min, bitrate', desc: 'MB para minutos de vídeo' },
        { name: 'armazenamento_foto', params: 'mp, compressao', desc: 'MB por foto (MP × fator)' },
        { name: 'bits_para_bytes', params: 'bits', desc: 'Bits → Bytes' },
        { name: 'largura_banda', params: 'usuarios, consumo', desc: 'Banda total necessária (Mbps)' },
      ],
      jsCode: `function bytes_para_kb(b) { return b / 1024; }
function bytes_para_mb(b) { return b / (1024*1024); }
function bytes_para_gb(b) { return b / (1024*1024*1024); }
function gb_para_bytes(gb) { return gb * 1024*1024*1024; }
function tempo_download(tam_mb, vel_mbps) { return (tam_mb * 8) / vel_mbps; }
function velocidade_bps_para_mbps(bps) { return bps / 1000000; }
function armazenamento_video(min, bitrate) { return (bitrate * min * 60) / 8; }
function armazenamento_foto(mp, compressao) { return mp * (compressao || 0.3); }
function bits_para_bytes(bits) { return bits / 8; }
function largura_banda(usuarios, consumo) { return usuarios * consumo; }`,
      example: `importe unidades_dados\n\nexecute bytes_para_mb(1073741824)\nexecute tempo_download(700, 100)\nexecute armazenamento_video(120, 5)\nexecute gb_para_bytes(16)\napresente largura_banda(50, 2) em destaque`,
    },

    // ── clima ────────────────────────────────────────────────
    clima: {
      key: 'clima',
      title: '🌡️ Clima e Meteorologia',
      description: 'Sensação térmica (wind chill), índice de calor, ponto de orvalho, escala Beaufort e conforto térmico.',
      exports: ['sensacao_termica','indice_calor','ponto_orvalho','umidade_absoluta','indice_uv_risco','pressao_altitude','temp_altitude','vento_beaufort','visibilidade_nevoeiro','conforto_termico'],
      functions: [
        { name: 'sensacao_termica', params: 'temp, vento', desc: 'Wind chill (°C, km/h)' },
        { name: 'indice_calor', params: 'temp, umidade', desc: 'Heat index (°C, %)' },
        { name: 'ponto_orvalho', params: 'temp, umidade', desc: 'Temperatura do ponto de orvalho (°C)' },
        { name: 'umidade_absoluta', params: 'temp, umid_rel', desc: 'Umidade absoluta (g/m³)' },
        { name: 'indice_uv_risco', params: 'indice', desc: 'Classificação do risco UV (texto)' },
        { name: 'pressao_altitude', params: 'pressao, alt', desc: 'Pressão corrigida por altitude (hPa)' },
        { name: 'temp_altitude', params: 'temp_base, alt', desc: 'Temperatura estimada na altitude' },
        { name: 'vento_beaufort', params: 'vel_kmh', desc: 'Escala Beaufort (0–12)' },
        { name: 'visibilidade_nevoeiro', params: 'umid, temp', desc: 'Chance de nevoeiro (%)' },
        { name: 'conforto_termico', params: 'temp, umid, vento', desc: 'Índice de desconforto térmico' },
      ],
      jsCode: `function sensacao_termica(temp, vento) { if (temp > 10 || vento < 4.8) return temp; return 13.12 + 0.6215*temp - 11.37*Math.pow(vento,0.16) + 0.3965*temp*Math.pow(vento,0.16); }
function indice_calor(temp, umidade) { if (temp < 27) return temp; var t = temp; var u = umidade; return -8.785 + 1.611*t + 2.339*u - 0.1461*t*u - 0.01231*t*t - 0.01642*u*u + 0.002212*t*t*u + 0.0007255*t*u*u - 0.000003582*t*t*u*u; }
function ponto_orvalho(temp, umidade) { var a = 17.27; var b = 237.7; var alpha = (a*temp)/(b+temp) + Math.log(umidade/100); return (b*alpha)/(a-alpha); }
function umidade_absoluta(temp, umid_rel) { return (6.112*Math.exp((17.67*temp)/(temp+243.5))*umid_rel*2.1674)/(273.15+temp); }
function indice_uv_risco(indice) { if (indice <= 2) return 'Baixo'; if (indice <= 5) return 'Moderado'; if (indice <= 7) return 'Alto'; if (indice <= 10) return 'Muito alto'; return 'Extremo'; }
function pressao_altitude(pressao, alt) { return pressao * Math.pow(1 - alt*0.0000226, 5.26); }
function temp_altitude(temp_base, alt) { return temp_base - (alt * 0.0065); }
function vento_beaufort(vel_kmh) { if (vel_kmh < 1) return 0; if (vel_kmh <= 5) return 1; if (vel_kmh <= 11) return 2; if (vel_kmh <= 19) return 3; if (vel_kmh <= 28) return 4; if (vel_kmh <= 38) return 5; if (vel_kmh <= 49) return 6; if (vel_kmh <= 61) return 7; if (vel_kmh <= 74) return 8; if (vel_kmh <= 88) return 9; if (vel_kmh <= 102) return 10; if (vel_kmh <= 117) return 11; return 12; }
function visibilidade_nevoeiro(umid, temp) { if (umid > 95 && temp < 15) return 90; if (umid > 90) return 60; if (umid > 80) return 30; return 5; }
function conforto_termico(temp, umid, vento) { return temp - 0.55*(1-0.01*umid)*(temp-14.5) + (vento > 0 ? -0.2*Math.sqrt(vento) : 0); }`,
      example: `importe clima\n\nexecute sensacao_termica(5, 30)\nexecute indice_calor(35, 70)\nexecute ponto_orvalho(25, 60)\nexecute vento_beaufort(85)\napresente conforto_termico(30, 70, 10) em destaque`,
    },

    // ── marketing_digital ────────────────────────────────────
    marketing_digital: {
      key: 'marketing_digital',
      title: '📣 Marketing Digital',
      description: 'CTR, CPC, CPM, ROAS, taxa de conversão, LTV, CAC, churn rate, bounce rate e ROI de campanha.',
      exports: ['ctr','cpc','cpm','roas','taxa_conversao','ltv','cac','churn_rate','bounce_rate','roi_campanha'],
      functions: [
        { name: 'ctr', params: 'cliques, impressoes', desc: 'Click-through rate (%)' },
        { name: 'cpc', params: 'custo, cliques', desc: 'Custo por clique' },
        { name: 'cpm', params: 'custo, impressoes', desc: 'Custo por mil impressões' },
        { name: 'roas', params: 'receita, custo', desc: 'Return on Ad Spend' },
        { name: 'taxa_conversao', params: 'conversoes, visitantes', desc: 'Taxa de conversão (%)' },
        { name: 'ltv', params: 'ticket, compras_ano, anos', desc: 'Lifetime Value do cliente' },
        { name: 'cac', params: 'custos, clientes', desc: 'Custo de Aquisição de Cliente' },
        { name: 'churn_rate', params: 'perdidos, total', desc: 'Taxa de cancelamento (%)' },
        { name: 'bounce_rate', params: 'saidas, entradas', desc: 'Taxa de rejeição (%)' },
        { name: 'roi_campanha', params: 'receita, custo', desc: 'ROI da campanha (%)' },
      ],
      jsCode: `function ctr(cliques, impressoes) { return (cliques / impressoes) * 100; }
function cpc(custo, cliques) { return custo / cliques; }
function cpm(custo, impressoes) { return (custo / impressoes) * 1000; }
function roas(receita, custo) { return receita / custo; }
function taxa_conversao(conversoes, visitantes) { return (conversoes / visitantes) * 100; }
function ltv(ticket, compras_ano, anos) { return ticket * compras_ano * anos; }
function cac(custos, clientes) { return custos / clientes; }
function churn_rate(perdidos, total) { return (perdidos / total) * 100; }
function bounce_rate(saidas, entradas) { return (saidas / entradas) * 100; }
function roi_campanha(receita, custo) { return ((receita - custo) / custo) * 100; }`,
      example: `importe marketing_digital\n\nexecute ctr(150, 10000)\nexecute cpc(500, 150)\nexecute ltv(80, 12, 3)\nexecute cac(10000, 50)\napresente roi_campanha(25000, 10000) em destaque`,
    },

    // ── conjuntos ────────────────────────────────────────────
    conjuntos: {
      key: 'conjuntos',
      title: '🔗 Conjuntos',
      description: 'União, interseção, diferença, diferença simétrica, subconjunto, conjunto potência e cardinalidade.',
      exports: ['uniao','intersecao','diferenca','diferenca_simetrica','eh_subconjunto','eh_superconjunto','conjunto_potencia','cardinalidade','pertence','conjuntos_disjuntos'],
      functions: [
        { name: 'uniao', params: 'a, b', desc: 'A ∪ B' },
        { name: 'intersecao', params: 'a, b', desc: 'A ∩ B' },
        { name: 'diferenca', params: 'a, b', desc: 'A \\ B' },
        { name: 'diferenca_simetrica', params: 'a, b', desc: 'A Δ B' },
        { name: 'eh_subconjunto', params: 'a, b', desc: '1 se A ⊆ B' },
        { name: 'eh_superconjunto', params: 'a, b', desc: '1 se A ⊇ B' },
        { name: 'conjunto_potencia', params: 'a', desc: 'Conjunto potência P(A)' },
        { name: 'cardinalidade', params: 'a', desc: '|A| (elementos únicos)' },
        { name: 'pertence', params: 'elem, a', desc: '1 se elem ∈ A' },
        { name: 'conjuntos_disjuntos', params: 'a, b', desc: '1 se A ∩ B = ∅' },
      ],
      jsCode: `function _toArr(a) { return Array.isArray(a) ? a : Object.values(a); }
function uniao(a, b) { var r = _toArr(a).slice(); _toArr(b).forEach(function(v){if(r.indexOf(v)===-1)r.push(v);}); return r; }
function intersecao(a, b) { var bb = _toArr(b); return _toArr(a).filter(function(v){return bb.indexOf(v)!==-1;}); }
function diferenca(a, b) { var bb = _toArr(b); return _toArr(a).filter(function(v){return bb.indexOf(v)===-1;}); }
function diferenca_simetrica(a, b) { return uniao(diferenca(a,b), diferenca(b,a)); }
function eh_subconjunto(a, b) { var bb = _toArr(b); return _toArr(a).every(function(v){return bb.indexOf(v)!==-1;})?1:0; }
function eh_superconjunto(a, b) { return eh_subconjunto(b, a); }
function conjunto_potencia(a) { var arr = _toArr(a); var r = [[]]; arr.forEach(function(v){var n = r.map(function(s){return s.concat(v);}); r = r.concat(n);}); return r; }
function cardinalidade(a) { var u = []; _toArr(a).forEach(function(v){if(u.indexOf(v)===-1)u.push(v);}); return u.length; }
function pertence(elem, a) { return _toArr(a).indexOf(elem)!==-1?1:0; }
function conjuntos_disjuntos(a, b) { return intersecao(a,b).length===0?1:0; }`,
      example: `importe conjuntos\n\ndefina A como 1, 2, 3, 4, 5\ndefina B como 3, 4, 5, 6, 7\nexecute uniao(A, B)\nexecute intersecao(A, B)\nexecute diferenca(A, B)\nexecute eh_subconjunto(1,2,3, A)\napresente conjunto_potencia(1, 2, 3) em dados`,
    },

    // ── trigonometria ────────────────────────────────────────
    trigonometria: {
      key: 'trigonometria',
      selo: 'recomendada',
      title: '📐 Trigonometria',
      description: 'Seno, cosseno, tangente, lei dos senos, lei dos cossenos, conversão grau↔radiano e identidades trigonométricas.',
      exports: ['seno','cosseno','tangente','arcseno','arccosseno','arctangente','grau_para_rad','rad_para_grau','lei_senos','lei_cossenos','hipotenusa','cateto','sec','cossec','cotg'],
      functions: [
        { name: 'seno', params: 'graus', desc: 'sin(θ) em graus' },
        { name: 'cosseno', params: 'graus', desc: 'cos(θ) em graus' },
        { name: 'tangente', params: 'graus', desc: 'tan(θ) em graus' },
        { name: 'arcseno', params: 'x', desc: 'arcsin(x) em graus' },
        { name: 'arccosseno', params: 'x', desc: 'arccos(x) em graus' },
        { name: 'arctangente', params: 'x', desc: 'arctan(x) em graus' },
        { name: 'grau_para_rad', params: 'graus', desc: 'θ × π/180' },
        { name: 'rad_para_grau', params: 'rad', desc: 'rad × 180/π' },
        { name: 'lei_senos', params: 'a, A, B', desc: 'b = a × sin(B)/sin(A)' },
        { name: 'lei_cossenos', params: 'a, b, C', desc: 'c² = a² + b² - 2ab×cos(C)' },
        { name: 'hipotenusa', params: 'a, b', desc: 'c = √(a² + b²)' },
        { name: 'cateto', params: 'hipotenusa, angulo', desc: 'cateto = hip × sin(θ)' },
        { name: 'sec', params: 'graus', desc: 'sec(θ) = 1/cos(θ)' },
        { name: 'cossec', params: 'graus', desc: 'csc(θ) = 1/sin(θ)' },
        { name: 'cotg', params: 'graus', desc: 'cot(θ) = cos/sin' },
      ],
      jsCode: `function seno(g) { return Math.sin(g * Math.PI / 180); }
function cosseno(g) { return Math.cos(g * Math.PI / 180); }
function tangente(g) { return Math.tan(g * Math.PI / 180); }
function arcseno(x) { return Math.asin(x) * 180 / Math.PI; }
function arccosseno(x) { return Math.acos(x) * 180 / Math.PI; }
function arctangente(x) { return Math.atan(x) * 180 / Math.PI; }
function grau_para_rad(g) { return g * Math.PI / 180; }
function rad_para_grau(r) { return r * 180 / Math.PI; }
function lei_senos(a, A, B) { return a * seno(B) / seno(A); }
function lei_cossenos(a, b, C) { return Math.sqrt(a*a + b*b - 2*a*b*cosseno(C)); }
function hipotenusa(a, b) { return Math.sqrt(a*a + b*b); }
function cateto(hip, ang) { return hip * seno(ang); }
function sec(g) { return 1 / cosseno(g); }
function cossec(g) { return 1 / seno(g); }
function cotg(g) { return cosseno(g) / seno(g); }`,
      example: `importe trigonometria\n\nexecute seno(30)\nexecute cosseno(60)\nexecute lei_cossenos(3, 4, 90)\nexecute hipotenusa(3, 4)\napresente lei_senos(10, 45, 60) em destaque`,
    },

    // ── combinatoria ─────────────────────────────────────────
    combinatoria: {
      key: 'combinatoria',
      selo: 'honrosa',
      title: '🎯 Combinatória',
      description: 'Permutação, combinação, arranjo, fatorial, binômio de Newton, princípio multiplicativo e contagem com repetição.',
      exports: ['fatorial_comb','permutacao','combinacao','arranjo','binomio_newton','permutacao_repeticao','combinacao_repeticao','principio_multiplicativo','surjecoes','inclucao_exclusao'],
      functions: [
        { name: 'fatorial_comb', params: 'n', desc: 'n! (até n=20)' },
        { name: 'permutacao', params: 'n', desc: 'P(n) = n!' },
        { name: 'combinacao', params: 'n, k', desc: 'C(n,k) = n! / (k!(n-k)!)' },
        { name: 'arranjo', params: 'n, k', desc: 'A(n,k) = n! / (n-k)!' },
        { name: 'binomio_newton', params: 'n, k', desc: 'Coeficiente binomial C(n,k)' },
        { name: 'permutacao_repeticao', params: 'n, repeticoes', desc: 'P = n! / (r1!×r2!...)' },
        { name: 'combinacao_repeticao', params: 'n, k', desc: 'CR(n,k) = C(n+k-1, k)' },
        { name: 'principio_multiplicativo', params: 'opcoes', desc: 'Produto de todas as opções' },
        { name: 'surjecoes', params: 'n, k', desc: 'Número de funções sobrejetivas' },
        { name: 'inclucao_exclusao', params: 'a, b, ab', desc: '|A∪B| = |A| + |B| - |A∩B|' },
      ],
      jsCode: `function fatorial_comb(n) { if(n<=1)return 1; var r=1; for(var i=2;i<=n;i++)r*=i; return r; }
function permutacao(n) { return fatorial_comb(n); }
function combinacao(n, k) { if(k>n)return 0; return fatorial_comb(n)/(fatorial_comb(k)*fatorial_comb(n-k)); }
function arranjo(n, k) { return fatorial_comb(n)/fatorial_comb(n-k); }
function binomio_newton(n, k) { return combinacao(n, k); }
function permutacao_repeticao(n, repeticoes) { var r=Array.isArray(repeticoes)?repeticoes:Object.values(repeticoes); return r.reduce(function(ac,ri){return ac/fatorial_comb(ri);},fatorial_comb(n)); }
function combinacao_repeticao(n, k) { return combinacao(n+k-1, k); }
function principio_multiplicativo(opcoes) { var arr=Array.isArray(opcoes)?opcoes:Object.values(opcoes); return arr.reduce(function(a,b){return a*b;},1); }
function surjecoes(n, k) { var s=0; for(var i=0;i<=k;i++) s+=Math.pow(-1,i)*combinacao(k,i)*Math.pow(k-i,n); return s; }
function inclucao_exclusao(a, b, ab) { return a + b - ab; }`,
      example: `importe combinatoria\n\nexecute combinacao(52, 5)\nexecute arranjo(10, 3)\nexecute permutacao(8)\nexecute combinacao_repeticao(5, 3)\napresente binomio_newton(6, 2) em destaque`,
    },

    // ── numeros_complexos ────────────────────────────────────
    numeros_complexos: {
      key: 'numeros_complexos',
      title: '🔢 Números Complexos',
      description: 'Módulo, argumento, forma polar, soma, multiplicação, divisão e potência de De Moivre.',
      exports: ['modulo_complexo','argumento_complexo','polar_para_cartesiano','cartesiano_para_polar','soma_complexo','multiplicar_complexo','dividir_complexo','potencia_complexo','conjugado','raiz_complexo'],
      functions: [
        { name: 'modulo_complexo', params: 'a, b', desc: '|z| = √(a² + b²)' },
        { name: 'argumento_complexo', params: 'a, b', desc: 'arg(z) = atan2(b, a) em graus' },
        { name: 'polar_para_cartesiano', params: 'r, theta', desc: '{a, b} = r×{cos(θ), sin(θ)}' },
        { name: 'cartesiano_para_polar', params: 'a, b', desc: '{r, theta} em graus' },
        { name: 'soma_complexo', params: 'a1, b1, a2, b2', desc: '(a1+a2, b1+b2)' },
        { name: 'multiplicar_complexo', params: 'a1, b1, a2, b2', desc: '(a1a2-b1b2, a1b2+a2b1)' },
        { name: 'dividir_complexo', params: 'a1, b1, a2, b2', desc: 'z1/z2' },
        { name: 'potencia_complexo', params: 'r, theta, n', desc: 'De Moivre: z^n polar' },
        { name: 'conjugado', params: 'a, b', desc: 'z* = (a, -b)' },
        { name: 'raiz_complexo', params: 'r, theta', desc: 'Raiz quadrada de z polar' },
      ],
      jsCode: `function modulo_complexo(a, b) { return Math.sqrt(a*a + b*b); }
function argumento_complexo(a, b) { return Math.atan2(b, a) * 180 / Math.PI; }
function polar_para_cartesiano(r, theta) { var t=theta*Math.PI/180; return {a: r*Math.cos(t), b: r*Math.sin(t)}; }
function cartesiano_para_polar(a, b) { return {r: modulo_complexo(a,b), theta: argumento_complexo(a,b)}; }
function soma_complexo(a1, b1, a2, b2) { return {a: a1+a2, b: b1+b2}; }
function multiplicar_complexo(a1, b1, a2, b2) { return {a: a1*a2-b1*b2, b: a1*b2+a2*b1}; }
function dividir_complexo(a1, b1, a2, b2) { var d=a2*a2+b2*b2; return {a:(a1*a2+b1*b2)/d, b:(b1*a2-a1*b2)/d}; }
function potencia_complexo(r, theta, n) { return {r: Math.pow(r,n), theta: theta*n}; }
function conjugado(a, b) { return {a: a, b: -b}; }
function raiz_complexo(r, theta) { return {r: Math.sqrt(r), theta: theta/2}; }`,
      example: `importe numeros_complexos\n\nexecute modulo_complexo(3, 4)\nexecute argumento_complexo(1, 1)\nexecute multiplicar_complexo(1, 2, 3, 4)\nexecute potencia_complexo(2, 45, 3)\napresente cartesiano_para_polar(3, 4) em dados`,
    },

    // ── sequencias ───────────────────────────────────────────
    sequencias: {
      key: 'sequencias',
      title: '🔗 Sequências Especiais',
      description: 'Fibonacci, tribonacci, números triangulares, quadrados perfeitos, primos, Catalan e recorrências clássicas.',
      exports: ['fibonacci','tribonacci','numero_triangular','numero_pentagonal','catalan','lucas','numero_bell','soma_fibonacci','eh_fibonacci','recorrencia_linear'],
      functions: [
        { name: 'fibonacci', params: 'n', desc: 'n-ésimo número de Fibonacci' },
        { name: 'tribonacci', params: 'n', desc: 'n-ésimo número de Tribonacci' },
        { name: 'numero_triangular', params: 'n', desc: 'T(n) = n(n+1)/2' },
        { name: 'numero_pentagonal', params: 'n', desc: 'P(n) = n(3n-1)/2' },
        { name: 'catalan', params: 'n', desc: 'C(n) = C(2n,n)/(n+1)' },
        { name: 'lucas', params: 'n', desc: 'n-ésimo número de Lucas' },
        { name: 'numero_bell', params: 'n', desc: 'Número de Bell B(n) (n≤8)' },
        { name: 'soma_fibonacci', params: 'n', desc: 'Soma dos n primeiros Fibonacci' },
        { name: 'eh_fibonacci', params: 'x', desc: '1 se x é Fibonacci, 0 caso contrário' },
        { name: 'recorrencia_linear', params: 'a, b, n', desc: 'T(n) = a×T(n-1) + b, T(0)=1' },
      ],
      jsCode: `function fibonacci(n) { if(n<=0)return 0; if(n===1)return 1; var a=0,b=1; for(var i=2;i<=n;i++){var c=a+b;a=b;b=c;} return b; }
function tribonacci(n) { if(n<=1)return 0; if(n===2)return 1; var a=0,b=0,c=1; for(var i=3;i<=n;i++){var d=a+b+c;a=b;b=c;c=d;} return c; }
function numero_triangular(n) { return n*(n+1)/2; }
function numero_pentagonal(n) { return n*(3*n-1)/2; }
function catalan(n) { var fc=function(x){var r=1;for(var i=2;i<=x;i++)r*=i;return r;}; return fc(2*n)/(fc(n+1)*fc(n)); }
function lucas(n) { if(n===0)return 2; if(n===1)return 1; var a=2,b=1; for(var i=2;i<=n;i++){var c=a+b;a=b;b=c;} return b; }
function numero_bell(n) { var b=[[1]]; for(var i=1;i<=n;i++){b[i]=[b[i-1][b[i-1].length-1]];for(var j=1;j<=i;j++)b[i][j]=b[i][j-1]+b[i-1][j-1];} return b[n][0]; }
function soma_fibonacci(n) { return fibonacci(n+2) - 1; }
function eh_fibonacci(x) { var p=function(n){return Math.floor(Math.sqrt(n)+0.5);return p(n)*p(n)===n;}; return (function(v){var s1=5*v*v+4,s2=5*v*v-4;var r1=Math.round(Math.sqrt(s1)),r2=Math.round(Math.sqrt(s2));return(r1*r1===s1||r2*r2===s2)?1:0;})(x); }
function recorrencia_linear(a, b, n) { var v=1; for(var i=1;i<=n;i++)v=a*v+b; return v; }`,
      example: `importe sequencias\n\nexecute fibonacci(10)\nexecute numero_triangular(10)\nexecute catalan(5)\nexecute lucas(8)\napresente tribonacci(10) em destaque`,
    },

    // ── esportes ─────────────────────────────────────────────
    esportes: {
      key: 'esportes',
      title: '🏃 Esportes e Performance',
      description: 'Pace de corrida, VO2 máx, carga de treino, percentual de gordura, potência de ciclismo, índice de fadiga e recordes.',
      exports: ['pace_por_km','velocidade_media_corrida','vo2_estimado','carga_treino','percentual_gordura_marinha','potencia_wkg','indice_fadiga','tempo_para_distancia','mets_atividade','gasto_calorico'],
      functions: [
        { name: 'pace_por_km', params: 'tempo_min, distancia_km', desc: 'Pace = tempo / distância (min/km)' },
        { name: 'velocidade_media_corrida', params: 'distancia_km, tempo_min', desc: 'v = d / t (km/h)' },
        { name: 'vo2_estimado', params: 'velocidade_kmh', desc: 'VO2 max estimado (ml/kg/min)' },
        { name: 'carga_treino', params: 'duracao_min, pse', desc: 'Carga = duração × PSE (1-10)' },
        { name: 'percentual_gordura_marinha', params: 'cintura, pescoco, altura, sexo', desc: '% gordura (Marinha dos EUA, sexo: 1=M, 0=F)' },
        { name: 'potencia_wkg', params: 'watts, peso', desc: 'W/kg (FTP relativo)' },
        { name: 'indice_fadiga', params: 'potencia_max, potencia_min', desc: 'IF = (Pmax-Pmin)/Pmax × 100' },
        { name: 'tempo_para_distancia', params: 'distancia_km, pace', desc: 'Tempo = distância × pace (min)' },
        { name: 'mets_atividade', params: 'mets, peso, horas', desc: 'Kcal = METs × peso × horas' },
        { name: 'gasto_calorico', params: 'peso, velocidade, minutos', desc: 'Kcal corrida estimada' },
      ],
      jsCode: `function pace_por_km(tempo_min, distancia_km) { return tempo_min / distancia_km; }
function velocidade_media_corrida(distancia_km, tempo_min) { return distancia_km / (tempo_min / 60); }
function vo2_estimado(velocidade_kmh) { return 3.5 * velocidade_kmh / 3.6 / 3.5; }
function carga_treino(duracao_min, pse) { return duracao_min * pse; }
function percentual_gordura_marinha(cintura, pescoco, altura, sexo) { if(sexo===1) return 495/(1.0324-0.19077*Math.log10(cintura-pescoco)+0.15456*Math.log10(altura))-450; return 495/(1.29579-0.35004*Math.log10(cintura+0)+0.22100*Math.log10(altura))-450; }
function potencia_wkg(watts, peso) { return watts / peso; }
function indice_fadiga(potencia_max, potencia_min) { return (potencia_max - potencia_min) / potencia_max * 100; }
function tempo_para_distancia(distancia_km, pace) { return distancia_km * pace; }
function mets_atividade(mets, peso, horas) { return mets * peso * horas; }
function gasto_calorico(peso, velocidade, minutos) { return 0.0175 * (velocidade > 8 ? 11 : 8) * peso * minutos; }`,
      example: `importe esportes\n\nexecute pace_por_km(60, 10)\nexecute velocidade_media_corrida(42.195, 240)\nexecute carga_treino(60, 7)\nexecute potencia_wkg(280, 70)\napresente gasto_calorico(70, 10, 60) em destaque`,
    },

    // ── culinaria ────────────────────────────────────────────
    culinaria: {
      key: 'culinaria',
      title: '🍳 Culinária',
      description: 'Conversão de medidas culinárias, proporção de receita, temperatura de cocção, rendimento e substitutos de ingredientes.',
      exports: ['xicara_para_ml','colher_sopa_para_ml','onca_para_gramas','fahrenheit_culinaria','celsius_culinaria','escalar_receita','rendimento_pao','hidratacao_massa','proporcao_sal','porcoes_para_gramas'],
      functions: [
        { name: 'xicara_para_ml', params: 'xicaras', desc: '1 xícara BR = 200mL' },
        { name: 'colher_sopa_para_ml', params: 'colheres', desc: '1 colher de sopa = 15mL' },
        { name: 'onca_para_gramas', params: 'oncas', desc: '1 oz = 28.35g' },
        { name: 'fahrenheit_culinaria', params: 'celsius', desc: '°C → °F' },
        { name: 'celsius_culinaria', params: 'fahrenheit', desc: '°F → °C' },
        { name: 'escalar_receita', params: 'quantidade, fator', desc: 'Escala ingrediente pelo fator' },
        { name: 'rendimento_pao', params: 'farinha_g', desc: 'Rendimento estimado de pão (g)' },
        { name: 'hidratacao_massa', params: 'agua_g, farinha_g', desc: 'Hidratação = água/farinha × 100%' },
        { name: 'proporcao_sal', params: 'farinha_g', desc: 'Sal recomendado (2% da farinha)' },
        { name: 'porcoes_para_gramas', params: 'porcoes, g_por_porcao', desc: 'Total em gramas' },
      ],
      jsCode: `function xicara_para_ml(x) { return x * 200; }
function colher_sopa_para_ml(c) { return c * 15; }
function onca_para_gramas(o) { return o * 28.35; }
function fahrenheit_culinaria(c) { return c * 9/5 + 32; }
function celsius_culinaria(f) { return (f - 32) * 5/9; }
function escalar_receita(quantidade, fator) { return quantidade * fator; }
function rendimento_pao(farinha_g) { return farinha_g * 1.6; }
function hidratacao_massa(agua_g, farinha_g) { return (agua_g / farinha_g) * 100; }
function proporcao_sal(farinha_g) { return farinha_g * 0.02; }
function porcoes_para_gramas(porcoes, g_por_porcao) { return porcoes * g_por_porcao; }`,
      example: `importe culinaria\n\nexecute xicara_para_ml(2)\nexecute fahrenheit_culinaria(180)\nexecute hidratacao_massa(700, 1000)\nexecute rendimento_pao(500)\napresente escalar_receita(250, 1.5) em destaque`,
    },

    // ── logistica ────────────────────────────────────────────
    logistica: {
      key: 'logistica',
      title: '🚚 Logística',
      description: 'Ponto de pedido, estoque de segurança, lote econômico (EOQ), giro de estoque, lead time e custo de armazenagem.',
      exports: ['lote_economico','ponto_pedido','estoque_seguranca','giro_estoque','cobertura_estoque','custo_armazenagem','custo_pedido','eficiencia_entrega','taxa_preenchimento','custo_total_estoque'],
      functions: [
        { name: 'lote_economico', params: 'd, s, h', desc: 'EOQ = √(2DS/H)' },
        { name: 'ponto_pedido', params: 'demanda_dia, lead_time', desc: 'PP = demanda × lead time' },
        { name: 'estoque_seguranca', params: 'z, sigma, lead', desc: 'ES = Z × σ × √(lead)' },
        { name: 'giro_estoque', params: 'custo_vendas, estoque_medio', desc: 'Giro = CMV / Estoque médio' },
        { name: 'cobertura_estoque', params: 'estoque, demanda_dia', desc: 'Dias de cobertura' },
        { name: 'custo_armazenagem', params: 'valor, taxa', desc: 'Ca = valor × taxa anual' },
        { name: 'custo_pedido', params: 'pedidos, custo_unit', desc: 'Cp = número × custo/pedido' },
        { name: 'eficiencia_entrega', params: 'no_prazo, total', desc: 'OTD = no_prazo/total × 100%' },
        { name: 'taxa_preenchimento', params: 'atendidos, solicitados', desc: 'Fill rate = atendidos/solicitados × 100%' },
        { name: 'custo_total_estoque', params: 'd, q, s, h', desc: 'CT = (D/Q)×S + (Q/2)×H' },
      ],
      jsCode: `function lote_economico(d, s, h) { return Math.sqrt(2 * d * s / h); }
function ponto_pedido(demanda_dia, lead_time) { return demanda_dia * lead_time; }
function estoque_seguranca(z, sigma, lead) { return z * sigma * Math.sqrt(lead); }
function giro_estoque(custo_vendas, estoque_medio) { return custo_vendas / estoque_medio; }
function cobertura_estoque(estoque, demanda_dia) { return estoque / demanda_dia; }
function custo_armazenagem(valor, taxa) { return valor * taxa; }
function custo_pedido(pedidos, custo_unit) { return pedidos * custo_unit; }
function eficiencia_entrega(no_prazo, total) { return (no_prazo / total) * 100; }
function taxa_preenchimento(atendidos, solicitados) { return (atendidos / solicitados) * 100; }
function custo_total_estoque(d, q, s, h) { return (d/q)*s + (q/2)*h; }`,
      example: `importe logistica\n\nexecute lote_economico(1000, 50, 2)\nexecute ponto_pedido(30, 5)\nexecute estoque_seguranca(1.65, 10, 7)\nexecute giro_estoque(500000, 80000)\napresente eficiencia_entrega(92, 100) em destaque`,
    },

    // ── epidemiologia ────────────────────────────────────────
    epidemiologia: {
      key: 'epidemiologia',
      selo: 'recomendada',
      title: '🦠 Epidemiologia',
      description: 'R0, modelo SIR, incidência, prevalência, taxa de mortalidade, número necessário tratar e risco relativo.',
      exports: ['numero_reproducao','incidencia','prevalencia','taxa_mortalidade','risco_relativo','odds_ratio','numero_necessario_tratar','sensibilidade','especificidade','valor_preditivo_positivo'],
      functions: [
        { name: 'numero_reproducao', params: 'beta, gamma', desc: 'R0 = β / γ' },
        { name: 'incidencia', params: 'casos_novos, populacao', desc: 'Incidência = novos/pop × 100.000' },
        { name: 'prevalencia', params: 'casos_totais, populacao', desc: 'Prevalência = total/pop × 100' },
        { name: 'taxa_mortalidade', params: 'obitos, casos', desc: 'CFR = óbitos/casos × 100' },
        { name: 'risco_relativo', params: 'ri, rc', desc: 'RR = risco_exposto / risco_controle' },
        { name: 'odds_ratio', params: 'a, b, c, d', desc: 'OR = (a×d)/(b×c)' },
        { name: 'numero_necessario_tratar', params: 'rra', desc: 'NNT = 1 / RRA' },
        { name: 'sensibilidade', params: 'vp, fn', desc: 'Se = VP/(VP+FN)' },
        { name: 'especificidade', params: 'vn, fp', desc: 'Sp = VN/(VN+FP)' },
        { name: 'valor_preditivo_positivo', params: 'vp, fp', desc: 'VPP = VP/(VP+FP)' },
      ],
      jsCode: `function numero_reproducao(beta, gamma) { return beta / gamma; }
function incidencia(casos_novos, populacao) { return (casos_novos / populacao) * 100000; }
function prevalencia(casos_totais, populacao) { return (casos_totais / populacao) * 100; }
function taxa_mortalidade(obitos, casos) { return (obitos / casos) * 100; }
function risco_relativo(ri, rc) { return ri / rc; }
function odds_ratio(a, b, c, d) { return (a * d) / (b * c); }
function numero_necessario_tratar(rra) { return 1 / rra; }
function sensibilidade(vp, fn) { return vp / (vp + fn); }
function especificidade(vn, fp) { return vn / (vn + fp); }
function valor_preditivo_positivo(vp, fp) { return vp / (vp + fp); }`,
      example: `importe epidemiologia\n\nexecute numero_reproducao(0.5, 0.1)\nexecute incidencia(350, 1000000)\nexecute taxa_mortalidade(120, 5000)\nexecute risco_relativo(0.15, 0.05)\napresente numero_necessario_tratar(0.1) em destaque`,
    },

    // ── jogos_simulacao ──────────────────────────────────────
    jogos_simulacao: {
      key: 'jogos_simulacao',
      title: '🎮 Jogos e Simulação',
      description: 'Sistemas de XP/level, dano crítico, probabilidade de loot, balanceamento de economia de jogo e geração procedural.',
      exports: ['xp_para_level','level_para_xp','dano_critico','chance_loot','dano_com_resistencia','escalonamento_inimigo','economia_inflacao','pontuacao_rankeada','distancia_2d','colisao_circular'],
      functions: [
        { name: 'xp_para_level', params: 'xp, base', desc: 'Level = floor(√(xp/base))' },
        { name: 'level_para_xp', params: 'level, base', desc: 'XP necessário = base × level²' },
        { name: 'dano_critico', params: 'dano_base, multiplicador', desc: 'Dano crítico = base × mult' },
        { name: 'chance_loot', params: 'drop_rate, tentativas', desc: 'P(ao menos 1 drop) em n tentativas' },
        { name: 'dano_com_resistencia', params: 'dano, resistencia', desc: 'Dano final = dano × (100/(100+res))' },
        { name: 'escalonamento_inimigo', params: 'stat_base, level, fator', desc: 'Stat = base × (1 + fator×level)' },
        { name: 'economia_inflacao', params: 'preco, inflacao, rodadas', desc: 'Preço ajustado após n rodadas' },
        { name: 'pontuacao_rankeada', params: 'vitorias, derrotas, k', desc: 'Δ MMR = K × (resultado esperado)' },
        { name: 'distancia_2d', params: 'x1, y1, x2, y2', desc: 'Distância euclidiana' },
        { name: 'colisao_circular', params: 'x1, y1, r1, x2, y2, r2', desc: '1 se colidindo, 0 se não' },
      ],
      jsCode: `function xp_para_level(xp, base) { return Math.floor(Math.sqrt(xp / (base || 100))); }
function level_para_xp(level, base) { return (base || 100) * level * level; }
function dano_critico(dano_base, multiplicador) { return dano_base * (multiplicador || 2); }
function chance_loot(drop_rate, tentativas) { return (1 - Math.pow(1 - drop_rate, tentativas)) * 100; }
function dano_com_resistencia(dano, resistencia) { return dano * (100 / (100 + resistencia)); }
function escalonamento_inimigo(stat_base, level, fator) { return stat_base * (1 + (fator || 0.1) * level); }
function economia_inflacao(preco, inflacao, rodadas) { return preco * Math.pow(1 + inflacao, rodadas); }
function pontuacao_rankeada(vitorias, derrotas, k) { var total=vitorias+derrotas; var wr=vitorias/total; return (k||32)*(wr-0.5)*2; }
function distancia_2d(x1, y1, x2, y2) { return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)); }
function colisao_circular(x1, y1, r1, x2, y2, r2) { return distancia_2d(x1,y1,x2,y2)<=(r1+r2)?1:0; }`,
      example: `importe jogos_simulacao\n\nexecute xp_para_level(2500, 100)\nexecute chance_loot(0.05, 20)\nexecute dano_com_resistencia(100, 50)\nexecute escalonamento_inimigo(50, 10, 0.15)\napresente colisao_circular(0, 0, 5, 8, 0, 4) em destaque`,
    },

    // ── fisica_ondas ─────────────────────────────────────────
    fisica_ondas: {
      key: 'fisica_ondas',
      title: '🌊 Física das Ondas',
      description: 'Frequência, comprimento de onda, período, efeito Doppler, energia do fóton, De Broglie e Lei de Snell.',
      exports: ['frequencia_onda','comprimento_onda_fisica','periodo_onda','velocidade_onda','efeito_doppler','intensidade_onda','energia_foton','comprimento_de_broglie','lei_snell','velocidade_som'],
      functions: [
        { name: 'frequencia_onda', params: 'v, lambda', desc: 'f = v / λ (Hz)' },
        { name: 'comprimento_onda_fisica', params: 'v, f', desc: 'λ = v / f (m)' },
        { name: 'periodo_onda', params: 'f', desc: 'T = 1/f (s)' },
        { name: 'velocidade_onda', params: 'lambda, f', desc: 'v = λ × f (m/s)' },
        { name: 'efeito_doppler', params: 'f0, vs, vo, v', desc: 'Frequência observada' },
        { name: 'intensidade_onda', params: 'potencia, area', desc: 'I = P/A (W/m²)' },
        { name: 'energia_foton', params: 'f', desc: 'E = hf (Joules)' },
        { name: 'comprimento_de_broglie', params: 'massa, vel', desc: 'λ = h/(mv) (m)' },
        { name: 'lei_snell', params: 'n1, angulo1, n2', desc: 'Ângulo refratado (graus)' },
        { name: 'velocidade_som', params: 'temp', desc: 'v do som no ar (m/s) dado temp (°C)' },
      ],
      jsCode: `function frequencia_onda(v, lambda) { return v / lambda; }
function comprimento_onda_fisica(v, f) { return v / f; }
function periodo_onda(f) { return 1 / f; }
function velocidade_onda(lambda, f) { return lambda * f; }
function efeito_doppler(f0, vs, vo, v) { return f0 * ((v + vo) / (v - vs)); }
function intensidade_onda(potencia, area) { return potencia / area; }
function energia_foton(f) { return 6.62607015e-34 * f; }
function comprimento_de_broglie(massa, vel) { return 6.62607015e-34 / (massa * vel); }
function lei_snell(n1, angulo1, n2) { var rad = angulo1 * Math.PI / 180; var sinA2 = (n1 * Math.sin(rad)) / n2; if (Math.abs(sinA2) > 1) return 'Reflexão total interna'; return Math.asin(sinA2) * 180 / Math.PI; }
function velocidade_som(temp) { return 331.3 + 0.606 * temp; }`,
      example: `importe fisica_ondas\n\nexecute frequencia_onda(340, 0.5)\nexecute energia_foton(5e14)\nexecute efeito_doppler(440, 30, 0, 340)\nexecute lei_snell(1.5, 30, 1)\napresente velocidade_som(25) em destaque`,
    },

    // ── formulas_contabilidade ───────────────────────────────
    formulas_contabilidade: {
      key: 'formulas_contabilidade',
      title: '📒 Contabilidade',
      description: 'Patrimônio líquido, liquidez corrente/seca, EBITDA, grau de endividamento, capital de giro, ponto de equilíbrio, depreciação e ROE.',
      exports: ['patrimonio_liquido','liquidez_corrente','liquidez_seca','margem_ebitda','grau_endividamento','capital_giro','ponto_equilibrio_contabil','depreciacao_acelerada','indice_cobertura','roe'],
      functions: [
        { name: 'patrimonio_liquido', params: 'ativos, passivos', desc: 'PL = Ativos - Passivos' },
        { name: 'liquidez_corrente', params: 'ativo_circ, passivo_circ', desc: 'AC / PC' },
        { name: 'liquidez_seca', params: 'ac, estoques, pc', desc: '(AC - estoques) / PC' },
        { name: 'margem_ebitda', params: 'ebitda, receita', desc: 'EBITDA / Receita × 100' },
        { name: 'grau_endividamento', params: 'dividas, pl', desc: 'Dívidas / PL × 100' },
        { name: 'capital_giro', params: 'ac, pc', desc: 'AC - PC' },
        { name: 'ponto_equilibrio_contabil', params: 'cf, mc_unit', desc: 'CF / MC unitária (unidades)' },
        { name: 'depreciacao_acelerada', params: 'valor, vida, fator', desc: 'Depreciação com fator acelerador' },
        { name: 'indice_cobertura', params: 'ebit, juros', desc: 'EBIT / Juros' },
        { name: 'roe', params: 'lucro, pl', desc: 'Return on Equity (%)' },
      ],
      jsCode: `function patrimonio_liquido(ativos, passivos) { return ativos - passivos; }
function liquidez_corrente(ativo_circ, passivo_circ) { return ativo_circ / passivo_circ; }
function liquidez_seca(ac, estoques, pc) { return (ac - estoques) / pc; }
function margem_ebitda(ebitda, receita) { return (ebitda / receita) * 100; }
function grau_endividamento(dividas, pl) { return (dividas / pl) * 100; }
function capital_giro(ac, pc) { return ac - pc; }
function ponto_equilibrio_contabil(cf, mc_unit) { return cf / mc_unit; }
function depreciacao_acelerada(valor, vida, fator) { return (valor / vida) * (fator || 2); }
function indice_cobertura(ebit, juros) { return ebit / juros; }
function roe(lucro, pl) { return (lucro / pl) * 100; }`,
      example: `importe formulas_contabilidade\n\nexecute patrimonio_liquido(500000, 200000)\nexecute liquidez_corrente(80000, 60000)\nexecute margem_ebitda(150000, 600000)\nexecute ponto_equilibrio_contabil(50000, 25)\napresente roe(120000, 400000) em destaque`,
    },

    // ── estatistica_inferencial ──────────────────────────────
    estatistica_inferencial: {
      key: 'estatistica_inferencial',
      selo: 'honrosa',
      title: '📊 Estatística Inferencial',
      description: 'Testes de hipótese, intervalo de confiança, teste t, qui-quadrado, p-valor e tamanho de amostra.',
      exports: ['teste_t_uma_amostra','teste_t_duas_amostras','intervalo_confianca','margem_erro','qui_quadrado','p_valor_z','tamanho_amostra','poder_estatistico','erro_tipo1','erro_tipo2'],
      functions: [
        { name: 'teste_t_uma_amostra', params: 'media, media_h0, dp, n', desc: 't = (x̄ - μ0) / (s/√n)' },
        { name: 'teste_t_duas_amostras', params: 'm1, m2, dp1, dp2, n1, n2', desc: 'Teste t para duas amostras independentes' },
        { name: 'intervalo_confianca', params: 'media, dp, n, z', desc: 'IC = x̄ ± z×(s/√n)' },
        { name: 'margem_erro', params: 'dp, n, z', desc: 'ME = z × s / √n' },
        { name: 'qui_quadrado', params: 'observado, esperado', desc: 'χ² = Σ(O-E)²/E' },
        { name: 'p_valor_z', params: 'z', desc: 'P-valor aproximado (bilateral)' },
        { name: 'tamanho_amostra', params: 'z, dp, me', desc: 'n = (z×s/ME)²' },
        { name: 'poder_estatistico', params: 'n, delta, dp, alpha', desc: 'Poder do teste (aproximação)' },
        { name: 'erro_tipo1', params: 'alpha', desc: 'P(falso positivo) = α' },
        { name: 'erro_tipo2', params: 'poder', desc: 'β = 1 - poder' },
      ],
      jsCode: `function teste_t_uma_amostra(media, media_h0, dp, n) { return (media - media_h0) / (dp / Math.sqrt(n)); }
function teste_t_duas_amostras(m1, m2, dp1, dp2, n1, n2) { return (m1 - m2) / Math.sqrt(dp1*dp1/n1 + dp2*dp2/n2); }
function intervalo_confianca(media, dp, n, z) { var me=(z||1.96)*dp/Math.sqrt(n); return {inferior: media-me, superior: media+me}; }
function margem_erro(dp, n, z) { return (z||1.96)*dp/Math.sqrt(n); }
function qui_quadrado(observado, esperado) { var o=Array.isArray(observado)?observado:Object.values(observado),e=Array.isArray(esperado)?esperado:Object.values(esperado); return o.reduce(function(s,v,i){return s+Math.pow(v-e[i],2)/e[i];},0); }
function p_valor_z(z) { var az=Math.abs(z); return 2*(1-0.5*(1+Math.tanh(0.7978*az*(1+0.044715*az*az)))); }
function tamanho_amostra(z, dp, me) { return Math.ceil(Math.pow((z||1.96)*dp/me,2)); }
function poder_estatistico(n, delta, dp, alpha) { var za=alpha<=0.01?2.576:alpha<=0.05?1.96:1.645,zb=(Math.abs(delta)/(dp/Math.sqrt(n)))-za; return 0.5*(1+Math.tanh(0.7978*zb)); }
function erro_tipo1(alpha) { return alpha; }
function erro_tipo2(poder) { return 1-poder; }`,
      example: `importe estatistica_inferencial\n\nexecute teste_t_uma_amostra(52, 50, 8, 30)\nexecute intervalo_confianca(52, 8, 30, 1.96)\nexecute margem_erro(8, 30, 1.96)\nexecute tamanho_amostra(1.96, 15, 3)\napresente p_valor_z(2.1) em destaque`,
    },

    // ── regressao ────────────────────────────────────────────
    regressao: {
      key: 'regressao',
      selo: 'recomendada',
      title: '📈 Regressão',
      description: 'Regressão linear simples, coeficientes, R², resíduos, previsão, correlação de Pearson e elasticidade.',
      exports: ['regressao_linear','coef_correlacao','r_quadrado','prever','residuo','inclinacao','intercepto','erro_padrao_regressao','elasticidade','regressao_multipla_coef'],
      functions: [
        { name: 'regressao_linear', params: 'x, y', desc: 'Retorna {a, b} de ŷ = a + bx' },
        { name: 'coef_correlacao', params: 'x, y', desc: 'r de Pearson' },
        { name: 'r_quadrado', params: 'x, y', desc: 'R² = r²' },
        { name: 'prever', params: 'a, b, x', desc: 'ŷ = a + b×x' },
        { name: 'residuo', params: 'y_real, y_prev', desc: 'e = y - ŷ' },
        { name: 'inclinacao', params: 'x, y', desc: 'b = Σ(xi-x̄)(yi-ȳ) / Σ(xi-x̄)²' },
        { name: 'intercepto', params: 'x, y', desc: 'a = ȳ - b×x̄' },
        { name: 'erro_padrao_regressao', params: 'x, y', desc: 'Se = √(Σe²/(n-2))' },
        { name: 'elasticidade', params: 'b, x_med, y_med', desc: 'ε = b × (x̄/ȳ)' },
        { name: 'regressao_multipla_coef', params: 'x1, x2, y', desc: 'Coef. aproximados para 2 preditores' },
      ],
      jsCode: `function _mean_r(a){return a.reduce(function(s,v){return s+v;},0)/a.length;}
function _arr_r(a){return Array.isArray(a)?a:Object.values(a);}
function inclinacao(x,y){var xa=_arr_r(x),ya=_arr_r(y),xm=_mean_r(xa),ym=_mean_r(ya),n=0,d=0;xa.forEach(function(v,i){n+=(v-xm)*(ya[i]-ym);d+=(v-xm)*(v-xm);});return n/d;}
function intercepto(x,y){var xa=_arr_r(x),ya=_arr_r(y);return _mean_r(ya)-inclinacao(xa,ya)*_mean_r(xa);}
function regressao_linear(x,y){var xa=_arr_r(x),ya=_arr_r(y),b=inclinacao(xa,ya),a=intercepto(xa,ya);return {a:a,b:b};}
function coef_correlacao(x,y){var xa=_arr_r(x),ya=_arr_r(y),xm=_mean_r(xa),ym=_mean_r(ya),n=0,dx=0,dy=0;xa.forEach(function(v,i){n+=(v-xm)*(ya[i]-ym);dx+=(v-xm)*(v-xm);dy+=(ya[i]-ym)*(ya[i]-ym);});return n/Math.sqrt(dx*dy);}
function r_quadrado(x,y){var r=coef_correlacao(_arr_r(x),_arr_r(y));return r*r;}
function prever(a,b,x){return a+b*x;}
function residuo(y_real,y_prev){return y_real-y_prev;}
function erro_padrao_regressao(x,y){var xa=_arr_r(x),ya=_arr_r(y),reg=regressao_linear(xa,ya),s=ya.reduce(function(ac,v,i){var e=v-prever(reg.a,reg.b,xa[i]);return ac+e*e;},0);return Math.sqrt(s/(xa.length-2));}
function elasticidade(b,x_med,y_med){return b*(x_med/y_med);}
function regressao_multipla_coef(x1,x2,y){var a1=_arr_r(x1),a2=_arr_r(x2),ya=_arr_r(y),b1=inclinacao(a1,ya),b2=inclinacao(a2,ya),a=_mean_r(ya)-b1*_mean_r(a1)-b2*_mean_r(a2);return {a:a,b1:b1,b2:b2};}`,
      example: `importe regressao\n\ndefina x como 1, 2, 3, 4, 5\ndefina y como 2.1, 3.9, 6.2, 7.8, 10.1\nexecute regressao_linear(x, y)\nexecute coef_correlacao(x, y)\nexecute r_quadrado(x, y)\napresente prever(0.12, 1.98, 6) em destaque`,
    },

    // ── eletroquimica ─────────────────────────────────────────
    eletroquimica: {
      key: 'eletroquimica',
      selo: 'recomendada',
      title: '🔋 Eletroquímica',
      description: 'Pilhas, eletrólise, potencial de célula, equação de Nernst, lei de Faraday e capacidade de bateria.',
      exports: ['potencial_celula','equacao_nernst','lei_faraday_eletro','massa_depositada','eficiencia_coulombica','energia_celula','ddp_pilha','potencial_padrao','capacidade_bateria','numero_transferencia'],
      functions: [
        { name: 'potencial_celula', params: 'e_catodo, e_anodo', desc: 'E°cell = E°catodo - E°anodo' },
        { name: 'equacao_nernst', params: 'e0, n, q', desc: 'E = E° - (0.0257/n)×ln(Q) — 25°C' },
        { name: 'lei_faraday_eletro', params: 'i, t, mm, n_el', desc: 'm = (I×t×MM) / (n×F)' },
        { name: 'massa_depositada', params: 'i, t, mm, n_el', desc: 'Gramas depositadas na eletrólise' },
        { name: 'eficiencia_coulombica', params: 'q_saida, q_entrada', desc: 'η = Qsaída / Qentrada × 100%' },
        { name: 'energia_celula', params: 'n, e_cell', desc: 'ΔG = -nFE (J/mol)' },
        { name: 'ddp_pilha', params: 'e_pos, e_neg', desc: 'DDP = E+ - E-' },
        { name: 'potencial_padrao', params: 'dg, n', desc: 'E° = -ΔG° / (nF)' },
        { name: 'capacidade_bateria', params: 'ah, tensao', desc: 'Energia (Wh) = Ah × V' },
        { name: 'numero_transferencia', params: 'u_ion, u_total', desc: 't = u_ion / Σu' },
      ],
      jsCode: `var _F_eq = 96485;
function potencial_celula(e_catodo, e_anodo) { return e_catodo - e_anodo; }
function equacao_nernst(e0, n, q) { return e0 - (0.025693/n)*Math.log(q); }
function lei_faraday_eletro(i, t, mm, n_el) { return (i*t*mm)/(n_el*_F_eq); }
function massa_depositada(i, t, mm, n_el) { return lei_faraday_eletro(i,t,mm,n_el); }
function eficiencia_coulombica(q_saida, q_entrada) { return (q_saida/q_entrada)*100; }
function energia_celula(n, e_cell) { return -n*_F_eq*e_cell; }
function ddp_pilha(e_pos, e_neg) { return e_pos - e_neg; }
function potencial_padrao(dg, n) { return -dg/(n*_F_eq); }
function capacidade_bateria(ah, tensao) { return ah*tensao; }
function numero_transferencia(u_ion, u_total) { return u_ion/u_total; }`,
      example: `importe eletroquimica\n\nexecute potencial_celula(0.34, -0.76)\nexecute equacao_nernst(1.1, 2, 0.01)\nexecute lei_faraday_eletro(2, 3600, 63.5, 2)\nexecute capacidade_bateria(100, 3.7)\napresente energia_celula(2, 1.1) em destaque`,
    },

    // ── bioquimica ────────────────────────────────────────────
    bioquimica: {
      key: 'bioquimica',
      title: '🔬 Bioquímica',
      description: 'Cinética enzimática de Michaelis-Menten, energia de ATP, metabolismo, lei de Beer-Lambert e ponto isoelétrico.',
      exports: ['velocidade_michaelis','km_aparente','inibicao_competitiva','energia_atp','rendimento_glicolise','absorbancia_beer','concentracao_proteina','ponto_isoeletrico','taxa_turnover','ph_otimo_enzima'],
      functions: [
        { name: 'velocidade_michaelis', params: 'vmax, s, km', desc: 'v = Vmax×[S] / (Km+[S])' },
        { name: 'km_aparente', params: 'km, i, ki', desc: 'Km\' = Km×(1 + [I]/Ki)' },
        { name: 'inibicao_competitiva', params: 'vmax, s, km, i, ki', desc: 'v com inibidor competitivo' },
        { name: 'energia_atp', params: 'n_atp', desc: 'Energia = n × 30.5 kJ/mol' },
        { name: 'rendimento_glicolise', params: 'glicose_mol', desc: 'ATP líquido = 2 × mol glicose' },
        { name: 'absorbancia_beer', params: 'c, coef, l', desc: 'A = ε × c × l' },
        { name: 'concentracao_proteina', params: 'abs, coef', desc: 'c = Abs / ε' },
        { name: 'ponto_isoeletrico', params: 'pka1, pka2', desc: 'pI = (pKa1 + pKa2) / 2' },
        { name: 'taxa_turnover', params: 'vmax, et', desc: 'kcat = Vmax / [Et]' },
        { name: 'ph_otimo_enzima', params: 'pka1, pka2', desc: 'pH ótimo ≈ (pKa1 + pKa2) / 2' },
      ],
      jsCode: `function velocidade_michaelis(vmax, s, km) { return vmax*s/(km+s); }
function km_aparente(km, i, ki) { return km*(1+i/ki); }
function inibicao_competitiva(vmax, s, km, i, ki) { return vmax*s/(km_aparente(km,i,ki)+s); }
function energia_atp(n_atp) { return n_atp*30.5; }
function rendimento_glicolise(glicose_mol) { return 2*glicose_mol; }
function absorbancia_beer(c, coef, l) { return coef*c*(l||1); }
function concentracao_proteina(abs, coef) { return abs/coef; }
function ponto_isoeletrico(pka1, pka2) { return (pka1+pka2)/2; }
function taxa_turnover(vmax, et) { return vmax/et; }
function ph_otimo_enzima(pka1, pka2) { return (pka1+pka2)/2; }`,
      example: `importe bioquimica\n\nexecute velocidade_michaelis(100, 5, 2)\nexecute km_aparente(2, 1, 0.5)\nexecute energia_atp(36)\nexecute taxa_turnover(100, 0.001)\napresente inibicao_competitiva(100, 5, 2, 1, 0.5) em destaque`,
    },

    // ── matematica_discreta ───────────────────────────────────
    matematica_discreta: {
      key: 'matematica_discreta',
      title: '🔣 Matemática Discreta',
      description: 'MDC, MMC, aritmética modular, inverso modular, totiente de Euler, divisores e funções de piso/teto.',
      exports: ['mdc','mmc','mod','inverso_modular','euler_phi','eh_coprimo','piso','teto','num_divisores','soma_divisores'],
      functions: [
        { name: 'mdc', params: 'a, b', desc: 'Máximo divisor comum (Euclides)' },
        { name: 'mmc', params: 'a, b', desc: 'Mínimo múltiplo comum' },
        { name: 'mod', params: 'a, m', desc: 'a mod m (sempre positivo)' },
        { name: 'inverso_modular', params: 'a, m', desc: 'a⁻¹ mod m (se existir)' },
        { name: 'euler_phi', params: 'n', desc: 'φ(n) — totiente de Euler' },
        { name: 'eh_coprimo', params: 'a, b', desc: '1 se MDC(a,b) = 1' },
        { name: 'piso', params: 'x', desc: '⌊x⌋' },
        { name: 'teto', params: 'x', desc: '⌈x⌉' },
        { name: 'num_divisores', params: 'n', desc: 'Quantidade de divisores de n' },
        { name: 'soma_divisores', params: 'n', desc: 'Soma de todos os divisores de n' },
      ],
      jsCode: `function mdc(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a;}
function mmc(a,b){return Math.abs(a*b)/mdc(a,b);}
function mod(a,m){return((a%m)+m)%m;}
function inverso_modular(a,m){for(var x=1;x<m;x++)if(mod(a*x,m)===1)return x;return 'não existe';}
function euler_phi(n){var r=n,orig=n;for(var p=2;p*p<=orig;p++)if(orig%p===0){while(orig%p===0)orig/=p;r-=r/p;}if(orig>1)r-=r/orig;return r;}
function eh_coprimo(a,b){return mdc(a,b)===1?1:0;}
function piso(x){return Math.floor(x);}
function teto(x){return Math.ceil(x);}
function num_divisores(n){var c=0;for(var i=1;i<=Math.sqrt(n);i++)if(n%i===0)c+=i*i===n?1:2;return c;}
function soma_divisores(n){var s=0;for(var i=1;i<=n;i++)if(n%i===0)s+=i;return s;}`,
      example: `importe matematica_discreta\n\nexecute mdc(48, 18)\nexecute mmc(12, 18)\nexecute euler_phi(36)\nexecute inverso_modular(3, 7)\napresente num_divisores(60) em destaque`,
    },

    // ── teoria_grafos ─────────────────────────────────────────
    teoria_grafos: {
      key: 'teoria_grafos',
      title: '🕸️ Teoria dos Grafos',
      description: 'Densidade, ciclos eulerianos, árvore geradora, coloração, centralidade, clustering e métricas de rede.',
      exports: ['densidade_grafo','eh_euleriano','num_arestas_arvore','coloracao_minima','centralidade_grau','coeficiente_clustering','conectividade','indice_wiener','grau_medio','esparsidade'],
      functions: [
        { name: 'densidade_grafo', params: 'v, a', desc: 'D = 2A / (V×(V-1))' },
        { name: 'eh_euleriano', params: 'graus', desc: '1 se todos os graus são pares' },
        { name: 'num_arestas_arvore', params: 'v', desc: 'Árvore geradora tem V-1 arestas' },
        { name: 'coloracao_minima', params: 'grau_max', desc: 'χ ≤ Δ+1 (Brooks)' },
        { name: 'centralidade_grau', params: 'grau, v', desc: 'Cd = grau / (V-1)' },
        { name: 'coeficiente_clustering', params: 'triangulos, triplas', desc: 'C = 3×triângulos / triplas' },
        { name: 'conectividade', params: 'v, a', desc: '1 se A ≥ V-1 (necessário p/ conexo)' },
        { name: 'indice_wiener', params: 'distancias', desc: 'W = Σ distâncias entre pares / 2' },
        { name: 'grau_medio', params: 'v, a', desc: 'k̄ = 2A / V' },
        { name: 'esparsidade', params: 'v, a', desc: '1 - densidade (complemento)' },
      ],
      jsCode: `function densidade_grafo(v,a){return 2*a/(v*(v-1));}
function eh_euleriano(graus){var arr=Array.isArray(graus)?graus:Object.values(graus);return arr.every(function(g){return g%2===0;})?1:0;}
function num_arestas_arvore(v){return v-1;}
function coloracao_minima(grau_max){return grau_max+1;}
function centralidade_grau(grau,v){return grau/(v-1);}
function coeficiente_clustering(triangulos,triplas){return 3*triangulos/triplas;}
function conectividade(v,a){return a>=v-1?1:0;}
function indice_wiener(distancias){var arr=Array.isArray(distancias)?distancias:Object.values(distancias);return arr.reduce(function(s,v){return s+v;},0)/2;}
function grau_medio(v,a){return 2*a/v;}
function esparsidade(v,a){return 1-densidade_grafo(v,a);}`,
      example: `importe teoria_grafos\n\nexecute densidade_grafo(6, 7)\nexecute eh_euleriano(2, 4, 2, 4, 2, 4)\nexecute num_arestas_arvore(8)\nexecute grau_medio(6, 7)\napresente coloracao_minima(4) em destaque`,
    },

    // ── engenharia_mecanica ───────────────────────────────────
    engenharia_mecanica: {
      key: 'engenharia_mecanica',
      selo: 'recomendada',
      title: '🔩 Engenharia Mecânica',
      description: 'Tensão, deformação, módulo de Young, torque, potência de eixo, fator de segurança, flexão e fadiga.',
      exports: ['tensao_normal','deformacao','modulo_young','tensao_cisalhamento','torque','potencia_eixo','fator_seguranca','deflexao_viga','momento_fletor','vida_fadiga'],
      functions: [
        { name: 'tensao_normal', params: 'f, a', desc: 'σ = F / A (Pa)' },
        { name: 'deformacao', params: 'dl, l0', desc: 'ε = ΔL / L0' },
        { name: 'modulo_young', params: 'sigma, epsilon', desc: 'E = σ / ε' },
        { name: 'tensao_cisalhamento', params: 'f, a', desc: 'τ = F / A' },
        { name: 'torque', params: 'f, r', desc: 'T = F × r (N·m)' },
        { name: 'potencia_eixo', params: 't, omega', desc: 'P = T × ω (W)' },
        { name: 'fator_seguranca', params: 'resistencia, tensao_ap', desc: 'FS = resistência / tensão aplicada' },
        { name: 'deflexao_viga', params: 'f, l, e, i', desc: 'δ = FL³/(3EI) — viga engastada' },
        { name: 'momento_fletor', params: 'f, l', desc: 'M = F × L (N·m)' },
        { name: 'vida_fadiga', params: 'sigma_a, sigma_e, b', desc: 'N = (σe/σa)^(1/b) — Basquin' },
      ],
      jsCode: `function tensao_normal(f,a){return f/a;}
function deformacao(dl,l0){return dl/l0;}
function modulo_young(sigma,epsilon){return sigma/epsilon;}
function tensao_cisalhamento(f,a){return f/a;}
function torque(f,r){return f*r;}
function potencia_eixo(t,omega){return t*omega;}
function fator_seguranca(resistencia,tensao_ap){return resistencia/tensao_ap;}
function deflexao_viga(f,l,e,i){return f*Math.pow(l,3)/(3*e*i);}
function momento_fletor(f,l){return f*l;}
function vida_fadiga(sigma_a,sigma_e,b){return Math.pow(sigma_e/sigma_a,1/b);}`,
      example: `importe engenharia_mecanica\n\nexecute tensao_normal(10000, 0.005)\nexecute deformacao(0.002, 1)\nexecute modulo_young(200e6, 0.001)\nexecute torque(500, 0.1)\napresente fator_seguranca(250e6, 150e6) em destaque`,
    },

    // ── engenharia_quimica ────────────────────────────────────
    engenharia_quimica: {
      key: 'engenharia_quimica',
      title: '⚗️ Engenharia Química',
      description: 'Balanço de massa, conversão de reator, CSTR, PFR, eficiência de trocador de calor e tempo de residência.',
      exports: ['balanco_massa','conversao_reator','cstr_volume','pfr_volume','tempo_residencia','numero_ntu','eficiencia_trocador','rendimento_reacao_eq','fator_separacao','refluxo_minimo'],
      functions: [
        { name: 'balanco_massa', params: 'entrada, saida', desc: 'Acúmulo = Entrada - Saída' },
        { name: 'conversao_reator', params: 'fa0, fa', desc: 'X = (FA0 - FA) / FA0' },
        { name: 'cstr_volume', params: 'fa0, x, ra', desc: 'V = FA0×X / (-rA)' },
        { name: 'pfr_volume', params: 'fa0, x, k, ca0', desc: 'V = FA0/(k×CA0) × ln(1/(1-X))' },
        { name: 'tempo_residencia', params: 'v, q', desc: 'τ = V / Q (s)' },
        { name: 'numero_ntu', params: 'ua, c_min', desc: 'NTU = UA / Cmin' },
        { name: 'eficiencia_trocador', params: 'ntu, r', desc: 'ε = (1-e^(-NTU(1+R)))/(1+R)' },
        { name: 'rendimento_reacao_eq', params: 'mol_prod, mol_reag', desc: 'η = mol produto / mol reagente' },
        { name: 'fator_separacao', params: 'y1, y2, x1, x2', desc: 'S = (y1/y2) / (x1/x2)' },
        { name: 'refluxo_minimo', params: 'xd, xf, alpha', desc: 'Rmin por Underwood simplificado' },
      ],
      jsCode: `function balanco_massa(entrada,saida){return entrada-saida;}
function conversao_reator(fa0,fa){return(fa0-fa)/fa0;}
function cstr_volume(fa0,x,ra){return fa0*x/Math.abs(ra);}
function pfr_volume(fa0,x,k,ca0){return fa0/(k*ca0)*Math.log(1/(1-x));}
function tempo_residencia(v,q){return v/q;}
function numero_ntu(ua,c_min){return ua/c_min;}
function eficiencia_trocador(ntu,r){return(1-Math.exp(-ntu*(1+(r||1))))/(1+(r||1));}
function rendimento_reacao_eq(mol_prod,mol_reag){return mol_prod/mol_reag;}
function fator_separacao(y1,y2,x1,x2){return(y1/y2)/(x1/x2);}
function refluxo_minimo(xd,xf,alpha){return 1/(alpha-1)*(xd/xf-alpha*(1-xd)/(1-xf));}`,
      example: `importe engenharia_quimica\n\nexecute balanco_massa(100, 85)\nexecute conversao_reator(10, 4)\nexecute cstr_volume(2, 0.8, 0.5)\nexecute tempo_residencia(10, 2)\napresente eficiencia_trocador(2, 1) em destaque`,
    },

    // ── engenharia_ambiental ──────────────────────────────────
    engenharia_ambiental: {
      key: 'engenharia_ambiental',
      title: '🌱 Engenharia Ambiental',
      description: 'Pegada de carbono, DBO, qualidade da água, emissões por combustível, carga poluente e eficiência de tratamento.',
      exports: ['pegada_carbono','dbo_remocao','indice_qualidade_agua','emissao_co2_combustivel','carga_poluente','eficiencia_tratamento','iq_ar','tempo_autodepuracao','demanda_oxigenio','fator_emissao'],
      functions: [
        { name: 'pegada_carbono', params: 'kwh, fator', desc: 'kg CO₂ = kWh × fator emissão' },
        { name: 'dbo_remocao', params: 'dbo_entrada, dbo_saida', desc: 'Remoção = (E-S)/E × 100%' },
        { name: 'indice_qualidade_agua', params: 'od, dbo, ph', desc: 'IQA simplificado (0-100)' },
        { name: 'emissao_co2_combustivel', params: 'litros, fator_combustivel', desc: 'kg CO₂ (gasolina≈2.3, diesel≈2.7)' },
        { name: 'carga_poluente', params: 'q, c', desc: 'Carga = Q × C (kg/dia)' },
        { name: 'eficiencia_tratamento', params: 'c_entrada, c_saida', desc: 'η = (Ce-Cs)/Ce × 100' },
        { name: 'iq_ar', params: 'concentracao, padrao', desc: 'IQAr = concentração/padrão × 100' },
        { name: 'tempo_autodepuracao', params: 'dbo, taxa', desc: 'T = DBO / taxa degradação (dias)' },
        { name: 'demanda_oxigenio', params: 'dbo, vazao', desc: 'DO necessária (kg/dia)' },
        { name: 'fator_emissao', params: 'emissao, atividade', desc: 'FE = emissão / unidade atividade' },
      ],
      jsCode: `function pegada_carbono(kwh,fator){return kwh*(fator||0.09);}
function dbo_remocao(dbo_entrada,dbo_saida){return(dbo_entrada-dbo_saida)/dbo_entrada*100;}
function indice_qualidade_agua(od,dbo,ph){var pod=Math.min(od/8,1),pdbo=Math.max(1-dbo/30,0),pph=(ph>=6.5&&ph<=8.5)?1:0.5;return(pod*0.4+pdbo*0.4+pph*0.2)*100;}
function emissao_co2_combustivel(litros,fator_combustivel){return litros*(fator_combustivel||2.3);}
function carga_poluente(q,c){return q*c*86.4;}
function eficiencia_tratamento(c_entrada,c_saida){return(c_entrada-c_saida)/c_entrada*100;}
function iq_ar(concentracao,padrao){return(concentracao/padrao)*100;}
function tempo_autodepuracao(dbo,taxa){return dbo/taxa;}
function demanda_oxigenio(dbo,vazao){return dbo*vazao*86.4/1000;}
function fator_emissao(emissao,atividade){return emissao/atividade;}`,
      example: `importe engenharia_ambiental\n\nexecute pegada_carbono(1000, 0.09)\nexecute dbo_remocao(300, 30)\nexecute emissao_co2_combustivel(50, 2.3)\nexecute eficiencia_tratamento(300, 30)\napresente indice_qualidade_agua(7, 2, 7.2) em destaque`,
    },

    // ── redes ─────────────────────────────────────────────────
    redes: {
      key: 'redes',
      title: '🌐 Redes e Sistemas',
      description: 'Throughput, latência, lei de Amdahl, fila M/M/1, disponibilidade, MTBF, MTTR e capacidade de Shannon.',
      exports: ['throughput','latencia_total','lei_amdahl','utilizacao_fila','tempo_espera_fila','disponibilidade','mtbf','mttr','capacidade_canal','jitter'],
      functions: [
        { name: 'throughput', params: 'tamanho, tempo', desc: 'Throughput = tamanho / tempo (bps)' },
        { name: 'latencia_total', params: 'propagacao, transmissao', desc: 'L = propagação + transmissão' },
        { name: 'lei_amdahl', params: 's, p', desc: 'Speedup = 1 / (S + (1-S)/P)' },
        { name: 'utilizacao_fila', params: 'lambda, mu', desc: 'ρ = λ / μ' },
        { name: 'tempo_espera_fila', params: 'lambda, mu', desc: 'Wq = ρ / (μ - λ) — M/M/1' },
        { name: 'disponibilidade', params: 'mtbf_val, mttr_val', desc: 'A = MTBF / (MTBF + MTTR)' },
        { name: 'mtbf', params: 'tempo_total, falhas', desc: 'MTBF = tempo / falhas' },
        { name: 'mttr', params: 'tempo_reparo, falhas', desc: 'MTTR = tempo reparo / falhas' },
        { name: 'capacidade_canal', params: 'b, snr', desc: 'C = B × log2(1 + SNR) — Shannon' },
        { name: 'jitter', params: 'latencias', desc: 'Variação média da latência' },
      ],
      jsCode: `function throughput(tamanho,tempo){return tamanho/tempo;}
function latencia_total(propagacao,transmissao){return propagacao+transmissao;}
function lei_amdahl(s,p){return 1/(s+(1-s)/p);}
function utilizacao_fila(lambda,mu){return lambda/mu;}
function tempo_espera_fila(lambda,mu){var rho=lambda/mu;return rho/(mu-lambda);}
function disponibilidade(mtbf_val,mttr_val){return mtbf_val/(mtbf_val+mttr_val);}
function mtbf(tempo_total,falhas){return tempo_total/falhas;}
function mttr(tempo_reparo,falhas){return tempo_reparo/falhas;}
function capacidade_canal(b,snr){return b*Math.log2(1+snr);}
function jitter(latencias){var arr=Array.isArray(latencias)?latencias:Object.values(latencias),m=arr.reduce(function(s,v){return s+v;},0)/arr.length;return arr.reduce(function(s,v){return s+Math.abs(v-m);},0)/arr.length;}`,
      example: `importe redes\n\nexecute lei_amdahl(0.1, 8)\nexecute capacidade_canal(1e6, 100)\nexecute utilizacao_fila(80, 100)\nexecute disponibilidade(720, 4)\napresente tempo_espera_fila(80, 100) em destaque`,
    },

    // ── matematica_financeira_avancada ────────────────────────
    matematica_financeira_avancada: {
      key: 'matematica_financeira_avancada',
      title: '📉 Matemática Financeira Avançada',
      description: 'Duration, convexidade, precificação de bonds, yield to maturity, VaR, Sharpe, Black-Scholes e drawdown.',
      exports: ['duration_macaulay','convexidade','preco_bond','yield_aproximado','var_parametrico','sharpe_ratio','beta_carteira','alpha_jensen','black_scholes_call','drawdown_maximo'],
      functions: [
        { name: 'duration_macaulay', params: 'fluxos, taxa, tempos', desc: 'Duration = Σ(t×PV) / Preço' },
        { name: 'convexidade', params: 'preco, dy, p_up, p_down', desc: 'Conv = (P+ + P- - 2P) / (P×Δy²)' },
        { name: 'preco_bond', params: 'c, r, n, vf', desc: 'P = Σ C/(1+r)^t + VF/(1+r)^n' },
        { name: 'yield_aproximado', params: 'c, preco, vf, n', desc: 'YTM ≈ (C+(VF-P)/n) / ((VF+P)/2)' },
        { name: 'var_parametrico', params: 'valor, sigma, z', desc: 'VaR = valor × σ × z' },
        { name: 'sharpe_ratio', params: 'retorno, rf, sigma', desc: 'S = (R - Rf) / σ' },
        { name: 'beta_carteira', params: 'cov, var_mercado', desc: 'β = Cov(Ri,Rm) / Var(Rm)' },
        { name: 'alpha_jensen', params: 'r, rf, beta, rm', desc: 'α = R - [Rf + β×(Rm-Rf)]' },
        { name: 'black_scholes_call', params: 's, k, r, t, sigma', desc: 'Preço de opção call (Black-Scholes)' },
        { name: 'drawdown_maximo', params: 'pico, vale', desc: 'DD = (Pico - Vale) / Pico' },
      ],
      jsCode: `function duration_macaulay(fluxos,taxa,tempos){var fa=Array.isArray(fluxos)?fluxos:Object.values(fluxos),ta=Array.isArray(tempos)?tempos:Object.values(tempos),pv=fa.map(function(f,i){return f/Math.pow(1+taxa,ta[i]);}),preco=pv.reduce(function(s,v){return s+v;},0);return pv.reduce(function(s,v,i){return s+ta[i]*v;},0)/preco;}
function convexidade(preco,dy,p_up,p_down){return(p_up+p_down-2*preco)/(preco*dy*dy);}
function preco_bond(c,r,n,vf){var p=0;for(var i=1;i<=n;i++)p+=c/Math.pow(1+r,i);return p+vf/Math.pow(1+r,n);}
function yield_aproximado(c,preco,vf,n){return(c+(vf-preco)/n)/((vf+preco)/2);}
function var_parametrico(valor,sigma,z){return valor*sigma*(z||1.645);}
function sharpe_ratio(retorno,rf,sigma){return(retorno-rf)/sigma;}
function beta_carteira(cov,var_mercado){return cov/var_mercado;}
function alpha_jensen(r,rf,beta,rm){return r-(rf+beta*(rm-rf));}
function black_scholes_call(s,k,r,t,sigma){var d1=(Math.log(s/k)+(r+sigma*sigma/2)*t)/(sigma*Math.sqrt(t)),d2=d1-sigma*Math.sqrt(t),N=function(x){return 0.5*(1+Math.tanh(0.7978*x*(1+0.044715*x*x)));};return s*N(d1)-k*Math.exp(-r*t)*N(d2);}
function drawdown_maximo(pico,vale){return(pico-vale)/pico;}`,
      example: `importe matematica_financeira_avancada\n\nexecute preco_bond(100, 0.05, 5, 1000)\nexecute yield_aproximado(100, 950, 1000, 5)\nexecute sharpe_ratio(0.15, 0.05, 0.12)\nexecute black_scholes_call(100, 100, 0.05, 1, 0.2)\napresente drawdown_maximo(150, 90) em destaque`,
    },

    // ── biblioteca_geral ─────────────────────────────────────
    biblioteca_geral: {
      key: 'biblioteca_geral',
      selo: 'meta',
      title: '📦 Biblioteca Geral',
      description: 'Pacote completo — importa física, finanças, conversões, matemática, estatística, geometria, progressões e números de uma só vez.',
      exports: [],
      functions: [],
      jsCode: '',
      example: `importe biblioteca_geral\n\n# Agora todas as funções estão disponíveis!\nexecute fatorial(8)\nexecute velocidade(100, 5)\nexecute roi(15000, 10000)\nexecute celsius_para_fahrenheit(37)\nexecute area_circulo(5)\nexecute eh_primo(17)`,
      dependencies: ['fisica_mecanica', 'formulas_financas', 'conversoes', 'matematica', 'estatistica_avancada', 'geometria', 'progressoes', 'numeros', 'trigonometria', 'esportes', 'culinaria', 'logistica'],
    },

    // ── biblioteca_ciencias ──────────────────────────────────
    biblioteca_ciencias: {
      key: 'biblioteca_ciencias',
      selo: 'meta',
      title: '🔬 Biblioteca de Ciências',
      description: 'Meta-biblioteca dupla: importa física completa (7 sub-libs), química completa (5 sub-libs), biologia completa (5 sub-libs), astronomia, eletricidade e álgebra linear.',
      exports: [],
      functions: [],
      jsCode: '',
      example: `importe biblioteca_ciencias\n\nexecute velocidade(100, 10)\nexecute ph(0.001)\nexecute imc_bio(78, 1.75)\nexecute velocidade_luz()\nexecute lei_ohm(220, 100)\nexecute seno(30)`,
      dependencies: ['formulas_fisica', 'formulas_quimica', 'formulas_biologia', 'astronomia', 'formulas_eletrica', 'algebra_linear', 'eletroquimica', 'bioquimica'],
    },

    // ── biblioteca_utilidades ────────────────────────────────
    biblioteca_utilidades: {
      key: 'biblioteca_utilidades',
      selo: 'meta',
      title: '🛠️ Biblioteca de Utilidades',
      description: 'Meta-biblioteca que importa texto, validação BR, datas, cores, combustível, lógica, culinária e esportes.',
      exports: [],
      functions: [],
      jsCode: '',
      example: `importe biblioteca_utilidades\n\nexecute maiusculas("olá mundo")\nexecute validar_cpf("52998224725")\nexecute dia_da_semana(25, 12, 2025)\nexecute aleatorio_cor()\nexecute consumo_medio(500, 40)`,
      dependencies: ['texto', 'validacao', 'datas', 'cores', 'combustivel', 'logica', 'culinaria', 'esportes'],
    },

    // ── biblioteca_matematica_completa ───────────────────────
    biblioteca_matematica_completa: {
      key: 'biblioteca_matematica_completa',
      selo: 'meta',
      title: '📐 Matemática Completa',
      description: 'Meta-biblioteca que importa matemática, geometria, progressões, números, álgebra linear, probabilidade, estatística, trigonometria, combinatória, complexos, sequências e conjuntos.',
      exports: [],
      functions: [],
      jsCode: '',
      example: `importe biblioteca_matematica_completa\n\nexecute fatorial(10)\nexecute area_circulo(5)\nexecute pa_soma(1, 2, 100)\nexecute eh_primo(97)\nexecute norma_vetor(3, 4)`,
      dependencies: ['matematica', 'geometria', 'progressoes', 'numeros', 'algebra_linear', 'probabilidade', 'estatistica_avancada', 'trigonometria', 'combinatoria', 'numeros_complexos', 'sequencias', 'conjuntos', 'matematica_discreta', 'teoria_grafos'],
    },

    // ── biblioteca_financeira_completa ───────────────────────
    biblioteca_financeira_completa: {
      key: 'biblioteca_financeira_completa',
      selo: 'meta',
      title: '💰 Financeira Completa',
      description: 'Meta-biblioteca que importa finanças, investimentos, economia, finanças BR, contabilidade, marketing digital e logística.',
      exports: [],
      functions: [],
      jsCode: '',
      example: `importe biblioteca_financeira_completa\n\nexecute juros_compostos(1000, 0.01, 12)\nexecute roi_investimento(15000, 10000)\nexecute pib_per_capita(2000000, 200000)\nexecute aliquota_irpf(4500)\napresente roe(120000, 400000) em destaque`,
      dependencies: ['formulas_financas', 'investimentos', 'formulas_economia', 'financas_br', 'formulas_contabilidade', 'marketing_digital', 'logistica', 'matematica_financeira_avancada'],
    },
  },

  get(name) {
    if (this.official[name]) return this.official[name];
    const custom = this.getCustomLibs();
    return custom[name] || null;
  },

  getAll() {
    return { ...this.official, ...this.getCustomLibs() };
  },

  getOfficialKeys() {
    return Object.keys(this.official);
  },

  getCustomLibs() {
    try { return JSON.parse(localStorage.getItem('crabcode_custom_libs') || '{}'); }
    catch { return {}; }
  },

  saveCustomLib(lib) {
    const custom = this.getCustomLibs();
    custom[lib.key] = lib;
    localStorage.setItem('crabcode_custom_libs', JSON.stringify(custom));
  },

  deleteCustomLib(key) {
    const custom = this.getCustomLibs();
    delete custom[key];
    localStorage.setItem('crabcode_custom_libs', JSON.stringify(custom));
  },

  compileCustomLib(crabCodeSrc) {
    try {
      const lexer = new Lexer(crabCodeSrc, { registry: CrabLibRegistry });
      const { tokens, errors: lexErrors } = lexer.tokenize();
      const parser = new Parser(tokens, new Set(lexer.declaredVars), new Set(lexer.declaredArrays), new Set(lexer.declaredObjects), { registry: CrabLibRegistry });
      const { ast, errors: parseErrors } = parser.parse();
      const transpiler = new Transpiler(ast, new Set(lexer.declaredVars), new Set(lexer.declaredArrays), new Set(lexer.declaredObjects), { registry: CrabLibRegistry });
      const { code: jsCode, errors: transpileErrors } = transpiler.transpile();
      const allErrors = [...lexErrors, ...parseErrors, ...transpileErrors];
      if (allErrors.length > 0) return { error: allErrors[0].message, jsCode: null, exports: [] };
      const lines = jsCode.split('\n').filter(l => !l.startsWith('const __output') && !l.startsWith('return __output') && !l.includes('__output.push'));
      const cleanJs = lines.join('\n').replace(/^let /gm, 'var ');
      const exportNames = [];
      const funcRe = /^function\s+([a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*)/gm;
      const varRe = /^var\s+([a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*)/gm;
      let fm;
      while ((fm = funcRe.exec(cleanJs)) !== null) exportNames.push(fm[1]);
      while ((fm = varRe.exec(cleanJs)) !== null) exportNames.push(fm[1]);
      return { error: null, jsCode: cleanJs, exports: exportNames };
    } catch (e) {
      return { error: e.message, jsCode: null, exports: [] };
    }
  }
};


export { TokenDef, Lexer, Parser, Transpiler, Runtime, CrabLibRegistry };
