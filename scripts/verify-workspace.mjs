#!/usr/bin/env node
/**
 * CrabCode IDE — Workspace Integrity & Static Audit Script
 * Executed locally (`npm run check:integrity`) and automatically in GitHub Actions CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Lexer, Parser, CrabLibRegistry } from '../js/language.js';
import {
  getAllTutorialCodeBlocks,
  getAllTutorialSolutionBlocks,
} from '../js/tutorial.js';
import { getAllDocsCodeBlocks } from '../js/docs.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function fail(msg) {
  failures.push(msg);
  console.error(`  [FAIL] ${msg}`);
}

function pass(msg) {
  console.log(`  [OK]   ${msg}`);
}

function analyzeSnippet(source) {
  const lexer = new Lexer(source, { registry: CrabLibRegistry, csvDatasets: [] });
  const { tokens, errors: lexErrors } = lexer.tokenize();
  const parser = new Parser(
    tokens,
    new Set(lexer.declaredVars),
    new Set(lexer.declaredArrays),
    new Set(lexer.declaredObjects),
    {
      registry: CrabLibRegistry,
      csvDatasets: [],
      savedSprites: { nave: { size: 16, pixels: [] }, caranguejo: { size: 16, pixels: [] } },
    }
  );
  const { errors: parseErrors, warnings = [] } = parser.parse();
  return { errors: [...lexErrors, ...parseErrors], warnings };
}

// 1. Verify all local assets referenced in index.html exist on disk
console.log('1. Checking index.html local asset references...');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const assetRefs = [...indexHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
  .map(m => m[1])
  .filter(ref => !ref.startsWith('http://') && !ref.startsWith('https://') && !ref.startsWith('#') && !ref.startsWith('data:') && !ref.startsWith('mailto:'));

let missingAssets = 0;
for (const ref of assetRefs) {
  const cleanRef = ref.split('?')[0].split('#')[0];
  if (!cleanRef) continue;
  const fullPath = path.join(ROOT, cleanRef);
  if (!fs.existsSync(fullPath)) {
    fail(`index.html references missing asset: ${ref}`);
    missingAssets++;
  }
}
if (missingAssets === 0) pass(`All ${assetRefs.length} local asset reference(s) in index.html exist.`);

// 2. Ensure no forbidden browser blocking dialogs (window.alert/confirm/prompt/open) in js/*.js
console.log('2. Checking for forbidden blocking browser dialogs...');
const jsDir = path.join(ROOT, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
const forbiddenRe = /\bwindow\.(alert|confirm|prompt|open)\s*\(/g;
let dialogHits = 0;
for (const file of jsFiles) {
  const rawContent = fs.readFileSync(path.join(jsDir, file), 'utf8');
  const lines = rawContent.split('\n');
  lines.forEach((line, idx) => {
    const codeOnly = line.replace(/\/\/.*$/, '');
    let m;
    forbiddenRe.lastIndex = 0;
    while ((m = forbiddenRe.exec(codeOnly)) !== null) {
      fail(`js/${file}:${idx + 1} uses forbidden window.${m[1]}()`);
      dialogHits++;
    }
  });
}
if (dialogHits === 0) pass(`Scanned ${jsFiles.length} JS modules: zero forbidden window.alert/confirm/prompt/open calls.`);

// 3. Verify static getElementById references in js/main.js exist in index.html
console.log('3. Checking DOM IDs referenced by js/main.js...');
const htmlIds = new Set([...indexHtml.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]));
const mainJs = fs.readFileSync(path.join(jsDir, 'main.js'), 'utf8');
const mainIdRefs = [...new Set([...mainJs.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m => m[1]))];
const dynamicAllow = new Set(['cc-toast-stack', 'output-iframe', 'print-view']);
let brokenIds = 0;
for (const id of mainIdRefs) {
  if (!htmlIds.has(id) && !dynamicAllow.has(id)) {
    fail(`js/main.js references getElementById('${id}') which is missing in index.html`);
    brokenIds++;
  }
}
if (brokenIds === 0) pass(`All ${mainIdRefs.length} DOM IDs referenced by js/main.js exist in index.html.`);

// 4. Audit CrabCode snippets across Tutorial (96 demos + 96 solutions), Docs, Quick Templates, and Official Libs
console.log('4. Auditing CrabCode snippets (Tutorial, Docs, Templates, Libs) for errors & inert controls...');
function auditSnippet(label, code) {
  if (!code || !code.trim()) return;
  const { errors, warnings } = analyzeSnippet(code);
  for (const err of errors) {
    fail(`${label}: [${err.code || 'ERR'}] line ${err.line}: ${err.message}`);
  }
  // Check for inert interactive controls (defina X como funcao() slider/toggle/seletor/digite without X.valor usage)
  const ctrlRe = /^\s*defina\s+([a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*)\s+como\s+funcao\s*\(\s*\)\s*(slider|toggle|seletor|digite)\b/gmi;
  let cm;
  while ((cm = ctrlRe.exec(code)) !== null) {
    const varName = cm[1];
    const kind = cm[2];
    const readRe = new RegExp(`\\b${varName}\\.valor\\b`);
    if (!readRe.test(code)) {
      fail(`${label}: interactive ${kind} "${varName}" is defined but "${varName}.valor" is never used`);
    }
  }
  for (const w of warnings) {
    if (w.code === 'W_UNUSED_VAR') {
      fail(`${label}: unused variable warning on line ${w.line}: ${w.message}`);
    }
  }
}

let snippetCount = 0;
for (const b of getAllTutorialCodeBlocks()) {
  auditSnippet(`Tutorial L${b.num} demo (${b.title})`, b.code);
  snippetCount++;
}
for (const s of getAllTutorialSolutionBlocks()) {
  auditSnippet(`Tutorial L${s.num} solution (${s.title})`, s.code);
  snippetCount++;
}
for (const d of getAllDocsCodeBlocks()) {
  auditSnippet(`Docs [${d.chapter} / ${d.title}]`, d.code);
  snippetCount++;
}

// Extract QUICK_TEMPLATES array code blocks from js/main.js
const tplBlockMatch = mainJs.match(/const\s+QUICK_TEMPLATES\s*=\s*\[([\s\S]*?)\n\];/);
if (tplBlockMatch) {
  const tplEntryRe = /id:\s*'([^']+)'[\s\S]*?code:\s*`([\s\S]*?)`/g;
  let tm;
  while ((tm = tplEntryRe.exec(tplBlockMatch[1])) !== null) {
    auditSnippet(`QUICK_TEMPLATES.${tm[1]}`, tm[2]);
    snippetCount++;
  }
}

const officialLibs = Object.values(CrabLibRegistry.official);
for (const lib of officialLibs) {
  if (lib.example) {
    auditSnippet(`Official Lib "${lib.key}" example`, lib.example);
    snippetCount++;
  }
}

pass(`Audited ${snippetCount} CrabCode snippets across tutorials, docs, templates, and ${officialLibs.length} official libraries.`);

// 5. Verify GitHub Actions & repo hygiene files exist
console.log('5. Checking GitHub Actions workflows & workspace config...');
const requiredRepoFiles = [
  '.gitignore',
  '.editorconfig',
  '.github/workflows/ci.yml',
  '.github/workflows/pages.yml',
  '.github/workflows/security.yml',
  '.github/dependabot.yml',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
];
let missingRepoFiles = 0;
for (const rel of requiredRepoFiles) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    fail(`Missing workspace / GitHub Actions file: ${rel}`);
    missingRepoFiles++;
  }
}
if (missingRepoFiles === 0) pass(`All ${requiredRepoFiles.length} GitHub Actions & workspace hygiene files present.`);

if (failures.length > 0) {
  console.error(`\nWorkspace integrity check failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log('\nAll workspace integrity checks passed!');
