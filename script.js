document.addEventListener('DOMContentLoaded', () => {
    fetch('notes.json')
        .then(response => response.json())
        .then(notesData => {
            console.log('Notes loaded:', notesData);
            
            // Now, let's build the UI based on this data.
            buildPianoRoll(notesData);
            buildFretboard(notesData);

        })
        .catch(error => console.error('Error loading notes:', error));
});

function buildPianoRoll(notesData) {
    const pianoRoll = document.getElementById('piano-roll');
    // TODO: Create the keys dynamically here.
    // Loop through notesData and create a div for each note.
    // Example: notesData.forEach(note => { ... });
    // You'll need to decide on a visual representation for white and black keys.
    // HINT: You can use the note name (e.g., 'C4', 'C#4') to determine the key type.
    // For now, let's just add a placeholder.
    pianoRoll.innerHTML = '<p>Piano Roll will be built here.</p>';
}

function buildFretboard(notesData) {
    const fretboard = document.getElementById('fretboard');
    // TODO: Create the guitar strings and frets dynamically here.
    // This is a bit more complex. You'll need to loop through the strings,
    // then loop through the frets for each string.
    // The notesData.fretboardMapping can help you populate the frets with note IDs.
    fretboard.innerHTML = '<p>Fretboard will be built here.</p>';
}
