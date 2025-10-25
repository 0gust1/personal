<script lang="ts">
	import ArticleDescription from '$lib/components/ArticleDescription.svelte';
	interface Props {
		items: Array<App.BlogPost>;
		type: 'logs' | 'posts';
		locale: string;
	}

	let { items, type, locale }: Props = $props();

	const getFormattedDate = (date: string) => new Date(date).toLocaleDateString(locale);
</script>

<div class="posts-list">
	{#each items as { slug, title, description, date, tags, updated_at }}
		{@const formattedDate = getFormattedDate(date)}
		{@const formattedUpdatedDate = updated_at ? getFormattedDate(updated_at) : null}
		<article>
			<div class="order-2 grow">
				<h3>
					<a href="/{type}/{slug}">{title}</a>
				</h3>
				<ArticleDescription {description} {slug} {tags} />
			</div>
			<div class="order-1 flex flex-col">
				<span>
					<time class="date" datetime={date}>{formattedDate ?? ''}</time>
				</span>
				<!-- {#if type === 'logs' && updated_at}
					<span class="ml-2 text-xs">
						<time class="date">*{formattedUpdatedDate}</time>
					</span>
				{/if} -->
			</div>
		</article>
	{:else}
		<p class="text-sm">No content found</p>
	{/each}
</div>

<style lang="postcss">
	.posts-list {
		@apply pl-2;
	}

	.date {
		@apply text-stone-400 text-[0.60rem] font-mono font-thin tracking-wider;
	}

	article {
		@apply mb-2;
		@apply grid grid-cols-[auto,1fr] gap-3 items-baseline;
		h3 {
			@apply text-sm leading-5 mb-1 font-semibold;
		}
	}
</style>
