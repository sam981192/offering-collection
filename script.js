/* =============================================
   Offering Collection Management System
   script.js — Main Orchestrator
   Wires all modules together. Entry point.

   Load order (index.html):
     1. location-config.js  (MASTER_CONFIG)
     2. normalizer.js       (matchToCanonical, cleanLine, etc.)
     3. processor.js        (processInputs)
     4. validation.js       (validateResult)
     5. report-generator.js (buildCards, buildFinalReport, buildBreakdown, buildAdminReview)
     6. chart-builder.js    (buildCharts, destroyCharts)
     7. copy.js             (copyFinalReport, copyFullBreakdown)
     8. script.js           (this file — main controller)
   ============================================= */

'use strict';

// ─── GLOBAL STATE ─────────────────────────────────────────────────────────────

let lastResult = null;
let toastTimer = null;

// ─── TOAST ────────────────────────────────────────────────────────────────────

function showToast(msg) {
  const t = getSafeElement('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
}

// ─── INPUT META LISTENERS ─────────────────────────────────────────────────────

function updateMeta(metaId, text) {
  const count = countValidLines(text);
  const el = getSafeElement(metaId);
  el.textContent = count === 0 ? '—' : `${count} valid line${count !== 1 ? 's' : ''} detected`;
}

['input1', 'input2', 'input3'].forEach((id, i) => {
  try {
    const el = getSafeElement(id);
    el.addEventListener('input', () => updateMeta(`meta${i + 1}`, el.value));
  } catch (e) {
    console.error(e);
  }
});

// ─── CALCULATE REPORT ─────────────────────────────────────────────────────────

function calculateReport() {
  try {
    const t1 = getSafeElement('input1').value;
    const t2 = getSafeElement('input2').value;
    const t3 = getSafeElement('input3').value;

    if (!t1.trim() && !t2.trim() && !t3.trim()) {
      showToast('Paste data in at least one input field.');
      return;
    }

    const result = processInputs(t1, t2, t3);
    lastResult = result;
    const { catCount, subCount, childDisplayMap, adminItems, total } = result;

    // ── Validate ──
    const { warnings } = validateResult(result);

    try {
      buildCards(catCount, total, adminItems.length);
      buildFinalReport(catCount, total);
      buildBreakdown(subCount, childDisplayMap, catCount);
      buildAdminReview(adminItems);
      buildValidationWarnings(warnings);
    } catch (renderError) {
      console.error('Render error:', renderError);
      showToast(`Render error: ${renderError.message}`);
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
    showToast(warnings.length ? `Report generated (${warnings.length} warning${warnings.length > 1 ? 's' : ''}).` : 'Report generated successfully!');

  } catch (error) {
    console.error('Calculation Error:', error);
    showToast(`Error: ${error.message}`);
  }
}

// ─── CLEAR ────────────────────────────────────────────────────────────────────

function clearAll() {
  try {
    ['input1', 'input2', 'input3'].forEach(id => { getSafeElement(id).value = ''; });
    ['meta1', 'meta2', 'meta3'].forEach(id => { getSafeElement(id).textContent = '—'; });
    getSafeElement('results').classList.add('hidden');
    ['btn-copy-report', 'btn-copy-breakdown'].forEach(id => {
      getSafeElement(id).disabled = true;
    });
    destroyCharts();
    lastResult = null;
    // Remove any validation warnings
    const w = document.getElementById('validation-warn');
    if (w) w.remove();
    showToast('All cleared.');
  } catch (error) {
    console.error('Clear Error:', error);
    showToast(`Error: ${error.message}`);
  }
}

// ─── GLOBAL EXPORTS ───────────────────────────────────────────────────────────
window.calculateReport   = calculateReport;
window.clearAll          = clearAll;
window.copyFinalReport   = copyFinalReport;
window.copyFullBreakdown = copyFullBreakdown;
