/**
 * ElementCraft - Audio Hook
 * 
 * This custom hook manages the game's audio system, including sound effects
 * and background music. It provides functions for playing, stopping, and
 * adjusting audio elements.
 * 
 * @module useAudio
 * @author ElementCraft Team
 * @version 1.0.0
 */

import { useRef, useEffect, useCallback } from 'react';
import { Howl, Howler } from 'howler';

const useAudio = () => {
  // References to store audio instances
  const soundEffects = useRef({});
  const musicTracks = useRef({});
  
  // Reference to store current music track
  const currentMusic = useRef(null);
  
  // Global volumes
  const musicVolume = useRef(0.5);
  const sfxVolume = useRef(0.7);
  
  // Initialize audio system
  useEffect(() => {
    // Define sound effects
    soundEffects.current = {
      buttonClick: new Howl({
        src: ['/assets/sounds/button_click.mp3'],
        volume: sfxVolume.current,
        preload: true
      }),
      placeElement: new Howl({
        src: ['/assets/sounds/place_element.mp3'],
        volume: sfxVolume.current,
        preload: true
      }),
      selectElement: new Howl({
        src: ['/assets/sounds/select_element.mp3'],
        volume: sfxVolume.current,
        preload: true
      }),
      elementReaction: new Howl({
        src: ['/assets/sounds/element_reaction.mp3'],
        volume: sfxVolume.current,
        preload: true
      }),
      levelComplete: new Howl({
        src: ['/assets/sounds/level_complete.mp3'],
        volume: sfxVolume.current,
        preload: true
      }),
      gameOver: new Howl({
        src: ['/assets/sounds/game_over.mp3'],
        volume: sfxVolume.current,
        preload: true
      }),
      // Element-specific sounds
      fire: new Howl({
        src: ['/assets/sounds/fire.mp3'],
        volume: sfxVolume.current * 0.6,
        preload: true
      }),
      water: new Howl({
        src: ['/assets/sounds/water.mp3'],
        volume: sfxVolume.current * 0.6,
        preload: true
      }),
      earth: new Howl({
        src: ['/assets/sounds/earth.mp3'],
        volume: sfxVolume.current * 0.6,
        preload: true
      }),
      air: new Howl({
        src: ['/assets/sounds/air.mp3'],
        volume: sfxVolume.current * 0.6,
        preload: true
      }),
      metal: new Howl({
        src: ['/assets/sounds/metal.mp3'],
        volume: sfxVolume.current * 0.6,
        preload: true
      }),
      wood: new Howl({
        src: ['/assets/sounds/wood.mp3'],
        volume: sfxVolume.current * 0.6,
        preload: true
      })
    };
    
    // Define music tracks
    musicTracks.current = {
      background: new Howl({
        src: ['/assets/music/background.mp3'],
        volume: musicVolume.current,
        loop: true,
        preload: true
      }),
      menu: new Howl({
        src: ['/assets/music/menu.mp3'],
        volume: musicVolume.current,
        loop: true,
        preload: true
      }),
      intense: new Howl({
        src: ['/assets/music/intense.mp3'],
        volume: musicVolume.current,
        loop: true,
        preload: true
      })
    };
    
    // Set up audio context for procedural audio
    if (window.AudioContext) {
      setupProceduralAudio();
    }
    
    // Cleanup when component unmounts
    return () => {
      // Stop all sounds
      Howler.stop();
      
      // Unload all sounds to free memory
      Object.values(soundEffects.current).forEach(sound => {
        sound.unload();
      });
      
      Object.values(musicTracks.current).forEach(music => {
        music.unload();
      });
    };
  }, []);
  
  // Set up procedural audio generation
  const setupProceduralAudio = () => {
    // This function would set up audio synthesis for dynamic sound generation
    // For example, generating sounds based on element interactions
    
    // This is a simplified placeholder - in a real implementation,
    // we would have more sophisticated audio synthesis
    
    // Example: Audio context for synth sounds
    const audioContext = window.audioContext || new (window.AudioContext || window.webkitAudioContext)();
    
    // Store the context for later use
    window.audioContext = audioContext;
  };
  
  // Generate a procedural sound for element combinations
  const generateElementSound = useCallback((element1, element2) => {
    if (!window.audioContext) return;
    
    const audioContext = window.audioContext;
    
    // Create oscillator for the sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Set up audio connections
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Map elements to frequencies
    const frequencies = {
      fire: 440, // A4
      water: 329.63, // E4
      earth: 261.63, // C4
      air: 392, // G4
      metal: 493.88, // B4
      wood: 349.23 // F4
    };
    
    // Set oscillator properties based on elements
    oscillator.type = element1 === 'fire' || element1 === 'metal' ? 'sawtooth' : 'sine';
    oscillator.frequency.value = (frequencies[element1] + frequencies[element2]) / 2;
    
    // Envelope for the sound
    gainNode.gain.value = 0;
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
    
    // Start and stop the sound
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.5);
  }, []);
  
  // Play a sound effect
  const playSound = useCallback((soundName) => {
    if (soundEffects.current[soundName]) {
      soundEffects.current[soundName].play();
    }
  }, []);
  
  // Play background music
  const playMusic = useCallback((trackName) => {
    // Stop current music if playing
    if (currentMusic.current) {
      musicTracks.current[currentMusic.current].stop();
    }
    
    // Play new track if it exists
    if (musicTracks.current[trackName]) {
      musicTracks.current[trackName].play();
      currentMusic.current = trackName;
    }
  }, []);
  
  // Stop background music
  const stopMusic = useCallback((trackName) => {
    if (trackName && musicTracks.current[trackName]) {
      musicTracks.current[trackName].stop();
      if (currentMusic.current === trackName) {
        currentMusic.current = null;
      }
    } else if (!trackName && currentMusic.current) {
      // Stop all music if no track specified
      musicTracks.current[currentMusic.current].stop();
      currentMusic.current = null;
    }
  }, []);
  
  // Set music volume
  const setMusicVolume = useCallback((volume) => {
    // Ensure volume is between 0 and 1
    const safeVolume = Math.max(0, Math.min(volume, 1));
    musicVolume.current = safeVolume;
    
    // Update volume for all music tracks
    Object.values(musicTracks.current).forEach(track => {
      track.volume(safeVolume);
    });
  }, []);
  
  // Set sound effects volume
  const setSfxVolume = useCallback((volume) => {
    // Ensure volume is between 0 and 1
    const safeVolume = Math.max(0, Math.min(volume, 1));
    sfxVolume.current = safeVolume;
    
    // Update volume for all sound effects
    Object.values(soundEffects.current).forEach(sound => {
      sound.volume(safeVolume);
    });
  }, []);
  
  return {
    playSound,
    playMusic,
    stopMusic,
    setMusicVolume,
    setSfxVolume,
    generateElementSound
  };
};

export default useAudio;