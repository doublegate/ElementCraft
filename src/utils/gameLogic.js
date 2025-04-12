/**
 * ElementCraft - Game Logic Utilities
 * 
 * This module provides core game logic functions for ElementCraft,
 * including board generation, element interactions, and game mechanics.
 * 
 * @module gameLogic
 * @author ElementCraft Team
 * @version 1.0.0
 */

import { elementInteractions } from '../constants/elements';

/**
 * Generates an empty game board of specified dimensions
 * 
 * @param {number} rows - Number of rows in the board
 * @param {number} cols - Number of columns in the board
 * @returns {Array<Array<null>>} 2D array representing the empty board
 */
export const generateBoard = (rows, cols) => {
  return Array(rows).fill(null).map(() => Array(cols).fill(null));
};

/**
 * Checks and processes element interactions when a new element is placed
 * 
 * @param {Array<Array<Object>>} board - Current game board state
 * @param {number} row - Row where element was placed
 * @param {number} col - Column where element was placed
 * @returns {Object} Interaction results including new board state and score
 */
export const checkInteractions = (board, row, col) => {
  // If the cell is empty, no interaction occurs
  if (!board[row][col]) return { newBoard: board, score: 0, newElements: [] };
  
  const placedElement = board[row][col].element;
  const boardCopy = JSON.parse(JSON.stringify(board));
  
  // Track interactions
  const interactions = [];
  const newElements = [];
  let totalScore = 0;
  
  // Check adjacent cells for interactions
  const adjacentCells = [
    [row - 1, col],    // Above
    [row + 1, col],    // Below
    [row, col - 1],    // Left
    [row, col + 1],    // Right
    [row - 1, col - 1], // Top-left
    [row - 1, col + 1], // Top-right
    [row + 1, col - 1], // Bottom-left
    [row + 1, col + 1]  // Bottom-right
  ];
  
  // Process each adjacent cell
  adjacentCells.forEach(([adjRow, adjCol]) => {
    // Check if the adjacent cell is within bounds
    if (
      adjRow >= 0 && 
      adjRow < boardCopy.length && 
      adjCol >= 0 && 
      adjCol < boardCopy[0].length
    ) {
      const adjCell = boardCopy[adjRow][adjCol];
      
      // If adjacent cell has an element, check for interaction
      if (adjCell && adjCell.element) {
        const interaction = getElementInteraction(placedElement, adjCell.element);
        
        if (interaction) {
          interactions.push({
            element1: placedElement,
            element2: adjCell.element,
            result: interaction.result,
            position: { row: adjRow, col: adjCol }
          });
          
          // Add new element to tracking if it's not already there
          if (!newElements.includes(interaction.result)) {
            newElements.push(interaction.result);
          }
          
          // Apply the interaction result
          boardCopy[adjRow][adjCol] = { element: interaction.result };
          totalScore += interaction.score;
        }
      }
    }
  });
  
  // Special element effects
  applySpecialElementEffects(boardCopy, row, col, placedElement);
  
  return {
    newBoard: boardCopy,
    score: totalScore,
    newElements: newElements,
    interactions: interactions
  };
};

/**
 * Get the result of interaction between two elements
 * 
 * @param {string} element1 - First element type
 * @param {string} element2 - Second element type
 * @returns {Object|null} Interaction result or null if no interaction
 */
export const getElementInteraction = (element1, element2) => {
  // Check if there's a defined interaction between these elements
  const interactionKey = `${element1}_${element2}`;
  const reverseInteractionKey = `${element2}_${element1}`;
  
  return elementInteractions[interactionKey] || 
         elementInteractions[reverseInteractionKey] || 
         null;
};

/**
 * Apply special effects for specific elements
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Row of placed element
 * @param {number} col - Column of placed element
 * @param {string} elementType - Type of placed element
 */
export const applySpecialElementEffects = (board, row, col, elementType) => {
  switch (elementType) {
    case 'fire':
      // Fire can spread to adjacent flammable elements (like wood)
      applyFireSpread(board, row, col);
      break;
      
    case 'water':
      // Water can flow downward if there's space
      applyWaterFlow(board, row, col);
      break;
      
    case 'air':
      // Air can displace lighter elements
      applyAirDisplacement(board, row, col);
      break;
      
    case 'crystal':
      // Crystal can amplify adjacent elements
      applyCrystalAmplification(board, row, col);
      break;
      
    default:
      // No special effect for this element
      break;
  }
};

/**
 * Apply fire spreading effect
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Row of fire element
 * @param {number} col - Column of fire element
 */
export const applyFireSpread = (board, row, col) => {
  // Check adjacent cells for flammable elements
  const adjacentCells = [
    [row - 1, col],    // Above
    [row + 1, col],    // Below
    [row, col - 1],    // Left
    [row, col + 1],    // Right
  ];
  
  adjacentCells.forEach(([adjRow, adjCol]) => {
    // Check if the adjacent cell is within bounds
    if (
      adjRow >= 0 && 
      adjRow < board.length && 
      adjCol >= 0 && 
      adjCol < board[0].length
    ) {
      const adjCell = board[adjRow][adjCol];
      
      // Check if the adjacent cell has a flammable element
      if (adjCell && adjCell.element === 'wood') {
        // 20% chance to ignite wood
        if (Math.random() < 0.2) {
          board[adjRow][adjCol] = { element: 'fire' };
        }
      }
    }
  });
};

/**
 * Apply water flow effect
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Row of water element
 * @param {number} col - Column of water element
 */
export const applyWaterFlow = (board, row, col) => {
  // Water can flow downward if there's space
  // Check below
  if (row + 1 < board.length) {
    const cellBelow = board[row + 1][col];
    
    if (!cellBelow) {
      // Move water down
      board[row + 1][col] = { element: 'water' };
      board[row][col] = null;
    }
  }
  
  // Water can also spread horizontally if there's no resistance
  const horizontalCells = [
    [row, col - 1],    // Left
    [row, col + 1],    // Right
  ];
  
  horizontalCells.forEach(([adjRow, adjCol]) => {
    // Check if the adjacent cell is within bounds
    if (
      adjRow >= 0 && 
      adjRow < board.length && 
      adjCol >= 0 && 
      adjCol < board[0].length
    ) {
      // Water has a 10% chance to spread horizontally to empty cells
      if (!board[adjRow][adjCol] && Math.random() < 0.1) {
        board[adjRow][adjCol] = { element: 'water', flowing: true };
      }
    }
  });
};

/**
 * Apply air displacement effect
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Row of air element
 * @param {number} col - Column of air element
 */
export const applyAirDisplacement = (board, row, col) => {
  // Air can displace lighter elements upward
  if (row - 1 >= 0) {
    const cellAbove = board[row - 1][col];
    
    // If cell above has a light element (fire, air), it can be pushed further up
    if (cellAbove && (cellAbove.element === 'fire' || cellAbove.element === 'steam')) {
      // Try to push it one more cell up
      if (row - 2 >= 0 && !board[row - 2][col]) {
        board[row - 2][col] = { ...cellAbove };
        board[row - 1][col] = null;
      }
    }
  }
};

/**
 * Apply crystal amplification effect
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Row of crystal element
 * @param {number} col - Column of crystal element
 */
export const applyCrystalAmplification = (board, row, col) => {
  // Crystal amplifies the effects of adjacent elements
  const adjacentCells = [
    [row - 1, col],    // Above
    [row + 1, col],    // Below
    [row, col - 1],    // Left
    [row, col + 1],    // Right
  ];
  
  adjacentCells.forEach(([adjRow, adjCol]) => {
    // Check if the adjacent cell is within bounds
    if (
      adjRow >= 0 && 
      adjRow < board.length && 
      adjCol >= 0 && 
      adjCol < board[0].length
    ) {
      const adjCell = board[adjRow][adjCol];
      
      // If there's an element, amplify its effect
      if (adjCell && adjCell.element) {
        // Mark the element as amplified
        board[adjRow][adjCol] = { 
          ...adjCell, 
          amplified: true,
          power: (adjCell.power || 1) * 2
        };
      }
    }
  });
};

/**
 * Check if a word puzzle solution is correct
 * 
 * @param {Array<string>} solution - The correct word
 * @param {Array<string>} attempt - The player's attempt
 * @returns {Array<string>} Result with 'correct', 'present', or 'absent' for each letter
 */
export const checkWordPuzzle = (solution, attempt) => {
  if (solution.length !== attempt.length) {
    return null;
  }
  
  const result = Array(solution.length).fill('absent');
  const solutionChars = [...solution];
  
  // First pass: check for correct positions
  for (let i = 0; i < attempt.length; i++) {
    if (attempt[i] === solutionChars[i]) {
      result[i] = 'correct';
      solutionChars[i] = null; // Mark as used
    }
  }
  
  // Second pass: check for present but incorrect position
  for (let i = 0; i < attempt.length; i++) {
    if (result[i] !== 'correct') {
      const charIndex = solutionChars.indexOf(attempt[i]);
      if (charIndex !== -1) {
        result[i] = 'present';
        solutionChars[charIndex] = null; // Mark as used
      }
    }
  }
  
  return result;
};

/**
 * Check if a logic puzzle (Sudoku-style) is valid
 * 
 * @param {Array<Array<Object>>} board - Current game board (or section)
 * @param {string[]} validElements - Array of valid elements for the puzzle
 * @returns {boolean} Whether the puzzle is valid
 */
export const checkLogicPuzzle = (board, validElements) => {
  const size = board.length;
  
  // Check rows
  for (let row = 0; row < size; row++) {
    const elements = new Set();
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      if (!cell || !cell.element || !validElements.includes(cell.element)) {
        return false;
      }
      if (elements.has(cell.element)) {
        return false; // Duplicate in row
      }
      elements.add(cell.element);
    }
  }
  
  // Check columns
  for (let col = 0; col < size; col++) {
    const elements = new Set();
    for (let row = 0; row < size; row++) {
      const cell = board[row][col];
      if (!cell || !cell.element) {
        return false;
      }
      if (elements.has(cell.element)) {
        return false; // Duplicate in column
      }
      elements.add(cell.element);
    }
  }
  
  // Check 3x3 subgrids for 9x9 puzzles
  if (size === 9) {
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const elements = new Set();
        for (let row = boxRow * 3; row < boxRow * 3 + 3; row++) {
          for (let col = boxCol * 3; col < boxCol * 3 + 3; col++) {
            const cell = board[row][col];
            if (!cell || !cell.element) {
              return false;
            }
            if (elements.has(cell.element)) {
              return false; // Duplicate in 3x3 box
            }
            elements.add(cell.element);
          }
        }
      }
    }
  }
  
  return true;
};

/**
 * Apply physics to elements on the board
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @returns {Array<Array<Object>>} Updated board after physics
 */
export const applyPhysics = (board) => {
  const updatedBoard = JSON.parse(JSON.stringify(board));
  
  // Process gravity for elements affected by it
  for (let col = 0; col < updatedBoard[0].length; col++) {
    for (let row = updatedBoard.length - 2; row >= 0; row--) {
      const cell = updatedBoard[row][col];
      
      if (cell && isAffectedByGravity(cell.element)) {
        const cellBelow = updatedBoard[row + 1][col];
        
        if (!cellBelow) {
          // Move element down
          updatedBoard[row + 1][col] = { ...cell };
          updatedBoard[row][col] = null;
        }
      }
    }
  }
  
  // Process buoyancy for elements affected by it
  for (let col = 0; col < updatedBoard[0].length; col++) {
    for (let row = 1; row < updatedBoard.length; row++) {
      const cell = updatedBoard[row][col];
      
      if (cell && isAffectedByBuoyancy(cell.element)) {
        const cellAbove = updatedBoard[row - 1][col];
        
        if (!cellAbove) {
          // Move element up
          updatedBoard[row - 1][col] = { ...cell };
          updatedBoard[row][col] = null;
        }
      }
    }
  }
  
  return updatedBoard;
};

/**
 * Check if an element is affected by gravity
 * 
 * @param {string} element - Element type
 * @returns {boolean} Whether element is affected by gravity
 */
export const isAffectedByGravity = (element) => {
  return ['water', 'earth', 'metal'].includes(element);
};

/**
 * Check if an element is affected by buoyancy
 * 
 * @param {string} element - Element type
 * @returns {boolean} Whether element is affected by buoyancy
 */
export const isAffectedByBuoyancy = (element) => {
  return ['fire', 'air', 'steam'].includes(element);
};

/**
 * Generate a word puzzle for a level
 * 
 * @param {number} level - Current level number
 * @returns {Object} Word puzzle data
 */
export const generateWordPuzzle = (level) => {
  // Word puzzles based on element-related terms
  const wordsByLevel = {
    1: ['FLAME', 'WATER', 'EARTH'],
    2: ['STEAM', 'CLOUD', 'RIVER'],
    3: ['METAL', 'FORGE', 'ALLOY'],
    4: ['PLANT', 'BLOOM', 'WOODS'],
    5: ['STORM', 'FROST', 'BLAZE']
  };
  
  const words = wordsByLevel[level] || wordsByLevel[1];
  const selectedWord = words[Math.floor(Math.random() * words.length)];
  
  return {
    word: selectedWord,
    hints: selectedWord.length,
    attempts: 6
  };
};

/**
 * Generate a logic puzzle for a level
 * 
 * @param {number} level - Current level number
 * @returns {Object} Logic puzzle data
 */
export const generateLogicPuzzle = (level) => {
  const size = level <= 2 ? 4 : (level <= 4 ? 6 : 9);
  const elements = ['fire', 'water', 'earth', 'air'];
  
  if (level >= 3) elements.push('metal');
  if (level >= 4) elements.push('wood');
  
  // Generate a valid puzzle solution
  const solution = generateSolution(size, elements.slice(0, size));
  
  // Create a puzzle by removing some elements from the solution
  const puzzle = createPuzzle(solution, difficulty(level));
  
  return {
    size,
    puzzle,
    solution,
    validElements: elements.slice(0, size)
  };
};

/**
 * Generate a valid solution for a logic puzzle
 * 
 * @param {number} size - Size of the puzzle
 * @param {string[]} elements - Valid elements
 * @returns {Array<Array<Object>>} Completed puzzle
 */
export const generateSolution = (size, elements) => {
  const solution = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Fill solution with a valid arrangement
  // This is a simplified algorithm for demo purposes
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const element = elements[(row + col) % elements.length];
      solution[row][col] = { element };
    }
  }
  
  return solution;
};

/**
 * Create a puzzle from a solution by removing some elements
 * 
 * @param {Array<Array<Object>>} solution - Complete solution
 * @param {number} difficulty - Percentage of cells to remove (0-1)
 * @returns {Array<Array<Object>>} Puzzle with some elements removed
 */
export const createPuzzle = (solution, difficulty) => {
  const size = solution.length;
  const puzzle = JSON.parse(JSON.stringify(solution));
  const totalCells = size * size;
  const cellsToRemove = Math.floor(totalCells * difficulty);
  
  // Remove random cells
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      removed++;
    }
  }
  
  return puzzle;
};

/**
 * Get difficulty percentage based on level
 * 
 * @param {number} level - Current level
 * @returns {number} Difficulty percentage (0-1)
 */
export const difficulty = (level) => {
  // Increase difficulty with level
  return Math.min(0.3 + (level * 0.1), 0.7);
};