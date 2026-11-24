import test from 'node:test';
import assert from 'node:assert/strict';
import { Lexer, Parser, Transpiler, CrabLibRegistry } from './js/language.js';
import { parseCSV, csvColumnsToJs, DEFAULT_CODE } from './js/storage.js';
import { getAllTutorialCodeBlocks, TUTORIAL_UNITS } from './js/tutorial.js';

// Helper: compile & execute CrabCode source in Node using async Function
async function compileAndRun(source, { csvDatasets = [], extraGlobal = {} } = {}) {
  const lexer = new Lexer(source, { registry: CrabLibRegistry, csvDatasets });
  const { tokens, errors: lexErrors } = lexer.tokenize();

  const parser = new Parser(
    tokens,
    new Set(lexer.declaredVars),
    new Set(lexer.declaredArrays),
    new Set(lexer.declaredObjects),
    { registry: CrabLibRegistry, csvDatasets }
  );
  const { ast, errors: parseErrors } = parser.parse();

  const transpiler = new Transpiler(
    ast,
    new Set(lexer.declaredVars),
    new Set(lexer.declaredArrays),
    new Set(lexer.declaredObjects),
    { registry: CrabLibRegistry, csvDatasets }
  );
  const { code: jsCode, errors: transpileErrors } = transpiler.transpile();

  const compileErrors = [...lexErrors, ...parseErrors, ...transpileErrors];

  // Minimal browser-compatible mock environment for interface / localStorage tests
  const memStore = new Map();
  const mockParent = {
    __ccState: extraGlobal.__ccState || {},
    __ccElements: extraGlobal.__ccElements || {},
    __ccSprites: extraGlobal.__ccSprites || {},
    __ccTecla: extraGlobal.__ccTecla || { atual: '' },
    __ccLastEvent: extraGlobal.__ccLastEvent || null,
    __ccImages: extraGlobal.__ccImages || {},
    localStorage: {
      getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
      setItem: (k, v) => memStore.set(k, String(v)),
    },
  };
  const mockWindow = { parent: mockParent, localStorage: mockParent.localStorage };

  let runtimeError = null;
  let output = [];

  if (compileErrors.length === 0) {
    try {
      const fn = new Function(
        'window',
        'localStorage',
        `return (async function() {
          ${jsCode}
          return typeof __output !== 'undefined' ? __output : [];
        })();`
      );
      output = await fn(mockWindow, mockParent.localStorage);
    } catch (err) {
      runtimeError = err.message || String(err);
    }
  }

  return {
    compileErrors,
    runtimeError,
    output,
    jsCode,
    interfaceMode: transpiler._interfaceMode,
    mockParent,
  };
}

// ==================== 1. LANGUAGE ENGINE CORE & EDGE CASES ====================
test('DEFAULT_CODE compiles and runs cleanly with zero errors', async () => {
  const res = await compileAndRun(DEFAULT_CODE);
  assert.deepEqual(res.compileErrors, []);
  assert.equal(res.runtimeError, null);
  assert.ok(res.output.length >= 6);
});

test('Scientific notation, arrays [...], unary minus, booleans, and logical ops', async () => {
  const code = `
defina c como 3e8
defina q como 1.6e-19
defina neg como -42.5
defina arr como [10, 20, -30, 40]
defina ok como verdadeiro
defina fail como falso
execute c * q
execute arr.3 + neg
execute "passou" se (ok e nao fail) ou falso senao "falhou"
`;
  const res = await compileAndRun(code);
  assert.deepEqual(res.compileErrors, []);
  assert.equal(res.runtimeError, null);
  assert.equal(res.output[1].value, -72.5);
  assert.equal(res.output[2].value, 'passou');
});

test('Context-sensitive keywords allowed as variable names & imports', async () => {
  const code = `
importe texto
defina dados como 42
defina tabela como 100
defina cor como "azul"
apresente dados em dados
apresente tabela em texto
apresente rodar(execute inverter_texto(cor)) em texto
`;
  const res = await compileAndRun(code);
  assert.deepEqual(res.compileErrors, []);
  assert.equal(res.runtimeError, null);
  assert.equal(res.output[2].value, 'luza');
});

test('execute loop produces outputs without returning early', async () => {
  const code = `
defina i como 1
execute loop(i = 1, i <= 4, i = i + 1) execute i * 10
`;
  const res = await compileAndRun(code);
  assert.deepEqual(res.compileErrors, []);
  assert.equal(res.runtimeError, null);
  assert.deepEqual(res.output.map(o => o.value), [10, 20, 30, 40]);
});

test('Interface mode: botao click updates state, slider/toggle persist, sprite "key" & com cor work', async () => {
  const code = `
importe interface
execute cor de fundo 15 23 42
execute cor de texto 240 245 255
defina n como 0
defina s como funcao() slider("Vol", -10, 50)
defina t como funcao() toggle("Ativo")
defina b como funcao() botao("+1") altere n para n + 1
defina p como sprite "nave"
defina tri como sprite reto(0,0, 10,0, 5,10) com cor 255 120 0
apresente n em texto ajuste centro m
apresente b em botao ajuste centro m
apresente s em slider ajuste centro m
apresente t em toggle ajuste centro m
apresente p em sprite ajuste centro m
apresente tri em sprite grid(5, 5)
`;
  // Initial render
  const r1 = await compileAndRun(code);
  assert.deepEqual(r1.compileErrors, []);
  assert.equal(r1.runtimeError, null);
  assert.equal(r1.interfaceMode, true);
  assert.equal(r1.mockParent.__ccState.n, 0);

  // Simulate button click event re-run (matches InterfaceRenderer._triggerRerun payload)
  const r2 = await compileAndRun(code, {
    extraGlobal: {
      __ccState: r1.mockParent.__ccState,
      __ccElements: r1.mockParent.__ccElements,
      __ccSprites: r1.mockParent.__ccSprites,
      __ccLastEvent: { eventType: 'click', key: 'b' },
    },
  });
  assert.deepEqual(r2.compileErrors, []);
  assert.equal(r2.runtimeError, null);
  assert.equal(r2.mockParent.__ccState.n, 1);
  const textoItem = r2.output.find(o => o.type === 'texto');
  assert.equal(textoItem.value, 1);
  assert.ok(r2.output.some(o => o.type === 'sprite' && o.spriteKey === 'p'));
  assert.equal(r2.mockParent.__ccSprites.p.imageKey, 'nave');
  assert.deepEqual(r2.mockParent.__ccSprites.tri.color, { r: 255, g: 120, b: 0 });
});

test('Interface mode: conditional botao altere se/senao works', async () => {
  const code = `
importe interface
defina n como 2
defina b como funcao() botao("Wrap") altere n para n + 1 se n < 2 senao 0
apresente n em texto
`;
  const r1 = await compileAndRun(code);
  assert.deepEqual(r1.compileErrors, []);
  assert.equal(r1.mockParent.__ccState.n, 2);

  const r2 = await compileAndRun(code, {
    extraGlobal: {
      __ccState: r1.mockParent.__ccState,
      __ccElements: r1.mockParent.__ccElements,
      __ccLastEvent: { eventType: 'click', key: 'b' },
    },
  });
  assert.deepEqual(r2.compileErrors, []);
  assert.equal(r2.runtimeError, null);
  assert.equal(r2.mockParent.__ccState.n, 0);
});

test('All QUICK_TEMPLATES in js/main.js compile and run with zero errors', async () => {
  const fs = await import('node:fs');
  const mainSrc = fs.readFileSync(new URL('./js/main.js', import.meta.url), 'utf8');
  const match = mainSrc.match(/const QUICK_TEMPLATES = (\[[\s\S]*?\n\]);/);
  assert.ok(match, 'Could not locate QUICK_TEMPLATES in js/main.js');
  const templates = new Function(`return ${match[1]};`)();
  assert.equal(templates.length, 6);
  for (const tpl of templates) {
    const res = await compileAndRun(tpl.code);
    assert.deepEqual(res.compileErrors, [], `Template '${tpl.id}' compile errors: ${JSON.stringify(res.compileErrors)}`);
    assert.equal(res.runtimeError, null, `Template '${tpl.id}' runtime error: ${res.runtimeError}`);
    assert.ok(res.output.length > 0, `Template '${tpl.id}' produced empty output`);
  }
});

test('Conditional cor de fundo works cleanly', async () => {
  const code = `
importe interface
defina quente como verdadeiro
execute cor de fundo 200 40 40 se quente senao 20 40 120
apresente "ok" em texto
`;
  const res = await compileAndRun(code);
  assert.deepEqual(res.compileErrors, []);
  assert.equal(res.runtimeError, null);
  const bg = res.output.find(o => o.type === 'corDeFundo');
  assert.deepEqual({ r: bg.r, g: bg.g, b: bg.b }, { r: 200, g: 40, b: 40 });
});

test('Local persistence salve/carregue local works end-to-end', async () => {
  const code = `
defina pontos como 999
salve local pontos
altere pontos para 0
carregue local pontos
execute pontos
`;
  const res = await compileAndRun(code);
  assert.deepEqual(res.compileErrors, []);
  assert.equal(res.runtimeError, null);
  assert.equal(res.output[0].value, 999);
});

// ==================== 2. ALL OFFICIAL LIBRARIES AUDIT ====================
test('Registry has >= 100 official libraries and valid categories/ranks', () => {
  const keys = Object.keys(CrabLibRegistry.official);
  assert.ok(keys.length >= 100, `Expected >= 100 libs, got ${keys.length}`);
  for (const key of keys) {
    const lib = CrabLibRegistry.official[key];
    assert.ok(lib.title, `Missing title on ${key}`);
    assert.ok(lib.description, `Missing description on ${key}`);
    assert.ok(lib.category, `Missing category on ${key}`);
    if (lib.dependencies) {
      assert.equal(lib.selo, 'meta', `Meta-lib ${key} should have selo 'meta'`);
      for (const dep of lib.dependencies) {
        assert.ok(CrabLibRegistry.official[dep], `Meta-lib ${key} depends on missing lib '${dep}'`);
      }
    }
  }
});

test('Every single official library jsCode parses & exports all declared symbols', () => {
  const failures = [];
  for (const [key, lib] of Object.entries(CrabLibRegistry.official)) {
    if (!lib.jsCode || !lib.exports || lib.exports.length === 0) continue;
    try {
      const checkFn = new Function(
        `${lib.jsCode}\nreturn { ${lib.exports.map(e => `${JSON.stringify(e)}: typeof ${e}`).join(', ')} };`
      );
      const exported = checkFn();
      for (const exp of lib.exports) {
        if (exported[exp] === 'undefined') {
          failures.push(`${key}: export '${exp}' is undefined in jsCode`);
        }
      }
    } catch (err) {
      failures.push(`${key}: jsCode syntax/runtime error: ${err.message}`);
    }
  }
  assert.deepEqual(failures, [], `Library jsCode failures:\n${failures.join('\n')}`);
});

test('Every single official library example compiles and executes with zero errors', async () => {
  const failures = [];
  for (const [key, lib] of Object.entries(CrabLibRegistry.official)) {
    if (!lib.example) continue;
    const res = await compileAndRun(lib.example);
    if (res.compileErrors.length > 0) {
      failures.push(`${key}: compile errors: ${res.compileErrors.map(e => `L${e.line}:${e.message}`).join('; ')}`);
    } else if (res.runtimeError) {
      failures.push(`${key}: runtime error: ${res.runtimeError}`);
    } else {
      for (const item of res.output) {
        if (typeof item.value === 'number' && Number.isNaN(item.value)) {
          failures.push(`${key}: output produced NaN`);
        }
        if (typeof item.value === 'string' && (item.value.includes('undefined') || item.value.includes('NaN'))) {
          failures.push(`${key}: output string contains undefined/NaN: ${item.value}`);
        }
      }
    }
  }
  assert.deepEqual(failures, [], `Library example failures (${failures.length}):\n${failures.join('\n')}`);
});

// ==================== 3. ALL TUTORIAL LESSONS AUDIT ====================
test('Tutorial units are sequentially numbered 1..36 with zero gaps', () => {
  const blocks = getAllTutorialCodeBlocks();
  assert.equal(TUTORIAL_UNITS.length, 8);
  assert.equal(blocks.length, 36);
  blocks.forEach((b, i) => {
    assert.equal(b.num, i + 1, `Expected lesson num ${i + 1}, got ${b.num} (${b.title})`);
  });
});

test('Every single tutorial lesson & project compiles and runs with zero errors', async () => {
  const blocks = getAllTutorialCodeBlocks();
  const failures = [];
  for (const b of blocks) {
    const res = await compileAndRun(b.code);
    if (res.compileErrors.length > 0) {
      failures.push(`L${b.num} (${b.title}): compile errors: ${res.compileErrors.map(e => `line ${e.line}: ${e.message}`).join('; ')}`);
    } else if (res.runtimeError) {
      failures.push(`L${b.num} (${b.title}): runtime error: ${res.runtimeError}`);
    }
  }
  assert.deepEqual(failures, [], `Tutorial code failures:\n${failures.join('\n')}`);
});

// ==================== 4. CSV PARSER AUDIT ====================
test('parseCSV handles PT-BR semicolon, comma decimals, BOM, quotes, accents, and duplicate headers', () => {
  const raw = '\uFEFF"Mês";2024 Vendas;"Observação";Vendas\nJan;1250,50;"Ótimo; ""top""";10\nFev;980,25;"Normal";20\n\nMar;1500,00;"Pico";30\n';
  const parsed = parseCSV(raw);
  assert.equal(parsed.error, undefined);
  assert.equal(parsed.delimiter, ';');
  assert.equal(parsed.rows, 3);
  assert.equal(parsed.columns.length, 4);
  assert.equal(parsed.columns[0].name, 'Mes');
  assert.equal(parsed.columns[1].name, 'col_2024_Vendas');
  assert.equal(parsed.columns[1].type, 'number');
  assert.deepEqual(parsed.columns[1].values, [1250.5, 980.25, null, 1500]);
  assert.equal(parsed.columns[2].name, 'Observacao');
  assert.equal(parsed.columns[2].values[0], 'Ótimo; "top"');

  // Ensure generated JS executes cleanly
  const js = csvColumnsToJs({ columns: parsed.columns });
  const vals = new Function(`${js}\nreturn { Mes, col_2024_Vendas, Observacao };`)();
  assert.deepEqual(vals.col_2024_Vendas, [1250.5, 980.25, null, 1500]);
  assert.equal(vals.Observacao[0], 'Ótimo; "top"');
});

test('parseCSV handles standard comma CSV with quoted commas', () => {
  const raw = 'cidade,populacao\n"São Paulo, SP",12300000\n"Rio de Janeiro, RJ",6740000';
  const parsed = parseCSV(raw);
  assert.equal(parsed.delimiter, ',');
  assert.equal(parsed.columns[0].values[0], 'São Paulo, SP');
  assert.equal(parsed.columns[1].type, 'number');
  assert.equal(parsed.columns[1].values[1], 6740000);
});
