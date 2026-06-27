/* =============================================
   Offering Collection Management System
   copy.js — Plain Text Clipboard Export
   No HTML, no Markdown, no emojis.
   Pastes cleanly into WhatsApp / Excel / Docs.
   ============================================= */

'use strict';

/**
 * Build plain-text final report.
 */
function buildFinalReportText(catCount, total) {
  const ordered = MASTER_CONFIG
    .filter(c => c.inSummary)
    .sort((a, b) => a.summaryOrder - b.summaryOrder);

  let text = 'Category-wise Offering Summary\n';
  text += '-'.repeat(44) + '\n';
  for (const cat of ordered) {
    const cnt = catCount[cat.key];
    if (!cnt) continue;
    text += `${cat.displayName.padEnd(30)}  ${String(cnt).padStart(6)}\n`;
  }
  text += '-'.repeat(44) + '\n';
  text += `${'TOTAL OFFERINGS'.padEnd(30)}  ${String(total).padStart(6)}\n`;
  return text;
}

/**
 * Build plain-text full breakdown.
 */
function buildFullBreakdownText(catCount, subCount, childDisplayMap) {
  const ordered = MASTER_CONFIG
    .filter(c => c.inBreakdown)
    .sort((a, b) => a.summaryOrder - b.summaryOrder);

  let text = '';

  for (const cat of ordered) {
    const total = catCount[cat.key];
    if (!total) continue;

    text += `\n${cat.displayName} Breakdown\nTotal: ${total}\n\n`;

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

    for (const [loc, cnt] of rows) {
      text += `${loc.padEnd(30)}  ${String(cnt).padStart(6)}\n`;
    }
    text += '\n' + '-'.repeat(44) + '\n';
  }

  return text.trim();
}

/**
 * Copy final report to clipboard.
 */
function copyFinalReport() {
  if (!lastResult) return;
  const { catCount, total } = lastResult;
  const text = buildFinalReportText(catCount, total);
  navigator.clipboard.writeText(text).then(() => showToast('Final report copied!'));
}

/**
 * Copy full breakdown to clipboard.
 */
function copyFullBreakdown() {
  if (!lastResult) return;
  const { catCount, subCount, childDisplayMap } = lastResult;
  const text = buildFullBreakdownText(catCount, subCount, childDisplayMap);
  navigator.clipboard.writeText(text).then(() => showToast('Breakdown copied!'));
}
