#!/usr/bin/env node

/**
 * Pre-deployment Script for Memorix Frontend
 * 
 * This script:
 * 1. Builds the frontend locally
 * 2. Prepares all necessary files for deployment to Render
 * 3. Creates a deployment-ready archive
 * 
 * Running this script before deploying to Render can help prevent
 * timeout issues during the build process.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

console.log(`${colors.cyan}${colors.bold}=======================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}  MEMORIX PRE-DEPLOYMENT BUILD SCRIPT  ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}=======================================${colors.reset}\n`);

// Function to execute commands safely
function execCommand(command, description) {
  console.log(`${colors.blue}${description}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Done!${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed: ${error.message}${colors.reset}\n`);
    return false;
  }
}

// Check and create a deployment directory
const deployDir = path.join(__dirname, 'deployment');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
}

// Clean up any previous build
console.log(`${colors.blue}Cleaning up previous builds...${colors.reset}`);
try {
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
  }
  if (fs.existsSync(path.join(deployDir, 'memorix-frontend.zip'))) {
    fs.unlinkSync(path.join(deployDir, 'memorix-frontend.zip'));
  }
  console.log(`${colors.green}✓ Done!${colors.reset}\n`);
} catch (err) {
  console.log(`${colors.yellow}Warning: ${err.message}${colors.reset}\n`);
}

// Install dependencies
if (!execCommand('npm install --legacy-peer-deps', 'Installing dependencies')) {
  console.error(`${colors.red}${colors.bold}Failed to install dependencies. Aborting.${colors.reset}\n`);
  process.exit(1);
}

// Run the build process
if (!execCommand('npm run render-build', 'Building the frontend')) {
  console.error(`${colors.red}${colors.bold}Build process failed. Aborting.${colors.reset}\n`);
  process.exit(1);
}

// Verify the build output
console.log(`${colors.blue}Verifying build output...${colors.reset}`);
if (!fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
  console.error(`${colors.red}${colors.bold}Build verification failed: index.html not found in dist directory.${colors.reset}\n`);
  process.exit(1);
}

// Create an archive of the dist directory
const zipCommand = os.platform() === 'win32'
  ? `powershell -command "Compress-Archive -Path '${path.join(__dirname, 'dist')}/*' -DestinationPath '${path.join(deployDir, 'memorix-frontend.zip')}' -Force"`
  : `cd "${path.join(__dirname, 'dist')}" && zip -r "${path.join(deployDir, 'memorix-frontend.zip')}" *`;

if (!execCommand(zipCommand, 'Creating deployment archive')) {
  console.log(`${colors.yellow}Warning: Failed to create zip archive. You can still deploy the dist directory.${colors.reset}\n`);
}

// Copy essential files for deployment
console.log(`${colors.blue}Copying deployment configuration files...${colors.reset}`);
const filesToCopy = [
  'package.json',
  '.nvmrc',
  'render.yaml',
  'render-build.js'
];

for (const file of filesToCopy) {
  try {
    fs.copyFileSync(
      path.join(__dirname, file),
      path.join(deployDir, file)
    );
  } catch (err) {
    console.log(`${colors.yellow}Warning: Could not copy ${file}: ${err.message}${colors.reset}`);
  }
}
console.log(`${colors.green}✓ Done!${colors.reset}\n`);

// Create a README file for the deployment
const readmeContent = `# Memorix Frontend Deployment Package

This directory contains all the files needed to deploy the Memorix frontend to Render.

## Files

- \`memorix-frontend.zip\`: Pre-built frontend application (extract to \`dist\` directory)
- \`package.json\`: Project dependencies and scripts
- \`.nvmrc\`: Node.js version specification
- \`render.yaml\`: Render configuration
- \`render-build.js\`: Custom build script for Render

## Manual Deployment Instructions

1. Upload these files to your Git repository or directly to Render
2. If using the pre-built files, extract \`memorix-frontend.zip\` to a \`dist\` directory
3. Deploy on Render following the instructions in RENDER_DEPLOYMENT.md

## Environment Variables

Make sure to set these environment variables in your Render deployment:

- \`NODE_ENV\`: \`production\`
- \`REACT_APP_API_URL\`: URL to your backend API (e.g., \`https://memorix-api.onrender.com/api\`)

For more detailed instructions, refer to the RENDER_DEPLOYMENT.md file in the project.
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), readmeContent);
console.log(`${colors.green}Created deployment README${colors.reset}\n`);

// Final message
console.log(`${colors.green}${colors.bold}Pre-deployment build completed!${colors.reset}`);
console.log(`${colors.cyan}Deployment files are available in the 'deployment' directory.${colors.reset}`);
console.log(`${colors.cyan}You can now:${colors.reset}`);
console.log(`${colors.cyan}1. Manually upload these files to Render${colors.reset}`);
console.log(`${colors.cyan}2. Deploy to Render following the instructions in RENDER_DEPLOYMENT.md${colors.reset}`);
console.log(`${colors.cyan}3. Or extract the zip file and upload the pre-built files to any static host${colors.reset}\n`);
