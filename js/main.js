import { Lexer, Parser, Transpiler, CrabLibRegistry } from './language.js';
import {
  getCsvDatasets, getCsvInjectionCode, loadCode, saveCode,
  loadScripts, renderScripts, renderCsvList,
  openScriptModal, openSaveCurrentScriptModal, closeScriptModal, saveScript,
  copyScriptCode, confirmDeleteScript, importScriptFile,
  openCsvModal, closeCsvModal, saveCsvFromModal, copyCsvImport,
  deleteCsvDataset, suggestCsvKey, loadCsvFile,
  setActiveScriptId, getActiveScript, clearActiveScript, updateActiveScriptBadge,
  exportAllScriptsBackup,
} from './storage.js';
import {
  codeEditor, outputRenderer, errorManager, runtime,
  updateEditor, scheduleHighlight, syncScroll, goToLine, toggleErrorPanel, AutoComplete,
} from './editor.js';
import { loadTheme, toggleTheme } from './themes.js';
import { loadTutorial, copyCode } from './tutorial.js';
import { loadDocs } from './docs.js';
import {
  renderLibs, scrollToMeta,
  copyLibImport, copyLibExample,
  openLibModal, closeLibModal, saveLibFromModal, deleteCustomLibUI,
} from './libs.js';
import { InterfaceRenderer } from './interface.js';
import { initImagesTab, loadImages } from './images.js';
import { showToast, copyText } from './ui.js';
import { escapeHtml } from './utils.js';

// Active interface renderer (persisted across re-runs in interface mode)
let _iRenderer = null;
let _lastWasInterface = false;

// ==================== QUICK STARTER TEMPLATES ====================
const QUICK_TEMPLATES = [
  {
    id: 'stem_dashboard',
    title: 'Dashboard STEM + Gráfico',
    tag: 'Dados',
    desc: 'Vendas mensais com gráfico HiDPI, estatísticas completas e cálculos rápidos.',
    code: `importe biblioteca_geral
apresente "Dashboard Analítico — 1º Semestre" em destaque
defina vendas como objeto jan: 1240, fev: 1580, mar: 1490, abr: 1890, mai: 2150, jun: 2420
defina reta como tendencia de vendas
apresente vendas em grafico(reta)
apresente vendas em estatisticas
apresente "Fatorial de 6: " + rodar(execute fatorial(6)) em apresentação`,
  },
  {
    id: 'ml_regression',
    title: 'Machine Learning — Regressão Linear',
    tag: 'IA & Dados',
    desc: 'Ajuste de regressão linear, coeficiente R² e previsão de novos valores.',
    code: `importe machine_learning
apresente "Modelo Preditivo de Vendas" em destaque
defina investimento como [10, 20, 30, 40, 50, 60]
defina retorno como [32, 54, 71, 95, 118, 142]
apresente rodar(execute regressao_linear(investimento, retorno)) em dados
apresente "Retorno previsto para investimento = 80: " + rodar(execute prever_linear(investimento, retorno, 80)) em destaque`,
  },
  {
    id: 'financas_br',
    title: 'Simulador Financeiro BR',
    tag: 'Finanças',
    desc: 'Financiamento Price, rendimento líquido do CDI e formatação R$.',
    code: `importe financas_pessoais_br
importe formatacao_br
apresente "Simulador Financeiro Brasil" em destaque
defina parcela como rodar(execute parcela_price(200000, 0.0085, 180))
apresente "Parcela Price (R$ 200 mil / 15 anos): " + rodar(execute formatar_moeda(parcela)) em destaque
apresente "CDI líquido (R$ 25 mil / 2 anos): " + rodar(execute formatar_moeda(rodar(execute rendimento_cdi_liquido(25000, 10.75, 100, 730)))) em apresentação`,
  },
  {
    id: 'monte_carlo',
    title: 'Simulação Monte Carlo (d20)',
    tag: 'Estatística',
    desc: '200 lançamentos aleatórios com resumo estatístico e percentis.',
    code: `apresente "Monte Carlo — 200 Lançamentos de d20" em destaque
defina amostras como rodar(execute aleatorio entre 1 e 20 com 200 amostras)
apresente amostras em estatisticas
apresente "Mediana (P50): " + rodar(execute percentil de amostras, 50) em apresentação
apresente "Percentil 90: " + rodar(execute percentil de amostras, 90) em apresentação`,
  },
  {
    id: 'bioinfo',
    title: 'Bioinformática — DNA para RNA',
    tag: 'Ciências',
    desc: 'Transcrição de fita de DNA, conteúdo GC (%) e temperatura de melting.',
    code: `importe bioinformatica
defina dna como "ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG"
apresente "Análise Molecular de DNA" em destaque
apresente "RNA mensageiro: " + rodar(execute transcrever_dna_rna(dna)) em apresentação
apresente "Conteúdo GC: " + rodar(execute conteudo_gc(dna)) + "%" em apresentação
apresente "Temperatura de melting: " + rodar(execute temperatura_melting(dna)) + " °C" em apresentação`,
  },
  {
    id: 'interactive_app',
    title: 'App Interativo (Botão + Slider + Toggle)',
    tag: 'Interface',
    desc: 'Interface reativa com estado persistente, botões de ação e controles visuais.',
    code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina pontos como 0
defina intensidade como funcao() slider("Intensidade", 0, 100)
defina turbo como funcao() toggle("Modo Turbo")
defina ganhar como funcao() botao("+10 Pontos") altere pontos para pontos + 10
defina zerar como funcao() botao("Resetar") altere pontos para 0
apresente "Painel Interativo CrabCode" em destaque ajuste centro g
apresente "Pontuação: " + pontos em apresentacao ajuste centro g
apresente ganhar em botao ajuste centro m
apresente zerar em botao ajuste centro p
apresente intensidade em slider ajuste centro m
apresente turbo em toggle ajuste centro m
apresente "Intensidade atual: " + intensidade.valor + "%" em texto ajuste centro p`,
  },
];

// ==================== INTERFACE STATE RESET HELPER ====================
function resetRuntimeGlobals() {
  window.__ccState = {};
  window.__ccElements = {};
  window.__ccSprites = {};
  window.__ccTecla = { valor: '', atual: '' };
  window.__ccLastEvent = null;
}

// ==================== RUN CODE ====================
async function runCode(isEventRerun = false) {
  const source = codeEditor.value;
  const t0 = performance.now();

  if (!isEventRerun) {
    resetRuntimeGlobals();
    const btn = document.getElementById('btn-run');
    if (btn) {
      btn.classList.add('flash');
      setTimeout(() => btn.classList.remove('flash'), 350);
    }
  }

  const csvDatasets = getCsvDatasets();
  const savedSprites = window.__ccImages || {};
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

  const allCompileErrors = [...lexErrors, ...parseErrors, ...transpileErrors];
  errorManager.setErrors(allCompileErrors, { autoExpand: !isEventRerun });

  const csvInjection = getCsvInjectionCode(source);
  const result = await runtime.runInSandbox(csvInjection + jsCode);
  if (result.superseded) return;

  const { output, error } = result;
  const elapsedMs = performance.now() - t0;
  const outputBody = document.getElementById('output-body');
  const resetIfaceBtn = document.getElementById('btn-reset-iface');
  const modeBadge = document.getElementById('output-mode-badge');

  if (error) {
    errorManager.setRuntimeError(error);
  } else {
    errorManager.clearRuntimeErrors();
  }

  if (transpiler._interfaceMode) {
    _lastWasInterface = true;
    if (resetIfaceBtn) resetIfaceBtn.style.display = '';
    if (modeBadge) {
      modeBadge.textContent = 'Interface';
      modeBadge.className = 'output-mode-tag mode-iface';
    }
    const canvas = InterfaceRenderer.show(outputBody);
    if (canvas) {
      if (!_iRenderer || _iRenderer._container !== canvas) {
        if (_iRenderer) _iRenderer.teardown();
        _iRenderer = new InterfaceRenderer(canvas);
      }
      const bgItem = [...output].reverse().find(o => o.type === 'corDeFundo');
      const bgColor = bgItem ? `rgb(${bgItem.r},${bgItem.g},${bgItem.b})` : null;
      const txtItem = [...output].reverse().find(o => o.type === 'corDeTexto');
      const textColor = txtItem ? `rgb(${txtItem.r},${txtItem.g},${txtItem.b})` : null;
      _iRenderer.render(output, bgColor, textColor);
    }
    // Clear one-shot keyboard/event triggers after run completes
    if (window.__ccTecla) window.__ccTecla.atual = '';
    window.__ccLastEvent = null;

    if (error) {
      showToast('Erro de execução: ' + error, 'error', 4000);
    }
  } else {
    _lastWasInterface = false;
    if (resetIfaceBtn) resetIfaceBtn.style.display = 'none';
    if (modeBadge) {
      modeBadge.textContent = 'STEM';
      modeBadge.className = 'output-mode-tag mode-stem';
    }
    if (_iRenderer) { _iRenderer.teardown(); _iRenderer = null; }
    InterfaceRenderer.hide(outputBody);
    outputRenderer.render(output, { elapsedMs });
    if (error) outputRenderer.renderError(error);
  }

  if (!document.getElementById('editor-panel').classList.contains('active')) {
    switchTab('editor');
  }
}

function resetInterfaceState() {
  resetRuntimeGlobals();
  showToast('Estado da interface reiniciado.', 'info', 1600);
  runCode(false);
}

// ==================== CLEAR / COPY OUTPUT ====================
function clearOutput() {
  if (_iRenderer) {
    _iRenderer.teardown();
    _iRenderer = null;
  }
  const outputBody = document.getElementById('output-body');
  if (outputBody) InterfaceRenderer.hide(outputBody);
  outputRenderer.clear();
  const resetIfaceBtn = document.getElementById('btn-reset-iface');
  if (resetIfaceBtn) resetIfaceBtn.style.display = 'none';
}

async function copyOutput() {
  const txt = outputRenderer.getPlainText();
  if (!txt) {
    showToast('Não há texto de saída para copiar.', 'info');
    return;
  }
  await copyText(txt);
  showToast('Saída copiada para a área de transferência!', 'success', 1600);
}

// ==================== TRY CODE IN EDITOR ====================
function tryInEditor(code, autoRun = true, { keepActiveScript = false } = {}) {
  if (typeof code !== 'string') return;
  resetRuntimeGlobals();

  if (!keepActiveScript) {
    clearActiveScript();
  }

  codeEditor.value = code;
  updateEditor();
  saveCode();
  updateActiveScriptBadge();
  switchTab('editor');
  if (autoRun) runCode(false);
}

// ==================== TAB SWITCHING ====================
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => {
    const isTarget = t.dataset.tab === tab;
    t.classList.toggle('active', isTarget);
    t.setAttribute('aria-selected', String(isTarget));
  });

  document.getElementById('editor-panel')?.classList.toggle('active', tab === 'editor');
  document.getElementById('tutorial-panel')?.classList.toggle('active', tab === 'tutorial');
  document.getElementById('docs-panel')?.classList.toggle('active', tab === 'docs');
  document.getElementById('scripts-panel')?.classList.toggle('active', tab === 'scripts');
  document.getElementById('libs-panel')?.classList.toggle('active', tab === 'libs');
  document.getElementById('dados-panel')?.classList.toggle('active', tab === 'dados');
  document.getElementById('imagens-panel')?.classList.toggle('active', tab === 'imagens');

  const isEditor = tab === 'editor';
  const resizeHandle = document.getElementById('resize-handle');
  const outputPanel = document.getElementById('output-panel');
  if (resizeHandle) resizeHandle.style.display = isEditor ? '' : 'none';
  if (outputPanel) outputPanel.style.display = isEditor ? '' : 'none';

  if (tab === 'scripts') renderScripts();
  if (tab === 'libs') renderLibs();
  if (tab === 'dados') renderCsvList();
}

// ==================== RESIZE HANDLE (MOUSE + TOUCH) ====================
function initResize() {
  const handle = document.getElementById('resize-handle');
  const editorPanel = document.getElementById('editor-panel');
  const outputPanel = document.getElementById('output-panel');
  const main = document.getElementById('main');
  if (!handle || !editorPanel || !outputPanel || !main) return;

  let isResizing = false;

  const applyClientX = (clientX) => {
    const rect = main.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    if (pct > 24 && pct < 78) {
      editorPanel.style.flex = `0 0 ${pct}%`;
      outputPanel.style.width = `${100 - pct}%`;
      outputPanel.style.flex = 'none';
    }
  };

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    handle.classList.add('active');
    document.body.classList.add('is-resizing');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    applyClientX(e.clientX);
  });

  document.addEventListener('mouseup', () => {
    if (!isResizing) return;
    isResizing = false;
    handle.classList.remove('active');
    document.body.classList.remove('is-resizing');
  });

  handle.addEventListener('touchstart', (e) => {
    isResizing = true;
    handle.classList.add('active');
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!isResizing || !e.touches[0]) return;
    applyClientX(e.touches[0].clientX);
  }, { passive: true });

  document.addEventListener('touchend', () => {
    isResizing = false;
    handle.classList.remove('active');
  });
}

// ==================== TEMPLATES MODAL (Ctrl+K) ====================
function openTemplatesModal() {
  const modal = document.getElementById('templates-modal');
  const grid = document.getElementById('templates-grid');
  if (!modal || !grid) return;

  grid.innerHTML = '';
  for (const tpl of QUICK_TEMPLATES) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'template-card';
    card.innerHTML = `
      <div class="template-card-top">
        <strong>${escapeHtml(tpl.title)}</strong>
        <span class="template-tag">${escapeHtml(tpl.tag)}</span>
      </div>
      <p>${escapeHtml(tpl.desc)}</p>
    `;
    card.addEventListener('click', () => {
      closeTemplatesModal();
      tryInEditor(tpl.code, true);
      showToast(`Modelo "${tpl.title}" carregado!`, 'success', 1800);
    });
    grid.appendChild(card);
  }

  modal.style.display = 'flex';
}

function closeTemplatesModal() {
  const modal = document.getElementById('templates-modal');
  if (modal) modal.style.display = 'none';
}

// ==================== KEYBOARD SHORTCUTS ====================
function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode(false);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      const active = getActiveScript();
      saveCode({ syncActiveScript: true });
      if (active) {
        showToast(`Script "${active.title}" atualizado!`, 'success', 1500);
      } else {
        showToast('Rascunho salvo no navegador.', 'success', 1400);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      clearOutput();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const modal = document.getElementById('templates-modal');
      if (modal && modal.style.display === 'flex') closeTemplatesModal();
      else openTemplatesModal();
    } else if (e.key === 'Escape') {
      if (isPresentationMode) exitPresentation();
      closeTemplatesModal();
      closeScriptModal();
      closeLibModal();
      closeCsvModal();
      const imgModal = document.getElementById('image-modal');
      if (imgModal && imgModal.style.display !== 'none') {
        document.getElementById('close-image-modal')?.click();
      }
    }
  });

  codeEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (AutoComplete && AutoComplete.active) return;
      e.preventDefault();
      const start = codeEditor.selectionStart;
      const end = codeEditor.selectionEnd;
      codeEditor.value = codeEditor.value.substring(0, start) + '  ' + codeEditor.value.substring(end);
      codeEditor.selectionStart = codeEditor.selectionEnd = start + 2;
      updateEditor();
    }
  });
}

// ==================== EXPORT AS PNG (100% OFFLINE VANILLA CANVAS) ====================
function exportPNG() {
  try {
    const source = codeEditor.value || '';
    const lines = source.split('\n');
    const cs = getComputedStyle(document.body);
    const getVar = (name, fb) => cs.getPropertyValue(name).trim() || fb;

    const bgPrimary = getVar('--bg-primary', '#0b0e14');
    const bgEditor = getVar('--bg-editor', '#111520');
    const bgHeader = getVar('--bg-header', '#161b28');
    const borderCol = getVar('--border', '#252c3f');
    const textMuted = getVar('--text-line-num', '#5b647d');
    const textDefault = getVar('--text-primary', '#e6eaf4');

    const colorMap = {
      laranja: getVar('--color-laranja', '#f97316'),
      roxo: getVar('--color-roxo', '#c084fc'),
      azul: getVar('--color-azul', '#60a5fa'),
      branco: textDefault,
      vermelho: getVar('--color-vermelho', '#fb7185'),
      verde: getVar('--color-verde', '#4ade80'),
      amarelo: getVar('--color-amarelo', '#facc15'),
      numero: getVar('--color-numero', '#fbbf24'),
      operador: getVar('--color-operador', '#2dd4bf'),
      comentario: textMuted,
      bracket: getVar('--color-operador', '#2dd4bf'),
    };

    const lexer = new Lexer(source, { registry: CrabLibRegistry, csvDatasets: getCsvDatasets() });
    const { tokens } = lexer.tokenize();
    const tokensByLine = {};
    for (const tok of tokens) {
      if (tok.type === 'NEWLINE') continue;
      if (!tokensByLine[tok.line]) tokensByLine[tok.line] = [];
      tokensByLine[tok.line].push(tok);
    }

    const scale = 2;
    const fontSize = 14;
    const lineHeight = 23;
    const padOuter = 28;
    const cardPadX = 22;
    const headerH = 44;
    const gutterW = 46;
    const maxLineChars = Math.max(46, ...lines.map(l => l.length));
    const charW = 8.45;
    const cardW = Math.min(1120, Math.max(640, gutterW + cardPadX * 2 + Math.ceil(maxLineChars * charW) + 20));
    const cardH = headerH + lines.length * lineHeight + 36;
    const W = cardW + padOuter * 2;
    const H = cardH + padOuter * 2;

    const canvas = document.createElement('canvas');
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = bgPrimary;
    ctx.fillRect(0, 0, W, H);

    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    roundRect(padOuter, padOuter, cardW, cardH, 12);
    ctx.fillStyle = bgEditor;
    ctx.fill();
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    roundRect(padOuter, padOuter, cardW, cardH, 12);
    ctx.clip();
    ctx.fillStyle = bgHeader;
    ctx.fillRect(padOuter, padOuter, cardW, headerH);
    ctx.strokeStyle = borderCol;
    ctx.beginPath();
    ctx.moveTo(padOuter, padOuter + headerH);
    ctx.lineTo(padOuter + cardW, padOuter + headerH);
    ctx.stroke();

    ctx.font = '600 13px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = colorMap.laranja;
    ctx.fillText('Crab', padOuter + 18, padOuter + 27);
    const crabW = ctx.measureText('Crab').width;
    ctx.fillStyle = textDefault;
    ctx.fillText('Code IDE', padOuter + 18 + crabW, padOuter + 27);

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = textMuted;
    const stamp = new Date().toLocaleDateString('pt-BR');
    ctx.textAlign = 'right';
    ctx.fillText(`${lines.length} linhas · ${stamp}`, padOuter + cardW - 18, padOuter + 26);
    ctx.textAlign = 'left';

    const codeFont = `${fontSize}px "JetBrains Mono", Consolas, monospace`;
    const codeBoldFont = `600 ${fontSize}px "JetBrains Mono", Consolas, monospace`;

    lines.forEach((rawLine, idx) => {
      const lineNum = idx + 1;
      const y = padOuter + headerH + 26 + idx * lineHeight;

      ctx.font = `12px "JetBrains Mono", Consolas, monospace`;
      ctx.fillStyle = textMuted;
      ctx.textAlign = 'right';
      ctx.fillText(String(lineNum), padOuter + gutterW - 6, y);
      ctx.textAlign = 'left';

      const lineTokens = tokensByLine[lineNum] || [];
      let curX = padOuter + gutterW + 14;
      let cursor = 0;

      const drawSeg = (txt, color, bold = false) => {
        if (!txt) return;
        ctx.font = bold ? codeBoldFont : codeFont;
        ctx.fillStyle = color;
        ctx.fillText(txt, curX, y);
        curX += ctx.measureText(txt).width;
      };

      for (const tok of lineTokens) {
        const start = Math.max(cursor, tok.col - 1);
        if (start > cursor) {
          drawSeg(rawLine.slice(cursor, start), textDefault);
        }
        const tokLen = tok.type === 'STRING' ? tok.value.length + 2 : tok.value.length;
        const slice = rawLine.slice(start, start + tokLen);
        const col = colorMap[tok.module] || textDefault;
        const bold = tok.module === 'laranja' || tok.module === 'vermelho';
        drawSeg(slice, col, bold);
        cursor = start + tokLen;
      }
      if (cursor < rawLine.length) {
        const rem = rawLine.slice(cursor);
        const isComment = rem.trimStart().startsWith('#');
        drawSeg(rem, isComment ? textMuted : textDefault);
      }
    });

    ctx.restore();

    const link = document.createElement('a');
    link.download = 'crabcode-' + new Date().toISOString().slice(0, 10) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Imagem PNG do código baixada!', 'success');
  } catch (err) {
    console.error('Export PNG error:', err);
    showToast('Erro ao exportar PNG.', 'error');
  }
}

// ==================== PRESENTATION MODE ====================
let isPresentationMode = false;

function togglePresentation() {
  if (isPresentationMode) exitPresentation();
  else enterPresentation();
}

function enterPresentation() {
  runCode(false).then(() => {
    document.body.classList.add('presentation');
    isPresentationMode = true;
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  });
}

function exitPresentation() {
  document.body.classList.remove('presentation');
  isPresentationMode = false;
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && isPresentationMode) exitPresentation();
});

// ==================== EXPORT AS PDF (OFFLINE PRINT-TO-PDF) ====================
function exportPDF() {
  let printRoot = document.getElementById('print-view');
  if (!printRoot) {
    printRoot = document.createElement('div');
    printRoot.id = 'print-view';
    document.body.appendChild(printRoot);
  }

  const stemOutput = document.getElementById('stem-output');
  const outputClone = stemOutput ? stemOutput.cloneNode(true) : document.createElement('div');

  const origCanvases = stemOutput ? stemOutput.querySelectorAll('canvas') : [];
  const cloneCanvases = outputClone.querySelectorAll('canvas');
  origCanvases.forEach((orig, idx) => {
    if (cloneCanvases[idx]) {
      const img = document.createElement('img');
      img.src = orig.toDataURL('image/png');
      img.style.maxWidth = '100%';
      cloneCanvases[idx].replaceWith(img);
    }
  });

  printRoot.innerHTML = `
    <div class="print-header">
      <strong>CrabCode IDE</strong>
      <span>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}</span>
    </div>
    <h2>Código</h2>
    <pre class="print-code">${escapeHtml(codeEditor.value || '')}</pre>
    <h2>Saída</h2>
    <div class="print-output">${outputClone.innerHTML || '<p>Sem saída executada.</p>'}</div>
  `;

  window.print();
}

// ==================== EXPORT AS HTML (STEM + INTERFACE) ====================
function exportHTML() {
  const date = new Date().toISOString().slice(0, 10);
  const isDark = document.body.classList.contains('dark');
  const cs = getComputedStyle(document.body);
  const resolveVar = (name, fb) => cs.getPropertyValue(name).trim() || fb;

  const bgMain = resolveVar('--bg-output', isDark ? '#0f131d' : '#f6f7fb');
  const bgEditor = resolveVar('--bg-editor', isDark ? '#141926' : '#ffffff');
  const borderCol = resolveVar('--border', isDark ? '#252c3f' : '#dde2ec');
  const textPrimary = resolveVar('--text-primary', isDark ? '#e6eaf4' : '#181c29');
  const colorLaranja = resolveVar('--color-laranja', '#f97316');

  const ifaceCanvas = document.getElementById('interface-canvas');
  let outputHTML = '';
  if (_lastWasInterface && ifaceCanvas && ifaceCanvas.style.display !== 'none') {
    outputHTML = `<div style="position:relative;min-height:420px;border-radius:10px;overflow:hidden;border:1px solid ${borderCol};">${ifaceCanvas.outerHTML}</div>`;
  } else {
    const stemEl = document.getElementById('stem-output');
    if (stemEl) {
      const clone = stemEl.cloneNode(true);
      const origCanvases = stemEl.querySelectorAll('canvas');
      const cloneCanvases = clone.querySelectorAll('canvas');
      origCanvases.forEach((orig, idx) => {
        if (cloneCanvases[idx]) {
          const img = document.createElement('img');
          img.src = orig.toDataURL('image/png');
          img.style.maxWidth = '100%';
          cloneCanvases[idx].replaceWith(img);
        }
      });
      outputHTML = clone.innerHTML;
    } else {
      outputHTML = '<p>Sem saída</p>';
    }
  }

  const codeText = codeEditor ? codeEditor.value : '';
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CrabCode Export – ${date}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:${bgMain};color:${textPrimary};padding:32px;line-height:1.55;}
  .wrap{max-width:920px;margin:0 auto;}
  .export-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:14px;border-bottom:1px solid ${borderCol};}
  .export-header strong{font-size:20px;color:${colorLaranja};}
  .export-date{font-size:12px;opacity:.65;}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.65;margin:18px 0 8px;}
  .code-block{background:${bgEditor};border:1px solid ${borderCol};padding:16px;border-radius:10px;font-family:'JetBrains Mono',Consolas,monospace;font-size:13px;white-space:pre-wrap;word-break:break-word;line-height:1.6;}
  .output-section{background:${bgEditor};border:1px solid ${borderCol};padding:18px;border-radius:10px;}
  .output-item{margin-bottom:12px;}
  .output-execute{font-family:monospace;font-size:13px;padding:8px 12px;background:${bgMain};border-radius:6px;}
  .output-destaque{font-size:19px;font-weight:700;padding:12px 16px;border-left:3px solid ${colorLaranja};background:${bgMain};border-radius:6px;}
  .output-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;}
  .stat-cell{padding:10px 12px;background:${bgMain};border:1px solid ${borderCol};border-radius:8px;display:flex;flex-direction:column;gap:4px;}
  .apresentacao-label{font-size:11px;opacity:.65;}
  .apresentacao-value{font-size:16px;font-weight:700;font-family:monospace;}
  table{border-collapse:collapse;width:100%;font-size:13px;font-family:monospace;}
  th,td{padding:8px 10px;text-align:left;border-bottom:1px solid ${borderCol};}
</style>
</head>
<body>
  <div class="wrap">
    <div class="export-header">
      <strong>CrabCode IDE</strong>
      <span class="export-date">Exportado em ${new Date().toLocaleDateString('pt-BR')}</span>
    </div>
    <h2>Código</h2>
    <div class="code-block">${escapeHtml(codeText)}</div>
    <h2>Saída</h2>
    <div class="output-section">${outputHTML}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.download = 'crabcode-export-' + date + '.html';
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  showToast('Arquivo HTML exportado!', 'success');
}

// ==================== INIT ====================
function init() {
  loadTheme();
  loadCode();
  updateEditor();
  updateActiveScriptBadge();
  loadTutorial();
  loadDocs();
  initResize();
  initShortcuts();
  AutoComplete.init();
  initImagesTab();

  try {
    window.__ccImages = loadImages();
  } catch {
    window.__ccImages = {};
  }

  codeEditor.addEventListener('input', () => {
    updateEditor();
    updateActiveScriptBadge();
  });
  codeEditor.addEventListener('scroll', syncScroll);

  // Header & Output controls
  document.getElementById('btn-run')?.addEventListener('click', () => runCode(false));
  document.getElementById('btn-clear')?.addEventListener('click', clearOutput);
  document.getElementById('btn-clear-output')?.addEventListener('click', clearOutput);
  document.getElementById('btn-copy-output')?.addEventListener('click', copyOutput);
  document.getElementById('btn-reset-iface')?.addEventListener('click', resetInterfaceState);
  document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
  document.getElementById('btn-templates')?.addEventListener('click', openTemplatesModal);
  document.getElementById('close-templates-modal')?.addEventListener('click', closeTemplatesModal);
  document.getElementById('btn-export-png')?.addEventListener('click', exportPNG);
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
  document.getElementById('btn-export-html')?.addEventListener('click', exportHTML);
  document.getElementById('btn-presentation')?.addEventListener('click', togglePresentation);
  document.getElementById('btn-save-as-script')?.addEventListener('click', openSaveCurrentScriptModal);
  document.getElementById('error-toggle')?.addEventListener('click', toggleErrorPanel);

  // Interface mode re-run on interactive element events (preserves __ccState!)
  window.addEventListener('crab-rerun', () => { runCode(true); });
  window.addEventListener('crab-highlight-refresh', () => { scheduleHighlight(); });

  // Tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Scripts panel & modal
  document.getElementById('btn-new-script')?.addEventListener('click', () => openScriptModal());
  document.getElementById('btn-save-current-script')?.addEventListener('click', openSaveCurrentScriptModal);
  document.getElementById('close-script-modal')?.addEventListener('click', closeScriptModal);
  document.getElementById('save-script-btn')?.addEventListener('click', saveScript);
  document.getElementById('scripts-search')?.addEventListener('input', renderScripts);
  document.getElementById('scripts-sort')?.addEventListener('change', renderScripts);
  document.getElementById('btn-backup-scripts')?.addEventListener('click', exportAllScriptsBackup);

  const scriptFileInput = document.getElementById('script-file-input');
  document.getElementById('btn-import-script')?.addEventListener('click', () => scriptFileInput?.click());
  scriptFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) importScriptFile(file);
    e.target.value = '';
  });

  // CSV / Dados panel & modal + drag-and-drop file upload
  document.getElementById('btn-new-csv')?.addEventListener('click', () => openCsvModal());
  document.getElementById('close-csv-modal')?.addEventListener('click', closeCsvModal);
  document.getElementById('save-csv-btn')?.addEventListener('click', saveCsvFromModal);
  document.getElementById('csv-suggest-key')?.addEventListener('click', suggestCsvKey);

  const csvDropzone = document.getElementById('csv-dropzone');
  const csvFileInput = document.getElementById('csv-file-input');
  csvDropzone?.addEventListener('click', () => csvFileInput?.click());
  csvDropzone?.addEventListener('dragover', (e) => { e.preventDefault(); csvDropzone.classList.add('dragover'); });
  csvDropzone?.addEventListener('dragleave', () => csvDropzone.classList.remove('dragover'));
  csvDropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    csvDropzone.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file) loadCsvFile(file);
  });
  csvFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) loadCsvFile(file);
    e.target.value = '';
  });

  // Libs panel & modal
  document.getElementById('btn-new-lib')?.addEventListener('click', () => openLibModal());
  document.getElementById('close-lib-modal')?.addEventListener('click', closeLibModal);
  document.getElementById('save-lib-btn')?.addEventListener('click', saveLibFromModal);
  document.getElementById('libs-search')?.addEventListener('input', renderLibs);
  document.getElementById('btn-scroll-meta')?.addEventListener('click', scrollToMeta);

  // Presentation exit button
  document.getElementById('btn-presentation-exit')?.addEventListener('click', exitPresentation);

  // Close modals on backdrop click
  ['script-modal', 'lib-modal', 'csv-modal', 'templates-modal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
    });
  });

  scheduleHighlight();
  if (codeEditor.value.trim()) {
    setTimeout(() => runCode(false), 90);
  }
}

// ==================== GLOBAL HANDLERS ====================
window.copyCode = copyCode;
window.copyLibImport = copyLibImport;
window.copyLibExample = copyLibExample;
window.deleteCustomLibUI = deleteCustomLibUI;
window.copyScriptCode = copyScriptCode;
window.confirmDeleteScript = confirmDeleteScript;
window.copyCsvImport = copyCsvImport;
window.openCsvModal = openCsvModal;
window.deleteCsvDataset = deleteCsvDataset;
window.tryInEditor = tryInEditor;
window.goToLine = goToLine;
window.loadIntoEditor = function (id, autoRun = false) {
  const s = loadScripts().find(x => x.id === id);
  if (!s) return;
  setActiveScriptId(s.id);
  tryInEditor(s.code, autoRun, { keepActiveScript: true });
  showToast(`Script "${s.title}" aberto no editor (Ctrl+S atualiza).`, 'info', 1800);
};

init();
