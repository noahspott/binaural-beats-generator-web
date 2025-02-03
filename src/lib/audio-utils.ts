import { readFileSync } from 'fs';
import { join } from 'path';

export function getClosestFrequencies(baseFreq: number, binauralFreq: number): {
  base: number;
  beat: number;
} {
  const baseFreqs = [432, 436, 440, 444, 448];
  const beatFreqs = [0.5, 2.0, 4.0, 8.0, 12.0, 16.0, 24.0, 32.0, 40.0];

  const closestBase = baseFreqs.reduce((prev, curr) => 
    Math.abs(curr - baseFreq) < Math.abs(prev - baseFreq) ? curr : prev
  );

  const closestBeat = beatFreqs.reduce((prev, curr) => 
    Math.abs(curr - binauralFreq) < Math.abs(prev - binauralFreq) ? curr : prev
  );

  return { base: closestBase, beat: closestBeat };
}

export function loadAudioSegment(baseFreq: number, beatFreq: number): Buffer {
  const filename = join(process.cwd(), 'public', 'audio', `binaural-${baseFreq}-${beatFreq}.wav`);
  return readFileSync(filename);
} 