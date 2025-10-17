#!/usr/bin/env node --experimental-strip-types

// Test the PictureGrid regex patterns

const testLines = [
  // Standard format: alt at the end
  `  { src: imageModules['./files/IMG_4584.jpg'], alt: ""},`,
  
  // With properties before alt
  `  { src: imageModules['./files/IMG_4597.jpg'], colSpan:4, rowSpan:2, alt: ""},`,
  
  // With existing alt text
  `  { src: imageModules['./files/IMG_4606.jpg'], alt: "Existing alt text"},`,
  
  // With properties and existing alt
  `  { src: imageModules['./files/IMG_4607.jpg'], colSpan:3, alt: "Champ verdoyant"},`,
];

// Detection regex
const pictureGridRegex = /\{\s*src:\s*imageModules\['([^']+)'\][^}]*\balt:\s*["']([^"']*)["']/g;

console.log('=== DETECTION TEST ===\n');
testLines.forEach((line, i) => {
  console.log(`Line ${i + 1}: ${line}`);
  const match = pictureGridRegex.exec(line);
  pictureGridRegex.lastIndex = 0; // Reset regex
  
  if (match) {
    console.log(`  ✓ Matched!`);
    console.log(`    Path: ${match[1]}`);
    console.log(`    Current alt: "${match[2]}"`);
  } else {
    console.log(`  ✗ No match`);
  }
  console.log();
});

// Replacement test
console.log('\n=== REPLACEMENT TEST ===\n');
testLines.forEach((line, i) => {
  console.log(`Original: ${line}`);
  
  const newAlt = "New AI-generated text";
  let updatedLine;
  
  if (line.match(/\balt:\s*["'][^"']*["']/)) {
    // Alt exists, replace it
    updatedLine = line.replace(
      /\balt:\s*["'][^"']*["']/,
      `alt: "${newAlt}"`
    );
  } else {
    // Alt doesn't exist, add it before the closing }
    updatedLine = line.replace(/\s*}/, `, alt: "${newAlt}"}`);
  }
  
  console.log(`Updated:  ${updatedLine}`);
  
  // Verify no duplication
  const altCount = (updatedLine.match(/\balt:/g) || []).length;
  if (altCount > 1) {
    console.log(`  ⚠️  ERROR: Multiple 'alt:' found! (${altCount})`);
  } else {
    console.log(`  ✓ OK: Single 'alt:' attribute`);
  }
  console.log();
});
