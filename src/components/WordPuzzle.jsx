/**
 * ElementCraft - Word Puzzle Component
 * 
 * This component implements a Wordle-inspired word puzzle that players
 * must solve to unlock special elements and abilities.
 * 
 * @module WordPuzzle
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { checkWordPuzzle } from '../utils/gameLogic';
import { elementColors } from '../constants/elements';

const WordPuzzle = ({ word, maxAttempts = 6, onComplete, onClose }) => {
  // Current attempt and position
  const [currentAttempt, setCurrentAttempt] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [results, setResults] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [shakingRow, setShakingRow] = useState(-1);
  const [revealIndices, setRevealIndices] = useState({ row: -1, col: -1 });
  
  // Reference to input for focus
  const inputRef = useRef(null);
  
  // Animation for the puzzle panel
  const panelAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 24 }
  });
  
  // Set focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Submit current attempt
  const submitAttempt = () => {
    // Validate current attempt
    if (currentAttempt.length !== word.length) {
      // Shake the current row to indicate incorrect length
      setShakingRow(attempts.length);
      setTimeout(() => setShakingRow(-1), 500);
      return;
    }
    
    // Check the attempt
    const result = checkWordPuzzle(word.split(''), currentAttempt.split(''));
    
    // Update attempts and results
    setAttempts([...attempts, currentAttempt]);
    setResults([...results, result]);
    
    // Clear current attempt
    setCurrentAttempt('');
    
    // Animate tile reveals
    animateReveal(attempts.length);
    
    // Check if player won
    if (result.every(status => status === 'correct')) {
      setTimeout(() => {
        setGameStatus('won');
        if (onComplete) {
          onComplete(true, attempts.length + 1);
        }
      }, word.length * 300 + 500); // Wait for reveal animation
    } 
    // Check if player lost (used all attempts)
    else if (attempts.length + 1 >= maxAttempts) {
      setTimeout(() => {
        setGameStatus('lost');
        if (onComplete) {
          onComplete(false, attempts.length + 1);
        }
      }, word.length * 300 + 500); // Wait for reveal animation
    }
  };
  
  // Animate tile reveals one by one
  const animateReveal = (rowIndex) => {
    for (let i = 0; i < word.length; i++) {
      setTimeout(() => {
        setRevealIndices({ row: rowIndex, col: i });
      }, i * 300);
    }
    
    // Reset reveal indices after animation
    setTimeout(() => {
      setRevealIndices({ row: -1, col: -1 });
    }, word.length * 300 + 100);
  };
  
  // Handle keyboard input
  const handleKeyDown = (e) => {
    if (gameStatus !== 'playing') return;
    
    if (e.key === 'Enter') {
      submitAttempt();
    } else if (e.key === 'Backspace') {
      setCurrentAttempt(currentAttempt.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(e.key) && currentAttempt.length < word.length) {
      setCurrentAttempt(currentAttempt + e.key.toUpperCase());
    }
  };
  
  // Generate keyboard with colored keys based on results
  const generateKeyboard = () => {
    const keyboard = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];
    
    // Track key statuses from all attempts
    const keyStatus = {};
    
    results.forEach((result, rowIndex) => {
      const attempt = attempts[rowIndex];
      result.forEach((status, colIndex) => {
        const letter = attempt[colIndex];
        // Only upgrade status (absent -> present -> correct)
        if (!keyStatus[letter] || 
            (status === 'present' && keyStatus[letter] === 'absent') ||
            (status === 'correct' && keyStatus[letter] !== 'correct')) {
          keyStatus[letter] = status;
        }
      });
    });
    
    return (
      <div className="word-puzzle-keyboard">
        {keyboard.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {rowIndex === 2 && (
              <button 
                className="keyboard-key keyboard-enter"
                onClick={submitAttempt}
              >
                ENTER
              </button>
            )}
            
            {row.map(key => {
              const status = keyStatus[key] || '';
              
              return (
                <button 
                  key={key} 
                  className={`keyboard-key ${status}`}
                  onClick={() => {
                    if (currentAttempt.length < word.length) {
                      setCurrentAttempt(currentAttempt + key);
                    }
                  }}
                >
                  {key}
                </button>
              );
            })}
            
            {rowIndex === 2 && (
              <button 
                className="keyboard-key keyboard-backspace"
                onClick={() => setCurrentAttempt(currentAttempt.slice(0, -1))}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 4H8L1 12L8 20H21C21.5304 20 22.0391 19.7893 22.4142 19.4142C22.7893 19.0391 23 18.5304 23 18V6C23 5.46957 22.7893 4.96086 22.4142 4.58579C22.0391 4.21071 21.5304 4 21 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 9L12 15M12 9L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Generate grid rows
  const generateRows = () => {
    const rows = [];
    
    // Past attempts with results
    for (let rowIndex = 0; rowIndex < attempts.length; rowIndex++) {
      const attempt = attempts[rowIndex];
      const result = results[rowIndex];
      
      rows.push(
        <div 
          key={`attempt-${rowIndex}`}
          className={`word-row ${shakingRow === rowIndex ? 'shake' : ''}`}
        >
          {Array.from(attempt.padEnd(word.length)).map((letter, colIndex) => {
            const isRevealing = rowIndex === revealIndices.row && colIndex <= revealIndices.col;
            
            return (
              <div 
                key={`tile-${rowIndex}-${colIndex}`}
                className={`word-tile ${isRevealing ? result[colIndex] : ''}`}
                style={{
                  transitionDelay: `${colIndex * 0.1}s`
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      );
    }
    
    // Current attempt row
    if (gameStatus === 'playing' && attempts.length < maxAttempts) {
      rows.push(
        <div 
          key="current-attempt"
          className={`word-row ${shakingRow === attempts.length ? 'shake' : ''}`}
        >
          {Array.from(currentAttempt.padEnd(word.length)).map((letter, colIndex) => (
            <div 
              key={`current-${colIndex}`}
              className={`word-tile ${letter ? 'filled' : ''}`}
            >
              {letter}
            </div>
          ))}
        </div>
      );
    }
    
    // Empty rows
    const emptyRows = maxAttempts - attempts.length - (gameStatus === 'playing' ? 1 : 0);
    for (let i = 0; i < emptyRows; i++) {
      rows.push(
        <div key={`empty-${i}`} className="word-row">
          {Array(word.length).fill().map((_, colIndex) => (
            <div 
              key={`empty-${i}-${colIndex}`}
              className="word-tile"
            />
          ))}
        </div>
      );
    }
    
    return rows;
  };
  
  // Generate game result message
  const getResultMessage = () => {
    if (gameStatus === 'won') {
      return `You solved the puzzle in ${attempts.length} ${attempts.length === 1 ? 'try' : 'tries'}!`;
    } else if (gameStatus === 'lost') {
      return `The word was ${word}. Better luck next time!`;
    }
    return null;
  };
  
  // Generate element hint based on the first letter
  const getElementHint = () => {
    const firstLetter = word[0];
    
    const elementHints = {
      'F': { element: 'fire', description: 'This element burns bright and rises upward.' },
      'W': { element: 'water', description: 'This element flows and gives life.' },
      'E': { element: 'earth', description: 'This element provides stability and foundation.' },
      'A': { element: 'air', description: 'This element is all around us, invisible but essential.' },
      'M': { element: 'metal', description: 'This element conducts energy and is strong.' },
      'C': { element: 'crystal', description: 'This element amplifies power and reflects light.' },
      'S': { element: 'steam', description: 'This element rises when fire meets water.' },
      'L': { element: 'lava', description: 'This element flows like liquid fire.' },
      'P': { element: 'plasma', description: 'This element is the most energetic state of matter.' }
    };
    
    const hint = elementHints[firstLetter] || { element: 'unknown', description: 'Solve the puzzle to discover the element.' };
    
    return (
      <div className="element-hint">
        <h4>Element Hint:</h4>
        <div 
          className="hint-element"
          style={{ backgroundColor: elementColors[hint.element] || '#666' }}
        >
          {hint.element.charAt(0).toUpperCase()}
        </div>
        <p>{hint.description}</p>
      </div>
    );
  };
  
  return (
    <div className="word-puzzle-overlay">
      <animated.div 
        className="word-puzzle-container"
        style={panelAnimation}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        ref={inputRef}
      >
        <div className="puzzle-header">
          <h2>Elemental Word Puzzle</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="puzzle-description">
          <p>
            Guess the elemental word in {maxAttempts} tries.
            Each guess must be a {word.length}-letter word.
            After each guess, the tiles will show how close your guess was.
          </p>
        </div>
        
        <div className="puzzle-grid">
          {generateRows()}
        </div>
        
        {getElementHint()}
        
        {getResultMessage() && (
          <div className={`puzzle-result ${gameStatus}`}>
            {getResultMessage()}
            {gameStatus === 'won' && (
              <div className="puzzle-reward">
                <span>Reward:</span> Unlocked new element!
              </div>
            )}
          </div>
        )}
        
        {generateKeyboard()}
        
        <div className="puzzle-legend">
          <div className="legend-item">
            <div className="legend-tile correct"></div>
            <span>Correct letter and position</span>
          </div>
          <div className="legend-item">
            <div className="legend-tile present"></div>
            <span>Correct letter, wrong position</span>
          </div>
          <div className="legend-item">
            <div className="legend-tile absent"></div>
            <span>Letter not in the word</span>
          </div>
        </div>
      </animated.div>
    </div>
  );
};

export default WordPuzzle;