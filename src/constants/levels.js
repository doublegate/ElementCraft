/**
 * ElementCraft - Level Constants
 * 
 * This module defines the levels, their requirements, and objectives
 * to provide a structured progression through the game.
 * 
 * @module levels
 * @author ElementCraft Team
 * @version 1.0.0
 */

// Level requirements define grid size and available elements
export const levelRequirements = {
  1: {
    // Tutorial level
    rows: 6,
    cols: 6,
    availableElements: ['fire', 'water', 'earth', 'air'],
    maxMoves: 20,
    difficulty: 'easy'
  },
  2: {
    // Introduces metal
    rows: 6,
    cols: 8,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal'],
    maxMoves: 25,
    difficulty: 'easy'
  },
  3: {
    // Introduces wood
    rows: 8,
    cols: 8,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal', 'wood'],
    maxMoves: 30,
    difficulty: 'medium'
  },
  4: {
    // Introduces multiple combinations
    rows: 8,
    cols: 10,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal', 'wood'],
    maxMoves: 35,
    difficulty: 'medium'
  },
  5: {
    // Introduces crystal and steam
    rows: 10,
    cols: 10,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal', 'wood', 'crystal', 'steam'],
    maxMoves: 40,
    difficulty: 'medium'
  },
  6: {
    // Introduces word puzzles
    rows: 10,
    cols: 10,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal', 'wood', 'crystal', 'steam'],
    maxMoves: 45,
    wordPuzzle: true,
    difficulty: 'hard'
  },
  7: {
    // Introduces logic puzzles
    rows: 10,
    cols: 10,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal', 'wood', 'crystal', 'steam'],
    maxMoves: 50,
    logicPuzzle: true,
    difficulty: 'hard'
  },
  8: {
    // Advanced combinations
    rows: 12,
    cols: 12,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal', 'wood', 'crystal', 'steam', 'cloud', 'lava'],
    maxMoves: 55,
    difficulty: 'expert'
  },
  9: {
    // Complex structure building
    rows: 12,
    cols: 12,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal', 'wood', 'crystal', 'steam', 'cloud', 'lava', 'sand'],
    maxMoves: 60,
    difficulty: 'expert'
  },
  10: {
    // Final challenge
    rows: 14,
    cols: 14,
    availableElements: ['fire', 'water', 'earth', 'air', 'metal', 'wood', 'crystal', 'steam', 'cloud', 'lava', 'sand', 'plasma'],
    maxMoves: 70,
    wordPuzzle: true,
    logicPuzzle: true,
    difficulty: 'expert'
  }
};

// Level objectives define what the player needs to accomplish
export const levelObjectives = {
  1: [
    {
      id: 'create_steam',
      type: 'create_element',
      element: 'steam',
      description: 'Create steam by combining fire and water',
      completed: false,
      points: 100
    },
    {
      id: 'place_all_elements',
      type: 'place_elements',
      elements: ['fire', 'water', 'earth', 'air'],
      description: 'Place all four basic elements on the board',
      completed: false,
      points: 50
    }
  ],
  2: [
    {
      id: 'create_structure',
      type: 'build_structure',
      pattern: 'earth_square',
      description: 'Build a 2x2 structure using earth elements',
      completed: false,
      points: 100
    },
    {
      id: 'place_metal',
      type: 'place_element',
      element: 'metal',
      count: 3,
      description: 'Place 3 metal elements on the board',
      completed: false,
      points: 75
    },
    {
      id: 'create_lava',
      type: 'create_element',
      element: 'lava',
      description: 'Create lava by combining fire and earth',
      completed: false,
      points: 150
    }
  ],
  3: [
    {
      id: 'grow_wood',
      type: 'create_combination',
      combination: [['wood', 5]],
      description: 'Grow a forest by placing wood near water',
      completed: false,
      points: 150
    },
    {
      id: 'metal_conductor',
      type: 'create_pattern',
      pattern: 'metal_fire_path',
      description: 'Create a path of metal that conducts fire energy',
      completed: false,
      points: 200
    }
  ],
  4: [
    {
      id: 'create_cloud',
      type: 'create_element',
      element: 'cloud',
      description: 'Create a cloud by combining air and water',
      completed: false,
      points: 150
    },
    {
      id: 'create_sand',
      type: 'create_element',
      element: 'sand',
      description: 'Create sand by combining earth and air',
      completed: false,
      points: 150
    },
    {
      id: 'element_trio',
      type: 'create_combination',
      combination: [['fire', 3], ['water', 3], ['air', 3]],
      description: 'Have 3 of each: fire, water, and air elements on the board',
      completed: false,
      points: 200
    }
  ],
  5: [
    {
      id: 'create_crystal',
      type: 'create_element',
      element: 'crystal',
      description: 'Create a crystal through advanced element combinations',
      completed: false,
      points: 250
    },
    {
      id: 'amplify_elements',
      type: 'special_action',
      action: 'amplify',
      count: 3,
      description: 'Amplify 3 different elements using crystal',
      completed: false,
      points: 200
    },
    {
      id: 'elemental_balance',
      type: 'create_combination',
      combination: [
        ['fire', 2], ['water', 2], ['earth', 2], 
        ['air', 2], ['metal', 2], ['wood', 2]
      ],
      description: 'Create balance by having 2 of each basic element',
      completed: false,
      points: 300
    }
  ],
  6: [
    {
      id: 'word_puzzle',
      type: 'solve_puzzle',
      puzzleType: 'word',
      word: 'FLAME',
      description: 'Solve the word puzzle to unlock fire mastery',
      completed: false,
      points: 300
    },
    {
      id: 'create_plasma',
      type: 'create_element',
      element: 'plasma',
      description: 'Create plasma by combining fire and air',
      completed: false,
      points: 250
    }
  ],
  7: [
    {
      id: 'logic_puzzle',
      type: 'solve_puzzle',
      puzzleType: 'logic',
      size: 4,
      description: 'Solve the 4x4 element grid puzzle',
      completed: false,
      points: 350
    },
    {
      id: 'flowing_system',
      type: 'create_pattern',
      pattern: 'water_flow_circuit',
      description: 'Create a system where water flows in a complete circuit',
      completed: false,
      points: 300
    }
  ],
  8: [
    {
      id: 'multi_reaction',
      type: 'special_action',
      action: 'chain_reaction',
      count: 5,
      description: 'Trigger a chain reaction of 5 or more element combinations',
      completed: false,
      points: 400
    },
    {
      id: 'elemental_tower',
      type: 'build_structure',
      pattern: 'vertical_stack',
      height: 8,
      description: 'Build a tower at least 8 elements tall',
      completed: false,
      points: 350
    }
  ],
  9: [
    {
      id: 'mega_structure',
      type: 'build_structure',
      pattern: 'complex_building',
      description: 'Build a complex structure with at least 3 rooms',
      completed: false,
      points: 450
    },
    {
      id: 'element_mastery',
      type: 'create_combination',
      combination: [
        ['fire', 3], ['water', 3], ['earth', 3], ['air', 3],
        ['metal', 3], ['wood', 3], ['crystal', 1], ['steam', 1],
        ['cloud', 1], ['lava', 1], ['sand', 1]
      ],
      description: 'Demonstrate mastery by creating 3 of each basic element and 1 of each advanced element',
      completed: false,
      points: 500
    }
  ],
  10: [
    {
      id: 'final_word_puzzle',
      type: 'solve_puzzle',
      puzzleType: 'word',
      word: 'MASTER',
      description: 'Solve the final word puzzle',
      completed: false,
      points: 300
    },
    {
      id: 'final_logic_puzzle',
      type: 'solve_puzzle',
      puzzleType: 'logic',
      size: 6,
      description: 'Solve the 6x6 element grid puzzle',
      completed: false,
      points: 400
    },
    {
      id: 'element_harmony',
      type: 'special_action',
      action: 'perfect_balance',
      description: 'Create perfect elemental harmony on the board',
      completed: false,
      points: 1000
    }
  ]
};

// Level backgrounds for visual themes
export const levelBackgrounds = {
  1: {
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    particles: 'basic',
    theme: 'night'
  },
  2: {
    gradient: 'linear-gradient(135deg, #1a1a2e, #27496d)',
    particles: 'metal',
    theme: 'forge'
  },
  3: {
    gradient: 'linear-gradient(135deg, #16213e, #354b45)',
    particles: 'forest',
    theme: 'forest'
  },
  4: {
    gradient: 'linear-gradient(135deg, #27496d, #1a1a2e)',
    particles: 'weather',
    theme: 'storm'
  },
  5: {
    gradient: 'linear-gradient(135deg, #2c3e50, #4a3f56)',
    particles: 'crystal',
    theme: 'crystal'
  },
  6: {
    gradient: 'linear-gradient(135deg, #2c3e50, #4a2c2a)',
    particles: 'word',
    theme: 'library'
  },
  7: {
    gradient: 'linear-gradient(135deg, #13131d, #2c3e50)',
    particles: 'logic',
    theme: 'laboratory'
  },
  8: {
    gradient: 'linear-gradient(135deg, #4a2c2a, #13131d)',
    particles: 'advanced',
    theme: 'volcano'
  },
  9: {
    gradient: 'linear-gradient(135deg, #354b45, #4a3f56)',
    particles: 'building',
    theme: 'architecture'
  },
  10: {
    gradient: 'linear-gradient(135deg, #13131d, #1a1a2e, #27496d, #4a3f56)',
    particles: 'finale',
    theme: 'cosmos'
  }
};

// Level music tracks
export const levelMusic = {
  1: 'tutorial',
  2: 'exploration',
  3: 'forest',
  4: 'elements',
  5: 'crystal',
  6: 'puzzle',
  7: 'logic',
  8: 'intense',
  9: 'building',
  10: 'finale'
};

// Level introductions and story elements
export const levelIntroductions = {
  1: {
    title: "The Elements Awaken",
    story: "Welcome, Element Master! Your journey begins with the fundamental elements. Learn to combine fire, water, earth, and air to unlock the secrets of creation."
  },
  2: {
    title: "Forging New Paths",
    story: "With the basic elements mastered, you discover metal - a conductor of energy and builder of structures. Use it to create new pathways for elemental energy."
  },
  3: {
    title: "Growth and Life",
    story: "Wood appears, bringing growth and life. Nurture it with water to create a thriving forest and discover the secrets of organic energy."
  },
  4: {
    title: "Elemental Harmony",
    story: "The elements speak to each other in complex ways. Create clouds in the sky and sand beneath your feet as you learn to balance multiple interactions."
  },
  5: {
    title: "Crystal Amplification",
    story: "Discover the rare crystal element that amplifies the power of other elements. Use its focusing properties to unlock even greater potential."
  },
  6: {
    title: "Words of Power",
    story: "Ancient elemental knowledge is encoded in words. Solve the puzzle to unlock the true names and power of the elements you command."
  },
  7: {
    title: "Logical Patterns",
    story: "Elements follow strict rules of harmony and balance. Arrange them in perfect patterns to unlock the mathematical secrets of creation."
  },
  8: {
    title: "Chain Reactions",
    story: "Your mastery grows as you learn to create complex chains of elemental reactions. One small placement can trigger a cascade of spectacular effects."
  },
  9: {
    title: "Elemental Architecture",
    story: "The ancient Element Masters built great structures using their knowledge. Create your own elemental wonders that stand as monuments to your skill."
  },
  10: {
    title: "The Ultimate Balance",
    story: "You face the final challenge - creating perfect elemental harmony across all dimensions. Succeed, and you will be recognized as a true Element Master."
  }
};

// Rewards for completing levels
export const levelRewards = {
  1: {
    elements: ['metal'],
    points: 200,
    title: "Elemental Novice"
  },
  2: {
    elements: ['wood'],
    points: 400,
    title: "Structure Builder"
  },
  3: {
    elements: ['lava', 'sand'],
    points: 600,
    title: "Forest Guardian"
  },
  4: {
    elements: ['cloud'],
    points: 800,
    title: "Weather Weaver"
  },
  5: {
    elements: ['crystal'],
    points: 1000,
    title: "Crystal Adept"
  },
  6: {
    elements: ['plasma'],
    points: 1200,
    title: "Word Mage"
  },
  7: {
    specialAbility: 'Element Sight',
    points: 1500,
    title: "Logic Master"
  },
  8: {
    specialAbility: 'Chain Mastery',
    points: 2000,
    title: "Reaction Virtuoso"
  },
  9: {
    specialAbility: 'Master Builder',
    points: 2500,
    title: "Architect of Elements"
  },
  10: {
    specialAbility: 'Elemental Harmony',
    points: 5000,
    title: "Element Master"
  }
};