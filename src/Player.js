import * as Tone from 'tone';
import { useEffect, useRef } from 'react';

// Initialize piano sampler with Salamander samples
const piano = new Tone.Sampler({
  urls: {
    "A1": "A1.mp3",
    "C2": "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    "A2": "A2.mp3",
    "C3": "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    "A3": "A3.mp3",
    "C4": "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    "A4": "A4.mp3",
    "C5": "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    "A5": "A5.mp3",
    "C6": "C6.mp3"
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/"
}).toDestination();

function Player({ notes, isPlaying, setIsPlaying, setPlayheadPosition, setPlayingNotes, numBars, tempo }) {
  const sequenceRef = useRef(null); // Store the Tone.Sequence
  const animationFrameIdRef = useRef(null); // For smooth green playhead
  const loopDurationRef = useRef(0); // Loop length in seconds
  const gridWidthRef = useRef(0); // Grid width in pixels
  const tempoRef = useRef(tempo); // Store current tempo for calculations

  // Toggle playback: Play or Stop
  const togglePlayback = async () => {
    await Tone.start(); // Ensure AudioContext is running

    if (isPlaying) {
      // Stop playing
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      setPlayheadPosition(0); // Reset green playhead
      setPlayingNotes([]); // Clear active notes
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameIdRef.current);
    } else {
      // Start playing
      const numBeats = numBars * 4;
      const sequence = createSequence(notes, numBeats);

      // Update grid and timing for playhead
      updateLoopSettings(numBeats);

      sequenceRef.current = sequence;
      Tone.Transport.loop = true;
      Tone.Transport.loopStart = 0;
      Tone.Transport.loopEnd = `${numBars}m`;
      sequence.start(0);
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  // Helper: Create a new Tone.Sequence for given notes
  const createSequence = (notes, numBeats) => {
    return new Tone.Sequence(
      (time, beat) => {
        const notesToPlay = notes.filter(note => note.beat === beat + 1);
        if (notesToPlay.length > 0) {
          const noteNames = notesToPlay.map(note => Tone.Midi(note.midi).toNote());
          const midiNotes = notesToPlay.map(note => note.midi);
          setPlayingNotes(midiNotes);
          piano.triggerAttackRelease(noteNames, '1n', time);
        } else {
          setPlayingNotes([]);
        }
      },
      Array.from({ length: numBeats }, (_, i) => i),
      '4n' // One beat = one step
    );
  };

  // Helper: Update loop duration and grid width
  const updateLoopSettings = (numBeats) => {
    const beatWidth = 50;
    const gridWidth = numBeats * beatWidth;
    
    // Calculate loop duration based on current tempo
    // One beat = one quarter note (4n)
    // Duration (seconds) = (beats * 60) / tempo
    const loopDuration = (numBeats * 60) / tempoRef.current;
    
    loopDurationRef.current = loopDuration;
    gridWidthRef.current = gridWidth;
  };

  // 🛠 Rebuild Sequence if notes change
  useEffect(() => {
    if (isPlaying) {
      const currentTime = Tone.Transport.seconds;
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }

      const numBeats = numBars * 4;
      const sequence = createSequence(notes, numBeats);

      updateLoopSettings(numBeats);

      sequenceRef.current = sequence;
      sequence.start(0);
      Tone.Transport.loop = true;
      Tone.Transport.loopStart = 0;
      Tone.Transport.loopEnd = `${numBars}m`;
      Tone.Transport.start('+0.05', currentTime); // Resume transport
    }
  }, [notes, isPlaying, numBars]);

  // 🟢 Move green playhead smoothly
  useEffect(() => {
    const keyWidth = 40;

    const updatePlayhead = () => {
      const seconds = Tone.Transport.seconds % loopDurationRef.current;
      const fraction = seconds / loopDurationRef.current;
      const x = keyWidth + fraction * gridWidthRef.current;
      setPlayheadPosition(x);
      animationFrameIdRef.current = requestAnimationFrame(updatePlayhead);
    };

    if (isPlaying) {
      animationFrameIdRef.current = requestAnimationFrame(updatePlayhead);
    }

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isPlaying]);

  // 🛠 Update timing correctly when tempo changes
  useEffect(() => {
    // Update tempo ref for calculations
    tempoRef.current = tempo;
    
    if (isPlaying) {
      const numBeats = numBars * 4;
      
      // Update timing calculations
      updateLoopSettings(numBeats);
      
      // No need to restart transport - just let the animation
      // use the new timing values on the next frame
    }
  }, [tempo, isPlaying, numBars]);

  return (
    <button onClick={togglePlayback}>
      {isPlaying ? 'Stop' : 'Play'}
    </button>
  );
}

export default Player;