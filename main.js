
const canvas = document.getElementById('pianoRoll');
const ctx = canvas.getContext('2d');
const midiUpload = document.getElementById('midiUpload');

function drawNote(x, y, width, height, color = 'blue') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

midiUpload.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let maxTime = 0;

  midi.tracks.forEach((track, tIndex) => {
    track.notes.forEach(note => {
      const x = note.time * 100; // simple time scaling
      const y = 127 - note.midi; // invert midi value for display
      const width = note.duration * 100;
      const height = 3;
      drawNote(x, y * 3, width, height);
      if (note.time + note.duration > maxTime) maxTime = note.time + note.duration;
    });
  });

  Tone.Transport.cancel();
  Tone.Transport.stop();
  const synth = new Tone.PolySynth().toDestination();
  midi.tracks.forEach(track => {
    track.notes.forEach(note => {
      synth.triggerAttackRelease(note.name, note.duration, note.time);
    });
  });
  Tone.Transport.start();
});
