/**
 * ElementCraft - Loading Screen Component
 * 
 * This component displays during initial game loading, showing a progress
 * bar and element animations to entertain players while assets load.
 * 
 * @module LoadingScreen
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import ProgressBar from './ProgressBar';
import { elementColors } from '../constants/elements';

const LoadingScreen = ({ onComplete }) => {
  // Loading progress state
  const [progress, setProgress] = useState(0);
  // Loading tips state
  const [tipIndex, setTipIndex] = useState(0);
  
  // List of loading tips to display
  const loadingTips = [
    "Combine fire and water to create steam.",
    "Earth elements can be stacked to build structures.",
    "Metal conducts energy from fire to other elements.",
    "Wood grows when placed next to water.",
    "Air can move light elements like fire.",
    "Crystal amplifies the power of adjacent elements.",
    "Complete objectives to advance to the next level.",
    "Solve word puzzles to unlock special elements.",
    "Arrange elements in logical patterns to solve puzzles.",
    "Visit the store to buy new elements and upgrades."
  ];
  
  // Animation for the loading container
  const containerAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 20 }
  });
  
  // Animation for the game logo
  const logoAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 15 },
    delay: 300
  });
  
  // Simulate loading progress
  useEffect(() => {
    // Initial delay before starting progress
    const initialDelay = setTimeout(() => {
      // Simulate loading in chunks
      const loadAssets = () => {
        const interval = setInterval(() => {
          setProgress(prev => {
            // Randomly increase progress
            const increment = Math.random() * 5 + 1;
            const newProgress = Math.min(100, prev + increment);
            
            // If loading is complete, clear interval and notify parent
            if (newProgress >= 100) {
              clearInterval(interval);
              // Add a small delay before completing
              setTimeout(() => {
                if (onComplete) onComplete();
              }, 500);
            }
            
            return newProgress;
          });
        }, 100);
        
        return interval;
      };
      
      const loadingInterval = loadAssets();
      
      // Cleanup
      return () => clearInterval(loadingInterval);
    }, 800);
    
    return () => clearTimeout(initialDelay);
  }, [onComplete]);
  
  // Change the loading tip every few seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % loadingTips.length);
    }, 4000);
    
    return () => clearInterval(tipInterval);
  }, []);
  
  // Element colors array
  const elements = [
    { name: 'fire', color: elementColors.fire },
    { name: 'water', color: elementColors.water },
    { name: 'earth', color: elementColors.earth },
    { name: 'air', color: elementColors.air },
    { name: 'metal', color: elementColors.metal },
    { name: 'wood', color: elementColors.wood }
  ];
  
  return (
    <animated.div 
      className="loading-screen"
      style={containerAnimation}
    >
      <div className="loading-content">
        <animated.div 
          className="game-logo"
          style={logoAnimation}
        >
          <h1>ElementCraft</h1>
          <div className="game-subtitle">Master the Elements</div>
        </animated.div>
        
        <div className="loading-elements">
          {elements.map((element, index) => (
            <div 
              key={element.name}
              className={`loading-element ${element.name}`}
              style={{ 
                backgroundColor: element.color,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
        
        <div className="loading-progress">
          <ProgressBar 
            value={progress}
            maxValue={100}
            height={10}
            colorScheme="rainbow"
            animated={true}
            label="Loading Game Assets"
            labelPosition="top"
            showPercentage={true}
          />
        </div>
        
        <div className="loading-tip">
          <div className="tip-label">Tip:</div>
          <div className="tip-content">
            {loadingTips[tipIndex]}
          </div>
        </div>
      </div>
      
      <div className="loading-footer">
        <div className="company-info">© 2025 ElementCraft Team</div>
        <div className="version-info">v1.0.0</div>
      </div>
    </animated.div>
  );
};

export default LoadingScreen;