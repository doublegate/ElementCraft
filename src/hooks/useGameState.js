/**
 * ElementCraft - Game State Hook
 * 
 * This custom hook manages the game state, including the board,
 * elements, levels, and game progress. It provides functions for
 * element placement, level management, and state updates.
 * 
 * @module useGameState
 * @author ElementCraft Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { generateBoard, checkInteractions } from '../utils/gameLogic';
import { INITIAL_ELEMENTS, UNLOCKABLE_ELEMENTS } from '../constants/elements';
import { GAME_STATES } from '../constants/gameStates';
import { levelObjectives, levelRequirements } from '../constants/levels';

const useGameState = () => {
  // Game state (intro, playing, level complete, game over)
  const [gameState, setGameState] = useState(GAME_STATES.INTRO);
  
  // Current level
  const [currentLevel, setCurrentLevel] = useState(1);
  
  // Player score
  const [score, setScore] = useState(0);
  
  // Game board - 2D grid of cells
  const [board, setBoard] = useState([]);
  
  // Available elements
  const [elements, setElements] = useState(INITIAL_ELEMENTS);
  
  // Currently selected element
  const [selectedElement, setSelectedElement] = useState(null);
  
  // Level objectives
  const [objectives, setObjectives] = useState([]);
  
  // Initialize/reset the game
  const initializeGame = useCallback((level = 1) => {
    // Set current level
    setCurrentLevel(level);
    
    // Get board dimensions for current level
    const { rows, cols } = levelRequirements[level] || { rows: 8, cols: 8 };
    
    // Create new empty board
    const newBoard = generateBoard(rows, cols);
    setBoard(newBoard);
    
    // Reset objectives for current level
    setObjectives(levelObjectives[level] || []);
    
    // Determine available elements for this level
    const availableElements = [...INITIAL_ELEMENTS];
    
    // Add unlockable elements based on level
    if (level >= 2) availableElements.push('metal');
    if (level >= 3) availableElements.push('wood');
    if (level >= 5) {
      // Special elements unlocked at higher levels
      availableElements.push('crystal');
      availableElements.push('steam');
    }
    
    setElements(availableElements);
    setSelectedElement(null);
    
    // Update game state to playing
    setGameState(GAME_STATES.PLAYING);
  }, []);
  
  // Start game from the first level
  const startGame = useCallback(() => {
    setScore(0);
    initializeGame(1);
  }, [initializeGame]);
  
  // Restart the current level
  const restartLevel = useCallback(() => {
    initializeGame(currentLevel);
  }, [initializeGame, currentLevel]);
  
  // Proceed to the next level
  const nextLevel = useCallback(() => {
    // Add level completion bonus to score
    setScore(prevScore => {
      const bonus = Math.floor(prevScore * 0.1); // 10% bonus
      return prevScore + bonus;
    });
    
    // If all levels are complete, show game over
    if (currentLevel >= Object.keys(levelRequirements).length) {
      setGameState(GAME_STATES.GAME_OVER);
    } else {
      // Otherwise initialize the next level
      initializeGame(currentLevel + 1);
    }
  }, [currentLevel, initializeGame]);
  
  // Place an element on the board
  const placeElement = useCallback((rowIndex, colIndex, elementType) => {
    // Check if cell is already occupied
    if (board[rowIndex][colIndex] !== null) {
      return false;
    }
    
    // Update the board with the new element
    const newBoard = [...board];
    newBoard[rowIndex][colIndex] = { element: elementType };
    setBoard(newBoard);
    
    // Check for element interactions
    const interactions = checkInteractions(newBoard, rowIndex, colIndex);
    
    // Apply interaction effects and update score
    if (interactions.length > 0) {
      // Update board with interaction results
      setBoard(interactions.newBoard || newBoard);
      
      // Award points for combinations
      setScore(prevScore => prevScore + (interactions.score || 100));
      
      // Check if any new elements were created
      if (interactions.newElements) {
        setElements(prevElements => {
          const updatedElements = [...prevElements];
          
          // Add any newly discovered elements
          interactions.newElements.forEach(element => {
            if (!updatedElements.includes(element)) {
              updatedElements.push(element);
            }
          });
          
          return updatedElements;
        });
      }
      
      return { success: true, reaction: true, interactions };
    }
    
    // Add base score for placing an element
    setScore(prevScore => prevScore + 10);
    
    // Check objectives after placement
    checkObjectives(newBoard);
    
    return { success: true, reaction: false };
  }, [board]);
  
  // Check if level objectives are complete
  const checkObjectives = useCallback((currentBoard) => {
    let allComplete = true;
    const updatedObjectives = objectives.map(objective => {
      // Skip already completed objectives
      if (objective.completed) return objective;
      
      // Check specific objective types
      let completed = false;
      
      switch (objective.type) {
        case 'create_element':
          // Check if specific element exists on the board
          completed = currentBoard.some(row => 
            row.some(cell => cell && cell.element === objective.element)
          );
          break;
          
        case 'create_combination':
          // Check if specific combination exists
          completed = objective.combination.every(item => {
            const [element, count] = item;
            const actualCount = currentBoard.flat().filter(
              cell => cell && cell.element === element
            ).length;
            return actualCount >= count;
          });
          break;
          
        case 'build_structure':
          // Check for specific structure pattern
          // Implementation depends on structure definition
          completed = checkStructure(currentBoard, objective.pattern);
          break;
          
        case 'solve_puzzle':
          // Check if word or logic puzzle is solved
          // Implementation depends on puzzle definition
          completed = checkPuzzleSolution(currentBoard, objective.solution);
          break;
          
        default:
          completed = false;
      }
      
      if (completed) {
        // Award points for completing an objective
        setScore(prevScore => prevScore + objective.points || 100);
      }
      
      allComplete = allComplete && (completed || objective.completed);
      
      return {
        ...objective,
        completed: completed || objective.completed
      };
    });
    
    setObjectives(updatedObjectives);
    
    // If all objectives are complete, set level complete state
    if (allComplete) {
      setGameState(GAME_STATES.LEVEL_COMPLETE);
    }
  }, [objectives]);
  
  // Check if a specific structure pattern exists on the board
  const checkStructure = (board, pattern) => {
    // Implementation for checking structures
    // This would involve pattern matching against the board
    
    // Simple example: Check if a 2x2 square of earth elements exists
    if (pattern === 'earth_square') {
      for (let row = 0; row < board.length - 1; row++) {
        for (let col = 0; col < board[0].length - 1; col++) {
          if (
            board[row][col]?.element === 'earth' &&
            board[row][col + 1]?.element === 'earth' &&
            board[row + 1][col]?.element === 'earth' &&
            board[row + 1][col + 1]?.element === 'earth'
          ) {
            return true;
          }
        }
      }
    }
    
    return false;
  };
  
  // Check if a puzzle solution is correct
  const checkPuzzleSolution = (board, solution) => {
    // Implementation for checking puzzle solutions
    // This would depend on the type of puzzle
    
    // Simple example: Check if a specific sequence of elements exists
    if (solution.type === 'sequence') {
      const sequence = solution.sequence;
      
      // Check rows for sequence
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col <= board[0].length - sequence.length; col++) {
          let match = true;
          for (let i = 0; i < sequence.length; i++) {
            if (board[row][col + i]?.element !== sequence[i]) {
              match = false;
              break;
            }
          }
          if (match) return true;
        }
      }
      
      // Check columns for sequence
      for (let col = 0; col < board[0].length; col++) {
        for (let row = 0; row <= board.length - sequence.length; row++) {
          let match = true;
          for (let i = 0; i < sequence.length; i++) {
            if (board[row + i][col]?.element !== sequence[i]) {
              match = false;
              break;
            }
          }
          if (match) return true;
        }
      }
    }
    
    return false;
  };
  
  // Check if current level is complete
  const isLevelComplete = gameState === GAME_STATES.LEVEL_COMPLETE;
  
  // Initialize the game when the hook is first used
  useEffect(() => {
    // Only initialize board on first load
    if (board.length === 0) {
      const { rows, cols } = levelRequirements[1] || { rows: 8, cols: 8 };
      setBoard(generateBoard(rows, cols));
    }
  }, [board.length]);
  
  return {
    gameState,
    currentLevel,
    selectedElement,
    score,
    board,
    elements,
    objectives,
    setSelectedElement,
    placeElement,
    startGame,
    restartLevel,
    nextLevel,
    isLevelComplete
  };
};

export default useGameState;