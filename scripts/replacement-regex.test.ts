import { describe, it, expect } from 'vitest';

// Test the replacement regex patterns

describe('Replacement Regex - PictureGrid', () => {
	it('should replace empty alt', () => {
		const input = `  { src: imageModules['./files/IMG_4584.jpg'], alt: ""}`;
		const pattern = /\balt:\s*(["'])((?:(?!\1).)*?)\1/;
		const replacement = `alt: "New alt text"`;
		const expected = `  { src: imageModules['./files/IMG_4584.jpg'], alt: "New alt text"}`;
		
		const result = input.replace(pattern, replacement);
		expect(result).toBe(expected);
	});

	it('should replace existing alt', () => {
		const input = `  { src: imageModules['./files/IMG_4584.jpg'], alt: "Old text"}`;
		const pattern = /\balt:\s*(["'])((?:(?!\1).)*?)\1/;
		const replacement = `alt: "New alt text"`;
		const expected = `  { src: imageModules['./files/IMG_4584.jpg'], alt: "New alt text"}`;
		
		const result = input.replace(pattern, replacement);
		expect(result).toBe(expected);
	});

	it('should handle French apostrophe in alt text', () => {
		const input = `  { src: imageModules['./files/IMG.jpg'], alt: "L'automne est beau"}`;
		const pattern = /\balt:\s*(["'])((?:(?!\1).)*?)\1/;
		const replacement = `alt: "New alt text"`;
		const expected = `  { src: imageModules['./files/IMG.jpg'], alt: "New alt text"}`;
		
		const result = input.replace(pattern, replacement);
		expect(result).toBe(expected);
	});

	it('should replace alt with colSpan and rowSpan', () => {
		const input = `  { src: imageModules['./files/IMG.jpg'], colSpan:4, rowSpan:2, alt: "Old"}`;
		const pattern = /\balt:\s*(["'])((?:(?!\1).)*?)\1/;
		const replacement = `alt: "New alt text"`;
		const expected = `  { src: imageModules['./files/IMG.jpg'], colSpan:4, rowSpan:2, alt: "New alt text"}`;
		
		const result = input.replace(pattern, replacement);
		expect(result).toBe(expected);
	});
});

describe('Replacement Regex - HTML', () => {
	it('should replace empty alt in HTML img', () => {
		const input = `<img src="test.jpg" alt="">`;
		const pattern = /\balt=(["'])((?:(?!\1).)*?)\1/;
		const replacement = `alt="New alt text"`;
		const expected = `<img src="test.jpg" alt="New alt text">`;
		
		const result = input.replace(pattern, replacement);
		expect(result).toBe(expected);
	});

	it('should handle French apostrophe in HTML alt', () => {
		const input = `<img src="test.jpg" alt="L'automne">`;
		const pattern = /\balt=(["'])((?:(?!\1).)*?)\1/;
		const replacement = `alt="New alt text"`;
		const expected = `<img src="test.jpg" alt="New alt text">`;
		
		const result = input.replace(pattern, replacement);
		expect(result).toBe(expected);
	});
});
