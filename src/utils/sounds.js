/**
 * ElementCraft - Sound Utilities
 * 
 * This module handles sound generation, audio processing, and
 * synthesis of procedural audio for the game's sound effects.
 * 
 * @module sounds
 * @author ElementCraft Team
 * @version 1.0.0
 */

import { elementSounds } from '../constants/elements';

// Audio context reference
let audioContext = null;

// Master volume controls
const masterVolume = {
  sfx: 0.7,
  music: 0.5,
  ambience: 0.3
};

// Audio node references
const audioNodes = {
  masterGain: null,
  sfxGain: null,
  musicGain: null,
  ambienceGain: null
};

// Sound cache for generated sounds
const soundCache = {};

/**
 * Initialize the audio system
 * 
 * @returns {boolean} Whether initialization was successful
 */
export const initializeAudio = () => {
  try {
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    
    // Create audio graph for mixing
    audioNodes.masterGain = audioContext.createGain();
    audioNodes.masterGain.gain.value = 1.0;
    audioNodes.masterGain.connect(audioContext.destination);
    
    // Create separate channels for different sound types
    audioNodes.sfxGain = audioContext.createGain();
    audioNodes.sfxGain.gain.value = masterVolume.sfx;
    audioNodes.sfxGain.connect(audioNodes.masterGain);
    
    audioNodes.musicGain = audioContext.createGain();
    audioNodes.musicGain.gain.value = masterVolume.music;
    audioNodes.musicGain.connect(audioNodes.masterGain);
    
    audioNodes.ambienceGain = audioContext.createGain();
    audioNodes.ambienceGain.gain.value = masterVolume.ambience;
    audioNodes.ambienceGain.connect(audioNodes.masterGain);
    
    // Pre-generate common sounds
    preGenerateSounds();
    
    return true;
  } catch (error) {
    console.error('Audio initialization failed:', error);
    return false;
  }
};

/**
 * Pre-generate common sound effects for better performance
 */
const preGenerateSounds = () => {
  // Generate element placement sounds
  Object.keys(elementSounds).forEach(element => {
    if (elementSounds[element].place) {
      const settings = elementSounds[element].place;
      const buffer = generateTone(
        settings.frequency,
        settings.waveform,
        settings.duration,
        settings.volume
      );
      soundCache[`place_${element}`] = buffer;
    }
  });
  
  // Generate UI sounds
  soundCache.button_click = generateClickSound();
  soundCache.menu_open = generateMenuSound(true);
  soundCache.menu_close = generateMenuSound(false);
  soundCache.success = generateSuccessSound();
  soundCache.error = generateErrorSound();
  soundCache.level_complete = generateLevelCompleteSound();
};

/**
 * Set volume levels
 * 
 * @param {string} type - Volume type ('master', 'sfx', 'music', 'ambience')
 * @param {number} value - Volume value (0-1)
 */
export const setVolume = (type, value) => {
  // Ensure value is between 0 and 1
  const safeValue = Math.max(0, Math.min(value, 1));
  
  switch (type) {
    case 'master':
      if (audioNodes.masterGain) {
        audioNodes.masterGain.gain.value = safeValue;
      }
      break;
      
    case 'sfx':
      masterVolume.sfx = safeValue;
      if (audioNodes.sfxGain) {
        audioNodes.sfxGain.gain.value = safeValue;
      }
      break;
      
    case 'music':
      masterVolume.music = safeValue;
      if (audioNodes.musicGain) {
        audioNodes.musicGain.gain.value = safeValue;
      }
      break;
      
    case 'ambience':
      masterVolume.ambience = safeValue;
      if (audioNodes.ambienceGain) {
        audioNodes.ambienceGain.gain.value = safeValue;
      }
      break;
      
    default:
      console.warn(`Unknown volume type: ${type}`);
  }
};

/**
 * Generate a basic tone
 * 
 * @param {number} frequency - Frequency in Hz
 * @param {string} waveform - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 * @returns {AudioBuffer} Generated audio buffer
 */
export const generateTone = (
  frequency = 440,
  waveform = 'sine',
  duration = 0.3,
  volume = 0.5
) => {
  if (!audioContext) return null;
  
  // Create an empty stereo buffer
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(
    2,                       // 2 channels (stereo)
    duration * sampleRate,   // Number of samples
    sampleRate               // Sample rate
  );
  
  // Fill the buffer with the waveform
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  for (let i = 0; i < buffer.length; i++) {
    // Time in seconds
    const time = i / sampleRate;
    
    // Base sample value
    let sample = 0;
    
    // Generate different waveforms
    switch (waveform) {
      case 'sine':
        sample = Math.sin(2 * Math.PI * frequency * time);
        break;
        
      case 'square':
        sample = Math.sin(2 * Math.PI * frequency * time) >= 0 ? 1 : -1;
        break;
        
      case 'sawtooth':
        sample = 2 * ((frequency * time) % 1) - 1;
        break;
        
      case 'triangle':
        const normalized = (frequency * time) % 1;
        sample = normalized < 0.5 
          ? 4 * normalized - 1 
          : 3 - 4 * normalized;
        break;
        
      default:
        sample = Math.sin(2 * Math.PI * frequency * time);
    }
    
    // Apply amplitude envelope (ADSR)
    const attackTime = 0.01;
    const decayTime = 0.05;
    const sustainLevel = 0.7;
    const releaseTime = 0.1;
    
    let envelope = 0;
    
    if (time < attackTime) {
      // Attack phase
      envelope = time / attackTime;
    } else if (time < attackTime + decayTime) {
      // Decay phase
      const decayProgress = (time - attackTime) / decayTime;
      envelope = 1 - (1 - sustainLevel) * decayProgress;
    } else if (time < duration - releaseTime) {
      // Sustain phase
      envelope = sustainLevel;
    } else {
      // Release phase
      const releaseProgress = (time - (duration - releaseTime)) / releaseTime;
      envelope = sustainLevel * (1 - releaseProgress);
    }
    
    // Apply volume and envelope
    sample *= volume * envelope;
    
    // Fill both channels
    leftChannel[i] = sample;
    rightChannel[i] = sample;
  }
  
  return buffer;
};

/**
 * Generate a click sound for UI interactions
 * 
 * @returns {AudioBuffer} Generated audio buffer
 */
export const generateClickSound = () => {
  if (!audioContext) return null;
  
  const duration = 0.1;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
  
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  // Create a sharp click sound
  for (let i = 0; i < buffer.length; i++) {
    const time = i / sampleRate;
    
    // Main click
    let sample = Math.sin(2 * Math.PI * 1200 * time);
    
    // Add some higher frequencies for the "click" character
    sample += 0.5 * Math.sin(2 * Math.PI * 2400 * time);
    sample += 0.25 * Math.sin(2 * Math.PI * 3600 * time);
    
    // Apply a sharp envelope
    const envelope = Math.exp(-30 * time);
    
    // Apply volume and envelope
    sample *= 0.5 * envelope;
    
    // Fill both channels
    leftChannel[i] = sample;
    rightChannel[i] = sample;
  }
  
  return buffer;
};

/**
 * Generate a menu open/close sound
 * 
 * @param {boolean} isOpening - Whether the menu is opening (true) or closing (false)
 * @returns {AudioBuffer} Generated audio buffer
 */
export const generateMenuSound = (isOpening = true) => {
  if (!audioContext) return null;
  
  const duration = 0.3;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
  
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  // Create a menu sound
  for (let i = 0; i < buffer.length; i++) {
    const time = i / sampleRate;
    
    // Base frequency sweep
    const startFreq = isOpening ? 300 : 600;
    const endFreq = isOpening ? 600 : 300;
    const frequency = startFreq + (endFreq - startFreq) * (time / duration);
    
    // Generate a sine wave with the frequency sweep
    let sample = Math.sin(2 * Math.PI * frequency * time);
    
    // Add a higher frequency component for texture
    sample += 0.3 * Math.sin(2 * Math.PI * frequency * 2 * time);
    
    // Apply envelope
    let envelope;
    if (isOpening) {
      envelope = Math.min(1, time * 10) * Math.exp(-5 * time);
    } else {
      envelope = Math.min(1, (duration - time) * 10) * Math.exp(-5 * time);
    }
    
    // Apply volume and envelope
    sample *= 0.5 * envelope;
    
    // Fill both channels
    leftChannel[i] = sample;
    rightChannel[i] = sample;
  }
  
  return buffer;
};

/**
 * Generate a success sound
 * 
 * @returns {AudioBuffer} Generated audio buffer
 */
export const generateSuccessSound = () => {
  if (!audioContext) return null;
  
  const duration = 0.6;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
  
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  // Create a success sound (ascending arpeggio)
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  for (let i = 0; i < buffer.length; i++) {
    const time = i / sampleRate;
    
    // Determine which note to play
    const noteIndex = Math.floor((time / duration) * notes.length);
    const currentNote = notes[Math.min(noteIndex, notes.length - 1)];
    
    // Generate a sine wave for the current note
    let sample = Math.sin(2 * Math.PI * currentNote * time);
    
    // Add some harmonics
    sample += 0.3 * Math.sin(2 * Math.PI * currentNote * 2 * time);
    sample += 0.15 * Math.sin(2 * Math.PI * currentNote * 3 * time);
    
    // Apply envelope
    const noteTime = duration / notes.length;
    const notePosition = time % noteTime;
    const envelope = Math.min(1, notePosition * 20) * Math.exp(-10 * notePosition);
    
    // Apply volume and envelope
    sample *= 0.5 * envelope;
    
    // Fill both channels
    leftChannel[i] = sample;
    rightChannel[i] = sample;
  }
  
  return buffer;
};

/**
 * Generate an error sound
 * 
 * @returns {AudioBuffer} Generated audio buffer
 */
export const generateErrorSound = () => {
  if (!audioContext) return null;
  
  const duration = 0.4;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
  
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  // Create an error sound (descending minor notes)
  const notes = [440, 415.30, 392]; // A4, G#4, G4
  
  for (let i = 0; i < buffer.length; i++) {
    const time = i / sampleRate;
    
    // Determine which note to play
    const noteIndex = Math.floor((time / duration) * notes.length);
    const currentNote = notes[Math.min(noteIndex, notes.length - 1)];
    
    // Generate a sawtooth wave for the current note
    let sample = 2 * ((currentNote * time) % 1) - 1;
    
    // Apply distortion for an "error" sound
    sample = Math.tanh(sample * 2) * 0.5;
    
    // Apply envelope
    const noteTime = duration / notes.length;
    const notePosition = time % noteTime;
    const envelope = Math.min(1, notePosition * 20) * Math.exp(-8 * notePosition);
    
    // Apply volume and envelope
    sample *= 0.4 * envelope;
    
    // Fill both channels
    leftChannel[i] = sample;
    rightChannel[i] = sample;
  }
  
  return buffer;
};

/**
 * Generate a level complete fanfare
 * 
 * @returns {AudioBuffer} Generated audio buffer
 */
export const generateLevelCompleteSound = () => {
  if (!audioContext) return null;
  
  const duration = 2.0;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
  
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  // Create a fanfare sound
  // C major triad arpeggio followed by a final chord
  const sequence = [
    { note: 523.25, time: 0.0, duration: 0.2 },    // C5
    { note: 659.25, time: 0.2, duration: 0.2 },    // E5
    { note: 783.99, time: 0.4, duration: 0.2 },    // G5
    { note: 1046.50, time: 0.6, duration: 0.2 },   // C6
    { note: 783.99, time: 0.8, duration: 0.2 },    // G5
    { note: 1046.50, time: 1.0, duration: 0.2 },   // C6
    // Final chord (C major)
    { note: 523.25, time: 1.2, duration: 0.8 },    // C5
    { note: 659.25, time: 1.2, duration: 0.8 },    // E5
    { note: 783.99, time: 1.2, duration: 0.8 },    // G5
    { note: 1046.50, time: 1.2, duration: 0.8 }    // C6
  ];
  
  for (let i = 0; i < buffer.length; i++) {
    const time = i / sampleRate;
    let sample = 0;
    
    // Add each note to the sample
    for (const note of sequence) {
      if (time >= note.time && time < note.time + note.duration) {
        const noteTime = time - note.time;
        
        // Generate a sine wave for the note
        sample += 0.3 * Math.sin(2 * Math.PI * note.note * time);
        
        // Apply ADSR envelope
        const attackTime = 0.01;
        const decayTime = 0.05;
        const sustainLevel = 0.7;
        const releaseTime = 0.1;
        
        let envelope = 0;
        
        if (noteTime < attackTime) {
          // Attack phase
          envelope = noteTime / attackTime;
        } else if (noteTime < attackTime + decayTime) {
          // Decay phase
          const decayProgress = (noteTime - attackTime) / decayTime;
          envelope = 1 - (1 - sustainLevel) * decayProgress;
        } else if (noteTime < note.duration - releaseTime) {
          // Sustain phase
          envelope = sustainLevel;
        } else {
          // Release phase
          const releaseProgress = (noteTime - (note.duration - releaseTime)) / releaseTime;
          envelope = sustainLevel * (1 - releaseProgress);
        }
        
        sample *= envelope;
      }
    }
    
    // Fill both channels
    leftChannel[i] = sample;
    rightChannel[i] = sample;
  }
  
  return buffer;
};

/**
 * Generate an element interaction sound
 * 
 * @param {string} element1 - First element type
 * @param {string} element2 - Second element type
 * @returns {AudioBuffer} Generated audio buffer
 */
export const generateElementInteractionSound = (element1, element2) => {
  if (!audioContext) return null;
  
  // Get frequencies for the elements
  const getElementFrequency = (element) => {
    const frequencies = {
      fire: 440,    // A4
      water: 329.63, // E4
      earth: 261.63, // C4
      air: 392,     // G4
      metal: 493.88, // B4
      wood: 349.23, // F4
      crystal: 523.25, // C5
      steam: 466.16, // A#4/Bb4
      lava: 415.30, // G#4/Ab4
      sand: 293.66, // D4
      cloud: 369.99, // F#4/Gb4
      plasma: 587.33 // D5
    };
    
    return frequencies[element] || 440;
  };
  
  // Get waveform for the element
  const getElementWaveform = (element) => {
    const waveforms = {
      fire: 'sawtooth',
      water: 'sine',
      earth: 'triangle',
      air: 'sine',
      metal: 'square',
      wood: 'triangle',
      crystal: 'sine',
      steam: 'sine',
      lava: 'sawtooth',
      sand: 'triangle',
      cloud: 'sine',
      plasma: 'sawtooth'
    };
    
    return waveforms[element] || 'sine';
  };
  
  const freq1 = getElementFrequency(element1);
  const freq2 = getElementFrequency(element2);
  const wave1 = getElementWaveform(element1);
  const wave2 = getElementWaveform(element2);
  
  // Generate a more complex interaction sound
  const duration = 0.5;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate);
  
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  for (let i = 0; i < buffer.length; i++) {
    const time = i / sampleRate;
    
    // Calculate frequency sweep
    const sweepFactor = 1 - time / duration;
    const frequency1 = freq1 * (1 + 0.2 * sweepFactor);
    const frequency2 = freq2 * (1 - 0.1 * sweepFactor);
    
    // Generate samples for each element
    let sample1 = 0;
    let sample2 = 0;
    
    // First element
    switch (wave1) {
      case 'sine':
        sample1 = Math.sin(2 * Math.PI * frequency1 * time);
        break;
      case 'square':
        sample1 = Math.sin(2 * Math.PI * frequency1 * time) >= 0 ? 1 : -1;
        break;
      case 'sawtooth':
        sample1 = 2 * ((frequency1 * time) % 1) - 1;
        break;
      case 'triangle':
        const normalized1 = (frequency1 * time) % 1;
        sample1 = normalized1 < 0.5 
          ? 4 * normalized1 - 1 
          : 3 - 4 * normalized1;
        break;
    }
    
    // Second element
    switch (wave2) {
      case 'sine':
        sample2 = Math.sin(2 * Math.PI * frequency2 * time);
        break;
      case 'square':
        sample2 = Math.sin(2 * Math.PI * frequency2 * time) >= 0 ? 1 : -1;
        break;
      case 'sawtooth':
        sample2 = 2 * ((frequency2 * time) % 1) - 1;
        break;
      case 'triangle':
        const normalized2 = (frequency2 * time) % 1;
        sample2 = normalized2 < 0.5 
          ? 4 * normalized2 - 1 
          : 3 - 4 * normalized2;
        break;
    }
    
    // Mix the samples
    let sample = 0.5 * sample1 + 0.5 * sample2;
    
    // Add some harmonics and interactions
    sample += 0.2 * Math.sin(2 * Math.PI * (frequency1 + frequency2) * 0.5 * time);
    
    // Apply envelope
    const envelope = Math.exp(-5 * time);
    
    // Apply volume and envelope
    sample *= 0.5 * envelope;
    
    // Apply stereo panning
    const panning = Math.sin(2 * Math.PI * 2 * time) * 0.2;
    leftChannel[i] = sample * (1 - panning);
    rightChannel[i] = sample * (1 + panning);
  }
  
  return buffer;
};

/**
 * Play a sound from the sound cache or generate it
 * 
 * @param {string} soundId - Sound identifier
 * @param {Object} options - Playback options
 * @returns {Object} Sound source node and gain node
 */
export const playSound = (soundId, options = {}) => {
  if (!audioContext) return null;
  
  // Resume audio context if suspended (needed for browsers with autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  // Get the sound buffer
  let buffer = soundCache[soundId];
  
  // If not in cache, generate based on sound type
  if (!buffer) {
    if (soundId.startsWith('place_')) {
      const element = soundId.replace('place_', '');
      if (elementSounds[element]?.place) {
        const settings = elementSounds[element].place;
        buffer = generateTone(
          settings.frequency,
          settings.waveform,
          settings.duration,
          settings.volume
        );
      }
    } else if (soundId.startsWith('interaction_')) {
      const [_, element1, element2] = soundId.split('_');
      buffer = generateElementInteractionSound(element1, element2);
    }
  }
  
  // If still no buffer, return null
  if (!buffer) return null;
  
  // Create source node
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  
  // Create gain node for this sound
  const gainNode = audioContext.createGain();
  gainNode.gain.value = options.volume ?? 1.0;
  
  // Connect nodes
  source.connect(gainNode);
  gainNode.connect(options.type === 'music' 
    ? audioNodes.musicGain 
    : options.type === 'ambience'
      ? audioNodes.ambienceGain
      : audioNodes.sfxGain
  );
  
  // Set playback options
  if (options.loop) {
    source.loop = true;
  }
  
  if (options.playbackRate) {
    source.playbackRate.value = options.playbackRate;
  }
  
  // Start playback
  const startTime = options.delay 
    ? audioContext.currentTime + options.delay 
    : audioContext.currentTime;
    
  source.start(startTime);
  
  // Set up stop logic if duration provided
  if (options.duration) {
    source.stop(startTime + options.duration);
  }
  
  return { source, gain: gainNode };
};

/**
 * Stop sound playback
 * 
 * @param {Object} sound - Sound object returned by playSound
 * @param {number} fadeOutTime - Fade-out time in seconds
 */
export const stopSound = (sound, fadeOutTime = 0.1) => {
  if (!sound || !sound.gain) return;
  
  // Apply fade-out
  if (fadeOutTime > 0) {
    const currentTime = audioContext.currentTime;
    sound.gain.gain.setValueAtTime(sound.gain.gain.value, currentTime);
    sound.gain.gain.linearRampToValueAtTime(0, currentTime + fadeOutTime);
    
    // Stop the source after fade-out
    setTimeout(() => {
      if (sound.source) {
        sound.source.stop();
      }
    }, fadeOutTime * 1000);
  } else {
    // Stop immediately
    if (sound.source) {
      sound.source.stop();
    }
  }
};

/**
 * Generate and play a sound for element placement
 * 
 * @param {string} element - Element type
 * @returns {Object} Sound object
 */
export const playElementSound = (element) => {
  const soundId = `place_${element}`;
  return playSound(soundId);
};

/**
 * Generate and play a sound for element interaction
 * 
 * @param {string} element1 - First element type
 * @param {string} element2 - Second element type
 * @returns {Object} Sound object
 */
export const playInteractionSound = (element1, element2) => {
  const soundId = `interaction_${element1}_${element2}`;
  return playSound(soundId);
};

/**
 * Play UI click sound
 * 
 * @returns {Object} Sound object
 */
export const playClickSound = () => {
  return playSound('button_click');
};

/**
 * Play success sound
 * 
 * @returns {Object} Sound object
 */
export const playSuccessSound = () => {
  return playSound('success');
};

/**
 * Play error sound
 * 
 * @returns {Object} Sound object
 */
export const playErrorSound = () => {
  return playSound('error');
};

/**
 * Play level complete sound
 * 
 * @returns {Object} Sound object
 */
export const playLevelCompleteSound = () => {
  return playSound('level_complete');
};

/**
 * Play menu open/close sound
 * 
 * @param {boolean} isOpening - Whether the menu is opening
 * @returns {Object} Sound object
 */
export const playMenuSound = (isOpening = true) => {
  return playSound(isOpening ? 'menu_open' : 'menu_close');
};

/**
 * Clean up audio resources
 */
export const cleanupAudio = () => {
  // Stop all sounds
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  
  // Clear sound cache
  Object.keys(soundCache).forEach(key => {
    delete soundCache[key];
  });
};