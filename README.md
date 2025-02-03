# Binaural Beats Generator

A web application that generates binaural beats for various frequencies, built with Astro.

## Pre-requisites
- Node.js (v18+)
- npm

## Development Setup

1. Install dependencies:
```sh
npm install

# Install type definitions for fluent-ffmpeg
npm i --save-dev @types/fluent-ffmpeg
```

2. Generate audio segments:
```sh
npm run generate-audio
```
⚠️ **Critical**: This step generates the audio files needed for the application to work.

3. Start development server:
```sh
npm run dev
```

## 🚀 Project Structure

```text
/
├── public/
│   ├── audio/              # Pre-generated audio segments
│   │   └── binaural-*.wav  # Audio files named by frequency
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   ├── audio-utils.ts  # Audio helper functions
│   │   └── rate-limiter.ts # Rate limiting logic
│   └── pages/
│       ├── index.astro
│       └── api/
│           └── get-binaural-beats.ts
├── scripts/
│   └── generate-audio-files.ts  # Audio generation script
└── package.json
```

## Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run generate-audio`  | Generates audio segments (required before build) |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## 🎵 Audio Generation

The application uses pre-generated audio segments with these frequencies:

Base frequencies:
- 432 Hz
- 436 Hz
- 440 Hz (A4)
- 444 Hz
- 448 Hz

Binaural beat frequencies:
- 0.5 Hz (Low Delta)
- 2.0 Hz (Delta)
- 4.0 Hz (Theta)
- 8.0 Hz (Alpha)
- 12.0 Hz (High Alpha)
- 16.0 Hz (Beta)
- 24.0 Hz (High Beta)
- 32.0 Hz (Gamma)
- 40.0 Hz (High Gamma)

## Audio Generation Setup

The project requires Python for generating audio files during the build process.

### Prerequisites

1. Python 3.x
2. FFmpeg
3. Python packages:
   ```bash
   pip install numpy scipy
   ```

### Build Process

Audio files are automatically generated during build:
```bash
npm run build
```

To generate audio files manually:
```bash
python scripts/generate_audio.py  # Generate WAV files
python scripts/convert_to_mp3.py  # Convert to MP3
```

Generated files are stored in:
- `src/assets/audio/wav/` - WAV files
- `src/assets/audio/mp3/` - MP3 files

## 🏗️ Build and Deployment

### Pre-deployment Checklist
1. ✅ Run audio generation:
```sh
npm run generate-audio
```
2. ✅ Verify audio files exist in `public/audio/`
3. ✅ Build the application:
```sh
npm run build
```

### Technical Specifications
- Audio Format: WAV
- Sample Rate: 22050 Hz
- Duration: 1-second segments
- File Naming: `binaural-{baseFreq}-{beatFreq}.wav`
- Storage Location: `public/audio/`

## 🔒 Rate Limiting
- Free tier: 1 download per day per IP
- IP addresses are hashed for privacy
- Limits reset after 24 hours

## 🚀 Future Improvements

- [ ] MP3 conversion for smaller file sizes
- [ ] Premium features:
  - [ ] Higher quality audio (44.1kHz)
  - [ ] Longer durations
  - [ ] Custom frequencies
  - [ ] Advanced waveforms
- [ ] Volume control and fade effects
- [ ] Progress tracking for generation
- [ ] Audio preview before download

## 👀 Want to learn more?

Check out [Astro's documentation](https://docs.astro.build) for more information about the framework.
