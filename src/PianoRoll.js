import { Stage, Layer, Rect, Line, Text } from 'react-konva';
import * as Tone from 'tone';

function PianoRoll({ notes, setNotes, cursorBeat, playheadPosition, playingNotes, baseMidi, setBaseMidi, numBars, highlightScale, allowedNotes, snapToAllowedNotes }) {
  const noteHeight = 20;
  const beatWidth = 50;
  const numNotes = 24;
  const numBeats = numBars * 4;
  const keyWidth = 40;
  const scrollBarWidth = 20;
  const gridWidth = numBeats * beatWidth;
  const canvasWidth = gridWidth + keyWidth + scrollBarWidth;
  const canvasHeight = numNotes * noteHeight;

  const minMidi = baseMidi;
  const maxMidi = baseMidi + 23;

  const whiteNotes = [0, 2, 4, 5, 7, 9, 11];
  const blackNotes = [1, 3, 6, 8, 10];
  const keyData = Array.from({ length: numNotes }, (_, i) => {
    const midi = minMidi + i;
    const noteName = Tone.Midi(midi).toNote();
    const isWhite = whiteNotes.includes(midi % 12);
    return { midi, noteName, isWhite };
  }).reverse();

  const handleClick = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (point.x < keyWidth || point.x > canvasWidth - scrollBarWidth) return;
    const beat = Math.floor((point.x - keyWidth) / beatWidth) + 1;
    let midi = maxMidi - Math.floor(point.y / noteHeight);

    if (midi < minMidi || midi > maxMidi || beat > numBeats) return;

    // If snapToAllowedNotes is true, snap to the closest allowed note
    if (snapToAllowedNotes) {
      // Find the closest allowed note by comparing the remainder modulo 12 (note pitch class)
      const snappedMidi = allowedNotes.reduce((prev, curr) =>
        Math.abs(curr - (midi % 12)) < Math.abs(prev - (midi % 12)) ? curr : prev
      );
      midi = snappedMidi + Math.floor(midi / 12) * 12; // Keep the same octave
    }

    const clickedNoteIndex = notes.findIndex(
      (note) => note.beat === beat && note.midi === midi
    );

    if (clickedNoteIndex >= 0) {
      setNotes(notes.filter((_, i) => i !== clickedNoteIndex));
    } else {
      const newNote = { midi, beat, duration: 1 };
      setNotes([...notes, newNote]);
    }
  };

  const handleDragEnd = (e, index) => {
    const point = e.target.position();
    const beat = Math.max(1, Math.min(numBeats, Math.round((point.x - keyWidth) / beatWidth) + 1));
    const midi = Math.max(minMidi, Math.min(maxMidi, maxMidi - Math.round(point.y / noteHeight)));

    const newNotes = [...notes];
    newNotes[index] = { ...newNotes[index], midi, beat };
    setNotes(newNotes);

    e.target.position({
      x: (beat - 1) * beatWidth + keyWidth,
      y: (maxMidi - midi) * noteHeight,
    });
  };

  const handleScroll = (e) => {
    const newBaseMidi = Number(e.target.value);
    setBaseMidi(newBaseMidi);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Stage width={canvasWidth} height={canvasHeight} onClick={handleClick}>
        <Layer>
          {/* Piano keys */}
          {keyData.map((key, i) => (
            <Rect
              key={key.midi}
              x={0}
              y={i * noteHeight}
              width={key.isWhite ? keyWidth : keyWidth * 0.6}
              height={noteHeight}
              fill={playingNotes.includes(key.midi) ? 'yellow' : key.isWhite ? 'white' : 'black'}
              stroke="black"
              strokeWidth={1}
            />
          ))}

          {/* Note names on keys */}
          {keyData.map((key, i) => (
            <Text
              key={key.midi}
              x={5}
              y={i * noteHeight + 5}
              text={key.noteName}
              fontSize={12}
              fill={key.isWhite ? 'black' : 'white'}
            />
          ))}

          {/* Highlight grid rows based on scale */}
          {keyData.map((key, i) => (
            <>
              <Rect
                x={keyWidth}
                y={i * noteHeight}
                width={gridWidth}
                height={noteHeight}
                fill={highlightScale
                  ? (allowedNotes.includes(key.midi % 12) ? 'white' : 'lightgray')
                  : 'white'}
                strokeWidth={0}
              />
              <Line
                key={i}
                points={[keyWidth, i * noteHeight, canvasWidth - scrollBarWidth, i * noteHeight]}
                stroke="gray"
                strokeWidth={1}
              />
            </>
          ))}

          {/* Vertical beat lines */}
          {[...Array(numBeats + 1)].map((_, i) => (
            <Line
              key={i}
              points={[i * beatWidth + keyWidth, 0, i * beatWidth + keyWidth, canvasHeight]}
              stroke="gray"
              strokeWidth={1}
            />
          ))}

          {/* Red cursor */}
          <Line
            points={[(cursorBeat - 1) * beatWidth + keyWidth, 0, (cursorBeat - 1) * beatWidth + keyWidth, canvasHeight]}
            stroke="red"
            strokeWidth={2}
          />

          {/* Green playhead */}
          {playheadPosition > 0 && (
            <Line
              points={[playheadPosition, 0, playheadPosition, canvasHeight]}
              stroke="green"
              strokeWidth={2}
            />
          )}

          {/* Notes */}
          {notes
            .filter(note => note.midi >= minMidi && note.midi <= maxMidi && note.beat <= numBeats)
            .map((note, i) => (
              <Rect
                key={i}
                x={(note.beat - 1) * beatWidth + keyWidth}
                y={(maxMidi - note.midi) * noteHeight}
                width={beatWidth * note.duration}
                height={noteHeight}
                fill="blue"
                draggable
                onDragEnd={(e) => handleDragEnd(e, i)}
              />
            ))}
        </Layer>
      </Stage>

      {/* Octave scroll bar */}
      <input
        type="range"
        min="24"
        max="108"
        step="1"
        value={baseMidi}
        onChange={handleScroll}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: canvasHeight,
          width: scrollBarWidth,
          transform: 'rotate(180deg)',
          cursor: 'pointer',
          WebkitAppearance: 'slider-vertical',
          writingMode: 'bt-tb',
        }}
      />
    </div>
  );
}

export default PianoRoll;