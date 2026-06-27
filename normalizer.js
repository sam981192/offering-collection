/* =============================================
   Offering Collection Management System
   normalizer.js — Normalization Pipeline
   Raw input → canonical name → category
   ============================================= */

'use strict';

// ─── LOOKUP MAPS ─────────────────────────────────────────────────────────────
// Built once from MASTER_CONFIG (single source of truth)

/** childKey (lc) → { categoryKey, categoryDisplay, childDisplay } */
const childKeyToCategory = {};
/** alias (lc) → { target: childKey, categoryKey } */
const aliasMap = {};
/** Set of child keys belonging to Unknown category */
const unknownChildKeys = new Set();
/** Set of all protected child keys (NCR / Delhi / Haryana) — must never land in Outside */
const protectedKeys = new Set();

let outsideCategory = null;
let unknownCategory = null;

function buildLookupMaps() {
  for (const cat of MASTER_CONFIG) {
    if (cat.key === 'outside') outsideCategory = cat;
    if (cat.key === 'unknown') unknownCategory = cat;

    for (const child of cat.children) {
      childKeyToCategory[child.key] = {
        categoryKey: cat.key,
        categoryDisplay: cat.displayName,
        childDisplay: child.display,
      };
      if (cat.key === 'unknown') unknownChildKeys.add(child.key);
      if (cat.key !== 'outside' && cat.key !== 'unknown') {
        protectedKeys.add(child.key);
      }
    }

    for (const [alias, target] of Object.entries(cat.aliases || {})) {
      // Don't overwrite existing alias with a lower-priority one
      if (!aliasMap[alias]) {
        aliasMap[alias] = { target, categoryKey: cat.key };
      }
    }
  }
}

buildLookupMaps();

// ─── SKIP LINES ──────────────────────────────────────────────────────────────

const SKIP_SET = new Set([
  'city', 'temple', 'mandir', 'location', 'center', 'centre',
  'temple / mandir', 'temple/mandir', 'name', 'offering', 'offerings',
  'date', 'sl no', 'sl.no', 's.no', 'sr.no', 'sr', 'no', 's no',
  'offering collection data', 'website offering data', 'out of india data',
  'out of india offerings', 'temple name', 'location name',
  'other', 'others',
]);

// ─── LEVENSHTEIN ─────────────────────────────────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

// ─── CLEAN LINE ───────────────────────────────────────────────────────────────
// Step 1 of normalization pipeline: sanitize raw text

function cleanLine(raw) {
  let s = raw.trim();
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/\(also referred to as[^)]*\)/gi, '').trim();
  s = s.replace(/\(also known as[^)]*\)/gi, '').trim();
  s = s.replace(/^ISKCON\s+of\s+/i, '');
  s = s.replace(/^ISKCON\s+Delhi\s+/i, '');
  s = s.replace(/^ISKCON\s+/i, '');
  s = s.replace(/^Iskcon\s+/i, '');
  s = s.replace(/\((\w)/g, ' ($1');
  s = s.replace(/\s+\(/g, ' (').trim();
  s = s.replace(/\s+(centre|center|mandir|temple)$/i, '').trim();
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

// ─── TITLE CASE ──────────────────────────────────────────────────────────────

function toTitleCase(str) {
  return str
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .replace(/\bIskcon\b/gi, 'ISKCON');
}

// ─── GET CATEGORY DISPLAY ────────────────────────────────────────────────────

function getCatDisplay(categoryKey) {
  const cat = MASTER_CONFIG.find(c => c.key === categoryKey);
  return cat ? cat.displayName : categoryKey;
}

// ─── UNKNOWN CHECK ────────────────────────────────────────────────────────────

const UNKNOWN_RAW_VALUES = new Set([
  'unknown', 'none', 'no', 'blank', 'empty', 'null', '', 'n/a', 'n.a.', 'nil', 'nill', '-', '--',
]);

const UNKNOWN_RAW_MAP = {
  'unknown': 'unknown', 'none': 'none', 'no': 'no',
  'blank': 'blank', 'empty': 'empty', 'null': 'null',
  '': 'unknown', '-': '-', '--': '-', 'n/a': 'na', 'n.a.': 'na',
  'nil': 'none', 'nill': 'none',
};

function isUnknownValue(lc) {
  return UNKNOWN_RAW_VALUES.has(lc);
}

// ─── MATCH TO CANONICAL ───────────────────────────────────────────────────────
/**
 * Full normalization pipeline:
 * 1. Direct child key match
 * 2. Alias match
 * 3. Contains match (child keys then aliases)
 * 4. Fuzzy / Levenshtein match (≥82%)
 * Returns { childKey, categoryKey, categoryDisplay, childDisplay, matchType } | null
 */
function matchToCanonical(cleaned) {
  const lc = cleaned.toLowerCase();

  // 1. Direct child key
  if (childKeyToCategory[lc]) {
    const info = childKeyToCategory[lc];
    return { childKey: lc, ...info, matchType: 'exact' };
  }

  // 2. Alias match
  if (aliasMap[lc]) {
    const { target, categoryKey } = aliasMap[lc];
    const info = childKeyToCategory[target] || {
      categoryKey,
      categoryDisplay: getCatDisplay(categoryKey),
      childDisplay: toTitleCase(target),
    };
    return {
      childKey: target,
      categoryKey,
      categoryDisplay: info.categoryDisplay,
      childDisplay: info.childDisplay || toTitleCase(target),
      matchType: 'alias',
    };
  }

  // 3. Contains match — child keys
  for (const key of Object.keys(childKeyToCategory)) {
    if (key.length > 3 && lc.includes(key)) {
      const info = childKeyToCategory[key];
      return { childKey: key, ...info, matchType: 'contains' };
    }
  }
  // Contains match — aliases
  for (const [alias, { target, categoryKey }] of Object.entries(aliasMap)) {
    if (alias.length > 3 && lc.includes(alias)) {
      const info = childKeyToCategory[target] || {
        categoryDisplay: getCatDisplay(categoryKey),
        childDisplay: toTitleCase(target),
      };
      return {
        childKey: target,
        categoryKey,
        categoryDisplay: info.categoryDisplay,
        childDisplay: info.childDisplay || toTitleCase(target),
        matchType: 'contains',
      };
    }
  }

  // 4. Fuzzy (Levenshtein ≥82%)
  let bestKey = null;
  let bestSim = 0;
  let bestIsAlias = false;
  const THRESHOLD = 0.82;

  for (const key of Object.keys(childKeyToCategory)) {
    const sim = similarity(lc, key);
    if (sim > bestSim) { bestSim = sim; bestKey = key; bestIsAlias = false; }
  }
  for (const alias of Object.keys(aliasMap)) {
    const sim = similarity(lc, alias);
    if (sim > bestSim) { bestSim = sim; bestKey = alias; bestIsAlias = true; }
  }

  if (bestSim >= THRESHOLD && bestKey) {
    if (bestIsAlias) {
      const { target, categoryKey } = aliasMap[bestKey];
      const info = childKeyToCategory[target] || {
        categoryDisplay: getCatDisplay(categoryKey),
        childDisplay: toTitleCase(target),
      };
      return {
        childKey: target,
        categoryKey,
        categoryDisplay: info.categoryDisplay,
        childDisplay: info.childDisplay || toTitleCase(target),
        matchType: `fuzzy (${Math.round(bestSim * 100)}%)`,
      };
    } else {
      const info = childKeyToCategory[bestKey];
      return { childKey: bestKey, ...info, matchType: `fuzzy (${Math.round(bestSim * 100)}%)` };
    }
  }

  return null;
}

// ─── COUNT VALID LINES (for UI meta) ─────────────────────────────────────────

function countValidLines(text) {
  if (!text) return 0;
  let count = 0;
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const lcRaw = t.toLowerCase().replace(/^iskcon\s+/i, '').trim();
    if (SKIP_SET.has(lcRaw) || SKIP_SET.has(t.toLowerCase())) continue;
    const cleaned = cleanLine(t);
    if (!cleaned || SKIP_SET.has(cleaned.toLowerCase())) continue;
    count++;
  }
  return count;
}
