/**
 * ElementCraft - Game Context
 * 
 * This context provides a central way to access game state and functions
 * throughout the component tree. It wraps the Zustand store and provides
 * additional application-level state management.
 * 
 * @module GameContext
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';
import { initializeAudio, setVolume } from '../utils/sounds';

// Create context
const GameContext = createContext(null);

// Hook for using the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Provider component
export const GameProvider = ({ children }) => {
  // Game state from Zustand store
  const gameStore = useGameStore();
  
  // Application UI state
  const [appState, setAppState] = useState({
    showMainMenu: true,
    showSettings: false,
    showAchievements: false,
    showStore: false,
    showTutorial: false,
    showGameOver: false,
    showCredits: false,
    isLoading: true, // Initial loading state
    modalStack: [] // Track modal stack for proper layering
  });
  
  // Initialize game on first load
  useEffect(() => {
    // Initialize audio system
    initializeAudio();
    
    // Apply current volume settings
    if (gameStore.settings) {
      setVolume('master', gameStore.settings.masterVolume / 100);
      setVolume('music', gameStore.settings.musicVolume / 100);
      setVolume('sfx', gameStore.settings.sfxVolume / 100);
      setVolume('ambience', gameStore.settings.ambienceVolume / 100);
    }
    
    // Initialize game state
    gameStore.initGame();
    
    // Simulate loading
    const loadingTimeout = setTimeout(() => {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }, 1500);
    
    return () => clearTimeout(loadingTimeout);
  }, []);
  
  // Update audio settings when they change
  useEffect(() => {
    if (gameStore.settings) {
      setVolume('master', gameStore.settings.masterVolume / 100);
      setVolume('music', gameStore.settings.musicVolume / 100);
      setVolume('sfx', gameStore.settings.sfxVolume / 100);
      setVolume('ambience', gameStore.settings.ambienceVolume / 100);
    }
  }, [
    gameStore.settings?.masterVolume,
    gameStore.settings?.musicVolume,
    gameStore.settings?.sfxVolume,
    gameStore.settings?.ambienceVolume
  ]);
  
  // Helper functions for managing UI state
  
  // Push a modal to the stack
  const pushModal = (modalType) => {
    setAppState(prev => ({
      ...prev,
      modalStack: [...prev.modalStack, modalType],
      [`show${modalType}`]: true
    }));
  };
  
  // Pop the top modal from the stack
  const popModal = () => {
    if (appState.modalStack.length > 0) {
      const modalType = appState.modalStack[appState.modalStack.length - 1];
      setAppState(prev => ({
        ...prev,
        modalStack: prev.modalStack.slice(0, -1),
        [`show${modalType}`]: false
      }));
    }
  };
  
  // Show main menu
  const showMainMenu = () => {
    setAppState(prev => ({
      ...prev,
      showMainMenu: true,
      showSettings: false,
      showAchievements: false,
      showStore: false,
      showTutorial: false,
      showGameOver: false,
      showCredits: false,
      modalStack: []
    }));
  };
  
  // Start a new game
  const startNewGame = () => {
    gameStore.resetGame();
    gameStore.startGame();
    setAppState(prev => ({
      ...prev,
      showMainMenu: false,
      modalStack: []
    }));
  };
  
  // Continue saved game
  const continueGame = () => {
    gameStore.startGame();
    setAppState(prev => ({
      ...prev,
      showMainMenu: false,
      modalStack: []
    }));
  };
  
  // Toggle settings menu
  const toggleSettings = () => {
    if (appState.showSettings) {
      popModal();
    } else {
      pushModal('Settings');
    }
  };
  
  // Toggle achievements screen
  const toggleAchievements = () => {
    if (appState.showAchievements) {
      popModal();
    } else {
      pushModal('Achievements');
    }
  };
  
  // Toggle store
  const toggleStore = () => {
    if (appState.showStore) {
      popModal();
    } else {
      pushModal('Store');
    }
  };
  
  // Toggle tutorial
  const toggleTutorial = () => {
    if (appState.showTutorial) {
      popModal();
    } else {
      pushModal('Tutorial');
    }
  };
  
  // Toggle credits
  const toggleCredits = () => {
    if (appState.showCredits) {
      popModal();
    } else {
      pushModal('Credits');
    }
  };
  
  // Return to main menu
  const returnToMainMenu = () => {
    // Ask for confirmation if there's unsaved progress
    if (gameStore.gameState === 'playing' && gameStore.settings.confirmActions) {
      if (window.confirm('Return to main menu? Any unsaved progress will be lost.')) {
        showMainMenu();
      }
    } else {
      showMainMenu();
    }
  };
  
  // Handle game over
  const handleGameOver = (victory = true) => {
    setAppState(prev => ({
      ...prev,
      showGameOver: true
    }));
  };
  
  // Context value containing state and functions
  const contextValue = {
    // Game state from Zustand store
    ...gameStore,
    
    // UI state
    appState,
    
    // UI action functions
    showMainMenu,
    startNewGame,
    continueGame,
    toggleSettings,
    toggleAchievements,
    toggleStore,
    toggleTutorial,
    toggleCredits,
    returnToMainMenu,
    handleGameOver,
    pushModal,
    popModal
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;