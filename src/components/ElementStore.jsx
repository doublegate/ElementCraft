/**
 * ElementCraft - Element Store Component
 * 
 * This component allows players to purchase new elements, upgrades,
 * and special abilities using the in-game currency (essence).
 * 
 * @module ElementStore
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import ElementCard from './ElementCard';
import ProgressBar from './ProgressBar';
import { elementColors, elementDescriptions } from '../constants/elements';

const ElementStore = ({ 
  availableElements, 
  playerInventory, 
  playerEssence = 0,
  playerLevel = 1,
  onPurchase,
  onClose
}) => {
  // Store categories
  const categories = [
    { id: 'elements', name: 'Elements' },
    { id: 'upgrades', name: 'Upgrades' },
    { id: 'special', name: 'Special' }
  ];
  
  // Current category
  const [activeCategory, setActiveCategory] = useState('elements');
  
  // Currently selected item
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Animation for the store panel
  const storeAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 24 }
  });
  
  // Get price for an element
  const getElementPrice = (element, isUpgrade = false) => {
    // Base prices for different element types
    const basePrices = {
      fire: 100,
      water: 100,
      earth: 100,
      air: 100,
      metal: 250,
      wood: 250,
      crystal: 500,
      steam: 350,
      cloud: 350,
      lava: 400,
      sand: 300,
      plasma: 600
    };
    
    // Get base price
    const basePrice = basePrices[element] || 200;
    
    // For upgrades, price increases with current level
    if (isUpgrade) {
      const currentCount = playerInventory[element] || 0;
      const currentLevel = Math.max(1, Math.floor(Math.log2(currentCount + 1)));
      return basePrice * currentLevel * 2;
    }
    
    // For new elements, price is just the base price
    return basePrice;
  };
  
  // Check if player can afford an item
  const canAfford = (price) => {
    return playerEssence >= price;
  };
  
  // Check if element is already owned
  const isOwned = (element) => {
    return playerInventory && playerInventory[element] > 0;
  };
  
  // Handle purchase
  const handlePurchase = (item) => {
    if (!canAfford(item.price)) return;
    
    // Call parent's purchase handler
    onPurchase(item);
    
    // Clear selection
    setSelectedItem(null);
  };
  
  // Get items for current category
  const getCategoryItems = () => {
    switch (activeCategory) {
      case 'elements':
        // Basic and advanced elements
        return availableElements.map(element => ({
          id: element,
          type: 'element',
          name: element.charAt(0).toUpperCase() + element.slice(1),
          element,
          price: getElementPrice(element),
          description: elementDescriptions[element],
          owned: isOwned(element),
          requiredLevel: getElementRequiredLevel(element)
        }));
        
      case 'upgrades':
        // Upgrades for owned elements
        return Object.keys(playerInventory || {})
          .filter(element => playerInventory[element] > 0)
          .map(element => ({
            id: `upgrade_${element}`,
            type: 'upgrade',
            name: `${element.charAt(0).toUpperCase() + element.slice(1)} Upgrade`,
            element,
            price: getElementPrice(element, true),
            description: `Enhance your ${element} element to increase its power and unlock new abilities.`,
            owned: false,
            requiredLevel: getUpgradeRequiredLevel(element)
          }));
        
      case 'special':
        // Special abilities and items
        return getSpecialItems();
        
      default:
        return [];
    }
  };
  
  // Get required player level for an element
  const getElementRequiredLevel = (element) => {
    const levelRequirements = {
      fire: 1,
      water: 1,
      earth: 1,
      air: 1,
      metal: 3,
      wood: 3,
      crystal: 5,
      steam: 4,
      cloud: 4,
      lava: 5,
      sand: 4,
      plasma: 7
    };
    
    return levelRequirements[element] || 1;
  };
  
  // Get required player level for an upgrade
  const getUpgradeRequiredLevel = (element) => {
    const currentCount = playerInventory[element] || 0;
    const currentLevel = Math.max(1, Math.floor(Math.log2(currentCount + 1)));
    return currentLevel * 2;
  };
  
  // Get special items
  const getSpecialItems = () => {
    return [
      {
        id: 'special_inventory',
        type: 'special',
        name: 'Inventory Expansion',
        element: null,
        icon: 'backpack',
        price: 500,
        description: 'Increase your inventory capacity by 4 slots.',
        owned: false,
        requiredLevel: 3
      },
      {
        id: 'special_cascade',
        type: 'special',
        name: 'Cascade Reactions',
        element: null,
        icon: 'chain',
        price: 750,
        description: 'Element reactions can trigger chain reactions.',
        owned: false,
        requiredLevel: 5
      },
      {
        id: 'special_catalyst',
        type: 'special',
        name: 'Element Catalyst',
        element: 'crystal',
        icon: 'star',
        price: 1000,
        description: 'Amplify the power of all elements on the board.',
        owned: false,
        requiredLevel: 7
      },
      {
        id: 'special_transmutation',
        type: 'special',
        name: 'Element Transmutation',
        element: null,
        icon: 'refresh',
        price: 1500,
        description: 'Convert excess elements into essence.',
        owned: false,
        requiredLevel: 8
      }
    ];
  };
  
  // Render category tabs
  const renderCategoryTabs = () => (
    <div className="store-tabs">
      {categories.map(category => (
        <button 
          key={category.id}
          className={`tab-button ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => {
            setActiveCategory(category.id);
            setSelectedItem(null);
          }}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
  
  // Render item grid
  const renderItemGrid = () => {
    const items = getCategoryItems();
    
    return (
      <div className="store-grid">
        {items.map(item => {
          // Determine if item is available (can afford and meets level requirements)
          const isAvailable = canAfford(item.price) && playerLevel >= item.requiredLevel;
          const isLocked = playerLevel < item.requiredLevel;
          
          return (
            <div 
              key={item.id}
              className={`store-item ${selectedItem?.id === item.id ? 'selected' : ''} ${isLocked ? 'locked' : ''} ${item.owned ? 'owned' : ''}`}
              onClick={() => !isLocked && setSelectedItem(item)}
            >
              {/* Element icon or special icon */}
              {item.element ? (
                <div 
                  className="item-icon"
                  style={{ backgroundColor: elementColors[item.element] }}
                >
                  {item.type === 'upgrade' ? '↑' : ''}
                </div>
              ) : (
                <div className="item-icon special">
                  {renderSpecialIcon(item.icon)}
                </div>
              )}
              
              <div className="item-details">
                <div className="item-name">{item.name}</div>
                <div className="item-price">
                  <span className={canAfford(item.price) ? 'affordable' : 'expensive'}>
                    {item.price} Essence
                  </span>
                </div>
              </div>
              
              {isLocked && (
                <div className="item-lock">
                  <div className="lock-icon">🔒</div>
                  <div className="lock-level">Level {item.requiredLevel}</div>
                </div>
              )}
              
              {item.owned && (
                <div className="owned-badge">Owned</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render icon for special items
  const renderSpecialIcon = (iconName) => {
    switch (iconName) {
      case 'backpack':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V8M20 8C20 6.89543 19.1046 6 18 6H6C4.89543 6 4 6.89543 4 8M20 8H4M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M12 12V16M15 14H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      case 'chain':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13C11.1046 13 12 12.1046 12 11V9C12 7.89543 11.1046 7 10 7H8C6.89543 7 6 7.89543 6 9V11C6 12.1046 6.89543 13 8 13M10 13C8.89543 13 8 13.8954 8 15V17C8 18.1046 8.89543 19 10 19H12C13.1046 19 14 18.1046 14 17V15C14 13.8954 13.1046 13 12 13M10 13H12M16 13C17.1046 13 18 12.1046 18 11V9C18 7.89543 17.1046 7 16 7H14C12.8954 7 12 7.89543 12 9V11C12 12.1046 12.8954 13 14 13M16 13C14.8954 13 14 13.8954 14 15V17C14 18.1046 14.8954 19 16 19H18C19.1046 19 20 18.1046 20 17V15C20 13.8954 19.1046 13 18 13M16 13H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      case 'star':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      case 'refresh':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3M3 12C3 7.02944 7.02944 3 12 3M3 12H1M12 3V1M21 12H19M19 5L21 3M5 19L3 21M19 19L21 21M5 5L3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      default:
        return null;
    }
  };
  
  // Render item details
  const renderItemDetails = () => {
    if (!selectedItem) return null;
    
    return (
      <div className="item-details-panel">
        <h3>{selectedItem.name}</h3>
        
        {selectedItem.element ? (
          <ElementCard
            element={selectedItem.element}
            size="medium"
            showDetails={true}
          />
        ) : (
          <div className="special-item-icon">
            {renderSpecialIcon(selectedItem.icon)}
          </div>
        )}
        
        <p className="item-description">
          {selectedItem.description}
        </p>
        
        {selectedItem.requiredLevel > playerLevel && (
          <div className="level-requirement">
            <span className="requirement-icon">🔒</span>
            <span>Requires Player Level {selectedItem.requiredLevel}</span>
          </div>
        )}
        
        <div className="purchase-section">
          <div className="item-price">
            <span className="price-label">Price:</span>
            <span className={`price-value ${canAfford(selectedItem.price) ? 'affordable' : 'expensive'}`}>
              {selectedItem.price} Essence
            </span>
          </div>
          
          <button 
            className="purchase-button"
            disabled={!canAfford(selectedItem.price) || selectedItem.owned || selectedItem.requiredLevel > playerLevel}
            onClick={() => handlePurchase(selectedItem)}
          >
            {selectedItem.owned 
              ? 'Owned' 
              : !canAfford(selectedItem.price)
                ? 'Not Enough Essence'
                : selectedItem.requiredLevel > playerLevel
                  ? `Requires Level ${selectedItem.requiredLevel}`
                  : 'Purchase'}
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="element-store-overlay">
      <animated.div 
        className="element-store"
        style={storeAnimation}
      >
        <div className="store-header">
          <h2>Element Emporium</h2>
          <div className="player-resources">
            <div className="essence-display">
              <div className="essence-icon"></div>
              <span>{playerEssence} Essence</span>
            </div>
            <div className="level-display">
              <span>Level {playerLevel}</span>
            </div>
          </div>
          <button 
            className="close-button"
            onClick={onClose}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="store-content">
          <div className="store-sidebar">
            {renderCategoryTabs()}
            {renderItemGrid()}
          </div>
          
          <div className="store-details">
            {renderItemDetails()}
          </div>
        </div>
      </animated.div>
    </div>
  );
};

export default ElementStore;