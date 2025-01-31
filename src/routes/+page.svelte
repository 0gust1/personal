<script lang="ts">
	import { dev } from '$app/environment';
	import type { PageData } from './$types';
	import Debug from '$lib/components/Debug.svelte';
	import Cartridge from './cartridge.svelte';
	import PageHead from '$lib/components/PageHead.svelte';
	import ArticleMeta from '$lib/components/ArticleMeta.svelte';
	import ArticleDescription from '$lib/components/ArticleDescription.svelte';

	interface Props {
		data: PageData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	const getTagSize = (count: number) => {
		if (count < 3) return 'sm';
		if (count < 5) return 'md';
		return 'lg';
	};

	const locale = 'fr';
</script>

<PageHead title="Home" description="0gust1's notes and ramblings" />

<Cartridge />
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
	<div>
		<h2>Logs</h2>
		<div class="posts-list">
			{#each data.logs as { slug, title, description, date, tags, updated_at }}
				{@const formattedDate = new Date(date).toLocaleDateString(locale)}
				{@const formattedUpdatedDate = updated_at
					? new Date(updated_at).toLocaleDateString(locale)
					: null}
				<article>
					<div class="order-2 grow">
						<h3>
							<a href="/logs/{slug}">{title}</a>
						</h3>
						<ArticleDescription {description} {slug} {tags} />
					</div>
					<div class="order-1">
						<span>
							<time class="date" datetime={date}>{formattedDate ?? ''}</time>
						</span>
						<!-- {#if updated_at}
          <span class="ml-2 text-xs">
            (updated:
            <time class="date">{new Date(updated_at).toLocaleDateString(locale)}</time>
            )
          </span>
        {/if} -->
					</div>
				</article>
			{/each}
		</div>
	</div>
	<div>
		<h2>Posts</h2>
		<div class="posts-list">
			{#each data.posts as { slug, title, description, date, tags }}
				{@const formattedDate = new Date(date).toLocaleDateString(locale)}
				<article class="">
					<div class="order-2">
						<h3 class="">
							<a href="/posts/{slug}">{title}</a>
						</h3>
						<ArticleDescription {description} {slug} {tags} />
					</div>
					<div class="order-1">
						<span>
							<time class="date" datetime={date}>{formattedDate ?? ''}</time>
						</span>
					</div>
				</article>
			{/each}
		</div>
	</div>
	<div class="col-span-1 md:col-span-2 xl:col-span-1">
		<h2 class="topics">Topics</h2>
		<div>
			<ul class="topics-list">
				{#each data.tagsInfo.tags as tagAcc}
					<li
						class=" text-eigengrau-500/70 dark:text-cosmiclatte-100/50 tag-{getTagSize(
							tagAcc.count
						)}"
					>
						<span class="">
							{tagAcc.tag}
							{#if tagAcc.count > 1}
								<span class="tag-count">
									({tagAcc.count})
								</span>
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
{#if dev}
	<Debug {data} />
{/if}
{@render children?.()}

<style lang="postcss">
	h2 {
		@apply text-xl font-medium font-didone mt-3 mb-2;
	}
	h2.topics {
		@apply text-base leading-7 font-medium font-didone mt-3 mb-2;
	}

	.posts-list {
		@apply pl-2;
	}

	.date {
		@apply text-stone-400 text-[0.55rem] font-mono font-thin tracking-wider;
	}

	article {
		@apply mb-2;
		@apply grid grid-cols-[auto,1fr] gap-4 items-baseline;
		h3 {
			@apply text-sm leading-5 mb-1 font-semibold;
		}
	}
	.topics-list {
		@apply flex flex-wrap gap-2 items-baseline;
		@apply text-xs leading-4;
	}
	.tag-sm {
		@apply text-[0.65rem];
	}
	.tag-md {
		@apply text-xs;
		.tag-count {
			@apply text-[0.75em];
		}
	}
	.tag-lg {
		@apply text-sm;
		.tag-count {
			@apply text-[0.75em];
		}
	}
</style>
