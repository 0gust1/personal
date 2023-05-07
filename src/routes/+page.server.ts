import { getLogs, getPosts, getAllTags } from '$lib/server/posts';

const MAX_POSTS = 10;

export const load = async ({ url }) => {
  return { posts: await getPosts(), logs: await getLogs(), tags: await getAllTags() };
};
