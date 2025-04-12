/**
 * ElementCraft - Achievements Component
 * 
 * This component displays the player's earned achievements and tracks
 * progress toward unlocking new ones. Achievements provide goals and
 * rewards for different aspects of gameplay.
 * 
 * @module Achievements
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import ProgressBar from './ProgressBar';
import ParticleEffects from './ParticleEffects';
import useGameStore from '../store/gameStore';

const Achievements = ({ onClose }) => {
  // Get achievements from game store
  const { 
    playerLevel, 
    score, 
    inventory, 
    levelsCompleted, 
    unlockedElements,
    settings
  } = useGameStore();
  
  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState('all');
  // State for celebrating newly unlocked achievements
  const [celebrating, setCelebrating] = useState(null);
  
  // Define achievement categories
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'elements', name: 'Elements' },
    { id: 'gameplay', name: 'Gameplay' },
    { id: 'puzzles', name: 'Puzzles' },
    { id: 'special', name: 'Special' }
  ];
  
  // Define all achievements
  const achievementsList = [
    // Element achievements
    {
      id: 'basic_elements',
      title: 'Elemental Foundations',
      description: 'Collect all 4 basic elements',
      category: 'elements',
      icon: '🔄',
      color: '#4fc3f7',
      requirement: () => {
        const basics = ['fire', 'water', 'earth', 'air'];
        return basics.every(el => inventory && inventory[el]);
      },
      progress: () => {
        const basics = ['fire', 'water', 'earth', 'air'];
        return basics.filter(el => inventory && inventory[el]).length / basics.length;
      },
      reward: 'Increased element storage capacity'
    },
    {
      id: 'advanced_elements',
      title: 'Advanced Elementalist',
      description: 'Unlock metal and wood elements',
      category: 'elements',
      icon: '🌲',
      color: '#8d6e63',
      requirement: () => {
        return unlockedElements.includes('metal') && unlockedElements.includes('wood');
      },
      progress: () => {
        let count = 0;
        if (unlockedElements.includes('metal')) count++;
        if (unlockedElements.includes('wood')) count++;
        return count / 2;
      },
      reward: 'New element combinations'
    },
    {
      id: 'master_collector',
      title: 'Master Collector',
      description: 'Unlock all 12 elements in the game',
      category: 'elements',
      icon: '💎',
      color: '#9c27b0',
      requirement: () => unlockedElements.length >= 12,
      progress: () => Math.min(1, unlockedElements.length / 12),
      reward: 'Special ability: Transmutation'
    },
    {
      id: 'fire_mastery',
      title: 'Master of Fire',
      description: 'Accumulate 50 fire elements',
      category: 'elements',
      icon: '🔥',
      color: '#ff6b6b',
      requirement: () => inventory && inventory.fire >= 50,
      progress: () => Math.min(1, (inventory?.fire || 0) / 50),
      reward: 'Fire elements have increased power'
    },
    {
      id: 'water_mastery',
      title: 'Master of Water',
      description: 'Accumulate 50 water elements',
      category: 'elements',
      icon: '💧',
      color: '#4fc3f7',
      requirement: () => inventory && inventory.water >= 50,
      progress: () => Math.min(1, (inventory?.water || 0) / 50),
      reward: 'Water elements have increased flow'
    },
    
    // Gameplay achievements
    {
      id: 'level_5',
      title: 'Elemental Adept',
      description: 'Reach player level 5',
      category: 'gameplay',
      icon: '⬆️',
      color: '#4caf50',
      requirement: () => playerLevel >= 5,
      progress: () => Math.min(1, playerLevel / 5),
      reward: 'Unlocks advanced puzzles'
    },
    {
      id: 'level_10',
      title: 'Elemental Master',
      description: 'Reach player level 10',
      category: 'gameplay',
      icon: '⬆️',
      color: '#8BC34A',
      requirement: () => playerLevel >= 10,
      progress: () => Math.min(1, playerLevel / 10),
      reward: 'Unlocks special elements'
    },
    {
      id: 'score_5000',
      title: 'Score Hunter',
      description: 'Reach a score of 5,000 points',
      category: 'gameplay',
      icon: '🎯',
      color: '#FF9800',
      requirement: () => score >= 5000,
      progress: () => Math.min(1, score / 5000),
      reward: '500 essence bonus'
    },
    {
      id: 'score_10000',
      title: 'Score Master',
      description: 'Reach a score of 10,000 points',
      category: 'gameplay',
      icon: '🎯',
      color: '#FF5722',
      requirement: () => score >= 10000,
      progress: () => Math.min(1, score / 10000),
      reward: '1000 essence bonus'
    },
    {
      id: 'complete_5_levels',
      title: 'Journey Halfway',
      description: 'Complete 5 levels in the game',
      category: 'gameplay',
      icon: '🗺️',
      color: '#3F51B5',
      requirement: () => levelsCompleted.length >= 5,
      progress: () => Math.min(1, levelsCompleted.length / 5),
      reward: 'Unlock special game mode'
    },
    
    // Puzzle achievements
    {
      id: 'word_master',
      title: 'Word Wizard',
      description: 'Solve 5 word puzzles',
      category: 'puzzles',
      icon: '📝',
      color: '#673AB7',
      requirement: () => {
        // In a real implementation, this would check a counter of solved word puzzles
        // For now, we'll use a placeholder
        return levelsCompleted.includes(6);
      },
      progress: () => {
        // Placeholder progress calculation
        return levelsCompleted.includes(6) ? 1 : 0;
      },
      reward: 'Bonus hints in word puzzles'
    },
    {
      id: 'logic_master',
      title: 'Logic Master',
      description: 'Solve 5 logic puzzles',
      category: 'puzzles',
      icon: '🧩',
      color: '#607D8B',
      requirement: () => {
        // Placeholder implementation
        return levelsCompleted.includes(7);
      },
      progress: () => {
        // Placeholder progress calculation
        return levelsCompleted.includes(7) ? 1 : 0;
      },
      reward: 'Bonus hints in logic puzzles'
    },
    
    // Special achievements
    {
      id: 'element_chain',
      title: 'Chain Reaction',
      description: 'Create a chain reaction with 5+ elements',
      category: 'special',
      icon: '⛓️',
      color: '#795548',
      requirement: () => {
        // Placeholder implementation
        return levelsCompleted.includes(8);
      },
      progress: () => {
        // Placeholder progress calculation
        return levelsCompleted.includes(8) ? 1 : 0;
      },
      reward: 'Cascade reactions occur more frequently'
    },
    {
      id: 'perfect_level',
      title: 'Perfectionist',
      description: 'Complete a level with all optional objectives',
      category: 'special',
      icon: '🌟',
      color: '#FFC107',
      requirement: () => {
        // Placeholder implementation
        return levelsCompleted.includes(9);
      },
      progress: () => {
        // Placeholder progress calculation
        return levelsCompleted.includes(9) ? 1 : 0;
      },
      reward: 'Bonus score multiplier'
    },
    {
      id: 'game_complete',
      title: 'Element Master',
      description: 'Complete all 10 levels of the game',
      category: 'special',
      icon: '👑',
      color: '#E91E63',
      requirement: () => levelsCompleted.length >= 10,
      progress: () => Math.min(1, levelsCompleted.length / 10),
      reward: 'Unlock creative mode'
    }
  ];
  
  // Animation for the achievements panel
  const panelAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 20 }
  });
  
  // Filter achievements by selected category
  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return achievementsList;
    } else {
      return achievementsList.filter(a => a.category === selectedCategory);
    }
  };
  
  // Calculate total completion percentage
  const calculateCompletion = () => {
    const completed = achievementsList.filter(a => a.requirement()).length;
    return completed / achievementsList.length;
  };
  
  // Check for newly unlocked achievements
  useEffect(() => {
    // This would normally check against previously unlocked achievements
    // For demonstration, we'll just use a timeout to show the celebration
    const timeout = setTimeout(() => {
      // Find a random unlocked achievement to celebrate
      const unlocked = achievementsList.filter(a => a.requirement());
      if (unlocked.length > 0) {
        const randomIndex = Math.floor(Math.random() * unlocked.length);
        setCelebrating(unlocked[randomIndex]);
        // Clear celebration after a few seconds
        setTimeout(() => setCelebrating(null), 3000);
      }
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className="achievements-overlay">
      <animated.div 
        className="achievements-panel"
        style={panelAnimation}
      >
        <div className="achievements-header">
          <h2>Achievements</h2>
          <div className="achievements-progress">
            <span>Completion: {Math.round(calculateCompletion() * 100)}%</span>
            <ProgressBar 
              value={calculateCompletion() * 100}
              maxValue={100}
              height={10}
              colorScheme="rainbow"
              animated={true}
              showPercentage={false}
            />
          </div>
          <button 
            className="close-button"
            onClick={onClose}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="achievement-categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="achievements-list">
          {getFilteredAchievements().map(achievement => {
            const isUnlocked = achievement.requirement();
            const progress = achievement.progress();
            
            return (
              <div 
                key={achievement.id}
                className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div 
                  className="achievement-icon"
                  style={{ backgroundColor: achievement.color }}
                >
                  {achievement.icon}
                </div>
                
                <div className="achievement-content">
                  <div className="achievement-title">
                    {achievement.title}
                    {isUnlocked && <span className="achievement-unlocked-icon">✓</span>}
                  </div>
                  
                  <div className="achievement-description">
                    {achievement.description}
                  </div>
                  
                  <div className="achievement-progress">
                    <ProgressBar 
                      value={progress * 100}
                      maxValue={100}
                      height={6}
                      colorScheme={isUnlocked ? 'success' : 'primary'}
                      animated={true}
                      showPercentage={false}
                    />
                  </div>
                  
                  <div className="achievement-reward">
                    <span className="reward-label">Reward:</span>
                    <span className="reward-text">{achievement.reward}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Celebration overlay for newly unlocked achievements */}
        {celebrating && settings?.particleAmount !== 'low' && (
          <div className="achievement-celebration">
            <div className="celebration-content">
              <div 
                className="celebration-icon"
                style={{ backgroundColor: celebrating.color }}
              >
                {celebrating.icon}
              </div>
              
              <div className="celebration-text">
                <h3>Achievement Unlocked!</h3>
                <div className="celebration-title">{celebrating.title}</div>
                <div className="celebration-description">{celebrating.description}</div>
              </div>
            </div>
            
            <ParticleEffects
              effect="explosion"
              element="crystal"
              amount={settings?.particleAmount || 'medium'}
              position={{ x: null, y: null }}
              autoPlay={true}
              loop={false}
              duration={3000}
            />
          </div>
        )}
      </animated.div>
    </div>
  );
};

export default Achievements;