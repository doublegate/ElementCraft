/**
 * ElementCraft - Element Inventory Component
 * 
 * This component displays the player's inventory of collected elements,
 * showing quantities, properties, and providing selection functionality.
 * 
 * @module ElementInventory
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import ElementCard from './ElementCard';
import ProgressBar from './ProgressBar';
import { elementColors, elementDescriptions } from '../constants/elements';

const ElementInventory = ({ 
  inventory, 
  onSelectElement, 
  selectedElement,
  maxSlots = 12,
  onUpgrade = null,
  playerLevel = 1
}) => {
  // State for inventory tab
  const [activeTab, setActiveTab] = useState('basic');
  const [showDetails, setShowDetails] = useState(false);
  const [detailElement, setDetailElement] = useState(null);
  
  // Animation for the panel
  const panelAnimation = useSpring({
    transform: showDetails ? 'translateX(-50%)' : 'translateX(0%)',
    config: { tension: 280, friction: 24 }
  });
  
  // Filter inventory items by tab
  const getFilteredInventory = () => {
    if (!inventory) return [];
    
    const basicElements = ['fire', 'water', 'earth', 'air', 'metal', 'wood'];
    
    switch (activeTab) {
      case 'basic':
        return Object.entries(inventory)
          .filter(([element]) => basicElements.includes(element))
          .sort((a, b) => basicElements.indexOf(a[0]) - basicElements.indexOf(b[0]));
        
      case 'advanced':
        return Object.entries(inventory)
          .filter(([element]) => !basicElements.includes(element))
          .sort((a, b) => inventory[b[0]] - inventory[a[0]]);
        
      case 'all':
      default:
        return Object.entries(inventory)
          .sort((a, b) => {
            // Sort by category first, then by quantity
            const aIsBasic = basicElements.includes(a[0]);
            const bIsBasic = basicElements.includes(b[0]);
            
            if (aIsBasic && !bIsBasic) return -1;
            if (!aIsBasic && bIsBasic) return 1;
            
            return inventory[b[0]] - inventory[a[0]];
          });
    }
  };
  
  // Show element details
  const handleShowDetails = (element) => {
    setDetailElement(element);
    setShowDetails(true);
  };
  
  // Close element details
  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  // Calculate total inventory slots used
  const slotsUsed = Object.keys(inventory || {}).length;
  
  // Render inventory tabs
  const renderTabs = () => (
    <div className="inventory-tabs">
      <button 
        className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
        onClick={() => setActiveTab('basic')}
      >
        Basic
      </button>
      <button 
        className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
        onClick={() => setActiveTab('advanced')}
      >
        Advanced
      </button>
      <button 
        className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
        onClick={() => setActiveTab('all')}
      >
        All
      </button>
    </div>
  );
  
  // Render inventory grid
  const renderInventoryGrid = () => {
    const filteredInventory = getFilteredInventory();
    
    return (
      <div className="inventory-grid">
        {filteredInventory.map(([element, count]) => (
          <ElementCard
            key={element}
            element={element}
            count={count}
            size="medium"
            onClick={() => {
              onSelectElement(element);
              if (count <= 0) {
                handleShowDetails(element);
              }
            }}
            selected={selectedElement === element}
            disabled={count <= 0}
            showDetails={false}
          />
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: Math.max(0, maxSlots - slotsUsed) }).map((_, index) => (
          <div key={`empty-${index}`} className="empty-slot">
            <div className="empty-slot-icon">+</div>
            <div className="empty-slot-text">Empty</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render element details
  const renderElementDetails = () => {
    if (!detailElement) return null;
    
    const count = inventory[detailElement] || 0;
    const elementLevel = Math.max(1, Math.floor(Math.log2(count + 1)));
    const nextLevelCount = Math.pow(2, elementLevel) - count;
    
    return (
      <div className="element-details-panel">
        <button 
          className="close-details-button"
          onClick={handleCloseDetails}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="element-details-content">
          <ElementCard
            element={detailElement}
            size="large"
            count={count}
            showDetails={true}
          />
          
          <div className="element-stats">
            <h3>{detailElement.charAt(0).toUpperCase() + detailElement.slice(1)} Element</h3>
            
            <p className="element-description">
              {elementDescriptions[detailElement]}
            </p>
            
            <div className="element-level">
              <div className="stat-label">Element Level</div>
              <div className="stat-value">{elementLevel}</div>
            </div>
            
            <ProgressBar.Element
              value={count}
              maxValue={Math.pow(2, elementLevel)}
              label="Level Progress"
              labelPosition="top"
            />
            
            <div className="element-next-level">
              Need {nextLevelCount} more to reach level {elementLevel + 1}
            </div>
            
            <div className="element-effects">
              <h4>Element Effects</h4>
              <ul className="effects-list">
                <li className="effect-item">
                  <span className="effect-icon" style={{ backgroundColor: elementColors[detailElement] }}>
                    {elementLevel > 1 ? '+' : ''}
                  </span>
                  <span className="effect-description">
                    Basic element properties
                  </span>
                </li>
                
                {elementLevel >= 2 && (
                  <li className="effect-item">
                    <span className="effect-icon" style={{ backgroundColor: elementColors[detailElement] }}>
                      ++
                    </span>
                    <span className="effect-description">
                      Enhanced reaction strength
                    </span>
                  </li>
                )}
                
                {elementLevel >= 3 && (
                  <li className="effect-item">
                    <span className="effect-icon" style={{ backgroundColor: elementColors[detailElement] }}>
                      +++
                    </span>
                    <span className="effect-description">
                      Cascade reactions
                    </span>
                  </li>
                )}
                
                {elementLevel >= 5 && (
                  <li className="effect-item">
                    <span className="effect-icon" style={{ backgroundColor: elementColors[detailElement] }}>
                      M
                    </span>
                    <span className="effect-description">
                      Mastery: Permanent board effects
                    </span>
                  </li>
                )}
              </ul>
            </div>
            
            {onUpgrade && (
              <button 
                className="upgrade-button"
                onClick={() => onUpgrade(detailElement)}
                disabled={playerLevel < elementLevel * 2}
              >
                {playerLevel < elementLevel * 2 
                  ? `Requires Player Level ${elementLevel * 2}` 
                  : 'Upgrade Element'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="element-inventory">
      <div className="inventory-header">
        <h3>Element Inventory</h3>
        <div className="inventory-slots">
          <span className="slots-label">Slots:</span>
          <span className="slots-value">{slotsUsed}/{maxSlots}</span>
        </div>
      </div>
      
      {renderTabs()}
      
      <div className="inventory-panels-container">
        <animated.div 
          className="inventory-panels"
          style={panelAnimation}
        >
          <div className="inventory-panel">
            {renderInventoryGrid()}
          </div>
          
          <div className="details-panel">
            {renderElementDetails()}
          </div>
        </animated.div>
      </div>
    </div>
  );
};

export default ElementInventory;