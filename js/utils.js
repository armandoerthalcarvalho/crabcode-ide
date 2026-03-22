// ==================== SHARED UTILITIES ====================
// Used by editor.js, storage.js, and libs.js

import { Lexer } from './language.js';

export function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function highlightLine(line) {
  const lexer = new Lexer(line);
  const { tokens } = lexer.tokenize();

  const colorMap = {
    laranja: 'var(--color-laranja)',
    roxo: 'var(--color-roxo)',
    azul: 'var(--color-azul)',
    branco: 'var(--color-branco)',
    vermelho: 'var(--color-vermelho)',
    numero: 'var(--color-numero)',
    operador: 'var(--color-operador)',
    verde: 'var(--color-verde)',
    string: 'var(--color-string-hint)',
    comment: 'var(--text-muted)',
    ponto: 'var(--color-branco)',
  };

  let result = '';
  let cursor = 0;
  for (const t of tokens) {
    if (t.type === 'NEWLINE' || t.type === 'WS') {
      result += escapeHtml(t.value || '');
      cursor += (t.value || '').length;
      continue;
    }
    const color = colorMap[t.module] || colorMap['branco'];
    const val = escapeHtml(t.value || '');
    result += `<span style="color:${color}">${val}</span>`;
    cursor += (t.value || '').length;
  }
  return result;
}

export function highlightCodeStatic(source) {
  try {
    const lines = source.split('\n');
    let html = '';
    for (const line of lines) {
      html += '<div class="hl-line">' + highlightLine(line) + '</div>';
    }
    return html;
  } catch {
    return `<pre>${escapeHtml(source)}</pre>`;
  }
}
