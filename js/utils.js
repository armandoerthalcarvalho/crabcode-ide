// ==================== SHARED UTILITIES ====================
// Used by editor.js, storage.js, libs.js, tutorial.js, and main.js

import { Lexer } from './language.js';

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function highlightLine(line) {
  const lexer = new Lexer(line);
  const { tokens } = lexer.tokenize();

  const colorMap = {
    laranja: 'var(--color-laranja)',
    roxo: 'var(--color-roxo)',
    azul: 'var(--color-azul)',
    amarelo: 'var(--color-amarelo)',
    branco: 'var(--color-branco)',
    vermelho: 'var(--color-vermelho)',
    numero: 'var(--color-numero)',
    operador: 'var(--color-operador)',
    verde: 'var(--color-verde)',
    string: 'var(--color-string-hint)',
    comentario: 'var(--text-muted)',
    paren: 'var(--text-muted)',
    bracket: 'var(--text-muted)',
    virgula: 'var(--text-muted)',
    ponto: 'var(--text-muted)',
    dois_pontos: 'var(--text-muted)',
    erro: 'var(--color-vermelho)',
  };

  let result = '';
  for (const t of tokens) {
    if (t.type === 'NEWLINE' || t.type === 'WS') {
      result += escapeHtml(t.value || '');
      continue;
    }
    const color = colorMap[t.module] || colorMap.branco;
    if (t.module === 'string') {
      const q = escapeHtml(t.quote || '"');
      result += `<span style="color:${color}">${q}${escapeHtml(t.value || '')}${q}</span>`;
    } else if (t.module === 'comentario') {
      result += `<span style="color:${color};font-style:italic">${escapeHtml(t.value || '')}</span>`;
    } else if (t.module === 'laranja' || t.module === 'vermelho') {
      result += `<span style="color:${color};font-weight:600">${escapeHtml(t.value || '')}</span>`;
    } else {
      result += `<span style="color:${color}">${escapeHtml(t.value || '')}</span>`;
    }
  }
  return result;
}

export function highlightCodeStatic(source) {
  try {
    const lines = String(source || '').split('\n');
    return lines.map(line => `<div class="hl-line">${highlightLine(line) || '&nbsp;'}</div>`).join('');
  } catch {
    return `<pre>${escapeHtml(source)}</pre>`;
  }
}
