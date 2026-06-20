/* =============================================
   Offering Collection Management System
   script.js
   ============================================= */

"use strict";

// =============================================
// CONFIGURATION
// =============================================

const IGNORE_LINES = new Set([
  "city", "temple", "temple / mandir", "temple/mandir",
  "mandir", "location", "centre", "center", "temple name", ""
]);

// Normalization: raw value → canonical name
const NORMALIZE_MAP = [
  // East of Kailash group
  { patterns: ["east of kailash", "iskcon east of kailash"], canonical: "East of Kailash" },
  // Punjabi Bagh
  { patterns: ["punjabi bagh", "iskcon punjabi bagh"], canonical: "Punjabi Bagh" },
  // Rohini
  { patterns: ["rohini", "iskcon rohini"], canonical: "Rohini" },
  // Dwarka
  { patterns: ["dwarka", "dwaraka", "iskcon dwarka", "iskcon dwaraka"], canonical: "Dwarka" },
  // Gurugram
  { patterns: ["gurugram", "gurgaon", "iskcon gurugram", "iskcon gurgaon"], canonical: "Gurugram" },
  // Badshahpur
  { patterns: ["badshahpur", "iskcon badshahpur"], canonical: "Badshahpur" },
  // Chhatarpur
  { patterns: ["chhatarpur", "chattarpur", "chhattarpur", "iskcon chhatarpur"], canonical: "Chhatarpur" },
  // Chhipiwada
  { patterns: ["chhipiwada", "chippiwara", "iskcon chippiwara", "iskcon chhipiwada", "chhippiwada"], canonical: "Chhipiwada" },
  // Hisar
  { patterns: ["hisar", "hissar"], canonical: "Hisar" },
  // Mumbai Juhu
  { patterns: ["mumbai(juhu)", "mumbai (juhu)", "iskcon mumbai(juhu)", "iskcon mumbai (juhu)", "mumbai juhu"], canonical: "Mumbai (Juhu)" },
  // Aya Nagar
  { patterns: ["aya nagar", "ayanagar"], canonical: "Aya Nagar" },
  // Ber Sarai
  { patterns: ["ber sarai", "bersarai"], canonical: "Ber Sarai" },
  // Katwaria Sarai
  { patterns: ["katwaria sarai", "katwariasarai"], canonical: "Katwaria Sarai" },
  // Lado Sarai
  { patterns: ["lado sarai", "ladosarai"], canonical: "Lado Sarai" },
  // Mahipalpur
  { patterns: ["mahipalpur"], canonical: "Mahipalpur" },
  // Mehrauli
  { patterns: ["mehrauli"], canonical: "Mehrauli" },
  // Sultanpur
  { patterns: ["sultanpur"], canonical: "Sultanpur" },
  // Faridabad
  { patterns: ["faridabad", "iskcon faridabad"], canonical: "Faridabad" },
  // Ghaziabad
  { patterns: ["ghaziabad", "iskcon ghaziabad"], canonical: "Ghaziabad" },
  // Noida
  { patterns: ["noida", "iskcon noida"], canonical: "Noida" },
];

// Build lookup table for fast normalizing
const NORM_LOOKUP = {};
for (const entry of NORMALIZE_MAP) {
  for (const p of entry.patterns) {
    NORM_LOOKUP[p.toLowerCase()] = entry.canonical;
  }
}

// Final category mapping: canonical → category
const CATEGORY_MAP = {
  // East of Kailash
  "East of Kailash":  "East of Kailash",
  "Aya Nagar":        "East of Kailash",
  "Ber Sarai":        "East of Kailash",
  "Chhatarpur":       "East of Kailash",
  "Katwaria Sarai":   "East of Kailash",
  "Lado Sarai":       "East of Kailash",
  "Mahipalpur":       "East of Kailash",
  "Mehrauli":         "East of Kailash",
  "Sultanpur":        "East of Kailash",
  // Punjabi Bagh
  "Punjabi Bagh":     "Punjabi Bagh",
  // Rohini
  "Rohini":           "Rohini",
  // Delhi Dwarka
  "Dwarka":           "Delhi Dwarka",
  // Gurgaon
  "Gurugram":         "Gurgaon",
  "Badshahpur":       "Gurgaon",
  // Faridabad
  "Faridabad":        "Faridabad",
  // Ghaziabad
  "Ghaziabad":        "Ghaziabad",
  // Noida
  "Noida":            "Noida",
  // Separate Mandir
  "Chhipiwada":       "Separate Mandir",
};

const CATEGORY_ORDER = [
  "East of Kailash",
  "Punjabi Bagh",
  "Rohini",
  "Gurgaon",
  "Delhi Dwarka",
  "Faridabad",
  "Ghaziabad",
  "Noida",
  "Separate Mandir",
  "Outside Delhi",
];

// Sub-locations to always show in breakdown (even if 0)
const EOK_SUBS = ["East of Kailash","Aya Nagar","Ber Sarai","Chhatarpur","Katwaria Sarai","Lado Sarai","Mahipalpur","Mehrauli","Sultanpur"];
const GGN_SUBS = ["Gurugram","Badshahpur"];
const DWK_SUBS = ["Dwarka"];
const SM_SUBS  = ["Chhipiwada"];

// =============================================
// GLOBAL STATE
// =============================================

let lastResult = null;

// =============================================
// CHART INSTANCES
// =============================================

let barChartInst = null, pieChartInst = null, outsideChartInst = null;

// =============================================
// INPUT METADATA
// =============================================

function updateMeta() {
  ["1","2","3"].forEach(n => {
    const ta = document.getElementById("input" + n);
    const el = document.getElementById("meta" + n);
    const lines = ta.value.split("\n").map(l => l.trim()).filter(l => l && !IGNORE_LINES.has(l.toLowerCase())).length;
    el.textContent = lines > 0 ? `${lines} valid line${lines !== 1 ? "s" : ""} detected` : "—";
  });
}

["input1","input2","input3"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateMeta);
});

// =============================================
// CORE PROCESSING
// =============================================

function cleanLine(raw) {
  return raw.replace(/\s+/g, " ").trim();
}

function normalize(val) {
  const key = val.toLowerCase().trim();
  return NORM_LOOKUP[key] || val;
}

function parseInput(text) {
  return text.split("\n")
    .map(cleanLine)
    .filter(l => l && !IGNORE_LINES.has(l.toLowerCase()));
}

function processData(raw1, raw2, raw3) {
  const lines1 = parseInput(raw1);
  const lines2 = parseInput(raw2);
  const lines3 = parseInput(raw3);

  // All items: {original, canonical, category, source}
  const items = [];

  function addLines(lines, source, forceOutsideDelhi) {
    for (const line of lines) {
      const canonical = normalize(line);
      let category;
      if (forceOutsideDelhi) {
        category = "Outside Delhi";
      } else {
        category = CATEGORY_MAP[canonical] || "Outside Delhi";
      }
      items.push({ original: line, canonical, category, source });
    }
  }

  addLines(lines1, "offering", false);
  addLines(lines2, "website", false);
  addLines(lines3, "out-of-india", true);

  // Count by category
  const catCounts = {};
  for (const cat of CATEGORY_ORDER) catCounts[cat] = 0;

  // Count by canonical (for breakdown)
  const canonicalCounts = {};

  // Outside Delhi: count each original (normalized to canonical)
  const outsideCounts = {};

  // Track which canonicals are mapped (not outside)
  const knownCanonicals = new Set(Object.keys(CATEGORY_MAP));

  // Unknown location tracking (for admin)
  const unknownSet = new Set();

  for (const item of items) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;

    if (item.category === "Outside Delhi") {
      const key = item.canonical;
      outsideCounts[key] = (outsideCounts[key] || 0) + 1;
      // Flag as unknown if not in NORMALIZE_MAP and not a known name
      if (!knownCanonicals.has(item.canonical)) {
        unknownSet.add(item.original);
      }
    } else {
      canonicalCounts[item.canonical] = (canonicalCounts[item.canonical] || 0) + 1;
    }
  }

  const total = items.length;

  return { catCounts, canonicalCounts, outsideCounts, total, items, unknownSet };
}

// =============================================
// REPORT GENERATION
// =============================================

function formatReport(catCounts, total) {
  const pad = (s, n) => s + " ".repeat(Math.max(0, n - s.length));
  let lines = [];
  for (const cat of CATEGORY_ORDER) {
    lines.push(`${pad(cat, 22)} -  ${catCounts[cat] || 0}`);
  }
  lines.push("─".repeat(32));
  lines.push(`${pad("Total Offerings", 22)} -  ${total}`);
  return lines.join("\n");
}

function buildBreakdownHTML(catCounts, canonicalCounts, outsideCounts) {
  let html = "";

  function group(title, subs, counts) {
    html += `<div class="breakdown-group">`;
    html += `<div class="breakdown-group-title">${title}</div>`;
    for (const sub of subs) {
      const c = counts[sub] || 0;
      html += `<div class="bd-row"><span class="bd-loc">${sub}</span><span class="bd-count">${c}</span></div>`;
    }
    html += `</div>`;
  }

  group("East of Kailash Breakdown", EOK_SUBS, canonicalCounts);
  group("Gurgaon Breakdown", GGN_SUBS, canonicalCounts);
  group("Delhi Dwarka Breakdown", DWK_SUBS, canonicalCounts);
  group("Separate Mandir Breakdown", SM_SUBS, canonicalCounts);

  // Outside Delhi
  const sorted = Object.entries(outsideCounts).sort((a, b) => b[1] - a[1]);
  html += `<div class="breakdown-group">`;
  html += `<div class="breakdown-group-title">Outside Delhi Breakdown</div>`;
  if (sorted.length === 0) {
    html += `<div class="bd-row"><span class="bd-loc" style="color:var(--dim)">No entries</span><span class="bd-count">0</span></div>`;
  } else {
    for (const [loc, cnt] of sorted) {
      html += `<div class="bd-row"><span class="bd-loc">${loc}</span><span class="bd-count">${cnt}</span></div>`;
    }
  }
  html += `</div>`;

  return html;
}

function buildBreakdownText(catCounts, canonicalCounts, outsideCounts) {
  let lines = [];

  function group(title, subs, counts) {
    lines.push(`\n── ${title} ──`);
    for (const sub of subs) {
      const c = counts[sub] || 0;
      lines.push(`  ${sub.padEnd(24)} = ${c}`);
    }
  }

  group("East of Kailash Breakdown", EOK_SUBS, canonicalCounts);
  group("Gurgaon Breakdown", GGN_SUBS, canonicalCounts);
  group("Delhi Dwarka Breakdown", DWK_SUBS, canonicalCounts);
  group("Separate Mandir Breakdown", SM_SUBS, canonicalCounts);

  lines.push(`\n── Outside Delhi Breakdown ──`);
  const sorted = Object.entries(outsideCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    lines.push("  (No entries)");
  } else {
    for (const [loc, cnt] of sorted) {
      lines.push(`  ${loc.padEnd(28)} = ${cnt}`);
    }
  }
  return lines.join("\n");
}

// =============================================
// DASHBOARD CARDS
// =============================================

function buildCards(catCounts, total, outsideCounts) {
  const topEntries = Object.entries(outsideCounts);
  const topCat = CATEGORY_ORDER.slice(0, -1).reduce((a, b) =>
    (catCounts[a] || 0) >= (catCounts[b] || 0) ? a : b, CATEGORY_ORDER[0]);

  const cards = [
    { label: "Total Offerings", value: total, sub: "All sources combined", cls: "card-orange" },
    { label: "East of Kailash", value: catCounts["East of Kailash"] || 0, sub: "9 sub-locations", cls: "card-gold" },
    { label: "Punjabi Bagh", value: catCounts["Punjabi Bagh"] || 0, sub: "1 location", cls: "card-teal" },
    { label: "Outside Delhi", value: catCounts["Outside Delhi"] || 0, sub: `${Object.keys(outsideCounts).length} unique locations`, cls: "card-lotus" },
    { label: "Separate Mandir", value: catCounts["Separate Mandir"] || 0, sub: "Chhipiwada", cls: "card-sky" },
    { label: "Top Performing", value: topCat, sub: `${catCounts[topCat] || 0} offerings`, cls: "card-gold" },
  ];

  return cards.map(c => `
    <div class="card ${c.cls}">
      <div class="card-label">${c.label}</div>
      <div class="card-value">${c.value}</div>
      <div class="card-sub">${c.sub}</div>
    </div>
  `).join("");
}

// =============================================
// CHARTS
// =============================================

const CHART_COLORS = ["#f4860a","#e8c14a","#3ecfb2","#4ca8f5","#d94f7e","#a78bfa","#34d399","#fb923c","#60a5fa","#f472b6"];

function renderCharts(catCounts, outsideCounts) {
  const labels = CATEGORY_ORDER;
  const data = labels.map(l => catCounts[l] || 0);

  // Destroy old charts
  if (barChartInst) { barChartInst.destroy(); barChartInst = null; }
  if (pieChartInst) { pieChartInst.destroy(); pieChartInst = null; }
  if (outsideChartInst) { outsideChartInst.destroy(); outsideChartInst = null; }

  const chartDefaults = {
    plugins: {
      legend: { labels: { color: "#8b90aa", font: { size: 11 } } },
      tooltip: { backgroundColor: "#22263a", titleColor: "#e8e9f0", bodyColor: "#8b90aa", borderColor: "#2e3350", borderWidth: 1 }
    }
  };

  // Bar chart
  barChartInst = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Offerings",
        data,
        backgroundColor: CHART_COLORS,
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { ...chartDefaults.plugins, legend: { display: false } },
      scales: {
        x: { ticks: { color: "#8b90aa", font: { size: 10 } }, grid: { color: "#2e3350" } },
        y: { ticks: { color: "#8b90aa" }, grid: { color: "#2e3350" }, beginAtZero: true }
      }
    }
  });

  // Pie chart (only non-zero)
  const pieLabels = labels.filter((l, i) => data[i] > 0);
  const pieData   = data.filter(d => d > 0);

  pieChartInst = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieData,
        backgroundColor: CHART_COLORS,
        borderColor: "#1a1d27",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { ...chartDefaults.plugins, legend: { position: "right", labels: { color: "#8b90aa", font: { size: 10 }, boxWidth: 12 } } }
    }
  });

  // Outside Delhi chart
  const sortedOutside = Object.entries(outsideCounts).sort((a,b) => b[1]-a[1]).slice(0, 20);
  outsideChartInst = new Chart(document.getElementById("outsideChart"), {
    type: "bar",
    data: {
      labels: sortedOutside.map(e => e[0]),
      datasets: [{
        label: "Count",
        data: sortedOutside.map(e => e[1]),
        backgroundColor: "#d94f7e",
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      indexAxis: sortedOutside.length > 8 ? "y" : "x",
      plugins: { ...chartDefaults.plugins, legend: { display: false } },
      scales: {
        x: { ticks: { color: "#8b90aa", font: { size: 10 } }, grid: { color: "#2e3350" } },
        y: { ticks: { color: "#8b90aa", font: { size: 10 } }, grid: { color: "#2e3350" }, beginAtZero: true }
      }
    }
  });
}

// =============================================
// MAIN CALCULATE FUNCTION
// =============================================

function calculateReport() {
  const raw1 = document.getElementById("input1").value;
  const raw2 = document.getElementById("input2").value;
  const raw3 = document.getElementById("input3").value;

  if (!raw1.trim() && !raw2.trim() && !raw3.trim()) {
    showToast("⚠️ Please paste data in at least one input field.");
    return;
  }

  const result = processData(raw1, raw2, raw3);
  lastResult = result;
  const { catCounts, canonicalCounts, outsideCounts, total, unknownSet } = result;

  // Validation: sum of categories should equal total
  const catSum = CATEGORY_ORDER.reduce((s, c) => s + (catCounts[c] || 0), 0);
  if (catSum !== total) {
    console.warn("Count mismatch:", catSum, "vs", total);
  }

  // Final report (text)
  const reportText = formatReport(catCounts, total);
  document.getElementById("final-report").innerHTML = buildReportHTML(catCounts, total);

  // Cards
  document.getElementById("cards-grid").innerHTML = buildCards(catCounts, total, outsideCounts);

  // Breakdown
  document.getElementById("full-breakdown").innerHTML = buildBreakdownHTML(catCounts, canonicalCounts, outsideCounts);

  // Unknown locations
  const unknownSection = document.getElementById("unknown-section");
  if (unknownSet.size > 0) {
    unknownSection.style.display = "";
    const listEl = document.getElementById("unknown-list");
    let lines = [...unknownSet].sort().map(u => `  ${u} → Outside Delhi`).join("\n");
    listEl.textContent = lines;
  } else {
    unknownSection.style.display = "none";
  }

  // Charts
  renderCharts(catCounts, outsideCounts);

  // Show results
  const resultsEl = document.getElementById("results");
  resultsEl.classList.remove("hidden");
  resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });

  // Enable export buttons
  ["btn-copy-report","btn-copy-breakdown","btn-excel","btn-pdf"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  });

  showToast(`✅ Report generated — ${total} total offerings processed.`);
}

function buildReportHTML(catCounts, total) {
  let html = "";
  for (const cat of CATEGORY_ORDER) {
    html += `<div class="report-row">
      <span class="r-loc">${cat}</span>
      <span class="r-count">${catCounts[cat] || 0}</span>
    </div>`;
  }
  html += `<div class="report-row total-row">
    <span class="r-loc">Total Offerings</span>
    <span class="r-count">${total}</span>
  </div>`;
  return html;
}

// =============================================
// CLEAR
// =============================================

function clearAll() {
  ["input1","input2","input3"].forEach(id => {
    document.getElementById(id).value = "";
  });
  updateMeta();
  document.getElementById("results").classList.add("hidden");
  lastResult = null;
  ["btn-copy-report","btn-copy-breakdown","btn-excel","btn-pdf"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  });
  showToast("🗑 All data cleared.");
}

// =============================================
// COPY
// =============================================

function copyFinalReport() {
  if (!lastResult) { showToast("⚠️ Generate a report first."); return; }
  const text = formatReport(lastResult.catCounts, lastResult.total);
  copyText(`Offering Collection Report\n${"=".repeat(35)}\n\n${text}`);
  showToast("📋 Final report copied to clipboard.");
}

function copyFullBreakdown() {
  if (!lastResult) { showToast("⚠️ Generate a report first."); return; }
  const { catCounts, canonicalCounts, outsideCounts, total } = lastResult;
  const header = `Offering Collection — Full Breakdown\n${"=".repeat(40)}\n`;
  const report = formatReport(catCounts, total);
  const breakdown = buildBreakdownText(catCounts, canonicalCounts, outsideCounts);
  copyText(header + report + "\n" + breakdown);
  showToast("📄 Full breakdown copied to clipboard.");
}

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

// =============================================
// EXCEL EXPORT
// =============================================

function downloadExcel() {
  if (!lastResult) { showToast("⚠️ Generate a report first."); return; }
  const { catCounts, canonicalCounts, outsideCounts, total } = lastResult;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const sumData = [["Category", "Count"]];
  for (const cat of CATEGORY_ORDER) {
    sumData.push([cat, catCounts[cat] || 0]);
  }
  sumData.push(["Total Offerings", total]);
  const ws1 = XLSX.utils.aoa_to_sheet(sumData);
  ws1["!cols"] = [{ wch: 25 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Summary");

  // Sheet 2: EOK Breakdown
  const eokData = [["Location", "Count"]];
  for (const s of EOK_SUBS) eokData.push([s, canonicalCounts[s] || 0]);
  const ws2 = XLSX.utils.aoa_to_sheet(eokData);
  ws2["!cols"] = [{ wch: 25 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, "East of Kailash");

  // Sheet 3: Other breakdowns
  const otherData = [["Category", "Location", "Count"]];
  for (const s of GGN_SUBS) otherData.push(["Gurgaon", s, canonicalCounts[s] || 0]);
  for (const s of DWK_SUBS) otherData.push(["Delhi Dwarka", s, canonicalCounts[s] || 0]);
  for (const s of SM_SUBS) otherData.push(["Separate Mandir", s, canonicalCounts[s] || 0]);
  const ws3 = XLSX.utils.aoa_to_sheet(otherData);
  ws3["!cols"] = [{ wch: 20 }, { wch: 22 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Other Breakdowns");

  // Sheet 4: Outside Delhi
  const outData = [["Location", "Count"]];
  const sorted = Object.entries(outsideCounts).sort((a,b) => b[1]-a[1]);
  for (const [loc, cnt] of sorted) outData.push([loc, cnt]);
  const ws4 = XLSX.utils.aoa_to_sheet(outData);
  ws4["!cols"] = [{ wch: 30 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Outside Delhi");

  // Sheet 5: Raw data
  const rawData = [["Original Input", "Canonical Name", "Category", "Source"]];
  for (const item of lastResult.items) {
    rawData.push([item.original, item.canonical, item.category, item.source]);
  }
  const ws5 = XLSX.utils.aoa_to_sheet(rawData);
  ws5["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 20 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws5, "Raw Data");

  XLSX.writeFile(wb, "Offering_Report.xlsx");
  showToast("📊 Excel downloaded successfully.");
}

// =============================================
// PDF EXPORT
// =============================================

function downloadPDF() {
  if (!lastResult) { showToast("⚠️ Generate a report first."); return; }
  const { catCounts, canonicalCounts, outsideCounts, total } = lastResult;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const now = new Date().toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" });
  let y = 18;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("Offering Collection Management Report", 105, y, { align: "center" });
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${now}`, 105, y, { align: "center" });
  y += 10;

  // Summary table
  doc.autoTable({
    startY: y,
    head: [["Category", "Count"]],
    body: [
      ...CATEGORY_ORDER.map(cat => [cat, catCounts[cat] || 0]),
      ["Total Offerings", total]
    ],
    theme: "striped",
    headStyles: { fillColor: [244, 134, 10], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [232, 193, 74] },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // EOK Breakdown
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("East of Kailash Breakdown", 20, y);
  y += 3;
  doc.autoTable({
    startY: y,
    head: [["Location", "Count"]],
    body: EOK_SUBS.map(s => [s, canonicalCounts[s] || 0]),
    theme: "grid",
    headStyles: { fillColor: [62, 207, 178] },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Other Breakdowns
  const otherRows = [
    ...GGN_SUBS.map(s => ["Gurgaon", s, canonicalCounts[s] || 0]),
    ...DWK_SUBS.map(s => ["Delhi Dwarka", s, canonicalCounts[s] || 0]),
    ...SM_SUBS.map(s => ["Separate Mandir", s, canonicalCounts[s] || 0]),
  ];
  doc.setFontSize(12);
  doc.text("Other Breakdowns", 20, y);
  y += 3;
  doc.autoTable({
    startY: y,
    head: [["Category", "Location", "Count"]],
    body: otherRows,
    theme: "grid",
    headStyles: { fillColor: [76, 168, 245] },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 }
  });

  // Outside Delhi
  const sorted = Object.entries(outsideCounts).sort((a,b) => b[1]-a[1]);
  if (sorted.length > 0) {
    doc.addPage();
    y = 18;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text("Outside Delhi Breakdown", 20, y);
    y += 3;
    doc.autoTable({
      startY: y,
      head: [["Location", "Count"]],
      body: sorted,
      theme: "grid",
      headStyles: { fillColor: [217, 79, 126] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });
  }

  doc.save("Offering_Report.pdf");
  showToast("📑 PDF downloaded successfully.");
}

// =============================================
// TOAST
// =============================================

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 3200);
}

// =============================================
// INIT
// =============================================

updateMeta();
