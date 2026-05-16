import { useState, useCallback, useEffect } from 'react';

export type SoundEvent = 'newMessage' | 'countdownWarning' | 'collapse' | 'open' | 'close';

interface CustomSound {
  event: SoundEvent;
  audioData: string; // Base64 encoded audio
  fileName: string;
}

const STORAGE_KEY = 'chatbot-custom-sounds';
const MAX_FILE_SIZE = 1024 * 1024; // 1MB limit per audio file

/**
 * Hook to manage custom notification sounds for different chat events
 */
export const useCustomSounds = () => {
  const [customSounds, setCustomSounds] = useState<Map<SoundEvent, CustomSound>>(new Map());
  const [audioElements, setAudioElements] = useState<Map<SoundEvent, HTMLAudioElement>>(new Map());

  // Load custom sounds from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const soundsArray: CustomSound[] = JSON.parse(stored);
        const soundsMap = new Map<SoundEvent, CustomSound>();
        const audioMap = new Map<SoundEvent, HTMLAudioElement>();

        soundsArray.forEach(sound => {
          soundsMap.set(sound.event, sound);
          // Create audio element from base64 data
          const audio = new Audio(sound.audioData);
          audio.volume = 0.5;
          audioMap.set(sound.event, audio);
        });

        setCustomSounds(soundsMap);
        setAudioElements(audioMap);
      }
    } catch (error) {
      console.error('Error loading custom sounds:', error);
    }
  }, []);

  // Save custom sounds to localStorage
  const saveSounds = useCallback((sounds: Map<SoundEvent, CustomSound>) => {
    try {
      const soundsArray = Array.from(sounds.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(soundsArray));
    } catch (error) {
      console.error('Error saving custom sounds:', error);
      throw new Error('Failed to save custom sound. Storage might be full.');
    }
  }, []);

  // Upload and set custom sound for an event
  const uploadSound = useCallback(async (event: SoundEvent, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        reject(new Error('File must be an audio file'));
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error('Audio file must be less than 1MB'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const audioData = e.target?.result as string;
          
          // Validate audio data
          if (!audioData) {
            reject(new Error('Failed to read audio file'));
            return;
          }

          // Create audio element to test if it's valid
          const audio = new Audio(audioData);
          audio.volume = 0.5;

          audio.onerror = () => {
            reject(new Error('Invalid audio file format'));
          };

          audio.onloadeddata = () => {
            const customSound: CustomSound = {
              event,
              audioData,
              fileName: file.name,
            };

            const newSounds = new Map(customSounds);
            newSounds.set(event, customSound);

            const newAudioElements = new Map(audioElements);
            newAudioElements.set(event, audio);

            setCustomSounds(newSounds);
            setAudioElements(newAudioElements);
            saveSounds(newSounds);

            resolve();
          };
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };

      reader.readAsDataURL(file);
    });
  }, [customSounds, audioElements, saveSounds]);

  // Remove custom sound for an event
  const removeSound = useCallback((event: SoundEvent) => {
    const newSounds = new Map(customSounds);
    newSounds.delete(event);

    const newAudioElements = new Map(audioElements);
    const audio = newAudioElements.get(event);
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    newAudioElements.delete(event);

    setCustomSounds(newSounds);
    setAudioElements(newAudioElements);
    saveSounds(newSounds);
  }, [customSounds, audioElements, saveSounds]);

  // Play custom sound for an event
  const playCustomSound = useCallback((event: SoundEvent) => {
    const audio = audioElements.get(event);
    if (audio) {
      try {
        // Reset and play
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.error('Error playing custom sound:', error);
        });
      } catch (error) {
        console.error('Error playing custom sound:', error);
      }
    }
  }, [audioElements]);

  // Check if custom sound exists for an event
  const hasCustomSound = useCallback((event: SoundEvent) => {
    return customSounds.has(event);
  }, [customSounds]);

  // Get custom sound info for an event
  const getCustomSound = useCallback((event: SoundEvent) => {
    return customSounds.get(event);
  }, [customSounds]);

  // Reset all custom sounds
  const resetAllSounds = useCallback(() => {
    // Pause and cleanup all audio elements
    audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
    });

    setCustomSounds(new Map());
    setAudioElements(new Map());
    localStorage.removeItem(STORAGE_KEY);
  }, [audioElements]);

  return {
    uploadSound,
    removeSound,
    playCustomSound,
    hasCustomSound,
    getCustomSound,
    resetAllSounds,
    customSounds: Array.from(customSounds.values()),
  };
};
