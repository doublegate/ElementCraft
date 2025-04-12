/**
 * ElementCraft - Game Over Component
 * 
 * This component is displayed when the player completes all levels
 * or when the game ends. It shows the final score and statistics.
 * 
 * @module GameOver
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { elementColors } from '../constants/elements';

const GameOver = ({ score, level, onRestart }) => {
  // Reference to the canvas for confetti animation
  const canvasRef = useRef(null);
  
  // Animation for the modal
  const modalAnimation = useSpring({
    opacity: 1,
    transform: 'scale(1)',
    from: { opacity: 0, transform: 'scale(0.8)' },
    config: { tension: 280, friction: 20 }
  });
  
  // Animation for the score
  const scoreAnimation = useSpring({
    number: score,
    from: { number: 0 },
    config: { tension: 100, friction: 10 },
    delay: 500
  });
  
  // Animate confetti particles on mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    
    // Create elemental particles for confetti
    const particles = [];
    const elementColorsList = Object.values(elementColors);
    
    // Create 200 confetti particles
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height,
        size: Math.random() * 10 + 5,
        color: elementColorsList[Math.floor(Math.random() * elementColorsList.length)],
        speed: Math.random() * 5 + 2,
        angle: Math.random() * 2,
        spin: Math.random() * 0.2 - 0.1
      });
    }
    
    function animate() {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.angle += p.spin;
        p.y += p.speed;
        
        // Reset particles that go off screen
        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        
        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      
      requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      ctx.clearRect(0, 0, width, height);
    };
  }, []);
  
  // Calculate achievements based on score and level
  const achievements = [
    {
      title: "Element Master",
      description: "Completed all levels",
      achieved: level >= 10,
      icon: "🏆"
    },
    {
      title: "Combo Expert",
      description: "Created over 50 element combinations",
      achieved: score >= 5000,
      icon: "⚡"
    },
    {
      title: "Puzzle Solver",
      description: "Solved all word and logic puzzles",
      achieved: score >= 3000,
      icon: "🧩"
    },
    {
      title: "Architect",
      description: "Built complex structures",
      achieved: level >= 5,
      icon: "🏗️"
    },
    {
      title: "Scientist",
      description: "Discovered all element combinations",
      achieved: score >= 7500,
      icon: "🔬"
    }
  ];
  
  // Filter achieved achievements
  const achievedAchievements = achievements.filter(a => a.achieved);
  
  return (
    <div className="game-over-overlay">
      <canvas ref={canvasRef} className="confetti-canvas" />
      
      <animated.div 
        className="game-over-modal"
        style={modalAnimation}
      >
        <h2 className="game-over-title">Game Complete!</h2>
        
        <div className="final-score">
          <div className="score-label">Final Score</div>
          <animated.div className="score-value">
            {scoreAnimation.number.to(n => Math.floor(n))}
          </animated.div>
        </div>
        
        <div className="level-reached">
          <span>Level Reached:</span> <strong>{level}</strong>
        </div>
        
        {achievedAchievements.length > 0 && (
          <div className="achievements-section">
            <h3>Achievements</h3>
            <div className="achievements-list">
              {achievedAchievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="achievement-item"
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-details">
                    <div className="achievement-title">{achievement.title}</div>
                    <div className="achievement-description">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="stats-section">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{level}</div>
              <div className="stat-label">Levels Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{Math.floor(score / 100)}</div>
              <div className="stat-label">Elements Placed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{Math.floor(score / 500)}</div>
              <div className="stat-label">Combinations Created</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{Math.floor(achievedAchievements.length / achievements.length * 100)}%</div>
              <div className="stat-label">Completion</div>
            </div>
          </div>
        </div>
        
        <div className="game-over-actions">
          <button 
            className="restart-button"
            onClick={onRestart}
          >
            Play Again
          </button>
          
          <div className="share-section">
            <p>Share your score:</p>
            <div className="share-buttons">
              <button className="share-button twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3.01006C22.0424 3.68553 20.9821 4.20217 19.86 4.54006C19.2577 3.84757 18.4573 3.35675 17.567 3.13398C16.6767 2.91122 15.7395 2.96725 14.8821 3.29451C14.0247 3.62177 13.2884 4.20446 12.773 4.96377C12.2575 5.72309 11.9877 6.62239 12 7.54006V8.54006C10.2426 8.58562 8.50127 8.19587 6.93101 7.4055C5.36074 6.61513 4.01032 5.44869 3 4.01006C3 4.01006 -1 13.0101 8 17.0101C5.94053 18.408 3.48716 19.109 1 19.0101C10 24.0101 21 19.0101 21 7.51006C20.9991 7.23151 20.9723 6.95365 20.92 6.68006C21.9406 5.67355 22.6608 4.40277 23 3.01006Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="share-button facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="share-button copy">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </animated.div>
    </div>
  );
};

export default GameOver;