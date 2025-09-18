import { slugFromPath } from '$lib/slugFromPath';
import { error } from '@sveltejs/kit';
import { getAllContent, getContentByUrl } from '$lib/data/content';
import type { EntryGenerator } from './$types';

export const load = async ({ params, url }) => {
	const post = await getContentByUrl(url.pathname);

	if (!post) {
		error(404); // Couldn't resolve the post
	}

	return post;
};

export const entries: EntryGenerator = async () => {
	// Include ALL logs (including hidden) for prerendering
	const allContent = await getAllContent();
	return allContent.filter((content) => content.type === 'logs').map((log) => ({ slug: log.slug }));
};

export const prerender = true;
