import { defineMDSveXConfig as defineConfig } from 'mdsvex';

import remarkGemoji from 'remark-gemoji';
import relativeImages from 'mdsvex-relative-images';
import remarkHeadings from '@vcarl/remark-headings';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import autolinkHeadings from 'rehype-autolink-headings';
import slugPlugin from 'rehype-slug';
import rehypeAccessibleEmojis from 'rehype-accessible-emojis';

const config = defineConfig({
  extensions: ['.svelte.md', '.md', '.svx'],

  smartypants: {
    dashes: 'oldschool'
  },

  remarkPlugins: [relativeImages, remarkGfm, headings, remarkGemoji, remarkToc],
  rehypePlugins: [
    rehypeAccessibleEmojis,
    slugPlugin,
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
