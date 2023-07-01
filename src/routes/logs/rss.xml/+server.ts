// This is an endpoint that generates a basic rss feed for your posts.
// It is OK to delete this file if you don't want an RSS feed.
// credit: https://scottspence.com/posts/make-an-rss-feed-with-sveltekit#add-posts-for-the-rss-feed

import { getAllContentOfType } from '$lib/data/content';
import { getRSS } from '$lib/rss_gen';
import { siteDescription } from '$lib/config';

export const prerender = true;
const logsContentCollection = await getAllContentOfType('logs');

export async function GET({ setHeaders }) {
  setHeaders({
    'Cache-Control': `max-age=0, s-max-age=600`,
    'Content-Type': 'application/xml'
  });

  const xml = getRSS(logsContentCollection, '/logs/rss.xml', `${siteDescription} - all logs`);

  return new Response(xml);
}
