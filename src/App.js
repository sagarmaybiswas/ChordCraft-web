import { useState, useEffect } from 'react';
import PianoRoll from './PianoRoll';
import Player from './Player';
import * as Tone from 'tone';
import scales from './scales'; // ✅ Import external scales

// Chord formulas: intervals in semitones from root note
const chordFormulas = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
};

// MIDI note numbers for keys (middle C = C4 = 60)
const keyNotes = {
  C: 60, 'C#': 61, D: 62, 'D#': 63, E: 64,
  F: 65, 'F#': 66, G: 67, 'G#': 68,
  A: 69, 'A#': 70, B: 71,
};

// Define chord progression presets
const progressionPresets = [
  { name: 'Pop Basic (I-IV-V-I)', degrees: [1, 4, 5, 1], types: ['major', 'major', 'major', 'major'] },
  { name: 'Pop Alternative (I-V-vi-IV)', degrees: [1, 5, 6, 4], types: ['major', 'major', 'minor', 'major'] },
  { name: 'Jazz Turnaround (ii-V-i)', degrees: [2, 5, 1], types: ['minor', 'major', 'minor'] },
  { name: 'Minor Classic (i-iv-v)', degrees: [1, 4, 5], types: ['minor', 'minor', 'minor'] },
];

function App() {
  const [key, setKey] = useState('C');
  const [scale, setScale] = useState('Ionian (Major)'); // ✅ Default must match one from scales.js!
  const [progressionPreset, setProgressionPreset] = useState(progressionPresets[0].name);
  const [notes, setNotes] = useState([]);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNotes, setPlayingNotes] = useState([]);
  const [baseMidi, setBaseMidi] = useState(48);
  const [numBars, setNumBars] = useState(1);
  const [cursorBeat, setCursorBeat] = useState(1);
  const [highlightScale, setHighlightScale] = useState(false);
  const [allowedNotes, setAllowedNotes] = useState([]);
  const [snapToAllowedNotes, setSnapToAllowedNotes] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [tempoInput, setTempoInput] = useState(120);

  const increaseBars = () => setNumBars(prev => Math.min(prev + 1, 4));
  const decreaseBars = () => setNumBars(prev => Math.max(prev - 1, 1));

  const handlePresetChange = (e) => {
    const presetName = e.target.value;
    setProgressionPreset(presetName);
    console.log('Selected preset:', progressionPresets.find(p => p.name === presetName));
  };

  const generateProgression = () => {
    const preset = progressionPresets.find(p => p.name === progressionPreset);
    if (!preset) return;

    const rootMidi = keyNotes[key];
    const scaleIntervals = scales[scale] || scales['Ionian (Major)']; // ✅ use imported scales safely
    const newNotes = [];

    for (let bar = 0; bar < numBars; bar++) {
      const idx = bar % preset.degrees.length;
      const degree = preset.degrees[idx];
      const chordType = preset.types[idx];

      const degreeIndex = degree - 1;
      const scaleOffset = scaleIntervals[degreeIndex % scaleIntervals.length]; // ✅ dynamic based on scale size
      const octaveShift = Math.floor(degreeIndex / scaleIntervals.length) * 12;
      const chordRootMidi = rootMidi + scaleOffset + octaveShift;

      const intervals = chordFormulas[chordType];
      const chordNotes = intervals.map(interval => ({
        midi: chordRootMidi + interval,
        beat: bar * 4 + cursorBeat,
        duration: 4, // 4 beats = full bar chord
      }));

      newNotes.push(...chordNotes);
    }

    setNotes(newNotes);
    console.log('Generated notes:', newNotes);
  };

  const calculateAllowedNotes = () => {
    const rootMidi = keyNotes[key];
    const scaleIntervals = scales[scale] || scales['Ionian (Major)'];
    const notesInScale = scaleIntervals.map(interval => (rootMidi + interval) % 12);
    setAllowedNotes(notesInScale);
    setHighlightScale(true);
  };

  useEffect(() => {
    if (highlightScale) {
      const rootMidi = keyNotes[key];
      const scaleIntervals = scales[scale] || scales['Ionian (Major)'];
      const notesInScale = scaleIntervals.map(interval => (rootMidi + interval) % 12);
      setAllowedNotes(notesInScale);
    }
  }, [key, scale, highlightScale]);

  useEffect(() => {
    Tone.Transport.bpm.rampTo(tempo, 0.5);
  }, [tempo]);

  return (
    <div>
      <h1>ChordCraft</h1>

      {/* Key selector */}
      <div>
        <label>Key: </label>
        <select value={key} onChange={e => setKey(e.target.value)}>
          {Object.keys(keyNotes).map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Scale selector */}
      <div>
        <label>Scale: </label>
        <select value={scale} onChange={e => setScale(e.target.value)}>
          {Object.keys(scales).map(scaleName => (
            <option key={scaleName} value={scaleName}>
              {scaleName}
            </option>
          ))}
        </select>
      </div>

      {/* Chord progression preset selector */}
      <div>
        <label>Preset: </label>
        <select value={progressionPreset} onChange={handlePresetChange}>
          {progressionPresets.map(p => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button onClick={generateProgression}>Generate Progression</button>
      </div>

      <div>
        <label>Bars: {numBars}</label>
        <button onClick={increaseBars}>+</button>
        <button onClick={decreaseBars}>-</button>
      </div>

      <div>
        <label>Cursor Beat: </label>
        <input
          type="number"
          min="1"
          max={numBars * 4}
          value={cursorBeat}
          onChange={e => setCursorBeat(Math.max(1, Math.min(numBars * 4, Number(e.target.value))))}
        />
      </div>

      <div>
        <button onClick={() => setHighlightScale(prev => !prev)}>
          {highlightScale ? 'Disable Highlight' : 'Enable Highlight'}
        </button>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={snapToAllowedNotes}
            onChange={() => setSnapToAllowedNotes(prev => !prev)}
          />
          Snap to Allowed Notes
        </label>
      </div>

      {/* Tempo control */}
      <div>
        <label>Tempo (BPM): </label>
        <input
          type="number"
          value={tempoInput}
          onChange={(e) => setTempoInput(Number(e.target.value))}
          onBlur={() => setTempo(Number(tempoInput))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setTempo(Number(tempoInput));
            }
          }}
          min="40"
          max="300"
        />
      </div>

      {/* Piano Roll */}
      <div>
        <h2>Piano Roll</h2>
        <PianoRoll
          notes={notes}
          setNotes={setNotes}
          cursorBeat={cursorBeat}
          playheadPosition={playheadPosition}
          playingNotes={playingNotes}
          baseMidi={baseMidi}
          setBaseMidi={setBaseMidi}
          numBars={numBars}
          highlightScale={highlightScale}
          allowedNotes={allowedNotes}
          snapToAllowedNotes={snapToAllowedNotes}
        />
      </div>

      {/* Player */}
      <div>
        <h2>Play Chord</h2>
        <Player
          notes={notes}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          setPlayheadPosition={setPlayheadPosition}
          setPlayingNotes={setPlayingNotes}
          numBars={numBars}
          tempo={tempo}
        />
      </div>
    </div>
  );
}

export default App;
