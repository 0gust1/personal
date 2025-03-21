import { error } from '@sveltejs/kit';
import { getAllContentOfType, getContentByUrl, getContentByTopic } from '$lib/data/content';

export const load = async ({ params, url }) => {
	// get the slug from the url
	const slug = params.slug as string;

	const contentList = await getContentByTopic(slug);

	if (!contentList) {
		error(404); // Couldn't resolve the post
	}

	return {
		logs: contentList.filter((content) => {
			return content.type === 'logs';
		}),
		posts: contentList.filter((content) => {
			return content.type === 'posts';
		}),
		tag: slug
	};
};
