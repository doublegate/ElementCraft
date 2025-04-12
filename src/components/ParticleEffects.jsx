/**
 * ElementCraft - Particle Effects Component
 * 
 * This component renders dynamic particle effects for visual feedback
 * during gameplay, such as element reactions, explosions, and ambience.
 * 
 * @module ParticleEffects
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { elementColors, elementParticles } from '../constants/elements';

// Particle class for individual particles
class Particle {
  constructor(x, y, size, color, velocity, lifetime, opacity = 1, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.velocity = velocity;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.opacity = opacity;
    this.shape = shape;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
  }
  
  update() {
    // Update position based on velocity
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // Apply gravity or other forces
    this.velocity.y += 0.03;
    
    // Apply drag
    this.velocity.x *= 0.99;
    this.velocity.y *= 0.99;
    
    // Update lifetime
    this.lifetime--;
    
    // Update opacity based on lifetime
    this.opacity = (this.lifetime / this.maxLifetime) * 0.9;
    
    // Update rotation
    this.rotation += this.rotationSpeed;
    
    // Update size (shrink as lifetime decreases)
    this.size *= 0.99;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Draw different shapes based on the shape property
    switch (this.shape) {
      case 'square':
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(this.size / 2, 0);
        ctx.lineTo(0, this.size / 2);
        ctx.lineTo(-this.size / 2, 0);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'star':
        const outerRadius = this.size / 2;
        const innerRadius = outerRadius / 2;
        const spikes = 5;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * 2 * i) / (spikes * 2);
          const x = radius * Math.sin(angle);
          const y = -radius * Math.cos(angle);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'circle':
      default:
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }
  
  isAlive() {
    return this.lifetime > 0 && this.opacity > 0.01;
  }
}

const ParticleEffects = ({ 
  effect = 'ambient',
  element = null,
  position = { x: null, y: null },
  amount = 'medium',
  autoPlay = true,
  loop = false,
  duration = 1000,
  onComplete = null
}) => {
  // Canvas reference
  const canvasRef = useRef(null);
  
  // Animation frame reference
  const animationRef = useRef(null);
  
  // Particles array
  const particles = useRef([]);
  
  // Track if animation is running
  const [isRunning, setIsRunning] = useState(autoPlay);
  
  // Setup and cleanup effect
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Start animation if autoPlay is true
    if (autoPlay) {
      play();
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Effect for when effect type or element changes
  useEffect(() => {
    if (isRunning) {
      // Reset and restart the effect
      particles.current = [];
      play();
    }
  }, [effect, element]);
  
  // Generate particles based on effect type
  const generateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Particle count based on amount
    let count;
    switch (amount) {
      case 'low':
        count = 10;
        break;
      case 'high':
        count = 50;
        break;
      case 'very-high':
        count = 100;
        break;
      case 'medium':
      default:
        count = 25;
        break;
    }
    
    // Get particle settings for specific element
    let particleSettings = {};
    if (element && elementParticles[element]) {
      particleSettings = elementParticles[element];
      count = particleSettings.count || count;
    }
    
    // Default color based on element
    const defaultColor = element ? elementColors[element] : '#4fc3f7';
    
    // Spawn position
    let spawnX = position.x !== null ? position.x : width / 2;
    let spawnY = position.y !== null ? position.y : height / 2;
    
    // Different effects have different particle behaviors
    switch (effect) {
      case 'explosion':
        // Explosion effect - particles fly outward from center
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 2;
          const size = Math.random() * 
            (particleSettings.size?.max || 10) + 
            (particleSettings.size?.min || 3);
          
          const color = particleSettings.color || defaultColor;
          
          const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
          };
          
          const lifetime = Math.random() * 
            (particleSettings.lifetime?.max || 80) + 
            (particleSettings.lifetime?.min || 40);
          
          // Choose a random shape for variety
          const shapes = ['circle', 'square', 'triangle', 'diamond', 'star'];
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          
          particles.current.push(
            new Particle(spawnX, spawnY, size, color, velocity, lifetime, 1, shape)
          );
        }
        break;
        
      case 'reaction':
        // Element reaction effect - more concentrated, with color transitions
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 1;
          const size = Math.random() * 
            (particleSettings.size?.max || 8) + 
            (particleSettings.size?.min || 2);
          
          // For reactions, we can have multiple colors
          const colors = [
            particleSettings.color || defaultColor,
            particleSettings.secondaryColor || '#ffffff'
          ];
          const color = colors[Math.floor(Math.random() * colors.length)];
          
          const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
          };
          
          const lifetime = Math.random() * 
            (particleSettings.lifetime?.max || 100) + 
            (particleSettings.lifetime?.min || 60);
          
          particles.current.push(
            new Particle(spawnX, spawnY, size, color, velocity, lifetime)
          );
        }
        break;
        
      case 'flow':
        // Flowing effect - particles follow a directional pattern
        const direction = Math.random() > 0.5 ? 1 : -1;
        for (let i = 0; i < count; i++) {
          const offset = (Math.random() - 0.5) * 100;
          const speed = Math.random() * 2 + 0.5;
          const size = Math.random() * 
            (particleSettings.size?.max || 6) + 
            (particleSettings.size?.min || 2);
          
          const color = particleSettings.color || defaultColor;
          
          const velocity = {
            x: direction * speed,
            y: (Math.random() - 0.5) * 0.5
          };
          
          const lifetime = Math.random() * 
            (particleSettings.lifetime?.max || 150) + 
            (particleSettings.lifetime?.min || 80);
          
          particles.current.push(
            new Particle(
              spawnX + offset, 
              spawnY + offset, 
              size, 
              color, 
              velocity, 
              lifetime, 
              Math.random() * 0.5 + 0.5
            )
          );
        }
        break;
        
      case 'ambient':
      default:
        // Ambient effect - particles float gently around the canvas
        for (let i = 0; i < count; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 
            (particleSettings.size?.max || 5) + 
            (particleSettings.size?.min || 1);
          
          const color = particleSettings.color || defaultColor;
          
          const velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5
          };
          
          const lifetime = Math.random() * 
            (particleSettings.lifetime?.max || 200) + 
            (particleSettings.lifetime?.min || 100);
          
          particles.current.push(
            new Particle(x, y, size, color, velocity, lifetime, Math.random() * 0.7 + 0.3)
          );
        }
        break;
    }
  };
  
  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.current = particles.current.filter(particle => {
      particle.update();
      particle.draw(ctx);
      return particle.isAlive();
    });
    
    // If all particles are gone and loop is true, generate new ones
    if (particles.current.length === 0) {
      if (loop) {
        generateParticles();
      } else {
        setIsRunning(false);
        if (onComplete) onComplete();
        return;
      }
    }
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Play the effect
  const play = () => {
    // Reset particles
    particles.current = [];
    
    // Generate new particles
    generateParticles();
    
    // Start animation
    setIsRunning(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
    
    // Set timeout if duration is provided
    if (!loop && duration > 0) {
      setTimeout(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          setIsRunning(false);
          if (onComplete) onComplete();
        }
      }, duration);
    }
  };
  
  // Stop the effect
  const stop = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsRunning(false);
    }
  };
  
  // Expose play and stop methods to parent component
  React.useImperativeHandle(React.ref, () => ({
    play,
    stop
  }));
  
  return (
    <canvas 
      ref={canvasRef}
      className={`particle-effects ${effect} ${element || ''}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Don't capture mouse events
        zIndex: 10 // Above game board but below UI
      }}
    />
  );
};

// Preset configurations for common effects
ParticleEffects.ElementReaction = ({ element, position, ...props }) => (
  <ParticleEffects
    effect="reaction"
    element={element}
    position={position}
    amount="medium"
    loop={false}
    duration={1000}
    {...props}
  />
);

ParticleEffects.ElementAmbient = ({ element, ...props }) => (
  <ParticleEffects
    effect="ambient"
    element={element}
    amount="low"
    loop={true}
    {...props}
  />
);

ParticleEffects.Explosion = ({ position, ...props }) => (
  <ParticleEffects
    effect="explosion"
    position={position}
    amount="high"
    loop={false}
    duration={1500}
    {...props}
  />
);

ParticleEffects.Achievement = ({ position = { x: null, y: null }, ...props }) => (
  <ParticleEffects
    effect="explosion"
    element="crystal"
    position={position}
    amount="very-high"
    loop={false}
    duration={2000}
    {...props}
  />
);

export default ParticleEffects;