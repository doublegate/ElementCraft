/**
 * ElementCraft - Game State Store
 * 
 * This module implements the game's global state management using Zustand.
 * It handles the game state, player progress, inventory, and settings.
 * 
 * @module gameStore
 * @author ElementCraft Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  generateBoard, 
  checkInteractions, 
  checkWordPuzzle, 
  checkLogicPuzzle 
} from '../utils/gameLogic';
import { 
  INITIAL_ELEMENTS,
  elementInteractions 
} from '../constants/elements';
import { 
  GAME_STATES,
  ACTION_TYPES 
} from '../constants/gameStates';
import { 
  levelRequirements,
  levelObjectives,
  levelRewards
} from '../constants/levels';

// Default settings
const defaultSettings = {
  masterVolume: 80,
  musicVolume: 70,
  sfxVolume: 80,
  ambienceVolume: 50,
  muteWhenInactive: true,
  particleAmount: 'medium',
  animationSpeed: 'normal',
  showFps: false,
  enableBloom: true,
  enableShadows: true,
  difficulty: 'normal',
  tutorialEnabled: true,
  hintsEnabled: true,
  autoSave: true,
  confirmActions: true,
  textSize: 'medium',
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  colorblindMode: 'none'
};

// Create game store with persistence
const useGameStore = create(
  persist(
    (set, get) => ({
      // Game state
      gameState: GAME_STATES.INTRO,
      currentLevel: 1,
      score: 0,
      playerEssence: 0,
      playerLevel: 1,
      experience: 0,
      
      // Game board
      board: [],
      selectedElement: null,
      
      // Inventory and elements
      inventory: INITIAL_ELEMENTS.reduce((acc, element) => {
        acc[element] = 5; // Start with 5 of each basic element
        return acc;
      }, {}),
      unlockedElements: [...INITIAL_ELEMENTS],
      
      // Level progress
      objectives: [],
      levelsCompleted: [],
      
      // Puzzle state
      currentWordPuzzle: null,
      currentLogicPuzzle: null,
      
      // Settings
      settings: { ...defaultSettings },
      
      // Initialize the game
      initGame: () => {
        const { currentLevel } = get();
        
        // Create initial board
        const { rows, cols } = levelRequirements[currentLevel] || { rows: 8, cols: 8 };
        const board = generateBoard(rows, cols);
        
        // Get objectives for the level
        const objectives = (levelObjectives[currentLevel] || []).map(obj => ({
          ...obj,
          completed: false
        }));
        
        set({ 
          board, 
          objectives,
          gameState: GAME_STATES.INTRO,
          selectedElement: null
        });
      },
      
      // Start the game
      startGame: () => {
        set({ gameState: GAME_STATES.PLAYING });
      },
      
      // Restart the current level
      restartLevel: () => {
        const { currentLevel } = get();
        
        // Re-initialize the level
        get().initGame(currentLevel);
        set({ gameState: GAME_STATES.PLAYING });
      },
      
      // Select an element
      selectElement: (element) => {
        set({ selectedElement: element });
      },
      
      // Place an element on the board
      placeElement: (row, col, elementType) => {
        const { board, inventory, selectedElement } = get();
        
        // Ensure we have the element in inventory
        if (!inventory[elementType] || inventory[elementType] <= 0) {
          return { success: false, message: 'Not enough elements in inventory' };
        }
        
        // Check if cell is already occupied
        if (board[row][col] !== null) {
          return { success: false, message: 'Cell already occupied' };
        }
        
        // Update the board with the new element
        const newBoard = [...board];
        newBoard[row][col] = { element: elementType };
        
        // Update inventory
        const newInventory = { ...inventory };
        newInventory[elementType]--;
        
        // Check for interactions
        const interactions = checkInteractions(newBoard, row, col);
        
        // Apply interaction results
        if (interactions.newElements && interactions.newElements.length > 0) {
          // Add new elements to inventory
          interactions.newElements.forEach(element => {
            if (!newInventory[element]) {
              newInventory[element] = 0;
            }
            
            newInventory[element]++;
            
            // Check if this is a newly discovered element
            const { unlockedElements } = get();
            if (!unlockedElements.includes(element)) {
              set({ 
                unlockedElements: [...unlockedElements, element],
                playerEssence: get().playerEssence + 50 // Bonus for discovering new element
              });
            }
          });
        }
        
        // Update state
        set({ 
          board: interactions.newBoard || newBoard,
          inventory: newInventory,
          selectedElement: inventory[elementType] <= 1 ? null : selectedElement,
          score: get().score + (interactions.score || 10),
          playerEssence: get().playerEssence + Math.floor((interactions.score || 10) / 10)
        });
        
        // Check objectives
        get().checkObjectives();
        
        return { 
          success: true, 
          interactions: interactions.interactions || [],
          newElements: interactions.newElements || []
        };
      },
      
      // Check if level objectives are complete
      checkObjectives: () => {
        const { board, objectives, currentLevel } = get();
        
        // Update objectives based on board state
        const updatedObjectives = objectives.map(objective => {
          // Skip already completed objectives
          if (objective.completed) return objective;
          
          let completed = false;
          
          switch (objective.type) {
            case 'create_element':
              // Check if specific element exists on the board
              completed = board.some(row => 
                row.some(cell => cell && cell.element === objective.element)
              );
              break;
              
            case 'create_combination':
              // Check if specific combination exists
              if (objective.combination) {
                completed = objective.combination.every(([element, count]) => {
                  const actualCount = board.flat().filter(
                    cell => cell && cell.element === element
                  ).length;
                  return actualCount >= count;
                });
              }
              break;
              
            case 'place_element':
              // Check if specific element is placed enough times
              if (objective.element && objective.count) {
                const count = board.flat().filter(
                  cell => cell && cell.element === objective.element
                ).length;
                completed = count >= objective.count;
              }
              break;
              
            case 'build_structure':
              // Pattern matching for structures
              if (objective.pattern === 'earth_square') {
                // Check for 2x2 square of earth elements
                for (let r = 0; r < board.length - 1; r++) {
                  for (let c = 0; c < board[0].length - 1; c++) {
                    if (
                      board[r][c]?.element === 'earth' &&
                      board[r][c+1]?.element === 'earth' &&
                      board[r+1][c]?.element === 'earth' &&
                      board[r+1][c+1]?.element === 'earth'
                    ) {
                      completed = true;
                      break;
                    }
                  }
                  if (completed) break;
                }
              }
              // Add other structure patterns as needed
              break;
              
            case 'solve_puzzle':
              // Puzzles are checked separately
              break;
              
            default:
              completed = false;
          }
          
          // If objective is completed, award points
          if (completed && !objective.completed) {
            set({ 
              score: get().score + (objective.points || 100),
              playerEssence: get().playerEssence + Math.floor((objective.points || 100) / 5)
            });
            
            // Add experience for completing objective
            get().addExperience(objective.points || 100);
          }
          
          return {
            ...objective,
            completed: completed || objective.completed
          };
        });
        
        set({ objectives: updatedObjectives });
        
        // Check if all objectives are complete
        const allComplete = updatedObjectives.every(obj => obj.completed);
        
        if (allComplete) {
          set({ gameState: GAME_STATES.LEVEL_COMPLETE });
          
          // If this level wasn't previously completed, add rewards
          const { levelsCompleted } = get();
          if (!levelsCompleted.includes(currentLevel)) {
            get().awardLevelCompletion(currentLevel);
          }
        }
      },
      
      // Award rewards for completing a level
      awardLevelCompletion: (level) => {
        const { levelsCompleted, inventory, unlockedElements } = get();
        
        // Mark level as completed
        const newLevelsCompleted = [...levelsCompleted, level];
        
        // Get rewards for the level
        const rewards = levelRewards[level];
        
        if (rewards) {
          // Add elements to inventory
          const newInventory = { ...inventory };
          const newUnlockedElements = [...unlockedElements];
          
          if (rewards.elements) {
            rewards.elements.forEach(element => {
              if (!newInventory[element]) {
                newInventory[element] = 0;
              }
              
              newInventory[element] += 3; // Add 3 of each reward element
              
              // Check if this is a newly unlocked element
              if (!newUnlockedElements.includes(element)) {
                newUnlockedElements.push(element);
              }
            });
          }
          
          // Add points
          const rewardPoints = rewards.points || 0;
          
          set({ 
            levelsCompleted: newLevelsCompleted,
            inventory: newInventory,
            unlockedElements: newUnlockedElements,
            score: get().score + rewardPoints,
            playerEssence: get().playerEssence + Math.floor(rewardPoints / 4)
          });
          
          // Add experience
          get().addExperience(rewardPoints);
        } else {
          set({ levelsCompleted: newLevelsCompleted });
        }
      },
      
      // Proceed to next level
      nextLevel: () => {
        const { currentLevel } = get();
        const nextLevel = currentLevel + 1;
        
        // Check if we've reached the end of the game
        if (!levelRequirements[nextLevel]) {
          set({ gameState: GAME_STATES.GAME_OVER });
          return;
        }
        
        // Otherwise, go to next level
        set({ currentLevel: nextLevel });
        get().initGame();
        set({ gameState: GAME_STATES.PLAYING });
      },
      
      // Add experience and handle level ups
      addExperience: (amount) => {
        const { experience, playerLevel } = get();
        
        // Calculate new experience
        const newExperience = experience + amount;
        
        // Calculate experience needed for next level
        const expForNextLevel = playerLevel * 1000;
        
        // Check if player should level up
        if (newExperience >= expForNextLevel) {
          // Level up
          set({ 
            playerLevel: playerLevel + 1,
            experience: newExperience - expForNextLevel,
            playerEssence: get().playerEssence + (playerLevel * 100) // Level up bonus
          });
        } else {
          // Just add experience
          set({ experience: newExperience });
        }
      },
      
      // Purchase an item from the store
      purchaseItem: (item) => {
        const { playerEssence, inventory, unlockedElements } = get();
        
        // Check if player can afford it
        if (playerEssence < item.price) {
          return { success: false, message: 'Not enough essence' };
        }
        
        // Handle different item types
        if (item.type === 'element') {
          // Purchase a new element
          const newInventory = { ...inventory };
          
          if (!newInventory[item.element]) {
            newInventory[item.element] = 0;
          }
          
          newInventory[item.element] += 5; // Add 5 of the purchased element
          
          // Check if this is a newly unlocked element
          let newUnlockedElements = [...unlockedElements];
          if (!newUnlockedElements.includes(item.element)) {
            newUnlockedElements.push(item.element);
          }
          
          set({
            playerEssence: playerEssence - item.price,
            inventory: newInventory,
            unlockedElements: newUnlockedElements
          });
          
          return { success: true, message: `Purchased ${item.name}` };
        }
        else if (item.type === 'upgrade') {
          // Add more of the element to inventory
          const newInventory = { ...inventory };
          
          if (!newInventory[item.element]) {
            newInventory[item.element] = 0;
          }
          
          newInventory[item.element] += 10; // Add 10 more with upgrade
          
          set({
            playerEssence: playerEssence - item.price,
            inventory: newInventory
          });
          
          return { success: true, message: `Upgraded ${item.element} element` };
        }
        else if (item.type === 'special') {
          // Handle special items based on ID
          if (item.id === 'special_inventory') {
            // Inventory expansion
            set({
              playerEssence: playerEssence - item.price,
              // Logic for expanding inventory would be here
            });
          }
          else if (item.id === 'special_cascade') {
            // Cascade reactions
            set({
              playerEssence: playerEssence - item.price,
              // Logic for enabling cascade reactions
            });
          }
          // Add other special items as needed
          
          return { success: true, message: `Purchased ${item.name}` };
        }
        
        return { success: false, message: 'Unknown item type' };
      },
      
      // Update settings
      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } });
      },
      
      // Reset settings to default
      resetSettings: () => {
        set({ settings: { ...defaultSettings } });
      },
      
      // Save game manually
      saveGame: () => {
        // The persist middleware handles this automatically
        return { success: true, message: 'Game saved' };
      },
      
      // Set the current word puzzle
      setWordPuzzle: (puzzle) => {
        set({ currentWordPuzzle: puzzle });
      },
      
      // Check word puzzle solution
      checkWordPuzzleSolution: (attempt) => {
        const { currentWordPuzzle } = get();
        
        if (!currentWordPuzzle) {
          return { success: false, message: 'No active word puzzle' };
        }
        
        const result = checkWordPuzzle(
          currentWordPuzzle.word.split(''), 
          attempt.split('')
        );
        
        // Check if solution is correct (all letters correct)
        const isCorrect = result.every(status => status === 'correct');
        
        if (isCorrect) {
          // Mark related objectives as complete
          const { objectives } = get();
          const updatedObjectives = objectives.map(obj => {
            if (obj.type === 'solve_puzzle' && obj.puzzleType === 'word') {
              set({ 
                score: get().score + (obj.points || 100),
                playerEssence: get().playerEssence + Math.floor((obj.points || 100) / 5)
              });
              
              // Add experience
              get().addExperience(obj.points || 100);
              
              return { ...obj, completed: true };
            }
            return obj;
          });
          
          set({ objectives: updatedObjectives });
          
          // Check if all objectives are now complete
          const allComplete = updatedObjectives.every(obj => obj.completed);
          if (allComplete) {
            set({ gameState: GAME_STATES.LEVEL_COMPLETE });
          }
        }
        
        return { 
          success: true, 
          result,
          isCorrect
        };
      },
      
      // Set the current logic puzzle
      setLogicPuzzle: (puzzle) => {
        set({ currentLogicPuzzle: puzzle });
      },
      
      // Check logic puzzle solution
      checkLogicPuzzleSolution: (solution) => {
        const { currentLogicPuzzle } = get();
        
        if (!currentLogicPuzzle) {
          return { success: false, message: 'No active logic puzzle' };
        }
        
        const isCorrect = checkLogicPuzzle(
          solution, 
          currentLogicPuzzle.solution,
          currentLogicPuzzle.validElements
        );
        
        if (isCorrect) {
          // Mark related objectives as complete
          const { objectives } = get();
          const updatedObjectives = objectives.map(obj => {
            if (obj.type === 'solve_puzzle' && obj.puzzleType === 'logic') {
              set({ 
                score: get().score + (obj.points || 100),
                playerEssence: get().playerEssence + Math.floor((obj.points || 100) / 5)
              });
              
              // Add experience
              get().addExperience(obj.points || 100);
              
              return { ...obj, completed: true };
            }
            return obj;
          });
          
          set({ objectives: updatedObjectives });
          
          // Check if all objectives are now complete
          const allComplete = updatedObjectives.every(obj => obj.completed);
          if (allComplete) {
            set({ gameState: GAME_STATES.LEVEL_COMPLETE });
          }
        }
        
        return { 
          success: true, 
          isCorrect
        };
      },
      
      // Reset the game (for testing or starting over)
      resetGame: () => {
        set({
          gameState: GAME_STATES.INTRO,
          currentLevel: 1,
          score: 0,
          playerEssence: 0,
          playerLevel: 1,
          experience: 0,
          board: [],
          selectedElement: null,
          inventory: INITIAL_ELEMENTS.reduce((acc, element) => {
            acc[element] = 5; // Start with 5 of each basic element
            return acc;
          }, {}),
          unlockedElements: [...INITIAL_ELEMENTS],
          objectives: [],
          levelsCompleted: [],
          currentWordPuzzle: null,
          currentLogicPuzzle: null
        });
        
        get().initGame();
      }
    }),
    {
      name: 'elementcraft-game-storage',
      getStorage: () => localStorage
    }
  )
);

export default useGameStore;