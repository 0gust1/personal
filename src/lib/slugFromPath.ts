export const slugFromPath = (path: string) =>
	path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;

export const urlFromPath = (path: string) => {
	const section = path.match(/\/src\/content\/(\w+)\//i)?.[1] ?? null;
	const slug = slugFromPath(path);
	const url = `/${section}/${slug}`;
	// console.log('--- urlFromPath ---');
	// console.log(`path: ${path}`);
	// console.log(`section: ${section}`);
	// console.log(`slug: ${slug}`);
	// console.log(`url: ${url}`);

	return url;
};
