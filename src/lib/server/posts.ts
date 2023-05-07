import { slugFromPath } from '$lib/slugFromPath';

/**
 * Here we are using import.meta.glob to get all the files in the posts and logs directory **at build time**.
 * The files are imported as JS modules (special markdown files handled by mdsvex).
 * so we get a of precompiled JS modules as output.
 */
const getContentFromPosts = async () => {
  return import.meta.glob(`/src/posts/**/*.{md,svx,svelte.md}`);
};

const getContentFromLogs = async () => {
  return import.meta.glob(`/src/logs/**/*.{md,svx,svelte.md}`);
};

/**
 * Here, we associate the JS modules imported above with the route slug
 * @param modules
 * @returns
 */
const promisesFromModules = (modules: Record<string, () => Promise<unknown>>) => {
  return Object.entries(modules).map(([path, resolver]) =>
    resolver().then(
      (post) =>
        ({
          slug: slugFromPath(path),
          ...(post as unknown as App.MdsvexFile).metadata
        } as App.BlogPost)
    )
  );
};

export const getPublishedContent = async (
  contentModulesPromises: Promise<Record<string, () => Promise<unknown>>>
) => {
  const contentPromises = promisesFromModules(await contentModulesPromises);
  const content = await Promise.all(contentPromises);
  const publishedContent = content.filter((post) => post.published);
  publishedContent.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
  return publishedContent;
};

export const getPosts = async () => {
  return await getPublishedContent(getContentFromPosts());
};

export const getLogs = async () => {
  return await getPublishedContent(getContentFromLogs());
};

export const getAllContent = async () => {
  const publishedPosts = await getPosts();
  const publishedLogs = await getLogs();
  return { posts: publishedPosts, logs: publishedLogs };
};

export const getAllTags = async () => {
  return await getAllContent().then((content) => {
    // Get all tags from posts and logs
    const allContent = [...content.posts, ...content.logs];
    const tags = allContent.reduce((acc, content) => {
      const contentTags = content.tags || [];
      // check if one of the contenttTag is already in the accumulator
      contentTags.forEach((contentTag) => {
        if (acc.some((tagAcc) => tagAcc.tag === contentTag)) {
          acc.find((tagAcc) => tagAcc.tag === contentTag).count++;
        } else {
          acc.push({ tag: contentTag, count: 1 });
        }
      });

      return acc;
    }, [] as { tag: string; count: number }[]);

    return { tags, meta: { total: allContent.length } };
  });
};
