/**
 * warning: This file is still a bit of a mess
 */
import { dev } from '$app/environment';
import { base } from '$app/paths';
import { slugFromPath, urlFromPath } from '$lib/slugFromPath';

let allContentMetadata: App.BlogPost[] = [];
let allContentComponentResolvers: Record<string, App.MdsvexResolver> = {};

const postTypeFromPath = (path: string): App.ContentType | null => {
	const type = path.match(/\/src\/content\/(\w+)\//i)?.[1];
	if (type === 'posts' || type === 'logs') {
		return type;
	}
	return null;
};

/**
 * Here we are using import.meta.glob to get all the files in the posts and logs directory **at build time**.
 * The files are imported as JS modules (special markdown files handled by mdsvex).
 * so we get a of precompiled JS modules as output.
 */
// const getContentFromPosts = async () => {
//   return import.meta.glob(`/src/posts/**/*.{md,svx,svelte.md}`);
// };

// const getContentFromLogs = async () => {
//   return import.meta.glob(`/src/logs/**/*.{md,svx,svelte.md}`);
// };

export const getAllContentFromSource = async (): Promise<Record<string, App.MdsvexResolver>> => {
	return import.meta.glob([
		'/src/content/posts/**/*.{md,svx,svelte.md}',
		'/src/content/logs/**/*.{md,svx,svelte.md}'
	]) as unknown as Record<string, App.MdsvexResolver>;
};

/**
 * Here, we associate the JS modules imported above with the route slug
 * @param modules
 * @returns
 */
const contentMetadataFromModules = (modules: Record<string, App.MdsvexResolver>): Promise<App.BlogPost>[] => {
	return Object.entries(modules).map(([path, resolver]) =>
		resolver().then(
			(post): App.BlogPost => {
				const type = postTypeFromPath(path);
				const slug = slugFromPath(path);
				
				if (!type) {
					throw new Error(`Invalid content path: ${path}`);
				}
				if (!slug) {
					throw new Error(`Could not extract slug from path: ${path}`);
				}
				
				return {
					type,
					slug,
					originalContentPath: path,
					contentURL: `${base}${urlFromPath(path)}`,
					...post.metadata
				};
			}
		)
	);
};

export const getPublishedContentMetadata = async (
	contentModulesPromises: Record<string, App.MdsvexResolver>
): Promise<App.BlogPost[]> => {
	const contentPromises = contentMetadataFromModules(contentModulesPromises);
	const all_content = await Promise.all(contentPromises);
	const publishedContent = all_content.filter((content) => (dev ? true : content.published));
	publishedContent.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
	return publishedContent;
};

// function to get visible content (not hidden) - for navigation/RSS only
export const getVisibleContentMetadata = async (
	contentModulesPromises: Record<string, App.MdsvexResolver>
): Promise<App.BlogPost[]> => {
	const contentPromises = contentMetadataFromModules(contentModulesPromises);
	const all_content = await Promise.all(contentPromises);
	const publishedContent = all_content.filter((content) => (dev ? true : content.published));
	// Include hidden content in dev mode
	const visibleContent = publishedContent.filter((content) => dev || !content.hidden);
	visibleContent.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
	return visibleContent;
};

// export const getPosts = async () => {
//   return await getPublishedContent(getContentFromPosts());
// };

// export const getLogs = async () => {
//   return await getPublishedContent(getContentFromLogs());
// };

// export const getAllContent = async () => {
//   const publishedPosts = await getPosts();
//   const publishedLogs = await getLogs();
//   return { posts: publishedPosts, logs: publishedLogs };
// };

// export const getAllTags = async () => {
//   return await getAllContent().then((content) => {
//     // Get all tags from posts and logs
//     const allContent = [...content.posts, ...content.logs];
//     const tags = allContent.reduce((acc, content) => {
//       const contentTags = content.tags || [];
//       // check if one of the contenttTag is already in the accumulator
//       contentTags.forEach((contentTag) => {
//         if (acc.some((tagAcc) => tagAcc.tag === contentTag)) {
//           acc.find((tagAcc) => tagAcc.tag === contentTag).count++;
//         } else {
//           acc.push({ tag: contentTag, count: 1 });
//         }
//       });

//       return acc;
//     }, [] as { tag: string; count: number }[]);

//     return { tags, meta: { total: allContent.length } };
//   });
// };

interface TagCount {
	tag: string;
	count: number;
}

interface ContentMetadata {
	tags: TagCount[];
	meta: { total: number };
}

export const getAllContentMetadata = async (): Promise<ContentMetadata> => {
	if (!allContentMetadata || allContentMetadata.length === 0) {
		await loadAllContent();
	}
	const tags = allContentMetadata
		.reduce(
			(acc, content) => {
				const contentTags = content.tags || [];
				// check if one of the contenttTag is already in the accumulator
				contentTags.forEach((contentTag) => {
					const existingTag = acc.find((tagAcc) => tagAcc.tag === contentTag);
					if (existingTag) {
						existingTag.count++;
					} else {
						acc.push({ tag: contentTag, count: 1 });
					}
				});

				return acc;
			},
			[] as TagCount[]
		)
		.sort((a, b) => (a.count < b.count ? 1 : -1));

	return { tags, meta: { total: allContentMetadata.length } };
};

///-----
// we load ALL published content (including hidden) for page generation
const loadAllContent = async (): Promise<void> => {
	allContentComponentResolvers = await getAllContentFromSource();
	// Load ALL published content (including hidden) for page generation
	allContentMetadata = await getPublishedContentMetadata(allContentComponentResolvers);
};

// Get all content of a specific type (posts or logs), excluding hidden content
export const getAllContentOfType = async (type: App.ContentType): Promise<App.BlogPost[]> => {
	if (!allContentMetadata || allContentMetadata.length === 0) {
		await loadAllContent();
	}
	// Filter out hidden content for navigation, but show in dev mode
	return allContentMetadata.filter((content) => content.type === type && (dev || !content.hidden));
};

export const getAllContent = async (): Promise<App.BlogPost[]> => {
	if (!allContentMetadata || allContentMetadata.length === 0) {
		await loadAllContent();
	}
	//console.log(allContentComponentResolvers);
	return allContentMetadata;
};

// Get all content for a specific topic (tag), excluding hidden content
export const getContentByTopic = async (topic: string): Promise<App.BlogPost[]> => {
	if (!allContentMetadata || allContentMetadata.length === 0) {
		await loadAllContent();
	}
	// Filter out hidden content for topic pages, but show in dev mode
	return allContentMetadata.filter(
		(content) => content.tags?.includes(topic) && (dev || !content.hidden)
	);
};

interface ContentByUrlResult {
	component: import('svelte').SvelteComponent;
	frontmatter: App.BlogPostMetadata;
}

export const getContentByUrl = async (url: string): Promise<ContentByUrlResult | null> => {
	if (!allContentComponentResolvers || Object.keys(allContentComponentResolvers).length === 0) {
		await loadAllContent();
	}

	let match: { path?: string; resolver?: App.MdsvexResolver } = {};
	for (const [path, resolver] of Object.entries(allContentComponentResolvers)) {
		if (urlFromPath(path) === url) {
			match = { path, resolver };
			break;
		}
	}

	const post = await match?.resolver?.();

	if ((post && post.metadata.published) || (post && dev)) {
		return {
			component: post.default,
			frontmatter: post.metadata
		};
	} else {
		return null;
	}
};
