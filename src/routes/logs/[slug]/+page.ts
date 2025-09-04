import { slugFromPath } from '$lib/slugFromPath';
import { error } from '@sveltejs/kit';
import { getAllContentOfType, getContentByUrl } from '$lib/data/content';

export const load = async ({ params, url }) => {
	// const modules = import.meta.glob(`/src/logs/**/*.{md,svx,svelte.md}`);

	// let match: { path?: string; resolver?: App.MdsvexResolver } = {};
	// for (const [path, resolver] of Object.entries(modules)) {
	// 	if (slugFromPath(path) === params.slug) {
	// 		match = { path, resolver: resolver as unknown as App.MdsvexResolver };
	// 		break;
	// 	}
	// }

	// const post = await match?.resolver?.();

	const post = await getContentByUrl(url.pathname);

	if (!post) {
		error(404); // Couldn't resolve the post
	}

	// return {
	// 	component: post.default,
	// 	frontmatter: post.metadata
	// };
	return post;
};
