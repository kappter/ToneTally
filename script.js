fetch('data/modes.json')
  .then(res => res.json())
  .then(modes => {
    const select = document.getElementById('modeSelect');
    for (let mode in modes) {
      const opt = document.createElement('option');
      opt.value = mode;
      opt.textContent = mode;
      select.appendChild(opt);
    }
  });

document.getElementById('midiFileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      const player = new MidiPlayer.Player(function (event) {
        if (event.name === 'Note on') {
          const note = event.noteName;
          noteCounts[note] = (noteCounts[note] || 0) + 1;
        }
      });
      player.loadArrayBuffer(reader.result);
      noteCounts = {};
      player.play();
      setTimeout(() => {
        drawHistogram(noteCounts);
      }, 1000);
    };
    reader.readAsArrayBuffer(file);
  }
});

let noteCounts = {};

function drawHistogram(counts) {
  const container = document.getElementById('noteHistogram');
  container.innerHTML = '';
  for (let note in counts) {
    const bar = document.createElement('div');
    bar.style.height = '24px';
    bar.style.width = counts[note] * 10 + 'px';
    bar.style.background = '#3399cc';
    bar.style.marginBottom = '4px';
    bar.textContent = note + ' (' + counts[note] + ')';
    container.appendChild(bar);
  }
}
