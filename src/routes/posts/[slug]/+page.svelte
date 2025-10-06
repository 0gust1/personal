<script lang="ts">
	//import type { SvelteComponentTyped } from 'svelte/internal';
	import PageHead from '$lib/components/PageHead.svelte';
	import ArticleTitle from '$lib/components/ArticleTitle.svelte';
	import ArticleMeta from '$lib/components/ArticleMeta.svelte';
	import ArticleDescription from '$lib/components/ArticleDescription.svelte';
	let { data } = $props();
	type C = $$Generic<typeof SvelteComponentTyped<any, any, any>>;
	let component = $derived(data.component as unknown as C);

	const SvelteComponent = $derived(component);
</script>

<PageHead
	title={data.frontmatter.title}
	description={data.frontmatter.description}
	tags={data.frontmatter.tags}
/>

<article class="mx-auto relative max-w-prose" lang={data.frontmatter.lang ?? 'en'}>
	<ArticleTitle title={data.frontmatter.title} />
	{#if data.frontmatter.description}
		<div class="text-lg mb-2 italic text-eigengrau-900/50 dark:text-cosmiclatte-50/50">
			{data.frontmatter.description}
		</div>
	{/if}
	<div class="meta">
		<div class="date-info">
			<ArticleMeta date={data.frontmatter.date} updated_at={data.frontmatter.updated_at ?? null} />
		</div>
		{#if data.frontmatter.tags && data.frontmatter.tags.length}
			<ul class="article-tags">
				{#each data.frontmatter.tags as tag}
					<li class="">
						<a href="/topics/{encodeURIComponent(tag)}" class="tag">{tag}</a>
					</li>
				{/each}
			</ul>
		{/if}
		<!-- {#if data.frontmatter.headings && data.frontmatter.headings.length > 5}
			<div class="article-headings text-left sticky mt-3 bg-slate-500/50 py-2">
				<ul class="font-normal text-xs">
					{#each data.frontmatter.headings as heading}
						<li class="heading heading-{heading.depth}">
							<span class=""
								><a href="#{heading.id}">{heading.value}</a></span
							>
						</li>
					{/each}
				</ul>
			</div>
		{/if} -->
	</div>
	<hr class="mb-8" />
	<!-- <div>{JSON.stringify(data, null, 2)} -- aa</div> -->
	<div class="content prose prose-stone dark:prose-invert">
		<SvelteComponent />
	</div>
</article>

<style lang="postcss">
	.meta {
		/* @apply mt-16; */
		@apply flex items-baseline;
		@apply lg:absolute lg:w-[15ch] lg:-ml-[18ch] lg:text-right xl:w-[25ch] xl:-ml-[28ch];
		@apply lg:flex-col;
		@apply text-stone-400 font-mono text-xs font-light;
		.heading {
			@apply text-xs;
		}
		.heading-2{
			@apply pl-2;
		}
		.heading-3{
			@apply pl-4;
		}
		.heading-4{
			@apply pl-5;
		}
	}
	.date-info {
		@apply order-last flex-1 flex justify-end gap-1 items-baseline;
		@apply lg:mb-2 lg:order-first lg:flex-col lg:gap-0 lg:w-full lg:items-end;
	}
	.article-tags {
		@apply font-sans;
		& li {
			@apply inline-block ml-1;
			@apply text-xs text-gray-700 dark:text-gray-400 text-opacity-60;
		}
		& li .tag::after {
			content: ',';
		}
		& li:last-of-type .tag::after {
			@apply content-none;
		}
	}
	.article-subtitle {
	}
</style>
