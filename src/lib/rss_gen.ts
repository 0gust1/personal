import { siteTitle, siteDescription, websiteURL } from '$lib/config';

// generates an RSS feed for a collection of content, a feed URL and a feed description
export const getRSS = (
	contentCollection: App.BlogPost[],
	feedURL: string,
	feedDescription: string
) => {
	const xml = `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
      <channel>
        <title>${siteTitle}</title>
        <link>${websiteURL}</link>
        <description>${feedDescription ?? siteDescription}</description>
        <atom:link href="${websiteURL}${feedURL}" rel="self" type="application/rss+xml" />
        ${contentCollection
					.map(
						(post) =>
							`
              <item>
                <guid>${websiteURL}${post.contentURL}</guid>
                <title>${post.title}</title>
                ${post.description ? `<description>${post.description}</description>` : ''}
                <link>${websiteURL}${post.contentURL}</link>
                <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            </item>
          `
					)
					.join('')}
      </channel>
    </rss>`;
	return xml;
};
