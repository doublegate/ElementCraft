/**
 * ElementCraft - Game States Constants
 * 
 * This module defines the possible states of the game,
 * which control the flow and UI presentation.
 * 
 * @module gameStates
 * @author ElementCraft Team
 * @version 1.0.0
 */

// Game state constants
export const GAME_STATES = {
  // Initial state when the game first loads
  INTRO: 'intro',
  
  // Main gameplay state
  PLAYING: 'playing',
  
  // Shown when a level is completed
  LEVEL_COMPLETE: 'level_complete',
  
  // Shown for special puzzle challenges
  PUZZLE_MODE: 'puzzle_mode',
  
  // Shown when the player has completed all levels
  GAME_OVER: 'game_over',
  
  // Paused state
  PAUSED: 'paused'
};

// Game mode constants
export const GAME_MODES = {
  // Standard progression through levels
  CAMPAIGN: 'campaign',
  
  // Free play with all elements unlocked
  SANDBOX: 'sandbox',
  
  // Focus on word puzzles
  WORD_PUZZLE: 'word_puzzle',
  
  // Focus on logic puzzles
  LOGIC_PUZZLE: 'logic_puzzle',
  
  // Daily challenge with unique objectives
  DAILY_CHALLENGE: 'daily_challenge'
};

// Action types for state management
export const ACTION_TYPES = {
  // Start a new game
  START_GAME: 'start_game',
  
  // Restart the current level
  RESTART_LEVEL: 'restart_level',
  
  // Proceed to the next level
  NEXT_LEVEL: 'next_level',
  
  // Select an element
  SELECT_ELEMENT: 'select_element',
  
  // Place an element on the board
  PLACE_ELEMENT: 'place_element',
  
  // Update objectives
  UPDATE_OBJECTIVES: 'update_objectives',
  
  // Complete a level
  COMPLETE_LEVEL: 'complete_level',
  
  // Complete the game
  COMPLETE_GAME: 'complete_game',
  
  // Pause the game
  PAUSE_GAME: 'pause_game',
  
  // Resume the game
  RESUME_GAME: 'resume_game',
  
  // Toggle sound
  TOGGLE_SOUND: 'toggle_sound',
  
  // Toggle music
  TOGGLE_MUSIC: 'toggle_music'
};

// UI states for transitions and animations
export const UI_STATES = {
  // Default state
  IDLE: 'idle',
  
  // Transitioning between screens
  TRANSITIONING: 'transitioning',
  
  // Showing a popup or modal
  MODAL_OPEN: 'modal_open',
  
  // Element is being dragged
  DRAGGING: 'dragging',
  
  // Element is being placed
  PLACING: 'placing',
  
  // Animation is in progress
  ANIMATING: 'animating'
};

// Game difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
};

// Player progression stages
export const PROGRESSION_STAGES = {
  NOVICE: 'novice',        // Just beginning
  APPRENTICE: 'apprentice', // Basic elements mastered
  ADEPT: 'adept',          // Understands combinations
  EXPERT: 'expert',        // Advanced puzzle solving
  MASTER: 'master'         // Complete mastery
};