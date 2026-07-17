// Interactive modality-confusion demo: the same clip is classified by a model
// with audio only vs. audio+video. The prediction list is persistent, so when
// you toggle you SEE the correct label drop out and the wrong one appear —
// visualising the modality confusion rather than only describing it.
document.addEventListener('DOMContentLoaded', function () {
  const mount = document.getElementById('confusion-demo-app');
  if (!mount) return;

  fetch('./static/data/confusion-demo.json')
    .then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then((data) => render(mount, data))
    .catch((err) => {
      console.error('Confusion demo failed to load:', err);
      mount.innerHTML = '<p class="has-text-centered has-text-grey">Could not load the demo.</p>';
    });

  const STATE_TEXT = {
    correct: '✓ predicted',
    wrong: '✗ predicted',
    dropped: '✗ dropped',
    absent: 'not predicted'
  };

  function render(root, data) {
    const modes = data.modes || {};
    const labels = data.labels || [];
    const order = ['a', 'av'].filter((k) => modes[k]);

    root.innerHTML = `
      <div class="cdemo-grid">
        <div class="cdemo-video">
          <video controls playsinline preload="none"${data.poster ? ` poster="${data.poster}"` : ''}>
            <source src="${data.video}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="cdemo-panel">
          <p class="cdemo-model">Input to <strong>${escapeHtml(data.model)}</strong>:</p>
          <div class="cdemo-toggle" role="group" aria-label="input modality">
            ${order.map((k, i) => `
              <button class="button cdemo-btn${i === 0 ? ' is-active' : ''}" data-mode="${k}">
                ${escapeHtml(modes[k].label)}
              </button>`).join('')}
          </div>
          <div class="cdemo-output">
            <span class="cdemo-output-label">Model predictions</span>
            <div class="cdemo-preds">
              ${labels.map((l, i) => `
                <div class="cdemo-pred" data-idx="${i}">
                  <span class="cdemo-pred-text">${escapeHtml(l.text)}</span>
                  <span class="cdemo-pred-state"></span>
                </div>`).join('')}
            </div>
            <p class="cdemo-note" id="cdemo-note"></p>
          </div>
        </div>
      </div>
    `;

    const buttons = Array.from(root.querySelectorAll('.cdemo-btn'));
    const chips = Array.from(root.querySelectorAll('.cdemo-pred'));
    const note = root.querySelector('#cdemo-note');

    function stateFor(label, mode) {
      const predicted = (mode.predicted || []).indexOf(label.text) !== -1;
      if (predicted) return label.truth === 'correct' ? 'correct' : 'wrong';
      // not predicted: a correct label that's missing was "dropped"; otherwise simply absent
      return label.truth === 'correct' ? 'dropped' : 'absent';
    }

    function show(modeKey) {
      const m = modes[modeKey];
      buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === modeKey));
      chips.forEach((chip, i) => {
        const st = stateFor(labels[i], m);
        chip.classList.remove('is-correct', 'is-wrong', 'is-dropped', 'is-absent');
        // force reflow so the pop animation retriggers on each toggle
        void chip.offsetWidth;
        chip.classList.add('is-' + st);
        chip.querySelector('.cdemo-pred-state').textContent = STATE_TEXT[st];
      });
      note.textContent = m.note;
    }

    buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.mode)));
    show(order[0]);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
});
