#!/usr/bin/env node

/**
 * Render Build Script for Memorix Frontend
 * 
 * This script is designed to handle the build process for 
 * deploying the Memorix frontend on Render.
 * It includes optimizations and fallbacks to prevent timeout issues.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

console.log('Starting Render build process...');

// Function to execute a command with a timeout
function executeWithTimeout(command, timeoutMs = 5 * 60 * 1000) {
  console.log(`Executing: ${command}`);
  
  // Run with a timer to prevent hanging in CI/CD
  const timer = setTimeout(() => {
    console.log(`Command timed out after ${timeoutMs / 1000} seconds. Continuing with next step...`);
  }, timeoutMs);
  
  try {
    execSync(command, { stdio: 'inherit' });
    clearTimeout(timer);
    return true;
  } catch (error) {
    clearTimeout(timer);
    console.error(`Command failed: ${error.message}`);
    return false;
  }
}

// Check for the dist directory
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Dist directory already exists. Removing for a clean build...');
  try {
    fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
  } catch (err) {
    console.log(`Warning: Could not remove dist directory: ${err.message}`);
  }
}

// Install dependencies
console.log('Installing dependencies...');
if (!executeWithTimeout('npm install --production=false --legacy-peer-deps')) {
  // Try with a more conservative approach if the initial install fails
  console.log('Retrying with a different install approach...');
  executeWithTimeout('npm install --no-optional --legacy-peer-deps');
}

// Check for critical dependencies
const criticalDeps = [
  'react', 'react-dom', 'react-router-dom', 'webpack', 
  'webpack-cli', 'babel-loader'
];

let missingDeps = [];
for (const dep of criticalDeps) {
  try {
    if (!fs.existsSync(path.join(__dirname, 'node_modules', dep))) {
      missingDeps.push(dep);
    }
  } catch (err) {
    missingDeps.push(dep);
  }
}

if (missingDeps.length > 0) {
  console.log(`Installing missing critical dependencies: ${missingDeps.join(', ')}`);
  executeWithTimeout(`npm install ${missingDeps.join(' ')} --legacy-peer-deps`);
}

// Run the build with a production flag
console.log('Building the application...');
const buildSuccessful = executeWithTimeout('npx webpack --mode production');

// Verify the build output
if (buildSuccessful && fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Build completed successfully!');
} else {
  console.error('Build process failed or output files are missing.');
  process.exit(1);
}

// Create a _redirects file for SPA routing
const redirects = `
# Redirect all routes to index.html for SPA routing
/*    /index.html   200
`;

fs.writeFileSync(path.join(__dirname, 'dist', '_redirects'), redirects);
console.log('Created _redirects file for proper SPA routing.');

console.log('Render build process completed.');
