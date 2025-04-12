/**
 * ElementCraft - Progress Bar Component
 * 
 * A reusable component that displays progress visually.
 * Used for level completion, objective tracking, and other
 * progress indicators throughout the game.
 * 
 * @module ProgressBar
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

const ProgressBar = ({ 
  value = 0,
  maxValue = 100,
  label = null,
  showPercentage = true,
  height = 16,
  colorScheme = 'primary',
  animated: isAnimated = true,
  className = '',
  labelPosition = 'top'
}) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Animation for the progress fill
  const fillAnimation = useSpring({
    width: `${percentage}%`,
    from: { width: isAnimated ? '0%' : `${percentage}%` },
    config: { tension: 120, friction: 14 }
  });
  
  // Animation for the percentage text
  const textAnimation = useSpring({
    number: percentage,
    from: { number: isAnimated ? 0 : percentage },
    config: { tension: 100, friction: 10 }
  });
  
  // Get color scheme CSS classes
  const getColorClasses = () => {
    switch (colorScheme) {
      case 'success':
        return 'progress-bar-success';
      case 'warning':
        return 'progress-bar-warning';
      case 'danger':
        return 'progress-bar-danger';
      case 'info':
        return 'progress-bar-info';
      case 'element':
        return 'progress-bar-element';
      case 'rainbow':
        return 'progress-bar-rainbow';
      case 'primary':
      default:
        return 'progress-bar-primary';
    }
  };
  
  // Generate classes for the component
  const containerClasses = `progress-bar-container ${getColorClasses()} ${className} label-${labelPosition}`;
  
  // Format the displayed percentage or value
  const formatDisplayValue = () => {
    if (showPercentage) {
      return `${Math.round(percentage)}%`;
    } else if (maxValue === 1) {
      // For boolean progress (completed/not completed)
      return value === 1 ? 'Completed' : 'In Progress';
    } else {
      // Show as fraction
      return `${value}/${maxValue}`;
    }
  };
  
  // Render the label
  const renderLabel = () => {
    if (!label) return null;
    
    return (
      <div className="progress-bar-label">
        <span>{label}</span>
        {showPercentage && (
          <animated.span className="progress-percentage">
            {textAnimation.number.to(n => `${Math.round(n)}%`)}
          </animated.span>
        )}
      </div>
    );
  };
  
  return (
    <div className={containerClasses}>
      {labelPosition === 'top' && renderLabel()}
      
      <div 
        className="progress-bar-track"
        style={{ height: `${height}px` }}
      >
        <animated.div 
          className="progress-bar-fill"
          style={fillAnimation}
        >
          {labelPosition === 'inside' && (
            <div className="progress-bar-value">
              {formatDisplayValue()}
            </div>
          )}
        </animated.div>
        
        {/* Milestone markers */}
        {colorScheme === 'rainbow' && (
          <>
            <div className="milestone" style={{ left: '25%' }} />
            <div className="milestone" style={{ left: '50%' }} />
            <div className="milestone" style={{ left: '75%' }} />
          </>
        )}
      </div>
      
      {labelPosition === 'bottom' && renderLabel()}
      
      {labelPosition === 'right' && (
        <div className="progress-bar-value right">
          {formatDisplayValue()}
        </div>
      )}
    </div>
  );
};

// Preset configurations for common use cases
ProgressBar.Level = (props) => (
  <ProgressBar
    colorScheme="rainbow"
    height={12}
    labelPosition="top"
    label="Level Progress"
    {...props}
  />
);

ProgressBar.Objective = (props) => (
  <ProgressBar
    colorScheme="success"
    height={8}
    labelPosition="right"
    showPercentage={false}
    {...props}
  />
);

ProgressBar.Element = (props) => (
  <ProgressBar
    colorScheme="element"
    height={10}
    labelPosition="top"
    {...props}
  />
);

ProgressBar.Energy = (props) => (
  <ProgressBar
    colorScheme="primary"
    height={14}
    labelPosition="inside"
    label="Energy"
    {...props}
  />
);

export default ProgressBar;