#!/usr/bin/env node

/**
 * Dependency Fix Script for Memorix Frontend
 * 
 * This script:
 * 1. Clears npm cache
 * 2. Removes node_modules directory and package-lock.json
 * 3. Reinstalls dependencies with legacy peer deps support
 * 4. Verifies critical dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Console colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.cyan}${colors.bold}====================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold} MEMORIX DEPENDENCY FIX UTILITY     ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}====================================${colors.reset}\n`);

const criticalDependencies = [
  '@babel/runtime',
  '@remix-run/router',
  'ansi-html-community',
  'react',
  'react-dom',
  'react-router-dom'
];

// Run a command with error handling
function runCommand(command, message) {
  console.log(`${colors.blue}> ${message}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Done!${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed: ${error.message}${colors.reset}\n`);
    return false;
  }
}

// Check if a dependency exists in node_modules
function checkDependency(dependency) {
  const dependencyPath = path.join(__dirname, 'node_modules', dependency);
  return fs.existsSync(dependencyPath);
}

// Main execution
async function main() {
  // Step 1: Clear npm cache
  runCommand('npm cache clean --force', 'Cleaning npm cache');

  // Step 2: Remove node_modules and package-lock.json
  console.log(`${colors.blue}> Removing node_modules and package-lock.json...${colors.reset}`);
  try {
    if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
      fs.rmSync(path.join(__dirname, 'node_modules'), { recursive: true, force: true });
    }
    if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
      fs.unlinkSync(path.join(__dirname, 'package-lock.json'));
    }
    console.log(`${colors.green}✓ Done!${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed: ${error.message}${colors.reset}\n`);
  }

  // Step 3: Reinstall dependencies
  const installSuccess = runCommand('npm install --legacy-peer-deps', 'Reinstalling dependencies');
  
  if (!installSuccess) {
    console.error(`${colors.red}${colors.bold}Failed to reinstall dependencies. Try running manually: npm install --legacy-peer-deps${colors.reset}\n`);
    process.exit(1);
  }

  // Step 4: Verify critical dependencies
  console.log(`${colors.blue}> Verifying critical dependencies...${colors.reset}`);
  
  const missingDependencies = [];
  
  for (const dependency of criticalDependencies) {
    if (!checkDependency(dependency)) {
      missingDependencies.push(dependency);
    }
  }
  
  if (missingDependencies.length > 0) {
    console.warn(`${colors.yellow}⚠ Some dependencies are still missing: ${missingDependencies.join(', ')}${colors.reset}`);
    
    // Try installing specific missing packages
    console.log(`${colors.blue}> Attempting to install missing dependencies individually...${colors.reset}`);
    
    for (const dependency of missingDependencies) {
      runCommand(`npm install ${dependency} --legacy-peer-deps --no-save`, `Installing ${dependency}`);
    }
    
    // Re-verify
    const stillMissing = missingDependencies.filter(dep => !checkDependency(dep));
    
    if (stillMissing.length > 0) {
      console.error(`${colors.red}✗ Failed to install: ${stillMissing.join(', ')}${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ All dependencies are now installed!${colors.reset}\n`);
    }
  } else {
    console.log(`${colors.green}✓ All dependencies are properly installed!${colors.reset}\n`);
  }
  
  console.log(`${colors.green}${colors.bold}Dependency fix process completed!${colors.reset}`);
  console.log(`${colors.cyan}You can now try building the frontend:${colors.reset}`);
  console.log(`${colors.blue}npm run build${colors.reset}\n`);
}

main().catch(error => {
  console.error(`${colors.red}${colors.bold}An error occurred:${colors.reset}`);
  console.error(`${colors.red}${error.message}${colors.reset}\n`);
  process.exit(1);
});
