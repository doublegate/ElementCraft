/**
 * Vite Configuration File
 * 
 * This configuration file sets up the Vite build system for the ElementCraft game.
 * It includes plugins for React support and defines paths for asset resolution.
 * 
 * @author ElementCraft Team
 * @version 1.0.0
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@utils': path.resolve(import.meta.dirname, './src/utils'),
      '@assets': path.resolve(import.meta.dirname, './public/assets'),
      '@styles': path.resolve(import.meta.dirname, './src/styles'),
      '@constants': path.resolve(import.meta.dirname, './src/constants'),
    },
  },
  // Optimize asset handling
  build: {
    // Target modern browsers for smaller bundle size
    target: 'es2020',
    // Chunk size optimization
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          // Split vendor code from app code
          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/') ||
            normalizedId.includes('/node_modules/matter-js/') ||
            normalizedId.includes('/node_modules/howler/')
          ) {
            return 'vendor';
          }
          // Split game engine from UI components
          if (
            normalizedId.includes('/src/utils/gameLogic') ||
            normalizedId.includes('/src/utils/interactions') ||
            normalizedId.includes('/src/utils/physics')
          ) {
            return 'game-engine';
          }
        }
      }
    }
  },
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    // Add compression for faster development experience
    compress: true,
  }
});