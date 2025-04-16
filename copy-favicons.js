const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'public', 'favicon_io');
const targetDir = path.join(__dirname, 'public');

// List of files to copy
const files = [
  'apple-touch-icon.png',
  'favicon-32x32.png',
  'favicon-16x16.png',
  'site.webmanifest',
  'favicon.ico'
];

// Copy each file
files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  try {
    // Read the file from the source
    const data = fs.readFileSync(sourcePath);
    
    // Write it to the target
    fs.writeFileSync(targetPath, data);
    
    console.log(`Successfully copied: ${file}`);
  } catch (error) {
    console.error(`Error copying ${file}: ${error.message}`);
  }
});

console.log('All done!');
