export const slugFromPath = (path: string) =>
	path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;

export const urlFromPath = (path: string) => {
	const section = path.match(/\/src\/(\w+)\//i)?.[1] ?? null;
	const slug = slugFromPath(path);
	const url = `/${section}/${slug}`;
	return url;
};
