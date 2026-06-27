/* =============================================
   Offering Collection Management System
   chart-builder.js — Chart.js Chart Builders
   ============================================= */

'use strict';

const CHART_COLORS = [
  '#f4860a', '#e8c14a', '#4ca8f5', '#3ecfb2',
  '#d94f7e', '#a78bfa', '#fb923c', '#34d399',
  '#f472b6', '#60a5fa',
];

let barChartInst     = null;
let pieChartInst     = null;
let outsideChartInst = null;

function destroyCharts() {
  [barChartInst, pieChartInst, outsideChartInst].forEach(c => { if (c) c.destroy(); });
  barChartInst = pieChartInst = outsideChartInst = null;
}

function toggleChartState(canvasId, emptyId, showCanvas, message = '') {
  const canvas = getSafeElement(canvasId);
  const empty  = getSafeElement(emptyId);
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
  toggleChartState('barChart',     'barChartEmpty',     false, msg);
  toggleChartState('pieChart',     'pieChartEmpty',     false, msg);
  toggleChartState('outsideChart', 'outsideChartEmpty', false, msg);
}

function buildCharts(catCount, subCount, childDisplayMap) {
  destroyCharts();

  if (typeof Chart === 'undefined') {
    showChartErrorState('Chart.js not loaded.');
    return;
  }

  const summaryCats = MASTER_CONFIG
    .filter(c => c.inSummary && catCount[c.key] > 0)
    .sort((a, b) => a.summaryOrder - b.summaryOrder);

  const cats = summaryCats.map(c => c.displayName);
  const vals = summaryCats.map(c => catCount[c.key]);

  toggleChartState('barChart', 'barChartEmpty', true);
  toggleChartState('pieChart', 'pieChartEmpty', true);

  const gridOpts   = { color: 'rgba(255,255,255,0.06)' };
  const tickOpts   = { color: '#8b90aa', font: { size: 11 } };
  const legendOpts = { labels: { color: '#e8e9f0', font: { size: 11 }, boxWidth: 12 } };

  barChartInst = new Chart(getSafeElement('barChart'), {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [{
        data: vals,
        backgroundColor: CHART_COLORS.slice(0, cats.length),
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw} offerings` } },
      },
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
      datasets: [{
        data: vals,
        backgroundColor: CHART_COLORS.slice(0, cats.length),
        borderWidth: 2,
        borderColor: '#1a1d27',
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { ...legendOpts, position: 'bottom' } },
    },
  });

  // ── Outside breakdown chart ──
  const outsideRows = getOutsideRows(subCount, childDisplayMap);
  const top15 = outsideRows.slice(0, 15);

  if (top15.length) {
    toggleChartState('outsideChart', 'outsideChartEmpty', true);
    outsideChartInst = new Chart(getSafeElement('outsideChart'), {
      type: 'bar',
      data: {
        labels: top15.map(e => e[0]),
        datasets: [{
          data: top15.map(e => e[1]),
          backgroundColor: '#4ca8f5',
          borderRadius: 4,
        }],
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
    toggleChartState('outsideChart', 'outsideChartEmpty', false, 'No Outside Delhi / Haryana / NCR entries.');
  }
}
