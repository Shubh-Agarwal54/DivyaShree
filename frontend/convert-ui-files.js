import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uiDir = path.resolve(__dirname, 'src', 'components', 'ui');

console.log('UI Directory:', uiDir);
console.log('Directory exists:', fs.existsSync(uiDir));

// Get all .tsx files
const files = fs.readdirSync(uiDir).filter(file => file.endsWith('.tsx'));

console.log(`Found ${files.length} .tsx files to convert\n`);

files.forEach(file => {
  const tsxPath = path.join(uiDir, file);
  const jsxFile = file.replace('.tsx', '.jsx');
  const jsxPath = path.join(uiDir, jsxFile);
  
  try {
    // Read the TSX file content
    const content = fs.readFileSync(tsxPath, 'utf8');
    
    // Write to JSX file (no modifications needed - just copy)
    fs.writeFileSync(jsxPath, content, { encoding: 'utf8', flag: 'w' });
    
    console.log(`✓ Converted ${file} to ${jsxFile}`);
  } catch (error) {
    console.error(`✗ Failed to convert ${file}:`, error.message);
  }
});

console.log(`\nTotal files converted: ${files.length}`);
