/**
 * ElementCraft - Main Application Entry Point (Updated)
 * 
 * This file serves as the entry point for the ElementCraft game application.
 * It renders the main App component inside the DOM element with id 'root'.
 * 
 * @module Main
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';
import './styles/app.css';
import './styles/components.css';

// Initialize audio context when user interacts with the page
const initAudio = () => {
  // Create AudioContext for browser audio API
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  window.audioContext = new AudioContext();
  
  // Remove event listeners once audio is initialized
  document.removeEventListener('click', initAudio);
  document.removeEventListener('keydown', initAudio);
  document.removeEventListener('touchstart', initAudio);
};

// Add event listeners to initialize audio on user interaction
document.addEventListener('click', initAudio);
document.addEventListener('keydown', initAudio);
document.addEventListener('touchstart', initAudio);

// Create root element for React rendering
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);