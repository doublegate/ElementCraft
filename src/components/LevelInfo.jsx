/**
 * ElementCraft - Level Information Component
 * 
 * This component displays information about the current level,
 * including level number, score, objectives, and completion status.
 * 
 * @module LevelInfo
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React from 'react';
import { useSpring, animated } from 'react-spring';
import { levelObjectives } from '../constants/levels';

const LevelInfo = ({ level, score, isComplete }) => {
  // Animation for level completion
  const completeAnimation = useSpring({
    opacity: isComplete ? 1 : 0,
    transform: isComplete ? 'scale(1)' : 'scale(0.8)',
    config: { tension: 300, friction: 15 }
  });
  
  // Animation for score counter
  const scoreAnimation = useSpring({
    number: score,
    from: { number: 0 },
    config: { tension: 100, friction: 15 }
  });
  
  // Get objectives for the current level
  const objectives = levelObjectives[level] || [];
  
  return (
    <div className="level-info">
      <div className="level-header">
        <h2 className="level-title">Level {level}</h2>
        <div className="score-display">
          <span>Score:</span>
          <animated.span>
            {scoreAnimation.number.to(n => Math.floor(n))}
          </animated.span>
        </div>
      </div>
      
      <div className="level-objectives">
        <h3>Objectives:</h3>
        <ul className="objectives-list">
          {objectives.map((objective, index) => (
            <li 
              key={index}
              className={`objective-item ${objective.completed ? 'completed' : ''}`}
            >
              {objective.completed && (
                <svg className="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3334 4L6.00002 11.3333L2.66669 8" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              <span>{objective.description}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {isComplete && (
        <animated.div 
          className="level-complete-banner"
          style={completeAnimation}
        >
          <div className="banner-content">
            <h3>Level Complete!</h3>
            <p>
              <span className="bonus-text">Bonus:</span> 
              <span className="bonus-points">+{Math.floor(score * 0.1)}</span>
            </p>
          </div>
          
          {/* Level complete animation with particles */}
          <div className="particle-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: [
                    '#ff6b6b', // fire
                    '#4fc3f7', // water
                    '#66bb6a', // earth
                    '#e0e0e0', // air
                    '#b0bec5', // metal
                    '#8d6e63'  // wood
                  ][Math.floor(Math.random() * 6)]
                }}
              />
            ))}
          </div>
        </animated.div>
      )}
      
      <div className="level-hints">
        <h4>Hints:</h4>
        <p className="hint-text">
          {level === 1 ? (
            "Try combining Fire and Water to create Steam. This will complete your first objective!"
          ) : level === 2 ? (
            "Earth elements can be used as platforms. Try building structures to reach higher areas."
          ) : level === 3 ? (
            "Metal conducts energy from Fire elements. Use this property to solve the circuit puzzle."
          ) : level === 4 ? (
            "Wood grows when placed next to Water. Create a forest to unlock the ancient knowledge."
          ) : level === 5 ? (
            "All elements must be in balance. Create combinations of all six elements to unlock the final gate."
          ) : (
            "Experiment with different element combinations to discover new reactions!"
          )}
        </p>
      </div>
    </div>
  );
};

export default LevelInfo;