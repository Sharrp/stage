/**
 * Audio utility for playing sound effects
 */

interface AudioPlayOptions {
  volume?: number;
  onError?: (error: Error) => void;
}

/**
 * Plays the quack sound effect
 * @param options - Configuration options for playback
 */
export async function playQuackSound(options: AudioPlayOptions = {}): Promise<void> {
  const { volume = 1, onError } = options;
  const formats = ['quack.wav', 'quack.mp3']; // Try WAV first, then MP3

  for (const format of formats) {
    try {
      // Create audio element
      const audio = new Audio(`/sounds/${format}`);
      audio.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1

      // Handle errors
      audio.onerror = () => {
        // Continue to next format
      };

      // Play the sound
      await audio.play();
      return; // Success, exit
    } catch (error) {
      // Try next format
      continue;
    }
  }

  // No format worked
  const err = new Error('Failed to load quack sound - no audio file found');
  console.error(err);
  onError?.(err);
}

/**
 * Preloads the quack sound for faster playback
 * Call this during app initialization
 */
export async function preloadQuackSound(): Promise<void> {
  const formats = ['quack.wav', 'quack.mp3'];

  for (const format of formats) {
    try {
      const audio = new Audio(`/sounds/${format}`);
      audio.preload = 'auto';

      // Wait for the audio to load metadata
      await new Promise<void>((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve();
        };

        const handleError = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          reject(new Error(`Failed to preload ${format}`));
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        // Trigger the loading
        audio.load();
      });

      return; // Success, exit
    } catch (error) {
      // Try next format
      continue;
    }
  }

  // Preload errors are non-fatal
  console.warn('Could not preload quack sound - no audio file found');
}
