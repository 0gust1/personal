import { getAllContentMetadata, getAllContentOfType } from '$lib/data/content';

const MAX_POSTS = 10;

export const load = async ({ url }) => {
	return {
		posts: await getAllContentOfType('posts'),
		logs: await getAllContentOfType('logs'),
		tagsInfo: await getAllContentMetadata()
	};
};
