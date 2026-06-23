/* =============================================
   Offering Collection Management System
   script.js — v3.0
   - Comprehensive alias / normalisation mapping
   - Levenshtein fuzzy matching (85 %+ threshold)
   - Admin Review with match-type detail
   - No Previous Day feature
   - All data processed locally
   ============================================= */

'use strict';

// ─── CATEGORIES (display order) ──────────────────────────────────────────────

const CATEGORIES = [
  'East of Kailash',
  'Punjabi Bagh',
  'Rohini',
  'Gurgaon',
  'Delhi Dwarka',
  'Faridabad',
  'Ghaziabad',
  'Noida',
  'Chhipiwada',
  'Outside Delhi',
];

// ─── CANONICAL NAMES & THEIR CATEGORY ────────────────────────────────────────
// Key = canonical key (lowercase), Value = { display, category }

const CANONICAL = {
  // East of Kailash group
  'east of kailash':  { display: 'East of Kailash',  category: 'East of Kailash' },
  'aya nagar':        { display: 'Aya Nagar',         category: 'East of Kailash' },
  'ber sarai':        { display: 'Ber Sarai',          category: 'East of Kailash' },
  'chhatarpur':       { display: 'Chhatarpur',         category: 'East of Kailash' },
  'katwaria sarai':   { display: 'Katwaria Sarai',     category: 'East of Kailash' },
  'lado sarai':       { display: 'Lado Sarai',         category: 'East of Kailash' },
  'mahipalpur':       { display: 'Mahipalpur',         category: 'East of Kailash' },
  'mehrauli':         { display: 'Mehrauli',           category: 'East of Kailash' },
  'sultanpur':        { display: 'Sultanpur',          category: 'East of Kailash' },
  'malviya nagar':    { display: 'Malviya Nagar',      category: 'East of Kailash' },
  'sarojini nagar':   { display: 'Sarojini Nagar',     category: 'East of Kailash' },

  // Punjabi Bagh
  'punjabi bagh':     { display: 'Punjabi Bagh',       category: 'Punjabi Bagh' },

  // Rohini
  'rohini':           { display: 'Rohini',             category: 'Rohini' },

  // Gurgaon group
  'gurugram':         { display: 'Gurugram',           category: 'Gurgaon' },
  'badshahpur':       { display: 'Badshahpur',         category: 'Gurgaon' },

  // Delhi Dwarka
  'dwarka':           { display: 'Dwarka',             category: 'Delhi Dwarka' },

  // Faridabad
  'faridabad':        { display: 'Faridabad',          category: 'Faridabad' },

  // Ghaziabad
  'ghaziabad':        { display: 'Ghaziabad',          category: 'Ghaziabad' },

  // Noida
  'noida':            { display: 'Noida',              category: 'Noida' },

  // Chhipiwada
  'chhipiwada':       { display: 'Chhipiwada',         category: 'Chhipiwada' },

  // Known Outside Delhi locations (so they get clean display names instead of raw input)
  'ahmedabad':        { display: 'Ahmedabad',          category: 'Outside Delhi' },
  'atlanta':          { display: 'Atlanta',            category: 'Outside Delhi' },
  'baroda':           { display: 'Baroda',             category: 'Outside Delhi' },
  'vadodara':         { display: 'Vadodara',           category: 'Outside Delhi' },
  'boston':           { display: 'Boston',             category: 'Outside Delhi' },
  'chandigarh':       { display: 'Chandigarh',         category: 'Outside Delhi' },
  'chennai':          { display: 'Chennai',            category: 'Outside Delhi' },
  'coimbatore':       { display: 'Coimbatore',         category: 'Outside Delhi' },
  'dehradun':         { display: 'Dehradun',           category: 'Outside Delhi' },
  'devasadan mandir': { display: 'Devasadan Mandir',   category: 'Outside Delhi' },
  'detroit':          { display: 'Detroit',            category: 'Outside Delhi' },
  'hisar':            { display: 'Hisar',              category: 'Outside Delhi' },
  'hyderabad':        { display: 'Hyderabad',          category: 'Outside Delhi' },
  'indore':           { display: 'Indore',             category: 'Outside Delhi' },
  'jaipur':           { display: 'Jaipur',             category: 'Outside Delhi' },
  'jalandhar':        { display: 'Jalandhar',          category: 'Outside Delhi' },
  'jajpur':           { display: 'Jajpur',             category: 'Outside Delhi' },
  'jodhpur':          { display: 'Jodhpur',            category: 'Outside Delhi' },
  'amritsar':         { display: 'Amritsar',           category: 'Outside Delhi' },
  'kanpur':           { display: 'Kanpur',             category: 'Outside Delhi' },
  'kharghar':         { display: 'Kharghar',           category: 'Outside Delhi' },
  'kolkata':          { display: 'Kolkata',            category: 'Outside Delhi' },
  'kurukshetra':      { display: 'Kurukshetra',        category: 'Outside Delhi' },
  'mayapur':          { display: 'Mayapur',            category: 'Outside Delhi' },
  'meerut':           { display: 'Meerut',             category: 'Outside Delhi' },
  'mumbai (juhu)':    { display: 'Mumbai (Juhu)',       category: 'Outside Delhi' },
  'panipat':          { display: 'Panipat',            category: 'Outside Delhi' },
  'prayagraj':        { display: 'Prayagraj',          category: 'Outside Delhi' },
  'pune':             { display: 'Pune',               category: 'Outside Delhi' },
  'pune nvcc':        { display: 'Pune NVCC',          category: 'Outside Delhi' },
  'rudrapur':         { display: 'Rudrapur',           category: 'Outside Delhi' },
  'sahibabad':        { display: 'Sahibabad',          category: 'Outside Delhi' },
  'shimla':           { display: 'Shimla',             category: 'Outside Delhi' },
  'sirsa':            { display: 'Sirsa',              category: 'Outside Delhi' },
  'tadepalligudem':   { display: 'Tadepalligudem',     category: 'Outside Delhi' },
  'thiruvananthapuram':{ display: 'Thiruvananthapuram',category: 'Outside Delhi' },
  'valsad':           { display: 'Valsad',             category: 'Outside Delhi' },
  'varanasi':         { display: 'Varanasi',           category: 'Outside Delhi' },
  'vrindavan':        { display: 'Vrindavan',          category: 'Outside Delhi' },
  'whitefield':       { display: 'Whitefield',         category: 'Outside Delhi' },
  'yamuna nagar':     { display: 'Yamuna Nagar',       category: 'Outside Delhi' },
  'bahadurgarh':      { display: 'Bahadurgarh',        category: 'Outside Delhi' },
};

// ─── ALIAS MAP  →  canonical key ─────────────────────────────────────────────
// All aliases lowercase, strips ISKCON prefix before lookup

const ALIAS_MAP = {
  // East of Kailash
  'iskcon delhi sri sri radha parthasarathi mandir sant nagar': 'east of kailash',
  'sri sri radha parthasarathi mandir': 'east of kailash',
  'sant nagar': 'east of kailash',
  'radha parthasarathi mandir': 'east of kailash',

  // Punjabi Bagh
  'panjabi bagh': 'punjabi bagh',
  'sri sri radha radhanath mandir': 'punjabi bagh',
  'radha radhanath mandir': 'punjabi bagh',

  // Rohini
  // (direct match sufficient)

  // Gurgaon
  'gurgaon': 'gurugram',
  'iskcon gurgaon': 'gurugram',

  // Badshahpur
  'badshapur': 'badshahpur',
  'iskcon badshahpur': 'badshahpur',
  'iskcon badshapur': 'badshahpur',

  // Delhi Dwarka
  'dwaraka': 'dwarka',
  'dvaraka': 'dwarka',
  'iskcon dwaraka': 'dwarka',
  'iskcon dvaraka': 'dwarka',
  'delhi dwarka': 'dwarka',

  // Faridabad
  // (direct after prefix strip)

  // Ghaziabad
  'gaziabad': 'ghaziabad',
  'iskcon gaziabad': 'ghaziabad',

  // Chhipiwada
  'chippiwara': 'chhipiwada',
  'chippiwada': 'chhipiwada',
  'chhippiwada': 'chhipiwada',
  'iskcon chippiwara': 'chhipiwada',
  'iskcon chippiwada': 'chhipiwada',

  // Sarojini Nagar
  'sarojni nagar': 'sarojini nagar',
  'sarojini nagar centre': 'sarojini nagar',
  'sarojni nagar centre': 'sarojini nagar',

  // Bahadurgarh
  'bhadurgarh': 'bahadurgarh',
  'bahadur garh': 'bahadurgarh',
  'iskcon bhadurgarh': 'bahadurgarh',

  // Mumbai (Juhu)
  'mumbai juhu': 'mumbai (juhu)',
  'mumbai(juhu)': 'mumbai (juhu)',
  'iskcon mumbai juhu': 'mumbai (juhu)',
  'iskcon mumbai(juhu)': 'mumbai (juhu)',
  'iskcon mumbai (juhu)': 'mumbai (juhu)',

  // Kharghar
  'mumbai kharghar': 'kharghar',
  'navi mumbai': 'kharghar',
  'navi mumbai kharghar': 'kharghar',
  'iskcon kharghar': 'kharghar',
  'iskcon navi mumbai': 'kharghar',

  // Ahmedabad
  'iskcon ahmedabad satellite': 'ahmedabad',
  'iskcon ahmedabad': 'ahmedabad',
  'sri sri radha madana mohan satellite': 'ahmedabad',
  'radha madana mohan': 'ahmedabad',

  // Boston
  'iskcon of boston': 'boston',
  'new gundica temple': 'boston',
  'new gundica': 'boston',

  // Yamuna Nagar
  'yammuna nagar': 'yamuna nagar',
  'iskcon yamuna nagar': 'yamuna nagar',
  'iskcon yammuna nagar': 'yamuna nagar',

  // Tadepalligudem
  'sravan keertana bhavan tadepalligudem': 'tadepalligudem',
  'iskcon sravan keertana bhavan tadepalligudem': 'tadepalligudem',
  'sravan keertana bhavan': 'tadepalligudem',

  // Hisar
  'hissar': 'hisar',

  // Devasadan
  'devasadan': 'devasadan mandir',

  // Prayagraj
  'allahabad': 'prayagraj',
};

// ─── HEADING / NOISE LINES TO SKIP ───────────────────────────────────────────

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

// ─── INPUT META ───────────────────────────────────────────────────────────────

function updateMeta(id, text) {
  const lines = text.split('\n').filter(l => l.trim() !== '').length;
  document.getElementById(id).textContent =
    lines === 0 ? '—' : `${lines} line${lines !== 1 ? 's' : ''} pasted`;
}

['input1', 'input2', 'input3'].forEach((id, i) => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => updateMeta(`meta${i + 1}`, el.value));
});

// ─── LEVENSHTEIN DISTANCE ─────────────────────────────────────────────────────

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
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

// ─── CLEAN A SINGLE RAW LINE ──────────────────────────────────────────────────

function cleanLine(raw) {
  let s = raw.trim();

  // Collapse multiple spaces
  s = s.replace(/\s+/g, ' ');

  // Remove "also referred to as..." and similar parenthetical descriptions
  s = s.replace(/\(also referred to as[^)]*\)/gi, '').trim();
  s = s.replace(/\(also known as[^)]*\)/gi, '').trim();

  // Remove ISKCON prefix variants (case-insensitive)
  s = s.replace(/^ISKCON\s+of\s+/i, '');
  s = s.replace(/^ISKCON\s+Delhi\s+/i, '');
  s = s.replace(/^ISKCON\s+/i, '');
  s = s.replace(/^Iskcon\s+/i, '');

  // Normalise brackets around Juhu style: Mumbai(Juhu) → Mumbai (Juhu)
  s = s.replace(/\((\w)/g, ' ($1');
  s = s.replace(/\s+\(/g, ' (').trim();

  // Remove trailing/leading Centre/Center/Mandir/Temple ONLY as suffix
  // (keep if it's the only word or meaningful part)
  s = s.replace(/\s+(centre|center|mandir|temple)$/i, '').trim();

  // Collapse spaces again after removals
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

// ─── MATCH A CLEANED STRING TO A CANONICAL KEY ───────────────────────────────
// Returns { canonicalKey, matchType } or null

function matchToCanonical(cleaned) {
  const lc = cleaned.toLowerCase();

  // 1. Direct canonical match
  if (CANONICAL[lc]) return { canonicalKey: lc, matchType: 'exact' };

  // 2. Alias match
  if (ALIAS_MAP[lc]) return { canonicalKey: ALIAS_MAP[lc], matchType: 'alias' };

  // 3. Contains match — check if lc contains a canonical key or alias key
  for (const key of Object.keys(CANONICAL)) {
    if (key.length > 3 && lc.includes(key)) {
      return { canonicalKey: key, matchType: 'contains' };
    }
  }
  for (const [alias, canon] of Object.entries(ALIAS_MAP)) {
    if (alias.length > 3 && lc.includes(alias)) {
      return { canonicalKey: canon, matchType: 'contains' };
    }
  }

  // 4. Fuzzy match against canonical keys + alias targets (85 % threshold)
  let bestKey = null;
  let bestSim = 0;
  const THRESHOLD = 0.82;

  for (const key of Object.keys(CANONICAL)) {
    const sim = similarity(lc, key);
    if (sim > bestSim) { bestSim = sim; bestKey = key; }
  }
  for (const alias of Object.keys(ALIAS_MAP)) {
    const sim = similarity(lc, alias);
    if (sim > bestSim) { bestSim = sim; bestKey = ALIAS_MAP[alias]; }
  }

  if (bestSim >= THRESHOLD && bestKey) {
    return { canonicalKey: bestKey, matchType: `fuzzy (${Math.round(bestSim * 100)}%)` };
  }

  return null;
}

// ─── PROCESS INPUTS ───────────────────────────────────────────────────────────

function parseLines(text) {
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => l !== '');
}

function processInputs(t1, t2, t3) {
  // category totals
  const catCount = {};
  CATEGORIES.forEach(c => (catCount[c] = 0));

  // sub-location counts: canonicalKey → count
  const subCount = {};

  // admin review items (fuzzy + unmatched outside delhi)
  const adminItems = []; // { original, cleaned, canonical, display, category, matchType, source }

  // raw data rows for export
  const rawRows = [];

  function processLine(raw, forceOutside, source) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Check if it's a heading/noise line (before cleaning)
    const lcRaw = trimmed.toLowerCase().replace(/^iskcon\s+/i, '').trim();
    if (SKIP_SET.has(lcRaw) || SKIP_SET.has(trimmed.toLowerCase())) return;

    const cleaned = cleanLine(trimmed);
    if (!cleaned) return;

    const cleanedLc = cleaned.toLowerCase();
    if (SKIP_SET.has(cleanedLc)) return;

    let canonicalKey = null;
    let matchType = 'unmatched';
    let display = toTitleCase(cleaned);
    let category = 'Outside Delhi';

    if (forceOutside) {
      // Input 3: force Outside Delhi but still try to get a clean display name
      const match = matchToCanonical(cleaned);
      if (match) {
        canonicalKey = match.canonicalKey;
        display = CANONICAL[canonicalKey]?.display || toTitleCase(cleaned);
        matchType = match.matchType + ' (forced outside)';
      } else {
        display = toTitleCase(cleaned);
        matchType = 'forced outside';
      }
      category = 'Outside Delhi';
    } else {
      const match = matchToCanonical(cleaned);
      if (match) {
        canonicalKey = match.canonicalKey;
        const info = CANONICAL[canonicalKey];
        display = info?.display || toTitleCase(cleaned);
        category = info?.category || 'Outside Delhi';
        matchType = match.matchType;
      } else {
        display = toTitleCase(cleaned);
        category = 'Outside Delhi';
        matchType = 'unmatched → outside';
      }
    }

    // Increment counts
    catCount[category]++;
    if (canonicalKey) {
      subCount[canonicalKey] = (subCount[canonicalKey] || 0) + 1;
    } else {
      subCount[display] = (subCount[display] || 0) + 1;
    }

    // Flag for admin review if fuzzy, contains (ambiguous), or unmatched
    const isFuzzy = matchType.startsWith('fuzzy');
    const isUnmatched = matchType.startsWith('unmatched');
    const isForcedOutside = matchType.includes('forced outside') && !matchType.includes('exact');

    if (isFuzzy || isUnmatched || (isForcedOutside && !matchType.includes('alias') && !matchType.includes('exact'))) {
      adminItems.push({ original: trimmed, cleaned, display, category, matchType, source });
    }

    rawRows.push({ original: trimmed, cleaned, display, category, source, matchType });
  }

  parseLines(t1).forEach(l => processLine(l, false, 'Offering Collection'));
  parseLines(t2).forEach(l => processLine(l, false, 'Website Offering'));
  parseLines(t3).forEach(l => processLine(l, true,  'Out of India'));

  const total = CATEGORIES.reduce((s, c) => s + catCount[c], 0);

  return { catCount, subCount, adminItems, rawRows, total };
}

// ─── TITLE CASE ───────────────────────────────────────────────────────────────

function toTitleCase(str) {
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .replace(/\bIskcon\b/gi, 'ISKCON');
}

// ─── BUILD FINAL REPORT ──────────────────────────────────────────────────────

function buildFinalReport(catCount, total) {
  let html = '';
  CATEGORIES.forEach(cat => {
    const cnt = catCount[cat];
    if (cnt === 0) return;
    html += `<div class="report-row">
      <span class="r-loc">${cat}</span>
      <span class="r-count">${cnt}</span>
    </div>`;
  });
  html += `<div class="report-row total-row">
    <span class="r-loc">TOTAL OFFERINGS</span>
    <span class="r-count">${total}</span>
  </div>`;
  document.getElementById('final-report').innerHTML = html;
}

// ─── BUILD BREAKDOWN ─────────────────────────────────────────────────────────

function buildBreakdown(subCount) {
  const EOK_LOCS = [
    'east of kailash','aya nagar','ber sarai','chhatarpur','katwaria sarai',
    'lado sarai','mahipalpur','mehrauli','sultanpur','malviya nagar','sarojini nagar',
  ];
  const GURGAON_LOCS = ['gurugram','badshahpur'];
  const DWARKA_LOCS  = ['dwarka'];
  const CHHIPI_LOCS  = ['chhipiwada'];

  function group(title, keys) {
    const rows = keys
      .filter(k => subCount[k])
      .map(k => `<div class="bd-row">
        <span class="bd-loc">${CANONICAL[k]?.display || k}</span>
        <span class="bd-count">${subCount[k]}</span>
      </div>`).join('');
    if (!rows) return '';
    return `<div class="breakdown-group">
      <div class="breakdown-group-title">${title}</div>
      ${rows}
    </div>`;
  }

  let html = '';
  html += group('East of Kailash Breakdown', EOK_LOCS);
  html += group('Gurgaon Breakdown', GURGAON_LOCS);
  html += group('Delhi Dwarka Breakdown', DWARKA_LOCS);
  html += group('Chhipiwada Breakdown', CHHIPI_LOCS);

  // Outside Delhi — all keys not in known canonical subloc lists
  const knownSubkeys = new Set([...EOK_LOCS, ...GURGAON_LOCS, ...DWARKA_LOCS, ...CHHIPI_LOCS,
    'punjabi bagh','rohini','faridabad','ghaziabad','noida']);

  // Gather outside-delhi entries: everything with category Outside Delhi
  const outsideEntries = [];
  for (const [key, cnt] of Object.entries(subCount)) {
    // If key is a canonical key and category = Outside Delhi
    if (CANONICAL[key] && CANONICAL[key].category === 'Outside Delhi') {
      outsideEntries.push([CANONICAL[key].display, cnt]);
    } else if (!CANONICAL[key] && !knownSubkeys.has(key)) {
      // Display key as-is (was stored with toTitleCase display)
      outsideEntries.push([key, cnt]);
    }
  }

  outsideEntries.sort((a, b) => b[1] - a[1]);

  if (outsideEntries.length) {
    const rows = outsideEntries.map(([loc, cnt]) =>
      `<div class="bd-row">
        <span class="bd-loc">${loc}</span>
        <span class="bd-count">${cnt}</span>
      </div>`).join('');
    html += `<div class="breakdown-group">
      <div class="breakdown-group-title">Outside Delhi Breakdown</div>
      ${rows}
    </div>`;
  }

  document.getElementById('full-breakdown').innerHTML =
    html || '<div style="color:var(--muted)">No sub-location data.</div>';
}

// ─── BUILD CARDS ─────────────────────────────────────────────────────────────

function buildCards(catCount, total, adminCount) {
  const topCat = CATEGORIES.reduce((best, c) =>
    catCount[c] > (catCount[best] || 0) ? c : best, CATEGORIES[0]);

  const defs = [
    { label: 'Total Offerings',   value: total,                      cls: 'card-orange', sub: 'All inputs combined' },
    { label: 'East of Kailash',   value: catCount['East of Kailash'],cls: 'card-gold',   sub: '11 sub-locations' },
    { label: 'Punjabi Bagh',      value: catCount['Punjabi Bagh'],   cls: 'card-sky',    sub: '' },
    { label: 'Rohini',            value: catCount['Rohini'],         cls: 'card-teal',   sub: '' },
    { label: 'Gurgaon',           value: catCount['Gurgaon'],        cls: 'card-lotus',  sub: 'Gurugram + Badshahpur' },
    { label: 'Delhi Dwarka',      value: catCount['Delhi Dwarka'],   cls: 'card-sky',    sub: '' },
    { label: 'Outside Delhi',     value: catCount['Outside Delhi'],  cls: 'card-gold',   sub: 'Incl. Input 3' },
    { label: 'Top Category',      value: topCat,                     cls: 'card-orange', sub: `${catCount[topCat]} offerings`, isText: true },
    { label: 'Admin Review',      value: adminCount,                 cls: 'card-lotus',  sub: 'Items needing verification' },
  ];

  const grid = document.getElementById('cards-grid');
  grid.innerHTML = defs.map(d => `
    <div class="card ${d.cls}">
      <div class="card-label">${d.label}</div>
      <div class="card-value ${d.isText ? 'card-value-text' : ''}">${d.isText ? d.value : d.value.toLocaleString()}</div>
      ${d.sub ? `<div class="card-sub">${d.sub}</div>` : ''}
    </div>`).join('');
}

// ─── BUILD ADMIN REVIEW ───────────────────────────────────────────────────────

function buildAdminReview(adminItems) {
  const sec = document.getElementById('admin-section');
  const listEl = document.getElementById('admin-list');

  if (!adminItems.length) {
    sec.style.display = 'none';
    return;
  }

  sec.style.display = '';
  document.getElementById('admin-header-text').textContent =
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
      <thead>
        <tr>
          <th>Original Input</th>
          <th>Cleaned</th>
          <th>Canonical Name</th>
          <th>Category</th>
          <th>Match Type</th>
          <th>Source</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── CHARTS ──────────────────────────────────────────────────────────────────

const CHART_COLORS = ['#f4860a','#e8c14a','#4ca8f5','#3ecfb2','#d94f7e','#a78bfa','#fb923c','#34d399','#f472b6','#60a5fa'];

function destroyCharts() {
  [barChartInst, pieChartInst, outsideChartInst].forEach(c => { if (c) c.destroy(); });
  barChartInst = pieChartInst = outsideChartInst = null;
}

function buildCharts(catCount, subCount) {
  destroyCharts();

  const cats = CATEGORIES.filter(c => catCount[c] > 0);
  const vals = cats.map(c => catCount[c]);

  const gridOpts = { color: 'rgba(255,255,255,0.06)' };
  const tickOpts = { color: '#8b90aa', font: { size: 11 } };
  const legendOpts = { labels: { color: '#e8e9f0', font: { size: 11 }, boxWidth: 12 } };

  // Bar
  barChartInst = new Chart(document.getElementById('barChart'), {
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

  // Doughnut
  pieChartInst = new Chart(document.getElementById('pieChart'), {
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

  // Outside Delhi breakdown chart
  const outsideEntries = [];
  for (const [key, cnt] of Object.entries(subCount)) {
    if (CANONICAL[key] && CANONICAL[key].category === 'Outside Delhi') {
      outsideEntries.push([CANONICAL[key].display, cnt]);
    } else if (!CANONICAL[key]) {
      const knownInner = new Set(['east of kailash','aya nagar','ber sarai','chhatarpur','katwaria sarai',
        'lado sarai','mahipalpur','mehrauli','sultanpur','malviya nagar','sarojini nagar',
        'punjabi bagh','rohini','gurugram','badshahpur','dwarka','faridabad','ghaziabad','noida','chhipiwada']);
      if (!knownInner.has(key.toLowerCase())) {
        outsideEntries.push([key, cnt]);
      }
    }
  }
  outsideEntries.sort((a, b) => b[1] - a[1]);
  const top15 = outsideEntries.slice(0, 15);

  const outsideCtx = document.getElementById('outsideChart');
  if (top15.length) {
    outsideChartInst = new Chart(outsideCtx, {
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
    outsideCtx.parentElement.innerHTML = `<div class="chart-title">Outside Delhi — Top Locations</div><div style="color:var(--muted);padding:32px;text-align:center;font-size:.85rem;">No Outside Delhi entries.</div>`;
  }
}

// ─── MAIN CALCULATE ──────────────────────────────────────────────────────────

function calculateReport() {
  const t1 = document.getElementById('input1').value;
  const t2 = document.getElementById('input2').value;
  const t3 = document.getElementById('input3').value;

  if (!t1.trim() && !t2.trim() && !t3.trim()) {
    showToast('⚠️ Paste data in at least one input field.');
    return;
  }

  const result = processInputs(t1, t2, t3);
  lastResult = result;
  const { catCount, subCount, adminItems, total } = result;

  buildCards(catCount, total, adminItems.length);
  buildFinalReport(catCount, total);
  buildBreakdown(subCount);
  buildCharts(catCount, subCount);
  buildAdminReview(adminItems);

  document.getElementById('results').classList.remove('hidden');
  ['btn-copy-report','btn-copy-breakdown','btn-excel','btn-pdf'].forEach(id => {
    document.getElementById(id).disabled = false;
  });

  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('✅ Report generated successfully!');
}

// ─── COPY HELPERS ────────────────────────────────────────────────────────────

function copyFinalReport() {
  if (!lastResult) return;
  const { catCount, total } = lastResult;
  let text = 'Category-wise Offering Summary\n';
  text += '─'.repeat(36) + '\n';
  CATEGORIES.forEach(cat => {
    if (catCount[cat] > 0)
      text += `${cat.padEnd(22)}  ${catCount[cat]}\n`;
  });
  text += '─'.repeat(36) + '\n';
  text += `${'TOTAL OFFERINGS'.padEnd(22)}  ${total}\n`;
  navigator.clipboard.writeText(text).then(() => showToast('📋 Final report copied!'));
}

function copyFullBreakdown() {
  if (!lastResult) return;
  const el = document.getElementById('full-breakdown');
  const tmp = document.createElement('div');
  tmp.innerHTML = el.innerHTML;
  navigator.clipboard.writeText(tmp.innerText || tmp.textContent)
    .then(() => showToast('📄 Breakdown copied!'));
}

// ─── EXCEL EXPORT ────────────────────────────────────────────────────────────

function downloadExcel() {
  if (!lastResult) return;
  const { catCount, subCount, adminItems, rawRows, total } = lastResult;
  const wb = XLSX.utils.book_new();

  // Summary
  const summaryData = [['Category', 'Count']];
  CATEGORIES.forEach(c => summaryData.push([c, catCount[c]]));
  summaryData.push(['', '']);
  summaryData.push(['TOTAL OFFERINGS', total]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

  // East of Kailash
  const eokKeys = ['east of kailash','aya nagar','ber sarai','chhatarpur','katwaria sarai',
    'lado sarai','mahipalpur','mehrauli','sultanpur','malviya nagar','sarojini nagar'];
  const eokData = [['Location', 'Count']];
  eokKeys.forEach(k => eokData.push([CANONICAL[k]?.display || k, subCount[k] || 0]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(eokData), 'East of Kailash');

  // Other Breakdowns
  const otherData = [['Category', 'Sub-Location', 'Count']];
  [
    { cat: 'Gurgaon',      keys: ['gurugram','badshahpur'] },
    { cat: 'Delhi Dwarka', keys: ['dwarka'] },
    { cat: 'Chhipiwada',   keys: ['chhipiwada'] },
  ].forEach(({ cat, keys }) => {
    keys.forEach(k => {
      if (subCount[k]) otherData.push([cat, CANONICAL[k]?.display || k, subCount[k]]);
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(otherData), 'Other Breakdowns');

  // Outside Delhi
  const outsideData = [['Location', 'Count']];
  const knownInner = new Set(['east of kailash','aya nagar','ber sarai','chhatarpur','katwaria sarai',
    'lado sarai','mahipalpur','mehrauli','sultanpur','malviya nagar','sarojini nagar',
    'punjabi bagh','rohini','gurugram','badshahpur','dwarka','faridabad','ghaziabad','noida','chhipiwada']);
  const outsideEntries = [];
  for (const [key, cnt] of Object.entries(subCount)) {
    if (CANONICAL[key] && CANONICAL[key].category === 'Outside Delhi') {
      outsideEntries.push([CANONICAL[key].display, cnt]);
    } else if (!CANONICAL[key] && !knownInner.has(key.toLowerCase())) {
      outsideEntries.push([key, cnt]);
    }
  }
  outsideEntries.sort((a,b)=>b[1]-a[1]).forEach(([loc, cnt]) => outsideData.push([loc, cnt]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(outsideData), 'Outside Delhi');

  // Admin Review
  const adminData = [['Original Input', 'Cleaned', 'Canonical Name', 'Category', 'Match Type', 'Source']];
  adminItems.forEach(item => adminData.push([item.original, item.cleaned, item.display, item.category, item.matchType, item.source]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(adminData), 'Admin Review');

  // Raw Data
  const rawData = [['Source', 'Original', 'Cleaned', 'Canonical Name', 'Category', 'Match Type']];
  rawRows.forEach(r => rawData.push([r.source, r.original, r.cleaned, r.display, r.category, r.matchType]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rawData), 'Raw Data');

  const today = new Date().toISOString().slice(0,10);
  XLSX.writeFile(wb, `Offering_Report_${today}.xlsx`);
  showToast('📊 Excel downloaded!');
}

// ─── PDF EXPORT ──────────────────────────────────────────────────────────────

function downloadPDF() {
  if (!lastResult) return;
  const { catCount, subCount, adminItems, total } = lastResult;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  let y = 18;

  doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('Offering Collection Report', 14, y); y += 6;
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.setTextColor(120); doc.text(`Generated: ${today}`, 14, y); doc.setTextColor(0); y += 10;

  // Summary
  doc.autoTable({
    startY: y,
    head: [['Category', 'Count']],
    body: [...CATEGORIES.map(c => [c, catCount[c]]), ['TOTAL OFFERINGS', total]],
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [244, 134, 10] },
    didParseCell: data => {
      if (data.row.index === CATEGORIES.length) data.cell.styles.fontStyle = 'bold';
    },
  });
  y = doc.lastAutoTable.finalY + 12;

  // EoK breakdown
  const eokKeys = ['east of kailash','aya nagar','ber sarai','chhatarpur','katwaria sarai',
    'lado sarai','mahipalpur','mehrauli','sultanpur','malviya nagar','sarojini nagar'];
  const eokRows = eokKeys.filter(k => subCount[k]).map(k => [CANONICAL[k]?.display || k, subCount[k]]);
  if (eokRows.length) {
    if (y > 240) { doc.addPage(); y = 18; }
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text('East of Kailash Breakdown', 14, y); y += 2;
    doc.autoTable({ startY: y, head: [['Location','Count']], body: eokRows, styles: { fontSize: 9 }, headStyles: { fillColor: [62,207,178] } });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Other breakdowns
  [
    { title: 'Gurgaon Breakdown',      keys: ['gurugram','badshahpur'] },
    { title: 'Delhi Dwarka Breakdown', keys: ['dwarka'] },
    { title: 'Chhipiwada Breakdown',   keys: ['chhipiwada'] },
  ].forEach(({ title, keys }) => {
    const rows = keys.filter(k => subCount[k]).map(k => [CANONICAL[k]?.display || k, subCount[k]]);
    if (!rows.length) return;
    if (y > 240) { doc.addPage(); y = 18; }
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text(title, 14, y); y += 2;
    doc.autoTable({ startY: y, head: [['Location','Count']], body: rows, styles: { fontSize: 9 }, headStyles: { fillColor: [76,168,245] } });
    y = doc.lastAutoTable.finalY + 10;
  });

  // Outside Delhi
  const knownInner = new Set(['east of kailash','aya nagar','ber sarai','chhatarpur','katwaria sarai',
    'lado sarai','mahipalpur','mehrauli','sultanpur','malviya nagar','sarojini nagar',
    'punjabi bagh','rohini','gurugram','badshahpur','dwarka','faridabad','ghaziabad','noida','chhipiwada']);
  const outsideRows = [];
  for (const [key, cnt] of Object.entries(subCount)) {
    if (CANONICAL[key] && CANONICAL[key].category === 'Outside Delhi') outsideRows.push([CANONICAL[key].display, cnt]);
    else if (!CANONICAL[key] && !knownInner.has(key.toLowerCase())) outsideRows.push([key, cnt]);
  }
  outsideRows.sort((a,b)=>b[1]-a[1]);
  if (outsideRows.length) {
    if (y > 220) { doc.addPage(); y = 18; }
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text('Outside Delhi Breakdown', 14, y); y += 2;
    doc.autoTable({ startY: y, head: [['Location','Count']], body: outsideRows, styles: { fontSize: 9 }, headStyles: { fillColor: [217,79,126] } });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Admin Review
  if (adminItems.length) {
    if (y > 200) { doc.addPage(); y = 18; }
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text('Admin Review — Items Requiring Verification', 14, y); y += 2;
    doc.autoTable({
      startY: y,
      head: [['Original', 'Canonical Name', 'Category', 'Match Type']],
      body: adminItems.map(i => [i.original, i.display, i.category, i.matchType]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [217,79,126] },
    });
  }

  const dateStr = new Date().toISOString().slice(0,10);
  doc.save(`Offering_Report_${dateStr}.pdf`);
  showToast('📑 PDF downloaded!');
}

// ─── CLEAR ───────────────────────────────────────────────────────────────────

function clearAll() {
  ['input1','input2','input3'].forEach(id => { document.getElementById(id).value = ''; });
  ['meta1','meta2','meta3'].forEach(id => { document.getElementById(id).textContent = '—'; });
  document.getElementById('results').classList.add('hidden');
  ['btn-copy-report','btn-copy-breakdown','btn-excel','btn-pdf'].forEach(id => {
    document.getElementById(id).disabled = true;
  });
  destroyCharts();
  lastResult = null;
  showToast('🗑 All cleared.');
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
}
