import fs from 'fs';
import path from 'path';

// Create a simple SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#4a90e2"/>
  <text x="256" y="256" font-family="Arial, sans-serif" font-size="200" fill="white" text-anchor="middle" dominant-baseline="middle">MCQ</text>
</svg>`;

// Create icons directory if it doesn't exist
const iconsDir = path.join('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG icon file
const svgPath = path.join(iconsDir, 'icon.svg');
fs.writeFileSync(svgPath, svgIcon);

console.log('Generated simple SVG icon');