#!/usr/bin/env node
/**
 * Flags the writing habits listed in STYLE.md.
 *
 *   npm run voice
 *
 * Exits non-zero if anything is over budget, so it can gate a publish.
 * It reads prose only: markdown bodies and the quoted strings in src/data.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TARGETS = ['src/content', 'src/pages', 'src/data'];

const BANNED = [
  'delve', 'leverage', 'seamless', 'robust', 'landscape', 'realm', 'tapestry',
  'underscore', 'testament to', 'at its core', 'crucially', 'importantly',
  'notably', 'in the world of',
];

/** Em dashes allowed per file before it is flagged. */
const DASH_BUDGET = 1;
/** A sentence at or under this length, following a long one, reads as a punchline. */
const JAB_MAX_WORDS = 5;
const LONG_MIN_WORDS = 18;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(md|ts|astro)$/.test(name)) out.push(p);
  }
  return out;
}

/** Strip frontmatter, code fences, comments and import lines. Prose only. */
function prose(text, file) {
  let t = text.replace(/^---\n[\s\S]*?\n---\n/, '');
  t = t.replace(/```[\s\S]*?```/g, '');
  t = t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  t = t.replace(/<!--[\s\S]*?-->/g, '');          // .astro section markers
  t = t.replace(/^\s*import\s.+$/gm, '');
  if (file.endsWith('.ts')) {
    // keep only quoted string contents
    const found = t.match(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g) || [];
    t = found.map((s) => s.slice(1, -1)).filter((s) => s.split(/\s+/).length > 6).join('\n');
  }
  return [t];
}

const problems = [];

for (const dir of TARGETS) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) { console.error(`voice: ${dir} not found`); process.exitCode = 1; continue; }
  const files = walk(abs);

  for (const file of files) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    const chunks = prose(readFileSync(file, 'utf8'), file);
    const text = chunks.join('\n');
    if (!text.trim()) continue;

    const dashes = (text.match(/—/g) || []).length;
    if (dashes > DASH_BUDGET) {
      problems.push(`${rel}: ${dashes} em dashes (budget ${DASH_BUDGET}) — see STYLE.md §1`);
    }

    for (const word of BANNED) {
      const re = new RegExp(`\\b${word.replace(/ /g, '\\s+')}\\b`, 'gi');
      const hits = text.match(re);
      if (hits) problems.push(`${rel}: banned phrase "${hits[0]}" — STYLE.md §5`);
    }

    if (!/\b(I'm|it's|don't|can't|isn't|that's|there's|I've|I'd|wasn't|didn't)\b/i.test(text)
        && text.split(/\s+/).length > 220) {
      problems.push(`${rel}: no contractions in ${text.split(/\s+/).length} words — STYLE.md §3`);
    }

    // Split per chunk, never across two unrelated data strings, and don't let
    // "U.S." or "e.g." look like the end of a sentence.
    const ABBR = /\b(U\.S|e\.g|i\.e|etc|vs|Dr|Mr|Ms|Inc|Ltd|approx|Fig|No)\./g;
    for (const chunk of chunks) {
      const sentences = chunk
        .replace(/\n+/g, ' ')
        .replace(ABBR, (m) => m.replace(/\./g, '\u0000'))
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.replace(/\u0000/g, '.').trim())
        .filter(Boolean);

      for (let i = 1; i < sentences.length; i++) {
        const prev = sentences[i - 1].split(/\s+/).length;
        const cur = sentences[i].split(/\s+/).length;
        if (prev >= LONG_MIN_WORDS && cur <= JAB_MAX_WORDS) {
          problems.push(`${rel}: punchline after a long sentence: "${sentences[i]}" (STYLE.md 2)`);
        }
      }
    }
  }
}

// ----------------------------------------------------------------------------
// Ground truth: whatever ended up in the built HTML is what a visitor reads.
// Source scanning alone missed the <title> built in Base.astro, which put an
// em dash on all 8 pages. Never trust the source scan on its own again.
// ----------------------------------------------------------------------------
const distDir = join(ROOT, 'dist');
if (!existsSync(distDir)) {
  problems.push('dist/ not found: run `npm run build` first so the rendered check can run');
} else {
  for (const file of walk(distDir).filter((f) => f.endsWith('.html'))) {
    const rel = relative(ROOT, file).split('\\').join('/');
    const html = readFileSync(file, 'utf8');

    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
    if (title.includes('—')) {
      problems.push(`${rel}: em dash in <title> "${title}" (STYLE.md 1)`);
    }

    const visible = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ');
    const n = (visible.match(/—/g) || []).length;
    if (n > 0) problems.push(`${rel}: ${n} em dash(es) in rendered text (STYLE.md 1)`);
  }
}

if (problems.length === 0) {
  console.log('voice: clean');
  process.exit(0);
}

console.log(`voice: ${problems.length} issue(s)\n`);
for (const p of problems) console.log('  ' + p);
console.log('\nSee STYLE.md.');
process.exit(1);
