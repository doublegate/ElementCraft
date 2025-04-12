/**
 * ElementCraft - Puzzle Utilities
 * 
 * This module handles puzzle generation and validation for the
 * word puzzles and logic puzzles in the game.
 * 
 * @module puzzles
 * @author ElementCraft Team
 * @version 1.0.0
 */

// Word lists for word puzzles
const wordLists = {
  // Fire-related words
  fire: ['FLAME', 'BLAZE', 'TORCH', 'SPARK', 'EMBER', 'SCORCH', 'INFERNO', 'KINDLE'],
  
  // Water-related words
  water: ['STREAM', 'RIVER', 'OCEAN', 'FLUID', 'HYDRO', 'AQUA', 'SPLASH', 'DRIP'],
  
  // Earth-related words
  earth: ['STONE', 'TERRA', 'SOIL', 'QUAKE', 'ROCK', 'CRYSTAL', 'METAL', 'CLAY'],
  
  // Air-related words
  air: ['BREEZE', 'WIND', 'GUST', 'STORM', 'CLOUD', 'VAPOR', 'ZEPHYR', 'WISP'],
  
  // Metal-related words
  metal: ['ALLOY', 'FORGE', 'STEEL', 'SILVER', 'GOLD', 'IRON', 'BRASS', 'SMITH'],
  
  // Wood-related words
  wood: ['GROVE', 'FOREST', 'PLANT', 'TRUNK', 'BRANCH', 'LEAF', 'TIMBER', 'SEED'],
  
  // Advanced element words
  advanced: ['PLASMA', 'LAVA', 'STEAM', 'MAGMA', 'FUSION', 'ETHER', 'PRISM', 'VOID']
};

/**
 * Generate a word puzzle for a given level and theme
 * 
 * @param {number} level - Current level
 * @param {string} theme - Puzzle theme ('fire', 'water', etc.)
 * @returns {Object} Puzzle configuration
 */
export const generateWordPuzzle = (level, theme = null) => {
  // If no theme provided, choose based on level
  if (!theme) {
    const themes = Object.keys(wordLists);
    theme = themes[Math.min(level - 1, themes.length - 1)];
  }
  
  // Get word list for theme
  const words = wordLists[theme] || wordLists.fire;
  
  // Select a word based on level difficulty
  let word;
  if (level <= 3) {
    // Easier words (5 letters)
    word = words.filter(w => w.length === 5)[0] || words[0];
  } else if (level <= 7) {
    // Medium words (6 letters)
    word = words.filter(w => w.length === 6)[0] || words[0];
  } else {
    // Harder words (7+ letters)
    word = words.filter(w => w.length >= 7)[0] || words[0];
  }
  
  // Determine maximum attempts based on difficulty
  const maxAttempts = Math.max(6, 12 - level);
  
  return {
    word,
    maxAttempts,
    theme,
    level
  };
};

/**
 * Check a word puzzle guess
 * 
 * @param {string} solution - The correct word
 * @param {string} guess - The player's guess
 * @returns {Array<string>} Result array with 'correct', 'present', or 'absent' for each letter
 */
export const checkWordGuess = (solution, guess) => {
  if (solution.length !== guess.length) {
    return Array(guess.length).fill('absent');
  }
  
  // Convert to uppercase for comparison
  const solutionChars = solution.toUpperCase().split('');
  const guessChars = guess.toUpperCase().split('');
  
  // Initialize result array with 'absent'
  const result = Array(solution.length).fill('absent');
  
  // Create a copy of solution chars to track which have been matched
  const unusedSolution = [...solutionChars];
  
  // First pass: check for correct position matches
  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === solutionChars[i]) {
      result[i] = 'correct';
      // Mark this character as used in the solution
      unusedSolution[i] = null;
    }
  }
  
  // Second pass: check for correct letter but wrong position
  for (let i = 0; i < guessChars.length; i++) {
    // Skip letters already marked as correct
    if (result[i] === 'correct') continue;
    
    // Check if this letter exists elsewhere in the solution
    const solutionIndex = unusedSolution.indexOf(guessChars[i]);
    if (solutionIndex !== -1) {
      result[i] = 'present';
      // Mark this solution character as used
      unusedSolution[solutionIndex] = null;
    }
  }
  
  return result;
};

/**
 * Generate a hint for a word puzzle
 * 
 * @param {string} word - The puzzle word
 * @param {number} hintLevel - Hint level (1-3)
 * @returns {string} Hint text
 */
export const generateWordHint = (word, hintLevel = 1) => {
  // First letter hint
  if (hintLevel === 1) {
    return `The word starts with the letter "${word[0]}".`;
  }
  
  // Number of vowels hint
  if (hintLevel === 2) {
    const vowels = word.match(/[AEIOU]/gi) || [];
    return `The word contains ${vowels.length} vowel${vowels.length !== 1 ? 's' : ''}.`;
  }
  
  // Definition hint
  if (hintLevel === 3) {
    // Simple definitions for common element words
    const definitions = {
      FLAME: 'A visible, gaseous part of a fire that emits light and heat.',
      BLAZE: 'A very large or fiercely burning fire.',
      TORCH: 'A portable light source, typically a rod with combustible material at one end.',
      SPARK: 'A small fiery particle thrown off from a fire or produced by friction.',
      EMBER: 'A small piece of burning or glowing coal or wood in a dying fire.',
      STREAM: 'A small, narrow river or flowing body of water.',
      RIVER: 'A large natural flow of water that travels across land to the sea or a lake.',
      OCEAN: 'The vast body of saltwater that covers most of the Earth\'s surface.',
      STONE: 'Hard solid mineral matter forming part of the earth\'s crust.',
      TERRA: 'Earth or land; often used in science fiction contexts.',
      SOIL: 'The upper layer of earth containing organic matter and supporting plants.',
      BREEZE: 'A gentle wind or current of air.',
      WIND: 'Air in natural motion, as moving from one place to another.',
      GUST: 'A sudden, brief rush of wind.',
      ALLOY: 'A metal made by combining two or more metallic elements.',
      FORGE: 'A furnace or workshop for melting and shaping metal.',
      STEEL: 'A hard, strong alloy of iron and carbon and usually other elements.',
      GROVE: 'A small group of trees without undergrowth.',
      FOREST: 'A large area covered with trees and underbrush.',
      PLANT: 'A living organism of the kind exemplified by trees, shrubs, herbs, grasses.'
    };
    
    return definitions[word] || `The word is related to the ${getWordTheme(word)} element.`;
  }
  
  return 'Try different letter combinations to solve the puzzle.';
};

/**
 * Determine the theme of a word
 * 
 * @param {string} word - Word to analyze
 * @returns {string} Theme name
 */
export const getWordTheme = (word) => {
  for (const [theme, words] of Object.entries(wordLists)) {
    if (words.includes(word)) {
      return theme;
    }
  }
  return 'element'; // Default theme
};

/**
 * Generate a logic puzzle (Sudoku-style) for a given level
 * 
 * @param {number} level - Current level
 * @param {string[]} elements - Available elements
 * @returns {Object} Logic puzzle configuration
 */
export const generateLogicPuzzle = (level, elements) => {
  // Determine puzzle size based on level
  let size;
  if (level <= 3) {
    size = 4; // 4x4 grid
  } else if (level <= 7) {
    size = 6; // 6x6 grid
  } else {
    size = 9; // 9x9 grid
  }
  
  // Limit elements to the puzzle size
  const validElements = elements.slice(0, size);
  
  // Generate puzzle solution
  const solution = generateSudokuSolution(size, validElements);
  
  // Create puzzle by removing some cells
  const difficulty = Math.min(0.7, 0.4 + (level * 0.03));
  const puzzle = createPuzzleFromSolution(solution, difficulty);
  
  return {
    size,
    solution,
    puzzle,
    validElements,
    difficulty,
    level
  };
};

/**
 * Generate a valid Sudoku-style puzzle solution
 * 
 * @param {number} size - Puzzle size
 * @param {string[]} elements - Elements to use
 * @returns {Array<Array<Object>>} Completed solution grid
 */
export const generateSudokuSolution = (size, elements) => {
  // Create empty grid
  const grid = Array(size).fill().map(() => Array(size).fill(null));
  
  // Fill in the grid using backtracking
  const solved = solveSudoku(grid, 0, 0, size, elements);
  
  if (!solved) {
    console.error('Failed to generate a valid puzzle solution');
    return grid; // Return empty grid
  }
  
  // Convert grid to proper format
  return grid.map(row => row.map(element => ({ element })));
};

/**
 * Solve a Sudoku-style puzzle using backtracking
 * 
 * @param {Array<Array<string|null>>} grid - Current grid
 * @param {number} row - Current row
 * @param {number} col - Current column
 * @param {number} size - Grid size
 * @param {string[]} elements - Valid elements
 * @returns {boolean} Whether the puzzle was solved
 */
export const solveSudoku = (grid, row, col, size, elements) => {
  // If we've filled the entire grid, we're done
  if (row === size) {
    return true;
  }
  
  // If we've filled the current row, move to the next row
  if (col === size) {
    return solveSudoku(grid, row + 1, 0, size, elements);
  }
  
  // If this cell is already filled, move to the next cell
  if (grid[row][col] !== null) {
    return solveSudoku(grid, row, col + 1, size, elements);
  }
  
  // Shuffle elements for randomness
  const shuffledElements = [...elements].sort(() => Math.random() - 0.5);
  
  // Try placing each element in this cell
  for (const element of shuffledElements) {
    // Check if this element can be placed here
    if (isValidPlacement(grid, row, col, element, size)) {
      // Place the element
      grid[row][col] = element;
      
      // Recursively try to fill the rest of the grid
      if (solveSudoku(grid, row, col + 1, size, elements)) {
        return true;
      }
      
      // If we couldn't fill the rest of the grid, backtrack
      grid[row][col] = null;
    }
  }
  
  // If we tried all elements and none worked, backtrack
  return false;
};

/**
 * Check if an element placement is valid for Sudoku rules
 * 
 * @param {Array<Array<string|null>>} grid - Current grid
 * @param {number} row - Row to place element
 * @param {number} col - Column to place element
 * @param {string} element - Element to place
 * @param {number} size - Grid size
 * @returns {boolean} Whether placement is valid
 */
export const isValidPlacement = (grid, row, col, element, size) => {
  // Check row for duplicates
  for (let c = 0; c < size; c++) {
    if (grid[row][c] === element) {
      return false;
    }
  }
  
  // Check column for duplicates
  for (let r = 0; r < size; r++) {
    if (grid[r][col] === element) {
      return false;
    }
  }
  
  // Check 3x3 box for 9x9 grids
  if (size === 9) {
    const boxSize = 3;
    const boxRow = Math.floor(row / boxSize) * boxSize;
    const boxCol = Math.floor(col / boxSize) * boxSize;
    
    for (let r = boxRow; r < boxRow + boxSize; r++) {
      for (let c = boxCol; c < boxCol + boxSize; c++) {
        if (grid[r][c] === element) {
          return false;
        }
      }
    }
  }
  
  // Check 2x2 box for 4x4 grids
  if (size === 4) {
    const boxSize = 2;
    const boxRow = Math.floor(row / boxSize) * boxSize;
    const boxCol = Math.floor(col / boxSize) * boxSize;
    
    for (let r = boxRow; r < boxRow + boxSize; r++) {
      for (let c = boxCol; c < boxCol + boxSize; c++) {
        if (grid[r][c] === element) {
          return false;
        }
      }
    }
  }
  
  // For 6x6 grids, check 2x3 boxes
  if (size === 6) {
    const boxHeight = 2;
    const boxWidth = 3;
    const boxRow = Math.floor(row / boxHeight) * boxHeight;
    const boxCol = Math.floor(col / boxWidth) * boxWidth;
    
    for (let r = boxRow; r < boxRow + boxHeight; r++) {
      for (let c = boxCol; c < boxCol + boxWidth; c++) {
        if (grid[r][c] === element) {
          return false;
        }
      }
    }
  }
  
  // All checks passed, placement is valid
  return true;
};

/**
 * Create a puzzle by removing cells from a solution
 * 
 * @param {Array<Array<Object>>} solution - Complete solution
 * @param {number} difficulty - Difficulty (0-1) representing proportion of cells to remove
 * @returns {Array<Array<Object|null>>} Puzzle with empty cells
 */
export const createPuzzleFromSolution = (solution, difficulty) => {
  const size = solution.length;
  const puzzle = JSON.parse(JSON.stringify(solution));
  
  // Calculate number of cells to remove
  const totalCells = size * size;
  const cellsToRemove = Math.floor(totalCells * difficulty);
  
  // Remove cells randomly
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
 * Check if a logic puzzle is complete and correct
 * 
 * @param {Array<Array<Object|null>>} puzzle - Current puzzle state
 * @param {Array<Array<Object>>} solution - Correct solution
 * @returns {boolean} Whether the puzzle is correct
 */
export const checkLogicPuzzle = (puzzle, solution) => {
  const size = puzzle.length;
  
  // Check each cell
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Skip null cells (incomplete)
      if (!puzzle[row][col]) {
        return false;
      }
      
      // Check if cell matches solution
      if (puzzle[row][col].element !== solution[row][col].element) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Generate a hint for a logic puzzle
 * 
 * @param {Array<Array<Object|null>>} puzzle - Current puzzle state
 * @param {Array<Array<Object>>} solution - Correct solution
 * @param {number} hintLevel - Hint level (1-3)
 * @returns {Object} Hint data
 */
export const generateLogicHint = (puzzle, solution, hintLevel = 1) => {
  const size = puzzle.length;
  
  // Find all empty cells
  const emptyCells = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!puzzle[row][col]) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  if (emptyCells.length === 0) {
    return { type: 'text', text: 'The puzzle is already filled. Check for errors.' };
  }
  
  // Choose a random empty cell
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const { row, col } = randomCell;
  
  if (hintLevel === 1) {
    // Level 1 hint: Just tell where to look
    return {
      type: 'text',
      text: `Focus on the cell at row ${row + 1}, column ${col + 1}.`
    };
  }
  
  if (hintLevel === 2) {
    // Level 2 hint: Tell which element is wrong or missing
    const correctElement = solution[row][col].element;
    
    return {
      type: 'element',
      text: `The cell at row ${row + 1}, column ${col + 1} should contain a specific element.`,
      element: correctElement
    };
  }
  
  if (hintLevel === 3) {
    // Level 3 hint: Fill in the cell directly
    const correctElement = solution[row][col].element;
    
    return {
      type: 'fill',
      text: `Filling in the cell at row ${row + 1}, column ${col + 1} with ${correctElement}.`,
      position: { row, col },
      element: correctElement
    };
  }
  
  return { type: 'text', text: 'Try to find patterns in rows and columns.' };
};

/**
 * Find errors in a puzzle
 * 
 * @param {Array<Array<Object|null>>} puzzle - Current puzzle state
 * @param {number} size - Puzzle size
 * @returns {Array<{row: number, col: number}>} Error positions
 */
export const findPuzzleErrors = (puzzle, size) => {
  const errors = [];
  
  // Check rows
  for (let row = 0; row < size; row++) {
    const elements = new Set();
    const errorPositions = [];
    
    for (let col = 0; col < size; col++) {
      if (puzzle[row][col]) {
        const element = puzzle[row][col].element;
        
        if (elements.has(element)) {
          // Found a duplicate in this row
          errorPositions.push({ row, col });
        } else {
          elements.add(element);
        }
      }
    }
    
    // Mark all duplicates in this row as errors
    errors.push(...errorPositions);
  }
  
  // Check columns
  for (let col = 0; col < size; col++) {
    const elements = new Set();
    const errorPositions = [];
    
    for (let row = 0; row < size; row++) {
      if (puzzle[row][col]) {
        const element = puzzle[row][col].element;
        
        if (elements.has(element)) {
          // Found a duplicate in this column
          errorPositions.push({ row, col });
        } else {
          elements.add(element);
        }
      }
    }
    
    // Mark all duplicates in this column as errors
    errors.push(...errorPositions);
  }
  
  // Check boxes for 9x9 and 4x4 grids
  if (size === 9 || size === 4 || size === 6) {
    const boxSize = size === 9 ? 3 : (size === 4 ? 2 : [2, 3]); // 3x3 for 9x9, 2x2 for 4x4, 2x3 for 6x6
    
    // Handle different box sizes for 6x6 grid
    const boxHeight = Array.isArray(boxSize) ? boxSize[0] : boxSize;
    const boxWidth = Array.isArray(boxSize) ? boxSize[1] : boxSize;
    
    for (let boxRow = 0; boxRow < size; boxRow += boxHeight) {
      for (let boxCol = 0; boxCol < size; boxCol += boxWidth) {
        const elements = new Set();
        const errorPositions = [];
        
        for (let row = boxRow; row < boxRow + boxHeight; row++) {
          for (let col = boxCol; col < boxCol + boxWidth; col++) {
            if (puzzle[row][col]) {
              const element = puzzle[row][col].element;
              
              if (elements.has(element)) {
                // Found a duplicate in this box
                errorPositions.push({ row, col });
              } else {
                elements.add(element);
              }
            }
          }
        }
        
        // Mark all duplicates in this box as errors
        errors.push(...errorPositions);
      }
    }
  }
  
  return errors;
};