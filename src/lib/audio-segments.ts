interface AudioSegment {
  frequency: number;
  samples: Float32Array;
}

export class AudioSegmentManager {
  private segments: Map<number, AudioSegment>;
  private sampleRate: number = 22050; // Lower sample rate for smaller files
  private segmentDuration: number = 1; // 1 second segments

  constructor() {
    this.segments = new Map();
    this.generateCommonFrequencies();
  }

  private generateCommonFrequencies() {
    // Common base frequencies (A4 = 440Hz and nearby)
    const baseFreqs = [432, 436, 440, 444, 448];
    
    // Common binaural beat frequencies
    const beatFreqs = [
      0.5,  // Low Delta
      2.0,  // Delta
      4.0,  // Theta
      8.0,  // Alpha
      12.0, // High Alpha
      16.0, // Beta
      24.0, // High Beta
      32.0, // Gamma
      40.0  // Gamma
    ];

    // Generate all combinations
    for (const base of baseFreqs) {
      this.generateSegment(base);
      for (const beat of beatFreqs) {
        this.generateSegment(base + beat);
      }
    }
  }

  private generateSegment(frequency: number): void {
    const samples = new Float32Array(this.sampleRate * this.segmentDuration);
    const angularFreq = 2 * Math.PI * frequency;

    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.sin((angularFreq * i) / this.sampleRate);
    }

    this.segments.set(frequency, { frequency, samples });
  }

  getClosestFrequency(target: number): number {
    let closest = Array.from(this.segments.keys()).reduce((prev, curr) => {
      return Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev;
    });
    return closest;
  }

  combineSegments(baseFreq: number, binauralFreq: number, durationSeconds: number): { left: Float32Array, right: Float32Array } {
    const leftFreq = this.getClosestFrequency(baseFreq);
    const rightFreq = this.getClosestFrequency(baseFreq + binauralFreq);

    const leftBase = this.segments.get(leftFreq)!.samples;
    const rightBase = this.segments.get(rightFreq)!.samples;

    // Calculate total samples needed
    const totalSamples = this.sampleRate * durationSeconds;
    const left = new Float32Array(totalSamples);
    const right = new Float32Array(totalSamples);

    // Repeat the segments to fill the duration
    for (let i = 0; i < totalSamples; i++) {
      left[i] = leftBase[i % leftBase.length];
      right[i] = rightBase[i % rightBase.length];
    }

    return { left, right };
  }
} 