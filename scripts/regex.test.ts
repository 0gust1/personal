import { describe, it, expect } from 'vitest';

// Test the PictureGrid regex patterns

describe('PictureGrid Regex Detection', () => {
	const pictureGridRegex = /\{\s*src:\s*imageModules\['([^']+)'\][^}]*\balt:\s*["']([^"']*)["']/g;

	it('should match standard format with alt at the end', () => {
		const line = `  { src: imageModules['./files/IMG_4584.jpg'], alt: ""}`;
		pictureGridRegex.lastIndex = 0;
		const match = pictureGridRegex.exec(line);
		
		expect(match).not.toBeNull();
		expect(match![1]).toBe('./files/IMG_4584.jpg');
		expect(match![2]).toBe('');
	});

	it('should match with properties before alt', () => {
		const line = `  { src: imageModules['./files/IMG_4597.jpg'], colSpan:4, rowSpan:2, alt: ""}`;
		pictureGridRegex.lastIndex = 0;
		const match = pictureGridRegex.exec(line);
		
		expect(match).not.toBeNull();
		expect(match![1]).toBe('./files/IMG_4597.jpg');
		expect(match![2]).toBe('');
	});

	it('should match with existing alt text', () => {
		const line = `  { src: imageModules['./files/IMG_4606.jpg'], alt: "Existing alt text"}`;
		pictureGridRegex.lastIndex = 0;
		const match = pictureGridRegex.exec(line);
		
		expect(match).not.toBeNull();
		expect(match![1]).toBe('./files/IMG_4606.jpg');
		expect(match![2]).toBe('Existing alt text');
	});

	it('should match with properties and existing alt', () => {
		const line = `  { src: imageModules['./files/IMG_4607.jpg'], colSpan:3, alt: "Champ verdoyant"}`;
		pictureGridRegex.lastIndex = 0;
		const match = pictureGridRegex.exec(line);
		
		expect(match).not.toBeNull();
		expect(match![1]).toBe('./files/IMG_4607.jpg');
		expect(match![2]).toBe('Champ verdoyant');
	});
});

describe('PictureGrid Regex Replacement', () => {
	const newAlt = "New AI-generated text";

	it('should replace existing alt text', () => {
		const line = `  { src: imageModules['./files/IMG_4584.jpg'], alt: ""}`;
		const updatedLine = line.replace(/\balt:\s*["'][^"']*["']/, `alt: "${newAlt}"`);
		
		expect(updatedLine).toBe(`  { src: imageModules['./files/IMG_4584.jpg'], alt: "${newAlt}"}`);
	});

	it('should replace alt text without duplicating', () => {
		const line = `  { src: imageModules['./files/IMG_4597.jpg'], colSpan:4, rowSpan:2, alt: ""}`;
		const updatedLine = line.replace(/\balt:\s*["'][^"']*["']/, `alt: "${newAlt}"`);
		
		expect(updatedLine).toBe(`  { src: imageModules['./files/IMG_4597.jpg'], colSpan:4, rowSpan:2, alt: "${newAlt}"}`);
		
		// Verify no duplication
		const altCount = (updatedLine.match(/\balt:/g) || []).length;
		expect(altCount).toBe(1);
	});

	it('should add alt if it does not exist', () => {
		const line = `  { src: imageModules['./files/IMG_4584.jpg']}`;
		const updatedLine = line.replace(/\s*}/, `, alt: "${newAlt}"}`);
		
		expect(updatedLine).toBe(`  { src: imageModules['./files/IMG_4584.jpg'], alt: "${newAlt}"}`);
		
		// Verify single alt attribute
		const altCount = (updatedLine.match(/\balt:/g) || []).length;
		expect(altCount).toBe(1);
	});
});
