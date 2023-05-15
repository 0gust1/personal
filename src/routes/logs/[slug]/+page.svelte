<script lang="ts">
  import type { SvelteComponentTyped } from 'svelte/internal';
  import PageHead from '$lib/components/PageHead.svelte';
  import ArticleTitle from '$lib/components/ArticleTitle.svelte';
  import ArticleMeta from '$lib/components/ArticleMeta.svelte';
  export let data;
  type C = $$Generic<typeof SvelteComponentTyped<any, any, any>>;
  $: component = data.component as unknown as C;
</script>

<PageHead
  title={data.frontmatter.title}
  description={data.frontmatter.description}
  lang={data.frontmatter.lang ?? 'en'}
/>
<article class="prose prose-stone dark:prose-invert mx-auto" lang={data.frontmatter.lang ?? 'en'}>
  <ArticleTitle title={data.frontmatter.title} />
  <ArticleMeta date={data.frontmatter.date} />

  <svelte:component this={component} />
</article>
