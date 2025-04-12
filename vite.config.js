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
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './public/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@constants': path.resolve(__dirname, './src/constants'),
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
        manualChunks: {
          // Split vendor code from app code
          'vendor': ['react', 'react-dom', 'matter-js', 'howler'],
          // Split game engine from UI components
          'game-engine': ['@utils/gameLogic', '@utils/interactions', '@utils/physics'],
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