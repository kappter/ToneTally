# ToneTally

An interactive web app for guitarists and musicians to visualize notes across a piano roll and guitar fretboard, analyze modes/scales, and tally note frequencies in music like *Toccata and Fugue in D Minor*. Hosted at https://kappter.github.io/ToneTally/.

## Features
- **Piano-Guitar Interaction**: Click piano keys to highlight corresponding guitar frets, or click frets to highlight piano keys, with audio playback.
- **Mode/Scale Filters**: Filter by modes (e.g., D Aeolian, D Dorian, C Ionian) to highlight relevant notes.
- **Comparison Panels**: Compare *Toccata and Fugue* in D minor with other modes side-by-side.
- **Note Frequency Analysis**: Upload CSV or MIDI files to tally note occurrences, with results displayed in a list.
- **Portfolio Integration**: Part of my portfolio at https://kappter.github.io/portfolio/.

## Setup
1. Clone the repository: `git clone https://github.com/kappter/ToneTally.git`
2. Open `index.html` in a browser or deploy to GitHub Pages.
3. Upload a song file (CSV or MIDI) to analyze note frequencies.

## Usage
- Select a mode from the dropdown to filter the comparison panel.
- Click piano keys or frets to hear notes and see cross-highlights.
- Upload a `.csv` (format: `note,duration`) or `.mid` file to tally note frequencies.

## Notes
- *Toccata and Fugue in D Minor* is analyzed in D Aeolian with harmonic minor elements.
- Uses Tone.js for MIDI parsing and Web Audio API for sound.
- Public domain music is safe to analyze; ensure proper licensing for copyrighted files.

## License
MIT License
