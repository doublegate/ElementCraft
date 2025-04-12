/**
 * ElementCraft - Game Controls Component
 * 
 * This component provides control buttons for game actions such as
 * restarting a level, proceeding to the next level, or accessing help.
 * 
 * @module GameControls
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React from 'react';
import { useSpring, animated } from 'react-spring';

const GameControls = ({ onRestart, onNext, onHelp }) => {
  // Animation for next level button
  const nextButtonAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: onNext ? 1 : 0, transform: onNext ? 'scale(1)' : 'scale(0.8)' },
    config: { tension: 300, friction: 20 }
  });
  
  // Animation for action buttons
  const buttonAnimation = {
    rest: {
      scale: 1,
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      transition: {
        duration: 0.2
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95,
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      transition: {
        duration: 0.1
      }
    }
  };
  
  return (
    <div className="game-controls">
      <button 
        className="control-button restart"
        onClick={onRestart}
        aria-label="Restart Level"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V3M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 9.50233 17.7379 7.29676 15.8454 6M12 5C13.9319 5 15.7454 5.76037 17.1211 7.07703" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 12L12 11V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Restart</span>
      </button>
      
      {onNext && (
        <animated.button 
          className="control-button next"
          style={nextButtonAnimation}
          onClick={onNext}
          aria-label="Next Level"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 4L21 12M21 12L13 20M21 12H3" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Next Level</span>
        </animated.button>
      )}
      
      <button 
        className="control-button help"
        onClick={onHelp}
        aria-label="Help"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 17V17.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 13.5C11.9816 13.1754 12.0692 12.8536 12.2492 12.5818C12.4293 12.3099 12.6933 12.1038 13 12C13.3759 11.8791 13.7132 11.6781 13.9856 11.4126C14.2579 11.1472 14.4578 10.8244 14.5693 10.4704C14.6809 10.1164 14.7015 9.74253 14.6292 9.37879C14.5569 9.01505 14.3935 8.6703 14.1514 8.37359C13.9094 8.07688 13.5958 7.83875 13.239 7.6797C12.8823 7.52065 12.4918 7.44488 12.0979 7.45905C11.7041 7.47321 11.3205 7.57693 10.9761 7.76139C10.6316 7.94585 10.3359 8.20611 10.115 8.5191" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Help</span>
      </button>
    </div>
  );
};

export default GameControls;