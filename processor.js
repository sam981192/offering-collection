/* =============================================
   Offering Collection Management System
   processor.js — Input Processing & Counting
   ============================================= */

'use strict';

/**
 * Parse raw text into trimmed non-empty lines.
 */
function parseLines(text) {
  return (text || '').split('\n').map(l => l.trim()).filter(l => l !== '');
}

/**
 * processInputs(t1, t2, t3)
 * Full pipeline: parse → normalize → count → validate.
 * Returns { catCount, subCount, childDisplayMap, adminItems, rawRows, total }
 *
 * t1 = Offering Collection Data
 * t2 = Website Offering Data
 * t3 = Out of India Offerings (forceOutside = true for non-NCR items)
 */
function processInputs(t1, t2, t3) {
  // ── Init category counts from MASTER_CONFIG ──
  const catCount = {};
  for (const cat of MASTER_CONFIG) catCount[cat.key] = 0;

  // subKey (childKey or display name) → count
  const subCount = {};
  // childKey → display name
  const childDisplayMap = {};

  // Pre-populate childDisplayMap from config
  for (const cat of MASTER_CONFIG) {
    for (const child of cat.children) {
      childDisplayMap[child.key] = child.display;
    }
  }

  // Also pre-populate outside aliases into childDisplayMap
  for (const [, target] of Object.entries(outsideCategory.aliases || {})) {
    if (!childDisplayMap[target]) {
      childDisplayMap[target] = toTitleCase(target);
    }
  }

  const adminItems = [];
  const rawRows = [];

  // ── Process one raw line ──────────────────────────────────────────────────
  function processLine(raw, forceOutside, source) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Skip header / noise lines
    const lcRaw = trimmed.toLowerCase().replace(/^iskcon\s+/i, '').trim();
    if (SKIP_SET.has(lcRaw) || SKIP_SET.has(trimmed.toLowerCase())) return;

    const cleaned = cleanLine(trimmed);
    if (!cleaned) return;
    const cleanedLc = cleaned.toLowerCase();
    if (SKIP_SET.has(cleanedLc)) return;

    let childKey = null;
    let categoryKey = null;
    let childDisplay = toTitleCase(cleaned);
    let categoryDisplay = null;
    let matchType = 'unmatched';

    // ── Step 1: Unknown check (highest priority) ──
    if (isUnknownValue(cleanedLc)) {
      categoryKey = 'unknown';
      categoryDisplay = 'Unknown';
      childKey = UNKNOWN_RAW_MAP[cleanedLc] || 'unknown';
      childDisplay = childDisplayMap[childKey] || toTitleCase(cleaned);
      matchType = 'exact';

    // ── Step 2: Out-of-India forced outside ──
    } else if (forceOutside) {
      // Still try to resolve clean alias/display for known outside locations
      const match = matchToCanonical(cleaned);
      if (match && match.categoryKey === 'outside') {
        childKey = match.childKey;
        childDisplay = match.childDisplay;
        matchType = match.matchType + ' (forced outside)';
      } else if (match && protectedKeys.has(match.childKey)) {
        // NCR / Haryana / Delhi location in Out-of-India box → keep correct category
        childKey = match.childKey;
        categoryKey = match.categoryKey;
        categoryDisplay = match.categoryDisplay;
        childDisplay = match.childDisplay;
        matchType = match.matchType + ' (corrected from outside)';
      } else {
        childKey = null;
        childDisplay = toTitleCase(cleaned);
        matchType = 'forced outside';
      }
      // Only assign outside category if not already overridden above
      if (!categoryKey) {
        categoryKey = 'outside';
        categoryDisplay = 'Outside Delhi / Haryana / NCR';
      }

    // ── Step 3: Normal matching ──
    } else {
      const match = matchToCanonical(cleaned);
      if (match) {
        childKey = match.childKey;
        categoryKey = match.categoryKey;
        categoryDisplay = match.categoryDisplay;
        childDisplay = match.childDisplay;
        matchType = match.matchType;
      } else {
        // Falls to Outside — unrecognised location
        categoryKey = 'outside';
        categoryDisplay = 'Outside Delhi / Haryana / NCR';
        childKey = null;
        childDisplay = toTitleCase(cleaned);
        matchType = 'unmatched → outside';
      }
    }

    // ── Validate: protected location must never land in Outside ──
    if (categoryKey === 'outside' && childKey && protectedKeys.has(childKey)) {
      const info = childKeyToCategory[childKey];
      categoryKey = info.categoryKey;
      categoryDisplay = info.categoryDisplay;
      matchType += ' (auto-corrected)';
    }

    catCount[categoryKey]++;

    // Sub-location tracking (deduplicate by canonical key)
    const subKey = childKey || childDisplay;
    subCount[subKey] = (subCount[subKey] || 0) + 1;
    if (childKey && !childDisplayMap[childKey]) childDisplayMap[childKey] = childDisplay;

    // Admin review: flag fuzzy, contains, unmatched-outside
    const isFuzzy       = matchType.startsWith('fuzzy');
    const isContains    = matchType.includes('contains');
    const isUnmatched   = matchType === 'unmatched → outside';
    if (isFuzzy || isContains || isUnmatched) {
      adminItems.push({
        original: trimmed,
        cleaned,
        display: childDisplay,
        category: categoryDisplay || getCatDisplay(categoryKey),
        matchType,
        source,
      });
    }

    rawRows.push({
      original: trimmed,
      cleaned,
      display: childDisplay,
      category: categoryDisplay || getCatDisplay(categoryKey),
      source,
      matchType,
    });
  }

  // ── Run all three inputs ──────────────────────────────────────────────────
  parseLines(t1).forEach(l => processLine(l, false, 'Offering Collection'));
  parseLines(t2).forEach(l => processLine(l, false, 'Website Offering'));
  parseLines(t3).forEach(l => processLine(l, true,  'Out of India'));

  const total = MASTER_CONFIG.reduce((s, c) => s + catCount[c.key], 0);

  return { catCount, subCount, childDisplayMap, adminItems, rawRows, total };
}
