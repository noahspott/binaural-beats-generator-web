import { Readable } from 'stream';
import { createReadStream } from 'fs';

export async function* createAudioStream(
  pitch: string,
  beatFreq: number,
  durationMinutes: number
) {
  const segmentPath = `public/audio/binaural-${pitch}-${beatFreq}.wav`;
  const totalSegments = durationMinutes * 60;
  
  // Send segments one by one
  for (let i = 0; i < totalSegments; i++) {
    const segment = createReadStream(segmentPath);
    yield segment;
  }
} 