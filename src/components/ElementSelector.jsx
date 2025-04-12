/**
 * ElementCraft - Element Selector Component
 * 
 * This component allows players to select elements to place on the game board.
 * It displays available elements with visual feedback for selection.
 * 
 * @module ElementSelector
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React from 'react';
import { useSpring, animated } from 'react-spring';
import { elementColors, elementSymbols, elementDescriptions } from '../constants/elements';

const ElementSelector = ({ elements, selectedElement, onSelectElement, playSound }) => {
  // Generate tooltips for elements that show their descriptions
  const generateTooltip = (element) => {
    return (
      <div className="element-tooltip">
        <h4>{element.charAt(0).toUpperCase() + element.slice(1)}</h4>
        <p>{elementDescriptions[element]}</p>
      </div>
    );
  };
  
  // Handle element selection
  const handleSelectElement = (element) => {
    playSound();
    onSelectElement(element === selectedElement ? null : element);
  };
  
  return (
    <div className="element-selector">
      <h3 className="selector-title">Elements</h3>
      
      <div className="elements-container">
        {elements.map((element) => {
          // Animation for selected element
          const animation = useSpring({
            transform: element === selectedElement
              ? 'scale(1.1) translateY(-5px)'
              : 'scale(1) translateY(0)',
            boxShadow: element === selectedElement
              ? `0 10px 20px rgba(0,0,0,0.2), 0 0 10px ${elementColors[element]}`
              : '0 2px 5px rgba(0,0,0,0.1)',
            config: { tension: 300, friction: 20 }
          });
          
          return (
            <animated.div
              key={element}
              className={`element-item ${element === selectedElement ? 'selected' : ''}`}
              style={{
                ...animation,
                backgroundColor: elementColors[element]
              }}
              onClick={() => handleSelectElement(element)}
            >
              <div className="element-icon">
                {elementSymbols[element]}
              </div>
              <div className="element-name">
                {element.charAt(0).toUpperCase() + element.slice(1)}
              </div>
              
              {/* Tooltip shows on hover */}
              {generateTooltip(element)}
            </animated.div>
          );
        })}
      </div>
      
      {/* Element Combination Guide */}
      <div className="element-combinations">
        <h4>Element Combinations</h4>
        <div className="combinations-list">
          <div className="combination-item">
            <span className="element-tag" style={{ backgroundColor: elementColors.fire }}>Fire</span>
            <span>+</span>
            <span className="element-tag" style={{ backgroundColor: elementColors.water }}>Water</span>
            <span>=</span>
            <span className="element-tag" style={{ backgroundColor: '#E0E0E0' }}>Steam</span>
          </div>
          
          <div className="combination-item">
            <span className="element-tag" style={{ backgroundColor: elementColors.earth }}>Earth</span>
            <span>+</span>
            <span className="element-tag" style={{ backgroundColor: elementColors.fire }}>Fire</span>
            <span>=</span>
            <span className="element-tag" style={{ backgroundColor: '#8D4E85' }}>Crystal</span>
          </div>
          
          <div className="combination-item">
            <span className="element-tag" style={{ backgroundColor: elementColors.air }}>Air</span>
            <span>+</span>
            <span className="element-tag" style={{ backgroundColor: elementColors.water }}>Water</span>
            <span>=</span>
            <span className="element-tag" style={{ backgroundColor: '#D4F1F9' }}>Cloud</span>
          </div>
        </div>
      </div>
      
      {/* Currently selected element display */}
      {selectedElement && (
        <div className="selected-element-info">
          <h4>Selected:</h4>
          <div 
            className="selected-element-display"
            style={{ backgroundColor: elementColors[selectedElement] }}
          >
            <div className="element-icon large">
              {elementSymbols[selectedElement]}
            </div>
            <div className="element-name">
              {selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1)}
            </div>
          </div>
          <p className="element-description">
            {elementDescriptions[selectedElement]}
          </p>
        </div>
      )}
    </div>
  );
};

export default ElementSelector;