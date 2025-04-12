/**
 * ElementCraft - Main Menu Component
 * 
 * This component displays the game's main menu with options to start
 * a new game, continue a saved game, access settings, view achievements,
 * and learn about the game.
 * 
 * @module MainMenu
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { playMenuSound, playSound } from '../utils/sounds';
import useGameStore from '../store/gameStore';

const MainMenu = ({ 
  onStartGame, 
  onContinueGame, 
  onSettings, 
  onAchievements,
  onCredits
}) => {
  // Access game store
  const { 
    playerLevel, 
    score, 
    currentLevel, 
    levelsCompleted,
    settings
  } = useGameStore();
  
  // State for menu animation
  const [animationComplete, setAnimationComplete] = useState(false);
  // State for menu hover effects
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Determine if there's a saved game
  const hasSavedGame = levelsCompleted.length > 0 || currentLevel > 1;
  
  // Play sound effects when hovering or clicking
  const handleHover = (item) => {
    if (hoveredItem !== item) {
      if (settings?.sfxVolume !== 0) {
        playSound('buttonHover');
      }
      setHoveredItem(item);
    }
  };
  
  const handleClick = (callback) => {
    if (settings?.sfxVolume !== 0) {
      playSound('buttonClick');
    }
    if (callback) callback();
  };
  
  // Animation for the title
  const titleAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 200, friction: 20 },
    delay: 300,
    onRest: () => setAnimationComplete(true)
  });
  
  // Animation for the menu items
  const getMenuItemAnimation = (index) => useSpring({
    from: { opacity: 0, transform: 'translateX(-30px)' },
    to: { opacity: animationComplete ? 1 : 0, transform: animationComplete ? 'translateX(0)' : 'translateX(-30px)' },
    config: { tension: 200, friction: 20 },
    delay: animationComplete ? 100 * index : 0
  });
  
  // Animation for hovering menu items
  const getHoverAnimation = (item) => useSpring({
    transform: hoveredItem === item ? 'translateX(10px)' : 'translateX(0)',
    color: hoveredItem === item ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
    config: { tension: 300, friction: 20 }
  });
  
  // Animation for player stats
  const statsAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: animationComplete ? 1 : 0 },
    config: { tension: 200, friction: 20 },
    delay: animationComplete ? 600 : 0
  });
  
  // Play background music when component mounts
  useEffect(() => {
    if (settings?.musicVolume !== 0) {
      playMenuSound();
    }
    
    // Clean up when component unmounts
    return () => {
      // Stop menu music would be called here
    };
  }, [settings?.musicVolume]);
  
  return (
    <div className="main-menu">
      <div className="menu-background">
        {/* Animated background elements */}
        <div className="floating-element fire"></div>
        <div className="floating-element water"></div>
        <div className="floating-element earth"></div>
        <div className="floating-element air"></div>
        <div className="floating-element metal"></div>
        <div className="floating-element wood"></div>
      </div>
      
      <div className="menu-content">
        <animated.div className="game-title" style={titleAnimation}>
          <h1>ElementCraft</h1>
          <div className="game-subtitle">Master the Elements</div>
        </animated.div>
        
        <div className="menu-options">
          <animated.div style={getMenuItemAnimation(0)}>
            <animated.button 
              className="menu-button"
              onClick={() => handleClick(onStartGame)}
              onMouseEnter={() => handleHover('start')}
              onMouseLeave={() => setHoveredItem(null)}
              style={getHoverAnimation('start')}
            >
              <span className="button-icon">🔥</span>
              <span className="button-text">New Game</span>
            </animated.button>
          </animated.div>
          
          <animated.div style={getMenuItemAnimation(1)}>
            <animated.button 
              className="menu-button"
              onClick={() => handleClick(onContinueGame)}
              onMouseEnter={() => handleHover('continue')}
              onMouseLeave={() => setHoveredItem(null)}
              style={getHoverAnimation('continue')}
              disabled={!hasSavedGame}
            >
              <span className="button-icon">💧</span>
              <span className="button-text">Continue</span>
            </animated.button>
          </animated.div>
          
          <animated.div style={getMenuItemAnimation(2)}>
            <animated.button 
              className="menu-button"
              onClick={() => handleClick(onAchievements)}
              onMouseEnter={() => handleHover('achievements')}
              onMouseLeave={() => setHoveredItem(null)}
              style={getHoverAnimation('achievements')}
            >
              <span className="button-icon">🏆</span>
              <span className="button-text">Achievements</span>
            </animated.button>
          </animated.div>
          
          <animated.div style={getMenuItemAnimation(3)}>
            <animated.button 
              className="menu-button"
              onClick={() => handleClick(onSettings)}
              onMouseEnter={() => handleHover('settings')}
              onMouseLeave={() => setHoveredItem(null)}
              style={getHoverAnimation('settings')}
            >
              <span className="button-icon">⚙️</span>
              <span className="button-text">Settings</span>
            </animated.button>
          </animated.div>
          
          <animated.div style={getMenuItemAnimation(4)}>
            <animated.button 
              className="menu-button"
              onClick={() => handleClick(onCredits)}
              onMouseEnter={() => handleHover('credits')}
              onMouseLeave={() => setHoveredItem(null)}
              style={getHoverAnimation('credits')}
            >
              <span className="button-icon">ℹ️</span>
              <span className="button-text">About</span>
            </animated.button>
          </animated.div>
        </div>
        
        {hasSavedGame && (
          <animated.div className="player-stats" style={statsAnimation}>
            <div className="stat-item">
              <div className="stat-label">Level</div>
              <div className="stat-value">{playerLevel}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Score</div>
              <div className="stat-value">{score}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Progress</div>
              <div className="stat-value">
                Level {currentLevel} ({levelsCompleted.length}/10 Complete)
              </div>
            </div>
          </animated.div>
        )}
        
        <div className="version-info">v1.0.0</div>
      </div>
    </div>
  );
};

export default MainMenu;