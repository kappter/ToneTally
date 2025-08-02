const ctx = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;
let noteData = [];
let modeData = {};
const guitarTuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const pianoKeys = { main: [], compare: [] };
const fretboard = { main: [], compare: [] };

async function loadData() {
    const noteResponse = await fetch('data/notes.csv');
    const noteText = await noteResponse.text();
    const noteLines = noteText.split('\n').slice(1);
    noteData = noteLines.map(line => {
        const [note, frequency, ...strings] = line.split(',');
        return { note, frequency: parseFloat(frequency), strings };
    });

    const modeResponse = await fetch('data/modes.json');
    modeData = await modeResponse.json();
}

function createPianoRoll(containerId) {
    const container = document.getElementById(containerId);
    const keyOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keys = [];
    for (let octave = 2; octave <= 8; octave++) {
        for (let note of keyOrder) {
            const fullNote = `${note}${octave}`;
            const keyDiv = document.createElement('div');
            keyDiv.classList.add('piano-key', note.includes('#') ? 'black' : 'white');
            const noteInfo = noteData.find(n => n.note === fullNote);
            if (!noteInfo || !noteInfo.strings.some(fret => fret !== '-')) {
                keyDiv.classList.add('disabled');
            } else {
                keyDiv.addEventListener('click', () => playNoteAndHighlight(fullNote, containerId));
            }
            keyDiv.innerHTML = `<span class="piano-key-label">${fullNote}</span>`;
            keyDiv.dataset.note = fullNote;
            container.appendChild(keyDiv);
            keys.push(keyDiv);
        }
    }
    pianoKeys[containerId.split('-')[0]] = keys;
}

function createFretboard(containerId) {
    const container = document.getElementById(containerId);
    const frets = [];
    for (let string = 0; string < 6; string++) {
        const stringDiv = document.createElement('div');
        stringDiv.classList.add('string');
        const stringFrets = [];
        for (let fret = 0; fret <= 24; fret++) {
            const fretDiv = document.createElement('div');
            fretDiv.classList.add('fret');
            const note = getNoteForFret(string, fret);
            fretDiv.dataset.note = note;
            fretDiv.dataset.string = string;
            fretDiv.dataset.fret = fret;
            fretDiv.innerHTML = `<span class="fret-label">${note}</span>`;
            if (note !== '-') {
                fretDiv.addEventListener('click', () => playFretAndHighlight(string, fret, containerId));
            }
            stringDiv.appendChild(fretDiv);
            stringFrets.push(fretDiv);
        }
        container.appendChild(stringDiv);
        frets.push(stringFrets);
    }
    fretboard[containerId.split('-')[0]] = frets;
}

function getNoteForFret(string, fret) {
    const baseNote = guitarTuning[string];
    const noteInfo = noteData.find(n => n.note === baseNote);
    if (!noteInfo) return '-';
    const fretIndex = noteInfo.strings[string];
    if (fretIndex === '-') return '-';
    const noteIndex = noteData.findIndex(n => n.note === baseNote) + parseInt(fret);
    return noteIndex < noteData.length ? noteData[noteIndex].note : '-';
}

function playNoteAndHighlight(note, containerId) {
    stopSound();
    const noteInfo = noteData.find(n => n.note === note);
    if (!noteInfo) return;
    playSound(noteInfo.frequency);
    updateInfo(note, noteInfo.frequency);
    clearHighlights(containerId);
    const panel = containerId.split('-')[0];
    pianoKeys[panel].forEach(key => {
        if (key.dataset.note === note) key.classList.add('active');
    });
    noteInfo.strings.forEach((fret, string) => {
        if (fret !== '-') {
            fretboard[panel][string][parseInt(fret)].classList.add('active');
        }
    });
}

function playFretAndHighlight(string, fret, containerId) {
    stopSound();
    const note = getNoteForFret(string, fret);
    if (note === '-') return;
    const noteInfo = noteData.find(n => n.note === note);
    if (!noteInfo) return;
    playSound(noteInfo.frequency);
    updateInfo(note, noteInfo.frequency);
    clearHighlights(containerId);
    const panel = containerId.split('-')[0];
    fretboard[panel][string][fret].classList.add('active');
    pianoKeys[panel].forEach(key => {
        if (key.dataset.note === note) key.classList.add('active');
    });
}

function playSound(frequency) {
    oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => stopSound(), 500);
}

function stopSound() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null;
    }
}

function clearHighlights(containerId) {
    const panel = containerId.split('-')[0];
    pianoKeys[panel].forEach(key => key.classList.remove('active'));
    fretboard[panel].forEach(string => string.forEach(fret => fret.classList.remove('active')));
}

function updateInfo(note, frequency) {
    document.getElementById('note-info').textContent = `Note: ${note}`;
    document.getElementById('frequency-info').textContent = `Frequency: ${frequency.toFixed(2)} Hz`;
}

function applyModeFilter(mode, panelId) {
    const panel = panelId.split('-')[0];
    clearHighlights(panelId);
    const notesInMode = modeData.modes[mode]?.map(note => 
        noteData.filter(n => n.note.startsWith(note)).map(n => n.note)
    ).flat() || [];
    pianoKeys[panel].forEach(key => {
        if (notesInMode.includes(key.dataset.note)) {
            key.classList.remove('disabled');
            key.classList.add('active');
        } else {
            key.classList.add('disabled');
        }
    });
    fretboard[panel].forEach((string, s) => string.forEach((fret, f) => {
        const note = getNoteForFret(s, f);
        if (note !== '-' && notesInMode.includes(note)) {
            fret.classList.add('active');
        } else {
            fret.classList.remove('active');
        }
    }));
}

async function analyzeSong() {
    const file = document.getElementById('song-file').files[0];
    if (!file) return;
    const noteCounts = {};
    if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').slice(1);
        lines.forEach(line => {
            const [note] = line.split(',');
            if (note) noteCounts[note] = (noteCounts[note] || 0) + 1;
        });
    } else if (file.name.endsWith('.mid')) {
        const midi = await Tone.Midi.fromUrl(URL.createObjectURL(file));
        midi.tracks.forEach(track => {
            track.notes.forEach(note => {
                noteCounts[note.name] = (noteCounts[note.name] || 0) + 1;
            });
        });
    }
    displayNoteTally(noteCounts, 'main-note-tally');
    const compareMode = document.getElementById('mode-select').value;
    const compareNotes = Object.keys(noteCounts).filter(note => 
        modeData.modes[compareMode]?.includes(note.replace(/[0-8]/, ''))
    ).reduce((acc, note) => ({ ...acc, [note]: noteCounts[note] }), {});
    displayNoteTally(compareNotes, 'compare-note-tally');
}

function displayNoteTally(counts, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '<h4>Note Frequencies</h4>';
    const ul = document.createElement('ul');
    Object.entries(counts).forEach(([note, count]) => {
        const li = document.createElement('li');
        li.textContent = `${note}: ${count} times`;
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

document.getElementById('mode-select').addEventListener('change', (e) => {
    applyModeFilter(e.target.value, 'compare-piano');
    document.getElementById('compare-mode').textContent = e.target.options[e.target.selectedIndex].text;
});

async function init() {
    await loadData();
    createPianoRoll('main-piano');
    createFretboard('main-fretboard');
    createPianoRoll('compare-piano');
    createFretboard('compare-fretboard');
    applyModeFilter('D_Aeolian', 'main-piano');
    applyModeFilter('D_Aeolian', 'compare-piano');
}

init();
