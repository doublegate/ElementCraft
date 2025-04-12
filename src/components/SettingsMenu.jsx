/**
 * ElementCraft - Settings Menu Component
 * 
 * This component provides a menu for adjusting game settings such as
 * sound volume, music volume, visual effects, difficulty, and more.
 * 
 * @module SettingsMenu
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

const SettingsMenu = ({ 
  settings, 
  onSettingsChange, 
  onClose,
  onReset
}) => {
  // Local state for settings
  const [localSettings, setLocalSettings] = useState(settings || {});
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings || {});
  }, [settings]);
  
  // Animation for settings panel
  const menuAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 280, friction: 24 }
  });
  
  // Tabs for different settings categories
  const tabs = [
    { id: 'audio', label: 'Audio', icon: 'volume' },
    { id: 'visual', label: 'Visual', icon: 'eye' },
    { id: 'gameplay', label: 'Gameplay', icon: 'gamepad' },
    { id: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
    { id: 'about', label: 'About', icon: 'info' }
  ];
  
  // Current active tab
  const [activeTab, setActiveTab] = useState('audio');
  
  // Handle setting changes
  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...localSettings,
      [key]: value
    };
    
    setLocalSettings(newSettings);
    
    // Call parent handler
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };
  
  // Handle save settings
  const handleSave = () => {
    if (onSettingsChange) {
      onSettingsChange(localSettings);
    }
    
    if (onClose) {
      onClose();
    }
  };
  
  // Handle reset settings
  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };
  
  // Render tabs
  const renderTabs = () => (
    <div className="settings-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {renderTabIcon(tab.icon)}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
  
  // Render tab icon
  const renderTabIcon = (icon) => {
    switch (icon) {
      case 'volume':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      case 'eye':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5C8.24261 5 5.43602 7.4404 3.76737 9.43934C2.51521 10.9394 2.51521 13.0606 3.76737 14.5607C5.43602 16.5596 8.24261 19 12 19C15.7574 19 18.564 16.5596 20.2326 14.5607C21.4848 13.0606 21.4848 10.9394 20.2326 9.43934C18.564 7.4404 15.7574 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      case 'gamepad':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12H10M8 10V14M15 13H15.01M18 11H18.01M6.5 20H17.5C18.8978 20 20.2794 19.4203 21.3033 18.3964C22.3271 17.3726 22.9067 15.991 22.9067 14.5933C22.9067 13.1956 22.3271 11.814 21.3033 10.7902C20.2794 9.76636 18.8978 9.18667 17.5 9.18667C17.5 7.69331 17.1049 6.22269 16.3449 4.91936C15.5849 3.61603 14.4868 2.52007 13.1624 1.74319C11.838 0.966312 10.3347 0.531798 8.80248 0.481897C7.27023 0.431997 5.7419 0.768502 4.36942 1.45897C2.99695 2.14943 1.83829 3.17364 1 4.42C2.27898 4.42 3.50503 4.91139 4.41193 5.78454C5.31883 6.65769 5.82667 7.84439 5.82667 9.08C2.77333 9.08 1 12.1467 1 14.5933C1 15.991 1.57969 17.3726 2.60355 18.3964C3.62741 19.4203 5.00899 20 6.5 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      case 'accessibility':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      case 'info':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
        
      default:
        return null;
    }
  };
  
  // Render audio settings
  const renderAudioSettings = () => (
    <div className="settings-section">
      <h3>Audio Settings</h3>
      
      <div className="setting-item">
        <label htmlFor="masterVolume">Master Volume</label>
        <div className="setting-control">
          <input
            id="masterVolume"
            type="range"
            min="0"
            max="100"
            value={localSettings.masterVolume !== undefined ? localSettings.masterVolume : 100}
            onChange={(e) => handleSettingChange('masterVolume', parseInt(e.target.value))}
          />
          <span className="setting-value">{localSettings.masterVolume !== undefined ? localSettings.masterVolume : 100}%</span>
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor="musicVolume">Music Volume</label>
        <div className="setting-control">
          <input
            id="musicVolume"
            type="range"
            min="0"
            max="100"
            value={localSettings.musicVolume !== undefined ? localSettings.musicVolume : 70}
            onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
          />
          <span className="setting-value">{localSettings.musicVolume !== undefined ? localSettings.musicVolume : 70}%</span>
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor="sfxVolume">Sound Effects Volume</label>
        <div className="setting-control">
          <input
            id="sfxVolume"
            type="range"
            min="0"
            max="100"
            value={localSettings.sfxVolume !== undefined ? localSettings.sfxVolume : 80}
            onChange={(e) => handleSettingChange('sfxVolume', parseInt(e.target.value))}
          />
          <span className="setting-value">{localSettings.sfxVolume !== undefined ? localSettings.sfxVolume : 80}%</span>
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor="ambienceVolume">Ambience Volume</label>
        <div className="setting-control">
          <input
            id="ambienceVolume"
            type="range"
            min="0"
            max="100"
            value={localSettings.ambienceVolume !== undefined ? localSettings.ambienceVolume : 50}
            onChange={(e) => handleSettingChange('ambienceVolume', parseInt(e.target.value))}
          />
          <span className="setting-value">{localSettings.ambienceVolume !== undefined ? localSettings.ambienceVolume : 50}%</span>
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="muteWhenInactive">Mute When Inactive</label>
        <div className="setting-control">
          <input
            id="muteWhenInactive"
            type="checkbox"
            checked={localSettings.muteWhenInactive !== undefined ? localSettings.muteWhenInactive : true}
            onChange={(e) => handleSettingChange('muteWhenInactive', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
  
  // Render visual settings
  const renderVisualSettings = () => (
    <div className="settings-section">
      <h3>Visual Settings</h3>
      
      <div className="setting-item">
        <label htmlFor="particleAmount">Particle Effects</label>
        <div className="setting-control">
          <select
            id="particleAmount"
            value={localSettings.particleAmount || 'medium'}
            onChange={(e) => handleSettingChange('particleAmount', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="very-high">Very High</option>
          </select>
        </div>
      </div>
      
      <div className="setting-item">
        <label htmlFor="animationSpeed">Animation Speed</label>
        <div className="setting-control">
          <select
            id="animationSpeed"
            value={localSettings.animationSpeed || 'normal'}
            onChange={(e) => handleSettingChange('animationSpeed', e.target.value)}
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="showFps">Show FPS Counter</label>
        <div className="setting-control">
          <input
            id="showFps"
            type="checkbox"
            checked={localSettings.showFps !== undefined ? localSettings.showFps : false}
            onChange={(e) => handleSettingChange('showFps', e.target.checked)}
          />
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="enableBloom">Enable Bloom Effects</label>
        <div className="setting-control">
          <input
            id="enableBloom"
            type="checkbox"
            checked={localSettings.enableBloom !== undefined ? localSettings.enableBloom : true}
            onChange={(e) => handleSettingChange('enableBloom', e.target.checked)}
          />
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="enableShadows">Enable Shadows</label>
        <div className="setting-control">
          <input
            id="enableShadows"
            type="checkbox"
            checked={localSettings.enableShadows !== undefined ? localSettings.enableShadows : true}
            onChange={(e) => handleSettingChange('enableShadows', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
  
  // Render gameplay settings
  const renderGameplaySettings = () => (
    <div className="settings-section">
      <h3>Gameplay Settings</h3>
      
      <div className="setting-item">
        <label htmlFor="difficulty">Difficulty</label>
        <div className="setting-control">
          <select
            id="difficulty"
            value={localSettings.difficulty || 'normal'}
            onChange={(e) => handleSettingChange('difficulty', e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="tutorialEnabled">Show Tutorials</label>
        <div className="setting-control">
          <input
            id="tutorialEnabled"
            type="checkbox"
            checked={localSettings.tutorialEnabled !== undefined ? localSettings.tutorialEnabled : true}
            onChange={(e) => handleSettingChange('tutorialEnabled', e.target.checked)}
          />
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="hintsEnabled">Show Hints</label>
        <div className="setting-control">
          <input
            id="hintsEnabled"
            type="checkbox"
            checked={localSettings.hintsEnabled !== undefined ? localSettings.hintsEnabled : true}
            onChange={(e) => handleSettingChange('hintsEnabled', e.target.checked)}
          />
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="autoSave">Auto-Save Game</label>
        <div className="setting-control">
          <input
            id="autoSave"
            type="checkbox"
            checked={localSettings.autoSave !== undefined ? localSettings.autoSave : true}
            onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
          />
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="confirmActions">Confirm Important Actions</label>
        <div className="setting-control">
          <input
            id="confirmActions"
            type="checkbox"
            checked={localSettings.confirmActions !== undefined ? localSettings.confirmActions : true}
            onChange={(e) => handleSettingChange('confirmActions', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
  
  // Render accessibility settings
  const renderAccessibilitySettings = () => (
    <div className="settings-section">
      <h3>Accessibility Settings</h3>
      
      <div className="setting-item">
        <label htmlFor="textSize">Text Size</label>
        <div className="setting-control">
          <select
            id="textSize"
            value={localSettings.textSize || 'medium'}
            onChange={(e) => handleSettingChange('textSize', e.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="x-large">Extra Large</option>
          </select>
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="highContrast">High Contrast Mode</label>
        <div className="setting-control">
          <input
            id="highContrast"
            type="checkbox"
            checked={localSettings.highContrast !== undefined ? localSettings.highContrast : false}
            onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
          />
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="reduceMotion">Reduce Motion</label>
        <div className="setting-control">
          <input
            id="reduceMotion"
            type="checkbox"
            checked={localSettings.reduceMotion !== undefined ? localSettings.reduceMotion : false}
            onChange={(e) => handleSettingChange('reduceMotion', e.target.checked)}
          />
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="screenReader">Screen Reader Support</label>
        <div className="setting-control">
          <input
            id="screenReader"
            type="checkbox"
            checked={localSettings.screenReader !== undefined ? localSettings.screenReader : false}
            onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
          />
        </div>
      </div>
      
      <div className="setting-item toggle">
        <label htmlFor="colorblindMode">Colorblind Mode</label>
        <div className="setting-control">
          <select
            id="colorblindMode"
            value={localSettings.colorblindMode || 'none'}
            onChange={(e) => handleSettingChange('colorblindMode', e.target.value)}
          >
            <option value="none">None</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
            <option value="achromatopsia">Achromatopsia</option>
          </select>
        </div>
      </div>
    </div>
  );
  
  // Render about section
  const renderAboutSection = () => (
    <div className="settings-section">
      <h3>About ElementCraft</h3>
      
      <div className="about-section">
        <div className="game-logo">
          <img src="/assets/images/logo.png" alt="ElementCraft Logo" />
        </div>
        
        <div className="game-info">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Created by:</strong> ElementCraft Team</p>
          <p><strong>Release Date:</strong> April, 2025</p>
        </div>
        
        <div className="game-description">
          <p>
            ElementCraft is a strategic puzzle game where you manipulate elemental
            tiles to solve challenges and create powerful combinations.
          </p>
          <p>
            Discover new elements, unlock special abilities, and master the art
            of elemental manipulation in this unique blend of puzzle solving,
            strategy, and creativity.
          </p>
        </div>
        
        <div className="credits">
          <h4>Credits</h4>
          <ul>
            <li><strong>Game Design:</strong> ElementCraft Team</li>
            <li><strong>Programming:</strong> ElementCraft Team</li>
            <li><strong>Art & Animation:</strong> ElementCraft Team</li>
            <li><strong>Sound & Music:</strong> ElementCraft Team</li>
            <li><strong>Special Thanks:</strong> To all our beta testers!</li>
          </ul>
        </div>
      </div>
    </div>
  );
  
  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'audio':
        return renderAudioSettings();
      case 'visual':
        return renderVisualSettings();
      case 'gameplay':
        return renderGameplaySettings();
      case 'accessibility':
        return renderAccessibilitySettings();
      case 'about':
        return renderAboutSection();
      default:
        return null;
    }
  };
  
  return (
    <div className="settings-menu-overlay">
      <animated.div 
        className="settings-menu"
        style={menuAnimation}
      >
        <div className="settings-header">
          <h2>Settings</h2>
          <button 
            className="close-button"
            onClick={onClose}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="settings-content">
          {renderTabs()}
          
          <div className="settings-panel">
            {renderTabContent()}
          </div>
        </div>
        
        <div className="settings-footer">
          <button 
            className="reset-button"
            onClick={handleReset}
          >
            Reset to Defaults
          </button>
          <button 
            className="save-button"
            onClick={handleSave}
          >
            Save & Close
          </button>
        </div>
      </animated.div>
    </div>
  );
};

export default SettingsMenu;