/**
 * ElementCraft - Main Application Component (Updated)
 * 
 * This component serves as the main container for the ElementCraft game.
 * It integrates all components and manages the overall application flow.
 * 
 * @module App
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import GameBoard from './components/GameBoard';
import ElementSelector from './components/ElementSelector';
import GameControls from './components/GameControls';
import LevelInfo from './components/LevelInfo';
import Tutorial from './components/Tutorial';
import GameOver from './components/GameOver';
import ElementInventory from './components/ElementInventory';
import ElementStore from './components/ElementStore';
import SettingsMenu from './components/SettingsMenu';
import Achievements from './components/Achievements';
import MainMenu from './components/MainMenu';
import LoadingScreen from './components/LoadingScreen';
import WordPuzzle from './components/WordPuzzle';
import LogicPuzzle from './components/LogicPuzzle';
import ParticleEffects from './components/ParticleEffects';
import { GameProvider, useGame } from './contexts/GameContext';

// Main app content component
const AppContent = () => {
  // Access game context
  const { 
    gameState, 
    currentLevel, 
    selectedElement, 
    score, 
    board, 
    inventory,
    unlockedElements,
    playerEssence,
    playerLevel,
    settings,
    objectives,
    setSelectedElement, 
    placeElement, 
    startGame, 
    restartLevel, 
    nextLevel,
    updateSettings,
    resetSettings,
    purchaseItem,
    
    // App UI state
    appState,
    startNewGame,
    continueGame,
    toggleSettings,
    toggleAchievements,
    toggleStore,
    toggleTutorial,
    toggleCredits,
    returnToMainMenu,
    popModal
  } = useGame();
  
  // Animation for the game board
  const boardAnimation = useSpring({
    opacity: gameState === 'playing' ? 1 : 0,
    transform: gameState === 'playing' 
      ? 'translateY(0)' 
      : 'translateY(50px)',
    config: { tension: 280, friction: 20 }
  });
  
  // Handle element placement on the board
  const handleCellClick = (rowIndex, colIndex) => {
    if (selectedElement && gameState === 'playing') {
      placeElement(rowIndex, colIndex, selectedElement);
    }
  };
  
  // Render appropriate content based on app state
  const renderContent = () => {
    // Show loading screen
    if (appState.isLoading) {
      return <LoadingScreen onComplete={() => {}} />;
    }
    
    // Show main menu
    if (appState.showMainMenu) {
      return (
        <MainMenu 
          onStartGame={startNewGame}
          onContinueGame={continueGame}
          onSettings={toggleSettings}
          onAchievements={toggleAchievements}
          onCredits={toggleCredits}
        />
      );
    }
    
    // Show main game content
    return (
      <animated.div style={boardAnimation} className="game-container">
        <div className="game-header">
          <LevelInfo 
            level={currentLevel} 
            score={score} 
            isComplete={gameState === 'level_complete'}
            objectives={objectives}
          />
          <GameControls 
            onRestart={restartLevel}
            onNext={gameState === 'level_complete' ? nextLevel : null}
            onHelp={toggleTutorial}
            onSettings={toggleSettings}
            onStore={toggleStore}
            onMenu={returnToMainMenu}
          />
        </div>
        
        <div className="game-content">
          <ElementInventory 
            inventory={inventory}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            playerLevel={playerLevel}
          />
          
          <div className="game-board-container">
            <GameBoard 
              board={board}
              onCellClick={handleCellClick}
              selectedElement={selectedElement}
            />
            
            {/* Ambient particle effects based on settings */}
            {settings.particleAmount !== 'low' && (
              <ParticleEffects
                effect="ambient"
                element={null}
                amount={settings.particleAmount}
                autoPlay={true}
                loop={true}
              />
            )}
          </div>
        </div>
      </animated.div>
    );
  };
  
  // Render modals
  const renderModals = () => (
    <>
      {/* Settings modal */}
      {appState.showSettings && (
        <SettingsMenu
          settings={settings}
          onSettingsChange={updateSettings}
          onReset={resetSettings}
          onClose={toggleSettings}
        />
      )}
      
      {/* Achievements modal */}
      {appState.showAchievements && (
        <Achievements
          onClose={toggleAchievements}
        />
      )}
      
      {/* Store modal */}
      {appState.showStore && (
        <ElementStore
          availableElements={unlockedElements}
          playerInventory={inventory}
          playerEssence={playerEssence}
          playerLevel={playerLevel}
          onPurchase={purchaseItem}
          onClose={toggleStore}
        />
      )}
      
      {/* Tutorial modal */}
      {appState.showTutorial && (
        <Tutorial
          onClose={toggleTutorial}
        />
      )}
      
      {/* Word puzzle modal (for demonstrating UI) */}
      {appState.showWordPuzzle && (
        <WordPuzzle
          word="FLAME"
          maxAttempts={6}
          onComplete={() => {}}
          onClose={() => popModal()}
        />
      )}
      
      {/* Logic puzzle modal (for demonstrating UI) */}
      {appState.showLogicPuzzle && (
        <LogicPuzzle
          size={4}
          validElements={['fire', 'water', 'earth', 'air']}
          onComplete={() => {}}
          onClose={() => popModal()}
        />
      )}
      
      {/* Game over screen */}
      {gameState === 'game_over' && (
        <GameOver 
          score={score} 
          level={currentLevel}
          onRestart={startNewGame}
        />
      )}
    </>
  );
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>ElementCraft</h1>
        {!appState.showMainMenu && !appState.isLoading && (
          <div className="player-stats-bar">
            <div className="stat-item">
              <div className="stat-label">Level</div>
              <div className="stat-value">{playerLevel}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Score</div>
              <div className="stat-value">{score}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Essence</div>
              <div className="stat-value">{playerEssence}</div>
            </div>
          </div>
        )}
      </header>
      
      <main className="app-main">
        {renderContent()}
        {renderModals()}
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 ElementCraft - A Strategic Elemental Puzzle Game</p>
      </footer>
    </div>
  );
};

// Main App component wrapped with GameProvider
const App = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;