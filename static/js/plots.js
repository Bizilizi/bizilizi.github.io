// Two interactive Chart.js charts for the modality-confusion results section:
//   (a) per-model μ(A) vs μ(V), split into Embedding vs Foundation families
//   (b) per-model ΔF1 voice-over bias (diverging bars)
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js not loaded');
    return;
  }

  Chart.defaults.font.family = "'Noto Sans', sans-serif";
  const BLUE = '#3273dc';
  const ORANGE = '#fd7e14';
  const GREEN = '#2bae66';
  const RED = '#e0566b';

  // ---- Chart (a): modality confusion μ(A) vs μ(V) -------------------------
  const muCanvas = document.getElementById('mu-chart');
  if (muCanvas) {
    fetch('./static/data/modality-confusion.json')
      .then((r) => r.json())
      .then((data) => {
        const models = data.models || [];
        const labels = models.map((m) => m.model);
        const setCaption = document.getElementById('mu-caption');
        if (setCaption && data.caption) setCaption.textContent = data.caption;

        // index of the first model whose family differs from the previous one
        let boundary = -1;
        for (let i = 1; i < models.length; i++) {
          if (models[i].family !== models[i - 1].family) { boundary = i; break; }
        }

        // soft shaded bands behind each model family, with a label per band
        const familyBands = {
          id: 'familyBands',
          beforeDatasetsDraw(chart) {
            if (boundary < 0) return;
            const x = chart.scales.x;
            const { top, bottom, left, right } = chart.chartArea;
            const mid = (x.getPixelForValue(boundary - 1) + x.getPixelForValue(boundary)) / 2;
            const ctx = chart.ctx;
            ctx.save();
            // band 1 (left family) and band 2 (right family)
            ctx.fillStyle = 'rgba(50, 115, 220, 0.06)';
            ctx.fillRect(left, top, mid - left, bottom - top);
            ctx.fillStyle = 'rgba(43, 174, 102, 0.07)';
            ctx.fillRect(mid, top, right - mid, bottom - top);
            // labels centered over each band
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.font = '700 11px ' + Chart.defaults.font.family;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.fillText((models[0].family || '').toUpperCase(), (left + mid) / 2, top + 4);
            ctx.fillText((models[boundary].family || '').toUpperCase(), (mid + right) / 2, top + 4);
            ctx.restore();
          }
        };

        new Chart(muCanvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'μ(A)  forgets audible', data: models.map((m) => m.muA), backgroundColor: BLUE },
              { label: 'μ(V)  forgets visible', data: models.map((m) => m.muV), backgroundColor: ORANGE }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'μ  (lower is better)' } },
              x: { ticks: { maxRotation: 45, minRotation: 45 } }
            },
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Modality confusion by model' },
              tooltip: {
                callbacks: {
                  afterTitle: (items) => 'Family: ' + (models[items[0].dataIndex].family || '')
                }
              }
            }
          },
          plugins: [familyBands]
        });
      })
      .catch((err) => console.error('μ chart failed:', err));
  }

  // ---- Chart (b): voice-over ΔF1 bias ------------------------------------
  const voCanvas = document.getElementById('vo-chart');
  if (voCanvas) {
    fetch('./static/data/voiceover-bias.json')
      .then((r) => r.json())
      .then((data) => {
        const models = data.models || [];
        const setCaption = document.getElementById('vo-caption');
        if (setCaption && data.caption) setCaption.textContent = data.caption;

        const valueLabels = {
          id: 'valueLabels',
          afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            const meta = chart.getDatasetMeta(0);
            ctx.save();
            ctx.font = '600 11px ' + Chart.defaults.font.family;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.textAlign = 'center';
            meta.data.forEach((bar, i) => {
              const v = models[i].delta;
              ctx.textBaseline = v >= 0 ? 'bottom' : 'top';
              ctx.fillText(v.toFixed(2), bar.x, bar.y + (v >= 0 ? -4 : 4));
            });
            ctx.restore();
          }
        };

        new Chart(voCanvas, {
          type: 'bar',
          data: {
            labels: models.map((m) => m.model),
            datasets: [{
              label: data.metric || 'ΔF1 (A)',
              data: models.map((m) => m.delta),
              backgroundColor: models.map((m) => (m.delta >= 0 ? GREEN : RED))
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { title: { display: true, text: 'ΔF1 (A): no voice-over − with voice-over' }, grid: { color: (c) => (c.tick.value === 0 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)') } },
              x: { ticks: { maxRotation: 45, minRotation: 45 } }
            },
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Speech shortcut: performance drop without voice-over' }
            }
          },
          plugins: [valueLabels]
        });
      })
      .catch((err) => console.error('Voice-over chart failed:', err));
  }
});
