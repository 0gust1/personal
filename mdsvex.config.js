import { defineMDSveXConfig as defineConfig } from 'mdsvex';

/** REMARK plugins - (work on markdown AST) */
//import plugin from 'remark-github-beta-blockquote-admonitions'
//import { remarkAlert } from 'remark-github-blockquote-alert'
//import remarkCallouts from '@portaljs/remark-callouts'

// transform and process the images to <picture> with srcset
import { enhancedImages } from 'mdsvex-enhanced-images';
// A remark plugin to add metadata about headings to the parsed output.
import remarkHeadings from '@vcarl/remark-headings';
// github flavored markdown
import remarkGfm from 'remark-gfm';
// generates a TOC
import remarkToc from 'remark-toc';

/** REHYPE plugins - (work on outputed HTML) */
//remove the wrapping paragraph (<p>) for images (<img>)
import rehypeUnwrapImages from 'rehype-unwrap-images';
//  transform an image with alt text to a figure with caption
import rehypeGithubAlert from 'rehype-github-alert';
// plugin to add ids to headings
import slugPlugin from 'rehype-slug';
// generates a link for each heading who has an id
import autolinkHeadings from 'rehype-autolink-headings';
import rehypeAccessibleEmojis from 'rehype-accessible-emojis';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool'
	},

	remarkPlugins: [enhancedImages, remarkGfm, headings, [remarkToc, { tight: true }]],
	rehypePlugins: [
		rehypeAccessibleEmojis,
		rehypeUnwrapImages,
		slugPlugin,
		rehypeGithubAlert,
		[
			autolinkHeadings,
			{
				behavior: 'wrap'
			}
		]
	]
});

/**
 * Parses headings and includes the result in metadata
 */
function headings() {
	return function transformer(tree, vfile) {
		// run remark-headings plugin
		remarkHeadings()(tree, vfile);

		// include the headings data in mdsvex frontmatter
		vfile.data.fm ??= {};
		vfile.data.fm.headings = vfile.data.headings.map((heading) => ({
			...heading,
			// slugify heading.value
			id: heading.value
				.toLowerCase()
				.replace(/\s/g, '-')
				.replace(/[^a-z0-9-]/g, '')
		}));
	};
}

export default config;
