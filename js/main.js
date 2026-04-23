import { Lexer, Parser, Transpiler, CrabLibRegistry } from './language.js';
import {
  getCsvDatasets, getCsvInjectionCode, loadCode, saveCode,
  loadScripts, renderScripts, renderCsvList,
  openScriptModal, closeScriptModal, saveScript,
  copyScriptCode, confirmDeleteScript,
  openCsvModal, closeCsvModal, saveCsvFromModal, copyCsvImport, deleteCsvDataset, suggestCsvKey,
} from './storage.js';
import {
  codeEditor, outputRenderer, errorManager, runtime,
  updateEditor, scheduleHighlight, syncScroll, goToLine, toggleErrorPanel, AutoComplete,
} from './editor.js';
import { loadTheme, toggleTheme } from './themes.js';
import { loadTutorial, loadDocs, copyCode } from './tutorial.js';
import {
  renderLibs, scrollToMeta,
  copyLibImport, copyLibExample,
  openLibModal, closeLibModal, saveLibFromModal, deleteCustomLibUI,
} from './libs.js';
import { InterfaceRenderer } from './interface.js';
import { initImagesTab, loadImages } from './images.js';

// Active interface renderer (persisted across re-runs in interface mode)
let _iRenderer = null;

// ==================== RUN CODE ====================
async function runCode() {
  const source = codeEditor.value;

  // Flash button
  const btn = document.getElementById('btn-run');
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 400);

  // Lex
  const csvDatasets = getCsvDatasets();
  const lexer = new Lexer(source, { registry: CrabLibRegistry, csvDatasets });
  const { tokens, errors: lexErrors } = lexer.tokenize();

  // Parse
  const parser = new Parser(tokens, new Set(lexer.declaredVars), new Set(lexer.declaredArrays), new Set(lexer.declaredObjects), { registry: CrabLibRegistry, csvDatasets });
  const { ast, errors: parseErrors } = parser.parse();

  // Update errors
  const allParseErrors = [...lexErrors, ...parseErrors];
  errorManager.setErrors(allParseErrors);

  // Transpile
  const transpiler = new Transpiler(ast, new Set(lexer.declaredVars), new Set(lexer.declaredArrays), new Set(lexer.declaredObjects), { registry: CrabLibRegistry, csvDatasets });
  const { code: jsCode, errors: transpileErrors } = transpiler.transpile();

  if (transpileErrors.length > 0) {
    errorManager.setErrors([...allParseErrors, ...transpileErrors]);
  }

  // Run in sandbox (async with timeout) — prepend CSV dataset variables
  const csvInjection = getCsvInjectionCode();
  const { output, error } = await runtime.runInSandbox(csvInjection + jsCode);

  const outputBody = document.getElementById('output-body');

  if (transpiler._interfaceMode) {
    // Interface mode: render into the interface-canvas
    const canvas = InterfaceRenderer.show(outputBody);
    if (canvas) {
      if (!_iRenderer || _iRenderer._container !== canvas) {
        if (_iRenderer) _iRenderer.teardown();
        _iRenderer = new InterfaceRenderer(canvas);
      }
      // Extract background color from output if present
      const bgItem = output.find(o => o.type === 'corDeFundo');
      const bgColor = bgItem ? `rgb(${bgItem.r},${bgItem.g},${bgItem.b})` : null;
      _iRenderer.render(output, bgColor);
    }
    if (error) outputRenderer.renderError(error);
  } else {
    // STEM mode: restore normal output, hide interface canvas
    if (_iRenderer) { _iRenderer.teardown(); _iRenderer = null; }
    InterfaceRenderer.hide(outputBody);
    if (error) {
      outputRenderer.render(output);
      outputRenderer.renderError(error);
    } else {
      outputRenderer.render(output);
    }
  }

  // Switch to editor tab if not already
  if (!document.getElementById('editor-panel').classList.contains('active')) {
    switchTab('editor');
  }
}

// ==================== CLEAR OUTPUT ====================
function clearOutput() {
  outputRenderer.clear();
}

// ==================== TAB SWITCHING ====================
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');

  document.getElementById('editor-panel').classList.toggle('active', tab === 'editor');
  document.getElementById('tutorial-panel').classList.toggle('active', tab === 'tutorial');
  document.getElementById('docs-panel').classList.toggle('active', tab === 'docs');
  document.getElementById('scripts-panel').classList.toggle('active', tab === 'scripts');
  document.getElementById('libs-panel').classList.toggle('active', tab === 'libs');
  document.getElementById('dados-panel').style.display = tab === 'dados' ? '' : 'none';
  document.getElementById('imagens-panel').style.display = tab === 'imagens' ? '' : 'none';

  // Show/hide resize handle and output panel based on tab
  const isEditor = tab === 'editor';
  document.getElementById('resize-handle').style.display = isEditor ? '' : 'none';
  document.getElementById('output-panel').style.display = isEditor ? '' : 'none';

  if (tab === 'scripts') renderScripts();
  if (tab === 'libs') renderLibs();
  if (tab === 'dados') renderCsvList();
}

// ==================== RESIZE HANDLE ====================
function initResize() {
  const handle = document.getElementById('resize-handle');
  const editorPanel = document.getElementById('editor-panel');
  const outputPanel = document.getElementById('output-panel');
  const main = document.getElementById('main');
  let isResizing = false;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    handle.classList.add('active');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const rect = main.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    if (pct > 20 && pct < 80) {
      editorPanel.style.flex = `0 0 ${pct}%`;
      outputPanel.style.width = `${100 - pct}%`;
      outputPanel.style.flex = 'none';
    }
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
    handle.classList.remove('active');
  });
}

// ==================== KEYBOARD SHORTCUTS ====================
function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter = Run
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
    // Ctrl+S = Save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveCode();
    }
    // Ctrl+L = Clear output
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      clearOutput();
    }
  });

  // Tab key in editor
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

// ==================== EXPORT AS PNG ====================
function exportPNG() {
  if (typeof html2canvas === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => _doExportPNG();
    script.onerror = () => alert('Erro ao carregar html2canvas. Verifique sua conexão com a internet.');
    document.head.appendChild(script);
  } else {
    _doExportPNG();
  }
}

function _doExportPNG() {
  const editorContainer = document.querySelector('.editor-container');
  if (!editorContainer) return;

  const clone = editorContainer.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = editorContainer.offsetWidth + 'px';
  clone.style.height = 'auto';
  clone.style.overflow = 'visible';
  clone.style.maxHeight = 'none';

  const textarea = clone.querySelector('textarea');
  if (textarea) {
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.style.overflow = 'visible';
  }
  const overlay = clone.querySelector('.highlight-overlay');
  if (overlay) {
    overlay.style.height = 'auto';
    overlay.style.overflow = 'visible';
  }

  document.body.appendChild(clone);

  html2canvas(clone, {
    scale: 2,
    backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-main').trim() || '#1e1e2e',
    useCORS: true,
    logging: false,
  }).then(canvas => {
    document.body.removeChild(clone);
    const link = document.createElement('a');
    link.download = 'crabcode-' + new Date().toISOString().slice(0, 10) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    document.body.removeChild(clone);
    console.error('Export PNG error:', err);
    alert('Erro ao exportar como PNG.');
  });
}

// ==================== PRESENTATION MODE ====================
let isPresentationMode = false;

function togglePresentation() {
  if (isPresentationMode) {
    exitPresentation();
  } else {
    enterPresentation();
  }
}

function enterPresentation() {
  runCode().then(() => {
    document.body.classList.add('presentation');
    isPresentationMode = true;

    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  });
}

function exitPresentation() {
  document.body.classList.remove('presentation');
  isPresentationMode = false;

  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else if (document.webkitFullscreenElement) {
    document.webkitExitFullscreen();
  }
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && isPresentationMode) {
    exitPresentation();
  }
});

// ==================== EXPORT AS PDF ====================
function exportPDF() {
  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const deps = [];
  if (typeof html2canvas === 'undefined') {
    deps.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
  }
  if (typeof window.jspdf === 'undefined') {
    deps.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
  }

  Promise.all(deps)
    .then(() => _doExportPDF())
    .catch(() => alert('Erro ao carregar dependências do PDF. Verifique sua conexão.'));
}

async function _doExportPDF() {
  const { jsPDF } = window.jspdf;

  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;padding:24px;background:' +
    (getComputedStyle(document.body).getPropertyValue('--bg-main').trim() || '#1e1e2e') +
    ';color:' + (getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#cdd6f4') +
    ';font-family:monospace;font-size:13px;';

  const title = document.createElement('div');
  title.style.cssText = 'font-size:20px;font-weight:bold;margin-bottom:16px;color:' +
    (getComputedStyle(document.body).getPropertyValue('--color-laranja').trim() || '#fab387');
  title.innerHTML = '<img src="assets/crabcode_logo.png" alt="CrabCode" style="height:1em;vertical-align:middle;margin-right:4px;"> CrabCode';
  container.appendChild(title);

  const codeSection = document.createElement('div');
  codeSection.style.cssText = 'margin-bottom:20px;';
  const codeTitle = document.createElement('div');
  codeTitle.style.cssText = 'font-size:14px;font-weight:bold;margin-bottom:8px;';
  codeTitle.textContent = 'Código:';
  codeSection.appendChild(codeTitle);

  const codePre = document.createElement('pre');
  codePre.style.cssText = 'background:rgba(0,0,0,0.2);padding:12px;border-radius:6px;white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.6;';
  codePre.textContent = codeEditor.value;
  codeSection.appendChild(codePre);
  container.appendChild(codeSection);

  const outputSection = document.createElement('div');
  const outputTitle = document.createElement('div');
  outputTitle.style.cssText = 'font-size:14px;font-weight:bold;margin-bottom:8px;';
  outputTitle.textContent = 'Output:';
  outputSection.appendChild(outputTitle);

  const outputClone = document.getElementById('output-body').cloneNode(true);
  outputClone.style.cssText = 'background:rgba(0,0,0,0.2);padding:12px;border-radius:6px;overflow:visible;max-height:none;';
  outputSection.appendChild(outputClone);
  container.appendChild(outputSection);

  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top:16px;font-size:10px;color:#6c7086;text-align:right;';
  footer.textContent = 'Gerado por CrabCode em ' + new Date().toLocaleDateString('pt-BR');
  container.appendChild(footer);

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-main').trim() || '#1e1e2e',
      useCORS: true,
      logging: false,
      width: 800,
    });
    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yOffset = 10;
    const pageContentHeight = pdfHeight - 20;

    if (imgHeight <= pageContentHeight) {
      pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
    } else {
      const totalPages = Math.ceil(imgHeight / pageContentHeight);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const srcY = (page * pageContentHeight / imgHeight) * canvas.height;
        const srcH = Math.min((pageContentHeight / imgHeight) * canvas.height, canvas.height - srcY);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcH;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceHeight = (srcH * imgWidth) / canvas.width;
        pdf.addImage(sliceData, 'PNG', 10, 10, imgWidth, sliceHeight);
      }
    }

    pdf.save('crabcode-' + new Date().toISOString().slice(0, 10) + '.pdf');
  } catch (err) {
    if (container.parentNode) document.body.removeChild(container);
    console.error('Export PDF error:', err);
    alert('Erro ao exportar como PDF.');
  }
}

// ==================== EXPORT AS HTML ====================
function exportHTML() {
  const date = new Date().toISOString().slice(0, 10);
  const isDark = document.body.classList.contains('dark');
  const cs = getComputedStyle(document.body);

  const resolveCssVar = (name, fallback) =>
    cs.getPropertyValue(name).trim() || fallback;

  const bgMain    = resolveCssVar('--bg-output',      isDark ? '#181825' : '#f5f5f8');
  const bgEditor  = resolveCssVar('--bg-editor',      isDark ? '#1e1e2e' : '#ffffff');
  const textPrimary = resolveCssVar('--text-primary', isDark ? '#cdd6f4' : '#4c4f69');
  const colorLaranja = resolveCssVar('--color-laranja', isDark ? '#fab387' : '#d86213');
  const fontMono  = resolveCssVar('--font-mono',      'Consolas, monospace');
  const fontUi    = resolveCssVar('--font-ui',        'Segoe UI, sans-serif');

  // Interface mode: snapshot iframe if present
  const ifaceCanvas = document.getElementById('interface-canvas');
  const ifaceIframe = ifaceCanvas && ifaceCanvas.style.display !== 'none'
    ? ifaceCanvas.querySelector('iframe') : null;

  let bodyContent;
  if (ifaceIframe) {
    try {
      const inner = ifaceIframe.contentDocument || ifaceIframe.contentWindow?.document;
      bodyContent = inner ? inner.documentElement.outerHTML : '';
      if (bodyContent) {
        const blob = new Blob([bodyContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.download = 'crabcode-export-' + date + '.html';
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 5000);
        return;
      }
    } catch (e) { /* cross-origin — fall through to STEM snapshot */ }
  }

  // STEM mode: snapshot output-body
  const outputBody = document.getElementById('output-body');
  const outputHTML = outputBody ? outputBody.innerHTML : '<p>Sem output</p>';

  const codeText = (typeof codeEditor !== 'undefined') ? codeEditor.value : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CrabCode Export – ${date}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${fontUi};background:${bgMain};color:${textPrimary};padding:24px;min-height:100vh;}
  .export-header{display:flex;align-items:center;gap:8px;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid ${colorLaranja};}
  .export-header span{font-size:20px;font-weight:bold;color:${colorLaranja};}
  .export-date{font-size:11px;color:#888;margin-left:auto;}
  .section-title{font-size:13px;font-weight:bold;margin-bottom:8px;color:${textPrimary};opacity:0.7;}
  .code-block{background:${bgEditor};padding:14px 16px;border-radius:8px;font-family:${fontMono};font-size:13px;white-space:pre-wrap;word-break:break-word;line-height:1.6;margin-bottom:20px;color:${textPrimary};}
  .output-section{background:${bgEditor};padding:14px 16px;border-radius:8px;}
  /* Preserve all output styles inline */
  .output-item{margin-bottom:10px;font-family:${fontUi};}
  .output-execute{font-family:${fontMono};font-size:13px;padding:6px 10px;background:${bgMain};border-radius:4px;}
  .output-destaque{font-size:18px;font-weight:bold;padding:10px 14px;border-left:3px solid ${colorLaranja};background:${bgMain};border-radius:4px;}
  .output-texto{font-size:14px;padding:4px 0;}
  table{border-collapse:collapse;width:100%;font-size:13px;font-family:${fontMono};}
  th{background:${bgMain};padding:6px 10px;text-align:left;font-weight:bold;}
  td{padding:6px 10px;border-top:1px solid rgba(255,255,255,0.05);}
  .export-footer{margin-top:24px;font-size:10px;color:#888;text-align:right;}
</style>
</head>
<body>
  <div class="export-header">
    <span>CrabCode</span>
    <span class="export-date">Exportado em ${new Date().toLocaleDateString('pt-BR')}</span>
  </div>
  <div class="section-title">Código</div>
  <div class="code-block">${escapeHtmlExport(codeText)}</div>
  <div class="section-title">Output</div>
  <div class="output-section">${outputHTML}</div>
  <div class="export-footer">Gerado por CrabCode</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.download = 'crabcode-export-' + date + '.html';
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}

function escapeHtmlExport(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==================== INIT ====================
function init() {
  loadTheme();
  loadCode();
  updateEditor();
  loadTutorial();
  loadDocs();
  initResize();
  initShortcuts();
  AutoComplete.init();
  initImagesTab();

  // Sync images to window.__ccImages for sandbox access
  try {
    const imgs = loadImages();
    window.__ccImages = imgs;
  } catch { window.__ccImages = {}; }

  // Editor events
  codeEditor.addEventListener('input', updateEditor);
  codeEditor.addEventListener('scroll', syncScroll);

  // Escape key for presentation mode
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPresentationMode) exitPresentation();
  });

  // Static button event listeners
  document.getElementById('btn-run').addEventListener('click', runCode);
  document.getElementById('btn-clear').addEventListener('click', clearOutput);
  document.getElementById('btn-clear-output')?.addEventListener('click', clearOutput);
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);
  document.getElementById('btn-export-png').addEventListener('click', exportPNG);
  document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);
  document.getElementById('btn-export-html')?.addEventListener('click', exportHTML);
  document.getElementById('btn-presentation').addEventListener('click', togglePresentation);
  document.getElementById('error-toggle').addEventListener('click', toggleErrorPanel);

  // Interface mode re-run on interactive element events
  window.addEventListener('crab-rerun', () => { runCode(); });

  // Tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Scripts modal
  document.getElementById('btn-new-script')?.addEventListener('click', openScriptModal);
  document.getElementById('close-script-modal')?.addEventListener('click', closeScriptModal);
  document.getElementById('save-script-btn')?.addEventListener('click', saveScript);
  document.getElementById('scripts-search')?.addEventListener('input', renderScripts);

  // CSV/Dados
  document.getElementById('btn-new-csv')?.addEventListener('click', () => openCsvModal());
  document.getElementById('close-csv-modal')?.addEventListener('click', closeCsvModal);
  document.getElementById('save-csv-btn')?.addEventListener('click', saveCsvFromModal);
  document.getElementById('csv-suggest-key')?.addEventListener('click', suggestCsvKey);

  // Libs
  document.getElementById('btn-new-lib')?.addEventListener('click', openLibModal);
  document.getElementById('close-lib-modal')?.addEventListener('click', closeLibModal);
  document.getElementById('save-lib-btn')?.addEventListener('click', saveLibFromModal);
  document.getElementById('libs-search')?.addEventListener('input', renderLibs);
  document.getElementById('btn-scroll-meta')?.addEventListener('click', scrollToMeta);

  // Presentation exit button
  document.getElementById('btn-presentation-exit')?.addEventListener('click', exitPresentation);

  // Modal close-on-overlay-click
  document.getElementById('script-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeScriptModal(); });
  document.getElementById('lib-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeLibModal(); });
  document.getElementById('csv-modal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeCsvModal(); });

  // Initial highlight
  scheduleHighlight();
}

// ==================== EXPOSE GLOBALS FOR DYNAMIC HTML INLINE HANDLERS ====================
// These functions are called from onclick attributes inside dynamically generated HTML
// strings — they must be accessible on window.
window.copyCode         = copyCode;
window.copyLibImport    = copyLibImport;
window.copyLibExample   = copyLibExample;
window.deleteCustomLibUI = deleteCustomLibUI;
window.copyScriptCode   = copyScriptCode;
window.confirmDeleteScript = confirmDeleteScript;
window.copyCsvImport    = copyCsvImport;
window.openCsvModal     = openCsvModal;
window.deleteCsvDataset = deleteCsvDataset;
window.loadIntoEditor   = function(id) {
  const scripts = loadScripts();
  const s = scripts.find(s => s.id === id);
  if (!s) return;
  codeEditor.value = s.code;
  updateEditor();
  saveCode();
  switchTab('editor');
};

init();
