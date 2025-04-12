/**
 * ElementCraft - Tutorial Component
 * 
 * This component provides an interactive tutorial that explains
 * the game mechanics, elements, and objectives to new players.
 * 
 * @module Tutorial
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { elementColors, elementSymbols } from '../constants/elements';

const Tutorial = ({ onClose }) => {
  // State to track current tutorial step
  const [currentStep, setCurrentStep] = useState(0);
  
  // Tutorial content in steps
  const tutorialSteps = [
    {
      title: "Welcome to ElementCraft!",
      content: (
        <>
          <p>
            ElementCraft is a strategic puzzle game where you manipulate elemental 
            tiles to solve challenges and create powerful combinations.
          </p>
          <p>
            Your goal is to complete objectives by placing and combining elements 
            on the game board in creative ways.
          </p>
          <div className="tutorial-image intro" />
        </>
      )
    },
    {
      title: "The Elements",
      content: (
        <>
          <p>
            There are six basic elements in ElementCraft:
          </p>
          <div className="elements-grid">
            {['fire', 'water', 'earth', 'air', 'metal', 'wood'].map(element => (
              <div 
                key={element}
                className="tutorial-element"
                style={{ backgroundColor: elementColors[element] }}
              >
                <div className="element-icon">{elementSymbols[element]}</div>
                <div className="element-name">
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </div>
              </div>
            ))}
          </div>
          <p>
            Each element has unique properties and reacts differently with other elements.
          </p>
        </>
      )
    },
    {
      title: "Placing Elements",
      content: (
        <>
          <p>
            To place an element on the board:
          </p>
          <ol>
            <li>Select an element from the Element Selector on the left</li>
            <li>Click on an empty cell on the game board to place it</li>
          </ol>
          <div className="tutorial-image placing" />
          <p>
            Elements interact with each other based on physics and their unique properties.
          </p>
        </>
      )
    },
    {
      title: "Element Combinations",
      content: (
        <>
          <p>
            When certain elements come into contact, they can combine to create new elements.
          </p>
          <div className="combinations-demo">
            <div className="combination">
              <div className="combo-element" style={{ backgroundColor: elementColors.fire }}>
                {elementSymbols.fire}
              </div>
              <span>+</span>
              <div className="combo-element" style={{ backgroundColor: elementColors.water }}>
                {elementSymbols.water}
              </div>
              <span>=</span>
              <div className="combo-element" style={{ backgroundColor: '#E0E0E0' }}>
                <span>St</span>
              </div>
            </div>
            <div className="combo-label">Fire + Water = Steam</div>
          </div>
          <p>
            Discover powerful combinations to unlock new elements and solve complex puzzles!
          </p>
        </>
      )
    },
    {
      title: "Word Puzzles",
      content: (
        <>
          <p>
            Some levels include word puzzles inspired by Wordle:
          </p>
          <div className="word-puzzle-demo">
            <div className="word-row">
              <div className="word-tile correct">F</div>
              <div className="word-tile">L</div>
              <div className="word-tile present">A</div>
              <div className="word-tile">M</div>
              <div className="word-tile">E</div>
            </div>
          </div>
          <p>
            Solving word puzzles will unlock special elements and abilities.
            Green tiles are correct letters in the correct position, yellow tiles
            are correct letters in the wrong position.
          </p>
        </>
      )
    },
    {
      title: "Logic Puzzles",
      content: (
        <>
          <p>
            Some levels feature logic puzzles inspired by Sudoku:
          </p>
          <div className="logic-puzzle-demo">
            <div className="sudoku-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="sudoku-cell">
                  {i % 2 === 0 ? elementSymbols[Object.keys(elementSymbols)[i % 6]] : ''}
                </div>
              ))}
            </div>
          </div>
          <p>
            Solve these puzzles by arranging elements according to specific rules,
            unlocking new powers and advancing through the game.
          </p>
        </>
      )
    },
    {
      title: "Building & Physics",
      content: (
        <>
          <p>
            Elements interact with realistic physics:
          </p>
          <ul>
            <li>Fire rises and can ignite other elements</li>
            <li>Water flows downward and can extinguish fire</li>
            <li>Earth elements can be stacked to build structures</li>
            <li>Metal conducts energy between elements</li>
            <li>Wood grows when placed near water</li>
            <li>Air can create pressure and move other elements</li>
          </ul>
          <p>
            Use these properties to create complex reactions and solve challenging puzzles!
          </p>
        </>
      )
    },
    {
      title: "Progression",
      content: (
        <>
          <p>
            As you complete levels, you'll:
          </p>
          <ul>
            <li>Unlock new elements and combinations</li>
            <li>Earn points to upgrade your abilities</li>
            <li>Discover special elements with unique properties</li>
            <li>Face increasingly complex challenges</li>
          </ul>
          <p>
            Each level has multiple objectives. Complete all objectives to advance to the next level!
          </p>
        </>
      )
    },
    {
      title: "Ready to Play?",
      content: (
        <>
          <p>
            Now you're ready to start your elemental journey!
          </p>
          <p>
            Remember, experimentation is key - try different combinations and
            strategies to discover all the secrets of ElementCraft.
          </p>
          <div className="ready-image" />
          <p className="final-tip">
            <strong>Pro Tip:</strong> If you get stuck, click the Help button to revisit this tutorial.
          </p>
        </>
      )
    }
  ];
  
  // Animation for the modal
  const modalAnimation = useSpring({
    opacity: 1,
    transform: 'translateY(0)',
    from: { opacity: 0, transform: 'translateY(-50px)' },
    config: { tension: 280, friction: 20 }
  });
  
  // Go to next tutorial step
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  
  // Go to previous tutorial step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Current tutorial step
  const currentTutorial = tutorialSteps[currentStep];
  
  return (
    <div className="tutorial-overlay">
      <animated.div 
        className="tutorial-modal"
        style={modalAnimation}
      >
        <h2 className="tutorial-title">{currentTutorial.title}</h2>
        
        <div className="tutorial-content">
          {currentTutorial.content}
        </div>
        
        <div className="tutorial-navigation">
          {currentStep > 0 && (
            <button 
              className="tutorial-button prev"
              onClick={prevStep}
            >
              Previous
            </button>
          )}
          
          <div className="step-indicator">
            {tutorialSteps.map((_, index) => (
              <div 
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
          
          <button 
            className="tutorial-button next"
            onClick={nextStep}
          >
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Start Playing'}
          </button>
        </div>
        
        <button 
          className="tutorial-close"
          onClick={onClose}
          aria-label="Close Tutorial"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </animated.div>
    </div>
  );
};

export default Tutorial;