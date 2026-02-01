# Quack Sound Files

This directory contains audio files for the application.

## Required Files

- **quack.mp3** or **quack.wav** - The quack sound effect

## Adding the Sound

1. Download a quack sound from a free source (see suggestions below)
2. Place the file in this directory as `quack.mp3` or `quack.wav`
3. The application will automatically use it when users quack

## Recommended Format

- **Format**: MP3 (best browser compatibility)
- **Size**: Under 50KB (recommended)
- **Duration**: 0.5-2 seconds
- **Quality**: 128kbps or higher

## Free Sound Sources

- **Freesound.org**: https://freesound.org/ (search for "duck quack")
  - Requires attribution in some cases
  - License: Varies (check before using)

- **Zapsplat**: https://www.zapsplat.com/
  - Free without attribution required
  - No login needed for download

- **BBC Sound Effects Library**: https://sound-effects.bbcrewind.co.uk/
  - Search for "duck" or "quack"
  - Licensed under CC BY-NC-ND

- **OpenGameArt.org**: https://opengameart.org/
  - Free and open-source sounds
  - Various licenses available

## Example Freesound.org Search

Visit https://freesound.org/search/?q=duck+quack and filter by:
- License: Creative Commons or Attribution only
- Duration: Less than 2 seconds
- Sample rate: 44100 Hz or higher

## Installation

Once you have your audio file:

```bash
# Copy your file to this directory
cp ~/Downloads/quack.mp3 public/sounds/quack.mp3

# Or for .wav format
cp ~/Downloads/quack.wav public/sounds/quack.wav
```

The application will automatically detect and use the file.
