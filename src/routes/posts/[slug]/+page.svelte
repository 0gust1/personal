<script lang="ts">
  import type { SvelteComponentTyped } from 'svelte/internal';
  import PageHead from '$lib/components/PageHead.svelte';
  import ArticleTitle from '$lib/components/ArticleTitle.svelte';
  import ArticleMeta from '$lib/components/ArticleMeta.svelte';
  import ArticleDescription from '$lib/components/ArticleDescription.svelte';
  export let data;
  type C = $$Generic<typeof SvelteComponentTyped<any, any, any>>;
  $: component = data.component as unknown as C;
</script>

<PageHead
  title={data.frontmatter.title}
  description={data.frontmatter.description}
  tags={data.frontmatter.tags}
/>

<article class="prose prose-stone dark:prose-invert mx-auto" lang={data.frontmatter.lang ?? 'en'}>
  <ArticleMeta date={data.frontmatter.date} updated_at={data.frontmatter.updated_at ?? null} />
  <ArticleTitle title={data.frontmatter.title} />
  <ArticleDescription description={data.frontmatter.description} tags={data.frontmatter.tags} />

  <svelte:component this={component} />
</article>
