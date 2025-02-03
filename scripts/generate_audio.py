import numpy as np
from scipy.io import wavfile
import os
from pathlib import Path

# Constants
SAMPLE_RATE = 22050
DURATION = 1  # seconds
WAV_DIR = Path("src/assets/audio/wav")

# Piano frequencies (A0 to C8)
VALID_NOTES = {
    'A': [0, 1, 2, 3, 4, 5, 6, 7],
    'A#/Bb': [0, 1, 2, 3, 4, 5, 6, 7],
    'B': [0, 1, 2, 3, 4, 5, 6, 7],
    'C': [1, 2, 3, 4, 5, 6, 7, 8],
    'C#/Db': [1, 2, 3, 4, 5, 6, 7],
    'D': [1, 2, 3, 4, 5, 6, 7],
    'D#/Eb': [1, 2, 3, 4, 5, 6, 7],
    'E': [1, 2, 3, 4, 5, 6, 7],
    'F': [1, 2, 3, 4, 5, 6, 7],
    'F#/Gb': [1, 2, 3, 4, 5, 6, 7],
    'G': [1, 2, 3, 4, 5, 6, 7],
    'G#/Ab': [1, 2, 3, 4, 5, 6, 7]
}

BINAURAL_BEATS = [
    (0.5, "Low Delta"),
    (2.0, "Delta"),
    (4.0, "Theta"),
    (8.0, "Alpha"),
    (12.0, "High Alpha"),
    (16.0, "Beta"),
    (24.0, "High Beta"),
    (32.0, "Gamma"),
    (40.0, "High Gamma")
]

def get_frequency(note: str, octave: int) -> float:
    """Calculate frequency for a given note and octave."""
    # A4 = 440Hz
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    base_freq = 440  # A4
    base_octave = 4
    base_note = 'A'
    
    note_idx = notes.index(note.split('/')[0])
    base_idx = notes.index(base_note)
    
    n = (octave - base_octave) * 12 + (note_idx - base_idx)
    return base_freq * (2 ** (n/12))

def generate_sine(freq: float) -> np.ndarray:
    """Generate a sine wave of given frequency."""
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION))
    return np.sin(2 * np.pi * freq * t)

def main():
    # Create output directory
    WAV_DIR.mkdir(parents=True, exist_ok=True)
    
    for note, valid_octaves in VALID_NOTES.items():
        for octave in valid_octaves:
            base_freq = get_frequency(note, octave)
            
            for beat_freq, beat_name in BINAURAL_BEATS:
                print(f"Generating {note}{octave} - {beat_name} ({beat_freq}Hz)")
                
                # Generate left and right channels
                left = generate_sine(base_freq)
                right = generate_sine(base_freq + beat_freq)
                
                # Combine into stereo
                audio = np.vstack((left, right)).T
                
                # Save as WAV
                filename = f"binaural-{note}{octave}-{beat_freq}.wav"
                wavfile.write(
                    WAV_DIR / filename,
                    SAMPLE_RATE,
                    (audio * 32767).astype(np.int16)
                )

if __name__ == "__main__":
    main() 