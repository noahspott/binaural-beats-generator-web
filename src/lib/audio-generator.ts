import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface AudioParams {
  baseFreq: number;
  binauralFreq: number;
  duration: number;
  sampleRate?: number;
  quality?: 'free' | 'premium';
}

export class AudioGenerator {
  private sampleRate: number;
  private bitsPerSample: number = 16;

  constructor(sampleRate = 22050) {
    this.sampleRate = sampleRate;
  }

  private generateSineWave(frequency: number, durationSeconds: number): Float32Array {
    const samples = this.sampleRate * durationSeconds;
    const wave = new Float32Array(samples);
    const angularFreq = 2 * Math.PI * frequency;

    for (let i = 0; i < samples; i++) {
      wave[i] = Math.sin((angularFreq * i) / this.sampleRate);
    }

    return wave;
  }

  private createWavHeader(dataLength: number): Buffer {
    const buffer = Buffer.alloc(44);
    const numChannels = 2;
    const byteRate = this.sampleRate * numChannels * this.bitsPerSample / 8;
    const blockAlign = numChannels * this.bitsPerSample / 8;

    // WAV Header
    buffer.write('RIFF', 0);                               // ChunkID
    buffer.writeUInt32LE(dataLength + 36, 4);             // ChunkSize
    buffer.write('WAVE', 8);                              // Format
    buffer.write('fmt ', 12);                             // Subchunk1ID
    buffer.writeUInt32LE(16, 16);                         // Subchunk1Size
    buffer.writeUInt16LE(1, 20);                          // AudioFormat (PCM)
    buffer.writeUInt16LE(numChannels, 22);                // NumChannels
    buffer.writeUInt32LE(this.sampleRate, 24);            // SampleRate
    buffer.writeUInt32LE(byteRate, 28);                   // ByteRate
    buffer.writeUInt16LE(blockAlign, 32);                 // BlockAlign
    buffer.writeUInt16LE(this.bitsPerSample, 34);         // BitsPerSample
    buffer.write('data', 36);                             // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40);                 // Subchunk2Size

    return buffer;
  }

  private float32ToInt16(float32: number): number {
    // Convert Float32 to Int16
    const s = Math.max(-1, Math.min(1, float32));
    return s < 0 ? s * 0x8000 : s * 0x7FFF;
  }

  private createWavBuffer(leftChannel: Float32Array, rightChannel: Float32Array, volume: number = 1.0): Buffer {
    const numSamples = leftChannel.length;
    const dataLength = numSamples * 4;
    const audioData = Buffer.alloc(dataLength);

    for (let i = 0; i < numSamples; i++) {
      const leftSample = this.float32ToInt16(leftChannel[i] * volume);
      const rightSample = this.float32ToInt16(rightChannel[i] * volume);
      audioData.writeInt16LE(leftSample, i * 4);
      audioData.writeInt16LE(rightSample, i * 4 + 2);
    }

    const header = this.createWavHeader(dataLength);
    return Buffer.concat([header, audioData]);
  }

  async generateBinauralBeat({ baseFreq, binauralFreq, duration, quality = 'free' }: AudioParams): Promise<Buffer> {
    const durationSeconds = duration * 60;
    const leftFreq = baseFreq;
    const rightFreq = baseFreq + binauralFreq;

    const leftChannel = this.generateSineWave(leftFreq, durationSeconds);
    const rightChannel = this.generateSineWave(rightFreq, durationSeconds);

    // Create WAV buffer first
    const volume = quality === 'premium' ? 1.0 : 0.8;
    const wavBuffer = this.createWavBuffer(leftChannel, rightChannel, volume);

    // Convert to MP3 using fluent-ffmpeg
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      ffmpeg()
        .input(Buffer.from(wavBuffer)) // Input WAV buffer
        .inputFormat('wav')
        .audioCodec('libmp3lame')
        .audioBitrate(quality === 'premium' ? 192 : 128)
        .format('mp3')
        .on('error', reject)
        .on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        .on('end', () => {
          resolve(Buffer.concat(chunks));
        })
        .pipe();
    });
  }

  private createInterleavedPCM(leftChannel: Float32Array, rightChannel: Float32Array): Buffer {
    const numSamples = leftChannel.length;
    const buffer = Buffer.alloc(numSamples * 4); // 2 bytes per sample * 2 channels

    for (let i = 0; i < numSamples; i++) {
      const leftSample = this.float32ToInt16(leftChannel[i]);
      const rightSample = this.float32ToInt16(rightChannel[i]);
      buffer.writeInt16LE(leftSample, i * 4);
      buffer.writeInt16LE(rightSample, i * 4 + 2);
    }

    return buffer;
  }

  private createWavFile(pcmData: Buffer): Buffer {
    const dataLength = pcmData.length;
    const header = this.createWavHeader(dataLength);
    return Buffer.concat([header, pcmData]);
  }
} 