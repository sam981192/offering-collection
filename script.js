/* =============================================
   Offering Collection Management System
   script.js — v2.0 (no previous-day feature)
   ============================================= */

'use strict';

// ─── CATEGORY & LOCATION MAPPING ────────────────────────────────────────────

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

// canonical name → category
const LOCATION_MAP = {
  // East of Kailash group
  'east of kailash': 'East of Kailash',
  'aya nagar':       'East of Kailash',
  'ber sarai':       'East of Kailash',
  'chhatarpur':      'East of Kailash',
  'katwaria sarai':  'East of Kailash',
  'lado sarai':      'East of Kailash',
  'mahipalpur':      'East of Kailash',
  'mehrauli':        'East of Kailash',
  'sultanpur':       'East of Kailash',
  'malviya nagar':   'East of Kailash',
  'sarojini nagar':  'East of Kailash',

  // Punjabi Bagh
  'punjabi bagh': 'Punjabi Bagh',

  // Rohini
  'rohini': 'Rohini',

  // Gurgaon
  'gurugram':    'Gurgaon',
  'gurgaon':     'Gurgaon',
  'badshahpur':  'Gurgaon',

  // Delhi Dwarka
  'dwarka':       'Delhi Dwarka',
  'delhi dwarka': 'Delhi Dwarka',

  // Faridabad
  'faridabad': 'Faridabad',

  // Ghaziabad
  'ghaziabad': 'Ghaziabad',

  // Noida
  'noida': 'Noida',

  // Chhipiwada
  'chhipiwada': 'Chhipiwada',
};

// spelling normalisations → canonical key (lowercase)
const SPELLING_NORM = {
  'sarojni nagar':   'sarojini nagar',
  'gurugram':        'gurugram',
  'gurgaon':         'gurugram',   // treat both as same sub-loc under Gurgaon
};

// canonical display names for sub-locations
const CANONICAL_DISPLAY = {
  'east of kailash': 'East of Kailash',
  'aya nagar':       'Aya Nagar',
  'ber sarai':       'Ber Sarai',
  'chhatarpur':      'Chhatarpur',
  'katwaria sarai':  'Katwaria Sarai',
  'lado sarai':      'Lado Sarai',
  'mahipalpur':      'Mahipalpur',
  'mehrauli':        'Mehrauli',
  'sultanpur':       'Sultanpur',
  'malviya nagar':   'Malviya Nagar',
  'sarojini nagar':  'Sarojini Nagar',
  'punjabi bagh':    'Punjabi Bagh',
  'rohini':          'Rohini',
  'gurugram':        'Gurugram',
  'badshahpur':      'Badshahpur',
  'dwarka':          'Dwarka',
  'faridabad':       'Faridabad',
  'ghaziabad':       'Ghaziabad',
  'noida':           'Noida',
  'chhipiwada':      'Chhipiwada',
};

// headings/noise words to skip
const SKIP_WORDS = new Set([
  'city', 'temple', 'mandir', 'location', 'center', 'centre',
  'temple / mandir', 'name', 'offering', 'offerings', 'date', 'sl no',
  'sl.no', 's.no', 'sr.no', 'sr', 'no', 's no',
]);

// ─── GLOBAL STATE ────────────────────────────────────────────────────────────

let barChartInst = null;
let pieChartInst = null;
let outsideChartInst = null;
let lastResult = null;

// ─── INPUT METADATA ──────────────────────────────────────────────────────────

function updateMeta(id, text) {
  const lines = text.split('\n').filter(l => l.trim() !== '').length;
  document.getElementById(id).textContent =
    lines === 0 ? '—' : `${lines} line${lines !== 1 ? 's' : ''} pasted`;
}

['input1', 'input2', 'input3'].forEach((id, i) => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => updateMeta(`meta${i + 1}`, el.value));
});

// ─── PARSE & CATEGORISE ──────────────────────────────────────────────────────

function normKey(raw) {
  let k = raw.trim().toLowerCase();
  // strip "iskcon " prefix for matching
  k = k.replace(/^iskcon\s+/, '');
  // apply spelling normalisation
  return SPELLING_NORM[k] !== undefined ? SPELLING_NORM[k] : k;
}

function parseLines(text) {
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => l !== '' && !SKIP_WORDS.has(l.toLowerCase().replace(/^iskcon\s+/, '')));
}

function processInputs(t1, t2, t3) {
  // category totals
  const catCount = {};
  CATEGORIES.forEach(c => (catCount[c] = 0));

  // sub-location counts
  const subCount = {}; // canonical key → count

  // unknown locations (go to Outside Delhi)
  const unknownCount = {}; // display name → count

  function processLine(raw, forceOutside) {
    const key = normKey(raw);
    if (SKIP_WORDS.has(key)) return;

    if (forceOutside) {
      const display = raw.trim();
      unknownCount[display] = (unknownCount[display] || 0) + 1;
      catCount['Outside Delhi']++;
      return;
    }

    const cat = LOCATION_MAP[key];
    if (cat) {
      catCount[cat]++;
      subCount[key] = (subCount[key] || 0) + 1;
    } else {
      // unknown → Outside Delhi
      const display = raw.trim();
      unknownCount[display] = (unknownCount[display] || 0) + 1;
      catCount['Outside Delhi']++;
    }
  }

  parseLines(t1).forEach(l => processLine(l, false));
  parseLines(t2).forEach(l => processLine(l, false));
  parseLines(t3).forEach(l => processLine(l, true));

  const total = CATEGORIES.reduce((s, c) => s + catCount[c], 0);

  return { catCount, subCount, unknownCount, total };
}

// ─── REPORT BUILDERS ─────────────────────────────────────────────────────────

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

function buildBreakdown(subCount, unknownCount) {
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
        <span class="bd-loc">${CANONICAL_DISPLAY[k] || k}</span>
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

  // Outside Delhi — sorted descending
  const outsideEntries = Object.entries(unknownCount).sort((a, b) => b[1] - a[1]);
  if (outsideEntries.length) {
    const rows = outsideEntries.map(([loc, cnt]) =>
      `<div class="bd-row"><span class="bd-loc">${loc}</span><span class="bd-count">${cnt}</span></div>`
    ).join('');
    html += `<div class="breakdown-group">
      <div class="breakdown-group-title">Outside Delhi Breakdown</div>
      ${rows}
    </div>`;
  }

  document.getElementById('full-breakdown').innerHTML = html || '<div style="color:var(--muted)">No sub-location data.</div>';
}

// ─── DASHBOARD CARDS ─────────────────────────────────────────────────────────

function buildCards(catCount, total) {
  const topCat = CATEGORIES.reduce((best, c) =>
    catCount[c] > (catCount[best] || 0) ? c : best, CATEGORIES[0]);

  const defs = [
    { label: 'Total Offerings',  value: total,                    cls: 'card-orange', sub: 'All inputs combined' },
    { label: 'East of Kailash',  value: catCount['East of Kailash'], cls: 'card-gold',   sub: '11 sub-locations' },
    { label: 'Punjabi Bagh',     value: catCount['Punjabi Bagh'],  cls: 'card-sky',    sub: '' },
    { label: 'Rohini',           value: catCount['Rohini'],        cls: 'card-teal',   sub: '' },
    { label: 'Gurgaon',          value: catCount['Gurgaon'],       cls: 'card-lotus',  sub: 'Gurugram + Badshahpur' },
    { label: 'Delhi Dwarka',     value: catCount['Delhi Dwarka'],  cls: 'card-sky',    sub: '' },
    { label: 'Outside Delhi',    value: catCount['Outside Delhi'], cls: 'card-gold',   sub: 'Incl. Input 3' },
    { label: 'Top Category',     value: topCat,                   cls: 'card-orange', sub: `${catCount[topCat]} offerings`, isText: true },
  ];

  const grid = document.getElementById('cards-grid');
  grid.innerHTML = defs.map(d => `
    <div class="card ${d.cls}">
      <div class="card-label">${d.label}</div>
      <div class="card-value ${d.isText ? 'card-value-text' : ''}">${d.isText ? d.value : d.value.toLocaleString()}</div>
      ${d.sub ? `<div class="card-sub">${d.sub}</div>` : ''}
    </div>`).join('');
}

// ─── CHARTS ──────────────────────────────────────────────────────────────────

const CHART_COLORS = ['#f4860a','#e8c14a','#4ca8f5','#3ecfb2','#d94f7e','#a78bfa','#fb923c','#34d399','#f472b6','#60a5fa'];

function destroyCharts() {
  [barChartInst, pieChartInst, outsideChartInst].forEach(c => { if (c) c.destroy(); });
  barChartInst = pieChartInst = outsideChartInst = null;
}

function buildCharts(catCount, unknownCount) {
  destroyCharts();

  const cats = CATEGORIES.filter(c => catCount[c] > 0);
  const vals = cats.map(c => catCount[c]);

  const gridOpts = {
    color: 'rgba(255,255,255,0.06)',
  };
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

  // Pie / Doughnut
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

  // Outside Delhi breakdown
  const outsideEntries = Object.entries(unknownCount).sort((a, b) => b[1] - a[1]).slice(0, 15);
  if (outsideEntries.length) {
    outsideChartInst = new Chart(document.getElementById('outsideChart'), {
      type: 'bar',
      data: {
        labels: outsideEntries.map(e => e[0]),
        datasets: [{ data: outsideEntries.map(e => e[1]), backgroundColor: '#4ca8f5', borderRadius: 4 }],
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
    const ctx = document.getElementById('outsideChart');
    ctx.parentElement.innerHTML = `<div class="chart-title">Outside Delhi — Location Breakdown</div><div style="color:var(--muted);padding:32px;text-align:center;font-size:.85rem;">No Outside Delhi entries.</div>`;
  }
}

// ─── UNKNOWN LOCATIONS ───────────────────────────────────────────────────────

function buildUnknown(unknownCount) {
  const sec = document.getElementById('unknown-section');
  const list = document.getElementById('unknown-list');
  const entries = Object.entries(unknownCount).sort((a, b) => b[1] - a[1]);
  if (!entries.length) { sec.style.display = 'none'; return; }
  sec.style.display = '';
  list.innerHTML = entries.map(([loc, cnt]) =>
    `<div class="bd-row"><span class="bd-loc">${loc}</span><span class="bd-count">${cnt}</span></div>`
  ).join('');
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
  const { catCount, subCount, unknownCount, total } = result;

  buildCards(catCount, total);
  buildFinalReport(catCount, total);
  buildBreakdown(subCount, unknownCount);
  buildCharts(catCount, unknownCount);
  buildUnknown(unknownCount);

  document.getElementById('results').classList.remove('hidden');
  ['btn-copy-report','btn-copy-breakdown','btn-excel','btn-pdf'].forEach(id => {
    document.getElementById(id).disabled = false;
  });

  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('✅ Report generated successfully!');
}

// ─── COPY HELPERS ────────────────────────────────────────────────────────────

function getTextFromEl(id) {
  const el = document.getElementById(id);
  // strip html → plain text
  const tmp = document.createElement('div');
  tmp.innerHTML = el.innerHTML;
  return tmp.innerText || tmp.textContent;
}

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
  navigator.clipboard.writeText(getTextFromEl('full-breakdown'))
    .then(() => showToast('📄 Breakdown copied!'));
}

// ─── EXCEL EXPORT ────────────────────────────────────────────────────────────

function downloadExcel() {
  if (!lastResult) return;
  const { catCount, subCount, unknownCount, total } = lastResult;
  const wb = XLSX.utils.book_new();

  // --- Summary sheet ---
  const summaryData = [['Category', 'Count']];
  CATEGORIES.forEach(c => summaryData.push([c, catCount[c]]));
  summaryData.push(['', '']);
  summaryData.push(['TOTAL OFFERINGS', total]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

  // --- East of Kailash sheet ---
  const eokKeys = ['east of kailash','aya nagar','ber sarai','chhatarpur','katwaria sarai',
    'lado sarai','mahipalpur','mehrauli','sultanpur','malviya nagar','sarojini nagar'];
  const eokData = [['Location', 'Count']];
  eokKeys.forEach(k => eokData.push([CANONICAL_DISPLAY[k] || k, subCount[k] || 0]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(eokData), 'East of Kailash');

  // --- Other Breakdowns sheet ---
  const otherData = [['Category', 'Sub-Location', 'Count']];
  [
    { cat: 'Gurgaon',      keys: ['gurugram','badshahpur'] },
    { cat: 'Delhi Dwarka', keys: ['dwarka'] },
    { cat: 'Chhipiwada',   keys: ['chhipiwada'] },
  ].forEach(({ cat, keys }) => {
    keys.forEach(k => {
      if (subCount[k]) otherData.push([cat, CANONICAL_DISPLAY[k] || k, subCount[k]]);
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(otherData), 'Other Breakdowns');

  // --- Outside Delhi sheet ---
  const outsideData = [['Location', 'Count']];
  Object.entries(unknownCount).sort((a,b)=>b[1]-a[1]).forEach(([loc, cnt]) => outsideData.push([loc, cnt]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(outsideData), 'Outside Delhi');

  // --- Raw Data sheet ---
  const t1 = document.getElementById('input1').value;
  const t2 = document.getElementById('input2').value;
  const t3 = document.getElementById('input3').value;
  const rawData = [['Source', 'Raw Line']];
  parseLines(t1).forEach(l => rawData.push(['Offering Collection', l]));
  parseLines(t2).forEach(l => rawData.push(['Website Offering', l]));
  parseLines(t3).forEach(l => rawData.push(['Out of India', l]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rawData), 'Raw Data');

  const today = new Date().toISOString().slice(0,10);
  XLSX.writeFile(wb, `Offering_Report_${today}.xlsx`);
  showToast('📊 Excel downloaded!');
}

// ─── PDF EXPORT ──────────────────────────────────────────────────────────────

function downloadPDF() {
  if (!lastResult) return;
  const { catCount, subCount, unknownCount, total } = lastResult;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  let y = 18;

  // Title
  doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('Offering Collection Report', 14, y); y += 6;
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.setTextColor(120); doc.text(`Generated: ${today}`, 14, y); doc.setTextColor(0); y += 10;

  // Summary table
  doc.autoTable({
    startY: y,
    head: [['Category', 'Count']],
    body: [
      ...CATEGORIES.map(c => [c, catCount[c]]),
      ['TOTAL OFFERINGS', total],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [244, 134, 10] },
    foot: [],
    didParseCell: data => {
      if (data.row.index === CATEGORIES.length) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });
  y = doc.lastAutoTable.finalY + 12;

  // EoK breakdown
  const eokKeys = ['east of kailash','aya nagar','ber sarai','chhatarpur','katwaria sarai',
    'lado sarai','mahipalpur','mehrauli','sultanpur','malviya nagar','sarojini nagar'];
  const eokRows = eokKeys.filter(k => subCount[k]).map(k => [CANONICAL_DISPLAY[k] || k, subCount[k]]);
  if (eokRows.length) {
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text('East of Kailash Breakdown', 14, y); y += 2;
    doc.autoTable({ startY: y, head: [['Location','Count']], body: eokRows, styles: { fontSize: 9 }, headStyles: { fillColor: [62,207,178] } });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Other breakdowns
  const others = [
    { title: 'Gurgaon Breakdown',      keys: ['gurugram','badshahpur'] },
    { title: 'Delhi Dwarka Breakdown', keys: ['dwarka'] },
    { title: 'Chhipiwada Breakdown',   keys: ['chhipiwada'] },
  ];
  others.forEach(({ title, keys }) => {
    const rows = keys.filter(k => subCount[k]).map(k => [CANONICAL_DISPLAY[k] || k, subCount[k]]);
    if (!rows.length) return;
    if (y > 240) { doc.addPage(); y = 18; }
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text(title, 14, y); y += 2;
    doc.autoTable({ startY: y, head: [['Location','Count']], body: rows, styles: { fontSize: 9 }, headStyles: { fillColor: [76,168,245] } });
    y = doc.lastAutoTable.finalY + 10;
  });

  // Outside Delhi
  const outsideRows = Object.entries(unknownCount).sort((a,b)=>b[1]-a[1]);
  if (outsideRows.length) {
    if (y > 220) { doc.addPage(); y = 18; }
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text('Outside Delhi Breakdown', 14, y); y += 2;
    doc.autoTable({ startY: y, head: [['Location','Count']], body: outsideRows, styles: { fontSize: 9 }, headStyles: { fillColor: [217,79,126] } });
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
