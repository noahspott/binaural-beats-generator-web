import { readFileSync } from 'fs';
import { join } from 'path';

export function combineAudioSegments(
  pitch: string,
  octave: number,
  beatFreq: number,
  durationMinutes: number
): Buffer {
  // Load the 1-second WAV segment
  const filename = `binaural-${pitch}${octave}-${beatFreq}.wav`;
  const segmentPath = join(process.cwd(), 'public', 'audio', filename);
  const segment = readFileSync(segmentPath);

  // Get WAV header and data
  const headerLength = 44; // Standard WAV header length
  const header = segment.subarray(0, headerLength);
  const data = segment.subarray(headerLength);

  // Calculate total data size and create buffer
  const totalSeconds = durationMinutes * 60;
  const totalDataSize = data.length * totalSeconds;
  const finalBuffer = Buffer.alloc(headerLength + totalDataSize);

  // Copy header (modify data size fields)
  header.copy(finalBuffer, 0);
  finalBuffer.writeUInt32LE(totalDataSize + 36, 4); // ChunkSize
  finalBuffer.writeUInt32LE(totalDataSize, 40);     // Subchunk2Size

  // Copy data repeated times
  for (let i = 0; i < totalSeconds; i++) {
    data.copy(finalBuffer, headerLength + (i * data.length));
  }

  return finalBuffer;
} 