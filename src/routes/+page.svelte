<script lang="ts">
  import type { PageData } from './$types';
  import Debug from '$lib/components/Debug.svelte';
  import Cartridge from './cartridge.svelte';
  import PageHead from '$lib/components/PageHead.svelte';
  import ArticleTitle from '$lib/components/ArticleTitle.svelte';
  import ArticleMeta from '$lib/components/ArticleMeta.svelte';
  import ArticleDescription from '$lib/components/ArticleDescription.svelte';

  export let data: PageData;
</script>

<PageHead title="Home" description="0gust1's notes and ramblings" />

<Cartridge />

<h2>Logs</h2>
<div class="posts-list">
  {#each data.logs as { slug, title, description, date, tags }}
    <article>
      <div class="order-2">
        <a href="/logs/{slug}">{title}</a>
        <ArticleDescription {description} {slug} {tags} />
      </div>
      <div class="order-1 w-20">
        <ArticleMeta {date} />
      </div>
    </article>
  {/each}
</div>
<h2>Posts</h2>
<div class="posts-list">
  {#each data.posts as { slug, title, description, date, tags }}
    <article class="flex">
      <div class=" order-2">
        <ArticleTitle {slug} {title} />
        <ArticleDescription {description} {slug} {tags} />
      </div>
      <div class="order-1 w-20">
        <ArticleMeta {date} />
      </div>
    </article>
  {/each}
</div>
<h2>Topics</h2>
<div>
  <ul class="topics-list">
    {#each data.tagsInfo.tags as tagAcc}
      <li>
        <span>{tagAcc.tag}({tagAcc.count})</span>
      </li>
    {/each}
  </ul>
</div>

<!-- <Debug {data} /> -->

<slot />

<style lang="postcss">
  h2 {
    @apply text-xl font-medium font-didone mt-3 mb-1;
  }

  .posts-list {
    @apply pl-2;
  }

  article {
    @apply mb-1.5;
    @apply flex gap-4;
  }
  .topics-list {
    @apply flex flex-wrap gap-2;
    @apply text-sm;
  }
</style>
