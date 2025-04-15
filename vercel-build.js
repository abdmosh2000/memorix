// Vercel build script for cross-platform compatibility
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.cyan}${colors.bold}======================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}     MEMORIX PRODUCTION BUILD         ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}======================================${colors.reset}\n`);

// Critical dependencies to check
const criticalDependencies = [
  '@babel/runtime',
  'react',
  'react-dom',
  'react-router-dom',
  'path-browserify',
  'stream-browserify',
  'buffer',
  'util'
];

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Check for missing dependencies
function checkDependencies() {
  console.log(`${colors.blue}Checking critical dependencies...${colors.reset}`);
  
  const missingDeps = [];
  
  for (const dep of criticalDependencies) {
    try {
      // Attempt to resolve the dependency
      const depPath = path.join(__dirname, 'node_modules', dep);
      if (!fs.existsSync(depPath)) {
        missingDeps.push(dep);
      }
    } catch (err) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    console.log(`${colors.yellow}Missing dependencies detected: ${missingDeps.join(', ')}${colors.reset}`);
    console.log(`${colors.blue}Attempting to install missing dependencies...${colors.reset}`);
    
    try {
      execSync(`npm install ${missingDeps.join(' ')} --legacy-peer-deps`, { stdio: 'inherit' });
      console.log(`${colors.green}Dependencies installed successfully.${colors.reset}\n`);
    } catch (installError) {
      console.error(`${colors.red}Failed to install dependencies: ${installError.message}${colors.reset}\n`);
      console.log(`${colors.yellow}Continuing with build anyway - this might cause issues...${colors.reset}\n`);
    }
  } else {
    console.log(`${colors.green}All critical dependencies are present.${colors.reset}\n`);
  }
}

// Run webpack build
function runBuild() {
  console.log(`${colors.blue}Starting Webpack build for production...${colors.reset}`);
  try {
    execSync('npx webpack --mode production', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}${colors.bold}Build failed with error:${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}\n`);
    return false;
  }
}

// Verify build output
function verifyBuild() {
  console.log(`${colors.blue}Verifying build output...${colors.reset}`);
  
  const outputDir = path.join(__dirname, 'dist');
  const bundleFile = path.join(outputDir, 'bundle.js');
  const htmlFile = path.join(outputDir, 'index.html');
  
  if (!fs.existsSync(outputDir)) {
    console.error(`${colors.red}Error: Output directory doesn't exist: ${outputDir}${colors.reset}`);
    return false;
  }
  
  if (!fs.existsSync(bundleFile)) {
    console.error(`${colors.red}Error: Bundle file not found: ${bundleFile}${colors.reset}`);
    return false;
  }
  
  if (!fs.existsSync(htmlFile)) {
    console.error(`${colors.red}Error: HTML file not found: ${htmlFile}${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}Build output verified successfully.${colors.reset}\n`);
  return true;
}

// Main build process
try {
  // Check dependencies
  checkDependencies();
  
  // Run the build
  const buildSuccessful = runBuild();
  if (!buildSuccessful) {
    process.exit(1);
  }
  
  // Verify output
  const verifySuccessful = verifyBuild();
  if (!verifySuccessful) {
    process.exit(1);
  }
  
  console.log(`${colors.green}${colors.bold}Build completed successfully!${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}${colors.bold}An unexpected error occurred:${colors.reset}`);
  console.error(`${colors.red}${error.message}${colors.reset}\n`);
  process.exit(1);
}
