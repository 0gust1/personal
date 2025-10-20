import { describe, it, expect } from 'vitest';

describe('PictureGrid Regex Detection', () => {
	const pictureGridRegex = /\{\s*src:\s*imageModules\['([^']+)'\][^}]*\balt:\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')/g;

	it('should match standard format', () => {
		const line = `  { src: imageModules['./files/IMG_4584.jpg'], alt: ""}`;
		pictureGridRegex.lastIndex = 0;
		const match = pictureGridRegex.exec(line);
		
		expect(match).not.toBeNull();
		expect(match![1]).toBe('./files/IMG_4584.jpg');
		expect(match![2]).toBe('');
	});

	it('should match alt text with escaped double quotes', () => {
		const line = `  { src: imageModules['./files/IMG_4608.jpg'], alt: "Text with \\"escaped\\" quotes"}`;
		pictureGridRegex.lastIndex = 0;
		const match = pictureGridRegex.exec(line);
		
		expect(match).not.toBeNull();
		expect(match![1]).toBe('./files/IMG_4608.jpg');
		expect(match![2]).toBe('Text with \\"escaped\\" quotes');
	});

	it('should match alt text with apostrophes in double quotes', () => {
		const line = `  { src: imageModules['./files/IMG_4611.jpg'], alt: "L'église d'Amiens"}`;
		pictureGridRegex.lastIndex = 0;
		const match = pictureGridRegex.exec(line);
		
		expect(match).not.toBeNull();
		expect(match![1]).toBe('./files/IMG_4611.jpg');
		expect(match![2]).toBe("L'église d'Amiens");
	});

	it('should match with single quotes for alt', () => {
		const line = `  { src: imageModules['./files/IMG_4612.jpg'], alt: 'Single quoted text'}`;
		pictureGridRegex.lastIndex = 0;
		const match = pictureGridRegex.exec(line);
		
		expect(match).not.toBeNull();
		expect(match![1]).toBe('./files/IMG_4612.jpg');
		expect(match![3]).toBe('Single quoted text');
	});
});

describe('PictureGrid Regex Replacement', () => {
	const altMatchRegex = /\balt:\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/;

it('should replace alt text with escaped quotes', () => {
const line = `  { src: imageModules['./files/IMG_4608.jpg'], alt: "Old text with \\"quotes\\""}`;
const newAlt = "New AI-generated text";
const updatedLine = line.replace(altMatchRegex, `alt: "${newAlt}"`);

expect(updatedLine).toBe(`  { src: imageModules['./files/IMG_4608.jpg'], alt: "${newAlt}"}`);

const altCount = (updatedLine.match(/\balt:/g) || []).length;
expect(altCount).toBe(1);
});

it('should replace single-quoted alt text', () => {
const line = `  { src: imageModules['./files/IMG_4613.jpg'], alt: 'Old single quoted'}`;
const newAlt = "New AI-generated text";
const updatedLine = line.replace(altMatchRegex, `alt: "${newAlt}"`);

expect(updatedLine).toBe(`  { src: imageModules['./files/IMG_4613.jpg'], alt: "${newAlt}"}`);
});
});
