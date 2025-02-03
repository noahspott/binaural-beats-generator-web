from pathlib import Path
import subprocess

WAV_DIR = Path("src/assets/audio/wav")
MP3_DIR = Path("src/assets/audio/mp3")

def convert_to_mp3(wav_path: Path) -> None:
    """Convert WAV to MP3 using ffmpeg."""
    try:
        mp3_path = MP3_DIR / wav_path.name.replace('.wav', '.mp3')
        result = subprocess.run([
            'ffmpeg', '-i', str(wav_path),
            '-codec:a', 'libmp3lame',
            '-qscale:a', '2',
            str(mp3_path)
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"Error converting {wav_path.name}: {result.stderr}")
    except Exception as e:
        print(f"Failed to convert {wav_path.name}: {str(e)}")

def main():
    MP3_DIR.mkdir(parents=True, exist_ok=True)
    wav_files = WAV_DIR.glob("*.wav")
    for wav_file in wav_files:
        print(f"Converting {wav_file.name} to MP3")
        convert_to_mp3(wav_file)

if __name__ == "__main__":
    main() 