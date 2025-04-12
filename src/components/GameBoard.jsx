/**
 * ElementCraft - Game Board Component
 * 
 * This component renders the main game grid where elements are placed.
 * It manages the visualization of cells, elements, and their interactions.
 * 
 * @module GameBoard
 * @author ElementCraft Team
 * @version 1.0.0
 */

import React, { useRef, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import Matter from 'matter-js';
import { elementColors, elementSymbols } from '../constants/elements';

const GameBoard = ({ board, onCellClick, selectedElement }) => {
  // Reference to the physics canvas for Matter.js
  const physicsRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Engine reference for Matter.js
  const engineRef = useRef(null);
  
  // Set up the physics engine for element interactions
  useEffect(() => {
    if (!physicsRef.current) return;
    
    // Initialize Matter.js modules
    const { Engine, Render, World, Bodies, Events } = Matter;
    
    // Create engine
    const engine = Engine.create({
      // Disable gravity by default - we'll apply it selectively
      gravity: { x: 0, y: 0 }
    });
    
    engineRef.current = engine;
    
    // Create renderer
    const render = Render.create({
      element: physicsRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width: board[0].length * 64, // Cell size + gap
        height: board.length * 64,    // Cell size + gap
        wireframes: false,
        background: 'transparent',
      }
    });
    
    // Create boundary walls
    const wallThickness = 20;
    const walls = [
      // Top
      Bodies.rectangle(
        render.options.width / 2, 
        -wallThickness / 2, 
        render.options.width, 
        wallThickness, 
        { isStatic: true }
      ),
      // Bottom
      Bodies.rectangle(
        render.options.width / 2, 
        render.options.height + wallThickness / 2, 
        render.options.width, 
        wallThickness, 
        { isStatic: true }
      ),
      // Left
      Bodies.rectangle(
        -wallThickness / 2, 
        render.options.height / 2, 
        wallThickness, 
        render.options.height, 
        { isStatic: true }
      ),
      // Right
      Bodies.rectangle(
        render.options.width + wallThickness / 2, 
        render.options.height / 2, 
        wallThickness, 
        render.options.height, 
        { isStatic: true }
      )
    ];
    
    // Add walls to world
    World.add(engine.world, walls);
    
    // Start the engine and renderer
    Engine.run(engine);
    Render.run(render);
    
    // Configure collision event handling
    Events.on(engine, 'collisionStart', (event) => {
      // Handle collisions between elements
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        // Skip collisions with walls
        if (!bodyA.element || !bodyB.element) return;
        
        // If we have two interacting elements, we can trigger reactions
        if (bodyA.element && bodyB.element) {
          // Example: Fire + Water = Steam
          if (
            (bodyA.element === 'fire' && bodyB.element === 'water') ||
            (bodyA.element === 'water' && bodyB.element === 'fire')
          ) {
            // Create a new steam particle
            const steamPos = {
              x: (bodyA.position.x + bodyB.position.x) / 2,
              y: (bodyA.position.y + bodyB.position.y) / 2
            };
            
            const steam = Bodies.circle(
              steamPos.x,
              steamPos.y,
              15,
              {
                element: 'steam',
                render: {
                  fillStyle: '#E0E0E0',
                  opacity: 0.7
                },
                frictionAir: 0.05,
                force: { x: 0, y: -0.01 } // Steam rises
              }
            );
            
            // Remove the original elements
            World.remove(engine.world, [bodyA, bodyB]);
            
            // Add the steam particle
            World.add(engine.world, steam);
          }
        }
      });
    });
    
    // Cleanup
    return () => {
      // Cancel animation frame and destroy engine
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);
      render.canvas.remove();
      render.canvas = null;
      render.context = null;
      render.textures = {};
    };
  }, []);
  
  // Update physics entities when board changes
  useEffect(() => {
    if (!engineRef.current) return;
    
    const { World, Bodies } = Matter;
    const engine = engineRef.current;
    
    // Remove all element bodies
    const bodies = engine.world.bodies.filter(body => body.element);
    World.remove(engine.world, bodies);
    
    // Add new bodies based on the board state
    const newBodies = [];
    
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell && cell.element) {
          const x = colIndex * 64 + 32; // Center of cell
          const y = rowIndex * 64 + 32; // Center of cell
          
          const elementBody = Bodies.circle(
            x,
            y,
            25, // Element radius
            {
              element: cell.element,
              render: {
                fillStyle: elementColors[cell.element],
                strokeStyle: '#FFFFFF',
                lineWidth: 2
              },
              // Elements have different physical properties
              restitution: cell.element === 'air' ? 0.8 : 0.4,
              friction: cell.element === 'earth' ? 0.8 : 0.1,
              density: cell.element === 'metal' ? 0.015 : 0.001,
              // Apply gravity selectively
              plugin: {
                attractors: [
                  // Water is affected by gravity
                  (bodyA, bodyB) => {
                    if (bodyA.element === 'water') {
                      return {
                        x: 0,
                        y: 0.001 * bodyA.mass * bodyB.mass
                      };
                    }
                    // Fire rises
                    if (bodyA.element === 'fire') {
                      return {
                        x: 0,
                        y: -0.0005 * bodyA.mass * bodyB.mass
                      };
                    }
                    return null;
                  }
                ]
              }
            }
          );
          
          newBodies.push(elementBody);
        }
      });
    });
    
    // Add the new bodies to the world
    World.add(engine.world, newBodies);
  }, [board]);
  
  // Generate animations for cells when they're updated
  const getCellAnimation = (cell, rowIndex, colIndex) => {
    return useSpring({
      from: { opacity: 0, transform: 'scale(0.8)' },
      to: { opacity: 1, transform: 'scale(1)' },
      config: { tension: 280, friction: 20 },
      delay: (rowIndex + colIndex) * 50 // Cascade effect
    });
  };
  
  // Render the game board grid
  return (
    <div className="game-board-container">
      {/* Grid for visual representation */}
      <div 
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${board[0].length}, var(--cell-size))`,
          gridTemplateRows: `repeat(${board.length}, var(--cell-size))`
        }}
      >
        {board.map((row, rowIndex) => 
          row.map((cell, colIndex) => {
            const animation = getCellAnimation(cell, rowIndex, colIndex);
            
            return (
              <animated.div
                key={`${rowIndex}-${colIndex}`}
                className={`game-cell ${cell ? 'occupied' : ''}`}
                style={animation}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {cell && (
                  <div 
                    className={`element element-${cell.element}`}
                    title={cell.element.charAt(0).toUpperCase() + cell.element.slice(1)}
                  >
                    {elementSymbols[cell.element]}
                  </div>
                )}
              </animated.div>
            );
          })
        )}
      </div>
      
      {/* Physics canvas for Matter.js */}
      <div 
        ref={physicsRef}
        className="physics-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // Don't interfere with clicks
          zIndex: -1, // Behind the grid
          opacity: 0.7 // Semi-transparent
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default GameBoard;