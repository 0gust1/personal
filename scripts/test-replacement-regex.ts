#!/usr/bin/env node --experimental-strip-types

// Test the replacement regex patterns

const testCases = [
  // PictureGrid tests
  {
    name: "PictureGrid with empty alt",
    input: `  { src: imageModules['./files/IMG_4584.jpg'], alt: ""}`,
    pattern: /\balt:\s*(["'])((?:(?!\1).)*?)\1/,
    replacement: `alt: "New alt text"`,
    expected: `  { src: imageModules['./files/IMG_4584.jpg'], alt: "New alt text"}`
  },
  {
    name: "PictureGrid with existing alt",
    input: `  { src: imageModules['./files/IMG_4584.jpg'], alt: "Old text"}`,
    pattern: /\balt:\s*(["'])((?:(?!\1).)*?)\1/,
    replacement: `alt: "New alt text"`,
    expected: `  { src: imageModules['./files/IMG_4584.jpg'], alt: "New alt text"}`
  },
  {
    name: "PictureGrid with French apostrophe",
    input: `  { src: imageModules['./files/IMG.jpg'], alt: "L'automne est beau"}`,
    pattern: /\balt:\s*(["'])((?:(?!\1).)*?)\1/,
    replacement: `alt: "New alt text"`,
    expected: `  { src: imageModules['./files/IMG.jpg'], alt: "New alt text"}`
  },
  {
    name: "PictureGrid with colSpan",
    input: `  { src: imageModules['./files/IMG.jpg'], colSpan:4, rowSpan:2, alt: "Old"}`,
    pattern: /\balt:\s*(["'])((?:(?!\1).)*?)\1/,
    replacement: `alt: "New alt text"`,
    expected: `  { src: imageModules['./files/IMG.jpg'], colSpan:4, rowSpan:2, alt: "New alt text"}`
  },
  // HTML tests
  {
    name: "HTML img with empty alt",
    input: `<img src="test.jpg" alt="">`,
    pattern: /\balt=(["'])((?:(?!\1).)*?)\1/,
    replacement: `alt="New alt text"`,
    expected: `<img src="test.jpg" alt="New alt text">`
  },
  {
    name: "HTML img with French apostrophe",
    input: `<img src="test.jpg" alt="L'automne">`,
    pattern: /\balt=(["'])((?:(?!\1).)*?)\1/,
    replacement: `alt="New alt text"`,
    expected: `<img src="test.jpg" alt="New alt text">`
  },
];

console.log("Testing replacement regex patterns\n");

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = test.input.replace(test.pattern, test.replacement);
  const success = result === test.expected;
  
  if (success) {
    console.log(`✅ ${test.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`  Input:    "${test.input}"`);
    console.log(`  Expected: "${test.expected}"`);
    console.log(`  Got:      "${result}"`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
