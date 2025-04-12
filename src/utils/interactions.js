/**
 * ElementCraft - Element Interactions Utilities
 * 
 * This module handles element-to-element interactions,
 * reaction chains, and special element effects.
 * 
 * @module interactions
 * @author ElementCraft Team
 * @version 1.0.0
 */

import { elementInteractions, elementProperties } from '../constants/elements';
import { createParticles } from './physics';

/**
 * Process interaction between two elements
 * 
 * @param {string} element1 - First element type
 * @param {string} element2 - Second element type
 * @param {Object} position - Position {x, y} where interaction occurs
 * @param {Function} onNewElement - Callback for new element creation
 * @returns {Object} Interaction result data
 */
export const processInteraction = (element1, element2, position, onNewElement) => {
  // Get interaction definition
  const interaction = getInteraction(element1, element2);
  
  if (!interaction) {
    return { result: null, score: 0 };
  }
  
  // Create visual particle effects
  createInteractionEffects(element1, element2, interaction.result, position);
  
  // Notify of new element creation
  if (onNewElement && interaction.result) {
    onNewElement(interaction.result, position);
  }
  
  return interaction;
};

/**
 * Get interaction definition for two elements
 * 
 * @param {string} element1 - First element type
 * @param {string} element2 - Second element type
 * @returns {Object|null} Interaction definition or null if no interaction
 */
export const getInteraction = (element1, element2) => {
  // Check both directions for interaction
  const interactionKey = `${element1}_${element2}`;
  const reverseInteractionKey = `${element2}_${element1}`;
  
  return elementInteractions[interactionKey] || 
         elementInteractions[reverseInteractionKey] || 
         null;
};

/**
 * Create visual effects for element interaction
 * 
 * @param {string} element1 - First element type
 * @param {string} element2 - Second element type
 * @param {string} resultElement - Resulting element type
 * @param {Object} position - Position {x, y} where interaction occurs
 */
export const createInteractionEffects = (element1, element2, resultElement, position) => {
  // Create particles based on the interaction
  const particleCount = getParticleCount(element1, element2);
  
  // Create particles for each element involved
  createParticles(element1, position.x, position.y, Math.floor(particleCount / 2));
  createParticles(element2, position.x, position.y, Math.floor(particleCount / 2));
  
  // Create particles for the resulting element
  if (resultElement) {
    createParticles(resultElement, position.x, position.y, particleCount);
  }
};

/**
 * Get appropriate particle count for an interaction
 * 
 * @param {string} element1 - First element type
 * @param {string} element2 - Second element type
 * @returns {number} Number of particles to create
 */
export const getParticleCount = (element1, element2) => {
  // Special case combinations have more particles
  const specialCombinations = {
    'fire_water': 20, // Steam explosion
    'fire_earth': 15, // Lava formation
    'air_water': 12,  // Cloud formation
    'fire_air': 25    // Plasma creation
  };
  
  // Check both combinations
  const key1 = `${element1}_${element2}`;
  const key2 = `${element2}_${element1}`;
  
  if (specialCombinations[key1]) {
    return specialCombinations[key1];
  } else if (specialCombinations[key2]) {
    return specialCombinations[key2];
  }
  
  // Default particle count
  return 10;
};

/**
 * Process a chain reaction of element interactions
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {Function} onReaction - Callback for each reaction
 * @returns {Object} Chain reaction results
 */
export const processChainReaction = (board, row, col, onReaction) => {
  const visited = new Set();
  const reactions = [];
  let totalScore = 0;
  const newElements = new Set();
  
  // Process reactions recursively
  const processReactions = (r, c) => {
    const key = `${r}-${c}`;
    if (visited.has(key)) return;
    
    visited.add(key);
    
    // Skip empty cells
    if (!board[r][c]) return;
    
    const currentElement = board[r][c].element;
    
    // Check adjacent cells for potential reactions
    const adjacentCells = [
      [r - 1, c],    // Above
      [r + 1, c],    // Below
      [r, c - 1],    // Left
      [r, c + 1],    // Right
    ];
    
    for (const [adjRow, adjCol] of adjacentCells) {
      // Check if adjacent cell is within bounds
      if (
        adjRow >= 0 && 
        adjRow < board.length && 
        adjCol >= 0 && 
        adjCol < board[0].length
      ) {
        // Skip empty adjacent cells
        if (!board[adjRow][adjCol]) continue;
        
        const adjacentElement = board[adjRow][adjCol].element;
        
        // Check for interaction
        const interaction = getInteraction(currentElement, adjacentElement);
        
        if (interaction) {
          // Record the reaction
          reactions.push({
            element1: currentElement,
            element2: adjacentElement,
            result: interaction.result,
            position: { row: adjRow, col: adjCol }
          });
          
          // Add to score
          totalScore += interaction.score;
          
          // Track new elements
          if (interaction.result) {
            newElements.add(interaction.result);
          }
          
          // Apply the reaction
          board[adjRow][adjCol] = { element: interaction.result };
          
          // Notify caller
          if (onReaction) {
            onReaction(interaction, {
              row: adjRow, 
              col: adjCol
            });
          }
          
          // Continue chain reaction from this cell
          processReactions(adjRow, adjCol);
        }
      }
    }
  };
  
  // Start the chain reaction
  processReactions(row, col);
  
  return {
    reactions,
    score: totalScore,
    newElements: Array.from(newElements),
    length: reactions.length
  };
};

/**
 * Apply special element effects
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {Object} action - Action data {type, elementType, row, col}
 * @returns {Object} Effect results
 */
export const applySpecialEffects = (board, action) => {
  const results = {
    modified: false,
    score: 0,
    effects: []
  };
  
  switch (action.elementType) {
    case 'crystal':
      // Crystal amplifies adjacent elements
      applyCrystalEffect(board, action.row, action.col, results);
      break;
      
    case 'wood':
      // Wood can grow when near water
      applyWoodGrowthEffect(board, action.row, action.col, results);
      break;
      
    case 'fire':
      // Fire can spread to flammable materials
      applyFireSpreadEffect(board, action.row, action.col, results);
      break;
      
    case 'water':
      // Water can flow
      applyWaterFlowEffect(board, action.row, action.col, results);
      break;
      
    case 'air':
      // Air can push light elements
      applyAirPushEffect(board, action.row, action.col, results);
      break;
      
    // Add other element special effects as needed
  }
  
  return results;
};

/**
 * Apply crystal amplification effect
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Crystal row
 * @param {number} col - Crystal column
 * @param {Object} results - Results object to update
 */
const applyCrystalEffect = (board, row, col, results) => {
  const adjacentCells = [
    [row - 1, col],    // Above
    [row + 1, col],    // Below
    [row, col - 1],    // Left
    [row, col + 1],    // Right
  ];
  
  for (const [adjRow, adjCol] of adjacentCells) {
    // Check if adjacent cell is within bounds
    if (
      adjRow >= 0 && 
      adjRow < board.length && 
      adjCol >= 0 && 
      adjCol < board[0].length
    ) {
      // Skip empty adjacent cells
      if (!board[adjRow][adjCol]) continue;
      
      // Amplify the element
      board[adjRow][adjCol] = {
        ...board[adjRow][adjCol],
        amplified: true,
        power: (board[adjRow][adjCol].power || 1) * 2
      };
      
      results.modified = true;
      results.score += 25;
      results.effects.push({
        type: 'amplify',
        element: board[adjRow][adjCol].element,
        position: { row: adjRow, col: adjCol }
      });
    }
  }
};

/**
 * Apply wood growth effect near water
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Wood row
 * @param {number} col - Wood column
 * @param {Object} results - Results object to update
 */
const applyWoodGrowthEffect = (board, row, col, results) => {
  const adjacentCells = [
    [row - 1, col],    // Above
    [row + 1, col],    // Below
    [row, col - 1],    // Left
    [row, col + 1],    // Right
  ];
  
  // Check for adjacent water
  let hasAdjacentWater = false;
  
  for (const [adjRow, adjCol] of adjacentCells) {
    // Check if adjacent cell is within bounds
    if (
      adjRow >= 0 && 
      adjRow < board.length && 
      adjCol >= 0 && 
      adjCol < board[0].length
    ) {
      // Check for water
      if (board[adjRow][adjCol] && board[adjRow][adjCol].element === 'water') {
        hasAdjacentWater = true;
        break;
      }
    }
  }
  
  // If there's water, try to grow new wood in an empty adjacent cell
  if (hasAdjacentWater) {
    // Filter to only empty cells
    const emptyCells = adjacentCells.filter(([r, c]) => {
      return r >= 0 && 
             r < board.length && 
             c >= 0 && 
             c < board[0].length && 
             !board[r][c];
    });
    
    // If there's an empty cell, 20% chance to grow
    if (emptyCells.length > 0 && Math.random() < 0.2) {
      // Select random empty cell
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [growRow, growCol] = emptyCells[randomIndex];
      
      // Grow new wood
      board[growRow][growCol] = { element: 'wood', growing: true };
      
      results.modified = true;
      results.score += 50;
      results.effects.push({
        type: 'growth',
        element: 'wood',
        position: { row: growRow, col: growCol }
      });
    }
  }
};

/**
 * Apply fire spread effect to flammable materials
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Fire row
 * @param {number} col - Fire column
 * @param {Object} results - Results object to update
 */
const applyFireSpreadEffect = (board, row, col, results) => {
  const adjacentCells = [
    [row - 1, col],    // Above
    [row + 1, col],    // Below
    [row, col - 1],    // Left
    [row, col + 1],    // Right
  ];
  
  for (const [adjRow, adjCol] of adjacentCells) {
    // Check if adjacent cell is within bounds
    if (
      adjRow >= 0 && 
      adjRow < board.length && 
      adjCol >= 0 && 
      adjCol < board[0].length
    ) {
      // Skip empty adjacent cells
      if (!board[adjRow][adjCol]) continue;
      
      // Check for flammable elements
      if (board[adjRow][adjCol].element === 'wood') {
        // 20% chance to ignite wood
        if (Math.random() < 0.2) {
          board[adjRow][adjCol] = { element: 'fire', spreading: true };
          
          results.modified = true;
          results.score += 30;
          results.effects.push({
            type: 'burn',
            element: 'wood',
            position: { row: adjRow, col: adjCol }
          });
        }
      }
    }
  }
};

/**
 * Apply water flow effect
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Water row
 * @param {number} col - Water column
 * @param {Object} results - Results object to update
 */
const applyWaterFlowEffect = (board, row, col, results) => {
  // Water can flow downward if there's space
  if (row + 1 < board.length && !board[row + 1][col]) {
    // Move water down
    board[row + 1][col] = { element: 'water', flowing: true };
    board[row][col] = null;
    
    results.modified = true;
    results.effects.push({
      type: 'flow',
      element: 'water',
      from: { row, col },
      to: { row: row + 1, col }
    });
  }
  
  // Water can also spread horizontally if there's no resistance
  const horizontalCells = [
    [row, col - 1],    // Left
    [row, col + 1],    // Right
  ];
  
  for (const [adjRow, adjCol] of horizontalCells) {
    // Check if adjacent cell is within bounds
    if (
      adjRow >= 0 && 
      adjRow < board.length && 
      adjCol >= 0 && 
      adjCol < board[0].length
    ) {
      // Water has a small chance to spread horizontally to empty cells
      if (!board[adjRow][adjCol] && Math.random() < 0.1) {
        board[adjRow][adjCol] = { element: 'water', flowing: true };
        
        results.modified = true;
        results.effects.push({
          type: 'spread',
          element: 'water',
          from: { row, col },
          to: { row: adjRow, col: adjCol }
        });
      }
    }
  }
};

/**
 * Apply air push effect to light elements
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {number} row - Air row
 * @param {number} col - Air column
 * @param {Object} results - Results object to update
 */
const applyAirPushEffect = (board, row, col, results) => {
  // Check cell above for light elements that can be pushed
  if (row - 1 >= 0 && board[row - 1][col]) {
    const aboveElement = board[row - 1][col].element;
    
    // Check if it's a light element (air, fire, steam)
    if (['air', 'fire', 'steam'].includes(aboveElement)) {
      // Check if the cell above that is empty
      if (row - 2 >= 0 && !board[row - 2][col]) {
        // Push the element up
        board[row - 2][col] = { ...board[row - 1][col] };
        board[row - 1][col] = null;
        
        results.modified = true;
        results.score += 20;
        results.effects.push({
          type: 'push',
          element: aboveElement,
          from: { row: row - 1, col },
          to: { row: row - 2, col }
        });
      }
    }
  }
};

/**
 * Check for winning or special element combinations
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @returns {Object} Special combination results
 */
export const checkSpecialCombinations = (board) => {
  const results = {
    found: false,
    combinations: [],
    score: 0
  };
  
  // Check for special 3-element combinations
  checkThreeElementCombinations(board, results);
  
  // Check for elemental patterns
  checkElementalPatterns(board, results);
  
  return results;
};

/**
 * Check for three-element special combinations
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {Object} results - Results object to update
 */
const checkThreeElementCombinations = (board, results) => {
  // Special 3-element combinations
  const threeElementCombos = {
    'fire_metal_air': {
      result: 'forge',
      score: 300,
      description: 'Created a forge by combining fire, metal, and air'
    },
    'water_earth_wood': {
      result: 'forest',
      score: 300,
      description: 'Created a forest by combining water, earth, and wood'
    },
    'crystal_fire_air': {
      result: 'lightning',
      score: 400,
      description: 'Created lightning by combining crystal, fire, and air'
    },
    'water_earth_fire': {
      result: 'geyser',
      score: 350,
      description: 'Created a geyser by combining water, earth, and fire'
    }
  };
  
  // For each cell, check for patterns of 3 adjacent elements
  for (let row = 0; row < board.length - 1; row++) {
    for (let col = 0; col < board[0].length - 1; col++) {
      // Try different 3-cell patterns
      const patterns = [
        // Horizontal: [o][o][o]
        [ [row, col], [row, col + 1], [row, col + 2] ],
        
        // Vertical: [o]
        //           [o]
        //           [o]
        [ [row, col], [row + 1, col], [row + 2, col] ],
        
        // L-shape: [o]
        //          [o][o]
        [ [row, col], [row + 1, col], [row + 1, col + 1] ],
        
        // L-shape mirrored: [o]
        //                  [o][o]
        [ [row, col], [row + 1, col], [row + 1, col - 1] ],
        
        // Triangle: [o]
        //          [o][o]
        [ [row, col], [row + 1, col - 1], [row + 1, col] ]
      ];
      
      for (const pattern of patterns) {
        const elements = [];
        let validPattern = true;
        
        // Check if all cells in pattern are valid and have elements
        for (const [patternRow, patternCol] of pattern) {
          if (
            patternRow < 0 || 
            patternRow >= board.length ||
            patternCol < 0 || 
            patternCol >= board[0].length ||
            !board[patternRow][patternCol]
          ) {
            validPattern = false;
            break;
          }
          
          elements.push(board[patternRow][patternCol].element);
        }
        
        if (!validPattern) continue;
        
        // Sort elements to normalize the combination key
        elements.sort();
        const comboKey = elements.join('_');
        
        // Check if this matches a special combination
        for (const [key, combo] of Object.entries(threeElementCombos)) {
          // Create sorted versions of both keys for comparison
          const sortedKey = key.split('_').sort().join('_');
          
          if (comboKey === sortedKey) {
            // Found a match!
            results.found = true;
            results.combinations.push({
              elements,
              ...combo,
              positions: pattern.map(([r, c]) => ({ row: r, col: c }))
            });
            
            results.score += combo.score;
            
            // Replace middle element with result
            const middlePos = pattern[1];
            board[middlePos[0]][middlePos[1]] = { element: combo.result };
            
            // Remove other elements
            board[pattern[0][0]][pattern[0][1]] = null;
            board[pattern[2][0]][pattern[2][1]] = null;
          }
        }
      }
    }
  }
};

/**
 * Check for elemental patterns (shapes/structures)
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {Object} results - Results object to update
 */
const checkElementalPatterns = (board, results) => {
  // Check for specific patterns
  
  // 1. Square of earth elements (2x2)
  checkEarthSquare(board, results);
  
  // 2. Metal conductor path
  checkMetalPath(board, results);
  
  // 3. Water flow circuit
  checkWaterCircuit(board, results);
  
  // 4. Fire circle
  checkFireCircle(board, results);
};

/**
 * Check for 2x2 square of earth elements
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {Object} results - Results object to update
 */
const checkEarthSquare = (board, results) => {
  for (let row = 0; row < board.length - 1; row++) {
    for (let col = 0; col < board[0].length - 1; col++) {
      // Check if all 4 cells form an earth square
      if (
        board[row][col]?.element === 'earth' &&
        board[row][col + 1]?.element === 'earth' &&
        board[row + 1][col]?.element === 'earth' &&
        board[row + 1][col + 1]?.element === 'earth'
      ) {
        results.found = true;
        results.combinations.push({
          pattern: 'earth_square',
          score: 200,
          description: 'Built a solid earth foundation',
          positions: [
            { row, col },
            { row, col: col + 1 },
            { row: row + 1, col },
            { row: row + 1, col: col + 1 }
          ]
        });
        
        results.score += 200;
        
        // Add stability bonus to each earth block
        for (let r = row; r <= row + 1; r++) {
          for (let c = col; c <= col + 1; c++) {
            board[r][c] = { 
              ...board[r][c], 
              stable: true,
              strength: (board[r][c].strength || 1) + 1
            };
          }
        }
      }
    }
  }
};

/**
 * Check for a conductive path of metal
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {Object} results - Results object to update
 */
const checkMetalPath = (board, results) => {
  // Look for linear metal paths with fire at one end
  for (let row = 0; row < board.length; row++) {
    // Check horizontal paths
    for (let col = 0; col < board[0].length - 2; col++) {
      if (
        // Fire-metal-metal pattern
        (board[row][col]?.element === 'fire' &&
         board[row][col + 1]?.element === 'metal' &&
         board[row][col + 2]?.element === 'metal') ||
        // Metal-metal-fire pattern
        (board[row][col]?.element === 'metal' &&
         board[row][col + 1]?.element === 'metal' &&
         board[row][col + 2]?.element === 'fire')
      ) {
        results.found = true;
        results.combinations.push({
          pattern: 'metal_fire_path',
          score: 250,
          description: 'Created a conductive metal path with fire',
          positions: [
            { row, col },
            { row, col: col + 1 },
            { row, col: col + 2 }
          ]
        });
        
        results.score += 250;
        
        // Make metal elements conductive
        for (let c = col; c <= col + 2; c++) {
          if (board[row][c]?.element === 'metal') {
            board[row][c] = {
              ...board[row][c],
              conductive: true,
              power: (board[row][c].power || 1) + 1
            };
          }
        }
      }
    }
    
    // Check vertical paths
    for (let col = 0; col < board[0].length; col++) {
      if (row < board.length - 2 && (
        // Fire-metal-metal pattern
        (board[row][col]?.element === 'fire' &&
         board[row + 1][col]?.element === 'metal' &&
         board[row + 2][col]?.element === 'metal') ||
        // Metal-metal-fire pattern
        (board[row][col]?.element === 'metal' &&
         board[row + 1][col]?.element === 'metal' &&
         board[row + 2][col]?.element === 'fire')
      )) {
        results.found = true;
        results.combinations.push({
          pattern: 'metal_fire_path',
          score: 250,
          description: 'Created a conductive metal path with fire',
          positions: [
            { row, col },
            { row: row + 1, col },
            { row: row + 2, col }
          ]
        });
        
        results.score += 250;
        
        // Make metal elements conductive
        for (let r = row; r <= row + 2; r++) {
          if (board[r][col]?.element === 'metal') {
            board[r][col] = {
              ...board[r][col],
              conductive: true,
              power: (board[r][col].power || 1) + 1
            };
          }
        }
      }
    }
  }
};

/**
 * Check for a water flow circuit
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {Object} results - Results object to update
 */
const checkWaterCircuit = (board, results) => {
  // This is a simplified check for a water circuit
  // A real implementation would use pathfinding algorithms to detect loops
  
  // Count how many water cells have at least 2 adjacent water cells
  let waterWithMultipleNeighbors = 0;
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col]?.element === 'water') {
        // Count adjacent water cells
        let adjacentWater = 0;
        
        const adjacentCells = [
          [row - 1, col], // Above
          [row + 1, col], // Below
          [row, col - 1], // Left
          [row, col + 1]  // Right
        ];
        
        for (const [adjRow, adjCol] of adjacentCells) {
          if (
            adjRow >= 0 && 
            adjRow < board.length && 
            adjCol >= 0 && 
            adjCol < board[0].length &&
            board[adjRow][adjCol]?.element === 'water'
          ) {
            adjacentWater++;
          }
        }
        
        if (adjacentWater >= 2) {
          waterWithMultipleNeighbors++;
        }
      }
    }
  }
  
  // If we have at least 4 water cells with multiple neighbors, it's likely a circuit
  if (waterWithMultipleNeighbors >= 4) {
    results.found = true;
    results.combinations.push({
      pattern: 'water_flow_circuit',
      score: 300,
      description: 'Created a flowing water circuit',
      // We don't list all positions, just the achievement
    });
    
    results.score += 300;
    
    // Make all water elements flowing
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col]?.element === 'water') {
          board[row][col] = {
            ...board[row][col],
            flowing: true,
            power: (board[row][col].power || 1) + 1
          };
        }
      }
    }
  }
};

/**
 * Check for a circle of fire elements
 * 
 * @param {Array<Array<Object>>} board - Current game board
 * @param {Object} results - Results object to update
 */
const checkFireCircle = (board, results) => {
  // Simple check for a rough circle of fire (at least 6 fire elements in a rough circle)
  
  for (let centerRow = 2; centerRow < board.length - 2; centerRow++) {
    for (let centerCol = 2; centerCol < board[0].length - 2; centerCol++) {
      // Define a rough circle around this center
      const circlePoints = [
        [centerRow - 1, centerCol - 1],
        [centerRow - 1, centerCol],
        [centerRow - 1, centerCol + 1],
        [centerRow, centerCol - 1],
        [centerRow, centerCol + 1],
        [centerRow + 1, centerCol - 1],
        [centerRow + 1, centerCol],
        [centerRow + 1, centerCol + 1]
      ];
      
      // Count fire elements in the circle
      let fireCount = 0;
      const firePositions = [];
      
      for (const [row, col] of circlePoints) {
        if (
          row >= 0 && 
          row < board.length && 
          col >= 0 && 
          col < board[0].length &&
          board[row][col]?.element === 'fire'
        ) {
          fireCount++;
          firePositions.push({ row, col });
        }
      }
      
      // If we have at least 6 fire elements, consider it a circle
      if (fireCount >= 6) {
        results.found = true;
        results.combinations.push({
          pattern: 'fire_circle',
          score: 400,
          description: 'Created a circle of fire',
          positions: firePositions
        });
        
        results.score += 400;
        
        // Place a plasma element in the center if empty
        if (!board[centerRow][centerCol]) {
          board[centerRow][centerCol] = { element: 'plasma' };
        }
      }
    }
  }
};