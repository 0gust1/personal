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

<article class=" mx-auto">
  <ArticleDescription description={data.frontmatter.description} tags={data.frontmatter.tags} />
  <ArticleTitle title={data.frontmatter.title} />
  <ArticleMeta date={data.frontmatter.date} />
  <div class="prose prose-stone dark:prose-invert">
    <svelte:component this={component} />
  </div>
</article>
