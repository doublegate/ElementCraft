/**
 * ElementCraft - Logic Puzzle Component
 * 
 * This component implements a Sudoku-inspired logic puzzle where players
 * must arrange elements according to logical rules to unlock special abilities.
 * 
 * @module LogicPuzzle
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { checkLogicPuzzle } from '../utils/gameLogic';
import { elementColors, elementSymbols } from '../constants/elements';

const LogicPuzzle = ({ size = 4, validElements, solution, onComplete, onClose }) => {
  // Current puzzle state
  const [puzzle, setPuzzle] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [errors, setErrors] = useState([]);
  const [complete, setComplete] = useState(false);
  const [hints, setHints] = useState(3); // Number of hints available
  
  // Animation for the puzzle container
  const containerAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 280, friction: 20 }
  });
  
  // Initialize the puzzle
  useEffect(() => {
    initializePuzzle();
  }, []);
  
  // Initialize puzzle with some pre-filled cells
  const initializePuzzle = () => {
    // Create empty puzzle grid
    const newPuzzle = Array(size).fill(null).map(() => Array(size).fill(null));
    
    // Fill in some cells as hints
    const cellsToFill = Math.floor(size * size * 0.3); // Fill about 30% of cells
    let filled = 0;
    
    while (filled < cellsToFill) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      
      // Skip if already filled
      if (newPuzzle[row][col]) continue;
      
      // Get element from solution for this cell
      const element = solution[row][col].element;
      
      // Fill the cell
      newPuzzle[row][col] = {
        element,
        fixed: true // Pre-filled cells can't be changed
      };
      
      filled++;
    }
    
    setPuzzle(newPuzzle);
  };
  
  // Check if puzzle is complete
  const checkCompletion = (currentPuzzle) => {
    // Check each row
    for (let row = 0; row < size; row++) {
      const rowElements = new Set();
      for (let col = 0; col < size; col++) {
        const cell = currentPuzzle[row][col];
        if (!cell) return false; // Incomplete if any cell is empty
        
        if (rowElements.has(cell.element)) {
          return false; // Duplicate in row
        }
        rowElements.add(cell.element);
      }
      
      // Check if row has all required elements
      if (rowElements.size !== validElements.length) return false;
    }
    
    // Check each column
    for (let col = 0; col < size; col++) {
      const colElements = new Set();
      for (let row = 0; row < size; row++) {
        const cell = currentPuzzle[row][col];
        if (!cell) return false; // Incomplete if any cell is empty
        
        if (colElements.has(cell.element)) {
          return false; // Duplicate in column
        }
        colElements.add(cell.element);
      }
      
      // Check if column has all required elements
      if (colElements.size !== validElements.length) return false;
    }
    
    // Check subsections for larger puzzles (9x9)
    if (size === 9) {
      const subsectionSize = 3;
      for (let subRow = 0; subRow < 3; subRow++) {
        for (let subCol = 0; subCol < 3; subCol++) {
          const subElements = new Set();
          
          for (let row = subRow * subsectionSize; row < (subRow + 1) * subsectionSize; row++) {
            for (let col = subCol * subsectionSize; col < (subCol + 1) * subsectionSize; col++) {
              const cell = currentPuzzle[row][col];
              if (!cell) return false; // Incomplete if any cell is empty
              
              if (subElements.has(cell.element)) {
                return false; // Duplicate in subsection
              }
              subElements.add(cell.element);
            }
          }
          
          // Check if subsection has all required elements
          if (subElements.size !== validElements.length) return false;
        }
      }
    }
    
    return true;
  };
  
  // Handle cell click
  const handleCellClick = (row, col) => {
    // Ignore fixed cells
    if (puzzle[row][col]?.fixed) return;
    
    // Select the cell
    setSelectedCell({ row, col });
  };
  
  // Handle element selection
  const handleElementSelect = (element) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    // Create new puzzle with updated cell
    const newPuzzle = [...puzzle];
    newPuzzle[row][col] = { element };
    
    // Check for conflicts
    const newErrors = findConflicts(newPuzzle, row, col);
    setErrors(newErrors);
    
    // Update puzzle
    setPuzzle(newPuzzle);
    
    // Check if puzzle is complete
    if (checkCompletion(newPuzzle)) {
      setComplete(true);
      if (onComplete) {
        onComplete(true);
      }
    }
  };
  
  // Find conflicts in the puzzle
  const findConflicts = (currentPuzzle, changedRow, changedCol) => {
    const conflicts = [];
    const changedElement = currentPuzzle[changedRow][changedCol]?.element;
    
    if (!changedElement) return conflicts;
    
    // Check row for conflicts
    for (let col = 0; col < size; col++) {
      if (col !== changedCol && 
          currentPuzzle[changedRow][col]?.element === changedElement) {
        conflicts.push({ row: changedRow, col });
        conflicts.push({ row: changedRow, col: changedCol });
      }
    }
    
    // Check column for conflicts
    for (let row = 0; row < size; row++) {
      if (row !== changedRow && 
          currentPuzzle[row][changedCol]?.element === changedElement) {
        conflicts.push({ row, col: changedCol });
        conflicts.push({ row: changedRow, col: changedCol });
      }
    }
    
    // Check subsection for conflicts (for 9x9 puzzles)
    if (size === 9) {
      const subsectionSize = 3;
      const subRow = Math.floor(changedRow / subsectionSize);
      const subCol = Math.floor(changedCol / subsectionSize);
      
      for (let row = subRow * subsectionSize; row < (subRow + 1) * subsectionSize; row++) {
        for (let col = subCol * subsectionSize; col < (subCol + 1) * subsectionSize; col++) {
          if (row !== changedRow && col !== changedCol && 
              currentPuzzle[row][col]?.element === changedElement) {
            conflicts.push({ row, col });
            conflicts.push({ row: changedRow, col: changedCol });
          }
        }
      }
    }
    
    return conflicts;
  };
  
  // Check if a cell has an error
  const hasError = (row, col) => {
    return errors.some(error => error.row === row && error.col === col);
  };
  
  // Use a hint to fill in a cell
  const useHint = () => {
    if (hints <= 0 || !selectedCell) return;
    
    const { row, col } = selectedCell;
    
    // Ignore if cell is already filled correctly
    if (puzzle[row][col]?.element === solution[row][col].element) return;
    
    // Get correct element from solution
    const correctElement = solution[row][col].element;
    
    // Update puzzle
    const newPuzzle = [...puzzle];
    newPuzzle[row][col] = { 
      element: correctElement,
      hint: true // Mark as filled by hint
    };
    
    setPuzzle(newPuzzle);
    setHints(hints - 1);
    
    // Clear errors
    setErrors([]);
    
    // Check if puzzle is complete
    if (checkCompletion(newPuzzle)) {
      setComplete(true);
      if (onComplete) {
        onComplete(true);
      }
    }
  };
  
  // Generate puzzle grid
  const renderPuzzleGrid = () => {
    return (
      <div 
        className="logic-puzzle-grid"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`
        }}
      >
        {puzzle.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isError = hasError(rowIndex, colIndex);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  logic-puzzle-cell
                  ${isSelected ? 'selected' : ''}
                  ${isError ? 'error' : ''}
                  ${cell?.fixed ? 'fixed' : ''}
                  ${cell?.hint ? 'hint' : ''}
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell && (
                  <div 
                    className="element-icon"
                    style={{ backgroundColor: elementColors[cell.element] }}
                  >
                    {elementSymbols[cell.element]}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };
  
  // Generate element selector
  const renderElementSelector = () => {
    return (
      <div className="logic-puzzle-elements">
        {validElements.map(element => (
          <button
            key={element}
            className="element-button"
            onClick={() => handleElementSelect(element)}
          >
            <div 
              className="element-icon"
              style={{ backgroundColor: elementColors[element] }}
            >
              {elementSymbols[element]}
            </div>
            <div className="element-name">
              {element.charAt(0).toUpperCase() + element.slice(1)}
            </div>
          </button>
        ))}
      </div>
    );
  };
  
  // Generate puzzle rules
  const renderRules = () => {
    return (
      <div className="logic-puzzle-rules">
        <h3>Rules:</h3>
        <ul>
          <li>Each row must contain one of each element</li>
          <li>Each column must contain one of each element</li>
          {size === 9 && (
            <li>Each 3x3 section must contain one of each element</li>
          )}
        </ul>
      </div>
    );
  };
  
  return (
    <div className="logic-puzzle-overlay">
      <animated.div 
        className="logic-puzzle-container"
        style={containerAnimation}
      >
        <div className="puzzle-header">
          <h2>Elemental Logic Puzzle</h2>
          <div className="hint-counter">
            Hints: {hints}
            <button 
              className="hint-button"
              onClick={useHint}
              disabled={hints <= 0 || !selectedCell}
            >
              Use Hint
            </button>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="puzzle-content">
          {renderRules()}
          
          <div className="puzzle-grid-container">
            {renderPuzzleGrid()}
          </div>
          
          {renderElementSelector()}
        </div>
        
        {complete && (
          <div className="puzzle-complete">
            <h3>Puzzle Solved!</h3>
            <p>You've unlocked a new elemental ability!</p>
            <button 
              className="continue-button"
              onClick={() => {
                if (onClose) onClose();
              }}
            >
              Continue
            </button>
          </div>
        )}
      </animated.div>
    </div>
  );
};

export default LogicPuzzle;