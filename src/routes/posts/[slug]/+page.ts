import { error } from '@sveltejs/kit';
import { getContentByUrl } from '$lib/data/content';

export const load = async ({ params, url }) => {
	const post = await getContentByUrl(url.pathname);

	if (!post) {
		error(404); // Couldn't resolve the post
	}

	return post;
};
