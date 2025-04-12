/**
 * ElementCraft - Physics Utilities
 * 
 * This module provides physics-related utilities for the game,
 * handling element movement, collisions, and physical interactions.
 * 
 * @module physics
 * @author ElementCraft Team
 * @version 1.0.0
 */

import Matter from 'matter-js';
import { elementProperties } from '../constants/elements';

// Create physics engine instance
let engine = null;
let renderer = null;
let world = null;

/**
 * Initialize the physics engine
 * 
 * @param {HTMLElement} container - DOM element to render physics canvas in
 * @param {number} width - Width of the physics world
 * @param {number} height - Height of the physics world
 * @returns {Object} Matter.js engine and renderer instances
 */
export const initPhysics = (container, width, height) => {
  // Initialize Matter.js modules
  const Engine = Matter.Engine;
  const Render = Matter.Render;
  const World = Matter.World;
  
  // Create engine
  engine = Engine.create({
    // Enable timing for consistent updates
    timing: {
      timeScale: 1
    },
    // Customize gravity
    gravity: {
      x: 0,
      y: 0.5
    }
  });
  
  world = engine.world;
  
  // Create renderer
  renderer = Render.create({
    element: container,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: 'transparent',
      showAngleIndicator: false,
      showCollisions: false,
      showVelocity: false
    }
  });
  
  // Start the engine and renderer
  Engine.run(engine);
  Render.run(renderer);
  
  return { engine, renderer, world };
};

/**
 * Clean up physics engine resources
 */
export const cleanupPhysics = () => {
  if (renderer) {
    Matter.Render.stop(renderer);
    renderer.canvas.remove();
    renderer.canvas = null;
    renderer.context = null;
    renderer.textures = {};
    renderer = null;
  }
  
  if (engine) {
    Matter.Engine.clear(engine);
    engine = null;
  }
  
  world = null;
};

/**
 * Create a physics body for an element
 * 
 * @param {string} elementType - The type of element
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size of the element
 * @param {Object} options - Additional options
 * @returns {Object} Matter.js body
 */
export const createElementBody = (elementType, x, y, size, options = {}) => {
  const properties = elementProperties[elementType] || elementProperties.earth;
  
  // Body shape depends on element type
  let body;
  
  // Create the appropriate body based on element type
  switch (elementType) {
    case 'fire':
      // Fire is a collection of particles
      body = createFireBody(x, y, size, properties);
      break;
      
    case 'water':
      // Water is a soft body
      body = createWaterBody(x, y, size, properties);
      break;
      
    case 'earth':
    case 'metal':
    case 'wood':
    case 'crystal':
      // Solid elements are rectangles
      body = Matter.Bodies.rectangle(
        x, y, size, size,
        {
          ...getBaseProperties(elementType, properties),
          chamfer: { radius: 4 },
          ...options
        }
      );
      break;
      
    case 'air':
    case 'steam':
    case 'cloud':
    case 'plasma':
      // Gaseous elements are circles
      body = Matter.Bodies.circle(
        x, y, size / 2,
        {
          ...getBaseProperties(elementType, properties),
          ...options
        }
      );
      break;
      
    case 'lava':
    case 'sand':
      // Semi-fluid elements are soft bodies
      body = createSoftBody(x, y, size, properties, elementType);
      break;
      
    default:
      // Default to a simple circle
      body = Matter.Bodies.circle(
        x, y, size / 2,
        {
          ...getBaseProperties(elementType, properties),
          ...options
        }
      );
  }
  
  // Add element metadata to the body
  body.element = elementType;
  body.initialSize = size;
  
  return body;
};

/**
 * Create base physical properties for an element
 * 
 * @param {string} elementType - The type of element
 * @param {Object} properties - Element physical properties
 * @returns {Object} Base properties for Matter.js body
 */
const getBaseProperties = (elementType, properties) => {
  return {
    density: properties.density,
    frictionAir: properties.viscosity,
    restitution: properties.volatility,
    friction: 0.3,
    render: {
      fillStyle: getElementColor(elementType),
      strokeStyle: '#FFFFFF',
      lineWidth: 1
    },
    collisionFilter: {
      category: getCollisionCategory(elementType),
      mask: getCollisionMask(elementType)
    }
  };
};

/**
 * Create a fire element body (collection of particles)
 * 
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size of the element
 * @param {Object} properties - Physical properties
 * @returns {Object} Composite body for fire
 */
const createFireBody = (x, y, size, properties) => {
  const particleSize = size / 4;
  const particleCount = 5;
  const composite = Matter.Composite.create({ label: 'fire' });
  
  // Create a central particle
  const centralParticle = Matter.Bodies.circle(
    x, y, particleSize,
    {
      ...getBaseProperties('fire', properties),
      render: {
        fillStyle: '#ff6b6b',
        lineWidth: 0
      }
    }
  );
  
  Matter.Composite.add(composite, centralParticle);
  
  // Create surrounding particles
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 / particleCount) * i;
    const offsetX = Math.cos(angle) * (particleSize * 1.5);
    const offsetY = Math.sin(angle) * (particleSize * 1.5);
    
    const particle = Matter.Bodies.circle(
      x + offsetX, y + offsetY, particleSize * 0.7,
      {
        ...getBaseProperties('fire', properties),
        render: {
          fillStyle: '#ff9666',
          lineWidth: 0
        }
      }
    );
    
    // Add forces to make fire particles rise and flicker
    Matter.Body.applyForce(particle, particle.position, {
      x: (Math.random() - 0.5) * 0.001,
      y: -0.001
    });
    
    Matter.Composite.add(composite, particle);
    
    // Add constraints to keep particles together
    const constraint = Matter.Constraint.create({
      bodyA: centralParticle,
      bodyB: particle,
      stiffness: 0.1,
      damping: 0.1,
      length: particleSize * 2,
      render: {
        visible: false
      }
    });
    
    Matter.Composite.add(composite, constraint);
  }
  
  return composite;
};

/**
 * Create a water element body (soft body)
 * 
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size of the element
 * @param {Object} properties - Physical properties
 * @returns {Object} Composite body for water
 */
const createWaterBody = (x, y, size, properties) => {
  const particleSize = size / 5;
  const rows = 3;
  const cols = 3;
  const spacing = particleSize * 1.5;
  
  const composite = Matter.Composite.create({ label: 'water' });
  const particles = [];
  
  // Create particles in a grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (col - (cols - 1) / 2) * spacing;
      const offsetY = (row - (rows - 1) / 2) * spacing;
      
      const particle = Matter.Bodies.circle(
        x + offsetX, y + offsetY, particleSize,
        {
          ...getBaseProperties('water', properties),
          render: {
            fillStyle: '#4fc3f7',
            lineWidth: 0
          }
        }
      );
      
      particles.push(particle);
      Matter.Composite.add(composite, particle);
    }
  }
  
  // Connect particles with constraints to create a soft body
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const distance = Matter.Vector.magnitude(
        Matter.Vector.sub(particles[i].position, particles[j].position)
      );
      
      if (distance < spacing * 2) {
        const constraint = Matter.Constraint.create({
          bodyA: particles[i],
          bodyB: particles[j],
          stiffness: 0.05,
          damping: 0.1,
          length: distance,
          render: {
            visible: false
          }
        });
        
        Matter.Composite.add(composite, constraint);
      }
    }
  }
  
  return composite;
};

/**
 * Create a soft body for semi-fluid elements
 * 
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Size of the element
 * @param {Object} properties - Physical properties
 * @param {string} elementType - Type of element
 * @returns {Object} Composite body
 */
const createSoftBody = (x, y, size, properties, elementType) => {
  // Similar to water body but with different properties
  const particleSize = size / 4;
  const rows = 2;
  const cols = 2;
  const spacing = particleSize * 1.5;
  
  const composite = Matter.Composite.create({ label: elementType });
  const particles = [];
  
  // Create particles in a grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = (col - (cols - 1) / 2) * spacing;
      const offsetY = (row - (rows - 1) / 2) * spacing;
      
      const particle = Matter.Bodies.circle(
        x + offsetX, y + offsetY, particleSize,
        {
          ...getBaseProperties(elementType, properties),
          render: {
            fillStyle: getElementColor(elementType),
            lineWidth: 0
          }
        }
      );
      
      particles.push(particle);
      Matter.Composite.add(composite, particle);
    }
  }
  
  // Connect particles with constraints
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const distance = Matter.Vector.magnitude(
        Matter.Vector.sub(particles[i].position, particles[j].position)
      );
      
      if (distance < spacing * 2) {
        const constraint = Matter.Constraint.create({
          bodyA: particles[i],
          bodyB: particles[j],
          stiffness: elementType === 'lava' ? 0.2 : 0.1,
          damping: elementType === 'lava' ? 0.05 : 0.2,
          length: distance,
          render: {
            visible: false
          }
        });
        
        Matter.Composite.add(composite, constraint);
      }
    }
  }
  
  return composite;
};

/**
 * Get element color for rendering
 * 
 * @param {string} elementType - Type of element
 * @returns {string} CSS color
 */
const getElementColor = (elementType) => {
  const colors = {
    fire: '#ff6b6b',
    water: '#4fc3f7',
    earth: '#66bb6a',
    air: '#e0e0e0',
    metal: '#b0bec5',
    wood: '#8d6e63',
    crystal: '#8d4e85',
    steam: '#c8e6c9',
    cloud: '#d4f1f9',
    lava: '#ff7043',
    sand: '#fff176',
    plasma: '#ba68c8'
  };
  
  return colors[elementType] || colors.earth;
};

/**
 * Get collision category for an element
 * 
 * @param {string} elementType - Type of element
 * @returns {number} Collision category bitfield
 */
const getCollisionCategory = (elementType) => {
  // Bit categories for element collision filtering
  const categories = {
    fire: 0x0001,
    water: 0x0002,
    earth: 0x0004,
    air: 0x0008,
    metal: 0x0010,
    wood: 0x0020,
    crystal: 0x0040,
    steam: 0x0080,
    cloud: 0x0100,
    lava: 0x0200,
    sand: 0x0400,
    plasma: 0x0800
  };
  
  return categories[elementType] || 0x0001;
};

/**
 * Get collision mask for an element
 * 
 * @param {string} elementType - Type of element
 * @returns {number} Collision mask bitfield
 */
const getCollisionMask = (elementType) => {
  // Some elements don't collide with others
  const categories = {
    fire: 0x0001,
    water: 0x0002,
    earth: 0x0004,
    air: 0x0008,
    metal: 0x0010,
    wood: 0x0020,
    crystal: 0x0040,
    steam: 0x0080,
    cloud: 0x0100,
    lava: 0x0200,
    sand: 0x0400,
    plasma: 0x0800
  };
  
  // Default is collide with everything
  let mask = 0xFFFF;
  
  // Customize collision masks based on element type
  switch (elementType) {
    case 'fire':
      // Fire doesn't collide with steam, plasma, or air
      mask = 0xFFFF & ~(categories.steam | categories.plasma | categories.air);
      break;
    
    case 'air':
    case 'steam':
    case 'cloud':
      // Gaseous elements don't collide with each other
      mask = 0xFFFF & ~(categories.air | categories.steam | categories.cloud);
      break;
      
    case 'water':
    case 'lava':
      // Fluid elements have partial collision with each other
      mask = 0xFFFF;
      break;
      
    default:
      mask = 0xFFFF;
  }
  
  return mask;
};

/**
 * Add a body to the physics world
 * 
 * @param {Object} body - Matter.js body
 */
export const addToWorld = (body) => {
  if (world) {
    Matter.World.add(world, body);
  }
};

/**
 * Remove a body from the physics world
 * 
 * @param {Object} body - Matter.js body
 */
export const removeFromWorld = (body) => {
  if (world) {
    Matter.World.remove(world, body);
  }
};

/**
 * Apply temperature effects to elements
 * 
 * @param {Object} body - Matter.js body
 * @param {number} temperature - Temperature value
 */
export const applyTemperature = (body, temperature) => {
  if (!body || !body.element) return;
  
  // Different elements react differently to temperature
  switch (body.element) {
    case 'water':
      // Water freezes or evaporates
      if (temperature < -10) {
        // Transform to ice (not implemented)
        console.log('Water freezes');
      } else if (temperature > 100) {
        // Transform to steam
        body.element = 'steam';
        body.render.fillStyle = getElementColor('steam');
        
        // Make it rise
        Matter.Body.applyForce(body, body.position, {
          x: 0,
          y: -0.002
        });
      }
      break;
      
    case 'fire':
      // Fire intensity increases with temperature
      const scale = Math.min(1.5, 1 + (temperature - 20) / 100);
      Matter.Body.scale(body, scale, scale);
      
      // Increase force to make it rise faster
      Matter.Body.applyForce(body, body.position, {
        x: 0,
        y: -0.001 * scale
      });
      break;
      
    case 'wood':
      // Wood burns at high temperatures
      if (temperature > 300) {
        // 10% chance per update to ignite
        if (Math.random() < 0.1) {
          body.element = 'fire';
          body.render.fillStyle = getElementColor('fire');
        }
      }
      break;
      
    // Add other element temperature reactions as needed
  }
};

/**
 * Apply wind forces to elements
 * 
 * @param {Object} body - Matter.js body
 * @param {Object} wind - Wind vector {x, y}
 */
export const applyWind = (body, wind) => {
  if (!body || !body.element) return;
  
  // Different elements react differently to wind
  const windForce = {
    x: wind.x,
    y: wind.y
  };
  
  // Scale based on element type
  const windMultiplier = {
    fire: 1.5,
    water: 0.3,
    earth: 0.1,
    air: 2.0,
    metal: 0.05,
    wood: 0.4,
    crystal: 0.1,
    steam: 1.8,
    cloud: 1.5,
    lava: 0.2,
    sand: 0.7,
    plasma: 1.2
  };
  
  // Apply multiplier
  windForce.x *= windMultiplier[body.element] || 1;
  windForce.y *= windMultiplier[body.element] || 1;
  
  // Apply the force
  Matter.Body.applyForce(body, body.position, windForce);
};

/**
 * Create particles for visual effects
 * 
 * @param {string} elementType - Type of element
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} count - Number of particles
 * @returns {Array} Array of particle bodies
 */
export const createParticles = (elementType, x, y, count = 10) => {
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 4 + 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    
    const particle = Matter.Bodies.circle(
      x, y, size,
      {
        frictionAir: 0.05,
        render: {
          fillStyle: getElementColor(elementType),
          opacity: 0.7
        }
      }
    );
    
    // Set velocity
    Matter.Body.setVelocity(particle, {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    });
    
    // Add metadata for cleanup
    particle.isParticle = true;
    particle.lifespan = 60; // Frames until removal
    
    particles.push(particle);
    addToWorld(particle);
  }
  
  return particles;
};

/**
 * Update particles (reduce lifespan and remove expired ones)
 * 
 * @param {Array} particles - Array of particle bodies
 * @returns {Array} Updated particles array
 */
export const updateParticles = (particles) => {
  const updatedParticles = [];
  
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    
    // Reduce lifespan
    particle.lifespan--;
    
    // Update opacity based on lifespan
    particle.render.opacity = particle.lifespan / 60;
    
    // Remove expired particles
    if (particle.lifespan <= 0) {
      removeFromWorld(particle);
    } else {
      updatedParticles.push(particle);
    }
  }
  
  return updatedParticles;
};

/**
 * Apply gravity to elements
 * 
 * @param {Array} bodies - Array of physics bodies
 */
export const applyGravity = (bodies) => {
  for (const body of bodies) {
    if (!body.element) continue;
    
    // Get element properties
    const properties = elementProperties[body.element] || elementProperties.earth;
    
    // Apply gravity based on density
    const gravityForce = 0.001 * properties.density;
    
    // Some elements float upward
    const direction = properties.density < 0.5 ? -1 : 1;
    
    Matter.Body.applyForce(body, body.position, {
      x: 0,
      y: gravityForce * direction
    });
  }
};

/**
 * Get all bodies in the physics world
 * 
 * @returns {Array} Array of all bodies
 */
export const getAllBodies = () => {
  if (!world) return [];
  
  return Matter.Composite.allBodies(world);
};

/**
 * Set world gravity
 * 
 * @param {number} x - Gravity x component
 * @param {number} y - Gravity y component
 */
export const setGravity = (x, y) => {
  if (engine) {
    engine.gravity.x = x;
    engine.gravity.y = y;
  }
};

/**
 * Pause the physics simulation
 */
export const pausePhysics = () => {
  if (engine) {
    Matter.Engine.clear(engine);
  }
};

/**
 * Resume the physics simulation
 */
export const resumePhysics = () => {
  if (engine) {
    Matter.Engine.run(engine);
  }
};

/**
 * Resize the physics world
 * 
 * @param {number} width - New width
 * @param {number} height - New height
 */
export const resizeWorld = (width, height) => {
  if (renderer) {
    Matter.Render.setPixelRatio(renderer, window.devicePixelRatio);
    Matter.Render.setSize(renderer, width, height);
  }
};