/**
 * ElementCraft - Element Card Component
 * 
 * A reusable component that displays an element with its visual
 * representation, name, and properties. Used in the element selector,
 * inventory, and other places where elements need to be displayed.
 * 
 * @module ElementCard
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { elementColors, elementSymbols, elementDescriptions, elementProperties } from '../constants/elements';

const ElementCard = ({ 
  element, 
  size = 'medium', 
  onClick, 
  selected = false,
  showDetails = true,
  count = null,
  disabled = false,
  unlockable = false
}) => {
  // State for hover effect
  const [hovered, setHovered] = useState(false);
  
  // Animations based on state
  const cardAnimation = useSpring({
    transform: selected 
      ? 'scale(1.05) translateY(-5px)' 
      : hovered 
        ? 'scale(1.03) translateY(-3px)' 
        : 'scale(1) translateY(0px)',
    boxShadow: selected 
      ? `0 10px 20px rgba(0,0,0,0.2), 0 0 15px ${elementColors[element] || '#666'}` 
      : hovered 
        ? `0 7px 15px rgba(0,0,0,0.15), 0 0 8px ${elementColors[element] || '#666'}`
        : '0 2px 5px rgba(0,0,0,0.1)',
    opacity: disabled ? 0.5 : 1,
    config: { tension: 300, friction: 20 }
  });
  
  // Animation for glow effect on select
  const glowAnimation = useSpring({
    opacity: selected ? 0.8 : 0,
    transform: `scale(${selected ? 1.2 : 0.8})`,
    config: { tension: 200, friction: 20 }
  });
  
  // Get CSS class based on size
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'element-card-small';
      case 'large':
        return 'element-card-large';
      case 'medium':
      default:
        return 'element-card-medium';
    }
  };
  
  // Get property bar widths based on element properties
  const getPropertyWidth = (property) => {
    if (!elementProperties[element]) return '10%';
    
    const value = elementProperties[element][property] || 0;
    return `${value * 100}%`;
  };
  
  // Render element details
  const renderDetails = () => {
    if (!showDetails || size === 'small') return null;
    
    return (
      <div className="element-details">
        <div className="element-name">
          {element.charAt(0).toUpperCase() + element.slice(1)}
          {count !== null && <span className="element-count">×{count}</span>}
        </div>
        
        {size === 'large' && (
          <div className="element-description">
            {elementDescriptions[element]}
          </div>
        )}
        
        {size === 'large' && (
          <div className="element-properties">
            <div className="property-row">
              <span className="property-label">Density</span>
              <div className="property-bar">
                <div 
                  className="property-value"
                  style={{ width: getPropertyWidth('density') }}
                />
              </div>
            </div>
            
            <div className="property-row">
              <span className="property-label">Volatility</span>
              <div className="property-bar">
                <div 
                  className="property-value"
                  style={{ width: getPropertyWidth('volatility') }}
                />
              </div>
            </div>
            
            <div className="property-row">
              <span className="property-label">Conductivity</span>
              <div className="property-bar">
                <div 
                  className="property-value"
                  style={{ width: getPropertyWidth('conductivity') }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <animated.div 
      className={`element-card ${getSizeClass()} ${disabled ? 'disabled' : ''} ${unlockable ? 'unlockable' : ''}`}
      style={{
        ...cardAnimation,
        backgroundColor: elementColors[element] || '#666'
      }}
      onClick={disabled ? null : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow effect for selected state */}
      <animated.div 
        className="element-glow"
        style={{
          ...glowAnimation,
          backgroundColor: elementColors[element] || '#666'
        }}
      />
      
      {/* Element symbol */}
      <div className="element-symbol">
        {unlockable ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3C12.0609 3 13.0783 3.42143 13.8284 4.17157C14.5786 4.92172 15 5.93913 15 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          elementSymbols[element]
        )}
      </div>
      
      {/* Element details (name, description, properties) */}
      {renderDetails()}
      
      {/* Count badge */}
      {count !== null && size === 'small' && (
        <div className="element-count-badge">
          {count}
        </div>
      )}
    </animated.div>
  );
};

export default ElementCard;