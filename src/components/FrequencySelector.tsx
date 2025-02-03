import React, { useState, useEffect } from 'react';
import { pitches, octaves, getFrequency, isValidNote } from '../lib/frequencies';

export function FrequencySelector() {
  // Start with A4 (440Hz) as default
  const [pitch, setPitch] = useState('A');
  const [octave, setOctave] = useState(4);
  const [frequency, setFrequency] = useState(440);

  useEffect(() => {
    if (!isValidNote(pitch, octave)) {
      // Reset to nearest valid combination
      if (octave === 0) {
        setPitch('C');
      } else if (octave === 8) {
        setPitch('C');
      }
      return;
    }

    try {
      const newFreq = getFrequency(pitch, octave);
      setFrequency(newFreq);
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'baseFreq';
      input.value = String(newFreq);
      const form = document.getElementById('binauralForm');
      const oldInput = form?.querySelector('input[name="baseFreq"]');
      if (oldInput) oldInput.remove();
      form?.appendChild(input);
    } catch (error) {
      console.error('Invalid frequency combination:', pitch, octave);
    }
  }, [pitch, octave]);

  return (
    <div className="space-y-2 grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="basePitch" className="block text-sm font-medium">
          Pitch
        </label>
        <select
          id="basePitch"
          name="basePitch"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          required
          className="w-full rounded border p-2 font-mono"
        >
          {pitches.map((p) => (
            <option 
              key={p} 
              value={p}
              disabled={!isValidNote(p, octave)}
            >
              {p}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="baseOctave" className="block text-sm font-medium">
          Octave
        </label>
        <select
          id="baseOctave"
          name="baseOctave"
          value={octave}
          onChange={(e) => setOctave(Number(e.target.value))}
          required
          className="w-full rounded border p-2 font-mono"
        >
          {octaves.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2 text-center bg-gray-50 rounded p-2">
        <span className="text-sm text-gray-600">Selected Frequency:</span>
        <span className="ml-2 font-mono font-medium">{frequency.toFixed(2)} Hz</span>
      </div>
      <p className="text-xs text-gray-500 col-span-2">
        Select the base note for your binaural beat
      </p>
    </div>
  );
} 