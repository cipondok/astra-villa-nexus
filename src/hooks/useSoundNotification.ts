import { useState, useCallback, useEffect } from "react";

/**
 * Hook to play sound notifications using Web Audio API
 * Creates a soft chime sound without external audio files
 */
export const useSoundNotification = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize Audio Context on mount
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);

    // Load muted state from localStorage
    const savedMuted = localStorage.getItem('chat_sound_muted');
    if (savedMuted === 'true') {
      setIsMuted(true);
    }

    return () => {
      ctx.close();
    };
  }, []);

  // Play soft chime notification
  const playNotification = useCallback(() => {
    if (isMuted || !audioContext) return;

    try {
      // Resume context if suspended (browser policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Soft chime: two quick notes (E5 -> A5)
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1); // A5

      // Volume envelope: fade in and out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);

      oscillator.type = 'sine'; // Soft sine wave
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }, [isMuted, audioContext]);

  // Toggle mute and persist to localStorage
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      localStorage.setItem('chat_sound_muted', String(newMuted));
      return newMuted;
    });
  }, []);

  return {
    playNotification,
    isMuted,
    toggleMute,
  };
};
