/* =============================================
   Offering Collection Management System
   script.js — v4.0
   - Master config object (single source of truth)
   - New location hierarchy per spec
   - No Excel / PDF export
   - Alias, fuzzy, Levenshtein matching retained
   - Admin Review, toast messages retained
   ============================================= */

'use strict';

// ─── MASTER CONFIGURATION ────────────────────────────────────────────────────
// Single source of truth for categories, display names, child locations, aliases.
// inSummary: shown in final summary report
// inBreakdown: shown in full breakdown
// isParent: groups sub-locations (Haryana, Ghaziabad, Outside, Unknown)

const MASTER_CONFIG = [
  {
    key: 'east_of_kailash',
    displayName: 'East of Kailash',
    summaryOrder: 1,
    inSummary: true,
    inBreakdown: true,
    children: [
      { key: 'east of kailash',  display: 'East of Kailash' },
      { key: 'sant nagar',       display: 'Sant Nagar' },
      { key: 'aya nagar',        display: 'Aya Nagar' },
      { key: 'chhatarpur',       display: 'Chhatarpur' },
      { key: 'mehrauli',         display: 'Mehrauli' },
      { key: 'mahipalpur',       display: 'Mahipalpur' },
      { key: 'malviya nagar',    display: 'Malviya Nagar' },
      { key: 'lado sarai',       display: 'Lado Sarai' },
      { key: 'ber sarai',        display: 'Ber Sarai' },
      { key: 'katwaria sarai',   display: 'Katwaria Sarai' },
      { key: 'sarojini nagar',   display: 'Sarojini Nagar' },
      { key: 'sultanpur',        display: 'Sultanpur' },
      { key: 'sangam vihar',     display: 'Sangam Vihar' },
    ],
    aliases: {
      'iskcon delhi sri sri radha parthasarathi mandir sant nagar': 'east of kailash',
      'sri sri radha parthasarathi mandir': 'east of kailash',
      'radha parthasarathi mandir': 'east of kailash',
      'iskcon east of kailash': 'east of kailash',
      'iskcon sant nagar': 'sant nagar',
      'chattarpur': 'chhatarpur',
      'iskcon chhatarpur': 'chhatarpur',
      'iskcon chattarpur': 'chhatarpur',
      'sarojini nagar centre': 'sarojini nagar',
      'sarojni nagar': 'sarojini nagar',
      'sarojni nagar centre': 'sarojini nagar',
      'iskcon sarojini nagar': 'sarojini nagar',
      'iskcon malviya nagar': 'malviya nagar',
      'iskcon aya nagar': 'aya nagar',
      'iskcon ber sarai': 'ber sarai',
      'iskcon katwaria sarai': 'katwaria sarai',
      'iskcon lado sarai': 'lado sarai',
      'iskcon mahipalpur': 'mahipalpur',
      'iskcon mehrauli': 'mehrauli',
      'iskcon sultanpur': 'sultanpur',
      'iskcon sangam vihar': 'sangam vihar',
    },
  },
  {
    key: 'punjabi_bagh',
    displayName: 'Punjabi Bagh',
    summaryOrder: 2,
    inSummary: true,
    inBreakdown: true,
    children: [
      { key: 'punjabi bagh', display: 'Punjabi Bagh' },
      { key: 'paharganj',    display: 'Paharganj' },
    ],
    aliases: {
      'panjabi bagh': 'punjabi bagh',
      'iskcon punjabi bagh': 'punjabi bagh',
      'iskcon panjabi bagh': 'punjabi bagh',
      'iskcon delhi sri sri radha radhanath mandir punjabi bagh': 'punjabi bagh',
      'sri sri radha radhanath mandir': 'punjabi bagh',
      'radha radhanath mandir': 'punjabi bagh',
      'pahadganj': 'paharganj',
      'iskcon paharganj': 'paharganj',
      'iskcon pahadganj': 'paharganj',
    },
  },
  {
    key: 'rohini',
    displayName: 'Rohini',
    summaryOrder: 3,
    inSummary: true,
    inBreakdown: true,
    children: [
      { key: 'rohini', display: 'Rohini' },
    ],
    aliases: {
      'iskcon rohini': 'rohini',
    },
  },
  {
    key: 'delhi_dwarka',
    displayName: 'Delhi Dwarka',
    summaryOrder: 4,
    inSummary: true,
    inBreakdown: true,
    children: [
      { key: 'dwarka', display: 'Dwarka' },
    ],
    aliases: {
      'dwaraka': 'dwarka',
      'dvaraka': 'dwarka',
      'delhi dwarka': 'dwarka',
      'iskcon dwarka': 'dwarka',
      'iskcon dwaraka': 'dwarka',
      'iskcon dvaraka': 'dwarka',
      'iskcon dwarkadhish': 'dwarka',
    },
  },
  {
    key: 'haryana',
    displayName: 'Haryana',
    summaryOrder: 5,
    inSummary: true,
    inBreakdown: true,
    isParent: true,
    children: [
      { key: 'faridabad',   display: 'Faridabad' },
      { key: 'gurugram',    display: 'Gurugram' },
      { key: 'badshahpur',  display: 'Badshahpur' },
      { key: 'bahadurgarh', display: 'Bahadurgarh' },
      { key: 'hisar',       display: 'Hisar' },
      { key: 'kurukshetra', display: 'Kurukshetra' },
      { key: 'panipat',     display: 'Panipat' },
      { key: 'yamuna nagar',display: 'Yamuna Nagar' },
      { key: 'jhajjar',     display: 'Jhajjar' },
      { key: 'sirsa',       display: 'Sirsa' },
    ],
    aliases: {
      'iskcon faridabad': 'faridabad',
      'shree shree radha govind temple faridabad haryana': 'faridabad',
      'gurgaon': 'gurugram',
      'iskcon gurugram': 'gurugram',
      'iskcon gurgaon': 'gurugram',
      'iskcon badshahpur': 'badshahpur',
      'badshapur': 'badshahpur',
      'iskcon badshapur': 'badshahpur',
      'bhadurgarh': 'bahadurgarh',
      'bahadur garh': 'bahadurgarh',
      'iskcon bahadurgarh': 'bahadurgarh',
      'iskcon bhadurgarh': 'bahadurgarh',
      'hissar': 'hisar',
      'iskcon hisar': 'hisar',
      'iskcon kurukshetra': 'kurukshetra',
      'iskcon panipat': 'panipat',
      'yammuna nagar': 'yamuna nagar',
      'iskcon yamuna nagar': 'yamuna nagar',
      'iskcon yammuna nagar': 'yamuna nagar',
      'iskcon jhajjar': 'jhajjar',
      'iskcon sirsa': 'sirsa',
    },
  },
  {
    key: 'ghaziabad',
    displayName: 'Ghaziabad',
    summaryOrder: 6,
    inSummary: true,
    inBreakdown: true,
    isParent: true,
    children: [
      { key: 'ghaziabad', display: 'Ghaziabad' },
      { key: 'sahibabad', display: 'Sahibabad' },
    ],
    aliases: {
      'gaziabad': 'ghaziabad',
      'iskcon ghaziabad': 'ghaziabad',
      'iskcon gaziabad': 'ghaziabad',
      'iskcon sahibabad': 'sahibabad',
    },
  },
  {
    key: 'noida',
    displayName: 'Noida',
    summaryOrder: 7,
    inSummary: true,
    inBreakdown: true,
    children: [
      { key: 'noida', display: 'Noida' },
    ],
    aliases: {
      'iskcon noida': 'noida',
    },
  },
  {
    key: 'chhipiwada',
    displayName: 'Chhipiwada',
    summaryOrder: 8,
    inSummary: true,
    inBreakdown: true,
    children: [
      { key: 'chhipiwada', display: 'Chhipiwada' },
    ],
    aliases: {
      'chippiwara': 'chhipiwada',
      'chhipiwara': 'chhipiwada',
      'chippiwada': 'chhipiwada',
      'chhippiwada': 'chhipiwada',
      'iskcon chippiwara': 'chhipiwada',
      'iskcon chippiwada': 'chhipiwada',
      'iskcon chhipiwada': 'chhipiwada',
      'iskcon chhipiwara': 'chhipiwada',
      'iskcon chhippiwada': 'chhipiwada',
    },
  },
  {
    key: 'outside',
    displayName: 'Outside Delhi / Haryana / NCR',
    summaryOrder: 9,
    inSummary: true,
    inBreakdown: true,
    isParent: true,
    isDynamic: true, // children discovered at runtime
    children: [],
    aliases: {
      // Known outside locations get clean display names
      'mumbai juhu': 'mumbai (juhu)',
      'mumbai(juhu)': 'mumbai (juhu)',
      'iskcon mumbai juhu': 'mumbai (juhu)',
      'iskcon mumbai(juhu)': 'mumbai (juhu)',
      'iskcon mumbai (juhu)': 'mumbai (juhu)',
      'navi mumbai': 'kharghar',
      'navi mumbai kharghar': 'kharghar',
      'mumbai kharghar': 'kharghar',
      'iskcon kharghar': 'kharghar',
      'iskcon navi mumbai': 'kharghar',
      'iskcon ahmedabad': 'ahmedabad',
      'iskcon ahmedabad satellite': 'ahmedabad',
      'satellite': 'ahmedabad',
      'iskcon satellite': 'ahmedabad',
      'sri sri radha madana mohan satellite': 'ahmedabad',
      'radha madana mohan': 'ahmedabad',
      'iskcon of boston': 'boston',
      'new gundica temple': 'boston',
      'new gundica': 'boston',
      'iskcon boston': 'boston',
      'iskcon atlanta': 'atlanta',
      'iskcon detroit': 'detroit',
      'devasadan': 'devasadan mandir',
      'allahabad': 'prayagraj',
      'iskcon prayagraj': 'prayagraj',
      'iskcon vrindavan': 'vrindavan',
      'bgis vrindavan': 'vrindavan',
      'iskcon sravan keertana bhavan tadepalligudem': 'tadepalligudem',
      'sravan keertana bhavan tadepalligudem': 'tadepalligudem',
      'sravan keertana bhavan': 'tadepalligudem',
      'iskcon tadepalligudem': 'tadepalligudem',
      'whitefiled': 'whitefield',
      'iskcon whitefield': 'whitefield',
      'iskcon thrissur': 'thrissur',
      'iskcon pali': 'pali',
      'pali rajasthan': 'pali',
      'iskcon chandigarh': 'chandigarh',
      'iskcon jaipur': 'jaipur',
      'iskcon kolkata': 'kolkata',
      'iskcon pune': 'pune',
      'pune nvcc': 'pune nvcc',
      'iskcon surat': 'surat',
      'iskcon indore': 'indore',
      'iskcon bhopal': 'bhopal',
      'iskcon varanasi': 'varanasi',
      'iskcon dehradun': 'dehradun',
      'iskcon jalandhar': 'jalandhar',
      'iskcon amritsar': 'amritsar',
      'iskcon ludhiana': 'ludhiana',
      'iskcon meerut': 'meerut',
      'iskcon kanpur': 'kanpur',
      'iskcon hyderabad': 'hyderabad',
      'iskcon chennai': 'chennai',
      'iskcon coimbatore': 'coimbatore',
      'iskcon jodhpur': 'jodhpur',
      'iskcon patna': 'patna',
      'iskcon kangra': 'kangra',
      'iskcon rudrapur': 'rudrapur',
      'baroda': 'vadodara',
      'iskcon baroda': 'vadodara',
      'iskcon vadodara': 'vadodara',
      'iskcon ponda': 'ponda',
      'iskcon mayapur': 'mayapur',
      'iskcon jajpur': 'jajpur',
      'iskcon jodhpur': 'jodhpur',
    },
  },
  {
    key: 'unknown',
    displayName: 'Unknown',
    summaryOrder: 10,
    inSummary: true,
    inBreakdown: true,
    isParent: true,
    children: [
      { key: 'unknown', display: 'Unknown' },
      { key: 'none',    display: 'None' },
      { key: 'no',      display: 'No' },
      { key: 'blank',   display: 'Blank' },
      { key: 'empty',   display: 'Empty' },
      { key: 'null',    display: 'NULL' },
      { key: '-',       display: '-' },
      { key: 'na',      display: 'N/A' },
    ],
    aliases: {
      'n/a': 'na',
      'n.a.': 'na',
      'nil': 'none',
      'nill': 'none',
    },
  },
];

// ─── BUILD FLAT LOOKUP MAPS FROM MASTER CONFIG ───────────────────────────────

// childKeyToCategory: child canonical key → { categoryKey, display, categoryDisplay }
const childKeyToCategory = {};
// aliasMap: alias (lc) → child canonical key
const aliasMap = {};
// unknownChildKeys: Set of keys that belong to Unknown category
const unknownChildKeys = new Set();
// outsideCategory ref
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
    }
    for (const [alias, target] of Object.entries(cat.aliases || {})) {
      aliasMap[alias] = { target, categoryKey: cat.key };
    }
  }
}
buildLookupMaps();

// ─── SKIP LINES (HEADERS / NOISE) ────────────────────────────────────────────

const SKIP_SET = new Set([
  'city', 'temple', 'mandir', 'location', 'center', 'centre',
  'temple / mandir', 'temple/mandir', 'name', 'offering', 'offerings',
  'date', 'sl no', 'sl.no', 's.no', 'sr.no', 'sr', 'no', 's no',
  'offering collection data', 'website offering data', 'out of india data',
  'out of india offerings', 'temple name', 'location name',
  'other', 'others',
]);

// ─── GLOBAL STATE ────────────────────────────────────────────────────────────

let barChartInst = null;
let pieChartInst = null;
let outsideChartInst = null;
let lastResult = null;

// ─── DOM HELPER ──────────────────────────────────────────────────────────────

function getSafeElement(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`DOM element #${id} missing.`);
  return el;
}

// ─── LEVENSHTEIN ─────────────────────────────────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

// ─── CLEAN LINE ───────────────────────────────────────────────────────────────

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

// ─── MATCH TO CANONICAL ───────────────────────────────────────────────────────
// Returns { childKey, categoryKey, categoryDisplay, childDisplay, matchType } | null

function matchToCanonical(cleaned) {
  const lc = cleaned.toLowerCase();

  // 1. Direct child key match
  if (childKeyToCategory[lc]) {
    const info = childKeyToCategory[lc];
    return { childKey: lc, ...info, matchType: 'exact' };
  }

  // 2. Alias match
  if (aliasMap[lc]) {
    const { target, categoryKey } = aliasMap[lc];
    const info = childKeyToCategory[target] || { categoryKey, categoryDisplay: getCatDisplay(categoryKey), childDisplay: toTitleCase(target) };
    return { childKey: target, categoryKey, categoryDisplay: info.categoryDisplay, childDisplay: info.childDisplay || toTitleCase(target), matchType: 'alias' };
  }

  // 3. Contains match — child keys and aliases
  for (const key of Object.keys(childKeyToCategory)) {
    if (key.length > 3 && lc.includes(key)) {
      const info = childKeyToCategory[key];
      return { childKey: key, ...info, matchType: 'contains' };
    }
  }
  for (const [alias, { target, categoryKey }] of Object.entries(aliasMap)) {
    if (alias.length > 3 && lc.includes(alias)) {
      const info = childKeyToCategory[target] || { categoryDisplay: getCatDisplay(categoryKey), childDisplay: toTitleCase(target) };
      return { childKey: target, categoryKey, categoryDisplay: info.categoryDisplay, childDisplay: info.childDisplay || toTitleCase(target), matchType: 'contains' };
    }
  }

  // 4. Fuzzy (Levenshtein, 82% threshold)
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
      const info = childKeyToCategory[target] || { categoryDisplay: getCatDisplay(categoryKey), childDisplay: toTitleCase(target) };
      return { childKey: target, categoryKey, categoryDisplay: info.categoryDisplay, childDisplay: info.childDisplay || toTitleCase(target), matchType: `fuzzy (${Math.round(bestSim*100)}%)` };
    } else {
      const info = childKeyToCategory[bestKey];
      return { childKey: bestKey, ...info, matchType: `fuzzy (${Math.round(bestSim*100)}%)` };
    }
  }

  return null;
}

function getCatDisplay(categoryKey) {
  const cat = MASTER_CONFIG.find(c => c.key === categoryKey);
  return cat ? cat.displayName : categoryKey;
}

// ─── TITLE CASE ───────────────────────────────────────────────────────────────

function toTitleCase(str) {
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .replace(/\bIskcon\b/gi, 'ISKCON');
}

// ─── UNKNOWN CHECK ────────────────────────────────────────────────────────────

function isUnknownValue(lc) {
  const unknownRaw = new Set(['unknown','none','no','blank','empty','null','','n/a','n.a.','nil','nill','-']);
  return unknownRaw.has(lc);
}

// ─── COUNT VALID LINES ────────────────────────────────────────────────────────

function countValidLines(text) {
  if (!text) return 0;
  let count = 0;
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    const lcRaw = t.toLowerCase().replace(/^iskcon\s+/i, '').trim();
    if (SKIP_SET.has(lcRaw) || SKIP_SET.has(t.toLowerCase())) continue;
    const cleaned = cleanLine(t);
    if (!cleaned) continue;
    if (SKIP_SET.has(cleaned.toLowerCase())) continue;
    count++;
  }
  return count;
}

// ─── INPUT META LISTENERS ─────────────────────────────────────────────────────

function updateMeta(id, text) {
  const count = countValidLines(text);
  const el = getSafeElement(id);
  el.textContent = count === 0 ? '—' : `${count} valid line${count !== 1 ? 's' : ''} detected`;
}

['input1','input2','input3'].forEach((id, i) => {
  try {
    const el = getSafeElement(id);
    el.addEventListener('input', () => updateMeta(`meta${i+1}`, el.value));
  } catch(e) { console.error(e); }
});

// ─── PROCESS INPUTS ───────────────────────────────────────────────────────────

function parseLines(text) {
  return text.split('\n').map(l => l.trim()).filter(l => l !== '');
}

function processInputs(t1, t2, t3) {
  // Category counts: categoryKey → count
  const catCount = {};
  for (const cat of MASTER_CONFIG) catCount[cat.key] = 0;

  // Sub-location counts: childKey|displayName → count
  const subCount = {};
  // Map from childKey to display name (for known items)
  const childDisplayMap = {};

  const adminItems = [];
  const rawRows = [];

  // Build childDisplayMap from config
  for (const cat of MASTER_CONFIG) {
    for (const child of cat.children) {
      childDisplayMap[child.key] = child.display;
    }
  }

  function processLine(raw, forceOutside, source) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const lcRaw = trimmed.toLowerCase().replace(/^iskcon\s+/i,'').trim();
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

    // Check unknown first
    if (isUnknownValue(cleanedLc)) {
      categoryKey = 'unknown';
      categoryDisplay = 'Unknown';
      // map to best unknown child
      const unknownRawMap = {
        'unknown': 'unknown', 'none': 'none', 'no': 'no',
        'blank': 'blank', 'empty': 'empty', 'null': 'null',
        '': 'unknown', '-': '-', 'n/a': 'na', 'n.a.': 'na',
        'nil': 'none', 'nill': 'none',
      };
      childKey = unknownRawMap[cleanedLc] || 'unknown';
      childDisplay = childDisplayMap[childKey] || toTitleCase(cleaned);
      matchType = 'exact';
    } else if (forceOutside) {
      categoryKey = 'outside';
      categoryDisplay = 'Outside Delhi / Haryana / NCR';
      // still try alias for clean display
      const match = matchToCanonical(cleaned);
      if (match && match.categoryKey === 'outside') {
        childKey = match.childKey;
        childDisplay = match.childDisplay;
        matchType = match.matchType + ' (forced outside)';
      } else {
        // Use cleaned display; store by display name
        childKey = null;
        childDisplay = toTitleCase(cleaned);
        matchType = 'forced outside';
      }
    } else {
      const match = matchToCanonical(cleaned);
      if (match) {
        childKey = match.childKey;
        categoryKey = match.categoryKey;
        categoryDisplay = match.categoryDisplay;
        childDisplay = match.childDisplay;
        matchType = match.matchType;
      } else {
        // Falls to Outside
        categoryKey = 'outside';
        categoryDisplay = 'Outside Delhi / Haryana / NCR';
        childKey = null;
        childDisplay = toTitleCase(cleaned);
        matchType = 'unmatched → outside';
      }
    }

    catCount[categoryKey]++;

    // Sub-location tracking
    const subKey = childKey || childDisplay;
    subCount[subKey] = (subCount[subKey] || 0) + 1;
    // Remember display for subKey
    if (childKey && !childDisplayMap[childKey]) childDisplayMap[childKey] = childDisplay;
    if (!childKey) childDisplayMap[childDisplay] = childDisplay;

    const isFuzzy = matchType.includes('fuzzy');
    const isContains = matchType.includes('contains');
    const isUnmatchedGeneral = matchType === 'unmatched → outside';
    if (isFuzzy || isContains || isUnmatchedGeneral) {
      adminItems.push({ original: trimmed, cleaned, display: childDisplay, category: categoryDisplay || getCatDisplay(categoryKey), matchType, source });
    }

    rawRows.push({ original: trimmed, cleaned, display: childDisplay, category: categoryDisplay || getCatDisplay(categoryKey), source, matchType });
  }

  parseLines(t1).forEach(l => processLine(l, false, 'Offering Collection'));
  parseLines(t2).forEach(l => processLine(l, false, 'Website Offering'));
  parseLines(t3).forEach(l => processLine(l, true,  'Out of India'));

  const total = MASTER_CONFIG.reduce((s, c) => s + catCount[c.key], 0);

  return { catCount, subCount, childDisplayMap, adminItems, rawRows, total };
}

// ─── BUILD FINAL REPORT ──────────────────────────────────────────────────────

function buildFinalReport(catCount, total) {
  const ordered = MASTER_CONFIG
    .filter(c => c.inSummary)
    .sort((a, b) => a.summaryOrder - b.summaryOrder);

  let html = '';
  for (const cat of ordered) {
    const cnt = catCount[cat.key];
    if (!cnt) continue;
    html += `<div class="report-row">
      <span class="r-loc">${cat.displayName}</span>
      <span class="r-count">${cnt}</span>
    </div>`;
  }
  html += `<div class="report-row total-row">
    <span class="r-loc">TOTAL OFFERINGS</span>
    <span class="r-count">${total}</span>
  </div>`;
  getSafeElement('final-report').innerHTML = html;
}

// ─── BUILD BREAKDOWN ─────────────────────────────────────────────────────────
// Dynamically built from MASTER_CONFIG

function buildBreakdown(subCount, childDisplayMap, catCount) {
  // All child keys that belong to known non-outside, non-unknown categories
  const knownChildKeys = new Set();
  for (const cat of MASTER_CONFIG) {
    if (cat.key === 'outside' || cat.key === 'unknown') continue;
    for (const child of cat.children) knownChildKeys.add(child.key);
  }

  let html = '';

  for (const cat of MASTER_CONFIG) {
    if (!cat.inBreakdown) continue;
    const total = catCount[cat.key];
    if (!total) continue;

    let rows = [];

    if (cat.key === 'outside') {
      // Gather all subCount keys not in knownChildKeys and not unknown
      const unknownKeys = new Set(unknownCategory.children.map(c => c.key));
      for (const [key, cnt] of Object.entries(subCount)) {
        if (!knownChildKeys.has(key) && !unknownKeys.has(key)) {
          // exclude unknown display keys too
          const isUnk = unknownCategory.children.some(c => c.display === key);
          if (!isUnk) {
            rows.push([childDisplayMap[key] || key, cnt]);
          }
        }
      }
    } else if (cat.key === 'unknown') {
      for (const child of cat.children) {
        if (subCount[child.key]) rows.push([child.display, subCount[child.key]]);
      }
      // Also capture display-key entries (if any stored by display name)
      for (const [key, cnt] of Object.entries(subCount)) {
        const matchChild = cat.children.find(c => c.display === key && !c.key);
        if (matchChild) rows.push([matchChild.display, cnt]);
      }
    } else {
      for (const child of cat.children) {
        if (subCount[child.key]) rows.push([child.display, subCount[child.key]]);
      }
    }

    rows.sort((a, b) => b[1] - a[1]);

    const rowsHtml = rows.map(([loc, cnt]) =>
      `<div class="bd-row">
        <span class="bd-loc">${loc}</span>
        <span class="bd-count">${cnt}</span>
      </div>`).join('');

    if (!rowsHtml && !cat.isParent) continue;

    html += `<div class="breakdown-group">
      <div class="breakdown-group-title">${cat.displayName} Breakdown — Total: ${total}</div>
      ${rowsHtml || '<div style="color:var(--dim);font-size:0.8rem">No sub-location data.</div>'}
    </div>`;
  }

  getSafeElement('full-breakdown').innerHTML =
    html || '<div style="color:var(--muted)">No sub-location data.</div>';
}

// ─── BUILD CARDS ─────────────────────────────────────────────────────────────

function buildCards(catCount, total, adminCount) {
  const topCat = MASTER_CONFIG
    .filter(c => c.inSummary)
    .reduce((best, c) => catCount[c.key] > (catCount[best.key] || 0) ? c : best, MASTER_CONFIG[0]);

  const defs = [
    { label: 'Total Offerings',              value: total,                           cls: 'card-orange', sub: 'All inputs combined' },
    { label: 'East of Kailash',              value: catCount['east_of_kailash'],     cls: 'card-gold',   sub: '' },
    { label: 'Punjabi Bagh',                 value: catCount['punjabi_bagh'],        cls: 'card-sky',    sub: '' },
    { label: 'Haryana',                      value: catCount['haryana'],             cls: 'card-teal',   sub: '10 sub-locations' },
    { label: 'Outside Delhi / Haryana / NCR',value: catCount['outside'],            cls: 'card-lotus',  sub: '' },
    { label: 'Unknown',                      value: catCount['unknown'],             cls: 'card-gold',   sub: '' },
    { label: 'Top Category',                 value: topCat.displayName,             cls: 'card-orange', sub: `${catCount[topCat.key]} offerings`, isText: true },
    { label: 'Admin Review',                 value: adminCount,                      cls: 'card-lotus',  sub: 'Items needing verification' },
  ];

  const grid = getSafeElement('cards-grid');
  grid.innerHTML = defs.map(d => `
    <div class="card ${d.cls}">
      <div class="card-label">${d.label}</div>
      <div class="card-value ${d.isText ? 'card-value-text' : ''}">${d.isText ? d.value : (d.value||0).toLocaleString()}</div>
      ${d.sub ? `<div class="card-sub">${d.sub}</div>` : ''}
    </div>`).join('');
}

// ─── BUILD ADMIN REVIEW ───────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildAdminReview(adminItems) {
  const sec = getSafeElement('admin-section');
  const listEl = getSafeElement('admin-list');
  if (!adminItems.length) { sec.style.display = 'none'; return; }

  sec.style.display = '';
  getSafeElement('admin-header-text').textContent =
    `${adminItems.length} item${adminItems.length !== 1 ? 's' : ''} auto-assigned — verify if needed`;

  const rows = adminItems.map(item => {
    let badgeClass = 'badge-outside';
    if (item.matchType.startsWith('fuzzy')) badgeClass = 'badge-fuzzy';
    else if (item.matchType.includes('alias')) badgeClass = 'badge-alias';
    else if (item.matchType.includes('contains')) badgeClass = 'badge-contains';
    return `<tr>
      <td style="color:var(--muted);max-width:180px;word-break:break-word">${escHtml(item.original)}</td>
      <td>${escHtml(item.cleaned)}</td>
      <td><strong>${escHtml(item.display)}</strong></td>
      <td>${escHtml(item.category)}</td>
      <td><span class="badge ${badgeClass}">${escHtml(item.matchType)}</span></td>
      <td style="color:var(--dim)">${escHtml(item.source)}</td>
    </tr>`;
  }).join('');

  listEl.innerHTML = `
    <table class="admin-table">
      <thead><tr>
        <th>Original Input</th><th>Cleaned</th><th>Canonical Name</th>
        <th>Category</th><th>Match Type</th><th>Source</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ─── CHARTS ──────────────────────────────────────────────────────────────────

const CHART_COLORS = ['#f4860a','#e8c14a','#4ca8f5','#3ecfb2','#d94f7e','#a78bfa','#fb923c','#34d399','#f472b6','#60a5fa'];

function destroyCharts() {
  [barChartInst, pieChartInst, outsideChartInst].forEach(c => { if (c) c.destroy(); });
  barChartInst = pieChartInst = outsideChartInst = null;
}

function toggleChartState(canvasId, emptyId, showCanvas, message = '') {
  const canvas = getSafeElement(canvasId);
  const empty = getSafeElement(emptyId);
  if (showCanvas) {
    canvas.classList.remove('hidden');
    empty.classList.add('hidden');
    empty.textContent = '';
  } else {
    canvas.classList.add('hidden');
    empty.classList.remove('hidden');
    empty.textContent = message;
  }
}

function showChartErrorState(message) {
  const msg = `Charts unavailable: ${message}`;
  toggleChartState('barChart','barChartEmpty',false,msg);
  toggleChartState('pieChart','pieChartEmpty',false,msg);
  toggleChartState('outsideChart','outsideChartEmpty',false,msg);
}

function buildCharts(catCount, subCount, childDisplayMap) {
  destroyCharts();

  if (typeof Chart === 'undefined') {
    showChartErrorState('Chart.js not loaded.');
    return;
  }

  const summaryCats = MASTER_CONFIG
    .filter(c => c.inSummary)
    .sort((a,b) => a.summaryOrder - b.summaryOrder)
    .filter(c => catCount[c.key] > 0);

  const cats = summaryCats.map(c => c.displayName);
  const vals = summaryCats.map(c => catCount[c.key]);

  toggleChartState('barChart','barChartEmpty',true);
  toggleChartState('pieChart','pieChartEmpty',true);

  const gridOpts   = { color: 'rgba(255,255,255,0.06)' };
  const tickOpts   = { color: '#8b90aa', font: { size: 11 } };
  const legendOpts = { labels: { color: '#e8e9f0', font: { size: 11 }, boxWidth: 12 } };

  barChartInst = new Chart(getSafeElement('barChart'), {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [{ data: vals, backgroundColor: CHART_COLORS.slice(0, cats.length), borderRadius: 6, borderSkipped: false }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} offerings` } } },
      scales: {
        x: { ticks: { ...tickOpts, maxRotation: 30 }, grid: gridOpts },
        y: { ticks: tickOpts, grid: gridOpts, beginAtZero: true },
      },
    },
  });

  pieChartInst = new Chart(getSafeElement('pieChart'), {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data: vals, backgroundColor: CHART_COLORS.slice(0, cats.length), borderWidth: 2, borderColor: '#1a1d27' }],
    },
    options: {
      responsive: true,
      plugins: { legend: { ...legendOpts, position: 'bottom' } },
    },
  });

  // Outside breakdown chart
  const knownChildKeysSet = new Set();
  for (const cat of MASTER_CONFIG) {
    if (cat.key !== 'outside' && cat.key !== 'unknown') {
      for (const child of cat.children) knownChildKeysSet.add(child.key);
    }
  }
  const unknownChildKeysArr = unknownCategory.children.map(c => c.key);

  const outsideEntries = [];
  for (const [key, cnt] of Object.entries(subCount)) {
    if (!knownChildKeysSet.has(key) && !unknownChildKeysArr.includes(key)) {
      const isUnkDisplay = unknownCategory.children.some(c => c.display === key);
      if (!isUnkDisplay) {
        outsideEntries.push([childDisplayMap[key] || key, cnt]);
      }
    }
  }
  outsideEntries.sort((a,b) => b[1]-a[1]);
  const top15 = outsideEntries.slice(0,15);

  if (top15.length) {
    toggleChartState('outsideChart','outsideChartEmpty',true);
    outsideChartInst = new Chart(getSafeElement('outsideChart'), {
      type: 'bar',
      data: {
        labels: top15.map(e => e[0]),
        datasets: [{ data: top15.map(e => e[1]), backgroundColor: '#4ca8f5', borderRadius: 4 }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: tickOpts, grid: gridOpts, beginAtZero: true },
          y: { ticks: { ...tickOpts, font: { size: 10 } }, grid: { display: false } },
        },
      },
    });
  } else {
    toggleChartState('outsideChart','outsideChartEmpty',false,'No Outside Delhi / Haryana / NCR entries.');
  }
}

// ─── MAIN CALCULATE ──────────────────────────────────────────────────────────

function calculateReport() {
  try {
    const t1 = getSafeElement('input1').value;
    const t2 = getSafeElement('input2').value;
    const t3 = getSafeElement('input3').value;

    if (!t1.trim() && !t2.trim() && !t3.trim()) {
      showToast('⚠️ Paste data in at least one input field.');
      return;
    }

    const result = processInputs(t1, t2, t3);
    lastResult = result;
    const { catCount, subCount, childDisplayMap, adminItems, total } = result;

    try {
      buildCards(catCount, total, adminItems.length);
      buildFinalReport(catCount, total);
      buildBreakdown(subCount, childDisplayMap, catCount);
      buildAdminReview(adminItems);
    } catch (renderError) {
      console.error('Render error:', renderError);
      showToast(`⚠️ Render error: ${renderError.message}`);
    }

    try {
      buildCharts(catCount, subCount, childDisplayMap);
    } catch (chartError) {
      console.error('Chart error:', chartError);
      showChartErrorState(chartError.message);
    }

    getSafeElement('results').classList.remove('hidden');
    getSafeElement('btn-copy-report').disabled = false;
    getSafeElement('btn-copy-breakdown').disabled = false;
    getSafeElement('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('✅ Report generated successfully!');

  } catch (error) {
    console.error('Calculation Error:', error);
    showToast(`❌ Error: ${error.message}`);
  }
}

// ─── COPY HELPERS ────────────────────────────────────────────────────────────

function copyFinalReport() {
  if (!lastResult) return;
  const { catCount, total } = lastResult;
  const ordered = MASTER_CONFIG.filter(c => c.inSummary).sort((a,b) => a.summaryOrder - b.summaryOrder);
  let text = 'Category-wise Offering Summary\n';
  text += '─'.repeat(44) + '\n';
  for (const cat of ordered) {
    const cnt = catCount[cat.key];
    if (!cnt) continue;
    text += `${cat.displayName.padEnd(30)}  ${String(cnt).padStart(6)}\n`;
  }
  text += '─'.repeat(44) + '\n';
  text += `${'TOTAL OFFERINGS'.padEnd(30)}  ${String(total).padStart(6)}\n`;
  navigator.clipboard.writeText(text).then(() => showToast('📋 Final report copied!'));
}

function copyFullBreakdown() {
  if (!lastResult) return;
  const { catCount, subCount, childDisplayMap } = lastResult;
  const ordered = MASTER_CONFIG.filter(c => c.inBreakdown).sort((a,b) => a.summaryOrder - b.summaryOrder);

  const knownChildKeysSet = new Set();
  for (const cat of MASTER_CONFIG) {
    if (cat.key !== 'outside' && cat.key !== 'unknown') {
      for (const child of cat.children) knownChildKeysSet.add(child.key);
    }
  }
  const unknownChildKeysArr = unknownCategory.children.map(c => c.key);

  let text = '';
  for (const cat of ordered) {
    const total = catCount[cat.key];
    if (!total) continue;

    text += `\n${cat.displayName} Breakdown\nTotal: ${total}\n\n`;

    let rows = [];
    if (cat.key === 'outside') {
      for (const [key, cnt] of Object.entries(subCount)) {
        if (!knownChildKeysSet.has(key) && !unknownChildKeysArr.includes(key)) {
          const isUnkDisplay = unknownCategory.children.some(c => c.display === key);
          if (!isUnkDisplay) rows.push([childDisplayMap[key] || key, cnt]);
        }
      }
    } else if (cat.key === 'unknown') {
      for (const child of cat.children) {
        if (subCount[child.key]) rows.push([child.display, subCount[child.key]]);
      }
    } else {
      for (const child of cat.children) {
        if (subCount[child.key]) rows.push([child.display, subCount[child.key]]);
      }
    }
    rows.sort((a,b) => b[1]-a[1]);

    for (const [loc, cnt] of rows) {
      text += `${loc.padEnd(30)}  ${String(cnt).padStart(6)}\n`;
    }
    text += '\n' + '─'.repeat(44) + '\n';
  }

  navigator.clipboard.writeText(text.trim()).then(() => showToast('📄 Breakdown copied!'));
}

// ─── CLEAR ───────────────────────────────────────────────────────────────────

function clearAll() {
  try {
    ['input1','input2','input3'].forEach(id => { getSafeElement(id).value = ''; });
    ['meta1','meta2','meta3'].forEach(id => { getSafeElement(id).textContent = '—'; });
    getSafeElement('results').classList.add('hidden');
    ['btn-copy-report','btn-copy-breakdown'].forEach(id => {
      getSafeElement(id).disabled = true;
    });
    destroyCharts();
    lastResult = null;
    showToast('🗑 All cleared.');
  } catch (error) {
    console.error('Clear Error:', error);
    showToast(`❌ Error: ${error.message}`);
  }
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

let toastTimer = null;
function showToast(msg) {
  const t = getSafeElement('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
}

// ─── GLOBAL EXPORTS ───────────────────────────────────────────────────────────
window.calculateReport  = calculateReport;
window.clearAll         = clearAll;
window.copyFinalReport  = copyFinalReport;
window.copyFullBreakdown = copyFullBreakdown;
