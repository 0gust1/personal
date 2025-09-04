/**
 * warning: This file is still a bit of a mess
 */
import { dev } from '$app/environment';
import { base } from '$app/paths';
import { slugFromPath, urlFromPath } from '$lib/slugFromPath';

let allContentMetadata: App.BlogPost[] = [];
let allContentComponentResolvers: Record<string, App.MdsvexResolver> = {};

const postTypeFromPath = (path: string) => {
	const type = path.match(/\/src\/content\/(\w+)\//i)?.[1] ?? null;
	return type;
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

const getAllContentFromSource = async () => {
	return import.meta.glob([
		'/src/content/posts/**/*.{md,svx,svelte.md}',
		'/src/content/logs/**/*.{md,svx,svelte.md}'
	]) as unknown as Promise<Record<string, App.MdsvexResolver>>;
};

/**
 * Here, we associate the JS modules imported above with the route slug
 * @param modules
 * @returns
 */
const contentMetadataFromModules = (modules: Record<string, () => Promise<unknown>>) => {
	return Object.entries(modules).map(([path, resolver]) =>
		resolver().then(
			(post) =>
				({
					type: postTypeFromPath(path),
					slug: slugFromPath(path),
					originalContentPath: path,
					contentURL: `${base}${urlFromPath(path)}`,
					...(post as unknown as App.MdsvexFile).metadata
				}) as App.BlogPost
		)
	);
};

export const getPublishedContentMetadata = async (
	contentModulesPromises: Record<string, App.MdsvexResolver>
) => {
	const contentPromises = contentMetadataFromModules(await contentModulesPromises);
	const all_content = await Promise.all(contentPromises);
	const publishedContent = all_content.filter((content) => (dev ? true : content.published));
	publishedContent.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
	return publishedContent;
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

export const getAllContentMetadata = async () => {
	if (!allContentMetadata || allContentMetadata.length === 0) {
		await loadAllContent();
	}
	const tags = allContentMetadata.reduce(
		(acc, content) => {
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
		},
		[] as { tag: string; count: number }[]
	).sort((a, b) => (a.count < b.count ? 1 : -1));

	return { tags, meta: { total: allContentMetadata.length } };
};

///-----

const loadAllContent = async () => {
	allContentComponentResolvers = await getAllContentFromSource();
	allContentMetadata = await getPublishedContentMetadata(allContentComponentResolvers);
};

export const getAllContentOfType = async (type: 'posts' | 'logs') => {
	if (!allContentMetadata || allContentMetadata.length === 0) {
		await loadAllContent();
	}
	return allContentMetadata.filter((content) => content.type === type);
};

export const getAllContent = async () => {
	if (!allContentMetadata || allContentMetadata.length === 0) {
		await loadAllContent();
	}
	//console.log(allContentComponentResolvers);
	return allContentMetadata;
};

export const getContentByTopic = async (topic: string) => {
	if (!allContentMetadata || allContentMetadata.length === 0) {
		await loadAllContent();
	}
	return allContentMetadata.filter((content) => content.tags?.includes(topic));
}

export const getContentByUrl = async (url: string) => {
	if (!allContentComponentResolvers || Object.keys(allContentComponentResolvers).length === 0) {
		await loadAllContent();
	}

	let match: { path?: string; resolver?: App.MdsvexResolver } = {};
	for (const [path, resolver] of Object.entries(allContentComponentResolvers)) {
		if (urlFromPath(path) === url) {
			match = { path, resolver: resolver as unknown as App.MdsvexResolver };
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
