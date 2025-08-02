let noteCounts = {};
let modeMap = {};

fetch('data/modes.json')
  .then(res => res.json())
  .then(modes => {
    modeMap = modes;
    const select = document.getElementById('modeSelect');
    for (let mode in modes) {
      const opt = document.createElement('option');
      opt.value = mode;
      opt.textContent = mode;
      select.appendChild(opt);
    }
    select.addEventListener('change', () => highlightModeNotes(select.value));
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
      noteCounts = {};
      player.loadArrayBuffer(reader.result);
      player.play();
      setTimeout(() => drawHistogram(noteCounts), 1000);
    };
    reader.readAsArrayBuffer(file);
  }
});

function drawHistogram(counts) {
  const container = document.getElementById('noteHistogram');
  container.innerHTML = '';
  for (let note in counts) {
    const bar = document.createElement('div');
    bar.style.width = counts[note] * 10 + 'px';
    bar.textContent = note + ' (' + counts[note] + ')';
    container.appendChild(bar);
  }
}

function createPiano() {
  const piano = document.getElementById('pianoKeys');
  const notes = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];
  for (let i = 21; i <= 108; i++) {
    const note = notes[i % 12];
    const key = document.createElement('div');
    key.className = "key " + (note.includes("#") ? "black" : "white");
    key.textContent = note + Math.floor(i / 12 - 1);
    key.dataset.note = note.replace("#", "♯");
    piano.appendChild(key);
  }
}
createPiano();

function highlightModeNotes(mode) {
  const modeNotes = modeMap[mode];
  document.querySelectorAll('#pianoKeys .key').forEach(key => {
    key.classList.remove('highlight');
    if (modeNotes.includes(key.dataset.note.replace("♯", "#").replace(/[0-9]/g, ''))) {
      key.classList.add('highlight');
    }
  });
}

function createFretboard() {
  const fretboard = document.getElementById('fretboard');
  const strings = ["E", "A", "D", "G", "B", "E"];
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteAt = (base, fret) => {
    let idx = notes.indexOf(base);
    return notes[(idx + fret) % 12];
  };

  strings.reverse().forEach((stringNote, stringIdx) => {
    for (let fret = 0; fret <= 21; fret++) {
      const cell = document.createElement('div');
      cell.className = 'fret';
      const note = noteAt(stringNote, fret);
      cell.textContent = note;
      cell.dataset.note = note;
      fretboard.appendChild(cell);
    }
  });
}
createFretboard();
