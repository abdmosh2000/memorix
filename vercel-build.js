// Vercel build script for cross-platform compatibility

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// Run the webpack build
const { execSync } = require('child_process');
try {
  console.log('Starting Webpack build for production...');
  execSync('npx webpack --mode production', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
}
