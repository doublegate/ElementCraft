/**
 * ElementCraft - Element Constants
 * 
 * This module defines constants related to the elements in the game,
 * including colors, symbols, properties, and interaction rules.
 * 
 * @module elements
 * @author ElementCraft Team
 * @version 1.0.0
 */

// Basic elements that are available at the start
export const INITIAL_ELEMENTS = ['fire', 'water', 'earth', 'air'];

// Additional elements that can be unlocked through progression
export const UNLOCKABLE_ELEMENTS = ['metal', 'wood', 'crystal', 'steam', 'cloud', 'lava', 'sand', 'plasma'];

// Element colors for visual representation
export const elementColors = {
  // Basic elements
  fire: '#ff6b6b',
  water: '#4fc3f7',
  earth: '#66bb6a',
  air: '#e0e0e0',
  
  // Unlockable elements
  metal: '#b0bec5',
  wood: '#8d6e63',
  
  // Combined elements
  crystal: '#8d4e85',
  steam: '#c8e6c9',
  cloud: '#d4f1f9',
  lava: '#ff7043',
  sand: '#fff176',
  plasma: '#ba68c8'
};

// Element symbols or icons for compact representation
export const elementSymbols = {
  // Basic elements
  fire: '🔥',
  water: '💧',
  earth: '🌎',
  air: '💨',
  
  // Unlockable elements
  metal: '⚙️',
  wood: '🌲',
  
  // Combined elements
  crystal: '💎',
  steam: '☁️',
  cloud: '🌤️',
  lava: '🌋',
  sand: '🏝️',
  plasma: '⚡'
};

// Element descriptions for tooltips and information
export const elementDescriptions = {
  fire: 'A volatile element that rises upward and can ignite flammable materials. Generates heat and light.',
  water: 'A flowing element that moves downward and can extinguish fire. Essential for life and growth.',
  earth: 'A solid element that provides stability and can be stacked to build structures. Resistant to movement.',
  air: 'A light element that can create pressure and move other elements. Enables flight and affects weather.',
  metal: 'A conductive element that can transmit energy between other elements. Strong and malleable.',
  wood: 'An organic element that can grow when placed near water. Can be ignited by fire to produce energy.',
  crystal: 'A powerful element that amplifies the properties of adjacent elements. Creates beautiful light effects.',
  steam: 'A gaseous element created when fire meets water. Rises quickly and can power mechanical systems.',
  cloud: 'A floating element formed when air meets water. Can produce precipitation under certain conditions.',
  lava: 'A destructive element created when fire meets earth. Flows like water but ignites flammable materials.',
  sand: 'A granular element formed when earth is eroded. Can flow like a liquid but maintains solid properties.',
  plasma: 'The most energetic state of matter, created from extreme heat. Emits light and electrical energy.'
};

// Element physics properties
export const elementProperties = {
  fire: {
    density: 0.3,    // Light, rises
    viscosity: 0.1,  // Low resistance to flow
    volatility: 0.8, // Highly volatile
    conductivity: 0.5, // Medium conductor
    stackable: false // Cannot be stacked
  },
  water: {
    density: 1.0,
    viscosity: 0.7,
    volatility: 0.1,
    conductivity: 0.8,
    stackable: false
  },
  earth: {
    density: 2.0,
    viscosity: 0.0,
    volatility: 0.0,
    conductivity: 0.2,
    stackable: true
  },
  air: {
    density: 0.1,
    viscosity: 0.05,
    volatility: 0.3,
    conductivity: 0.1,
    stackable: false
  },
  metal: {
    density: 2.5,
    viscosity: 0.0,
    volatility: 0.0,
    conductivity: 1.0,
    stackable: true
  },
  wood: {
    density: 0.8,
    viscosity: 0.0,
    volatility: 0.4,
    conductivity: 0.3,
    stackable: true
  },
  crystal: {
    density: 1.8,
    viscosity: 0.0,
    volatility: 0.0,
    conductivity: 0.9,
    stackable: true
  },
  steam: {
    density: 0.2,
    viscosity: 0.2,
    volatility: 0.5,
    conductivity: 0.4,
    stackable: false
  },
  cloud: {
    density: 0.4,
    viscosity: 0.3,
    volatility: 0.2,
    conductivity: 0.3,
    stackable: false
  },
  lava: {
    density: 1.8,
    viscosity: 0.6,
    volatility: 0.6,
    conductivity: 0.7,
    stackable: false
  },
  sand: {
    density: 1.5,
    viscosity: 0.4,
    volatility: 0.1,
    conductivity: 0.1,
    stackable: false
  },
  plasma: {
    density: 0.1,
    viscosity: 0.0,
    volatility: 1.0,
    conductivity: 1.0,
    stackable: false
  }
};

// Element interaction rules
export const elementInteractions = {
  // Fire interactions
  fire_water: {
    result: 'steam',
    score: 100
  },
  fire_earth: {
    result: 'lava',
    score: 150
  },
  fire_air: {
    result: 'plasma',
    score: 200
  },
  fire_wood: {
    result: 'fire', // Wood burns to more fire
    score: 50
  },
  
  // Water interactions
  water_air: {
    result: 'cloud',
    score: 100
  },
  water_earth: {
    result: 'mud', // Not implemented yet
    score: 75
  },
  water_metal: {
    result: 'rust', // Not implemented yet
    score: 50
  },
  water_wood: {
    result: 'wood', // Wood grows with water
    score: 50,
    special: 'growth'
  },
  
  // Earth interactions
  earth_air: {
    result: 'sand',
    score: 100
  },
  earth_metal: {
    result: 'ore', // Not implemented yet
    score: 125
  },
  
  // Air interactions
  air_metal: {
    result: 'oxidation', // Not implemented yet
    score: 75
  },
  
  // Special combinations
  fire_metal_air: {
    result: 'forge', // Special 3-element combination
    score: 300
  },
  water_earth_wood: {
    result: 'forest', // Special 3-element combination
    score: 300
  }
};

// Element particle effects for visual feedback
export const elementParticles = {
  fire: {
    count: 20,
    color: '#ff6b6b',
    size: { min: 2, max: 5 },
    lifetime: { min: 500, max: 1500 },
    velocity: { x: { min: -2, max: 2 }, y: { min: -5, max: -1 } }
  },
  water: {
    count: 15,
    color: '#4fc3f7',
    size: { min: 2, max: 4 },
    lifetime: { min: 300, max: 800 },
    velocity: { x: { min: -1, max: 1 }, y: { min: 1, max: 3 } }
  },
  earth: {
    count: 10,
    color: '#66bb6a',
    size: { min: 1, max: 3 },
    lifetime: { min: 200, max: 500 },
    velocity: { x: { min: -1, max: 1 }, y: { min: 1, max: 2 } }
  },
  air: {
    count: 25,
    color: '#e0e0e0',
    size: { min: 1, max: 3 },
    lifetime: { min: 400, max: 1000 },
    velocity: { x: { min: -3, max: 3 }, y: { min: -2, max: 2 } }
  },
  metal: {
    count: 5,
    color: '#b0bec5',
    size: { min: 1, max: 2 },
    lifetime: { min: 100, max: 300 },
    velocity: { x: { min: -0.5, max: 0.5 }, y: { min: 1, max: 2 } }
  },
  wood: {
    count: 8,
    color: '#8d6e63',
    size: { min: 1, max: 3 },
    lifetime: { min: 200, max: 600 },
    velocity: { x: { min: -0.5, max: 0.5 }, y: { min: 0.5, max: 1.5 } }
  },
  crystal: {
    count: 15,
    color: '#8d4e85',
    size: { min: 2, max: 4 },
    lifetime: { min: 500, max: 1200 },
    velocity: { x: { min: -1, max: 1 }, y: { min: -1, max: 1 } }
  },
  steam: {
    count: 20,
    color: '#c8e6c9',
    size: { min: 2, max: 5 },
    lifetime: { min: 600, max: 1500 },
    velocity: { x: { min: -1, max: 1 }, y: { min: -3, max: -1 } }
  }
};

// Element sound settings for audio feedback
export const elementSounds = {
  fire: {
    place: {
      frequency: 440, // A4
      waveform: 'sawtooth',
      volume: 0.5,
      duration: 0.3
    },
    loop: {
      file: 'fire_loop.mp3',
      volume: 0.2
    }
  },
  water: {
    place: {
      frequency: 329.63, // E4
      waveform: 'sine',
      volume: 0.5,
      duration: 0.3
    },
    loop: {
      file: 'water_loop.mp3',
      volume: 0.2
    }
  },
  earth: {
    place: {
      frequency: 261.63, // C4
      waveform: 'triangle',
      volume: 0.5,
      duration: 0.3
    }
  },
  air: {
    place: {
      frequency: 392, // G4
      waveform: 'sine',
      volume: 0.4,
      duration: 0.3
    },
    loop: {
      file: 'air_loop.mp3',
      volume: 0.1
    }
  },
  metal: {
    place: {
      frequency: 493.88, // B4
      waveform: 'square',
      volume: 0.5,
      duration: 0.3
    }
  },
  wood: {
    place: {
      frequency: 349.23, // F4
      waveform: 'triangle',
      volume: 0.4,
      duration: 0.3
    }
  }
};