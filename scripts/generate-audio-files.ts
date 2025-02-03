import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { pitches, octaves, binauralBeats, isValidNote } from '../src/lib/frequencies';

// Create output directory in src/assets
const OUTPUT_DIR = join(process.cwd(), 'src', 'assets', 'audio', 'mp3');
mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateAllFiles() {
  // For each valid pitch/octave combination
  for (const pitch of pitches) {
    for (const octave of octaves) {
      if (!isValidNote(pitch, octave)) continue;
      
      // For each binaural frequency
      for (const beat of binauralBeats) {
        const filename = `binaural-${pitch}${octave}-${beat.freq}.mp3`;
        console.log(`Generating ${filename}...`);
        
        // Generate and save file
        // ... we'll implement this next
      }
    }
  }
}

generateAllFiles().catch(console.error); 