// This is an endpoint that generates a basic rss feed for your posts.
// It is OK to delete this file if you don't want an RSS feed.
// credit: https://scottspence.com/posts/make-an-rss-feed-with-sveltekit#add-posts-for-the-rss-feed

import { getAllContent } from '$lib/data/content';
import { getRSS } from '$lib/rss_gen';
import { siteDescription } from '$lib/config';

export const prerender = true;
const allContentCollection = await getAllContent();

// update this to something more appropriate for your website
const websiteDescription = `${siteDescription}`;

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ setHeaders }) {
  setHeaders({
    'Cache-Control': `max-age=0, s-max-age=600`,
    'Content-Type': 'application/xml'
  });

  const xml = getRSS(allContentCollection, '/rss.xml', `${websiteDescription} - all content`);
  return new Response(xml);
}
