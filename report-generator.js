/* =============================================
   Offering Collection Management System
   report-generator.js — HTML Report Builders
   ============================================= */

'use strict';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getSafeElement(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`DOM element #${id} missing.`);
  return el;
}

// ─── OUTSIDE ROWS HELPER ──────────────────────────────────────────────────────
// Returns [display, count][] for Outside category (excludes known NCR / unknown)

function getOutsideRows(subCount, childDisplayMap) {
  const knownChildKeysSet = new Set();
  for (const cat of MASTER_CONFIG) {
    if (cat.key !== 'outside' && cat.key !== 'unknown') {
      for (const child of cat.children) knownChildKeysSet.add(child.key);
    }
  }
  const unknownChildKeysArr = new Set(unknownCategory.children.map(c => c.key));

  const rows = [];
  for (const [key, cnt] of Object.entries(subCount)) {
    if (!knownChildKeysSet.has(key) && !unknownChildKeysArr.has(key)) {
      const isUnkDisplay = unknownCategory.children.some(c => c.display === key);
      if (!isUnkDisplay) {
        rows.push([childDisplayMap[key] || toTitleCase(key), cnt]);
      }
    }
  }
  // Deduplicate by display name (merge same display with different keys)
  const merged = new Map();
  for (const [display, cnt] of rows) {
    merged.set(display, (merged.get(display) || 0) + cnt);
  }
  return [...merged.entries()].sort((a, b) => b[1] - a[1]);
}

// ─── BUILD CARDS ─────────────────────────────────────────────────────────────

function buildCards(catCount, total, adminCount) {
  const topCat = MASTER_CONFIG
    .filter(c => c.inSummary && catCount[c.key] > 0)
    .sort((a, b) => catCount[b.key] - catCount[a.key])[0] || MASTER_CONFIG[0];

  const defs = [
    { label: 'Total Offerings',               value: total,                        cls: 'card-orange', sub: 'All inputs combined' },
    { label: 'East of Kailash',               value: catCount['east_of_kailash'],  cls: 'card-gold',   sub: '' },
    { label: 'Punjabi Bagh',                  value: catCount['punjabi_bagh'],     cls: 'card-sky',    sub: '' },
    { label: 'Haryana',                       value: catCount['haryana'],          cls: 'card-teal',   sub: '10 sub-locations' },
    { label: 'Outside Delhi / Haryana / NCR', value: catCount['outside'],          cls: 'card-lotus',  sub: '' },
    { label: 'Unknown',                       value: catCount['unknown'],          cls: 'card-gold',   sub: '' },
    { label: 'Top Category',                  value: topCat.displayName,          cls: 'card-orange', sub: `${catCount[topCat.key]} offerings`, isText: true },
    { label: 'Admin Review',                  value: adminCount,                   cls: 'card-lotus',  sub: 'Items needing verification' },
  ];

  getSafeElement('cards-grid').innerHTML = defs.map(d => `
    <div class="card ${d.cls}">
      <div class="card-label">${escHtml(d.label)}</div>
      <div class="card-value ${d.isText ? 'card-value-text' : ''}">${
        d.isText ? escHtml(d.value) : (d.value || 0).toLocaleString()
      }</div>
      ${d.sub ? `<div class="card-sub">${escHtml(d.sub)}</div>` : ''}
    </div>`).join('');
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
      <span class="r-loc">${escHtml(cat.displayName)}</span>
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

function buildBreakdown(subCount, childDisplayMap, catCount) {
  let html = '';

  for (const cat of MASTER_CONFIG) {
    if (!cat.inBreakdown) continue;
    const total = catCount[cat.key];
    if (!total) continue;

    let rows = [];

    if (cat.key === 'outside') {
      rows = getOutsideRows(subCount, childDisplayMap);
    } else if (cat.key === 'unknown') {
      for (const child of cat.children) {
        if (subCount[child.key]) rows.push([child.display, subCount[child.key]]);
      }
      rows.sort((a, b) => b[1] - a[1]);
    } else {
      for (const child of cat.children) {
        if (subCount[child.key]) rows.push([child.display, subCount[child.key]]);
      }
      rows.sort((a, b) => b[1] - a[1]);
    }

    const rowsHtml = rows.map(([loc, cnt]) =>
      `<div class="bd-row">
        <span class="bd-loc">${escHtml(loc)}</span>
        <span class="bd-count">${cnt}</span>
      </div>`).join('');

    if (!rowsHtml && !cat.isParent) continue;

    html += `<div class="breakdown-group">
      <div class="breakdown-group-title">${escHtml(cat.displayName)} Breakdown — Total: ${total}</div>
      ${rowsHtml || '<div style="color:var(--dim);font-size:0.8rem">No sub-location data.</div>'}
    </div>`;
  }

  getSafeElement('full-breakdown').innerHTML =
    html || '<div style="color:var(--muted)">No sub-location data.</div>';
}

// ─── BUILD ADMIN REVIEW ───────────────────────────────────────────────────────

function buildAdminReview(adminItems) {
  const sec = getSafeElement('admin-section');
  const listEl = getSafeElement('admin-list');

  if (!adminItems.length) {
    sec.style.display = 'none';
    return;
  }

  sec.style.display = '';
  getSafeElement('admin-header-text').textContent =
    `${adminItems.length} item${adminItems.length !== 1 ? 's' : ''} auto-assigned — verify if needed`;

  const rows = adminItems.map(item => {
    let badgeClass = 'badge-outside';
    if (item.matchType.startsWith('fuzzy'))       badgeClass = 'badge-fuzzy';
    else if (item.matchType.includes('alias'))     badgeClass = 'badge-alias';
    else if (item.matchType.includes('contains'))  badgeClass = 'badge-contains';
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

// ─── BUILD VALIDATION WARNINGS ───────────────────────────────────────────────

function buildValidationWarnings(warnings) {
  const existingWarn = document.getElementById('validation-warn');
  if (existingWarn) existingWarn.remove();
  if (!warnings.length) return;

  const section = document.createElement('section');
  section.id = 'validation-warn';
  section.className = 'section';
  section.style.borderColor = 'rgba(217,79,126,0.4)';
  section.innerHTML = `
    <h2 class="section-title">⚠️ Validation Warnings</h2>
    <div style="font-family:monospace;font-size:0.82rem;color:var(--lotus);line-height:2">
      ${warnings.map(w => `<div>⚠ ${escHtml(w)}</div>`).join('')}
    </div>`;

  const results = document.getElementById('results');
  results.insertBefore(section, results.firstChild);
}
