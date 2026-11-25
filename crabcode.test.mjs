import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Lexer, Parser, Transpiler, CrabLibRegistry } from './js/language.js';
import {
  parseCSV, csvColumnsToJs, DEFAULT_CODE,
  isReservedDatasetKey, parseSmartNumber,
} from './js/storage.js';
import {
  TUTORIAL_UNITS,
  getAllTutorialCodeBlocks,
  getAllTutorialSolutionBlocks,
} from './js/tutorial.js';
import { DOCS_CHAPTERS, getAllDocsCodeBlocks } from './js/docs.js';
import {
  PIXEL_PALETTES,
  PIXEL_PRESETS,
  createEmptyFrame,
  cloneFrame,
  bresenhamLine,
  rectPixels,
  circlePixels,
  floodFill,
  replaceColor,
  shiftFrame,
  flipFrameH,
  flipFrameV,
  rotateFrame90,
  autoOutline,
  resizeFramePreserve,
  hexToRgba,
  rgbaToHex,
} from './js/pixel_presets.js';

// Helper: compile & execute CrabCode source in Node using async Function
async function compileAndRun(source, { csvDatasets = [], savedSprites = null, extraGlobal = {} } = {}) {
  const lexer = new Lexer(source, { registry: CrabLibRegistry, csvDatasets });
  const { tokens, errors: lexErrors } = lexer.tokenize();

  const parser = new Parser(
    tokens,
    new Set(lexer.declaredVars),
    new Set(lexer.declaredArrays),
    new Set(lexer.declaredObjects),
    { registry: CrabLibRegistry, csvDatasets, savedSprites }
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

  const allDiagnostics = [...lexErrors, ...parseErrors, ...transpileErrors];
  const compileErrors = allDiagnostics.filter(d => d.severity !== 'warning');
  const compileWarnings = allDiagnostics.filter(d => d.severity === 'warning');

  const memStore = new Map();
  const mockParent = {
    __ccState: extraGlobal.__ccState || {},
    __ccElements: extraGlobal.__ccElements || {},
    __ccSprites: extraGlobal.__ccSprites || {},
    __ccTecla: extraGlobal.__ccTecla || { valor: '', atual: '' },
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
    compileWarnings,
    allDiagnostics,
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
execute loop(i = 1, i <= 4, i = i + 1) execute i * 10
`;
  const res = await compileAndRun(code);
  assert.deepEqual(res.compileErrors, []);
  assert.equal(res.runtimeError, null);
  assert.deepEqual(res.output.map(o => o.value), [10, 20, 30, 40]);
});

test('Interface mode: botao click updates state, slider/toggle persist, sprite & 2-arg grid(5,5) work', async () => {
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
  const r1 = await compileAndRun(code, { savedSprites: { nave: { size: 16, pixels: [] } } });
  assert.deepEqual(r1.compileErrors, []);
  assert.equal(r1.runtimeError, null);
  assert.equal(r1.interfaceMode, true);
  assert.equal(r1.mockParent.__ccState.n, 0);

  const triOut = r1.output.find(o => o.type === 'sprite' && o.spriteKey === 'tri');
  assert.deepEqual(triOut.yellow.grid, { x: 5, y: 5, w: 4, h: 2 });

  // Simulate button click re-run
  const r2 = await compileAndRun(code, {
    savedSprites: { nave: { size: 16, pixels: [] } },
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

// ==================== 2. BULLETPROOF DIAGNOSTICS AUDIT ====================
test('Diagnostics: rejects unavailable cloud storage (salve nuvem / carregue nuvem)', async () => {
  const r1 = await compileAndRun(`defina x como 10\nsalve nuvem x`);
  assert.ok(r1.compileErrors.some(e => e.code === 'E_CLOUD_UNAVAILABLE'));

  const r2 = await compileAndRun(`defina x como 10\ncarregue nuvem x`);
  assert.ok(r2.compileErrors.some(e => e.code === 'E_CLOUD_UNAVAILABLE'));
});

test('Diagnostics: detects duplicate defina, undeclared variable, arity mismatch, and division by zero', async () => {
  const rDup = await compileAndRun(`defina x como 1\ndefina x como 2`);
  assert.ok(rDup.compileErrors.some(e => e.code === 'E_DUP_DEF'));

  const rUndef = await compileAndRun(`apresente variavel_fantasma`);
  assert.ok(rUndef.compileErrors.some(e => e.code === 'E_UNDEF_VAR'));

  const rArityLib = await compileAndRun(`importe matematica\nexecute fatorial(1, 2)`);
  assert.ok(rArityLib.compileErrors.some(e => e.code === 'E_ARITY'));

  const rArityUser = await compileAndRun(`defina soma como funcao(a, b) execute a + b\nexecute soma(5)`);
  assert.ok(rArityUser.compileErrors.some(e => e.code === 'E_ARITY'));

  const rDivZero = await compileAndRun(`execute 10 / 0`);
  assert.ok(rDivZero.compileErrors.some(e => e.code === 'E_DIV_ZERO'));
});

test('Diagnostics: detects interface commands without import, RGB bounds, ajuste/grid/slider/seletor, and missing sprite warning', async () => {
  const rNeedIface = await compileAndRun(`execute cor de fundo 10 20 30`);
  assert.ok(rNeedIface.compileErrors.some(e => e.code === 'E_NEED_INTERFACE'));

  const rRgb = await compileAndRun(`importe interface\nexecute cor de fundo 300 0 0`);
  assert.ok(rRgb.compileErrors.some(e => e.code === 'E_RGB_RANGE'));

  const rAjuste = await compileAndRun(`importe interface\napresente "Oi" em texto ajuste diagonal m`);
  assert.ok(rAjuste.compileErrors.some(e => e.code === 'E_AJUSTE_INVALID'));

  const rGrid = await compileAndRun(`importe interface\napresente "Oi" em texto grid 150 1 2 2`);
  assert.ok(rGrid.compileErrors.some(e => e.code === 'E_GRID_ARGS'));

  const rSlider = await compileAndRun(`importe interface\ndefina s como funcao() slider("X", 50, 10)`);
  assert.ok(rSlider.compileErrors.some(e => e.code === 'E_SLIDER_RANGE'));

  const rSeletor = await compileAndRun(`importe interface\ndefina sel como funcao() seletor("Vazio")`);
  assert.ok(rSeletor.compileErrors.some(e => e.code === 'E_SELETOR_EMPTY'));

  const rSpriteWarn = await compileAndRun(
    `importe interface\ndefina s como sprite "inexistente"\napresente s em sprite`,
    { savedSprites: {} }
  );
  assert.ok(rSpriteWarn.compileWarnings.some(w => w.code === 'W_SPRITE_MISSING'));
});

// ==================== 3. ALL QUICK TEMPLATES ====================
test('All QUICK_TEMPLATES in js/main.js compile and run with zero errors', async () => {
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

// ==================== 4. ALL 100 OFFICIAL LIBRARIES AUDIT ====================
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

// ==================== 5. ALL 96 TUTORIAL LESSONS & 96 SOLUTIONS AUDIT ====================
test('Tutorial has 12 units x 8 lessons = 96 atomic lessons sequentially numbered with exercises and zero cloud refs', () => {
  const demos = getAllTutorialCodeBlocks();
  const sols = getAllTutorialSolutionBlocks();
  assert.equal(TUTORIAL_UNITS.length, 12);
  assert.equal(demos.length, 96);
  assert.equal(sols.length, 96);

  demos.forEach((b, i) => {
    assert.equal(b.num, i + 1, `Expected lesson num ${i + 1}, got ${b.num} (${b.title})`);
    assert.ok(!/\bnuvem\b/i.test(b.code), `Lesson ${b.num} demo mentions removed 'nuvem'`);
  });

  sols.forEach((s, i) => {
    assert.equal(s.num, i + 1);
    assert.ok(s.question.length > 10, `Lesson ${s.num} missing exercise question`);
    assert.ok(s.code.trim().length > 0, `Lesson ${s.num} missing exercise solution`);
    assert.ok(!/\bnuvem\b/i.test(s.code), `Lesson ${s.num} solution mentions removed 'nuvem'`);
  });
});

test('Every single one of the 96 tutorial demo codes compiles & executes cleanly', async () => {
  const demos = getAllTutorialCodeBlocks();
  const failures = [];
  for (const b of demos) {
    const res = await compileAndRun(b.code);
    if (res.compileErrors.length > 0) {
      failures.push(`Demo L${b.num} (${b.title}): compile errors: ${res.compileErrors.map(e => `line ${e.line}: ${e.message}`).join('; ')}`);
    } else if (res.runtimeError) {
      failures.push(`Demo L${b.num} (${b.title}): runtime error: ${res.runtimeError}`);
    } else if (res.output.length === 0) {
      failures.push(`Demo L${b.num} (${b.title}): produced empty output`);
    } else {
      for (const item of res.output) {
        if (typeof item.value === 'number' && Number.isNaN(item.value)) {
          failures.push(`Demo L${b.num}: output produced NaN`);
        }
        if (typeof item.value === 'string' && (item.value.includes('undefined') || item.value.includes('NaN'))) {
          failures.push(`Demo L${b.num}: output string contains undefined/NaN: ${item.value}`);
        }
      }
    }
  }
  assert.deepEqual(failures, [], `Tutorial demo failures (${failures.length}):\n${failures.join('\n')}`);
});

test('Every single one of the 96 tutorial exercise solutions compiles & executes cleanly', async () => {
  const sols = getAllTutorialSolutionBlocks();
  const failures = [];
  for (const s of sols) {
    const res = await compileAndRun(s.code);
    if (res.compileErrors.length > 0) {
      failures.push(`Sol L${s.num} (${s.title}): compile errors: ${res.compileErrors.map(e => `line ${e.line}: ${e.message}`).join('; ')}`);
    } else if (res.runtimeError) {
      failures.push(`Sol L${s.num} (${s.title}): runtime error: ${res.runtimeError}`);
    } else if (res.output.length === 0) {
      failures.push(`Sol L${s.num} (${s.title}): produced empty output`);
    } else {
      for (const item of res.output) {
        if (typeof item.value === 'number' && Number.isNaN(item.value)) {
          failures.push(`Sol L${s.num}: output produced NaN`);
        }
        if (typeof item.value === 'string' && (item.value.includes('undefined') || item.value.includes('NaN'))) {
          failures.push(`Sol L${s.num}: output string contains undefined/NaN: ${item.value}`);
        }
      }
    }
  }
  assert.deepEqual(failures, [], `Tutorial solution failures (${failures.length}):\n${failures.join('\n')}`);
});

// ==================== 6. DOCUMENTATION PORTAL EXAMPLES AUDIT ====================
test('Docs portal has >= 16 chapters and every runnable docs example executes with zero errors', async () => {
  assert.ok(DOCS_CHAPTERS.length >= 16, `Expected >= 16 docs chapters, got ${DOCS_CHAPTERS.length}`);
  const blocks = getAllDocsCodeBlocks();
  assert.ok(blocks.length >= 14, `Expected >= 14 runnable docs examples, got ${blocks.length}`);

  const failures = [];
  for (const b of blocks) {
    const res = await compileAndRun(b.code, { savedSprites: { nave: { size: 16, pixels: [] }, caranguejo: { size: 16, pixels: [] } } });
    if (res.compileErrors.length > 0) {
      failures.push(`Doc [${b.chapter} / ${b.title}]: compile errors: ${res.compileErrors.map(e => `L${e.line}:${e.message}`).join('; ')}`);
    } else if (res.runtimeError) {
      failures.push(`Doc [${b.chapter} / ${b.title}]: runtime error: ${res.runtimeError}`);
    } else if (res.output.length === 0) {
      failures.push(`Doc [${b.chapter} / ${b.title}]: produced empty output`);
    }
  }
  assert.deepEqual(failures, [], `Docs example failures (${failures.length}):\n${failures.join('\n')}`);
});

// ==================== 7. HARDENED CSV PARSER AUDIT ====================
test('parseSmartNumber parses PT-BR currency, thousands, percentages, and US decimals', () => {
  assert.equal(parseSmartNumber('R$ 1.250,50'), 1250.5);
  assert.equal(parseSmartNumber('45,5%'), 45.5);
  assert.equal(parseSmartNumber('-3.400,25'), -3400.25);
  assert.equal(parseSmartNumber('1,250.75', 'us'), 1250.75);
  assert.ok(Number.isNaN(parseSmartNumber('texto livre')));
});

test('isReservedDatasetKey blocks CrabCode keywords, JS keywords, and official lib keys', () => {
  assert.equal(isReservedDatasetKey('interface'), true);
  assert.equal(isReservedDatasetKey('defina'), true);
  assert.equal(isReservedDatasetKey('function'), true);
  assert.equal(isReservedDatasetKey('matematica'), true);
  assert.equal(isReservedDatasetKey('vendas_2025'), false);
});

test('parseCSV sanitizes reserved column names, normalizes ragged rows, and parses PT-BR formats', () => {
  const raw = '\uFEFF"Mês";function;defina;"Faturamento";Margem\nJan;10;20;"R$ 1.250,50";22,5%\nFev;15;25;"R$ 980,25"\n\nMar;20;30;"R$ 1.500,00";30,0%;extra_ignored\n';
  const parsed = parseCSV(raw);
  assert.equal(parsed.error, undefined);
  assert.equal(parsed.delimiter, ';');
  assert.equal(parsed.rows, 3);
  assert.equal(parsed.columns[0].name, 'Mes');
  assert.equal(parsed.columns[1].name, 'col_function');
  assert.equal(parsed.columns[2].name, 'col_defina');
  assert.equal(parsed.columns[3].type, 'number');
  assert.deepEqual(parsed.columns[3].values, [1250.5, 980.25, 1500]);
  assert.deepEqual(parsed.columns[4].values, [22.5, null, 30]);
  assert.ok(parsed.audit.raggedRows >= 2);
  assert.ok(parsed.audit.renamedHeaders.length >= 3);
  assert.ok(parsed.audit.emptyCells >= 1);

  const js = csvColumnsToJs({ columns: parsed.columns });
  const vals = new Function(`${js}\nreturn { Mes, col_function, col_defina, Faturamento, Margem };`)();
  assert.deepEqual(vals.Faturamento, [1250.5, 980.25, 1500]);
  assert.deepEqual(vals.col_function, [10, 15, 20]);
});

test('parseCSV handles standard comma CSV with quoted commas and headerless mode', () => {
  const raw = 'cidade,populacao\n"São Paulo, SP",12300000\n"Rio de Janeiro, RJ",6740000';
  const parsed = parseCSV(raw);
  assert.equal(parsed.delimiter, ',');
  assert.equal(parsed.columns[0].values[0], 'São Paulo, SP');
  assert.equal(parsed.columns[1].values[1], 6740000);

  const headerless = parseCSV('10;20\n30;40', { hasHeader: false });
  assert.equal(headerless.columns[0].name, 'col_1');
  assert.equal(headerless.columns[1].name, 'col_2');
  assert.deepEqual(headerless.columns[0].values, [10, 30]);
});

// ==================== 8. PIXEL ART STUDIO PURE MATH & 12 PRESETS ====================
test('Pixel Art pure math ops work accurately on frames', () => {
  const size = 8;
  const frame = createEmptyFrame(size);
  assert.equal(frame.length, 64);

  const RED = [255, 0, 0, 255];
  const GREEN = [0, 255, 0, 255];
  const BLUE = [0, 0, 255, 255];
  const BLACK = [0, 0, 0, 255];

  // Bresenham line horizontal
  const line = bresenhamLine(1, 2, 5, 2);
  assert.equal(line.length, 5);
  for (const [x, y] of line) frame[y * size + x] = RED;

  // Rect & circle pixels
  assert.equal(rectPixels(0, 0, 3, 3, true).length, 16);
  assert.equal(rectPixels(0, 0, 3, 3, false).length, 12);
  assert.ok(circlePixels(4, 4, 6, 4, false).length >= 8);

  // Replace color
  const replaced = replaceColor(frame, RED, GREEN);
  assert.deepEqual(replaced[2 * size + 1], GREEN);

  // Flood fill background
  const filled = floodFill(cloneFrame(replaced), size, 0, 0, BLUE);
  assert.deepEqual(filled[0], BLUE);
  assert.deepEqual(filled[2 * size + 1], GREEN);

  // Transforms: shift, flipH, flipV, rotate90, autoOutline, resize
  const shifted = shiftFrame(replaced, size, 1, 0);
  assert.deepEqual(shifted[2 * size + 2], GREEN);

  const flippedH = flipFrameH(replaced, size);
  assert.deepEqual(flippedH[2 * size + (size - 1 - 1)], GREEN);

  const flippedV = flipFrameV(replaced, size);
  assert.deepEqual(flippedV[(size - 1 - 2) * size + 1], GREEN);

  const rot = rotateFrame90(replaced, size, true);
  assert.equal(rot.length, 64);

  const outlined = autoOutline(replaced, size, BLACK);
  assert.deepEqual(outlined[1 * size + 1], BLACK);

  const resized = resizeFramePreserve(replaced, size, 16);
  assert.equal(resized.length, 256);

  // Color conversions
  assert.deepEqual(hexToRgba('#f97316'), [249, 115, 22, 255]);
  assert.equal(rgbaToHex([249, 115, 22, 255]), '#f97316');
});

test('All 12 curated pixel-art presets & 4 palettes have valid structure', () => {
  assert.equal(Object.keys(PIXEL_PALETTES).length, 4);
  assert.equal(PIXEL_PRESETS.length, 12);
  for (const p of PIXEL_PRESETS) {
    assert.ok(p.key && p.name, 'Preset missing key/name');
    assert.ok(p.size >= 8, `Preset ${p.key} invalid size`);
    assert.ok(Array.isArray(p.frames) && p.frames.length >= 1, `Preset ${p.key} missing frames`);
    for (const f of p.frames) {
      assert.equal(f.length, p.size * p.size, `Preset ${p.key} frame length mismatch`);
    }
  }
});

// ==================== 9. INTERFACE REACTIVITY, DYNAMIC RGB & SPRITE RADIUS ====================
test('Interface mode recomputes derived variables when stateful controls change while preserving stateful counters', async () => {
  const code = `importe interface
defina pontos como 0
defina intensidade como funcao() slider("Intensidade", 10, 100)
defina turbo como funcao() toggle("Modo Turbo (2.5x)")
defina ganho como rodar(execute 25 se turbo.valor senao 10)
defina energia como pontos + intensidade.valor * 2
defina ganhar como funcao() botao("Ganhar Pontos") altere pontos para pontos + 25 se turbo.valor senao pontos + 10
apresente "Pontos: " + pontos em texto ajuste centro m
apresente "Energia: " + energia em destaque ajuste centro g
apresente ganhar em botao ajuste centro m
apresente intensidade em slider ajuste centro m
apresente turbo em toggle ajuste centro m`;

  const shared = { __ccState: {}, __ccElements: {}, __ccSprites: {}, __ccLastEvent: null };

  // Pass 1: default state (pontos=0, intensidade=10, turbo=false => energia=20)
  const r1 = await compileAndRun(code, { extraGlobal: shared });
  assert.deepEqual(r1.compileErrors, []);
  assert.equal(r1.runtimeError, null);
  assert.equal(r1.interfaceMode, true);
  assert.equal(r1.output.find(i => String(i.value).startsWith('Energia:')).value, 'Energia: 20');

  // Pass 2: user toggles turbo ON and drags slider intensidade to 90 => energia must recompute to 180!
  shared.__ccElements.turbo.valor = true;
  shared.__ccElements.intensidade.valor = 90;
  const r2 = await compileAndRun(code, { extraGlobal: shared });
  assert.equal(r2.output.find(i => String(i.value).startsWith('Energia:')).value, 'Energia: 180');

  // Pass 3: user clicks "Ganhar Pontos" button (with turbo ON -> +25 pts => pontos=25, energia=205)
  shared.__ccLastEvent = { eventType: 'click', key: 'ganhar' };
  const r3 = await compileAndRun(code, { extraGlobal: shared });
  assert.equal(shared.__ccState.pontos, 25);
  assert.equal(r3.output.find(i => String(i.value).startsWith('Pontos:')).value, 'Pontos: 25');
  assert.equal(r3.output.find(i => String(i.value).startsWith('Energia:')).value, 'Energia: 205');
});

test('Dynamic RGB expressions and dynamic sprite curvo(radius) evaluate & clamp cleanly at runtime', async () => {
  const code = `importe interface
defina nivel como funcao() slider("Brilho", 0, 100)
defina tom como nivel.valor * 2
execute cor de fundo tom (tom + 10) 240
execute cor de texto 15 23 42 se nivel.valor >= 50 senao 241 245 249
defina orbe como sprite curvo(15 + nivel.valor / 2) com cor (150 + nivel.valor) 115 249
apresente nivel em slider ajuste centro m
apresente orbe em sprite ajuste centro m`;

  const shared = { __ccState: {}, __ccElements: { nivel: { valor: 60 } }, __ccSprites: {}, __ccLastEvent: null };
  const res = await compileAndRun(code, { extraGlobal: shared });
  assert.deepEqual(res.compileErrors, []);
  assert.equal(res.runtimeError, null);

  const bg = res.output.find(i => i.type === 'corDeFundo');
  assert.deepEqual({ r: bg.r, g: bg.g, b: bg.b }, { r: 120, g: 130, b: 240 });

  const fg = res.output.find(i => i.type === 'corDeTexto');
  assert.deepEqual({ r: fg.r, g: fg.g, b: fg.b }, { r: 15, g: 23, b: 42 });

  const spr = shared.__ccSprites.orbe;
  assert.equal(spr.kind, 'curvo');
  assert.equal(spr.radius, 45);
  assert.deepEqual(spr.color, { r: 210, g: 115, b: 249 });
});

test('Static RGB literal outside 0..255 still triggers E_RGB_RANGE error', () => {
  const code = `importe interface\nexecute cor de fundo 300 0 0`;
  const lexer = new Lexer(code, { registry: CrabLibRegistry, csvDatasets: [] });
  const { tokens } = lexer.tokenize();
  const parser = new Parser(tokens, new Set(lexer.declaredVars), new Set(lexer.declaredArrays), new Set(lexer.declaredObjects), { registry: CrabLibRegistry, csvDatasets: [] });
  const { errors } = parser.parse();
  assert.ok(errors.some(e => e.code === 'E_RGB_RANGE'), `Expected E_RGB_RANGE, got: ${JSON.stringify(errors)}`);
});

